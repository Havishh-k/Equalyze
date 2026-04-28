import firebase_admin
from firebase_admin import credentials, firestore
import datetime

if not firebase_admin._apps:
    cred = credentials.Certificate('api/firebase-adminsdk.json')
    firebase_admin.initialize_app(cred)

db = firestore.client()
audits = db.collection('organizations').document('demo-org').collection('audits').where('status', '==', 'running').stream()

for audit in audits:
    data = audit.to_dict()
    updated_at = data.get('updated_at')
    print(f"Audit {audit.id}: {data.get('status')} - Last Updated: {updated_at}")
    
    # If the audit has been running for a while without updates (e.g. server restarted), let's mark it as failed
    now = datetime.datetime.now(datetime.timezone.utc)
    # The updated_at is a string like "2026-04-26T14:14:30.123456"
    # Or just an ISO string.
    try:
        updated_dt = datetime.datetime.fromisoformat(updated_at.replace("Z", "+00:00")) if updated_at else datetime.datetime.fromisoformat(data.get("created_at").replace("Z", "+00:00"))
        if (now - updated_dt).total_seconds() > 300: # 5 minutes
            print(f"Audit {audit.id} is stalled. Marking as failed.")
            audit.reference.update({'status': 'failed', 'error': 'Audit stalled (server restart or error)'})
    except Exception as e:
        print(f"Could not parse date or update: {e}")

print("Check complete.")
