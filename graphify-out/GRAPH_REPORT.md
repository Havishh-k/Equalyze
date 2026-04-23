# Graph Report - C:\DEV apps\Google solutions  (2026-04-23)

## Corpus Check
- 53 files · ~40,648 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 368 nodes · 994 edges · 40 communities detected
- Extraction: 39% EXTRACTED · 61% INFERRED · 0% AMBIGUOUS · INFERRED: 607 edges (avg confidence: 0.55)
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

## God Nodes (most connected - your core abstractions)
1. `Severity` - 63 edges
2. `Finding` - 53 edges
3. `FairnessEvaluator` - 45 edges
4. `BaseEqualyzeAgent` - 44 edges
5. `AgentStatus` - 40 edges
6. `AgentState` - 40 edges
7. `BiasMetric` - 32 edges
8. `Audit` - 28 edges
9. `AuditStatus` - 27 edges
10. `TwinEngineAgent` - 22 edges

## Surprising Connections (you probably didn't know these)
- `TwinEngineAgent` --semantically_similar_to--> `Counterfactual Twin Testing`  [INFERRED] [semantically similar]
  C:\DEV apps\Google solutions\api\agents\twin_engine_agent.py → equalyze-PRD.md
- `create_audit()` --semantically_similar_to--> `REST API Design`  [INFERRED] [semantically similar]
  C:\DEV apps\Google solutions\api\routers\audits.py → equalyze-TRD.md
- `GovernanceAgent` --semantically_similar_to--> `Governance & Legal Compliance`  [INFERRED] [semantically similar]
  C:\DEV apps\Google solutions\api\agents\governance_agent.py → equalyze-PRD.md
- `RemediationAgent` --semantically_similar_to--> `AI Remediation Engine`  [INFERRED] [semantically similar]
  api\agents\remediation_agent.py → equalyze-PRD.md
- `upload_dataset()` --semantically_similar_to--> `Dataset Schema Mapping`  [INFERRED] [semantically similar]
  C:\DEV apps\Google solutions\api\routers\datasets.py → equalyze-PRD.md

## Hyperedges (group relationships)
- **End-to-End Bias Audit Pipeline** — prd_bias_detection, prd_counterfactual_twins, prd_governance_compliance, prd_remediation_engine, prd_multi_agent_pipeline [EXTRACTED 0.95]
- **Full Stack Architecture** — trd_fastapi_backend, trd_nextjs_frontend, trd_firebase_auth, trd_gemini_integration [EXTRACTED 0.90]

## Communities

### Community 0 - "Community 0"
Cohesion: 0.18
Nodes (37): AgentState, AgentStatus, BiasMetric, CounterfactualTwin, Finding, FindingType, GenealogyNode, Severity (+29 more)

### Community 1 - "Community 1"
Cohesion: 0.06
Nodes (33): run_audit_pipeline(), DatasetParser, Equalyze — Dataset Parser Service Parses CSV/XLSX/JSON files into profiled DataF, Parse and profile uploaded datasets., Parse a dataset file and return (DataFrame, profile)., Generate a statistical profile of the dataset., get_dataset_store(), Equalyze — Dataset API Routes Upload, parse, and get schema suggestions for data (+25 more)

### Community 2 - "Community 2"
Cohesion: 0.09
Nodes (29): LegalViolation, ModelDomain, RemediationLevel, RemediationStrategy, RiskLevel, BaseEqualyzeAgent, Equalyze — Base Agent (Gemini API Wrapper) All specialist agents inherit from th, Base class for all Equalyze agents.     Wraps the google-generativeai SDK with: (+21 more)

### Community 3 - "Community 3"
Cohesion: 0.09
Nodes (29): ColumnTag, ProxyWarning, SchemaMap, get_schema_suggestions(), IngestionAgent, Equalyze — Ingestion Agent Parses datasets, auto-tags schema, detects proxy vari, Parse Gemini's classification into a SchemaMap., Fallback heuristic classification when Gemini fails. (+21 more)

