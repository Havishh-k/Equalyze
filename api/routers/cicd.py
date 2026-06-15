"""
Equalyze — CI/CD Fairness Gateway
Deployment blocker endpoint that enforces the India DPDPA 0.80 Disparate Impact threshold.
"""

from datetime import datetime
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional

router = APIRouter()


class CICDPayload(BaseModel):
    """Payload from a CI/CD pipeline requesting deployment clearance."""
    model_name: str = Field(..., description="Name of the ML model being deployed")
    model_version: str = Field(default="1.0.0", description="Semantic version of the model")
    disparate_impact_ratio: float = Field(..., description="Computed Disparate Impact Ratio (0.0–2.0)")
    equal_opportunity_diff: Optional[float] = Field(default=None, description="Equal opportunity difference")
    statistical_parity_diff: Optional[float] = Field(default=None, description="Statistical parity difference")
    pipeline_id: Optional[str] = Field(default=None, description="CI/CD pipeline run ID")
    commit_sha: Optional[str] = Field(default=None, description="Git commit SHA triggering the deployment")


# Hardcoded DPDPA threshold — India Digital Personal Data Protection Act
DPDPA_DIR_THRESHOLD = 0.80


@router.post("/cicd-gate")
async def cicd_fairness_gate(payload: CICDPayload):
    """
    CI/CD Fairness Gateway — Deployment Blocker

    Evaluates the incoming model's fairness metrics against the India DPDPA
    Disparate Impact Ratio threshold (0.80). If the model fails, the endpoint
    returns HTTP 403 Forbidden, blocking deployment.

    This simulates a real-world MLOps integration where a Jenkins/GitHub Actions
    pipeline calls this webhook before pushing a model to production.
    """
    timestamp = datetime.utcnow().isoformat()
    dir_value = payload.disparate_impact_ratio

    # ── Gate Decision ──────────────────────────────────
    if dir_value < DPDPA_DIR_THRESHOLD:
        raise HTTPException(
            status_code=403,
            detail={
                "gate_status": "BLOCKED",
                "reason": "DEPLOYMENT_BLOCKED_FAIRNESS_VIOLATION",
                "model_name": payload.model_name,
                "model_version": payload.model_version,
                "disparate_impact_ratio": dir_value,
                "threshold": DPDPA_DIR_THRESHOLD,
                "violation": f"Disparate Impact Ratio ({dir_value:.4f}) is below the India DPDPA threshold ({DPDPA_DIR_THRESHOLD}). Deployment to production is forbidden.",
                "regulation": "India Digital Personal Data Protection Act (DPDPA) 2023 — Section 4(2)",
                "required_action": "Retrain the model with bias mitigation techniques or augment training data before resubmitting.",
                "timestamp": timestamp,
                "pipeline_id": payload.pipeline_id,
                "commit_sha": payload.commit_sha,
            },
        )

    # ── Passed ─────────────────────────────────────────
    return {
        "gate_status": "PASSED",
        "model_name": payload.model_name,
        "model_version": payload.model_version,
        "disparate_impact_ratio": dir_value,
        "threshold": DPDPA_DIR_THRESHOLD,
        "message": f"Model {payload.model_name} v{payload.model_version} passed the fairness gate. Deployment is authorized.",
        "regulation": "India DPDPA 2023 — Compliant",
        "timestamp": timestamp,
        "pipeline_id": payload.pipeline_id,
        "commit_sha": payload.commit_sha,
    }
