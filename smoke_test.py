import requests
import json
import time

BASE_URL = "https://equalyze-backend-1085178935109.us-central1.run.app/api/v1"

def print_result(name, res):
    status = "✅ PASS" if res.status_code in [200, 201] else f"❌ FAIL ({res.status_code})"
    print(f"{status} | {name.ljust(30)} | {res.elapsed.total_seconds():.3f}s")
    if res.status_code >= 400:
        print(f"       Error: {res.text}")

print("=== Equalyze Enterprise End-to-End Smoke Test ===\n")

# 1. Health Check
res = requests.get(f"https://equalyze-backend-1085178935109.us-central1.run.app/health")
print_result("System Health Check", res)

# 2. Auth (Demo Login)
auth_data = {"email": "datascientist@equalyze.io", "password": "demo123"}
res = requests.post(f"{BASE_URL}/auth/demo-login", json=auth_data)
print_result("Auth: Demo Login", res)

token = ""
if res.status_code == 200:
    token = res.json().get("custom_token")

headers = {"Authorization": f"Bearer {token}"} if token else {}

# 3. Datasets (List)
res = requests.get(f"{BASE_URL}/datasets/", headers=headers)
print_result("Datasets: List", res)

# 4. Audits (List)
res = requests.get(f"{BASE_URL}/audits/", headers=headers)
print_result("Audits: List", res)

# 5. Organizations (List)
res = requests.get(f"{BASE_URL}/organizations/", headers=headers)
print_result("Organizations: List", res)

# 6. Monitoring (Status)
res = requests.get(f"{BASE_URL}/monitoring/status", headers=headers)
print_result("Monitoring: Status", res)

# 7. Unauthenticated Access Test (should return 401 or 403, demonstrating security)
res = requests.get(f"{BASE_URL}/audits/")
security_status = "✅ PASS (Blocked)" if res.status_code in [401, 403] else f"❌ FAIL (Allowed: {res.status_code})"
print(f"{security_status} | Security: Unauthenticated Access Blocked | {res.elapsed.total_seconds():.3f}s")

print("\nSmoke Test Complete.")
