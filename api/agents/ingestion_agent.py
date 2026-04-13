"""
Equalyze — Ingestion Agent
Parses datasets, auto-tags schema, detects proxy variables.
Uses Gemini Flash for intelligent column classification.
"""

import json
from typing import Any

from api.agents.base_agent import BaseEqualyzeAgent
from api.config import settings
from api.models.audit import ColumnTag, SchemaMap, ProxyWarning
from api.services.proxy_detector import proxy_detector


INGESTION_SYSTEM_PROMPT = """You are the Equalyze Ingestion Agent. You analyze datasets for AI bias audits.

Your job is to classify dataset columns into categories for a fairness audit.
You must be precise — misclassifying a protected attribute as a valid factor could hide discrimination.

Always respond with valid JSON only. No prose, no explanations outside the JSON structure."""


SCHEMA_TAGGING_PROMPT = """You are analyzing a dataset for an AI bias audit.
Domain: {domain}
Column names and sample data:
{column_samples}

Column statistics:
{column_stats}

Classify each column into exactly one of:
- PROTECTED_ATTRIBUTE: A characteristic that should NOT influence the AI's decision 
  (race, gender, age, religion, disability, zip_code, zip_type, region, national_origin, caste, ethnicity)
- VALID_FACTOR: A legitimate decision input (income, credit_score, years_employed, bmi, medical_history)
- OUTCOME: The model's prediction or decision column (loan_approved, claim_approved, risk_score, premium)
- IDENTIFIER: A unique ID column (applicant_id, patient_id)
- METADATA: Administrative data not relevant to the model (date, agent_id)

IMPORTANT RULES:
1. Geographic features (zip_code, zip_type, region) are ALWAYS PROTECTED_ATTRIBUTE because they proxy for race/socioeconomic status.
2. Gender/sex is ALWAYS PROTECTED_ATTRIBUTE.
3. Age is ALWAYS PROTECTED_ATTRIBUTE.
4. Binary outcome columns (0/1 for approved/rejected) are likely OUTCOME.
5. Monetary outcome columns (premium, interest_rate) are likely OUTCOME.
6. ID columns with unique values per row are IDENTIFIER.

For each classification, provide:
- confidence score (0-1)
- one sentence rationale
- whether this column might be a proxy for a protected attribute

Output JSON:
{{
  "columns": [
    {{
      "column_name": "column_name",
      "tag": "PROTECTED_ATTRIBUTE | VALID_FACTOR | OUTCOME | IDENTIFIER | METADATA",
      "confidence": 0.95,
      "rationale": "Brief explanation",
      "proxy_warning": false
    }}
  ]
}}"""


class IngestionAgent(BaseEqualyzeAgent):
    """
    Ingestion Agent — first stage of the audit pipeline.
    Parses dataset, auto-tags columns, detects proxy variables.
    """

    def __init__(self):
        super().__init__(
            model_name=settings.GEMINI_FLASH_MODEL,
            system_instruction=INGESTION_SYSTEM_PROMPT,
            temperature=0.05,  # Very low — we want consistent classifications
        )

    def suggest_schema(
        self,
        column_names: list[str],
        column_stats: dict[str, Any],
        sample_data: list[dict],
        domain: str = "other",
    ) -> SchemaMap:
        """
        Use Gemini to auto-suggest column classifications.
        Returns a SchemaMap with protected attributes, valid factors, and outcome.
        """
        # Format sample data for prompt
        sample_text = json.dumps(sample_data[:3], indent=2, default=str)
        stats_text = json.dumps(
            {k: {sk: sv for sk, sv in v.items() if sk != "values"} 
             for k, v in column_stats.items()},
            indent=2, default=str
        )

        prompt = SCHEMA_TAGGING_PROMPT.format(
            domain=domain,
            column_samples=sample_text,
            column_stats=stats_text,
        )

        try:
            result = self.invoke_sync(prompt)
            return self._parse_schema_result(result, column_names)
        except Exception as e:
            # Fallback: use heuristic-based classification
            return self._heuristic_schema(column_names, column_stats)

    def _parse_schema_result(self, result: dict, column_names: list[str]) -> SchemaMap:
        """Parse Gemini's classification into a SchemaMap."""
        columns = result.get("columns", [])

        protected = []
        valid_factors = []
        outcome = ""
        identifier = None
        column_tags = []

        for col_info in columns:
            name = col_info.get("column_name", "")
            tag = col_info.get("tag", "").upper()
            confidence = col_info.get("confidence", 0.0)
            rationale = col_info.get("rationale", "")
            proxy = col_info.get("proxy_warning", False)

            # Clean name for matching
            name_clean = name.strip().lower()
            col_map = {c.strip().lower(): c for c in column_names}

            if name_clean not in col_map:
                continue
                
            actual_name = col_map[name_clean]

            column_tags.append(ColumnTag(
                column_name=actual_name,
                tag=tag,
                confidence=confidence,
                rationale=rationale,
                proxy_warning=proxy,
            ))

            if tag == "PROTECTED_ATTRIBUTE":
                protected.append(actual_name)
            elif tag == "VALID_FACTOR":
                valid_factors.append(actual_name)
            elif tag == "OUTCOME" and not outcome:
                outcome = actual_name
            elif tag == "IDENTIFIER" and not identifier:
                identifier = actual_name

        return SchemaMap(
            protected_attributes=protected,
            valid_factors=valid_factors,
            outcome=outcome,
            identifier=identifier,
            column_tags=column_tags,
        )

    def _heuristic_schema(self, column_names: list[str], column_stats: dict) -> SchemaMap:
        """Fallback heuristic classification when Gemini fails."""
        protected_keywords = {"gender", "sex", "race", "ethnicity", "age", "zip", "region", "caste", "religion", "disability", "zip_type", "zip_code"}
        outcome_keywords = {"approved", "rejected", "outcome", "decision", "premium", "score", "result", "claim", "loan"}
        id_keywords = {"id", "identifier", "patient_id", "applicant_id"}

        protected = []
        valid_factors = []
        outcome = ""
        identifier = None

        for col in column_names:
            col_lower = col.lower()
            if any(kw in col_lower for kw in id_keywords):
                identifier = col
            elif any(kw in col_lower for kw in protected_keywords):
                protected.append(col)
            elif any(kw in col_lower for kw in outcome_keywords):
                if not outcome:
                    outcome = col
            else:
                valid_factors.append(col)

        return SchemaMap(
            protected_attributes=protected,
            valid_factors=valid_factors,
            outcome=outcome,
            identifier=identifier,
        )


ingestion_agent = IngestionAgent()
