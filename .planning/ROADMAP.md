# Roadmap — Equalyze PRD v2.0 Milestone

## Execution Strategy (from /caveman review)
Build from the **data layer upwards**:
1. Legal Foundation → Deep Analytics Engine → Twin & Governance Agents → Async Remediation

---

## Phase 1 — Legal RAG Foundation
**Goal:** Replace hardcoded regulation prompts with a true vector search pipeline over actual statute text.
**Requires:** MH-1
**Touches:** `api/agents/governance_agent.py`, `api/services/` (new), `api/config.py`

### Scope
- Create `regulations/` directory with chunked markdown of EU AI Act, DPDPA 2023, ECOA, RBI Fair Practices Code, NIST AI 600-1
- Build `api/services/legal_vector_store.py` — FAISS index loader, embed chunks with Gemini embedding API, semantic search
- Refactor `GovernanceAgent` to query vector store instead of using hardcoded regulation text in prompts
- Domain selector dynamically filters which regulation chunks are searched (healthcare→HIPAA/FDA, fintech→ECOA/RBI)
- Update `api/config.py` with `REGULATIONS_DIR` path and embedding settings

### UAT
- [ ] Given a RED disparate impact finding in `fintech` domain, governance agent returns exact ECOA § 202.6 and RBI Para 3
- [ ] Given a healthcare finding, governance agent returns HIPAA 45 CFR 164 and EU AI Act Art. 10
- [ ] No hallucinated legal citations (every article exists in the source corpus)

---

## Phase 2 — Intersectional Deep-Dive
**Goal:** Detect and prove composite discrimination (e.g., Rural + Female) with dedicated twins.
**Requires:** MH-2
**Touches:** `api/agents/twin_engine_agent.py`, `api/services/fairness_metrics.py`, `api/models/audit.py`

### Scope
- Enhance `FairnessEvaluator._intersectional_analysis` to produce full `BiasMetric` objects (not just raw dicts)
- Add `FindingType.INTERSECTIONAL` handling in `TwinEngineAgent.analyze` — when intersectional disparity > threshold, generate a dedicated `Finding` with composite twin
- New prompt template `INTERSECTIONAL_TWIN_PROMPT` for Gemini Pro that isolates overlapping attributes
- Update severity scoring to weight intersectional findings appropriately

### UAT
- [ ] Running audit on `healthcare_insurance_biased.csv` produces a Finding for "Rural + Female" intersection
- [ ] The intersectional twin has a `discrimination_statement` that references both attributes
- [ ] Intersectional findings appear in the frontend audit results page

---

## Phase 3 — BigQuery Immutable Audit Log
**Goal:** Establish tamper-evident audit trail for ISO/IEC 42001 compliance.
**Requires:** MH-4
**Touches:** `api/services/` (new), `api/agents/orchestrator.py`, `api/routers/audits.py`, frontend

### Scope
- Create `api/services/bigquery_logger.py` — BigQuery client, table schema, append-only writes
- After audit completion in `orchestrator.py`: serialize finding JSON → SHA-256 hash → write to BQ
- After remediation in `audits.py`: same pattern
- New API endpoint `GET /audits/{audit_id}/verify-integrity` — compare local hash vs BQ hash
- Frontend: "Verify Integrity" badge/button on audit results page

### UAT
- [ ] Completing an audit creates a row in BigQuery with matching SHA-256 hash
- [ ] "Verify Integrity" button returns ✅ for unmodified audits
- [ ] Modifying an audit locally causes verification to return ❌ mismatch

---

## Phase 4 — Async Synthetic Data Validation
**Goal:** Validate that generated synthetic data actually reduces bias, don't trust blindly.
**Requires:** MH-3
**Touches:** `api/agents/remediation_agent.py`, `api/routers/audits.py`, frontend remediation page

### Scope
- After `generate_synthetic_dataset`, run `FairnessEvaluator` on the combined (original + synthetic) DataFrame
- Compare before/after Disparate Impact Ratio
- Return `{ before_dir, after_dir, improvement_percent, validation_passed }` in API response
- Update `RemediationPage` frontend to display before/after DIR visual comparison (bar chart or gauge)
- If DIR < 0.80 after remediation, flag as "Remediation Insufficient — manual review required"

### UAT
- [ ] Synthetic data generation returns both before and after DIR values
- [ ] Frontend shows visual before/after comparison
- [ ] If DIR doesn't improve past 0.80, the UI shows a warning

---

## Phase 5 — Cognitive Forcing Functions & PDF Export
**Goal:** EU AI Act Article 14 Human-in-the-Loop compliance via mandatory acknowledgment UI + Bias Receipt PDF.
**Requires:** MH-5, MH-6
**Touches:** frontend audit results page, new PDF generation endpoint, `api/routers/audits.py`

### Scope
- Frontend: "Export Bias Receipt" button (disabled by default)
- Clicking opens modal with checklist:
  - ☐ "I acknowledge that statistical metrics have confidence intervals and may not capture all forms of bias"
  - ☐ "I have reviewed the counterfactual twin evidence and understand its limitations"
  - ☐ "I accept responsibility as the human-in-the-loop for this audit's conclusions"
- After all checked → enable "Generate PDF" → POST to backend
- Backend: `api/services/pdf_generator.py` — compile findings, twins, legal violations, remediation strategies into structured PDF
- Log operator acknowledgment timestamp + checkbox state to audit trail
- Include SHA-256 report hash in the PDF footer

### UAT
- [ ] "Export" button is disabled until all checkboxes are checked
- [ ] PDF contains all audit findings, twin evidence, legal mappings, and integrity hash
- [ ] Acknowledgment timestamp is recorded in audit log
- [ ] PDF looks professional and is EU AI Act Annex IV-structured

---

## Phase Summary

| Phase | Description | Requirements | Risk |
|-------|-------------|--------------|------|
| 1 | Legal RAG Foundation | MH-1 | Medium — requires chunking statute text + FAISS setup |
| 2 | Intersectional Deep-Dive | MH-2 | Low — extending existing intersectional analysis |
| 3 | BigQuery Immutable Audit Log | MH-4 | Medium — BQ client setup + API verification endpoint |
| 4 | Async Synthetic Data Validation | MH-3 | Low — plugging FairnessEvaluator into existing flow |
| 5 | Cognitive Forcing Functions & PDF | MH-5, MH-6 | Low-Medium — frontend modal + PDF rendering |

---
*Last updated: 2026-04-22*
