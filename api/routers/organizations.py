from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, Any, List
from pydantic import BaseModel
from api.services.db import get_current_user, get_db

router = APIRouter()

class OrganizationCreate(BaseModel):
    name: str

@router.post("/orgs")
async def create_organization(
    org: OrganizationCreate,
    user: Dict[str, Any] = Depends(get_current_user),
    db = Depends(get_db)
):
    uid = user.get("uid")
    if not uid:
        raise HTTPException(status_code=401, detail="User ID not found")
        
    doc_ref = db.collection("organizations").document()
    org_data = {
        "id": doc_ref.id,
        "name": org.name,
        "owner_id": uid,
        "members": [uid]
    }
    doc_ref.set(org_data)
    
    # Also update user's profile with their new org
    user_ref = db.collection("users").document(uid)
    user_ref.set({"current_org_id": doc_ref.id}, merge=True)
    
    return org_data

@router.get("/orgs/me")
async def get_my_organizations(
    user: Dict[str, Any] = Depends(get_current_user),
    db = Depends(get_db)
):
    uid = user.get("uid")
    orgs_query = db.collection("organizations").where("members", "array_contains", uid).stream()
    orgs = [doc.to_dict() for doc in orgs_query]
    return {"organizations": orgs}
