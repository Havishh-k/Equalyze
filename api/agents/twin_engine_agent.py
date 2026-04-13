"""
Equalyze — Twin Engine Agent
THE CORE DIFFERENTIATOR. Combines statistical bias detection with
AI-generated counterfactual twins that PROVE discrimination.
"""

import json
import pandas as pd
import numpy as np
from typing import Any
from datetime import datetime

from api.agents.base_agent import BaseEqualyzeAgent
from api.config import settings
from api.models.audit import (
    Finding, FindingType, CounterfactualTwin, BiasMetric,
    GenealogyNode, Severity, AgentState, AgentStatus,
)
from api.services.fairness_metrics import FairnessEvaluator


TWIN_SYSTEM_PROMPT = """You are the Equalyze Counterfactual Twin Generator — the most critical component of a bias detection platform.

Your job is to generate undeniable proof of algorithmic discrimination by creating "Counterfactual Twins" — pairs of profiles that are identical in every legitimate way but differ only in a protected attribute, resulting in a different outcome.

The twin must be:
1. Realistic — a plausible real individual, not a statistical artifact
2. Faithful — every non-protected attribute must remain semantically identical
3. Emotionally compelling — the narrative should make discrimination viscerally clear
4. Written at an 8th-grade reading level — a CEO should understand it

Always respond with valid JSON only."""


TWIN_GENERATION_PROMPT = """You are generating a Counterfactual Twin for an AI bias audit.

DOMAIN: {domain}

ORIGINAL PROFILE (received NEGATIVE outcome: {outcome_label}):
{original_profile}

MATCHED PRIVILEGED PROFILE (received POSITIVE outcome):
{privileged_profile}

The protected attribute that differs: {protected_attribute}
Original value: {original_value}
Privileged value: {privileged_value}

TASK: Generate a compelling Counterfactual Twin demonstration that proves this model discriminates.

RULES:
1. The Twin shows what would happen if ONLY the protected attribute changed.
2. All non-protected attributes (income, health metrics, credit score, etc.) stay IDENTICAL to the original.
3. Write narratives in plain English — a compliance officer with NO technical background must understand the discrimination.
4. The discrimination_statement should be a single devastating sentence.
5. twin_quality_score = how perfectly you preserved all non-protected attributes (0-1).

OUTPUT FORMAT (strict JSON):
{{
  "original_narrative": "A 2-3 sentence story about the original person and their outcome",
  "twin_narrative": "A 2-3 sentence story about the twin (identical person, different protected attribute) and THEIR outcome",
  "twin_profile": {{}},
  "changed_attributes": ["{protected_attribute}"],
  "preserved_attributes": ["list all non-protected attributes that stayed identical"],
  "twin_quality_score": 0.95,
  "discrimination_statement": "One powerful sentence proving discrimination. Example: 'Two patients with identical health profiles were charged 69% different premiums — the only difference was their zip code.'"
}}"""


GENEALOGY_PROMPT = """You are analyzing the ROOT CAUSE of bias in an AI system.

Domain: {domain}
Protected Attribute: {protected_attribute}
Bias Metrics Found:
{metrics_summary}

Dataset Statistics:
- Total rows: {total_rows}
- Group distribution for {protected_attribute}: {group_distribution}
- Outcome rates by group: {outcome_rates}

Analyze WHERE in the data pipeline this bias was introduced. There are 4 levels:

Level 1 — RAW DATA: Is the protected group underrepresented in the dataset?
Level 2 — FEATURE ENGINEERING: Are any valid factors acting as proxies for the protected attribute?
Level 3 — MODEL TRAINING: Does the outcome disparity exceed the data representation disparity? (If yes, the model amplified the bias)
Level 4 — FEEDBACK LOOP: Could there be a self-reinforcing cycle? (Flag for monitoring)

For each level, assign:
- bias_contribution: 0.0-1.0 (what % of the total bias is attributable to this level)
- root_cause: one-sentence explanation
- fix_suggestion: one concrete action to fix it at this level

All 4 levels must sum to approximately 1.0.

Output JSON:
{{
  "genealogy": [
    {{
      "level": 1,
      "level_name": "Raw Data",
      "bias_contribution": 0.35,
      "root_cause": "...",
      "fix_suggestion": "..."
    }},
    ...all 4 levels...
  ]
}}"""


