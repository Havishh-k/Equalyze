import os
import sys
import time
import requests

class EqualyzeSDK:
    def __init__(self, api_key: str, base_url: str = "http://localhost:8000"):
        self.api_key = api_key
        self.base_url = base_url
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

    def upload_dataset(self, file_path: str) -> str:
        """Uploads a dataset and returns the dataset_id."""
        url = f"{self.base_url}/api/v1/datasets/upload"
        with open(file_path, "rb") as f:
            files = {"file": f}
            # For file uploads, we don't set Content-Type in headers so requests sets multipart/form-data
            headers = {"Authorization": f"Bearer {self.api_key}"}
            print(f"Uploading dataset {file_path}...")
            response = requests.post(url, files=files, headers=headers)
        
        if response.status_code not in (200, 202):
            print(f"Failed to upload dataset: {response.text}")
            sys.exit(1)
            
        data = response.json()
        print(f"Upload initiated. Dataset ID: {data.get('dataset_id')}")
        return data.get("dataset_id")

    def run_audit(self, dataset_id: str, protected_attributes: list, threshold: float = 0.8) -> dict:
        """Runs a fairness audit on a dataset."""
        url = f"{self.base_url}/api/v1/audits/new"
        payload = {
            "dataset_id": dataset_id,
            "protected_attributes": protected_attributes
        }
        print(f"Initiating audit for dataset {dataset_id}...")
        response = requests.post(url, json=payload, headers=self.headers)
        
        if response.status_code not in (200, 202):
            print(f"Failed to initiate audit: {response.text}")
            sys.exit(1)
            
        data = response.json()
        audit_id = data.get("audit_id")
        
        # Wait for audit to complete
        return self._wait_for_audit(audit_id, threshold)

    def _wait_for_audit(self, audit_id: str, threshold: float, timeout_sec: int = 300) -> dict:
        url = f"{self.base_url}/api/v1/audits/{audit_id}"
        start_time = time.time()
        
        while time.time() - start_time < timeout_sec:
            response = requests.get(url, headers=self.headers)
            if response.status_code == 200:
                data = response.json()
                status = data.get("status", "").upper()
                if status == "COMPLETE":
                    print(f"Audit {audit_id} completed successfully.")
                    
                    # Validate fairness
                    overall_score = data.get("overall_score", 0)
                    overall_severity = data.get("overall_severity", "GREEN")
                    
                    # Extract advanced metrics including Equalized Odds and DIR
                    failures = []
                    for finding in data.get("findings", []):
                        for metric in finding.get("metrics", []):
                            metric_name = metric.get("metric_name", "")
                            value = metric.get("value", 0)
                            severity = metric.get("severity", "GREEN")
                            
                            # Equalized Odds (TPR/FPR parities) or standard DIR
                            if severity in ["AMBER", "RED"]:
                                failures.append(f"Protected Attribute [{finding.get('protected_attribute')}]: {metric_name} = {value} ({severity})")
                    
                    if overall_score < threshold or failures:
                        print(f"CI/CD GATE FAILED: Fairness score {overall_score} is below threshold {threshold}")
                        if failures:
                            print("Metric threshold breaches detected (including Equalized Odds violations):")
                            for f in failures:
                                print(f"  - {f}")
                        sys.exit(1)
                    else:
                        print(f"CI/CD GATE PASSED: Fairness score {overall_score} meets threshold {threshold} with no severe metric breaches.")
                        return data
                elif status == "FAILED":
                    print(f"Audit {audit_id} failed: {data.get('error')}")
                    sys.exit(1)
                
                print("Audit in progress... waiting 5 seconds.")
            else:
                print(f"Failed to poll audit status: {response.status_code}")
            
            time.sleep(5)
            
        print(f"Audit {audit_id} timed out after {timeout_sec} seconds.")
        sys.exit(1)

def run_cicd_gate():
    # Example usage for CI/CD
    api_key = os.environ.get("EQUALYZE_API_KEY", "test_key")
    file_path = os.environ.get("DATASET_PATH", "data.csv")
    
    if not os.path.exists(file_path):
        print(f"Dataset {file_path} not found.")
        sys.exit(1)

    sdk = EqualyzeSDK(api_key=api_key)
    dataset_id = sdk.upload_dataset(file_path)
    
    # Wait for dataset to be processed
    time.sleep(10) # Simple wait for dataset to parse before audit
    
    # Running audit evaluating demographic parity, equalized odds and others automatically
    sdk.run_audit(dataset_id=dataset_id, protected_attributes=["age", "gender"], threshold=0.85)

if __name__ == "__main__":
    run_cicd_gate()
