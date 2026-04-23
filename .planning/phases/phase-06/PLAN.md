# Phase 6 Plan — Privacy & Security Foundation

## Objective
Implement Google Cloud DLP and BigQuery Ledger for enterprise-grade privacy and immutable auditing.

## Tasks

### Wave 1: GCS & DLP Setup
- [x] Create `functions/dlp_scan/main.py` — Cloud Function template for GCS trigger.
- [x] Implement DLP API call to scan first 1000 rows.
- [x] Implement masking logic for identified PII columns.
- [x] Move cleaned data to "Safe Processing" bucket.

### Wave 2: BigQuery Ledger
- [x] Create `api/services/bigquery_logger.py`.
- [x] Define BigQuery schema (Timestamp, OrgID, UserID, Action, DatasetHash, FindingsHash).
- [x] Implement append-only logic for `audit_logs` table.

## Next Steps
Phase 6 completed. Proceed to Phase 7.
