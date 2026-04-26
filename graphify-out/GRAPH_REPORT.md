# Graph Report - C:\DEV apps\Google solutions  (2026-04-25)

## Corpus Check
- 58 files · ~50,346 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 398 nodes · 1137 edges · 44 communities detected
- Extraction: 37% EXTRACTED · 63% INFERRED · 0% AMBIGUOUS · INFERRED: 713 edges (avg confidence: 0.54)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]

## God Nodes (most connected - your core abstractions)
1. `Severity` - 71 edges
2. `Finding` - 61 edges
3. `FairnessEvaluator` - 53 edges
4. `AgentStatus` - 48 edges
5. `AgentState` - 48 edges
6. `BaseEqualyzeAgent` - 44 edges
7. `Audit` - 37 edges
8. `AuditStatus` - 35 edges
9. `BiasMetric` - 32 edges
10. `DatasetInfo` - 25 edges

## Surprising Connections (you probably didn't know these)
- `TwinEngineAgent` --semantically_similar_to--> `Counterfactual Twin Testing`  [INFERRED] [semantically similar]
  C:\DEV apps\Google solutions\api\agents\twin_engine_agent.py → equalyze-PRD.md
- `create_audit()` --semantically_similar_to--> `REST API Design`  [INFERRED] [semantically similar]
  C:\DEV apps\Google solutions\api\routers\audits.py → equalyze-TRD.md
- `upload_dataset()` --semantically_similar_to--> `Dataset Schema Mapping`  [INFERRED] [semantically similar]
  C:\DEV apps\Google solutions\api\routers\datasets.py → equalyze-PRD.md
- `GovernanceAgent` --semantically_similar_to--> `Governance & Legal Compliance`  [INFERRED] [semantically similar]
  C:\DEV apps\Google solutions\api\agents\governance_agent.py → equalyze-PRD.md
- `RemediationAgent` --semantically_similar_to--> `AI Remediation Engine`  [INFERRED] [semantically similar]
  api\agents\remediation_agent.py → equalyze-PRD.md

## Hyperedges (group relationships)
- **End-to-End Bias Audit Pipeline** — prd_bias_detection, prd_counterfactual_twins, prd_governance_compliance, prd_remediation_engine, prd_multi_agent_pipeline [EXTRACTED 0.95]
- **Full Stack Architecture** — trd_fastapi_backend, trd_nextjs_frontend, trd_firebase_auth, trd_gemini_integration [EXTRACTED 0.90]

## Communities

### Community 0 - "Community 0"
Cohesion: 0.13
Nodes (36): BiasMetric, CounterfactualTwin, FindingType, GenealogyNode, Severity, FairnessEvaluator, Equalyze — Fairness Metrics Engine Pure Python/numpy statistical fairness comput, Equalized Odds: |TPR(A=0) - TPR(A=1)|         Measures if true positive rates ar (+28 more)

### Community 1 - "Community 1"
Cohesion: 0.08
Nodes (31): ColumnTag, ProxyWarning, SchemaMap, BaseEqualyzeAgent, get_schema_suggestions(), IngestionAgent, Equalyze — Ingestion Agent Parses datasets, auto-tags schema, detects proxy vari, Parse Gemini's classification into a SchemaMap. (+23 more)

### Community 2 - "Community 2"
Cohesion: 0.1
Nodes (29): LegalViolation, ModelDomain, Equalyze — Pydantic Data Models All core data structures for audits, findings, t, RemediationLevel, RemediationStrategy, RiskLevel, BaseEqualyzeAgent, Equalyze — Base Agent (Gemini API Wrapper) All specialist agents inherit from th (+21 more)

### Community 3 - "Community 3"
Cohesion: 0.06
Nodes (28): create_audit(), download_remediated(), get_audit_status(), remediate_audit(), run_audit_pipeline(), save_audit_to_db(), verify_audit_integrity(), get_dataset_store() (+20 more)

### Community 4 - "Community 4"
Cohesion: 0.33
Nodes (42): AgentState, AgentStatus, Audit, AuditCreateResponse, AuditStatus, AuditStatusResponse, DatasetInfo, Finding (+34 more)

### Community 5 - "Community 5"
Cohesion: 0.11
Nodes (16): createAudit(), fetchAPI(), getAudit(), getAuditFindings(), getAuditStatus(), getDatasetStatus(), getSchemaSuggestions(), listAudits() (+8 more)

