# Equalyze — Product Requirements Document (PRD)
**Version:** 1.0  
**Status:** Draft  
**Last Updated:** April 2026  
**Authors:** Team Trident  

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Vision & Mission](#3-vision--mission)
4. [Target Users & Personas](#4-target-users--personas)
5. [Market Context](#5-market-context)
6. [Product Goals & Success Metrics](#6-product-goals--success-metrics)
7. [Feature Scope](#7-feature-scope)
8. [User Stories & Acceptance Criteria](#8-user-stories--acceptance-criteria)
9. [Demo Use Cases](#9-demo-use-cases)
10. [Non-Functional Requirements](#10-non-functional-requirements)
11. [Out of Scope](#11-out-of-scope)
12. [Risks & Mitigations](#12-risks--mitigations)
13. [Appendix](#13-appendix)

---

## 1. Executive Summary

**Equalyze** is an enterprise-grade AI bias detection and governance platform that makes algorithmic discrimination visible, explainable, and legally actionable — before it costs a life or a livelihood.

Organizations deploying AI systems in high-stakes domains (healthcare, lending, insurance, hiring) are unknowingly exposing themselves to discriminatory outcomes rooted in biased training data, proxy variables, and feedback loops. Current solutions either require deep ML expertise to interpret, or produce statistical summaries that legal and compliance teams cannot act on.

Equalyze solves this by combining a universal model ingestion layer, a Counterfactual Twin Engine powered by Gemini, and an enterprise governance layer that produces legally-grounded audit reports, severity scoring, and remediation pathways — all in a format that a CEO, regulator, or compliance officer can read without a data science background.

**Core differentiator:** Equalyze does not just *measure* bias. It *proves* it — with generated adversarial examples that demonstrate discrimination in a single, undeniable visual.

---

## 2. Problem Statement

### 2.1 The Invisible Discrimination Crisis

AI systems are now making consequential decisions at scale:
- A hospital triage algorithm deprioritizes patients from lower-income zip codes
- A lending model systematically denies rural female business owners despite creditworthy profiles
- An insurance underwriting system charges higher premiums to certain ethnic groups
- A hiring screener filters out candidates with names associated with minority groups

None of these organizations *intended* to discriminate. The bias is buried in historical data patterns, proxy variables, and compounding feedback loops. Organizations only discover the problem after a lawsuit, a regulator's audit, or — worst case — a preventable death.

### 2.2 Current Tools Are Inadequate

| Tool Type | Limitation |
|-----------|-----------|
| Statistical fairness dashboards | Measure correlation, do not prove causation. Output is unreadable by non-technical stakeholders. |
| One-off ML audits | Point-in-time snapshots, expensive, require external consultants, no continuous monitoring. |
| In-house testing | No standardized methodology. Cannot be presented to regulators as defensible evidence. |
| Academic fairness libraries (Fairlearn, AI Fairness 360) | Require ML engineers to operate. No governance layer. Not enterprise-ready. |

### 2.3 The Regulatory Gap Is Closing Fast

- **India:** Digital Personal Data Protection Act (DPDPA) 2023 introduces accountability for automated decision-making
- **EU:** EU AI Act (2024) mandates bias testing for high-risk AI systems with significant penalties
- **USA:** Equal Credit Opportunity Act (ECOA) requires demonstrable non-discrimination in lending
- **Global:** ISO/IEC 42001 AI Management Systems standard emerging as the enterprise benchmark

Organizations that cannot produce a defensible, documented bias audit trail are now legally exposed. Equalyze turns that liability into a compliance asset.

---

## 3. Vision & Mission

### Vision
A world where no consequential AI decision goes unchecked — where fairness is engineered, not assumed.

### Mission
To give every organization — regardless of their technical sophistication — the tools to detect, understand, explain, and fix algorithmic bias before it causes harm.

### North Star Sentence
*"Organizations don't know their AI is discriminating until someone gets hurt. We make the invisible, visible — before it costs a life or a livelihood."*

---

## 4. Target Users & Personas

### Primary Personas

#### Persona 1 — The Compliance Officer (Primary Buyer)
- **Name:** Priya, Chief Compliance Officer at a mid-size NBFC
- **Context:** Responsible for ensuring AI-assisted lending models comply with RBI guidelines and ECOA equivalents. Has no ML background. Reports to board.
- **Pain:** Cannot interpret data science team's fairness reports. Cannot present them to regulators. Fears legal exposure.
- **Goal:** A legally defensible audit document she can file with regulators and present to the board.
- **Quote:** *"I don't need to understand the math. I need to be able to sign the report."*

#### Persona 2 — The Data Science Lead (Primary User)
- **Name:** Arjun, Head of ML at a health-tech startup
- **Context:** Builds and maintains predictive models for patient risk scoring. Cares about model performance AND fairness. Time-constrained.
- **Pain:** Has to manually write fairness evaluation scripts for every new model deployment. No standardized process. No counterfactual analysis tooling.
- **Goal:** A plug-in audit tool that runs on any model output CSV, produces a full bias report in minutes, and catches intersectional bias he may have missed.
- **Quote:** *"I want to upload my model's predictions and get a comprehensive bias report — not spend a week writing evaluation code."*

#### Persona 3 — The Legal/Regulatory Counsel (Report Consumer)
- **Name:** Sanjay, Senior Counsel at a private insurance company
- **Context:** Responds to regulatory inquiries. Needs to demonstrate the company proactively audits its AI systems.
- **Pain:** Existing bias reports are full of statistical jargon he cannot interpret or present.
- **Goal:** A plain-English "Bias Receipt" that maps detected bias to specific laws and can be filed as evidence of due diligence.
- **Quote:** *"Show me which regulation this violates and what we did about it."*

#### Persona 4 — The CTO / AI Product Owner (Executive Sponsor)
- **Name:** Meera, CTO at a Series B fintech
- **Context:** Oversees all AI product development. Faces increasing pressure from investors and regulators on responsible AI.
- **Goal:** Enterprise-wide bias monitoring dashboard. Trend lines over time. Automated re-audit scheduling.
- **Quote:** *"I need to know if our models are drifting toward bias before a journalist finds out."*

### Secondary Personas
- Regulators (IRDAI, RBI, SEBI) consuming third-party audit reports
- Enterprise customers' legal teams reviewing vendor AI systems
- Academic researchers studying bias in deployed systems

---

## 5. Market Context

### 5.1 Industry Verticals

**Healthcare & Insurance (Vertical 1 — Demo Use Case A)**
- AI is used for patient triage, risk stratification, treatment recommendation, insurance underwriting, claims processing
- Demographic bias in healthcare AI has been extensively documented (Obermeyer et al., 2019 — widely cited race bias in a major US health system)
- Stakes: life and death, plus HIPAA and emerging AI-specific healthcare regulations

**MSME Lending & Finance (Vertical 2 — Demo Use Case B)**
- India has 63 million MSMEs; AI-driven credit scoring is increasingly used by fintechs, NBFCs, and banks
- Gender and geographic bias in lending has been documented by RBI working papers
- Stakes: economic livelihood, RBI Fair Practices Code, ECOA equivalents

### 5.2 Competitive Landscape

| Competitor | Strength | Gap vs. Equalyze |
|------------|----------|-----------------|
| IBM OpenScale / Watson OpenScale | Enterprise-grade, well-funded | No counterfactual twin; requires IBM stack; expensive |
| Fiddler AI | Good explainability layer | No legal exposure mapping; US-focused |
| Arthur AI | Real-time monitoring | No BYOM (bring your own model); technical-only output |
| Holistic AI | Governance focus | No generative counterfactual proofs; no synthetic dataset remediation |
| Fairlearn / AZ Fairness 360 | Open source, robust | No UI; no enterprise governance; no legal layer |

**Equalyze's edge:** The only platform that (a) works on any model via CSV ingestion, (b) *proves* discrimination with AI-generated counterfactual twins rather than measuring it statistically, and (c) maps findings to specific regulations in a legally-formatted audit report.

---

## 6. Product Goals & Success Metrics

### 6.1 Product Goals

| Goal | Description |
|------|-------------|
| **G1 — Universal Ingestion** | Any organization with a CSV of model predictions can run a bias audit in under 10 minutes, regardless of their AI stack |
| **G2 — Counterfactual Proof** | Every detected bias instance has an AI-generated adversarial twin that demonstrates discrimination with a single concrete example |
| **G3 — Legal Explainability** | Every audit report maps findings to relevant regulations (DPDPA, EU AI Act, ECOA, RBI FPC) and assigns a legal exposure score |
| **G4 — Continuous Governance** | Organizations can schedule automated re-audits and track bias drift over time on a monitoring dashboard |
| **G5 — Remediation Pathway** | The platform does not just detect bias — it generates corrected synthetic training datasets to fix it |

### 6.2 Success Metrics (KPIs)

| Metric | Target |
|--------|--------|
| Time to first audit report (from CSV upload) | < 10 minutes |
| Counterfactual twin generation accuracy (semantic similarity score > 0.85) | ≥ 90% of cases |
| Bias Receipt readability (non-technical user comprehension score) | ≥ 80% in user testing |
| Legal exposure mapping precision (correct regulation citation) | ≥ 95% |
| False positive rate on bias detection | < 5% |
| Audit report download / share rate | > 60% of sessions |

---

## 7. Feature Scope

### 7.1 Layer 1 — Universal Ingestion & Schema Mapping

**F1.1 — CSV / Dataset Upload Portal**
- Drag-and-drop upload interface for model prediction datasets
- Supports CSV, XLSX, and JSON formats
- File size limit: 500MB (covers most enterprise datasets)
- Progress indicator with estimated processing time

**F1.2 — Intelligent Schema Mapper**
- Auto-detects column types (numeric, categorical, text, binary)
- User tags columns into three categories:
  - **Protected Attributes** (race, gender, age, religion, disability, zip code, national origin)
  - **Valid Decision Factors** (income, credit score, medical history — legitimate inputs)
  - **Outcome Variable** (the model's prediction/decision column)
- AI-assisted tagging: Gemini suggests column categories based on column names + sample values
- Conflict detector: warns if a "valid factor" is a statistical proxy for a protected attribute (e.g., "zip code" correlated with race)

**F1.3 — Model Metadata Form**
- Organization name, model name, deployment domain (dropdown: healthcare, lending, insurance, hiring, other)
- Model type (classification, regression, ranking, NLP scoring)
- Deployment date, last retrained date
- Applicable jurisdiction (India, EU, USA, Global)

### 7.2 Layer 2 — Counterfactual Twin Engine

**F2.1 — Statistical Bias Detection**
Runs the following fairness metrics automatically:
- **Demographic Parity** — Are positive outcomes equally distributed across protected groups?
- **Equalized Odds** — Are true positive and false positive rates equal across groups?
- **Disparate Impact Ratio** — Is any group receiving positive outcomes at < 80% the rate of the most-favored group? (4/5ths rule, legal standard)
- **Individual Fairness Score** — Are similar individuals treated similarly?
- **Intersectional Analysis** — Bias at the intersection of two protected attributes (e.g., rural + female + low income)

**F2.2 — Counterfactual Twin Generation (Core Differentiator)**
- For each detected bias instance, Gemini generates a "Counterfactual Twin" — an adversarial example where all non-protected attributes are held constant and only the protected attribute changes
- The twin is semantically validated (similarity score must exceed threshold) before being surfaced
- Output: side-by-side card showing "Original Profile → Same Decision Inputs → Different Protected Attribute → Different Outcome"
- Twin quality score displayed (semantic distance, attribute preservation %)
- **The "Gut Punch" moment:** The twin is rendered as a human-readable narrative, not a data table

**F2.3 — Bias Genealogy Tree**
- Visualizes where in the data pipeline the bias entered:
  - Level 1: Raw data (historical underrepresentation)
  - Level 2: Feature engineering (proxy variable creation)
  - Level 3: Model training (weight amplification)
  - Level 4: Deployment feedback loop (self-reinforcing bias)
- Each node shows contributing bias percentage and root cause explanation
- Actionable callout at each node: *"Fix at this level by..."*

### 7.3 Layer 3 — Governance & Explainability

**F3.1 — Bias Receipt (Plain-English Audit Report)**
- Auto-generated after every audit
- Three reading levels: Executive Summary (1 page), Detailed Findings (5–10 pages), Technical Appendix (full statistical output)
- Severity traffic light system: 🟢 Green (compliant) / 🟡 Amber (monitor) / 🔴 Red (immediate action required)
- Downloadable as PDF and shareable via secure link
- Co-branded with organization name and audit timestamp

**F3.2 — Legal Exposure Score**
- Maps each detected bias to applicable regulations:
  - India: DPDPA 2023, RBI Fair Practices Code, Insurance Regulatory Guidelines
  - EU: EU AI Act Articles 9/10/13, GDPR Article 22 (automated decision-making)
  - USA: ECOA, Fair Housing Act, Title VII, HIPAA
- Assigns a legal risk score per finding (Low / Medium / High / Critical)
- Links to relevant regulatory text for legal team reference
- Outputs a "Regulatory Action Required" checklist

**F3.3 — Audit Log & Chain of Custody**
- Immutable audit trail: who ran the audit, when, on what dataset version, with what parameters
- Tamper-evident audit report hashing (SHA-256)
- Organization-level audit history with version comparison ("bias score increased 19% since last audit")
- Export-ready for regulatory submission (PDF/A compliant)

### 7.4 Layer 4 — Remediation Engine

**F4.1 — Remediation Recommendation Engine**
- For each detected bias, generates 3 remediation strategies ranked by effort and impact:
  - Data-level fix (re-sample, re-weight, collect more data)
  - Feature-level fix (remove proxy variable, use causal features)
  - Model-level fix (post-processing threshold adjustment, adversarial debiasing)
- Estimated effort (hours), estimated bias reduction, and implementation guidance per strategy

**F4.2 — Synthetic Fairness Dataset Generator**
- After audit, offers to generate a corrected synthetic training dataset
- Fills historical underrepresentation gaps using Gemini + statistical sampling
- Generates realistic synthetic profiles of underrepresented groups (e.g., rural female MSME borrowers) that preserve statistical distributions
- Outputs augmented dataset as CSV with generation report
- Clear disclosure: synthetically generated records are labeled and must not be used for individual decision-making

### 7.5 Layer 5 — Continuous Monitoring Dashboard

**F5.1 — Bias Drift Monitor**
- Organization-level dashboard showing all deployed models
- Bias score trend line over time per model per protected attribute
- Alert thresholds: automated notifications when bias drift exceeds configured limit
- Scheduled re-audit: weekly, monthly, quarterly
- "Bias Velocity" metric: rate of change of bias score (catching acceleration early)

**F5.2 — Comparative Benchmarking**
- Industry anonymized benchmarks: "Your gender bias score is in the 87th percentile for Indian NBFCs"
- Regulatory threshold overlays: shows where organization sits relative to legal compliance thresholds
- Peer comparison (anonymized): compare against industry peers who have consented to benchmarking

---

## 8. User Stories & Acceptance Criteria

### Epic 1 — Ingestion

**US-001**
> As a Data Science Lead, I want to upload my model's prediction CSV and have Equalyze auto-suggest which columns are protected attributes, so that I can set up an audit in under 5 minutes.

**Acceptance Criteria:**
- CSV upload completes in < 30 seconds for files up to 100MB
- Gemini auto-tags columns with > 80% accuracy on standard column names
- User can override any auto-suggestion
- Schema map is saved and reusable for future audits of the same model

**US-002**
> As a Compliance Officer, I want to be warned if my "valid" decision factors are statistically proxying protected attributes, so that I am not inadvertently approving a model that discriminates indirectly.

**Acceptance Criteria:**
- Proxy detection runs automatically after schema mapping
- Proxy alert includes correlation coefficient and plain-English explanation
- Alert severity is graded (Low/Medium/High correlation)

### Epic 2 — Bias Detection

**US-003**
> As a Data Science Lead, I want to see a comprehensive set of fairness metrics for every protected attribute, so that I have full coverage of potential bias vectors.

**Acceptance Criteria:**
- All 5 fairness metrics computed for every protected attribute
- Results displayed with metric value, pass/fail threshold, and plain-English interpretation
- Intersectional analysis available for any two-attribute combination

**US-004**
> As a Compliance Officer, I want to see a specific example of a discriminated individual with an identical twin who received a better outcome, so that I can understand the bias intuitively without statistics.

**Acceptance Criteria:**
- At least 1 counterfactual twin generated per flagged protected attribute
- Twin profile presented as a side-by-side human-readable card
- Semantic similarity score of twin shown (must be ≥ 0.85)
- Twin narrative written in plain English (8th-grade reading level target)

### Epic 3 — Governance

**US-005**
> As Legal Counsel, I want to download a legally-formatted audit report that maps findings to specific regulations, so that I can submit it to regulators as evidence of due diligence.

**Acceptance Criteria:**
- Report available as PDF download within 2 minutes of audit completion
- Each finding includes regulation name, article number, and plain-English description of potential violation
- Report includes audit metadata: organization, date, dataset hash, auditor (Equalyze v1.0)
- Report is digitally signed (SHA-256 hash included)

**US-006**
> As a CTO, I want to see a trend line of my models' bias scores over time, so that I can detect and respond to bias drift before it becomes a regulatory problem.

**Acceptance Criteria:**
- Dashboard shows monthly bias score per model per attribute
- Configurable alert threshold triggers email notification
- Dashboard accessible to invited team members with role-based permissions

### Epic 4 — Remediation

**US-007**
> As a Data Science Lead, I want to receive specific, ranked remediation recommendations for each detected bias, so that I know exactly what to do and in what order.

**Acceptance Criteria:**
- At least 3 remediation options per finding
- Each option includes: description, implementation difficulty (Low/Med/High), estimated bias reduction %, code snippet or library reference
- Recommendations prioritized by impact-to-effort ratio

---

## 9. Demo Use Cases

### 9.1 Use Case A — Healthcare / Insurance

**Scenario:** A health insurance company's AI system for claim approval and risk premium calculation.

**Dataset:** Patient profiles including age, diagnosis codes, treatment history, zip code, income bracket, and premium outcome.

**Protected Attributes to Audit:** Zip code (proxy for race/socioeconomic status), gender, age.

**The Counterfactual Twin Reveal:**
> *"Patient A: 45-year-old, Type 2 Diabetes, same BMI, same treatment history, urban zip code — Premium: ₹8,400/year. Patient B: identical in every clinical measure, rural zip code — Premium: ₹14,200/year."*

**Emotional register:** Lead with the human cost. Same vitals. Different zip code. The algorithm charges you 69% more — not because you're sicker, but because of where you were born.

**Legal exposure surfaced:** IRDAI guidelines on non-discriminatory underwriting, EU AI Act high-risk AI classification for insurance.

### 9.2 Use Case B — MSME Lending / Finance

**Scenario:** An NBFC's AI-powered credit scoring and loan approval system for small business loans.

**Dataset:** Business owner profiles including annual revenue, years in business, credit score, business type, gender, geographic region, and loan approval outcome.

**Protected Attributes to Audit:** Gender, geographic region (urban vs. rural).

**The Counterfactual Twin Reveal:**
> *"Applicant A: Male business owner, ₹28L annual revenue, 4 years operation, credit score 710 — Approved, 12.5% interest. Applicant B: Female business owner, identical financials — Rejected."*

**Emotional register:** Lead with economic scale. 63 million MSMEs in India. If the algorithm is systematically wrong on gender, the macroeconomic cost is enormous — and the individual cost is a business that never grows.

**Legal exposure surfaced:** RBI Fair Practices Code, DPDPA 2023 automated decision accountability provisions.

---

## 10. Non-Functional Requirements

| Category | Requirement |
|----------|-------------|
| **Performance** | Audit completion < 10 min for datasets up to 500MB; Twin generation < 30 sec per instance |
| **Scalability** | Support concurrent audits from 100+ enterprise organizations |
| **Security** | Data encrypted in transit (TLS 1.3) and at rest (AES-256); datasets deleted after audit unless explicitly retained by user |
| **Privacy** | PII handling compliant with DPDPA 2023 and GDPR; option to anonymize before processing |
| **Availability** | 99.5% uptime SLA for enterprise tier |
| **Auditability** | All system actions logged; tamper-evident audit trail |
| **Accessibility** | WCAG 2.1 AA compliant UI |
| **Internationalization** | Interface available in English; report generation in English and Hindi (V1); multilingual expansion in V2 |

---

## 11. Out of Scope

The following are explicitly **not** in scope for V1:

- Real-time API integration into customer's live model inference pipeline (V2)
- White-label / embedded SDK for third-party platforms (V2)
- Native connectors for specific ML platforms (SageMaker, Vertex AI, Azure ML) — V2
- Causal inference modeling beyond counterfactual generation (research track)
- Automated model retraining using synthetic dataset (V2 — V1 generates dataset, customer applies it)
- Human-in-the-loop review workflow for disputed audit findings (V2)

---

## 12. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Gemini API latency spikes during twin generation | Medium | High | Async job queue; cache similar twin generations; fallback to statistical summary |
| Low-quality counterfactual twins (semantic drift) | Medium | High | Semantic similarity threshold gate; retry with different prompt; surface confidence score to user |
| Organizations misuse "clean" audit as a liability shield without fixing bias | High | Medium | Audit report explicitly states findings require remediation; include disclaimer; remediation tracking in V2 |
| Dataset with no clear protected attribute columns | Low | Medium | Gemini-assisted detection of implicit protected attributes from column name analysis |
| Regulatory citation becomes outdated | Medium | High | Regulation database versioned and updated quarterly; date-stamps on all citations |
| Data privacy concerns — organizations reluctant to upload real data | Medium | High | Offer local processing mode (V2); data deletion guarantee prominently communicated |

---

## 13. Appendix

### Glossary

| Term | Definition |
|------|-----------|
| **Counterfactual Twin** | An AI-generated adversarial profile that is identical to a real instance in all non-protected attributes but differs in a protected attribute, demonstrating that a different outcome would have occurred |
| **Demographic Parity** | A fairness criterion requiring that the positive outcome rate is equal across all demographic groups |
| **Disparate Impact** | The 4/5ths rule: a policy has disparate impact if a protected group receives positive outcomes at less than 80% the rate of the most-favored group |
| **Equalized Odds** | A fairness criterion requiring equal true positive and false positive rates across protected groups |
| **Bias Drift** | The phenomenon where a model's bias metrics worsen over time due to changes in input data distribution |
| **Bias Genealogy Tree** | Equalyze's proprietary visualization of where in the data pipeline bias was introduced |
| **Legal Exposure Score** | Equalyze's composite score mapping detected bias to regulatory risk, aggregated across all applicable regulations |
| **Proxy Variable** | A feature that correlates strongly with a protected attribute and may act as a stand-in for it in model decision-making |
| **Synthetic Fairness Dataset** | A generated dataset that augments historical data with statistically realistic profiles of underrepresented groups |

### Regulatory Reference Table

| Regulation | Jurisdiction | Relevant Articles | Key Requirement |
|-----------|-------------|------------------|----------------|
| DPDPA 2023 | India | Section 4, 8 | Accountability for automated processing of personal data |
| RBI Fair Practices Code | India | Para 3 | Non-discriminatory lending practices |
| EU AI Act | EU | Art. 9, 10, 13, 15 | Risk management, data governance, transparency, accuracy for high-risk AI |
| GDPR | EU | Art. 22 | Right not to be subject to solely automated decisions |
| ECOA / Regulation B | USA | 12 CFR Part 202 | Prohibition on discrimination in credit on basis of protected characteristics |
| Fair Housing Act | USA | 42 U.S.C. § 3604 | Prohibition on discriminatory housing/insurance practices |
| HIPAA | USA | 45 CFR Parts 160, 164 | Non-discrimination in health data processing |

---

*Document Version 1.0 — Equalyze / Team Trident — Confidential*
