"""
Equalyze — Audit API Routes
Create, run, and query bias audits.
"""

import uuid
from datetime import datetime
from fastapi import APIRouter, HTTPException, BackgroundTasks, Depends
from typing import Optional, Dict, Any

from api.models.audit import (
    Audit, AuditStatus, AuditCreateResponse, AuditStatusResponse,
    SchemaConfirmRequest, Finding, Severity, AgentStatus, AgentState,
    DatasetInfo, ModelMetadata,
)
from api.routers.datasets import get_dataset_store
from api.services.db import get_db, get_optional_user
from firebase_admin import firestore

router = APIRouter()

# In-memory audit store for active running tasks
_active_audits: dict[str, Audit] = {}

def save_audit_to_db(audit: Audit, org_id: str, db):
    """Upsert Audit object to Firestore."""
    try:
        doc_ref = db.collection("organizations").document(org_id).collection("audits").document(audit.id)
        doc_ref.set(audit.model_dump(mode="json"))
    except Exception as e:
        print(f"[Firestore] Audit save skipped: {e}")

@router.post("/audits", response_model=AuditCreateResponse)
async def create_audit(
    request: SchemaConfirmRequest,
    background_tasks: BackgroundTasks,
    user: Dict[str, Any] = Depends(get_optional_user),
    db = Depends(get_db)
):
    org_id = user.get("current_org_id", "demo-org")
    datasets = get_dataset_store()
    
    if request.dataset_id in datasets:
        ds_meta = datasets[request.dataset_id]["metadata"]
        df = datasets[request.dataset_id]["df"]
    else:
        # Fallback check Firestore
        try:
            doc = db.collection("organizations").document(org_id).collection("datasets").document(request.dataset_id).get()
            if not doc.exists:
                raise HTTPException(status_code=404, detail="Dataset not found")
        except HTTPException:
            raise
        except Exception:
            raise HTTPException(status_code=404, detail="Dataset not found (Firestore unavailable)")
        raise HTTPException(status_code=400, detail="Dataset DF not in cache. Re-upload for demo analysis.")

    # Create audit
    audit = Audit(
        id=str(uuid.uuid4()),
        status=AuditStatus.RUNNING,
        dataset=DatasetInfo(
            id=request.dataset_id,
            filename=ds_meta["filename"],
            file_path=ds_meta.get("file_path", ""),
            file_hash=ds_meta["profile"].get("file_hash", ""),
            row_count=ds_meta["profile"]["row_count"],
            column_count=ds_meta["profile"]["column_count"],
            column_names=ds_meta["profile"]["column_names"],
            sample_data=ds_meta["profile"]["sample_data"][:3],
        ),
        model_metadata=request.model_metadata,
        schema_map=request.schema_map,
    )

    _active_audits[audit.id] = audit
    
    # Save running state to DB
    save_audit_to_db(audit, org_id, db)

    # Run the audit pipeline in background
    background_tasks.add_task(run_audit_pipeline, audit.id, org_id, df, request.schema_map)

    return AuditCreateResponse(
        audit_id=audit.id,
        status=AuditStatus.RUNNING,
        estimated_minutes=3,
    )


async def run_audit_pipeline(audit_id: str, org_id: str, df, schema_map):
    from api.agents.orchestrator import orchestrator_agent
    from api.services.db import get_db

    audit = _active_audits.get(audit_id)
    if not audit:
        return
        
    db = get_db()

    try:
        await orchestrator_agent.run_audit(audit, df, schema_map)
    except Exception as e:
        audit.status = AuditStatus.FAILED
        audit.audit_log.append({
            "event": "audit_failed",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat(),
        })
    finally:
        # Final persistence flush
        save_audit_to_db(audit, org_id, db)
        if audit.status in (AuditStatus.COMPLETE, AuditStatus.FAILED):
            _active_audits.pop(audit_id, None)


@router.get("/audits/{audit_id}")
async def get_audit(
    audit_id: str,
    user: Dict[str, Any] = Depends(get_optional_user),
    db = Depends(get_db)
):
    org_id = user.get("current_org_id", "demo-org")
    if audit_id in _active_audits:
        return _active_audits[audit_id].model_dump(mode="json")
        
    doc = db.collection("organizations").document(org_id).collection("audits").document(audit_id).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Audit not found")
        
    return doc.to_dict()


@router.get("/audits/{audit_id}/status", response_model=AuditStatusResponse)
async def get_audit_status(
    audit_id: str,
    user: Dict[str, Any] = Depends(get_optional_user),
    db = Depends(get_db)
):
    org_id = user.get("current_org_id", "demo-org")
    
    if audit_id in _active_audits:
        audit_dict = _active_audits[audit_id].model_dump(mode="json")
    else:
        doc = db.collection("organizations").document(org_id).collection("audits").document(audit_id).get()
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Audit not found")
        audit_dict = doc.to_dict()

    agents = audit_dict.get("agents", {})
    total_agents = len(agents)
    complete_agents = sum(1 for a in agents.values() if a.get("status") == "complete")
    progress = int((complete_agents / total_agents) * 100) if total_agents > 0 else 0

    return AuditStatusResponse(
        audit_id=audit_id,
        status=audit_dict.get("status", AuditStatus.RUNNING),
        progress_percent=progress,
        agents=agents,
        overall_severity=audit_dict.get("overall_severity"),
        overall_score=audit_dict.get("overall_score"),
    )


