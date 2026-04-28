import firebase_admin
from firebase_admin import credentials, firestore

if not firebase_admin._apps:
    cred = credentials.Certificate('api/firebase-adminsdk.json')
    firebase_admin.initialize_app(cred)

db = firestore.client()

# Check datasets
print("=== DATASETS ===")
datasets = db.collection('organizations').document('demo-org').collection('datasets').stream()
ds_list = []
for ds in datasets:
    data = ds.to_dict()
    ds_list.append(ds.id)
    print(f"  {ds.id} | domain={data.get('domain')} | file={data.get('filename')} | created={data.get('created_at')}")

print(f"\nTotal datasets: {len(ds_list)}")
