# Equalyze

## What This Is

An enterprise-grade AI bias auditing and governance platform that makes algorithmic discrimination visible, explainable, and legally actionable. Built for the Google Solution Challenge 2026 (Build with AI / SDG 10: Reduced Inequalities).

Equalyze ingests model predictions, detects hidden intersectional bias, and **proves it** by generating human-readable "Counterfactual Twins." It then maps findings to 2026 regulatory frameworks and produces an immutable, ISO/IEC 42001-compliant "Bias Receipt."

## Core Value

Bridge the gap between raw statistical fairness tools (Fairlearn, AIF360) and enterprise-grade compliance platforms. Provide non-technical stakeholders with **narrative proof of discrimination**, not just numbers.

## Context

- **Target Event:** Google Solution Challenge 2026, 3-minute demo video
- **Judging Criteria:** Innovation (25%), Technical Merit (40%), UX/Design (10%), SDG Alignment (25%)
- **Regulatory Deadline:** EU AI Act enforcement Aug 2026, India DPDP Rules 2026
- **Stack:** FastAPI (Python) backend + Next.js 16 (TypeScript) frontend + Firebase Auth + Gemini 2.0 Pro/Flash
- **Demo Domains:** Fintech Lending (primary), Healthcare Triage (secondary)

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Next.js Frontend                      │
│  Dashboard │ New Audit │ Results │ Monitoring │ Remediation│
└─────────────────────┬───────────────────────────────────┘
                      │ REST API
┌─────────────────────┴───────────────────────────────────┐
│                   FastAPI Backend                         │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │ Ingestion    │  │ Twin Engine  │  │ Governance   │   │
│  │ Agent        │→ │ Agent        │→ │ Agent        │   │
│  │ (Flash)      │  │ (Pro)        │  │ (Flash)      │   │
│  └──────────────┘  └──────────────┘  └──────────────┘   │
│         │                  │                │            │
│  ┌──────┴──────┐  ┌───────┴──────┐  ┌──────┴──────┐   │
│  │ Proxy       │  │ Fairness     │  │ Remediation │   │
│  │ Detector    │  │ Evaluator    │  │ Agent       │   │
│  └─────────────┘  └──────────────┘  └─────────────┘   │
│                                                          │
│  ┌─────────────────────────────────────────────────┐    │
│  │ Orchestrator Agent (coordinates full pipeline)   │    │
│  └─────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
                      │
          Firebase (Auth + Firestore)
```

## Requirements

### Validated

- ✓ CSV dataset upload with auto-profiling — existing (`api/services/dataset_parser.py`)
- ✓ Gemini-powered schema auto-tagging (protected/valid/outcome) — existing (`api/agents/ingestion_agent.py`)
- ✓ Proxy variable detection (Cramér's V + Pearson) — existing (`api/services/proxy_detector.py`)
- ✓ 5-metric fairness evaluation (DIR, DPD, EOd, FPR, Individual) — existing (`api/services/fairness_metrics.py`)
- ✓ Intersectional analysis (2-attribute cross-group) — existing (`fairness_metrics._intersectional_analysis`)
- ✓ Counterfactual Twin generation via Gemini Pro — existing (`api/agents/twin_engine_agent.py`)
- ✓ Bias Genealogy (4-level root cause analysis) — existing (`twin_engine_agent._generate_genealogy`)
- ✓ Governance mapping to legal regulations — existing (`api/agents/governance_agent.py`)
- ✓ Remediation strategy generation — existing (`api/agents/remediation_agent.py`)
- ✓ Synthetic data generation for dataset balancing — existing (`remediation_agent.generate_synthetic_dataset`)
- ✓ Multi-agent orchestration pipeline — existing (`api/agents/orchestrator.py`)
- ✓ Scheduled monitoring with drift detection — existing (`api/routers/monitoring.py`)
- ✓ Firebase authentication — existing (`api/services/db.py`, `frontend/lib/firebase.ts`)
- ✓ SHA-256 hashing for audit integrity — existing (`api/utils/crypto.py`)

### Active

- [ ] **Legal RAG Agent** — Replace hardcoded regulation prompts with Vertex AI Vector Search over actual statute text (EU AI Act, DPDP, ECOA, NIST)
- [ ] **Intersectional Deep-Dive in Twin Engine** — Generate Counterfactual Twins for composite discrimination (e.g., Rural + Female), not just single-axis
- [ ] **Async Synthetic Data Validation** — After generating synthetic data, automatically re-evaluate DIR to prove improvement > 0.80
- [ ] **BigQuery Immutable Audit Log** — SHA-256 hashed append-only audit trail for ISO/IEC 42001 compliance
- [ ] **Cognitive Forcing Functions** — UI checklist before PDF/report export (Article 14 Human-in-the-Loop compliance)
- [ ] **Bias Receipt PDF Generator** — EU AI Act Annex IV-compliant downloadable report
- [ ] **Domain-Aware Legal Context** — Dynamic Legal RAG search parameters change based on selected domain (healthcare→FDA, fintech→RBI)

### Out of Scope

- Google Cloud Storage integration — Using local storage for prototype (GCS can be swapped in later)
- Cloud Run containerization — Running locally for demo
- Full BigQuery production deployment — Will use mock/lite version for prototype, with real BQ integration as stretch goal

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Gemini Pro for twins, Flash for governance/remediation | Pro has better narrative reasoning; Flash is faster for structured JSON | Working well |
| Pure numpy for fairness metrics (no sklearn) | Zero external dependency risk, full auditability | Working well |
| Firebase for auth + Firestore for audit storage | Google ecosystem alignment for GSC | Working well |
| Hardcoded regulation text in governance prompts | Quick prototype; needs upgrade to RAG | Pending upgrade |
| Local proxy detection (statistical) vs Gemini-powered | Deterministic results, no hallucination risk | Keep as-is |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-22 after initialization*
