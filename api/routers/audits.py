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
from api.services.fairness_metrics import FairnessEvaluator
from firebase_admin import firestore

router = APIRouter()

# In-memory audit store for active running tasks
_active_audits: dict[str, Audit] = {}

AGENT_ORDER = ["ingestion", "twin_engine", "governance", "remediation", "reporting"]
AGENT_LABELS = {
    "ingestion": "Ingestion",
    "twin_engine": "Twin Engine",
    "governance": "Governance",
    "remediation": "Remediation",
    "reporting": "Reporting",
}


def _parse_created_at(value):
    if not value:
        return None
    if isinstance(value, datetime):
        return value
    if isinstance(value, str):
        try:
            return datetime.fromisoformat(value.replace("Z", "+00:00"))
        except Exception:
            return None
    return None


def _is_stale_queued_running(audit_dict: dict) -> bool:
    if audit_dict.get("status") != AuditStatus.RUNNING:
        return False
    agents = audit_dict.get("agents", {})
    if not agents:
        return False
    all_pending = all((a or {}).get("status", "pending") == "pending" for a in agents.values())
    if not all_pending:
        return False
    created_at = _parse_created_at(audit_dict.get("created_at"))
    if not created_at:
        return False
    age_seconds = (datetime.utcnow() - created_at.replace(tzinfo=None)).total_seconds()
    return age_seconds > 600


def _mark_stale_failed(audit_dict: dict) -> dict:
    audit_dict["status"] = AuditStatus.FAILED
    logs = audit_dict.get("audit_log", []) or []
    logs.append({
        "event": "pipeline_unreachable",
        "details": "Audit did not start within 10 minutes. Background worker likely unavailable; please re-run.",
        "timestamp": datetime.utcnow().isoformat(),
    })
    audit_dict["audit_log"] = logs
    return audit_dict

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

    # Run the audit pipeline in background (inline for local dev)
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
    
    def persist_progress(updated_audit):
        save_audit_to_db(updated_audit, org_id, db)

    try:
        await orchestrator_agent.run_audit(audit, df, schema_map, on_update=persist_progress)
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
        active = _active_audits[audit_id]
        active_dict = active.model_dump(mode="json")
        if _is_stale_queued_running(active_dict):
            active.status = AuditStatus.FAILED
            active.audit_log.append({
                "event": "pipeline_unreachable",
                "details": "Audit did not start within 10 minutes. Background worker likely unavailable; please re-run.",
                "timestamp": datetime.utcnow().isoformat(),
            })
            save_audit_to_db(active, org_id, db)
            _active_audits.pop(audit_id, None)
            return active.model_dump(mode="json")
        return active_dict
        
    doc_ref = db.collection("organizations").document(org_id).collection("audits").document(audit_id)
    doc = doc_ref.get()
    if doc.exists:
        audit_dict = doc.to_dict()
        if _is_stale_queued_running(audit_dict):
            audit_dict = _mark_stale_failed(audit_dict)
            try:
                doc_ref.set(audit_dict)
            except Exception:
                pass
        return audit_dict
    
    # Fallback: scheduled audits are stored under "demo-org"
    if org_id != "demo-org":
        doc_ref = db.collection("organizations").document("demo-org").collection("audits").document(audit_id)
        doc = doc_ref.get()
        if doc.exists:
            audit_dict = doc.to_dict()
            if _is_stale_queued_running(audit_dict):
                audit_dict = _mark_stale_failed(audit_dict)
                try:
                    doc_ref.set(audit_dict)
                except Exception:
                    pass
            return audit_dict
    
    raise HTTPException(status_code=404, detail="Audit not found")