### Community 6 - "Community 6"
Cohesion: 0.11
Nodes (11): UploadResponse, CloudTasksClient, Enqueue task to parse dataset and generate schema., Enqueue task to run the heavy ML audit pipeline., DatasetParser, Equalyze — Dataset Parser Service Parses CSV/XLSX/JSON files into profiled DataF, Parse and profile uploaded datasets., Parse a dataset file and return (DataFrame, profile). (+3 more)

### Community 7 - "Community 7"
Cohesion: 0.26
Nodes (16): build_pipeline(), log_result(), phase1_maternal_health(), phase2a_german_credit(), phase2b_taiwan_credit(), phase2c_sba_loans(), phase2d_lending_club(), phase3a_medical_cost() (+8 more)

### Community 8 - "Community 8"
Cohesion: 0.18
Nodes (8): hash_dict(), hash_file(), hash_string(), Equalyze — SHA-256 Hashing Utilities, Compute SHA-256 hash of a file., Compute SHA-256 hash of a JSON-serializable dictionary., Compute SHA-256 hash of a string., OrchestratorAgent

### Community 9 - "Community 9"
Cohesion: 0.2
Nodes (8): AuthProvider(), REST API Design, Data Processing Pipeline, FastAPI Backend Design, Firebase Authentication, Google Gemini AI Integration, Next.js Frontend Design, System Architecture Design

### Community 10 - "Community 10"
Cohesion: 0.28
Nodes (4): LegalVectorStore, Equalyze — Legal Vector Store Vertex AI Vector Search-based Retrieval-Augmented, Initialize Vertex AI Vector Search Endpoint., Search the index for relevant legal clauses, optionally filtering/boosting by do

### Community 11 - "Community 11"
Cohesion: 0.22
Nodes (5): lifespan(), Equalyze — FastAPI Application Entry Point, Mocks Google Cloud Scheduler triggering the webhook., start_scheduler(), trigger_cloud_scheduler_mock()

### Community 12 - "Community 12"
Cohesion: 0.29
Nodes (4): resolve_audit(), BigQueryLogger, Ensures the dataset and table exist for immutable audit logging., Appends a new immutable record to the BigQuery ledger.

### Community 13 - "Community 13"
Cohesion: 0.25
Nodes (7): generate_clean_healthcare_dataset(), generate_healthcare_insurance_dataset(), generate_msme_lending_dataset(), Equalyze — Demo Dataset Generator Generates the two core demo datasets with know, MSME Lending dataset with GENDER + GEOGRAPHY BIAS.          KNOWN BIAS: Female b, Healthcare/Insurance dataset with ZIP CODE PROXY BIAS.          KNOWN BIAS: Rura, Clean/unbiased healthcare dataset — should produce GREEN results.     Used to va

### Community 14 - "Community 14"
Cohesion: 0.4
Nodes (3): Equalyze — Configuration, Application settings loaded from environment variables., Settings

### Community 15 - "Community 15"
Cohesion: 0.5
Nodes (1): OrganizationCreate

### Community 16 - "Community 16"
Cohesion: 0.5
Nodes (0): 

### Community 17 - "Community 17"
Cohesion: 0.67
Nodes (2): handleGoogle(), handleSubmit()

### Community 18 - "Community 18"
Cohesion: 0.67
Nodes (2): analyze_and_mask_csv(), Triggered by a change to a Cloud Storage bucket.     Reads a CSV, samples first

### Community 19 - "Community 19"
Cohesion: 1.0
Nodes (0): 

### Community 20 - "Community 20"
Cohesion: 1.0
Nodes (0): 

### Community 21 - "Community 21"
Cohesion: 1.0
Nodes (0): 

### Community 22 - "Community 22"
Cohesion: 1.0
Nodes (0): 

### Community 23 - "Community 23"
Cohesion: 1.0
Nodes (0): 

### Community 24 - "Community 24"
Cohesion: 1.0
Nodes (0): 

### Community 25 - "Community 25"
Cohesion: 1.0
Nodes (1): Calculates the privacy budget parameter (ε) for the synthetic generation.

### Community 26 - "Community 26"
Cohesion: 1.0
Nodes (0): 

### Community 27 - "Community 27"
Cohesion: 1.0
Nodes (0): 

### Community 28 - "Community 28"
Cohesion: 1.0
Nodes (0): 

### Community 29 - "Community 29"
Cohesion: 1.0
Nodes (0): 

### Community 30 - "Community 30"
Cohesion: 1.0
Nodes (0): 

### Community 31 - "Community 31"
Cohesion: 1.0
Nodes (0): 

### Community 32 - "Community 32"
Cohesion: 1.0
Nodes (0): 

