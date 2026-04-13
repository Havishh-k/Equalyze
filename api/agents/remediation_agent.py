"""
Equalyze — Remediation Agent
Generates actionable fix strategies for each bias finding.
"""

import json
from typing import Any

from api.agents.base_agent import BaseEqualyzeAgent
from api.config import settings
from api.models.audit import RemediationStrategy, RemediationLevel, Finding


REMEDIATION_SYSTEM_PROMPT = """You are the Equalyze Remediation Agent — an ML fairness engineer.

Your job is to generate practical, ranked remediation strategies for AI bias findings.
Each strategy must include concrete implementation steps with code references.
Rank from highest to lowest impact-to-effort ratio.

Always respond with valid JSON only."""


REMEDIATION_PROMPT = """You are an ML fairness engineer. Given a bias finding, generate exactly 3 remediation strategies ranked from highest to lowest impact-to-effort ratio.

FINDING:
- Protected attribute: {protected_attribute}
- Finding type: {finding_type}
- Severity: {severity}
- Key metrics: {metrics_summary}

MODEL DOMAIN: {domain}
MODEL TYPE: {model_type}

For each strategy provide:
- strategy_name: Short title
- level: "data" | "feature" | "model" | "post-processing"
- description: 2-3 sentences on what to do and why it works
- implementation_steps: numbered list of 3-5 concrete steps
- code_reference: Python library and function reference (e.g., "fairlearn.reductions.ExponentiatedGradient")
- estimated_effort: "Low (< 4h)" | "Medium (1-3 days)" | "High (> 1 week)"
- estimated_bias_reduction: "X% - Y% reduction in [metric name]"
- risks: Any risks or trade-offs of this approach

Output JSON:
{{
  "strategies": [
    {{
      "strategy_name": "...",
      "level": "data",
      "description": "...",
      "implementation_steps": ["1. ...", "2. ...", "3. ..."],
      "code_reference": "...",
      "estimated_effort": "Low (< 4h)",
      "estimated_bias_reduction": "30-50% reduction in disparate impact",
      "risks": "..."
    }}
  ]
}}"""

SYNTHETIC_DATA_PROMPT = """You are an ML fairness engineer and data generation expert.
Given the schema and statistical distribution of a biased dataset, generate {num_rows} synthetic examples for the underrepresented group: {target_group}.

SCHEMA AND STATS:
{schema_stats}

Output valid JSON only with a single key "synthetic_rows" containing an array of objects matching the schema exactly.
"""

class RemediationAgent(BaseEqualyzeAgent):
    """
    Remediation Agent — converts bias findings into fix strategies.
    Uses Gemini Flash for fast, templated generation.
    """

    def __init__(self):
        super().__init__(
            model_name=settings.GEMINI_FLASH_MODEL,
            system_instruction=REMEDIATION_SYSTEM_PROMPT,
            temperature=0.15,
        )

    async def generate_strategies(
        self,
        finding: Finding,
        domain: str = "other",
        model_type: str = "classification",
    ) -> list[RemediationStrategy]:
        """Generate 3 ranked remediation strategies for a finding."""
        metrics_summary = []
        for m in finding.metrics:
            metrics_summary.append(f"{m.metric_name}: {m.value} ({m.severity})")

        prompt = REMEDIATION_PROMPT.format(
            protected_attribute=finding.protected_attribute,
            finding_type=finding.finding_type,
            severity=finding.severity,
            metrics_summary="; ".join(metrics_summary),
            domain=domain,
            model_type=model_type,
        )

        try:
            result = self.invoke_sync(prompt)
            strategies = []
            for i, s in enumerate(result.get("strategies", [])[:3]):
                strategies.append(RemediationStrategy(
                    rank=i + 1,
                    name=s.get("strategy_name", f"Strategy {i+1}"),
                    level=RemediationLevel(s.get("level", "data")),
                    description=s.get("description", ""),
                    implementation_steps=s.get("implementation_steps", []),
                    code_reference=s.get("code_reference", ""),
                    estimated_effort=s.get("estimated_effort", "Medium"),
                    estimated_bias_reduction=s.get("estimated_bias_reduction", ""),
                    risks=s.get("risks", ""),
                ))
            return strategies
        except Exception as e:
            print(f"Remediation error: {e}")
            return []

    async def generate_synthetic_dataset(
        self,
        df,
        schema_dict: dict,
        target_group_col: str,
        target_group_val: Any,
        num_rows: int = 50
    ):
        """Generates synthetic rows using Gemini to balance a dataset."""
        import pandas as pd
        stats = df.describe(include='all').to_dict()
        
        prompt = SYNTHETIC_DATA_PROMPT.format(
            num_rows=min(num_rows, 100),
            target_group=f"{target_group_col}='{target_group_val}'",
            schema_stats=json.dumps(stats, default=str)[:10000] # Safe limit
        )
        
        try:
            result = self.invoke_sync(prompt)
            rows = result.get("synthetic_rows", [])
            for r in rows:
                r[target_group_col] = target_group_val
            
            synth_df = pd.DataFrame(rows)
            # Combine
            return pd.concat([df, synth_df], ignore_index=True)
        except Exception as e:
            print(f"Synthetic generation error: {e}")
            return df


remediation_agent = RemediationAgent()
