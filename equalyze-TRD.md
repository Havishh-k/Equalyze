# Equalyze — Technical Requirements Document (TRD)
**Version:** 1.0  
**Status:** Draft  
**Last Updated:** April 2026  
**Authors:** Team Trident  

---

## Table of Contents

1. [System Architecture Overview](#1-system-architecture-overview)
2. [Agent Architecture Design](#2-agent-architecture-design)
3. [Technology Stack](#3-technology-stack)
4. [Layer-by-Layer Technical Specification](#4-layer-by-layer-technical-specification)
5. [Data Models & Schema](#5-data-models--schema)
6. [API Specification](#6-api-specification)
7. [Gemini Integration Spec](#7-gemini-integration-spec)
8. [Security & Privacy Architecture](#8-security--privacy-architecture)
9. [Infrastructure & Deployment](#9-infrastructure--deployment)
10. [Antigravity Agent Implementation Guide](#10-antigravity-agent-implementation-guide)
11. [Testing Strategy](#11-testing-strategy)
12. [Appendix](#12-appendix)

---

## 1. System Architecture Overview

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        EQUALYZE PLATFORM                            │
│                                                                     │
│  ┌──────────────┐    ┌──────────────────────────────────────────┐  │
│  │   Frontend   │    │           ORCHESTRATOR AGENT             │  │
│  │  (Next.js)   │◄──►│      (Master coordination layer)        │  │
│  └──────────────┘    └──────────┬───────────────────────────────┘  │
│                                 │                                   │
│         ┌───────────────────────┼───────────────────────────┐      │
│         ▼                       ▼                           ▼      │
│  ┌──────────────┐    ┌──────────────────┐    ┌──────────────────┐  │
│  │  INGESTION   │    │  TWIN ENGINE     │    │  GOVERNANCE      │  │
│  │    AGENT     │    │     AGENT        │    │    AGENT         │  │
│  └──────┬───────┘    └────────┬─────────┘    └────────┬─────────┘  │
│         │                     │                        │            │
│         ▼                     ▼                        ▼            │
│  ┌──────────────┐    ┌──────────────────┐    ┌──────────────────┐  │
│  │  REMEDIATION │    │  MONITORING      │    │  REPORTING       │  │
│  │    AGENT     │    │     AGENT        │    │    AGENT         │  │
│  └──────────────┘    └──────────────────┘    └──────────────────┘  │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │              SHARED SERVICES LAYER                          │   │
│  │   [Vector Store]  [Job Queue]  [Audit Log]  [File Store]    │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │              EXTERNAL INTEGRATIONS                          │   │
│  │   [Gemini Pro/Flash API]  [Firebase]  [Cloud Storage]       │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

### 1.2 Request Flow

```
User Uploads CSV
      │
      ▼
Orchestrator Agent receives job
      │
      ├──► Ingestion Agent: parse, validate, schema-map
      │         │
      │         ▼
      │    Schema confirmed by user
      │         │
      ├──► Twin Engine Agent: run fairness metrics + generate twins
      │         │
      │    [parallel]
      │         ├──► Bias Detection Sub-Agent (statistical metrics)
      │         ├──► Counterfactual Sub-Agent (Gemini Pro)
      │         └──► Genealogy Sub-Agent (pipeline root cause)
      │         │
      │         ▼
      │    Bias findings consolidated
      │         │
      ├──► Governance Agent: legal mapping + scoring
      │         │
      │         ├──► Legal Exposure Sub-Agent
      │         └──► Severity Scoring Sub-Agent
      │         │
      ├──► Remediation Agent: generate fix strategies + synthetic data
      │         │
      └──► Reporting Agent: compile Bias Receipt + audit log
                │
                ▼
          Report delivered to user
          Audit log written (immutable)
```

---

## 2. Agent Architecture Design

### 2.1 Architecture Philosophy

Equalyze uses a **Hierarchical Multi-Agent System** with a single Orchestrator Agent coordinating five specialized Sub-Agents. This architecture is chosen over alternatives for the following reasons:

| Architecture Option | Verdict | Reason |
|--------------------|---------|--------|
| Single monolithic agent | ❌ Rejected | Context window exhaustion on large datasets; no parallelism; hard to debug |
| One agent per feature | ❌ Rejected | Too many agents create coordination overhead; difficult state sharing |
| Fully autonomous swarm | ❌ Rejected | Unpredictable execution order; not suitable for regulated outputs requiring deterministic audit trails |
| **Hierarchical Orchestrator + Specialists** | ✅ Selected | Clean separation of concerns; parallelism where safe; deterministic audit trail; each agent is independently testable |
| Gemini Flash for speed + Pro for twins | ✅ Applied within architecture | Model selection is a config per agent, not an architecture choice |

### 2.2 Orchestrator Agent

**Role:** Central coordinator. Manages the audit job lifecycle, routes tasks to specialist agents, aggregates results, handles failures.

**Model:** Gemini 2.0 Flash (speed-optimized; orchestration doesn't require deep reasoning)

**Responsibilities:**
- Receive audit job from API layer
- Validate job parameters
- Dispatch tasks to specialist agents in correct order (with parallelism where possible)
- Monitor agent health and handle timeouts/retries
- Aggregate results into unified audit object
- Trigger Reporting Agent on completion
- Write final status to audit log

**System Prompt Design:**
```
You are the Equalyze Orchestrator. You coordinate a bias audit workflow.
You have access to the following tools: [dispatch_ingestion, dispatch_twin_engine, 
dispatch_governance, dispatch_remediation, dispatch_reporting, write_audit_log, 
get_job_status].

Your job is to:
1. Validate the incoming audit job parameters
2. Dispatch ingestion first, wait for schema confirmation
3. Dispatch twin engine and governance in parallel after schema is confirmed
4. Dispatch remediation after twin engine completes
5. Dispatch reporting after all agents complete
6. Write a final audit log entry

Always maintain a job_state object. On any agent failure, log the error, 
attempt one retry, then mark the finding as incomplete and continue.
Never hallucinate results — if an agent returns no findings, report no findings.
Output only structured JSON. Do not add prose.
```

**State Object:**
```json
{
  "job_id": "uuid",
  "organization_id": "uuid",
  "status": "pending | running | complete | failed",
  "created_at": "ISO8601",
  "dataset_hash": "sha256",
  "agents": {
    "ingestion": { "status": "complete", "output_ref": "s3://..." },
    "twin_engine": { "status": "running", "output_ref": null },
    "governance": { "status": "pending", "output_ref": null },
    "remediation": { "status": "pending", "output_ref": null },
    "reporting": { "status": "pending", "output_ref": null }
  },
  "error_log": []
}
```

### 2.3 Ingestion Agent

**Role:** Parse, validate, and semantically understand the uploaded dataset.

**Model:** Gemini 1.5 Flash (fast; handles structured data analysis efficiently)

**Sub-tasks:**
1. Parse CSV/XLSX/JSON into normalized DataFrame
2. Statistical profiling (column types, null rates, value distributions)
3. AI-assisted schema tagging (protected attributes, valid factors, outcome)
4. Proxy variable detection (correlation analysis between candidate features and protected attributes)
5. Return structured schema map for user confirmation

**Tools available:**
- `parse_dataset(file_ref)` → DataFrame summary
- `profile_columns(df_summary)` → column statistics
- `suggest_schema_tags(df_summary, domain)` → tagged schema JSON
- `detect_proxy_variables(schema_map, df_summary)` → proxy findings

**Key prompt — Schema Tagging:**
```
You are analyzing a dataset for an AI bias audit.
Domain: {domain}
Column names and sample values: {column_samples}

Classify each column into exactly one of:
- PROTECTED_ATTRIBUTE: A characteristic that should not influence the AI's decision 
  (race, gender, age, religion, disability, zip_code, national_origin, caste)
- VALID_FACTOR: A legitimate decision input (income, credit_score, years_employed)
- OUTCOME: The model's prediction or decision (loan_approved, risk_score, claim_status)
- IDENTIFIER: A unique ID column (applicant_id, patient_id)
- METADATA: Administrative data not relevant to the model (date, agent_id)

For each classification, provide a confidence score (0-1) and one sentence rationale.
Also flag any VALID_FACTOR that may be a statistical proxy for a protected attribute.
Respond in JSON only. Schema: {"column_name": {"tag": "...", "confidence": 0.0, "rationale": "...", "proxy_warning": boolean}}
```

### 2.4 Twin Engine Agent

**Role:** The intellectual core. Detects bias statistically AND proves it with AI-generated counterfactual examples.

**Model:** Gemini 2.0 Pro (deep reasoning; semantic twin generation requires nuanced understanding)

**Sub-Agents (run in parallel):**

#### 2.4.1 Bias Detection Sub-Agent

Computes all fairness metrics in Python. Does NOT use Gemini for computation — pure statistical calculation for accuracy and auditability.

**Metrics computed:**

```python
# Demographic Parity Difference
dpd = |P(Y=1|A=0) - P(Y=1|A=1)|
# Threshold: < 0.1 (Green), 0.1-0.2 (Amber), > 0.2 (Red)

# Disparate Impact Ratio  
dir = P(Y=1|A=minority) / P(Y=1|A=majority)
# Threshold: > 0.8 (Green), 0.6-0.8 (Amber), < 0.6 (Red)
# Legal significance: < 0.8 triggers 4/5ths rule violation

# Equalized Odds (True Positive Rate parity)
eod = |TPR(A=0) - TPR(A=1)|
# Threshold: < 0.1 (Green), 0.1-0.2 (Amber), > 0.2 (Red)

# False Positive Rate Parity
fprp = |FPR(A=0) - FPR(A=1)|
# Same thresholds as EOD

# Individual Fairness (approximate, k-nearest neighbors)
# For each instance, find k=5 most similar instances across all non-protected features
# Measure: % of similar instances that received the same outcome
# Threshold: > 90% (Green), 75-90% (Amber), < 75% (Red)
```

**Intersectional Analysis:**
- Automatically computes all 2-attribute intersections (e.g., gender × region)
- Surfaces intersections where marginal group analysis would miss compounded discrimination

#### 2.4.2 Counterfactual Sub-Agent

**The most critical component.** Uses Gemini Pro to generate semantically valid counterfactual twins.

**Selection criteria for twin candidates:**
1. Instance must be in a group that received a negative outcome
2. A similar instance in the privileged group must have received a positive outcome
3. The two instances must have near-identical non-protected attributes (cosine similarity > 0.80)

**Twin generation prompt:**
```
You are generating a Counterfactual Twin for an AI bias audit.

ORIGINAL PROFILE (received NEGATIVE outcome: {outcome_label}):
{original_profile_json}

TASK: Generate a Counterfactual Twin that is identical to the original profile
in all decision-relevant attributes, but changes ONLY the following protected 
attribute(s): {protected_attributes_to_flip}

RULES:
1. Every non-protected attribute must remain semantically identical. 
   Do not change income, credit history, experience, medical history, or any 
   factor the model is legitimately allowed to use.
2. If the protected attribute is "gender", flip it. If "zip_code", use a 
   demographically contrasting but economically comparable zip code.
3. The twin must be a realistic, plausible individual — not a statistical artifact.
4. Write a 2-sentence plain-English narrative for each profile (8th grade reading level).
5. Assign a "twin_quality_score" (0-1): how completely you preserved all non-protected attributes.

OUTPUT FORMAT (JSON only):
{
  "original_narrative": "...",
  "twin_profile": {...},
  "twin_narrative": "...",
  "changed_attributes": ["gender"],
  "preserved_attributes": ["income", "credit_score", ...],
  "twin_quality_score": 0.94,
  "discrimination_statement": "A plain English one-sentence statement of what this twin proves."
}
```

**Post-generation validation:**
- Cosine similarity check between original and twin on non-protected features (must be ≥ 0.85)
- If below threshold: retry with stricter preservation instruction (max 3 retries)
- If still below threshold: surface to user with low-confidence warning, do not suppress

#### 2.4.3 Bias Genealogy Sub-Agent

Analyzes the dataset to trace where bias was introduced in the pipeline.

**Detection heuristics per level:**

| Level | Detection Signal | Method |
|-------|-----------------|--------|
| L1 — Raw Data | Underrepresentation of protected group in training data | Group frequency counts; Shannon diversity index |
| L2 — Feature Engineering | Proxy variable high correlation with protected attribute | Pearson/Cramér's V correlation matrix |
| L3 — Model Training | Outcome rate disparity exceeds data disparity | Compare raw data group ratio vs. outcome group ratio |
| L4 — Feedback Loop | Cannot detect from static dataset (flagged as "monitor in deployment") | Temporal analysis if historical data available |

**Output:** JSON tree with node-level bias attribution percentages.

### 2.5 Governance Agent

**Role:** Legal intelligence layer. Maps statistical bias findings to regulatory frameworks.

**Model:** Gemini 1.5 Pro (needs legal reasoning; RAG against regulation database)

**Sub-Agents:**

#### 2.5.1 Legal Exposure Sub-Agent

**Architecture:** Uses a pre-built Regulation Knowledge Base (vector store of regulation text chunks) and retrieves relevant articles based on:
- Detected bias type (demographic parity → disparate impact law)
- Jurisdiction (India / EU / USA / Global)
- Domain (healthcare / lending / insurance / hiring)

**Regulation knowledge base structure:**
```
regulations/
  india/
    dpdpa_2023.md
    rbi_fair_practices_code.md
    irdai_guidelines.md
  eu/
    eu_ai_act_2024.md
    gdpr_article_22.md
  usa/
    ecoa_regulation_b.md
    fair_housing_act.md
    title_vii.md
    hipaa.md
  global/
    iso_42001.md
```

**Legal mapping prompt:**
```
You are a legal AI compliance expert. You have been given bias findings from an 
AI audit and a set of retrieved regulatory text chunks.

Bias findings: {bias_findings_json}
Domain: {domain}
Jurisdiction: {jurisdiction}
Retrieved regulation chunks: {retrieved_chunks}

For each bias finding:
1. Identify which regulation(s) are potentially violated
2. Cite the specific article/section number
3. Assess the legal risk level: LOW / MEDIUM / HIGH / CRITICAL
4. Write a one-paragraph plain-English explanation of the potential violation
5. List what the organization must do to remediate from a legal standpoint

Be precise. Do not cite regulations that are not genuinely relevant.
If no regulation applies, say "No specific regulation applies; best practice only."
Output JSON only.
```

#### 2.5.2 Severity Scoring Sub-Agent

Aggregates all bias findings into a single severity score per protected attribute and an overall audit score.

**Scoring formula:**
```
severity_score = (
  0.30 * disparate_impact_score +
  0.25 * demographic_parity_score +  
  0.20 * legal_exposure_max_score +
  0.15 * twin_quality_score_max +
  0.10 * genealogy_depth_score
)

# Each component normalized 0-1 where 1 = most severe

audit_overall_score = weighted_average(severity_scores, weight=prevalence_in_dataset)

# Color mapping:
# 0.0 - 0.33 → GREEN  (compliant)
# 0.34 - 0.66 → AMBER  (monitor / remediate)  
# 0.67 - 1.0  → RED    (immediate action required)
```

### 2.6 Remediation Agent

**Role:** Converts bias findings into actionable fix strategies and generates synthetic training data.

**Model:** Gemini 2.0 Flash (fast generation; templated recommendations)

**Responsibilities:**
1. Generate 3 ranked remediation strategies per finding
2. Produce synthetic fairness dataset on request (Gemini + statistical sampling)
3. Estimate effort and expected bias reduction per strategy

**Remediation strategy generation prompt:**
```
You are an ML fairness engineer. Given a bias finding, generate exactly 3 
remediation strategies ranked from highest to lowest impact-to-effort ratio.

Finding: {finding_json}
Model type: {model_type}
Domain: {domain}

For each strategy provide:
- strategy_name: Short title
- level: "data" | "feature" | "model" | "post-processing"
- description: 2-3 sentences on what to do and why it works
- implementation_steps: numbered list of concrete steps
- code_reference: library name and function (e.g., "sklearn: resample", "fairlearn: ThresholdOptimizer")
- estimated_effort: "Low (< 4h)" | "Medium (1-3 days)" | "High (> 1 week)"
- estimated_bias_reduction: "X% - Y% reduction in {metric}"
- risks: Any risks or side effects of this approach

Output JSON array of 3 strategies.
```

**Synthetic Dataset Generator:**
```python
# Approach: Conditional GAN + Gemini semantic validation

def generate_synthetic_profiles(underrepresented_group, n_samples, schema, real_stats):
    """
    1. Extract statistical distribution of underrepresented group (real data)
    2. Use Gemini to generate n_samples semantically realistic profiles
       that match the statistical distribution
    3. Validate each profile: must be within 2 std deviations on numeric features
    4. Label all synthetic records with is_synthetic=True
    5. Return augmented dataset with generation report
    """
```

### 2.7 Reporting Agent

**Role:** Compiles all agent outputs into the final Bias Receipt and writes the immutable audit log.

**Model:** Gemini 1.5 Flash (templated document generation)

**Outputs:**
1. Executive Summary (1 page PDF-ready markdown)
2. Full Bias Receipt (full report PDF)
3. Technical Appendix (raw metrics JSON)
4. Audit Log Entry (immutable, hashed)

**Report structure:**
```
BIAS RECEIPT — {Organization Name}
Audit ID: {uuid}
Date: {ISO8601}
Dataset Hash: {sha256}
Audited by: Equalyze v1.0

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EXECUTIVE SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Overall Audit Result: 🔴 RED — Immediate action required
X bias findings across Y protected attributes.
Highest risk: [finding name] — [one-sentence impact]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FINDINGS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Finding 1: Gender Bias in Loan Approval
Severity: 🔴 RED
...
[Counterfactual Twin Card]
...
Legal Exposure: HIGH — RBI Fair Practices Code Para 3
...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
REMEDIATION REQUIRED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
AUDIT CHAIN OF CUSTODY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Audit initiated by: {user_email}
Dataset version hash: {sha256}
Report hash: {sha256 of this document}
```

---

## 3. Technology Stack

### 3.1 Full Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Frontend** | Next.js 14 (App Router) + TypeScript | SSR for report pages; strong typing for complex data models |
| **UI Components** | shadcn/ui + Tailwind CSS | Accessible, customizable enterprise components |
| **State Management** | Zustand + React Query | Lightweight global state; async server state handled separately |
| **Backend API** | FastAPI (Python) | Native pandas/numpy support; async; OpenAPI auto-generation |
| **Agent Framework** | Google Antigravity (Vertex AI Agent Builder) | Team's chosen framework; native Gemini integration |
| **AI Models** | Gemini 2.0 Pro (counterfactuals), Gemini 2.0 Flash (orchestration, fast tasks), Gemini 1.5 Pro (legal reasoning with long context) | Different models for different cost/quality tradeoffs |
| **Vector Store** | Vertex AI Vector Search | Native Antigravity integration for regulation knowledge base RAG |
| **Job Queue** | Google Cloud Tasks | Managed async job queue for long-running audit jobs |
| **Database** | Firestore (audit logs, org metadata) + BigQuery (analytics) | Firestore for real-time; BigQuery for bias trend analysis |
| **File Storage** | Google Cloud Storage | Dataset upload staging; report storage |
| **Authentication** | Firebase Auth + Google Identity Platform | Enterprise SSO support (SAML, OIDC) |
| **Report Generation** | WeasyPrint (Python → PDF) | Server-side PDF from HTML; no client-side dependency |
| **Data Processing** | pandas + numpy + scikit-learn | Statistical fairness metric computation |
| **Fairness Libraries** | Fairlearn (Microsoft) + AIF360 (IBM) | Standard fairness metric validation |
| **Deployment** | Google Cloud Run (containers) + Artifact Registry | Serverless containers; auto-scaling |
| **CI/CD** | GitHub Actions + Cloud Build | Automated testing and deployment |
| **Monitoring** | Google Cloud Monitoring + Vertex AI Model Monitoring | System health + model output monitoring |

### 3.2 Development Tooling

| Tool | Use |
|------|-----|
| Cursor / Antigravity | AI-assisted development (team's primary IDE) |
| Docker | Local development containers |
| pytest | Python backend testing |
| Jest + React Testing Library | Frontend testing |
| Postman / Bruno | API testing |
| GitHub | Version control; `main` (prod), `develop` (staging), `feature/*` branches |

---

## 4. Layer-by-Layer Technical Specification

### 4.1 Frontend Architecture

```
app/
  (auth)/
    login/
    register/
  (dashboard)/
    layout.tsx          # Auth guard, nav
    page.tsx            # Org dashboard — all audits, bias drift chart
    audits/
      new/
        page.tsx        # Step 1: Upload → Step 2: Schema → Step 3: Review → Launch
      [audit_id]/
        page.tsx        # Audit status + results
        report/
          page.tsx      # Full Bias Receipt viewer
        twins/
          page.tsx      # Counterfactual twin explorer
        remediation/
          page.tsx      # Remediation recommendations
  (public)/
    report/[share_token]/
      page.tsx          # Shareable read-only report view

components/
  upload/
    DatasetUploader.tsx     # Drag-drop with progress
    SchemaMapper.tsx        # Column tagging interface
    ProxyWarningBanner.tsx
  audit/
    AuditStatusTracker.tsx  # Real-time agent progress
    BiasMetricCard.tsx      # Per-metric result display
    SeverityBadge.tsx       # Green/Amber/Red indicator
  twins/
    CounterfactualTwinCard.tsx  # Side-by-side profile comparison
    TwinQualityIndicator.tsx
  governance/
    LegalExposurePanel.tsx
    RegulationCitation.tsx
  reporting/
    BiasReceipt.tsx         # Full report component
    AuditLogTable.tsx
  monitoring/
    BiasDriftChart.tsx      # Recharts time-series
    BenchmarkComparison.tsx
```

### 4.2 Backend Architecture

```
api/
  main.py                   # FastAPI app entry point
  routers/
    audits.py               # POST /audits, GET /audits/{id}
    datasets.py             # POST /datasets/upload, GET /datasets/{id}
    reports.py              # GET /reports/{audit_id}, GET /reports/{id}/download
    organizations.py        # Org management
    webhooks.py             # Cloud Tasks callbacks
  agents/
    orchestrator.py         # Master agent
    ingestion_agent.py
    twin_engine_agent.py
    governance_agent.py
    remediation_agent.py
    reporting_agent.py
  services/
    fairness_metrics.py     # Pure Python metric computation
    proxy_detector.py       # Correlation analysis
    dataset_parser.py       # CSV/XLSX/JSON parsing
    regulation_rag.py       # Vector store retrieval
    report_generator.py     # PDF generation
    audit_logger.py         # Immutable log writer
  models/
    audit.py                # Pydantic models
    dataset.py
    finding.py
    report.py
  utils/
    crypto.py               # SHA-256 hashing
    storage.py              # GCS wrapper
    queue.py                # Cloud Tasks wrapper
```

### 4.3 Fairness Metrics — Implementation Reference

```python
# services/fairness_metrics.py

import pandas as pd
import numpy as np
from fairlearn.metrics import (
    demographic_parity_difference,
    equalized_odds_difference,
    MetricFrame
)
from aif360.metrics import BinaryLabelDatasetMetric

class FairnessEvaluator:
    
    def __init__(self, df: pd.DataFrame, schema_map: dict):
        self.df = df
        self.outcome_col = schema_map['outcome']
        self.protected_cols = schema_map['protected_attributes']
        self.valid_factor_cols = schema_map['valid_factors']
    
    def run_full_audit(self) -> dict:
        results = {}
        for attr in self.protected_cols:
            results[attr] = {
                'demographic_parity': self._demographic_parity(attr),
                'disparate_impact': self._disparate_impact(attr),
                'equalized_odds': self._equalized_odds(attr),
                'fpr_parity': self._fpr_parity(attr),
                'individual_fairness': self._individual_fairness(attr),
                'intersectional': self._intersectional_analysis(attr)
            }
        return results
    
    def _demographic_parity(self, attr: str) -> dict:
        dpd = demographic_parity_difference(
            y_true=self.df[self.outcome_col],
            y_pred=self.df[self.outcome_col],  # predictions = outcomes in post-hoc audit
            sensitive_features=self.df[attr]
        )
        return {
            'value': float(dpd),
            'severity': self._classify_severity(abs(dpd), [0.1, 0.2]),
            'interpretation': f"Outcome rate differs by {abs(dpd)*100:.1f}% between groups"
        }
    
    def _disparate_impact(self, attr: str) -> dict:
        groups = self.df.groupby(attr)[self.outcome_col].mean()
        if len(groups) < 2:
            return {'value': 1.0, 'severity': 'GREEN', 'legal_flag': False}
        min_rate = groups.min()
        max_rate = groups.max()
        di_ratio = min_rate / max_rate if max_rate > 0 else 1.0
        return {
            'value': float(di_ratio),
            'severity': 'GREEN' if di_ratio >= 0.8 else ('AMBER' if di_ratio >= 0.6 else 'RED'),
            'legal_flag': di_ratio < 0.8,  # 4/5ths rule violation
            'minority_group': groups.idxmin(),
            'majority_group': groups.idxmax(),
            'interpretation': f"Minority group approved at {di_ratio*100:.1f}% the rate of majority"
        }
    
    def _individual_fairness(self, attr: str) -> dict:
        from sklearn.preprocessing import StandardScaler
        from sklearn.neighbors import NearestNeighbors
        
        feature_cols = self.valid_factor_cols
        numeric_features = self.df[feature_cols].select_dtypes(include=[np.number])
        
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(numeric_features.fillna(0))
        
        knn = NearestNeighbors(n_neighbors=6, metric='cosine')
        knn.fit(X_scaled)
        distances, indices = knn.kneighbors(X_scaled)
        
        # For each individual, check outcome consistency with 5 nearest neighbors
        consistency_scores = []
        outcomes = self.df[self.outcome_col].values
        for i, neighbors in enumerate(indices[:, 1:]):  # skip self
            same_outcome = sum(outcomes[j] == outcomes[i] for j in neighbors)
            consistency_scores.append(same_outcome / len(neighbors))
        
        avg_consistency = np.mean(consistency_scores)
        return {
            'value': float(avg_consistency),
            'severity': 'GREEN' if avg_consistency >= 0.9 else ('AMBER' if avg_consistency >= 0.75 else 'RED'),
            'interpretation': f"{avg_consistency*100:.1f}% of similar individuals receive the same outcome"
        }
    
    def _intersectional_analysis(self, attr: str) -> list:
        other_attrs = [a for a in self.protected_cols if a != attr]
        findings = []
        for other in other_attrs:
            try:
                mf = MetricFrame(
                    metrics={'selection_rate': lambda y_t, y_p: y_p.mean()},
                    y_true=self.df[self.outcome_col],
                    y_pred=self.df[self.outcome_col],
                    sensitive_features=self.df[[attr, other]]
                )
                findings.append({
                    'attributes': [attr, other],
                    'group_rates': mf.by_group.to_dict(),
                    'max_disparity': float(mf.difference()['selection_rate'])
                })
            except Exception:
                pass
        return findings
    
    def _classify_severity(self, value: float, thresholds: list) -> str:
        if value <= thresholds[0]:
            return 'GREEN'
        elif value <= thresholds[1]:
            return 'AMBER'
        return 'RED'
```

---

## 5. Data Models & Schema

### 5.1 Core Firestore Collections

```typescript
// organizations/{org_id}
interface Organization {
  id: string;
  name: string;
  domain: string;
  plan: 'starter' | 'professional' | 'enterprise';
  jurisdiction: string[];
  created_at: Timestamp;
  members: { [user_id: string]: 'owner' | 'admin' | 'analyst' | 'viewer' };
}

// audits/{audit_id}
interface Audit {
  id: string;
  org_id: string;
  created_by: string;  // user_id
  status: 'uploading' | 'schema_review' | 'running' | 'complete' | 'failed';
  model_name: string;
  model_domain: 'healthcare' | 'lending' | 'insurance' | 'hiring' | 'other';
  deployment_date?: string;
  jurisdiction: string[];
  dataset_ref: string;      // GCS path
  dataset_hash: string;     // SHA-256
  dataset_rows: number;
  schema_map: SchemaMap;
  agent_job_id: string;
  findings: Finding[];
  overall_severity: 'GREEN' | 'AMBER' | 'RED';
  overall_score: number;    // 0-1
  report_ref?: string;      // GCS path to PDF
  audit_log_hash: string;
  created_at: Timestamp;
  completed_at?: Timestamp;
}

// findings (subcollection of audits)
interface Finding {
  id: string;
  audit_id: string;
  protected_attribute: string;
  finding_type: 'demographic_parity' | 'disparate_impact' | 'equalized_odds' | 'individual_fairness' | 'intersectional';
  severity: 'GREEN' | 'AMBER' | 'RED';
  severity_score: number;
  metric_value: number;
  metric_threshold: number;
  legal_violations: LegalViolation[];
  counterfactual_twins: CounterfactualTwin[];
  genealogy_tree: GenealogyNode[];
  remediation_strategies: RemediationStrategy[];
}

interface CounterfactualTwin {
  id: string;
  original_profile: Record<string, any>;
  original_narrative: string;
  original_outcome: string;
  twin_profile: Record<string, any>;
  twin_narrative: string;
  twin_outcome: string;
  changed_attributes: string[];
  twin_quality_score: number;
  discrimination_statement: string;
}

interface LegalViolation {
  regulation_name: string;
  jurisdiction: string;
  article: string;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  plain_english: string;
  remediation_required: string;
  regulation_url?: string;
}

interface RemediationStrategy {
  rank: number;
  name: string;
  level: 'data' | 'feature' | 'model' | 'post-processing';
  description: string;
  implementation_steps: string[];
  code_reference: string;
  estimated_effort: string;
  estimated_bias_reduction: string;
  risks: string;
}

interface SchemaMap {
  protected_attributes: string[];
  valid_factors: string[];
  outcome: string;
  identifier?: string;
  proxy_warnings: ProxyWarning[];
}

interface ProxyWarning {
  column: string;
  correlated_with: string;
  correlation_coefficient: number;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
}
```

---

## 6. API Specification

### 6.1 REST API Endpoints

```
POST   /api/v1/datasets/upload
  - Body: multipart/form-data { file, org_id, model_name, domain, jurisdiction[] }
  - Returns: { dataset_id, upload_url, estimated_rows }
  
GET    /api/v1/datasets/{dataset_id}/schema-suggestions
  - Returns: { schema_map, proxy_warnings, confidence_scores }

POST   /api/v1/audits
  - Body: { dataset_id, schema_map, model_metadata }
  - Returns: { audit_id, job_id, estimated_completion_minutes }

GET    /api/v1/audits/{audit_id}
  - Returns: full Audit object with agent status breakdown

GET    /api/v1/audits/{audit_id}/status
  - Returns: { status, agent_statuses, progress_percent, eta_seconds }
  
GET    /api/v1/audits/{audit_id}/findings
  - Returns: Finding[] with counterfactual twins and legal violations

GET    /api/v1/audits/{audit_id}/report
  - Returns: { report_url, report_hash, generated_at }
  
POST   /api/v1/audits/{audit_id}/report/share
  - Returns: { share_token, share_url, expires_at }

GET    /api/v1/audits/{audit_id}/remediation
  - Returns: RemediationStrategy[] per finding

POST   /api/v1/audits/{audit_id}/synthetic-dataset
  - Body: { finding_ids[], n_samples }
  - Returns: { job_id } (async, triggers download when ready)

GET    /api/v1/organizations/{org_id}/dashboard
  - Returns: { audits[], bias_trend_data, benchmarks }

GET    /api/v1/organizations/{org_id}/audits
  - Query: ?page=1&limit=20&domain=lending&severity=RED
  - Returns: paginated Audit[]

POST   /api/v1/organizations/{org_id}/monitoring/alerts
  - Body: { model_id, metric, threshold, notification_email }
  - Returns: { alert_id }
```

### 6.2 WebSocket — Real-Time Audit Progress

```typescript
// Client subscribes to audit progress
ws.connect(`wss://api.equalyze.io/ws/audits/${audit_id}`)

// Server emits events:
{
  "event": "agent_started",
  "agent": "ingestion",
  "timestamp": "..."
}
{
  "event": "agent_complete", 
  "agent": "twin_engine",
  "findings_count": 3,
  "timestamp": "..."
}
{
  "event": "audit_complete",
  "overall_severity": "RED",
  "report_url": "...",
  "timestamp": "..."
}
{
  "event": "agent_error",
  "agent": "governance",
  "error": "...",
  "retrying": true,
  "timestamp": "..."
}
```

---

## 7. Gemini Integration Spec

### 7.1 Model Assignments

| Agent / Task | Model | Context Window Used | Reason |
|-------------|-------|---------------------|--------|
| Orchestrator | gemini-2.0-flash | Low (~2K) | Speed; structured JSON only |
| Schema tagging | gemini-1.5-flash | Medium (~8K) | Fast column analysis |
| Proxy detection | gemini-1.5-flash | Low (~4K) | Pattern matching |
| Counterfactual twin generation | gemini-2.0-pro | Medium (~12K) | Deep semantic reasoning |
| Bias genealogy | gemini-1.5-flash | Medium (~8K) | Structured analysis |
| Legal RAG reasoning | gemini-1.5-pro | Large (~50K) | Long context for regulation chunks |
| Remediation strategies | gemini-2.0-flash | Low (~4K) | Template-based, fast |
| Report narrative generation | gemini-1.5-flash | Medium (~16K) | Document synthesis |
| Synthetic data generation | gemini-2.0-pro | Large (~30K) | Realistic profile generation |

### 7.2 Vertex AI / Antigravity Configuration

```python
# agents/base_agent.py

import vertexai
from vertexai.preview.generative_models import GenerativeModel, GenerationConfig
from vertexai.preview import reasoning_engines

vertexai.init(project="equalyze-prod", location="us-central1")

class BaseEqualyzeAgent:
    
    def __init__(self, model_name: str, system_instruction: str):
        self.model = GenerativeModel(
            model_name=model_name,
            system_instruction=system_instruction
        )
        self.generation_config = GenerationConfig(
            temperature=0.1,      # Low temperature for auditing — consistency over creativity
            top_p=0.95,
            max_output_tokens=4096,
            response_mime_type="application/json"  # Force JSON output
        )
    
    async def invoke(self, prompt: str, context: dict = None) -> dict:
        full_prompt = self._build_prompt(prompt, context)
        response = await self.model.generate_content_async(
            full_prompt,
            generation_config=self.generation_config
        )
        return self._parse_response(response)
    
    def _parse_response(self, response) -> dict:
        import json
        try:
            return json.loads(response.text)
        except json.JSONDecodeError:
            # Attempt to extract JSON from response
            import re
            json_match = re.search(r'\{.*\}', response.text, re.DOTALL)
            if json_match:
                return json.loads(json_match.group())
            raise ValueError(f"Agent returned non-JSON response: {response.text[:200]}")
```

### 7.3 RAG Pipeline for Regulation Knowledge Base

```python
# services/regulation_rag.py

from vertexai.preview.language_models import TextEmbeddingModel
from google.cloud import aiplatform

class RegulationRAG:
    
    def __init__(self):
        self.embedding_model = TextEmbeddingModel.from_pretrained("text-embedding-004")
        self.index_endpoint = aiplatform.MatchingEngineIndexEndpoint(
            index_endpoint_name="projects/equalyze-prod/locations/us-central1/indexEndpoints/regulations-v1"
        )
    
    def retrieve_relevant_regulations(
        self, 
        bias_finding: dict, 
        jurisdiction: list[str],
        domain: str,
        top_k: int = 8
    ) -> list[dict]:
        
        # Build semantic query from finding
        query = f"""
        Bias type: {bias_finding['finding_type']}
        Protected attribute: {bias_finding['protected_attribute']}
        Domain: {domain}
        Severity: {bias_finding['severity']}
        Jurisdictions: {', '.join(jurisdiction)}
        """
        
        # Embed the query
        query_embedding = self.embedding_model.get_embeddings([query])[0].values
        
        # Filter by jurisdiction metadata
        filter_conditions = [
            aiplatform.matching_engine.matching_engine_index_endpoint.Namespace(
                name="jurisdiction",
                allow_tokens=jurisdiction + ["global"]
            )
        ]
        
        # Retrieve from vector index
        results = self.index_endpoint.find_neighbors(
            deployed_index_id="regulations-v1-deployed",
            queries=[query_embedding],
            num_neighbors=top_k,
            filter=filter_conditions
        )
        
        return [self._format_chunk(r) for r in results[0]]
```

---

## 8. Security & Privacy Architecture

### 8.1 Data Lifecycle

```
Upload → Encrypt in transit (TLS 1.3) 
       → Store encrypted at rest (AES-256, GCS) 
       → Process in isolated container (no cross-tenant access)
       → Delete after audit completion (default)
       → Optional: retain for 30/90/365 days (enterprise setting)
```

### 8.2 Tenant Isolation

- All data scoped to `org_id`; all queries include org_id filter
- Firestore security rules enforce org-level isolation
- GCS bucket paths: `gs://equalyze-datasets/{org_id}/{audit_id}/`
- Gemini prompts never include cross-tenant data; each audit processed independently

### 8.3 Audit Log Integrity

```python
# services/audit_logger.py

import hashlib
import json
from datetime import datetime

class ImmutableAuditLogger:
    
    def write_audit_entry(self, audit_id: str, event: dict) -> str:
        entry = {
            "audit_id": audit_id,
            "event": event,
            "timestamp": datetime.utcnow().isoformat(),
            "version": "1.0"
        }
        
        # Get previous entry hash (chain integrity)
        previous_hash = self._get_last_entry_hash(audit_id)
        entry["previous_hash"] = previous_hash
        
        # Hash this entry
        entry_json = json.dumps(entry, sort_keys=True)
        entry_hash = hashlib.sha256(entry_json.encode()).hexdigest()
        entry["entry_hash"] = entry_hash
        
        # Write to Firestore (append-only collection)
        self.db.collection('audit_logs').document(entry_hash).set(entry)
        
        return entry_hash
```

### 8.4 Access Control

| Role | Capabilities |
|------|-------------|
| Owner | Full access including billing, member management, delete audits |
| Admin | Create/run audits, view all reports, manage alerts |
| Analyst | Create/run audits, view reports for their own audits |
| Viewer | View reports shared with them (read-only) |
| External (share link) | View single report via share token (no auth required, time-limited) |

---

## 9. Infrastructure & Deployment

### 9.1 Cloud Architecture (Google Cloud)

```
equalyze-prod (GCP Project)
│
├── Cloud Run
│   ├── equalyze-api (FastAPI backend, auto-scaling 0-50 instances)
│   ├── equalyze-frontend (Next.js, auto-scaling)
│   └── equalyze-worker (Agent execution, higher CPU instances)
│
├── Cloud Tasks
│   └── audit-jobs queue (FIFO, 10 concurrent workers)
│
├── Vertex AI
│   ├── Gemini API (Pro + Flash)
│   └── Vector Search Index (regulations knowledge base)
│
├── Firestore
│   ├── organizations
│   ├── audits
│   ├── findings
│   └── audit_logs
│
├── Cloud Storage
│   ├── equalyze-datasets (uploads, encrypted, lifecycle policy)
│   └── equalyze-reports (generated PDFs)
│
├── Firebase Auth
│   └── Google, email/password, SAML enterprise SSO
│
└── Cloud Monitoring + Alerting
    ├── Latency p99 alerts
    ├── Error rate alerts
    └── Gemini API cost alerts
```

### 9.2 Environment Strategy

| Environment | Purpose | Data |
|------------|---------|------|
| `prod` | Live customer traffic | Real org data, isolated |
| `staging` | Pre-release validation | Synthetic test datasets only |
| `dev` | Developer iteration | Local Docker Compose |

### 9.3 Containerization

```dockerfile
# Dockerfile.api
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV PORT=8080
EXPOSE 8080

CMD ["uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "8080", "--workers", "4"]
```

---

## 10. Antigravity Agent Implementation Guide

This section is specifically for development with Google's Antigravity / Vertex AI Agent Builder.

### 10.1 Project Setup

```bash
# Install dependencies
pip install google-cloud-aiplatform[reasoningengine]
pip install google-cloud-firestore google-cloud-storage google-cloud-tasks
pip install pandas numpy scikit-learn fairlearn aif360
pip install fastapi uvicorn python-multipart weasyprint

# Authenticate
gcloud auth application-default login
gcloud config set project equalyze-prod

# Enable APIs
gcloud services enable aiplatform.googleapis.com
gcloud services enable firestore.googleapis.com
gcloud services enable cloudtasks.googleapis.com
gcloud services enable run.googleapis.com
```

### 10.2 Agent Registration in Antigravity

```python
# Deploy each agent as a Reasoning Engine

from vertexai.preview import reasoning_engines

# Deploy Orchestrator
orchestrator = reasoning_engines.ReasoningEngine.create(
    reasoning_engines.LangchainAgent(
        model="gemini-2.0-flash-001",
        tools=[dispatch_ingestion, dispatch_twin_engine, dispatch_governance, 
               dispatch_remediation, dispatch_reporting, write_audit_log],
        model_kwargs={"temperature": 0.0}
    ),
    requirements=["google-cloud-aiplatform[langchain,reasoningengine]"],
    display_name="equalyze-orchestrator-v1",
    description="Master orchestrator for Equalyze bias audit workflow"
)

# Same pattern for each specialist agent
```

### 10.3 Tool Definitions for Orchestrator

```python
# tools/orchestrator_tools.py

from vertexai.preview.generative_models import FunctionDeclaration, Tool

dispatch_ingestion_tool = FunctionDeclaration(
    name="dispatch_ingestion",
    description="Send dataset to the Ingestion Agent for parsing and schema analysis",
    parameters={
        "type": "object",
        "properties": {
            "job_id": {"type": "string", "description": "Unique audit job ID"},
            "dataset_ref": {"type": "string", "description": "GCS path to uploaded dataset"},
            "domain": {"type": "string", "description": "Business domain of the AI model"},
            "jurisdiction": {"type": "array", "items": {"type": "string"}}
        },
        "required": ["job_id", "dataset_ref", "domain"]
    }
)

dispatch_twin_engine_tool = FunctionDeclaration(
    name="dispatch_twin_engine",
    description="Send confirmed schema to Twin Engine Agent to run bias detection and generate counterfactual twins",
    parameters={
        "type": "object",
        "properties": {
            "job_id": {"type": "string"},
            "schema_map": {"type": "object", "description": "User-confirmed schema mapping"},
            "dataset_ref": {"type": "string"}
        },
        "required": ["job_id", "schema_map", "dataset_ref"]
    }
)

# ... (define all 6 orchestrator tools)

orchestrator_tools = Tool(
    function_declarations=[
        dispatch_ingestion_tool,
        dispatch_twin_engine_tool,
        dispatch_governance_tool,
        dispatch_remediation_tool,
        dispatch_reporting_tool,
        write_audit_log_tool
    ]
)
```

### 10.4 Agent-to-Agent Communication Pattern

```python
# Each specialist agent exposes an async execute() method
# Orchestrator calls them via Cloud Tasks (async) or direct HTTP (sync for fast agents)

# For async (long-running) agents — Twin Engine, Remediation:
async def dispatch_to_cloud_tasks(agent_name: str, payload: dict, job_id: str):
    from google.cloud import tasks_v2
    client = tasks_v2.CloudTasksAsyncClient()
    
    task = tasks_v2.Task(
        http_request=tasks_v2.HttpRequest(
            http_method=tasks_v2.HttpMethod.POST,
            url=f"https://equalyze-worker-xxx.run.app/agents/{agent_name}/execute",
            headers={"Content-Type": "application/json"},
            body=json.dumps({**payload, "job_id": job_id}).encode()
        )
    )
    await client.create_task(
        parent=f"projects/equalyze-prod/locations/us-central1/queues/audit-jobs",
        task=task
    )

# Agent callback updates Firestore + notifies Orchestrator via webhook
async def agent_complete_callback(job_id: str, agent_name: str, output: dict):
    db.collection('audits').document(job_id).update({
        f'agents.{agent_name}.status': 'complete',
        f'agents.{agent_name}.output': output,
        f'agents.{agent_name}.completed_at': datetime.utcnow()
    })
    # Notify orchestrator to proceed to next step
    await notify_orchestrator(job_id, agent_name, "complete")
```

### 10.5 Vector Store Population (Regulations)

```bash
# One-time setup: populate regulation knowledge base

python scripts/populate_regulations.py \
  --source regulations/ \
  --project equalyze-prod \
  --index-id regulations-v1 \
  --chunk-size 512 \
  --overlap 64
```

```python
# scripts/populate_regulations.py

from vertexai.preview.language_models import TextEmbeddingModel
import os, json

def chunk_regulation(text: str, chunk_size: int = 512, overlap: int = 64) -> list[dict]:
    words = text.split()
    chunks = []
    for i in range(0, len(words), chunk_size - overlap):
        chunk_text = ' '.join(words[i:i + chunk_size])
        chunks.append(chunk_text)
    return chunks

def populate_index():
    embedding_model = TextEmbeddingModel.from_pretrained("text-embedding-004")
    all_embeddings = []
    
    for jurisdiction in ['india', 'eu', 'usa', 'global']:
        reg_dir = f"regulations/{jurisdiction}/"
        for filename in os.listdir(reg_dir):
            text = open(f"{reg_dir}{filename}").read()
            metadata = json.load(open(f"{reg_dir}{filename.replace('.md', '.meta.json')}"))
            chunks = chunk_regulation(text)
            
            for i, chunk in enumerate(chunks):
                embedding = embedding_model.get_embeddings([chunk])[0].values
                all_embeddings.append({
                    "id": f"{jurisdiction}_{filename}_{i}",
                    "embedding": embedding,
                    "restricts": [{"namespace": "jurisdiction", "allow": [jurisdiction]}],
                    "crowding_tag": {"value": jurisdiction},
                    "metadata": {**metadata, "chunk_index": i, "chunk_text": chunk}
                })
    
    # Upsert to Vector Search index
    # ... (use Vertex AI SDK to upsert)
```

---

## 11. Testing Strategy

### 11.1 Test Categories

| Category | Tools | Coverage Target |
|----------|-------|----------------|
| Unit — Fairness metrics | pytest | 100% function coverage |
| Unit — Agent prompt outputs | pytest + Gemini mock | All prompt templates |
| Integration — API endpoints | pytest + httpx | All routes, happy + error paths |
| Integration — Agent pipeline | pytest + staging Gemini | Full audit job on synthetic dataset |
| E2E — Full audit flow | Playwright | Upload → Schema → Run → Report |
| Performance | Locust | 50 concurrent audits, p95 < 10min |
| Bias metric accuracy | Comparison vs. Fairlearn reference | All 5 metrics within 0.001 tolerance |
| Twin quality | Semantic similarity test suite | 90%+ twins score ≥ 0.85 |

### 11.2 Test Datasets

Maintain a library of synthetic test datasets for CI:

```
tests/fixtures/datasets/
  healthcare_biased_gender.csv       # Known gender bias in treatment outcomes
  healthcare_unbiased.csv            # Clean dataset — should produce GREEN
  lending_disparate_impact_race.csv  # Known < 0.8 DIR on race proxy
  lending_intersectional.csv         # Gender × region intersectional bias
  insurance_age_bias.csv             # Age-based premium discrimination
  edge_cases/
    single_protected_group.csv       # Only one group in dataset
    missing_outcome.csv              # Malformed — should fail gracefully
    high_cardinality_protected.csv   # Protected attribute has 50+ unique values
```

### 11.3 Regression Tests for Counterfactual Twins

```python
# tests/test_twin_engine.py

def test_twin_preserves_non_protected_attributes():
    """Twin must preserve all non-protected attributes within 5% tolerance"""
    original = sample_lending_profile()
    twin = counterfactual_agent.generate_twin(original, flip_attribute="gender")
    
    for attr in VALID_FACTORS:
        if isinstance(original[attr], (int, float)):
            assert abs(twin[attr] - original[attr]) / original[attr] < 0.05
        else:
            assert twin[attr] == original[attr]

def test_twin_quality_score_threshold():
    """All generated twins must have quality score >= 0.85"""
    for profile in BIASED_LENDING_PROFILES:
        twin_result = counterfactual_agent.generate_twin(profile, flip_attribute="gender")
        assert twin_result['twin_quality_score'] >= 0.85

def test_twin_outcome_differs():
    """Twin must have a different outcome than original"""
    original = KNOWN_REJECTED_FEMALE_PROFILE
    twin = counterfactual_agent.generate_twin(original, flip_attribute="gender")
    assert twin['twin_outcome'] != original['outcome']
```

---

## 12. Appendix

### 12.1 Fairness Metric Threshold Reference

| Metric | GREEN | AMBER | RED | Legal Significance |
|--------|-------|-------|-----|-------------------|
| Demographic Parity Difference | < 0.10 | 0.10–0.20 | > 0.20 | No specific threshold; AMBER = investigate |
| Disparate Impact Ratio | ≥ 0.80 | 0.60–0.80 | < 0.60 | < 0.80 = 4/5ths rule violation (ECOA, FHA) |
| Equalized Odds Difference | < 0.10 | 0.10–0.20 | > 0.20 | > 0.10 = signal for healthcare regulatory review |
| FPR Parity Difference | < 0.10 | 0.10–0.20 | > 0.20 | — |
| Individual Fairness Score | ≥ 0.90 | 0.75–0.90 | < 0.75 | — |

### 12.2 Agent Prompt Version Control

All agent prompts are versioned in `agents/prompts/` as separate markdown files. Changes to any prompt require:
1. Increment `PROMPT_VERSION` constant in the agent file
2. Re-run the full test suite with the new prompt
3. Update the prompt file with the version and changelog header
4. Document expected output change in PR description

This ensures audit reports can always be traced to the exact prompt version that generated them — critical for regulatory defensibility.

### 12.3 Gemini API Cost Estimates

| Operation | Model | Avg tokens (in/out) | Cost per audit |
|-----------|-------|---------------------|----------------|
| Schema tagging | Flash | 4K / 1K | ~$0.001 |
| Twin generation (per finding) | Pro | 8K / 2K | ~$0.05 |
| Legal RAG (per finding) | Pro 1.5 | 40K / 3K | ~$0.12 |
| Remediation (per finding) | Flash | 3K / 2K | ~$0.001 |
| Report narrative | Flash | 10K / 4K | ~$0.002 |
| **Total per audit (3 findings)** | | | **~$0.50–0.80** |

### 12.4 Repository Structure

```
equalyze/
├── frontend/               # Next.js application
│   ├── app/
│   ├── components/
│   ├── lib/
│   └── package.json
├── api/                    # FastAPI backend
│   ├── agents/
│   ├── routers/
│   ├── services/
│   ├── models/
│   └── main.py
├── regulations/            # Regulation knowledge base (markdown)
│   ├── india/
│   ├── eu/
│   └── usa/
├── scripts/
│   ├── populate_regulations.py
│   └── seed_test_data.py
├── tests/
│   ├── fixtures/
│   └── unit/ integration/ e2e/
├── docker-compose.yml      # Local dev
├── cloudbuild.yaml         # CI/CD pipeline
└── README.md
```

---

*Document Version 1.0 — Equalyze / Team Trident — Confidential*  
*Technical decisions subject to revision during development sprint*