@router.get("/audits/{audit_id}/findings")
async def get_audit_findings(
    audit_id: str,
    user: Dict[str, Any] = Depends(get_optional_user),
    db = Depends(get_db)
):
    org_id = user.get("current_org_id", "demo-org")
    
    if audit_id in _active_audits:
        audit_dict = _active_audits[audit_id].model_dump(mode="json")
    else:
        doc = db.collection("organizations").document(org_id).collection("audits").document(audit_id).get()
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Audit not found")
        audit_dict = doc.to_dict()

    return {
        "audit_id": audit_id,
        "status": audit_dict.get("status"),
        "overall_severity": audit_dict.get("overall_severity"),
        "overall_score": audit_dict.get("overall_score"),
        "findings": audit_dict.get("findings", []),
    }


@router.get("/audits")
async def list_audits(
    user: Dict[str, Any] = Depends(get_optional_user),
    db = Depends(get_db)
):
    org_id = user.get("current_org_id", "demo-org")
    
    try:
        docs = db.collection("organizations").document(org_id).collection("audits").stream()
        
        results = []
        for doc in docs:
            a = doc.to_dict()
            results.append({
                "id": a.get("id"),
                "status": a.get("status"),
                "model_name": a.get("model_metadata", {}).get("model_name"),
                "domain": a.get("model_metadata", {}).get("domain"),
                "overall_severity": a.get("overall_severity"),
                "created_at": a.get("created_at"),
                "dataset_filename": a.get("dataset", {}).get("filename"),
                "findings_count": len(a.get("findings", [])),
            })

        results.sort(key=lambda x: x.get("created_at", ""), reverse=True)
        return {"audits": results}
    except Exception:
        return {"audits": []}


@router.post("/audits/{audit_id}/remediate")
async def remediate_audit(
    audit_id: str,
    user: Dict[str, Any] = Depends(get_optional_user),
    db = Depends(get_db)
):
    """
    Generate synthetic data to remediate bias found in this audit.
    Uses Gemini via RemediationAgent to create balanced rows.
    """
    from api.agents.remediation_agent import remediation_agent
    import pandas as pd

    org_id = user.get("current_org_id", "demo-org")
    datasets = get_dataset_store()
    
    # Get audit data
    audit_dict = None
    if audit_id in _active_audits:
        audit_dict = _active_audits[audit_id].model_dump(mode="json")
    else:
        doc = db.collection("organizations").document(org_id).collection("audits").document(audit_id).get()
        if doc.exists:
            audit_dict = doc.to_dict()
    
    if not audit_dict:
        raise HTTPException(status_code=404, detail="Audit not found")
    
    # Get the dataset's DataFrame from cache
    dataset_id = audit_dict.get("dataset", {}).get("id")
    if not dataset_id or dataset_id not in datasets:
        raise HTTPException(status_code=400, detail="Dataset not in cache. Re-upload to remediate.")
    
    df = datasets[dataset_id]["df"]
    original_rows = len(df)
    
    # Find the first biased protected attribute
    findings = audit_dict.get("findings", [])
    biased = [f for f in findings if f.get("severity", "").upper() in ("AMBER", "RED")]
    
    if not biased:
        return {"message": "No bias findings to remediate", "stats": {"original_rows": original_rows, "synthetic_rows": 0, "new_total": original_rows}}
    
    target_col = biased[0].get("protected_attribute", "")
    if not target_col or target_col not in df.columns:
        return {"message": "Cannot identify target column", "stats": {"original_rows": original_rows, "synthetic_rows": 0, "new_total": original_rows}}
    
    # Find the minority group
    value_counts = df[target_col].value_counts()
    minority_val = value_counts.idxmin()
    
    schema_dict = audit_dict.get("schema_map", {})
    
    augmented_df = await remediation_agent.generate_synthetic_dataset(
        df=df,
        schema_dict=schema_dict,
        target_group_col=target_col,
        target_group_val=minority_val,
        num_rows=50
    )
    
    synthetic_rows = len(augmented_df) - original_rows
    
    # Save augmented CSV for download
    import tempfile, os
    save_path = os.path.join("data", "datasets", dataset_id, "remediated.csv")
    os.makedirs(os.path.dirname(save_path), exist_ok=True)
    augmented_df.to_csv(save_path, index=False)
    
    return {
        "message": "Synthetic dataset generated",
        "stats": {
            "original_rows": original_rows,
            "synthetic_rows": synthetic_rows,
            "new_total": len(augmented_df)
        },
        "download_url": f"/api/v1/audits/{audit_id}/remediated-download"
    }


@router.get("/audits/{audit_id}/remediated-download")
async def download_remediated(audit_id: str):
    """Serve the remediated CSV file."""
    from fastapi.responses import FileResponse
    import os, glob
    
    # Find the file
    pattern = os.path.join("data", "datasets", "*", "remediated.csv")
    files = glob.glob(pattern)
    if not files:
        raise HTTPException(status_code=404, detail="No remediated file found. Generate first.")
    
    return FileResponse(files[-1], media_type="text/csv", filename="remediated_dataset.csv")
