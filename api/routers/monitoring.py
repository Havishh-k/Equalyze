from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from typing import Dict, Any
from api.services.db import get_db
import uuid
import datetime

router = APIRouter()

@router.post("/monitoring/run-scheduled-audit")
async def run_scheduled_audit(
    background_tasks: BackgroundTasks,
    # In production, we'd verify the OIDC token from Google Cloud Scheduler here.
):
    """
    Webhook target for Cloud Scheduler.
    Triggers a background "drift" audit on the latest data stream.
    """
    # For hackathon Demo, we will simulate drift by loading the existing dataset 
    # but varying the bias slightly over time, then saving a new Audit record.
    
    # 1. Fetch "primary" demo dataset
    from api.routers.datasets import get_dataset_store
    datasets = get_dataset_store()
    
    # Since it's a scheduled job without frontend context, we just grab
    # the first available dataset in cache (or hardcode demo ID)
    if not datasets:
        return {"status": "skipped", "reason": "No datasets available to monitor"}
        
    dataset_id = list(datasets.keys())[0]
    ds = datasets[dataset_id]
    
    # Normally we'd do `background_tasks.add_task(run_audit_pipeline, ...)`
    # But for a realistic drift demo, let's just generate a synthetic audit entry
    # showing slightly worsening (or improving) metrics over time to populate the chart.
    
    db = get_db()
    org_id = "demo-org"
    
    audit_id = f"sch-{str(uuid.uuid4())[:8]}"
    
    mock_audit = {
        "id": audit_id,
        "status": "complete",
        "created_at": datetime.datetime.utcnow().isoformat(),
        "overall_severity": "AMBER",
        "overall_score": 0.65, # A slight drift down in score
        "model_metadata": {
            "model_name": "Scheduled Monitor",
            "domain": "healthcare"
        },
        "dataset": {
            "filename": ds["metadata"]["filename"]
        },
        "type": "scheduled",
        "findings": [
             {"severity": "AMBER", "description": "Drift detected in gender approval rates"}
        ]
    }
    
    db.collection("organizations").document(org_id).collection("audits").document(audit_id).set(mock_audit)

    return {"status": "triggered", "audit_id": audit_id}
    
@router.get("/monitoring/drift")
async def get_drift_metrics(db = Depends(get_db)):
    """Fetch historical audits to plot drift over time."""
    org_id = "demo-org"
    
    try:
        docs = db.collection("organizations").document(org_id).collection("audits").stream()
        
        chart_data = []
        for doc in docs:
            a = doc.to_dict()
            if a.get("status") == "complete" and a.get("overall_score") is not None:
                created = a.get("created_at", "")
                date_str = created[:10] if isinstance(created, str) and len(created) >= 10 else "unknown"
                chart_data.append({
                    "date": date_str,
                    "score": a.get("overall_score", 0),
                    "severity": a.get("overall_severity", "UNKNOWN")
                })
        
        # Sort by date
        chart_data.sort(key=lambda x: x["date"])
        
        return {"history": chart_data}
    except Exception as e:
        return {"history": [], "error": str(e)}
