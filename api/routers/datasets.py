"""
Equalyze — Dataset API Routes
Upload, parse, and get schema suggestions for datasets.
"""

import uuid
from pathlib import Path
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from typing import Dict, Any

from api.config import settings
from api.models.audit import UploadResponse
from api.services.dataset_parser import dataset_parser
from api.agents.ingestion_agent import ingestion_agent
from api.services.db import get_db, get_optional_user
from firebase_admin import storage

router = APIRouter()

# Local cache for DataFrames to avoid constant re-parsing
_datastore_cache = {}

@router.post("/datasets/upload", response_model=UploadResponse)
async def upload_dataset(
    file: UploadFile = File(...),
    domain: str = Form(default="other"),
    user: Dict[str, Any] = Depends(get_optional_user),
    db = Depends(get_db)
):
    ext = Path(file.filename).suffix.lower()
    if ext not in dataset_parser.SUPPORTED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"Unsupported file type: {ext}")

    dataset_id = str(uuid.uuid4())
    org_id = user.get("current_org_id", "demo-org")
    
    # 1. Save locally
    save_dir = settings.DATASETS_DIR / dataset_id
    save_dir.mkdir(parents=True, exist_ok=True)
    file_path = save_dir / file.filename

    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)

    # Upload to Firebase Storage (graceful fallback)
    gs_url = ""
    try:
        bucket = storage.bucket()
        blob = bucket.blob(f"orgs/{org_id}/datasets/{dataset_id}/{file.filename}")
        blob.upload_from_filename(str(file_path))
        gs_url = f"gs://{bucket.name}/{blob.name}"
    except Exception as e:
        print(f"[Firebase Storage] Upload skipped: {e}")

    # 2. Parse dataset inline (no Cloud Tasks dependency for local dev)
    try:
        df, profile = dataset_parser.parse(str(file_path))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse file: {str(e)}")

    # 3. Cache DataFrame for downstream use (schema suggestions, audits)
    _datastore_cache[dataset_id] = {
        "df": df,
        "metadata": {
            "id": dataset_id,
            "filename": file.filename,
            "file_path": str(file_path),
            "gs_url": gs_url,
            "domain": domain,
            "status": "READY",
            "profile": profile,
        }
    }

    # 4. Store metadata in Firestore (graceful fallback)
    doc_data = {
        "id": dataset_id,
        "filename": file.filename,
        "file_path": str(file_path),
        "gs_url": gs_url,
        "domain": domain,
        "status": "READY",
        "profile": profile,
    }
    try:
        doc_ref = db.collection("organizations").document(org_id).collection("datasets").document(dataset_id)
        doc_ref.set(doc_data)
    except Exception as e:
        print(f"[Firestore] Dataset metadata save skipped: {e}")

    return {
        "status": "ready",
        "dataset_id": dataset_id,
        "filename": file.filename,
        "row_count": profile["row_count"],
        "column_count": profile["column_count"],
        "column_names": profile["column_names"],
        "sample_data": profile["sample_data"],
    }

@router.get("/datasets/{dataset_id}/status")
async def get_dataset_status(
    dataset_id: str,
    user: Dict[str, Any] = Depends(get_optional_user),
    db = Depends(get_db)
):
    org_id = user.get("current_org_id", "demo-org")
    try:
        doc_ref = db.collection("organizations").document(org_id).collection("datasets").document(dataset_id)
        doc = doc_ref.get()
        if doc.exists:
            data = doc.to_dict()
            if data.get("status") == "READY":
                return {
                    "status": "READY",
                    "dataset_id": dataset_id,
                    "filename": data["filename"],
                    "row_count": data["profile"]["row_count"],
                    "column_count": data["profile"]["column_count"],
                    "column_names": data["profile"]["column_names"],
                    "sample_data": data["profile"]["sample_data"],
                }
            elif data.get("status") == "FAILED":
                return {"status": "FAILED", "error": data.get("error")}
            else:
                return {"status": "PROCESSING"}
    except Exception:
        pass
        
    return {"status": "PROCESSING"}

@router.get("/datasets/{dataset_id}/schema-suggestions")
async def get_schema_suggestions(
    dataset_id: str, 
    user: Dict[str, Any] = Depends(get_optional_user),
    db = Depends(get_db)
):
    org_id = user.get("current_org_id", "demo-org")
    
    # Try Firestore first, fallback to local cache
    ds = None
    try:
        doc_ref = db.collection("organizations").document(org_id).collection("datasets").document(dataset_id)
        doc = doc_ref.get()
        if doc.exists:
            ds = doc.to_dict()
    except Exception:
        pass
    
    # Fallback to local cache
    if not ds and dataset_id in _datastore_cache:
        ds = _datastore_cache[dataset_id]["metadata"]
    
    if not ds:
        raise HTTPException(status_code=404, detail="Dataset not found")
        
    profile = ds["profile"]

    # Ingestion Agent
    schema = ingestion_agent.suggest_schema(
        column_names=profile["column_names"],
        column_stats=profile["column_stats"],
        sample_data=profile["sample_data"],
        domain=ds.get("domain", "other"),
    )

    # Proxy Detection (fetch df from cache)
    if dataset_id in _datastore_cache:
        df = _datastore_cache[dataset_id]["df"]
        from api.services.proxy_detector import proxy_detector
        from api.agents.proxy_agent import proxy_agent
        
        if schema.protected_attributes and schema.valid_factors:
            proxies = proxy_detector.detect_proxies(
                df=df,
                protected_cols=schema.protected_attributes,
                valid_factor_cols=schema.valid_factors,
            )
            
            # Use Gemini to generate semantic explanations for the detected proxies
            domain = ds.get("domain", "other") if ds else "other"
            proxies_with_explanations = proxy_agent.explain_proxies(proxies, domain=domain)
            
            schema.proxy_warnings = proxies_with_explanations

    return {
        "dataset_id": dataset_id,
        "schema_map": schema.model_dump(),
        "column_stats": profile["column_stats"],
    }

def get_dataset_store():
    # Keep this method for audits.py compatibility
    return _datastore_cache
