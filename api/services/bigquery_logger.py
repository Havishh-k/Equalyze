import os
import datetime
from google.cloud import bigquery
from pydantic import BaseModel
from typing import Dict, Any, Optional

PROJECT_ID = os.environ.get("GCP_PROJECT", "equalyze-dev")
DATASET_ID = "equalyze_audit"
TABLE_ID = "audit_logs"

class AuditLogEntry(BaseModel):
    org_id: str
    user_id: str
    action: str
    resource_id: str
    dataset_hash: str
    findings_hash: Optional[str] = None
    metadata: Dict[str, Any] = {}
    resolution_events: list[Dict[str, Any]] = []

class BigQueryLogger:
    def __init__(self):
        # In local dev, we might not have GCP credentials
        try:
            self.client = bigquery.Client(project=PROJECT_ID)
            self._ensure_table_exists()
        except Exception as e:
            print(f"Warning: BigQuery initialization failed. Running in mock mode. Error: {e}")
            self.client = None

    def _ensure_table_exists(self):
        """Ensures the dataset and table exist for immutable audit logging."""
        if not self.client: return
        
        dataset_ref = self.client.dataset(DATASET_ID)
        try:
            self.client.get_dataset(dataset_ref)
        except Exception:
            dataset = bigquery.Dataset(dataset_ref)
            dataset.location = "US"
            self.client.create_dataset(dataset, timeout=30)
            
        table_ref = dataset_ref.table(TABLE_ID)
        try:
            self.client.get_table(table_ref)
        except Exception:
            schema = [
                bigquery.SchemaField("timestamp", "TIMESTAMP", mode="REQUIRED"),
                bigquery.SchemaField("org_id", "STRING", mode="REQUIRED"),
                bigquery.SchemaField("user_id", "STRING", mode="REQUIRED"),
                bigquery.SchemaField("action", "STRING", mode="REQUIRED"),
                bigquery.SchemaField("resource_id", "STRING", mode="REQUIRED"),
                bigquery.SchemaField("dataset_hash", "STRING", mode="REQUIRED"),
                bigquery.SchemaField("findings_hash", "STRING", mode="NULLABLE"),
                bigquery.SchemaField("metadata", "JSON", mode="NULLABLE"),
                bigquery.SchemaField("resolution_events", "RECORD", mode="REPEATED", fields=[
                    bigquery.SchemaField("anomaly_timestamp", "TIMESTAMP", mode="REQUIRED"),
                    bigquery.SchemaField("reviewer_1_uid", "STRING", mode="REQUIRED"),
                    bigquery.SchemaField("reviewer_2_uid", "STRING", mode="REQUIRED"),
                    bigquery.SchemaField("action_taken", "STRING", mode="REQUIRED"),
                ]),
            ]
            table = bigquery.Table(table_ref, schema=schema)
            # Enforce append-only (not natively possible on table creation without specific IAM policies,
            # but standard practice is restricting DELETE/UPDATE privileges on this dataset)
            self.client.create_table(table, timeout=30)

    def log_action(self, entry: AuditLogEntry) -> bool:
        """Appends a new immutable record to the BigQuery ledger."""
        if not self.client:
            print(f"[MOCK BQ] Logged: {entry.action} for {entry.resource_id}")
            return True
            
        table_ref = self.client.dataset(DATASET_ID).table(TABLE_ID)
        
        row_to_insert = [
            {
                "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
                "org_id": entry.org_id,
                "user_id": entry.user_id,
                "action": entry.action,
                "resource_id": entry.resource_id,
                "dataset_hash": entry.dataset_hash,
                "findings_hash": entry.findings_hash,
                "metadata": entry.metadata,
                "resolution_events": entry.resolution_events,
            }
        ]
        
        errors = self.client.insert_rows_json(table_ref, row_to_insert)
        
        if errors:
            print(f"BigQuery Insert Errors: {errors}")
            # Real enterprise implementation would queue to a DLQ here
            return False
            
        return True

# Singleton instance
bq_logger = BigQueryLogger()
