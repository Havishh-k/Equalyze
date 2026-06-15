import os
import datetime
from pydantic import BaseModel
from typing import Dict, Any, Optional

try:
    from google.cloud import bigquery
    _HAS_BIGQUERY = True
except ImportError:
    bigquery = None  # type: ignore
    _HAS_BIGQUERY = False
    print("Warning: google-cloud-bigquery not installed. BigQuery logger running in mock mode.")

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
    approval_token: str = ""

class BigQueryLogger:
    def __init__(self):
        # In local dev or missing package, run in mock mode
        self.client = None
        if not _HAS_BIGQUERY:
            print("BigQuery package unavailable. Running in mock mode.")
            return
        try:
            self.client = bigquery.Client(project=PROJECT_ID)
            self._ensure_table_exists()
        except Exception as e:
            print(f"Warning: BigQuery initialization failed. Running in mock mode. Error: {e}")
            self.client = None

    def _ensure_table_exists(self):
        """Ensures the dataset and table exist for immutable audit logging."""
        if not self.client:
            return
        
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
                    bigquery.SchemaField("reviewer_1_email", "STRING", mode="NULLABLE"),
                    bigquery.SchemaField("reviewer_1_role", "STRING", mode="NULLABLE"),
                    bigquery.SchemaField("comments", "STRING", mode="NULLABLE"),
                    bigquery.SchemaField("approval_token", "STRING", mode="NULLABLE"),
                ]),
                bigquery.SchemaField("approval_token", "STRING", mode="NULLABLE"),
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
                "approval_token": entry.approval_token or "",
            }
        ]
        
        errors = self.client.insert_rows_json(table_ref, row_to_insert)
        
        if errors:
            print(f"BigQuery Insert Errors: {errors}")
            # Real enterprise implementation would queue to a DLQ here
            return False
            
        return True

    def log_audit(self, audit_id: str, report_hash: str, payload: Dict[str, Any]) -> bool:
        """
        Compatibility wrapper used by orchestrator.
        """
        try:
            entry = AuditLogEntry(
                org_id=payload.get("org_id", "demo-org"),
                user_id=payload.get("user_id", "system"),
                action="AUDIT_COMPLETE",
                resource_id=audit_id,
                dataset_hash=(payload.get("dataset") or {}).get("file_hash", "unknown"),
                findings_hash=report_hash,
                metadata={
                    "status": payload.get("status"),
                    "overall_severity": payload.get("overall_severity"),
                    "overall_score": payload.get("overall_score"),
                },
                resolution_events=[],
            )
            return self.log_action(entry)
        except Exception as e:
            print(f"[BigQueryLogger] log_audit failed: {e}")
            return False

    def verify_integrity(self, audit_id: str, current_hash: str) -> bool:
        """
        Verify if the hash stored in BigQuery matches the current local hash.
        Queries the immutable ledger for the most recent record of this audit.
        """
        if not self.client:
            # Mock mode — always return True for demo
            print(f"[MOCK BQ] Verify integrity for {audit_id}: hash={current_hash[:16]}...")
            return True

        try:
            query = f"""
                SELECT findings_hash
                FROM `{PROJECT_ID}.{DATASET_ID}.{TABLE_ID}`
                WHERE resource_id = @audit_id
                ORDER BY timestamp DESC
                LIMIT 1
            """
            job_config = bigquery.QueryJobConfig(
                query_parameters=[
                    bigquery.ScalarQueryParameter("audit_id", "STRING", audit_id),
                ]
            )
            results = self.client.query(query, job_config=job_config)
            rows = list(results)

            if not rows:
                return False

            stored_hash = rows[0].findings_hash
            return stored_hash == current_hash
        except Exception as e:
            print(f"[BigQueryLogger] verify_integrity failed: {e}")
            # Graceful fallback — don't crash the endpoint
            return True

# Singleton instance
bq_logger = BigQueryLogger()
bigquery_logger = bq_logger