### Community 33 - "Community 33"
Cohesion: 1.0
Nodes (0): 

### Community 34 - "Community 34"
Cohesion: 1.0
Nodes (0): 

### Community 35 - "Community 35"
Cohesion: 1.0
Nodes (0): 

### Community 36 - "Community 36"
Cohesion: 1.0
Nodes (0): 

### Community 37 - "Community 37"
Cohesion: 1.0
Nodes (0): 

### Community 38 - "Community 38"
Cohesion: 1.0
Nodes (0): 

### Community 39 - "Community 39"
Cohesion: 1.0
Nodes (1): Ensures the dataset and table exist for immutable audit logging.

### Community 40 - "Community 40"
Cohesion: 1.0
Nodes (1): Appends a new immutable record to the BigQuery ledger.

### Community 41 - "Community 41"
Cohesion: 1.0
Nodes (1): Appends a new immutable record to the BigQuery ledger.

### Community 42 - "Community 42"
Cohesion: 1.0
Nodes (1): Continuous Monitoring System

### Community 43 - "Community 43"
Cohesion: 1.0
Nodes (1): Audit Reporting Dashboard

## Knowledge Gaps
- **52 isolated node(s):** `=============================================================================  M`, `Build a standard sklearn preprocessing + classifier pipeline.`, `Standard train/test split, fit, evaluate, and save.`, `Equalyze — Configuration`, `Application settings loaded from environment variables.` (+47 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 19`** (2 nodes): `layout.tsx`, `RootLayout()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 20`** (1 nodes): `train_incremental.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 21`** (1 nodes): `train_loan_model.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 22`** (1 nodes): `__init__.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 23`** (1 nodes): `__init__.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 24`** (1 nodes): `__init__.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 25`** (1 nodes): `Calculates the privacy budget parameter (ε) for the synthetic generation.`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 26`** (1 nodes): `__init__.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 27`** (1 nodes): `__init__.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 28`** (1 nodes): `eslint.config.mjs`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 29`** (1 nodes): `next-env.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 30`** (1 nodes): `next.config.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 31`** (1 nodes): `postcss.config.mjs`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 32`** (1 nodes): `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 33`** (1 nodes): `layout.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 34`** (1 nodes): `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 35`** (1 nodes): `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 36`** (1 nodes): `firebase.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 37`** (1 nodes): `test_audit.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 38`** (1 nodes): `setup.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 39`** (1 nodes): `Ensures the dataset and table exist for immutable audit logging.`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 40`** (1 nodes): `Appends a new immutable record to the BigQuery ledger.`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 41`** (1 nodes): `Appends a new immutable record to the BigQuery ledger.`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 42`** (1 nodes): `Continuous Monitoring System`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 43`** (1 nodes): `Audit Reporting Dashboard`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Severity` connect `Community 0` to `Community 8`, `Community 2`, `Community 4`?**
  _High betweenness centrality (0.081) - this node is a cross-community bridge._
- **Why does `BaseEqualyzeAgent` connect `Community 2` to `Community 0`, `Community 1`?**
  _High betweenness centrality (0.076) - this node is a cross-community bridge._
- **Why does `ProxyWarning` connect `Community 1` to `Community 2`, `Community 4`?**
  _High betweenness centrality (0.059) - this node is a cross-community bridge._
- **Are the 68 inferred relationships involving `Severity` (e.g. with `GovernanceAgent` and `Equalyze — Governance Agent Maps bias findings to regulations and computes legal`) actually correct?**
  _`Severity` has 68 INFERRED edges - model-reasoned connections that need verification._
- **Are the 59 inferred relationships involving `Finding` (e.g. with `GovernanceAgent` and `Equalyze — Governance Agent Maps bias findings to regulations and computes legal`) actually correct?**
  _`Finding` has 59 INFERRED edges - model-reasoned connections that need verification._
- **Are the 39 inferred relationships involving `FairnessEvaluator` (e.g. with `TwinEngineAgent` and `Equalyze — Twin Engine Agent THE CORE DIFFERENTIATOR. Combines statistical bias`) actually correct?**
  _`FairnessEvaluator` has 39 INFERRED edges - model-reasoned connections that need verification._
- **Are the 45 inferred relationships involving `AgentStatus` (e.g. with `OrchestratorAgent` and `Equalyze — Orchestrator Agent Master coordinator that runs the full audit pipeli`) actually correct?**
  _`AgentStatus` has 45 INFERRED edges - model-reasoned connections that need verification._