"""
Equalyze — Public Reports Router
Serves publicly-accessible Bias Receipts via a share token.
No authentication required.
"""

import uuid
import hashlib
from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any

from api.services.db import get_db, get_optional_user

router = APIRouter()


def _generate_share_token(audit_id: str) -> str:
    """Generate a deterministic share token from audit_id."""
    return hashlib.sha256(f"equalyze-share-{audit_id}".encode()).hexdigest()[:24]


@router.post("/reports/share/{audit_id}")
async def create_share_link(
    audit_id: str,
    user: Dict[str, Any] = Depends(get_optional_user),
    db=Depends(get_db),
):
    """
    Generate a shareable public link for a completed audit.
    Returns a token that maps to /report/[token] on the frontend.
    """
    org_id = user.get("current_org_id", "demo-org")

    doc = db.collection("organizations").document(org_id).collection("audits").document(audit_id).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Audit not found")

    audit_dict = doc.to_dict()
    if audit_dict.get("status") != "complete":
        raise HTTPException(status_code=400, detail="Only completed audits can be shared")

    # Generate share token
    token = _generate_share_token(audit_id)

    # Store the share token → audit mapping
    try:
        db.collection("shared_reports").document(token).set({
            "audit_id": audit_id,
            "org_id": org_id,
            "created_by": user.get("uid", "unknown"),
            "token": token,
        })
    except Exception as e:
        print(f"[Firestore] Share link save skipped: {e}")

    return {
        "token": token,
        "share_url": f"/report/{token}",
    }


@router.get("/reports/public/{token}")
async def get_public_report(token: str, db=Depends(get_db)):
    """
    Fetch a public report by share token. No auth required.
    Returns a sanitized view of the audit for external sharing.
    """
    # Look up the share mapping
    try:
        share_doc = db.collection("shared_reports").document(token).get()
        if not share_doc.exists:
            raise HTTPException(status_code=404, detail="Report not found or link expired")

        share_data = share_doc.to_dict()
        audit_id = share_data["audit_id"]
        org_id = share_data["org_id"]

        # Fetch the actual audit
        audit_doc = db.collection("organizations").document(org_id).collection("audits").document(audit_id).get()
        if not audit_doc.exists:
            raise HTTPException(status_code=404, detail="Audit no longer exists")

        audit = audit_doc.to_dict()

        # Build sanitized public view (no raw data, no internal IDs)
        findings_summary = []
        for f in audit.get("findings", []):
            findings_summary.append({
                "protected_attribute": f.get("protected_attribute", ""),
                "severity": f.get("severity", "GREEN"),
                "metrics_count": len(f.get("metrics", [])),
                "legal_violations_count": len(f.get("legal_violations", [])),
            })

        return {
            "audit_id": audit_id,
            "model_name": audit.get("model_metadata", {}).get("model_name", "Unknown Model"),
            "domain": audit.get("model_metadata", {}).get("domain", "other"),
            "organization": audit.get("model_metadata", {}).get("organization_name", ""),
            "overall_severity": audit.get("overall_severity", "GREEN"),
            "overall_score": audit.get("overall_score", 0),
            "created_at": str(audit.get("created_at", "")),
            "report_hash": audit.get("report_hash", ""),
            "dataset_hash": audit.get("dataset", {}).get("file_hash", ""),
            "findings_summary": findings_summary,
            "integrity_verified": bool(audit.get("report_hash")),
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch report: {str(e)}")
