# Requirements — Equalyze PRD v2.0 Milestone

## Milestone Goal
Execute the unconstrained `/caveman` review strategy: build from the data layer upwards to deliver production-grade Legal RAG, intersectional deep-dive, async remediation validation, and immutable audit trails for the Google Solution Challenge 2026 demo.

## Must-Haves

### MH-1: Legal RAG Agent (Vertex AI Vector Search)
Replace the hardcoded regulation text in `governance_agent.py` prompts with a true Retrieval-Augmented Generation pipeline.
- Chunk and embed the actual text of EU AI Act, DPDPA 2023, ECOA, NIST AI 600-1, and RBI Fair Practices Code
- Deploy a local FAISS vector index (Vertex AI Vector Search for production)
- When a bias finding is generated, semantically search the index for the exact legal clauses violated
- Domain selector (`healthcare`, `fintech`, `hr`) must dynamically alter search parameters
- **UAT:** Given a RED disparate impact finding in fintech domain, the Legal RAG must return the exact ECOA article and RBI Para 3 reference, not a hallucinated citation

### MH-2: Intersectional Deep-Dive in Twin Engine
Extend the Twin Engine to prove composite discrimination.
- Use Pandas `groupby` on combined protected attribute pairs (e.g., Gender + Zip Code)
- Feed intersectional slices into Gemini Pro to generate twins that isolate overlapping protected attributes
- Create `FindingType.INTERSECTIONAL` findings with their own severity scoring
- **UAT:** Given the `healthcare_insurance_biased.csv` dataset, the engine must detect and generate a twin for "Rural + Female" compounded discrimination

### MH-3: Async Synthetic Data Validation
Do not blindly trust generated datasets — validate them.
- After `remediation_agent.generate_synthetic_dataset`, automatically run `FairnessEvaluator` on the combined dataset
- Return the before/after Disparate Impact Ratio in the API response
- Frontend `RemediationPage` must display before/after DIR with visual comparison
- **UAT:** Synthetic data must demonstrably improve DIR to > 0.80 or the system must flag the failure

### MH-4: BigQuery Immutable Audit Log
Establish ISO/IEC 42001 compliant chain of custody.
- Integrate Google Cloud BigQuery client in `api/services/`
- On audit completion: serialize JSON payload → SHA-256 hash → append as immutable row to BigQuery
- On remediation: same pattern
- Frontend: "Verify Integrity" button that compares local hash against BQ hash
- **UAT:** A completed audit must have a corresponding tamper-evident row in BigQuery with matching hash

### MH-5: Cognitive Forcing Functions (Article 14 UI)
Combat "automation bias" by forcing human acknowledgment.
- "Export Report" button starts disabled on audit results page
- Clicking triggers a modal requiring the user to check 3+ boxes acknowledging uncertainty margins and legal limitations
- Only after all checks → enable PDF download
- Log the exact timestamp and checkboxes ticked to the audit trail
- **UAT:** Users cannot download a report without completing the mandatory checklist

### MH-6: Bias Receipt PDF Generator
Generate an EU AI Act Annex IV-compliant document.
- Compile findings, twins, legal violations, remediation strategies into a structured PDF
- Include report hash, generation timestamp, operator acknowledgment record
- **UAT:** PDF contains all findings, twin evidence, legal mappings, and the integrity hash

## Nice-to-Haves

### NH-1: Domain-Specific Legal Search Parameters
When user selects "Healthcare" → prioritize HIPAA, FDA guidelines in RAG search. "Fintech" → prioritize ECOA, RBI, DPDP lending sections. Already partially addressed by MH-1 domain filtering.

### NH-2: Email Notification on Async Remediation
After background remediation task completes, email the user with a download link.

### NH-3: Interactive Bias Genealogy Visualization
Replace the static genealogy tree with an interactive Sankey/flow diagram showing bias contribution at each pipeline level.

## Out of Scope

- Full Vertex AI Vector Search production deployment (using local FAISS for prototype)
- Google Cloud Tasks queue (using FastAPI BackgroundTasks for prototype)
- Multi-tenant organization isolation (single demo org for GSC)
- Real-time WebSocket progress updates (polling is sufficient for demo)

---
*Last updated: 2026-04-22*
