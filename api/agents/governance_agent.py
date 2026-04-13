"""
Equalyze — Governance Agent
Maps bias findings to regulations and computes legal exposure scores.
"""

import json
from typing import Any

from api.agents.base_agent import BaseEqualyzeAgent
from api.config import settings
from api.models.audit import LegalViolation, RiskLevel, Finding, Severity


GOVERNANCE_SYSTEM_PROMPT = """You are the Equalyze Legal Governance Agent — an AI compliance expert.

Your job is to map bias findings from AI audits to specific regulations across jurisdictions (India, EU, USA).
You must be precise: only cite regulations that genuinely apply. Never fabricate articles or section numbers.
If no specific regulation applies, say so.

Always respond with valid JSON only."""


LEGAL_MAPPING_PROMPT = """You are a legal AI compliance expert analyzing bias findings from an AI audit.

BIAS FINDING:
- Protected attribute: {protected_attribute}
- Finding type: {finding_type}
- Severity: {severity}
- Key metrics: {metrics_summary}
- Counterfactual evidence: {twin_summary}

DOMAIN: {domain}
JURISDICTIONS: {jurisdictions}

REGULATION DATABASE:
India:
- DPDPA 2023 (Digital Personal Data Protection Act): Section 4 (purpose limitation), Section 8 (data principal rights). Applies when automated processing of personal data leads to discriminatory outcomes.
- RBI Fair Practices Code (Para 3): Mandates non-discriminatory lending. Lenders must not discriminate based on gender, caste, religion, or location.
- IRDAI Guidelines: Insurance pricing must not unfairly discriminate based on non-actuarial factors.

EU:
- EU AI Act 2024: Article 9 (risk management for high-risk AI), Article 10 (data governance — training data bias), Article 13 (transparency), Article 15 (accuracy and robustness).
- GDPR Article 22: Right not to be subject to solely automated decision-making with legal/significant effects.

USA:
- ECOA / Regulation B (12 CFR Part 202): Prohibits discrimination in credit based on race, color, religion, national origin, sex, marital status, age.
- Fair Housing Act (42 U.S.C. § 3604): Prohibits discriminatory insurance/housing practices.
- Title VII of Civil Rights Act: Employment discrimination based on protected characteristics.
- HIPAA (45 CFR Parts 160, 164): Non-discrimination in health data processing.

Global:
- ISO/IEC 42001: AI Management Systems — best practice for bias testing and documentation.

For each applicable regulation:
1. Cite the specific article/section
2. Assess legal risk: LOW / MEDIUM / HIGH / CRITICAL
3. Write a plain-English explanation of the potential violation
4. State required remediation

Output JSON:
{{
  "legal_violations": [
    {{
      "regulation_name": "name",
      "jurisdiction": "India | EU | USA | Global",
      "article": "specific section/article",
      "risk_level": "LOW | MEDIUM | HIGH | CRITICAL",
      "plain_english": "explanation of violation in simple terms",
      "remediation_required": "what the organization must do"
    }}
  ]
}}"""


class GovernanceAgent(BaseEqualyzeAgent):
    """
    Governance Agent — maps bias to regulations, scores legal exposure.
    """

    def __init__(self):
        super().__init__(
            model_name=settings.GEMINI_FLASH_MODEL,
            system_instruction=GOVERNANCE_SYSTEM_PROMPT,
            temperature=0.05,  # Very consistent for legal citations
        )

    async def analyze_finding(
        self,
        finding: Finding,
        domain: str = "other",
        jurisdictions: list[str] = None,
    ) -> list[LegalViolation]:
        """Map a bias finding to applicable regulations."""
        if jurisdictions is None:
            jurisdictions = ["india", "eu", "usa"]

        # Summarize metrics for prompt
        metrics_summary = []
        for m in finding.metrics:
            metrics_summary.append(f"{m.metric_name}: {m.value} ({m.severity})")

        # Summarize twin evidence
        twin_summary = "No counterfactual evidence generated."
        if finding.counterfactual_twins:
            twin = finding.counterfactual_twins[0]
            twin_summary = twin.discrimination_statement or twin.original_narrative

        prompt = LEGAL_MAPPING_PROMPT.format(
            protected_attribute=finding.protected_attribute,
            finding_type=finding.finding_type,
            severity=finding.severity,
            metrics_summary="; ".join(metrics_summary),
            twin_summary=twin_summary,
            domain=domain,
            jurisdictions=", ".join(jurisdictions),
        )

        try:
            result = self.invoke_sync(prompt)
            violations = []
            for v in result.get("legal_violations", []):
                violations.append(LegalViolation(
                    regulation_name=v.get("regulation_name", ""),
                    jurisdiction=v.get("jurisdiction", ""),
                    article=v.get("article", ""),
                    risk_level=RiskLevel(v.get("risk_level", "LOW")),
                    plain_english=v.get("plain_english", ""),
                    remediation_required=v.get("remediation_required", ""),
                ))
            return violations
        except Exception as e:
            print(f"Governance analysis error: {e}")
            return []

    def compute_overall_severity(self, findings: list[Finding]) -> tuple[Severity, float]:
        """
        Compute overall audit severity and score from all findings.
        """
        if not findings:
            return Severity.GREEN, 0.0

        max_score = max(f.severity_score for f in findings)
        
        # Factor in legal exposure
        has_critical_legal = any(
            v.risk_level == RiskLevel.CRITICAL
            for f in findings
            for v in f.legal_violations
        )
        has_high_legal = any(
            v.risk_level == RiskLevel.HIGH
            for f in findings
            for v in f.legal_violations
        )

        if has_critical_legal:
            max_score = max(max_score, 0.85)
        elif has_high_legal:
            max_score = max(max_score, 0.55)

        # Add legal exposure weight
        legal_weight = settings.SEVERITY_WEIGHTS["legal_exposure"]
        if has_critical_legal:
            max_score += legal_weight * 1.0
        elif has_high_legal:
            max_score += legal_weight * 0.7

        final_score = round(min(max_score, 1.0), 4)

        if final_score >= 0.67:
            severity = Severity.RED
        elif final_score >= 0.34:
            severity = Severity.AMBER
        else:
            severity = Severity.GREEN

        return severity, final_score


governance_agent = GovernanceAgent()
