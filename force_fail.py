import firebase_admin
from firebase_admin import credentials, firestore

if not firebase_admin._apps:
    cred = credentials.Certificate('api/firebase-adminsdk.json')
    firebase_admin.initialize_app(cred)

db = firestore.client()
audits = db.collection('organizations').document('demo-org').collection('audits').where('status', '==', 'running').stream()

for audit in audits:
    print(f"Failing audit {audit.id}")
    audit.reference.update({'status': 'failed', 'error': 'Audit stalled (server restart)'})

print("Done")
