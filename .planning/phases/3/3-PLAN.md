---
phase: 3
status: completed
title: BigQuery Immutable Audit Log
---

<objective>
Establish tamper-evident audit trail for ISO/IEC 42001 compliance.
</objective>

<steps>
1. **BigQuery Logger**: Create `api/services/bigquery_logger.py` to handle the serialization of finding JSON, calculating the SHA-256 hash, and writing to an append-only BigQuery table. *(Since local testing may not have GCP credentials, provide a mock fallback that just logs to a local file for dev purposes).*
2. **Orchestrator Injection**: Update `api/agents/orchestrator.py`. When an audit completes, log the final state to BigQuery via the `bigquery_logger.py` service. Include the generated hash in the Audit object/response.
3. **Audit Router Updates**: 
   - Update `api/routers/audits.py` to log remediation attempts (when an audit is modified or closed).
   - Add a new endpoint `GET /audits/{audit_id}/verify-integrity` which takes an audit ID and verifies its current local hash against the stored hash in the BigQuery (or mocked) log.
4. **Frontend Integration**: Update the frontend (`app/dashboard/audits/[id]/page.tsx` or similar) to include a "Verify Integrity" badge/button that calls the new verification endpoint and displays ✅ or ❌.
</steps>
