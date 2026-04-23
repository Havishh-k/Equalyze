# Graph Report - .  (2026-04-22)

## Corpus Check
- Corpus is ~32,601 words - fits in a single context window. You may not need a graph.

## Summary
- 268 nodes · 623 edges · 35 communities detected
- Extraction: 48% EXTRACTED · 52% INFERRED · 0% AMBIGUOUS · INFERRED: 323 edges (avg confidence: 0.57)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Bias Metrics & Twin Engine|Bias Metrics & Twin Engine]]
- [[_COMMUNITY_Agent Framework & Governance|Agent Framework & Governance]]
- [[_COMMUNITY_Audit Orchestration & Models|Audit Orchestration & Models]]
- [[_COMMUNITY_Ingestion & Proxy Detection|Ingestion & Proxy Detection]]
- [[_COMMUNITY_Frontend API Client|Frontend API Client]]
- [[_COMMUNITY_Dataset Parser|Dataset Parser]]
- [[_COMMUNITY_Auth Context & Design Docs|Auth Context & Design Docs]]
- [[_COMMUNITY_FastAPI Server & Scheduler|FastAPI Server & Scheduler]]
- [[_COMMUNITY_Demo Dataset Generation|Demo Dataset Generation]]
- [[_COMMUNITY_Cryptographic Utilities|Cryptographic Utilities]]
- [[_COMMUNITY_App Configuration|App Configuration]]
- [[_COMMUNITY_Monitoring & Drift Detection|Monitoring & Drift Detection]]
- [[_COMMUNITY_Firebase Database Layer|Firebase Database Layer]]
- [[_COMMUNITY_Organization Management|Organization Management]]
- [[_COMMUNITY_Monitoring Dashboard UI|Monitoring Dashboard UI]]
- [[_COMMUNITY_Login & Registration Pages|Login & Registration Pages]]
- [[_COMMUNITY_Root Layout|Root Layout]]
- [[_COMMUNITY_Graphify Detection|Graphify Detection]]
- [[_COMMUNITY_Graphify Summary|Graphify Summary]]
- [[_COMMUNITY_Agents Module Init|Agents Module Init]]
- [[_COMMUNITY_Models Module Init|Models Module Init]]
- [[_COMMUNITY_Routers Module Init|Routers Module Init]]
- [[_COMMUNITY_Services Module Init|Services Module Init]]
- [[_COMMUNITY_Utils Module Init|Utils Module Init]]
- [[_COMMUNITY_ESLint Config|ESLint Config]]
- [[_COMMUNITY_Next.js Type Defs|Next.js Type Defs]]
- [[_COMMUNITY_Next.js Config|Next.js Config]]
- [[_COMMUNITY_PostCSS Config|PostCSS Config]]
- [[_COMMUNITY_Landing Page|Landing Page]]
- [[_COMMUNITY_Dashboard Layout|Dashboard Layout]]
- [[_COMMUNITY_Dashboard Overview|Dashboard Overview]]
- [[_COMMUNITY_Audit List Page|Audit List Page]]
- [[_COMMUNITY_Firebase Client SDK|Firebase Client SDK]]
- [[_COMMUNITY_Continuous Monitoring PRD|Continuous Monitoring PRD]]
- [[_COMMUNITY_Audit Reporting PRD|Audit Reporting PRD]]

## God Nodes (most connected - your core abstractions)
1. `Severity` - 36 edges
2. `BaseEqualyzeAgent` - 31 edges
3. `Finding` - 30 edges
4. `FairnessEvaluator` - 24 edges
5. `BiasMetric` - 21 edges
6. `TwinEngineAgent` - 20 edges
7. `AgentStatus` - 20 edges
8. `AgentState` - 20 edges
9. `ProxyWarning` - 15 edges
10. `GovernanceAgent` - 12 edges

## Surprising Connections (you probably didn't know these)
- `Counterfactual Twin Testing` --semantically_similar_to--> `TwinEngineAgent`  [INFERRED] [semantically similar]
  equalyze-PRD.md → api\agents\twin_engine_agent.py
- `REST API Design` --semantically_similar_to--> `create_audit()`  [INFERRED] [semantically similar]
  equalyze-TRD.md → api\routers\audits.py
- `Proxy Variable Detection` --semantically_similar_to--> `ProxyDetector`  [INFERRED] [semantically similar]
  equalyze-PRD.md → api\services\proxy_detector.py
- `Governance & Legal Compliance` --semantically_similar_to--> `GovernanceAgent`  [INFERRED] [semantically similar]
  equalyze-PRD.md → api\agents\governance_agent.py
- `Bias Detection System` --semantically_similar_to--> `IngestionAgent`  [INFERRED] [semantically similar]
  equalyze-PRD.md → api\agents\ingestion_agent.py

