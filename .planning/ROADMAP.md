# Roadmap — Equalyze Enterprise Implementation Plan

## Execution Strategy
Build a secure, scalable B2B SaaS platform on Google Cloud across four distinct phases: Privacy, Scale, Intelligence, and Ecosystem.

---

## Phase 6 — Privacy & Security Foundation
**Goal:** Implement absolute data privacy and a tamper-proof audit trail.
**Touches:** `functions/dlp_scan`, `api/services/bigquery_logger.py`

### Scope
- **Google Cloud DLP Integration:** Create GCS buckets for raw uploads and "Safe Processing". Cloud Function triggers on upload, calls DLP API, samples first 1,000 rows to identify PII, and applies blanket mask to specific columns for cost control.
- **BigQuery Ledger Setup:** Provision BigQuery dataset, define `audit_logs` schema, and implement backend logic for immutable logging of actions and findings.

---

## Phase 7 — Asynchronous Scalability
**Goal:** Decouple the frontend from heavy ML processing using Cloud Tasks and Cloud Run.
**Touches:** `api/routers/audits.py`, `worker/`, frontend monitoring

### Scope
- **Decouple FastAPI Backend:** Refactor `POST /datasets/upload` to immediately return HTTP 202 with a `job_id`.
- **Implement Cloud Tasks:** Configure queue with Dead-Letter Queue (DLQ) for failed jobs (e.g., malformed CSVs). Enqueue processing jobs on dataset upload.
- **Deploy Cloud Run Workers:** Create a separate Docker container for background processing to execute Pandas/Numpy deterministic math and update Firestore.
- **Real-Time UI Updates:** Implement WebSockets or SSE for real-time Next.js updates.

---

## Phase 8 — Hardened AI & Dynamic Governance
**Goal:** Eradicate hallucinations with LLM-as-a-Judge and dynamic RAG.
**Touches:** `api/agents/twin_engine_agent.py`, `api/agents/governance_agent.py`, `api/services/legal_vector_store.py`

### Scope
- **The LLM-as-a-Judge Pipeline:** Refactor Twin Generator: Gemini 2.0 Pro generates twins, Gemini 1.5 Flash validates deterministically by checking against original dataset mean/std-dev (hard fail if outside 2-sigma variance).
- **Dynamic Legal Vector Database:** Provision Vertex AI Vector Search. Automated script pulls regulatory texts weekly, embeds them, and updates the index. Update Governance Agent to query dynamically.

---

## Phase 9 — Ecosystem Integration & The "Moat"
**Goal:** Embed Equalyze into engineering culture via SDK and CI/CD.
**Touches:** `sdk/python/equalyze`, CI/CD templates

### Scope
- **Develop Python SDK:** Build pip-installable library with `equalyze.audit()` connecting securely to the backend. Include native exits (`sys.exit(1)`) on DIR < 0.80.
- **CI/CD Pipeline Blockers:** Create pre-configured GitHub Actions and Jenkins templates for automated gatekeeping.
- **Polish Cognitive Forcing UI:** Finalize Next.js Article 14 mandatory acknowledgments for exports.

---

## Phase Summary

| Phase | Description | Risk |
|-------|-------------|------|
| 6 | Privacy & Security Foundation | Medium — requires GCP setup |
| 7 | Asynchronous Scalability | High — architectural refactor |
| 8 | Hardened AI & Dynamic Governance | Medium — multi-LLM orchestration |
| 9 | Ecosystem Integration | Low — standalone SDK |

---
*Last updated: 2026-04-23*
