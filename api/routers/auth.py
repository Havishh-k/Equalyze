"""
Equalyze — Auth Router
Demo login endpoint + role management.
Layers RBAC on top of Firebase Auth.
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Dict, Any
import firebase_admin.auth as fb_auth

from api.services.db import get_db, get_optional_user

router = APIRouter()

# ── Demo Users ────────────────────────────────────────
# Pre-configured accounts for presentation/demo use.
# In production, roles are managed via Firestore user profiles.

DEMO_USERS = {
    "datascientist@equalyze.io": {
        "password": "demo123",
        "role": "DATA_SCIENTIST",
        "name": "Arjun Mehta",
    },
    "compliance@equalyze.io": {
        "password": "demo123",
        "role": "COMPLIANCE_OFFICER",
        "name": "Priya Sharma",
    },
    "dataengineer@equalyze.io": {
        "password": "demo123",
        "role": "DATA_ENGINEER",
        "name": "Ravi Nair",
    },
}


class DemoLoginRequest(BaseModel):
    email: str
    password: str


class RoleResponse(BaseModel):
    uid: str
    email: str
    role: str
    name: str


@router.post("/auth/demo-login")
async def demo_login(req: DemoLoginRequest, db=Depends(get_db)):
    """
    Demo login endpoint. Creates Firebase custom token for the 3 demo accounts.
    This allows demo presentations without requiring real Firebase password setup.

    Flow:
    1. Validate demo credentials
    2. Ensure Firebase user exists (create if needed)
    3. Set role in Firestore user profile
    4. Return Firebase custom token (frontend uses signInWithCustomToken)
    """
    demo = DEMO_USERS.get(req.email)
    if not demo or demo["password"] != req.password:
        raise HTTPException(status_code=401, detail="Invalid demo credentials")

    # Ensure Firebase Auth user exists
    try:
        fb_user = fb_auth.get_user_by_email(req.email)
    except fb_auth.UserNotFoundError:
        # Create the demo user in Firebase Auth
        fb_user = fb_auth.create_user(
            email=req.email,
            password=req.password,
            display_name=demo["name"],
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Firebase error: {str(e)}")

    # Set role in Firestore
    try:
        db.collection("users").document(fb_user.uid).set(
            {
                "email": req.email,
                "displayName": demo["name"],
                "role": demo["role"],
            },
            merge=True,
        )
    except Exception as e:
        print(f"[Auth] Firestore role set skipped: {e}")

    # Generate custom token
    try:
        custom_token = fb_auth.create_custom_token(
            fb_user.uid,
            {"role": demo["role"], "name": demo["name"]},
        )
        return {
            "custom_token": custom_token.decode() if isinstance(custom_token, bytes) else custom_token,
            "uid": fb_user.uid,
            "role": demo["role"],
            "name": demo["name"],
            "email": req.email,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Token generation failed: {str(e)}")


@router.get("/auth/role", response_model=RoleResponse)
async def get_user_role(
    user: Dict[str, Any] = Depends(get_optional_user),
    db=Depends(get_db),
):
    """
    Returns the current user's role from Firestore.
    Falls back to DATA_SCIENTIST if no role is set.
    """
    uid = user.get("uid", "")
    email = user.get("email", "")

    role = "DATA_SCIENTIST"  # default
    name = email.split("@")[0] if email else "User"

    # Check demo mapping
    demo = DEMO_USERS.get(email)
    if demo:
        return RoleResponse(uid=uid, email=email, role=demo["role"], name=demo["name"])

    # Check Firestore
    try:
        user_doc = db.collection("users").document(uid).get()
        if user_doc.exists:
            data = user_doc.to_dict()
            role = data.get("role", role)
            name = data.get("displayName", name)
    except Exception:
        pass

    return RoleResponse(uid=uid, email=email, role=role, name=name)