### Community 4 - "Community 4"
Cohesion: 0.22
Nodes (33): Audit, AuditCreateResponse, AuditStatus, AuditStatusResponse, DatasetInfo, ModelMetadata, Equalyze — Pydantic Data Models All core data structures for audits, findings, t, SchemaConfirmRequest (+25 more)

### Community 5 - "Community 5"
Cohesion: 0.11
Nodes (16): createAudit(), fetchAPI(), getAudit(), getAuditFindings(), getAuditStatus(), getDatasetStatus(), getSchemaSuggestions(), listAudits() (+8 more)

### Community 6 - "Community 6"
Cohesion: 0.11
Nodes (13): remediate_audit(), Equalized Odds: |TPR(A=0) - TPR(A=1)|         Measures if true positive rates ar, Equalized Odds: |TPR(A=0) - TPR(A=1)|         Measures if true positive rates a, False Positive Rate Parity: |FPR(A=0) - FPR(A=1)|         Uses a Ridge Regressi, Individual Fairness: Are similar individuals treated similarly?         Uses pu, Run all fairness metrics for every protected attribute., Intersectional Analysis: Bias at the intersection of two attributes.         E., Demographic Parity Difference: |P(Y=1|A=0) - P(Y=1|A=1)|         Measures if pos (+5 more)

### Community 7 - "Community 7"
Cohesion: 0.2
Nodes (8): AuthProvider(), REST API Design, Data Processing Pipeline, FastAPI Backend Design, Firebase Authentication, Google Gemini AI Integration, Next.js Frontend Design, System Architecture Design

### Community 8 - "Community 8"
Cohesion: 0.28
Nodes (4): LegalVectorStore, Equalyze — Legal Vector Store Vertex AI Vector Search-based Retrieval-Augmented, Initialize Vertex AI Vector Search Endpoint., Search the index for relevant legal clauses, optionally filtering/boosting by do

### Community 9 - "Community 9"
Cohesion: 0.22
Nodes (5): lifespan(), Equalyze — FastAPI Application Entry Point, Mocks Google Cloud Scheduler triggering the webhook., start_scheduler(), trigger_cloud_scheduler_mock()

### Community 10 - "Community 10"
Cohesion: 0.25
Nodes (7): hash_dict(), hash_file(), hash_string(), Equalyze — SHA-256 Hashing Utilities, Compute SHA-256 hash of a file., Compute SHA-256 hash of a JSON-serializable dictionary., Compute SHA-256 hash of a string.

### Community 11 - "Community 11"
Cohesion: 0.32
Nodes (3): CloudTasksClient, Enqueue task to parse dataset and generate schema., Enqueue task to run the heavy ML audit pipeline.

### Community 12 - "Community 12"
Cohesion: 0.33
Nodes (3): BigQueryLogger, Ensures the dataset and table exist for immutable audit logging., Appends a new immutable record to the BigQuery ledger.

### Community 13 - "Community 13"
Cohesion: 0.4
Nodes (3): Equalyze — Configuration, Application settings loaded from environment variables., Settings

### Community 14 - "Community 14"
Cohesion: 0.5
Nodes (1): OrganizationCreate

### Community 15 - "Community 15"
Cohesion: 0.5
Nodes (0): 

### Community 16 - "Community 16"
Cohesion: 0.67
Nodes (2): handleGoogle(), handleSubmit()

### Community 17 - "Community 17"
Cohesion: 0.67
Nodes (2): analyze_and_mask_csv(), Triggered by a change to a Cloud Storage bucket.     Reads a CSV, samples first

### Community 18 - "Community 18"
Cohesion: 1.0
Nodes (0): 

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
Nodes (1): Calculates the privacy budget parameter (ε) for the synthetic generation.

### Community 23 - "Community 23"
Cohesion: 1.0
Nodes (0): 

### Community 24 - "Community 24"
Cohesion: 1.0
Nodes (0): 