class TwinEngineAgent(BaseEqualyzeAgent):
    """
    Twin Engine Agent — detects bias AND proves it.
    
    Three parallel sub-tasks:
    1. Statistical bias detection (FairnessEvaluator — pure Python)
    2. Counterfactual twin generation (Gemini Pro — the magic)
    3. Bias genealogy analysis (Gemini Flash — root cause)
    """

    def __init__(self):
        super().__init__(
            model_name=settings.GEMINI_PRO_MODEL,
            system_instruction=TWIN_SYSTEM_PROMPT,
            temperature=0.2,  # Slightly creative for narrative generation
            max_output_tokens=8192,
        )
        # Separate model for genealogy (Flash for speed)
        self.genealogy_model = BaseEqualyzeAgent(
            model_name=settings.GEMINI_FLASH_MODEL,
            system_instruction="You are a bias root cause analyst. Output JSON only.",
            temperature=0.1,
        )

    async def analyze(
        self,
        df: pd.DataFrame,
        schema_map: dict,
        domain: str = "other",
    ) -> list[Finding]:
        """
        Run full bias analysis: metrics + twins + genealogy.
        Returns a list of Finding objects.
        """
        # Step 1: Statistical bias detection (pure Python, instant)
        evaluator = FairnessEvaluator(df, schema_map)
        metrics_results = evaluator.run_full_audit()

        findings = []

        for attr, metrics in metrics_results.items():
            # Build finding for each protected attribute
            finding = Finding(
                protected_attribute=attr,
                finding_type=self._determine_finding_type(metrics),
                metrics=[],
            )

            # Populate metrics
            max_severity = Severity.GREEN
            for metric_name, metric_data in metrics.items():
                if metric_name == "intersectional":
                    continue  # Handled separately
                if isinstance(metric_data, dict) and metric_data.get("value") is not None:
                    bm = BiasMetric(
                        metric_name=metric_data.get("metric_name", metric_name),
                        value=metric_data.get("value", 0),
                        severity=metric_data.get("severity", Severity.GREEN),
                        threshold=metric_data.get("threshold", 0),
                        interpretation=metric_data.get("interpretation", ""),
                        legal_flag=metric_data.get("legal_flag", False),
                        minority_group=metric_data.get("minority_group"),
                        majority_group=metric_data.get("majority_group"),
                    )
                    finding.metrics.append(bm)
                    
                    # Track worst severity
                    sev = metric_data.get("severity", Severity.GREEN)
                    if isinstance(sev, str):
                        sev = Severity(sev)
                    if sev == Severity.RED:
                        max_severity = Severity.RED
                    elif sev == Severity.AMBER and max_severity != Severity.RED:
                        max_severity = Severity.AMBER

            finding.severity = max_severity

            # Step 2: Generate counterfactual twin (if bias found)
            if max_severity in (Severity.AMBER, Severity.RED):
                try:
                    twin = await self._generate_twin(df, schema_map, attr, metrics, domain)
                    if twin:
                        finding.counterfactual_twins.append(twin)
                except Exception as e:
                    print(f"Twin generation error for {attr}: {e}")

                # Step 3: Generate bias genealogy
                try:
                    genealogy = await self._generate_genealogy(df, schema_map, attr, metrics, domain)
                    finding.genealogy_tree = genealogy
                except Exception as e:
                    print(f"Genealogy error for {attr}: {e}")

            # Calculate severity score
            finding.severity_score = self._compute_severity_score(finding)
            findings.append(finding)

        return findings

    async def _generate_twin(
        self,
        df: pd.DataFrame,
        schema_map: dict,
        protected_attr: str,
        metrics: dict,
        domain: str,
    ) -> CounterfactualTwin | None:
        """Generate a counterfactual twin for the most discriminated instance."""
        outcome_col = schema_map["outcome"]
        valid_factors = schema_map["valid_factors"]

        # Find the best twin pair: a disadvantaged instance and a similar privileged one
        groups = df.groupby(protected_attr)[outcome_col].mean()
        if len(groups) < 2:
            return None

        minority_group = groups.idxmin()
        majority_group = groups.idxmax()

        # Get rejected minority instances
        rejected = df[(df[protected_attr] == minority_group) & (df[outcome_col] == 0)]
        # Get approved majority instances
        approved = df[(df[protected_attr] == majority_group) & (df[outcome_col] == 1)]

        if rejected.empty or approved.empty:
            # Try with numeric outcome (e.g., premium)
            rejected = df[df[protected_attr] == minority_group].nlargest(5, outcome_col)
            approved = df[df[protected_attr] == majority_group].nsmallest(5, outcome_col)

        if rejected.empty or approved.empty:
            return None

        # Pick a representative rejected instance
        original = rejected.iloc[0].to_dict()
        privileged = approved.iloc[0].to_dict()

        # Clean for JSON
        for d in [original, privileged]:
            for k, v in d.items():
                if isinstance(v, (np.integer,)):
                    d[k] = int(v)
                elif isinstance(v, (np.floating,)):
                    d[k] = float(v)
                elif pd.isna(v):
                    d[k] = None

        prompt = TWIN_GENERATION_PROMPT.format(
            domain=domain,
            outcome_label=f"{outcome_col} = {original.get(outcome_col, 'negative')}",
            original_profile=json.dumps(original, indent=2, default=str),
            privileged_profile=json.dumps(privileged, indent=2, default=str),
            protected_attribute=protected_attr,
            original_value=original.get(protected_attr, "unknown"),
            privileged_value=privileged.get(protected_attr, "unknown"),
        )

        result = self.invoke_sync(prompt)

        # Build twin object
        twin = CounterfactualTwin(
            original_profile=original,
            original_narrative=result.get("original_narrative", ""),
            original_outcome=str(original.get(outcome_col, "")),
            twin_profile=result.get("twin_profile", {}),
            twin_narrative=result.get("twin_narrative", ""),
            twin_outcome=str(privileged.get(outcome_col, "")),
            changed_attributes=result.get("changed_attributes", [protected_attr]),
            preserved_attributes=result.get("preserved_attributes", valid_factors),
            twin_quality_score=result.get("twin_quality_score", 0.9),
            discrimination_statement=result.get("discrimination_statement", ""),
        )

        return twin

    async def _generate_genealogy(
        self,
        df: pd.DataFrame,
        schema_map: dict,
        protected_attr: str,
        metrics: dict,
        domain: str,
    ) -> list[GenealogyNode]:
        """Analyze root cause of bias using Gemini."""
        outcome_col = schema_map["outcome"]

        group_dist = df[protected_attr].value_counts().to_dict()
        outcome_rates = df.groupby(protected_attr)[outcome_col].mean().to_dict()

        # Summarize metrics
        metrics_summary = {
            k: {"value": v.get("value"), "severity": str(v.get("severity", ""))}
            for k, v in metrics.items()
            if isinstance(v, dict) and "value" in v
        }

        prompt = GENEALOGY_PROMPT.format(
            domain=domain,
            protected_attribute=protected_attr,
            metrics_summary=json.dumps(metrics_summary, default=str),
            total_rows=len(df),
            group_distribution=json.dumps({str(k): int(v) for k, v in group_dist.items()}),
            outcome_rates=json.dumps({str(k): round(float(v), 4) for k, v in outcome_rates.items()}),
        )

        result = self.genealogy_model.invoke_sync(prompt)
        genealogy_data = result.get("genealogy", [])

        nodes = []
        for node_data in genealogy_data:
            nodes.append(GenealogyNode(
                level=node_data.get("level", 1),
                level_name=node_data.get("level_name", "Unknown"),
                bias_contribution=node_data.get("bias_contribution", 0.25),
                root_cause=node_data.get("root_cause", ""),
                fix_suggestion=node_data.get("fix_suggestion", ""),
            ))

        return nodes

    def _determine_finding_type(self, metrics: dict) -> FindingType:
        """Determine the primary finding type based on metrics."""
        di = metrics.get("disparate_impact", {})
        if isinstance(di, dict) and di.get("legal_flag"):
            return FindingType.DISPARATE_IMPACT

        dp = metrics.get("demographic_parity", {})
        if isinstance(dp, dict) and dp.get("severity") == Severity.RED:
            return FindingType.DEMOGRAPHIC_PARITY

        return FindingType.DEMOGRAPHIC_PARITY

    def _compute_severity_score(self, finding: Finding) -> float:
        """Compute composite severity score (0-1)."""
        weights = settings.SEVERITY_WEIGHTS
        score = 0.0

        for metric in finding.metrics:
            if metric.metric_name == "disparate_impact" and metric.value is not None:
                # Invert: lower DI ratio = higher severity
                score += weights["disparate_impact"] * (1.0 - min(metric.value, 1.0))
            elif metric.metric_name == "demographic_parity" and metric.value is not None:
                score += weights["demographic_parity"] * min(metric.value * 3, 1.0)

        # Twin quality contribution
        if finding.counterfactual_twins:
            max_twin_score = max(t.twin_quality_score for t in finding.counterfactual_twins)
            score += weights["twin_quality"] * max_twin_score

        # Genealogy depth
        if finding.genealogy_tree:
            max_contrib = max(n.bias_contribution for n in finding.genealogy_tree)
            score += weights["genealogy_depth"] * max_contrib

        return round(min(score, 1.0), 4)


twin_engine_agent = TwinEngineAgent()