@router.get("/audits/{audit_id}/status", response_model=AuditStatusResponse)
async def get_audit_status(
    audit_id: str,
    user: Dict[str, Any] = Depends(get_optional_user),
    db = Depends(get_db)
):
    org_id = user.get("current_org_id", "demo-org")
    
    if audit_id in _active_audits:
        audit_dict = _active_audits[audit_id].model_dump(mode="json")
        if _is_stale_queued_running(audit_dict):
            active = _active_audits[audit_id]
            active.status = AuditStatus.FAILED
            active.audit_log.append({
                "event": "pipeline_unreachable",
                "details": "Audit did not start within 10 minutes. Background worker likely unavailable; please re-run.",
                "timestamp": datetime.utcnow().isoformat(),
            })
            save_audit_to_db(active, org_id, db)
            _active_audits.pop(audit_id, None)
            audit_dict = active.model_dump(mode="json")
    else:
        doc_ref = db.collection("organizations").document(org_id).collection("audits").document(audit_id)
        doc = doc_ref.get()
        if not doc.exists and org_id != "demo-org":
            doc_ref = db.collection("organizations").document("demo-org").collection("audits").document(audit_id)
            doc = doc_ref.get()
        if not doc.exists:
            raise HTTPException(status_code=404, detail="Audit not found")
        audit_dict = doc.to_dict()
        if _is_stale_queued_running(audit_dict):
            audit_dict = _mark_stale_failed(audit_dict)
            try:
                doc_ref.set(audit_dict)
            except Exception:
                pass

    agents = audit_dict.get("agents", {})
    total_agents = len(AGENT_ORDER)
    complete_agents = sum(1 for k in AGENT_ORDER if (agents.get(k) or {}).get("status") == "complete")
    progress = int((complete_agents / total_agents) * 100) if total_agents > 0 else 0
    running_key = next((k for k in AGENT_ORDER if (agents.get(k) or {}).get("status") == "running"), None)
    next_pending = next((k for k in AGENT_ORDER if (agents.get(k) or {}).get("status") == "pending"), None)
    current_key = running_key or next_pending or AGENT_ORDER[-1]
    step_index = AGENT_ORDER.index(current_key) + 1 if current_key in AGENT_ORDER else 1
    current_step = AGENT_LABELS.get(current_key, "Queued")

    if audit_dict.get("status") == AuditStatus.COMPLETE:
        progress = 100
        step_index = total_agents
        current_step = "Complete"
    elif audit_dict.get("status") == AuditStatus.FAILED:
        current_step = "Failed"

    return AuditStatusResponse(
        audit_id=audit_id,
        status=audit_dict.get("status", AuditStatus.RUNNING),
        progress_percent=progress,
        current_step=current_step,
        step_index=step_index,
        total_steps=total_agents,
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
        if not doc.exists and org_id != "demo-org":
            doc = db.collection("organizations").document("demo-org").collection("audits").document(audit_id).get()
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
            if a.get("type") == "scheduled" or str(a.get("id", "")).startswith("sch-"):
                continue
                
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


from pydantic import BaseModel

class RemediateRequest(BaseModel):
    num_rows: int = 50

@router.post("/audits/{audit_id}/remediate")
async def remediate_audit(
    audit_id: str,
    req: RemediateRequest,
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
    
    # Scheduled audits cannot be remediated directly
    if audit_dict.get("type") == "scheduled" or audit_id.startswith("sch-"):
        raise HTTPException(status_code=400, detail="Scheduled monitor alerts cannot be remediated directly. Please run a full manual audit to generate synthetic data.")
    
    # Get the dataset's DataFrame from cache
    dataset_id = audit_dict.get("dataset", {}).get("id")
    if not dataset_id or dataset_id not in datasets:
        # Check if we can load it from disk
        file_path = audit_dict.get("dataset", {}).get("file_path")
        if file_path and __import__("os").path.exists(file_path):
            import pandas as pd
            try:
                df = pd.read_csv(file_path)
                datasets[dataset_id] = {
                    "df": df,
                    "metadata": {"filename": audit_dict.get("dataset", {}).get("filename", "dataset.csv")}
                }
            except Exception as e:
                raise HTTPException(status_code=400, detail="Dataset not in cache and failed to load from disk. Re-upload to remediate.")
        else:
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
        num_rows=req.num_rows
    )
    
    synthetic_rows = len(augmented_df) - original_rows
    
    # Validation logic
    before_audit = FairnessEvaluator(df, schema_dict).run_full_audit()
    before_dir = before_audit.get(target_col, {}).get("disparate_impact", {}).get("value", 1.0)
    
    after_audit = FairnessEvaluator(augmented_df, schema_dict).run_full_audit()
    after_dir = after_audit.get(target_col, {}).get("disparate_impact", {}).get("value", 1.0)
    
    improvement_percent = round(((after_dir - before_dir) / before_dir * 100), 1) if before_dir > 0 else 0.0
    validation_passed = after_dir >= 0.80
    
    # DP Privacy Metrics Calculation
    from api.services.privacy_metrics import privacy_metrics
    dp_epsilon = privacy_metrics.calculate_epsilon(original_rows, synthetic_rows)
    
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
            "new_total": len(augmented_df),
            "before_dir": before_dir,
            "after_dir": after_dir,
            "improvement_percent": improvement_percent,
            "validation_passed": validation_passed,
            "dp_epsilon": dp_epsilon
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

@router.get("/audits/{audit_id}/verify-integrity")
async def verify_audit_integrity(
    audit_id: str,
    user: Dict[str, Any] = Depends(get_optional_user),
    db = Depends(get_db)
):
    """
    Verify if the current local hash matches the append-only log hash in BigQuery.
    """
    from api.services.bigquery_logger import bigquery_logger
    
    org_id = user.get("current_org_id", "demo-org")
    
    doc = db.collection("organizations").document(org_id).collection("audits").document(audit_id).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Audit not found")
        
    audit_dict = doc.to_dict()
    current_hash = audit_dict.get("report_hash")
    
    if not current_hash:
        return {"verified": False, "message": "No hash found on this audit."}
        
    is_valid = bigquery_logger.verify_integrity(audit_id, current_hash)
    
    return {
        "verified": is_valid,
        "current_hash": current_hash,
        "message": "Integrity verified." if is_valid else "Hash mismatch or missing log."
    }

class ResolutionRequest(BaseModel):
    action_taken: str  # "Approved", "Halted", "Retrained via Synthetic Data", "Exception Granted"
    reviewer_2_uid: str

@router.post("/audits/{audit_id}/resolve")
async def resolve_audit(
    audit_id: str,
    req: ResolutionRequest,
    user: Dict[str, Any] = Depends(get_optional_user),
    db = Depends(get_db)
):
    """
    Two-Factor Judgment CQRS Endpoint.
    Writes approval to Firestore for instant UI updates, streams to BigQuery for immutable ledger.
    """
    org_id = user.get("current_org_id", "demo-org")
    reviewer_1_uid = user.get("uid", "unknown_user")
    
    doc_ref = db.collection("organizations").document(org_id).collection("audits").document(audit_id)
    doc = doc_ref.get()
    
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Audit not found")
        
    audit_dict = doc.to_dict()
    
    # CQRS Write 1: Update Firestore for instant UI reflection
    event = {
        "anomaly_timestamp": datetime.utcnow().isoformat(),
        "reviewer_1_uid": reviewer_1_uid,
        "reviewer_2_uid": req.reviewer_2_uid,
        "action_taken": req.action_taken,
    }
    
    resolution_events = audit_dict.get("resolution_events", [])
    resolution_events.append(event)
    
    # Update Firestore
    try:
        doc_ref.update({"resolution_events": resolution_events})
    except Exception as e:
        print(f"[Firestore] Resolution event save failed: {e}")
    
    # CQRS Write 2: Stream to BigQuery for immutable ledger
    from api.services.bigquery_logger import bq_logger, AuditLogEntry
    
    log_entry = AuditLogEntry(
        org_id=org_id,
        user_id=reviewer_1_uid,
        action=f"TWO_FACTOR_RESOLUTION_{req.action_taken.upper().replace(' ', '_')}",
        resource_id=audit_id,
        dataset_hash=audit_dict.get("dataset", {}).get("file_hash", "unknown"),
        findings_hash=audit_dict.get("report_hash", "unknown"),
        metadata={"reviewer_2_uid": req.reviewer_2_uid, "ui_updated": True},
        resolution_events=[event]
    )
    
    bq_logger.log_action(log_entry)
    
    return {"message": "Resolution recorded successfully", "event": event}
