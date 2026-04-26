import urllib.request, json, time

req = urllib.request.Request('http://localhost:8000/api/v1/datasets/upload', method='POST')
req.add_header('Content-Type', 'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW')
body = b'------WebKitFormBoundary7MA4YWxkTrZu0gW\r\nContent-Disposition: form-data; name="file"; filename="test.csv"\r\nContent-Type: text/csv\r\n\r\nage,gender,outcome\n25,M,1\n35,F,0\n\r\n------WebKitFormBoundary7MA4YWxkTrZu0gW--\r\n'
res = urllib.request.urlopen(req, data=body)
ds = json.loads(res.read())
print('Dataset:', ds)

req = urllib.request.Request('http://localhost:8000/api/v1/audits', method='POST')
req.add_header('Content-Type', 'application/json')
data = {
    'dataset_id': ds['dataset_id'],
    'schema_map': {
        'protected_attributes': ['gender'],
        'valid_factors': ['age'],
        'outcome': 'outcome',
        'proxy_warnings': [],
        'column_tags': []
    },
    'model_metadata': {
        'organization_name': 'Test',
        'model_name': 'Test Model',
        'domain': 'healthcare',
        'model_type': 'classification',
        'jurisdiction': ['us']
    }
}
res = urllib.request.urlopen(req, data=json.dumps(data).encode())
audit = json.loads(res.read())
print('Audit:', audit)

time.sleep(5)
req = urllib.request.Request(f'http://localhost:8000/api/v1/audits/{audit["audit_id"]}/status')
res = urllib.request.urlopen(req)
status = json.loads(res.read())
print('Status:', status)
