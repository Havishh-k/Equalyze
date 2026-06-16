import os
import firebase_admin
from firebase_admin import credentials, firestore, auth
from fastapi import HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Dict, Any
from pathlib import Path

# Path to the service account JSON
CREDENTIAL_PATH = str(Path(__file__).resolve().parent.parent / "firebase-adminsdk.json")

def initialize_firebase():
    if not firebase_admin._apps:
        if not os.path.exists(CREDENTIAL_PATH):
            print(f"WARNING: Firebase key not found at {CREDENTIAL_PATH}. Auth will fail.")
            return
        cred = credentials.Certificate(CREDENTIAL_PATH)
        firebase_admin.initialize_app(cred, {
            'storageBucket': 'equalyze-9ccfe.firebasestorage.app'
        })

initialize_firebase()

# Fastapi Dependency for DB
def get_db():
    return firestore.client()

security = HTTPBearer(auto_error=False)

DEMO_ROLE_MAP = {
    "datascientist@equalyze.io": "DATA_SCIENTIST",
    "compliance@equalyze.io": "COMPLIANCE_OFFICER",
    "dataengineer@equalyze.io": "DATA_ENGINEER",
}

def _resolve_role(decoded_token: Dict[str, Any], db_client=None) -> str:
    """Resolve user role from demo map → Firestore profile → default."""
    email = decoded_token.get("email", "")
    # Demo accounts
    demo_role = DEMO_ROLE_MAP.get(email)
    if demo_role:
        return demo_role
    # Firestore lookup
    if db_client:
        try:
            uid = decoded_token.get("uid", "")
            user_doc = db_client.collection("users").document(uid).get()
            if user_doc.exists and user_doc.to_dict().get("role"):
                return user_doc.to_dict()["role"]
        except Exception:
            pass
    return "DATA_SCIENTIST"

async def get_current_user(credentials: HTTPAuthorizationCredentials = Security(security)) -> Dict[str, Any]:
    if not credentials:
        raise HTTPException(status_code=401, detail="Missing authentication token")
    token = credentials.credentials
    try:
        decoded_token = auth.verify_id_token(token)
        # Attach resolved role
        try:
            db_client = firestore.client()
            decoded_token["role"] = _resolve_role(decoded_token, db_client)
            # Resolve org_id
            uid = decoded_token.get("uid", "")
            org_doc = db_client.collection("users").document(uid).get()
            if org_doc.exists:
                decoded_token["current_org_id"] = org_doc.to_dict().get("current_org_id", "demo-org")
            else:
                decoded_token["current_org_id"] = "demo-org"
        except Exception:
            decoded_token["role"] = _resolve_role(decoded_token)
            decoded_token.setdefault("current_org_id", "demo-org")
        return decoded_token
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid authentication token: {str(e)}")

# Fallback for dev ease. Will bypass auth if token is EXACTLY "DEV_MOCK_TOKEN"
async def get_optional_user(credentials: HTTPAuthorizationCredentials = Security(security)) -> Dict[str, Any]:
    if not credentials:
        return {"uid": "mock-dev-user", "email": "dev@example.com", "role": "DATA_SCIENTIST", "current_org_id": "demo-org"}
    if credentials.credentials == "DEV_MOCK_TOKEN":
        return {"uid": "mock-dev-user", "email": "dev@example.com", "role": "DATA_SCIENTIST", "current_org_id": "demo-org"}
    return await get_current_user(credentials)