### Community 25 - "Community 25"
Cohesion: 1.0
Nodes (0): 

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
Nodes (1): Ensures the dataset and table exist for immutable audit logging.

### Community 36 - "Community 36"
Cohesion: 1.0
Nodes (1): Appends a new immutable record to the BigQuery ledger.

### Community 37 - "Community 37"
Cohesion: 1.0
Nodes (1): Appends a new immutable record to the BigQuery ledger.

### Community 38 - "Community 38"
Cohesion: 1.0
Nodes (1): Continuous Monitoring System

### Community 39 - "Community 39"
Cohesion: 1.0
Nodes (1): Audit Reporting Dashboard

## Knowledge Gaps
- **49 isolated node(s):** `Equalyze — Configuration`, `Application settings loaded from environment variables.`, `Equalyze — FastAPI Application Entry Point`, `Equalyze — Base Agent (Gemini API Wrapper) All specialist agents inherit from th`, `Base class for all Equalyze agents.     Wraps the google-generativeai SDK with:` (+44 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 18`** (2 nodes): `layout.tsx`, `RootLayout()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 19`** (1 nodes): `__init__.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 20`** (1 nodes): `__init__.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 21`** (1 nodes): `__init__.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 22`** (1 nodes): `Calculates the privacy budget parameter (ε) for the synthetic generation.`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 23`** (1 nodes): `__init__.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 24`** (1 nodes): `__init__.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 25`** (1 nodes): `eslint.config.mjs`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 26`** (1 nodes): `next-env.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 27`** (1 nodes): `next.config.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 28`** (1 nodes): `postcss.config.mjs`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 29`** (1 nodes): `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 30`** (1 nodes): `layout.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 31`** (1 nodes): `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 32`** (1 nodes): `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 33`** (1 nodes): `firebase.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 34`** (1 nodes): `setup.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 35`** (1 nodes): `Ensures the dataset and table exist for immutable audit logging.`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 36`** (1 nodes): `Appends a new immutable record to the BigQuery ledger.`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 37`** (1 nodes): `Appends a new immutable record to the BigQuery ledger.`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 38`** (1 nodes): `Continuous Monitoring System`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 39`** (1 nodes): `Audit Reporting Dashboard`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Severity` connect `Community 0` to `Community 1`, `Community 2`, `Community 4`, `Community 6`?**
  _High betweenness centrality (0.087) - this node is a cross-community bridge._
- **Why does `BaseEqualyzeAgent` connect `Community 2` to `Community 0`, `Community 3`?**
  _High betweenness centrality (0.087) - this node is a cross-community bridge._
- **Why does `ProxyWarning` connect `Community 3` to `Community 4`?**
  _High betweenness centrality (0.067) - this node is a cross-community bridge._
- **Are the 60 inferred relationships involving `Severity` (e.g. with `GovernanceAgent` and `Equalyze — Governance Agent Maps bias findings to regulations and computes legal`) actually correct?**
  _`Severity` has 60 INFERRED edges - model-reasoned connections that need verification._
- **Are the 51 inferred relationships involving `Finding` (e.g. with `GovernanceAgent` and `Equalyze — Governance Agent Maps bias findings to regulations and computes legal`) actually correct?**
  _`Finding` has 51 INFERRED edges - model-reasoned connections that need verification._
- **Are the 31 inferred relationships involving `FairnessEvaluator` (e.g. with `TwinEngineAgent` and `Equalyze — Twin Engine Agent THE CORE DIFFERENTIATOR. Combines statistical bias`) actually correct?**
  _`FairnessEvaluator` has 31 INFERRED edges - model-reasoned connections that need verification._
- **Are the 37 inferred relationships involving `BaseEqualyzeAgent` (e.g. with `GovernanceAgent` and `Equalyze — Governance Agent Maps bias findings to regulations and computes legal`) actually correct?**
  _`BaseEqualyzeAgent` has 37 INFERRED edges - model-reasoned connections that need verification._