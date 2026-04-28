import os
import requests
import json

PROJECT_ID = os.environ.get("GCP_PROJECT", "equalyze-dev")
REGION = "us-central1"
WORKER_URL = os.environ.get("WORKER_URL", "http://localhost:8001/task")

class CloudTasksClient:
    def __init__(self):
        self.mock_mode = os.environ.get("USE_MOCK_CLOUD_TASKS", "true").lower() == "true"

    def enqueue_dataset_parse(self, dataset_id: str, file_path: str, org_id: str, domain: str):
        """Enqueue task to parse dataset and generate schema."""
        payload = {
            "task_type": "parse_dataset",
            "dataset_id": dataset_id,
            "file_path": file_path,
            "org_id": org_id,
            "domain": domain
        }
        self._push_task("dataset-parse-queue", payload)

    def enqueue_audit_run(self, audit_id: str, org_id: str, dataset_id: str, schema_map: dict):
        """Enqueue task to run the heavy ML audit pipeline."""
        payload = {
            "task_type": "run_audit",
            "audit_id": audit_id,
            "org_id": org_id,
            "dataset_id": dataset_id,
            "schema_map": schema_map
        }
        self._push_task("audit-pipeline-queue", payload)

    def _push_task(self, queue_name: str, payload: dict):
        if self.mock_mode:
            print(f"[Cloud Tasks Mock] Pushing to {queue_name} -> {WORKER_URL}")
            try:
                # In mock mode, we trigger the local worker synchronously but ignore timeout
                # to simulate fire-and-forget
                requests.post(WORKER_URL, json=payload, timeout=0.5)
            except requests.exceptions.ReadTimeout:
                pass
            except Exception as e:
                print(f"[Cloud Tasks Mock] Worker unreachable: {e}. Is worker running on {WORKER_URL}?")
        else:
            # Real GCP Cloud Tasks implementation goes here
            print(f"Would publish to real GCP Cloud Tasks {queue_name}: {payload}")

cloud_tasks = CloudTasksClient()
