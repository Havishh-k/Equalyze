from fastapi import FastAPI, Request
from pydantic import BaseModel
from typing import Dict, Any
import asyncio
from datetime import datetime
import os

# Worker handles heavy tasks decoupled from main API
app = FastAPI(title="Equalyze Worker (Cloud Run)", version="1.0")

class TaskPayload(BaseModel):
    task_type: str
    dataset_id: str
    org_id: str
    # Other payload fields can be variable
    file_path: str = None
    domain: str = None
    audit_id: str = None
    schema_map: dict = None

@app.post("/task")
async def process_task(payload: TaskPayload):
    """
    HTTP endpoint simulating Cloud Run receiving a Cloud Task webhook.
    Must return 200/202 to acknowledge task, otherwise Cloud Tasks will retry.
    """
    print(f"[Worker] Received task: {payload.task_type} for {payload.dataset_id}")
    
    # Run the heavy logic asynchronously so we can return 202 immediately to Cloud Tasks
    # In real Cloud Run, Cloud Tasks expects the worker to complete before returning 2xx,
    # but since this is a local mock with `requests.post(timeout=0.5)`, we push it to asyncio.
    asyncio.create_task(handle_task_logic(payload))
    
    return {"status": "accepted", "job_id": f"job-{payload.dataset_id}"}

async def handle_task_logic(payload: TaskPayload):
    if payload.task_type == "parse_dataset":
        await run_dataset_parse(payload)
    elif payload.task_type == "run_audit":
        await run_audit_pipeline(payload)
    else:
        print(f"[Worker] Unknown task type: {payload.task_type}")

async def run_dataset_parse(payload: TaskPayload):
    # Simulate heavy dataset parsing and storing profile to DB
    print(f"[Worker] Parsing dataset {payload.dataset_id}...")
    from api.services.dataset_parser import dataset_parser
    from api.services.db import get_db
    
    db = get_db()
    
    try:
        df, profile = dataset_parser.parse(payload.file_path)
        
        # Save to DB to update status
        doc_data = {
            "id": payload.dataset_id,
            "status": "READY",
            "file_path": payload.file_path,
            "domain": payload.domain,
            "profile": profile,
            "processed_at": datetime.utcnow().isoformat()
        }
        
        doc_ref = db.collection("organizations").document(payload.org_id).collection("datasets").document(payload.dataset_id)
        doc_ref.set(doc_data, merge=True)
        print(f"[Worker] Dataset {payload.dataset_id} parse complete.")
        
    except Exception as e:
        print(f"[Worker] Parse failed: {e}")
        # Mark as failed in DB
        db.collection("organizations").document(payload.org_id).collection("datasets").document(payload.dataset_id).set({"status": "FAILED", "error": str(e)}, merge=True)

async def run_audit_pipeline(payload: TaskPayload):
    print(f"[Worker] Running audit {payload.audit_id} for dataset {payload.dataset_id}...")
    from api.agents.orchestrator import orchestrator_agent
    from api.services.db import get_db
    from api.models.audit import AuditStatus
    import pandas as pd
    
    db = get_db()
    audit_ref = db.collection("organizations").document(payload.org_id).collection("audits").document(payload.audit_id)
    
    try:
        # Load dataset
        doc = db.collection("organizations").document(payload.org_id).collection("datasets").document(payload.dataset_id).get()
        if not doc.exists:
            raise Exception("Dataset not found in DB")
            
        file_path = doc.to_dict().get("file_path")
        df = pd.read_csv(file_path)
        
        # Fetch audit model
        audit_doc = audit_ref.get()
        if not audit_doc.exists:
            raise Exception("Audit not found in DB")
            
        audit_data = audit_doc.to_dict()
        from api.models.audit import Audit
        audit = Audit(**audit_data)
        
        # Heavy ML operation
        await orchestrator_agent.run_audit(audit, df, payload.schema_map)
        
        # Save complete
        audit_ref.set(audit.model_dump(mode="json"))
        print(f"[Worker] Audit {payload.audit_id} complete.")
        
    except Exception as e:
        print(f"[Worker] Audit failed: {e}")
        audit_ref.set({"status": AuditStatus.FAILED, "error": str(e)}, merge=True)