## Hyperedges (group relationships)
- **End-to-End Bias Audit Pipeline** — prd_bias_detection, prd_counterfactual_twins, prd_governance_compliance, prd_remediation_engine, prd_multi_agent_pipeline [EXTRACTED 0.95]
- **Full Stack Architecture** — trd_fastapi_backend, trd_nextjs_frontend, trd_firebase_auth, trd_gemini_integration [EXTRACTED 0.90]

## Communities

### Community 0 - "Bias Metrics & Twin Engine"
Cohesion: 0.16
Nodes (24): BiasMetric, CounterfactualTwin, FindingType, GenealogyNode, Severity, FairnessEvaluator, Equalyze — Fairness Metrics Engine Pure Python/numpy statistical fairness comput, Equalized Odds: |TPR(A=0) - TPR(A=1)|         Measures if true positive rates ar (+16 more)

### Community 1 - "Agent Framework & Governance"
Cohesion: 0.11
Nodes (25): Finding, LegalViolation, RemediationLevel, RemediationStrategy, RiskLevel, BaseEqualyzeAgent, Equalyze — Base Agent (Gemini API Wrapper) All specialist agents inherit from th, Base class for all Equalyze agents.     Wraps the google-generativeai SDK with: (+17 more)

### Community 2 - "Audit Orchestration & Models"
Cohesion: 0.15
Nodes (31): AgentState, AgentStatus, Audit, AuditCreateResponse, AuditStatus, AuditStatusResponse, DatasetInfo, ModelDomain (+23 more)

### Community 3 - "Ingestion & Proxy Detection"
Cohesion: 0.16
Nodes (17): ColumnTag, ProxyWarning, SchemaMap, get_schema_suggestions(), Equalyze — Dataset API Routes Upload, parse, and get schema suggestions for data, IngestionAgent, Equalyze — Ingestion Agent Parses datasets, auto-tags schema, detects proxy vari, Parse Gemini's classification into a SchemaMap. (+9 more)

### Community 4 - "Frontend API Client"
Cohesion: 0.14
Nodes (11): createAudit(), fetchAPI(), getAudit(), getAuditFindings(), getAuditStatus(), getSchemaSuggestions(), listAudits(), uploadDataset() (+3 more)

### Community 5 - "Dataset Parser"
Cohesion: 0.12
Nodes (14): DatasetParser, Equalyze — Dataset Parser Service Parses CSV/XLSX/JSON files into profiled DataF, Parse and profile uploaded datasets., Parse a dataset file and return (DataFrame, profile)., Generate a statistical profile of the dataset., upload_dataset(), Bias Detection System, Counterfactual Twin Testing (+6 more)

### Community 6 - "Auth Context & Design Docs"
Cohesion: 0.2
Nodes (8): AuthProvider(), REST API Design, Data Processing Pipeline, FastAPI Backend Design, Firebase Authentication, Google Gemini AI Integration, Next.js Frontend Design, System Architecture Design

### Community 7 - "FastAPI Server & Scheduler"
Cohesion: 0.22
Nodes (5): lifespan(), Equalyze — FastAPI Application Entry Point, Mocks Google Cloud Scheduler triggering the webhook., start_scheduler(), trigger_cloud_scheduler_mock()

### Community 8 - "Demo Dataset Generation"
Cohesion: 0.25
Nodes (7): generate_clean_healthcare_dataset(), generate_healthcare_insurance_dataset(), generate_msme_lending_dataset(), Equalyze — Demo Dataset Generator Generates the two core demo datasets with know, MSME Lending dataset with GENDER + GEOGRAPHY BIAS.          KNOWN BIAS: Female b, Healthcare/Insurance dataset with ZIP CODE PROXY BIAS.          KNOWN BIAS: Rura, Clean/unbiased healthcare dataset — should produce GREEN results.     Used to va

### Community 9 - "Cryptographic Utilities"
Cohesion: 0.25
Nodes (7): hash_dict(), hash_file(), hash_string(), Equalyze — SHA-256 Hashing Utilities, Compute SHA-256 hash of a file., Compute SHA-256 hash of a JSON-serializable dictionary., Compute SHA-256 hash of a string.

### Community 10 - "App Configuration"
Cohesion: 0.4
Nodes (3): Equalyze — Configuration, Application settings loaded from environment variables., Settings

### Community 11 - "Monitoring & Drift Detection"
Cohesion: 0.4
Nodes (4): get_drift_metrics(), Webhook target for Cloud Scheduler.     Triggers a background "drift" audit on t, Fetch historical audits to plot drift over time., run_scheduled_audit()

### Community 12 - "Firebase Database Layer"
Cohesion: 0.67
Nodes (2): get_current_user(), get_optional_user()

### Community 13 - "Organization Management"
Cohesion: 0.5
Nodes (1): OrganizationCreate

### Community 14 - "Monitoring Dashboard UI"
Cohesion: 0.5
Nodes (0): 

### Community 15 - "Login & Registration Pages"
Cohesion: 0.67
Nodes (2): handleGoogle(), handleSubmit()

### Community 16 - "Root Layout"
Cohesion: 1.0
Nodes (0): 

### Community 17 - "Graphify Detection"
Cohesion: 1.0
Nodes (0): 

