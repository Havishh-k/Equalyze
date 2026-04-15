import urllib.request, json, urllib.error
req = urllib.request.Request(
    'http://localhost:8000/api/v1/audits',
    data=b'{"dataset_id": "test", "schema_map": {"protected_attributes": [], "valid_factors": [], "outcome": ""}, "model_metadata": {"organization_name": "Test", "model_name": "Test", "domain": "healthcare", "model_type": "classification", "jurisdiction": ["india"]}}',
    headers={'Content-Type': 'application/json'}
)
try:
    urllib.request.urlopen(req)
except urllib.error.HTTPError as e:
    print(e.read().decode())
