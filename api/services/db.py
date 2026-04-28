import os
import firebase_admin
from firebase_admin import credentials, firestore, auth, storage
from fastapi import HTTPException, Security, Depends
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

async def get_current_user(credentials: HTTPAuthorizationCredentials = Security(security)) -> Dict[str, Any]:
    if not credentials:
        raise HTTPException(status_code=401, detail="Missing authentication token")
    token = credentials.credentials
    try:
        decoded_token = auth.verify_id_token(token)
        return decoded_token
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid authentication token: {str(e)}")

# Fallback for dev ease. Will bypass auth if token is EXACTLY "DEV_MOCK_TOKEN"
async def get_optional_user(credentials: HTTPAuthorizationCredentials = Security(security)) -> Dict[str, Any]:
    if not credentials:
        return {"uid": "mock-dev-user", "email": "dev@example.com"}
    if credentials.credentials == "DEV_MOCK_TOKEN":
        return {"uid": "mock-dev-user", "email": "dev@example.com"}
    return await get_current_user(credentials)
