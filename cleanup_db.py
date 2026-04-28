import firebase_admin
from firebase_admin import credentials, firestore

if not firebase_admin._apps:
    cred = credentials.Certificate('api/firebase-adminsdk.json')
    firebase_admin.initialize_app(cred)

db = firestore.client()

# Delete all orphan datasets
datasets = db.collection('organizations').document('demo-org').collection('datasets').stream()
count = 0
for ds in datasets:
    print(f"Deleting dataset {ds.id}")
    ds.reference.delete()
    count += 1

print(f"\nDeleted {count} orphan datasets.")

# Also delete the stalled audit
audit_ref = db.collection('organizations').document('demo-org').collection('audits').document('b0c6cf4c-6320-4bf7-ac51-dc50e34f7ab2')
audit_ref.delete()
print("Deleted stalled audit b0c6cf4c.")