### Community 18 - "Graphify Summary"
Cohesion: 1.0
Nodes (0): 

### Community 19 - "Agents Module Init"
Cohesion: 1.0
Nodes (0): 

### Community 20 - "Models Module Init"
Cohesion: 1.0
Nodes (0): 

### Community 21 - "Routers Module Init"
Cohesion: 1.0
Nodes (0): 

### Community 22 - "Services Module Init"
Cohesion: 1.0
Nodes (0): 

### Community 23 - "Utils Module Init"
Cohesion: 1.0
Nodes (0): 

### Community 24 - "ESLint Config"
Cohesion: 1.0
Nodes (0): 

### Community 25 - "Next.js Type Defs"
Cohesion: 1.0
Nodes (0): 

### Community 26 - "Next.js Config"
Cohesion: 1.0
Nodes (0): 

### Community 27 - "PostCSS Config"
Cohesion: 1.0
Nodes (0): 

### Community 28 - "Landing Page"
Cohesion: 1.0
Nodes (0): 

### Community 29 - "Dashboard Layout"
Cohesion: 1.0
Nodes (0): 

### Community 30 - "Dashboard Overview"
Cohesion: 1.0
Nodes (0): 

### Community 31 - "Audit List Page"
Cohesion: 1.0
Nodes (0): 

### Community 32 - "Firebase Client SDK"
Cohesion: 1.0
Nodes (0): 

### Community 33 - "Continuous Monitoring PRD"
Cohesion: 1.0
Nodes (1): Continuous Monitoring System

### Community 34 - "Audit Reporting PRD"
Cohesion: 1.0
Nodes (1): Audit Reporting Dashboard

## Knowledge Gaps
- **31 isolated node(s):** `Equalyze — Configuration`, `Application settings loaded from environment variables.`, `Equalyze — FastAPI Application Entry Point`, `Equalyze — Base Agent (Gemini API Wrapper) All specialist agents inherit from th`, `Base class for all Equalyze agents.     Wraps the google-generativeai SDK with:` (+26 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Root Layout`** (2 nodes): `layout.tsx`, `RootLayout()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Graphify Detection`** (1 nodes): `_gf_detect.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Graphify Summary`** (1 nodes): `_gf_summary.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Agents Module Init`** (1 nodes): `__init__.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Models Module Init`** (1 nodes): `__init__.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Routers Module Init`** (1 nodes): `__init__.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Services Module Init`** (1 nodes): `__init__.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Utils Module Init`** (1 nodes): `__init__.py`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `ESLint Config`** (1 nodes): `eslint.config.mjs`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Next.js Type Defs`** (1 nodes): `next-env.d.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Next.js Config`** (1 nodes): `next.config.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `PostCSS Config`** (1 nodes): `postcss.config.mjs`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Landing Page`** (1 nodes): `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Dashboard Layout`** (1 nodes): `layout.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Dashboard Overview`** (1 nodes): `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Audit List Page`** (1 nodes): `page.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Firebase Client SDK`** (1 nodes): `firebase.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Continuous Monitoring PRD`** (1 nodes): `Continuous Monitoring System`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Audit Reporting PRD`** (1 nodes): `Audit Reporting Dashboard`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `BaseEqualyzeAgent` connect `Agent Framework & Governance` to `Bias Metrics & Twin Engine`, `Ingestion & Proxy Detection`?**
  _High betweenness centrality (0.090) - this node is a cross-community bridge._
- **Why does `Severity` connect `Bias Metrics & Twin Engine` to `Agent Framework & Governance`, `Audit Orchestration & Models`?**
  _High betweenness centrality (0.079) - this node is a cross-community bridge._
- **Why does `create_audit()` connect `Audit Orchestration & Models` to `Bias Metrics & Twin Engine`, `Auth Context & Design Docs`?**
  _High betweenness centrality (0.067) - this node is a cross-community bridge._
- **Are the 33 inferred relationships involving `Severity` (e.g. with `GovernanceAgent` and `Equalyze — Governance Agent Maps bias findings to regulations and computes legal`) actually correct?**
  _`Severity` has 33 INFERRED edges - model-reasoned connections that need verification._
- **Are the 24 inferred relationships involving `BaseEqualyzeAgent` (e.g. with `GovernanceAgent` and `Equalyze — Governance Agent Maps bias findings to regulations and computes legal`) actually correct?**
  _`BaseEqualyzeAgent` has 24 INFERRED edges - model-reasoned connections that need verification._
- **Are the 28 inferred relationships involving `Finding` (e.g. with `GovernanceAgent` and `Equalyze — Governance Agent Maps bias findings to regulations and computes legal`) actually correct?**
  _`Finding` has 28 INFERRED edges - model-reasoned connections that need verification._
- **Are the 18 inferred relationships involving `str` (e.g. with `.run_audit()` and `._generate_twin()`) actually correct?**
  _`str` has 18 INFERRED edges - model-reasoned connections that need verification._