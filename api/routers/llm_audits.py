"""
Equalyze — LLM Audits Router
Endpoints for the Generative AI Prompt Twin Engine.
"""

from datetime import datetime
from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import Optional

from api.agents.llm_twin_agent import llm_twin_agent

router = APIRouter()


class LLMPromptAuditRequest(BaseModel):
    """Request body for a Generative AI prompt bias audit."""
    system_prompt: str = Field(
        ...,
        description="The system prompt template to evaluate for bias (e.g., 'Review candidate: [NAME]')",
        min_length=10,
        max_length=5000,
    )
    demographic_axes: list[str] = Field(
        default=["gender", "race_ethnicity", "age"],
        description="List of demographic dimensions to test",
    )
    organization_name: Optional[str] = Field(default="", description="Organization name for audit record")
    model_name: Optional[str] = Field(default="Generative AI Prompt", description="Name of the model being audited")


@router.post("/llm-audits")
async def run_llm_prompt_audit(request: LLMPromptAuditRequest):
    """
    Run a Generative AI Prompt Twin Audit.
    
    Evaluates a system prompt template for demographic bias by:
    1. Generating Prompt Twins (majority vs. minority identifiers)
    2. Simulating LLM responses for each twin
    3. Scoring semantic divergence using Gemini as "LLM-as-a-Judge"
    """
    result = await llm_twin_agent.analyze_prompt(
        system_prompt=request.system_prompt,
        demographic_axes=request.demographic_axes,
    )
    
    return {
        "audit_type": "generative_ai",
        "organization_name": request.organization_name,
        "model_name": request.model_name,
        "timestamp": datetime.utcnow().isoformat(),
        **result,
    }
