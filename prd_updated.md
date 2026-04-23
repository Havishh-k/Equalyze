# Equalyze — Product Requirements Document (PRD) v2.0
**Target:** Google Solution Challenge 2026 (Build with AI / SDG 10)  
**Status:** Approved for Prototyping  
**Last Updated:** April 2026  
**Authors:** Team Trident  

---

## 1. Executive Summary

**Equalyze** is an enterprise-grade AI bias auditing and governance platform designed to make algorithmic discrimination visible, explainable, and legally actionable. 

As the world approaches the August 2026 enforcement deadline for the EU AI Act and the implementation phase of India's DPDP Rules, organizations deploying AI in high-stakes domains (healthcare, lending, HR) face a compliance cliff. Current tools either require deep ML expertise to operate or output raw statistical dashboards that fail to provide legal defensibility.

Equalyze bridges this gap. Powered by a Hierarchical Agent System (Google Antigravity and Gemini 2.0 Pro/Flash), Equalyze ingests model predictions, detects hidden intersectional bias, and **proves it** by generating human-readable "Counterfactual Twins." It then maps these findings to 2026 regulatory frameworks, producing an immutable, ISO/IEC 42001-compliant "Bias Receipt" and generating Synthetic Data to eradicate "Data Shadows" without violating user privacy.

---

## 2. Problem Statement & Market Context

### 2.1 The "Data Shadow" Crisis (SDG 10)
Modern AI relies on historical data. However, marginalized communities often exist in "Data Shadows"—systematically omitted or misrepresented due to historical inequities. When models train on this data, algorithms learn to use proxy variables (e.g., zip codes, employment gaps) to mathematically formalize historical exclusion, directly violating **UN SDG 10: Reduced Inequalities**.

### 2.2 The 2026 Regulatory Cliff
Organizations can no longer rely on self-regulation. The legal landscape has shifted to strict enforcement:
* **EU AI Act (Aug 2026):** Mandates continuous "Technical Documentation" (Article 11) and strict Human-in-the-Loop oversight (Article 14) for high-risk systems. Fines reach €35M.
* **India DPDP Rules 2026:** Requires demonstrable algorithmic fairness and immutable data-access logging for automated decision-making.
* **NIST AI 600-1 (Generative AI):** Demands adversarial red-teaming to prevent "algorithmic monocultures" in healthcare and lending.

### 2.3 The Solution Gap
Existing open-source libraries (Fairlearn, AIF360) are tools for engineers, not governance systems for enterprises. They do not generate compliance paperwork, they cannot handle Generative AI text reasoning, and they lack the immutable audit trails required by law.

---

## 3. Product Goals & Success Metrics (Mapped to GSC Criteria)

| Goal | GSC Criteria | Description | Success Metric |
| :--- | :--- | :--- | :--- |
| **G1. Counterfactual Proof** | Innovation (25%) | Move beyond static math by using Gemini 2.0 Pro to generate adversarial "Twin Profiles" that prove bias narratively. | >85% Cosine Similarity on non-protected attributes between Original and Twin. |
| **G2. Regulatory Mapping** | Technical Merit (40%) | Automatically map bias to specific legal articles (EU AI Act, DPDP) using Vertex AI Vector Search (RAG). | 100% of "High Risk" flags matched to a valid 2026 legal statute. |
| **G3. Immutable Governance** | Technical Merit (40%) | Establish an ISO/IEC 42001 compliant chain of custody using Google Cloud BigQuery and Firebase. | Zero ability for users to mutate or delete generated Bias Receipts. |
| **G4. Oversight-by-Design** | UX / Design (10%) | Combat "automation bias" by forcing humans to interact with cognitive friction elements before approving AI reports. | 100% completion of mandatory checklists prior to PDF export. |
| **G5. Eradicate Data Shadows** | Alignment (25%) | Deploy a Remediation Agent to synthesize fairness-augmented datasets, addressing SDG 10 directly. | Synthetic data reduces Disparate Impact Ratio to >0.80. |

---

## 4. Feature Scope & Architecture

### Layer 1: Ingestion & Context Configuration
* **F1.1 Universal CSV Ingestion:** Drag-and-drop secure upload to Google Cloud Storage (ephemeral, 1-hour TTL).
* **F1.2 The Domain Selector:** User selects "Healthcare," "Fintech," or "HR." *Crucial Feature:* This selection dynamically alters the Legal RAG agent's search parameters (e.g., fetching RBI lending codes vs. Health diagnostic standards).
* **F1.3 Proxy Variable Detector:** Gemini 1.5 Flash scans the schema to warn users if a "valid" factor (like Zip Code) has an illegally high correlation with a protected attribute (like Race).

### Layer 2: The Twin Engine Agent (Detection)
* **F2.1 Deterministic Fairness Math:** Calculates Disparate Impact Ratio (DIR). If DIR falls below **0.80 (the 4/5ths Rule)**, the dataset is flagged for DPDP violations.
* **F2.2 Intersectional Deep-Dive:** Scans for composite discrimination (e.g., Rural + Female) rather than single-axis bias.
* **F2.3 Counterfactual Twin Generator:** Gemini 2.0 Pro creates an identical adversarial profile where *only* the protected attribute is flipped. Output is a "Gut Punch" UI card: *"Applicant A approved; Identical Applicant B rejected purely due to gender."*

### Layer 3: Enterprise Governance (Compliance)
* **F3.1 The Bias Receipt:** An automated, EU AI Act Annex IV-compliant JSON/PDF document. Details model taxonomy, detected disparities, twin evidence, and regulatory mappings.
* **F3.2 Cognitive Forcing Functions (Article 14 Compliance):** The UI requires the operator to explicitly acknowledge statistical uncertainty margins before downloading the report, legally proving "active human oversight."
* **F3.3 BigQuery Immutable Audit Log:** Every action, schema confirmation, and twin generation is SHA-256 hashed and appended to BigQuery to establish a legally defensible chain of custody.

### Layer 4: Remediation Engine
* **F4.1 Synthetic Data for Social Good:** Instead of collecting more PII from vulnerable populations, the Remediation Agent generates a mathematically robust, privacy-preserving synthetic dataset that balances the demographic parity, ready for model retraining.

---

## 5. UI/UX "Oversight-by-Design" Specifications

* **Aesthetic:** "Data Scientist IDE" — Clean, dense, highly professional (Next.js, Tailwind, shadcn/ui).
* **The Twin Card UI:** Side-by-side comparison. Left (Original, Red highlight), Right (Twin, Green highlight). Center badge displays "Non-Protected Feature Similarity: 98%".
* **Severity Traffic Lights:** * 🟢 Green: Compliant (>0.80 DIR).
    * 🟡 Amber: Monitor (0.80 - 0.90 DIR).
    * 🔴 Red: Immediate Action Required (<0.80 DIR or severe proxy detected).

---

## 6. Demo Use Cases (For 3-Minute Video)

### Use Case A: Fintech Lending (Primary Demo)
* **The Problem:** An NBFC's credit model. 
* **The Run:** The Ingestion Agent detects that "Years at current address" is acting as a proxy for "Marital Status/Gender".
* **The Reveal:** The Twin Engine generates identical profiles showing a single woman rejected and a married man approved with the exact same financials.
* **The Governance:** The Bias Receipt flags a violation of the **RBI Fair Practices Code Para 3** and assigns a "High Legal Risk."

### Use Case B: Healthcare Triage
* **The Problem:** A hospital triage system.
* **The Run:** Algorithm correctly passes gender but fails intersectionally on "Zip Code + Income".
* **The Reveal:** A rural patient is recommended for "delayed review" while an identical urban patient is "fast-tracked."
* **The Governance:** Flags **EU AI Act Article 10 (Data Governance)** violation for utilizing contaminated historical health data.

---

## 7. Non-Functional Requirements & Security

* **ISO/IEC 42001 Alignment:** System architecture must support AI Management System certification.
* **Data Minimization:** No datasets are used to train Equalyze's base models. All customer data is processed in isolated Cloud Run containers and purged post-audit.
* **Performance:** Base statistical evaluation < 15 seconds. Gemini Twin Generation < 45 seconds (handled asynchronously via Cloud Tasks).

---

## 8. Appendix: 2026 Regulatory Reference Matrix

| Regulation | Jurisdiction | Key 2026 Requirement Enforced by Equalyze |
| :--- | :--- | :--- |
| **EU AI Act** | Europe / Global | **Art. 11 (Annex IV):** Automated generation of the continuous "Technical Documentation" Bias Receipt. |
| **EU AI Act** | Europe / Global | **Art. 14:** Human-in-the-loop oversight enforced via UI Cognitive Forcing Functions. |
| **DPDP Rules 2026** | India | **Algorithmic Verification:** Hardcoded 80% acceptable variance thresholds and immutable data-access logging. |
| **NIST AI 600-1** | USA / Global | **Action MS-2.11-001:** Execution of adversarial counterfactual benchmarks for GenAI risk management. |
| **ISO/IEC 42001** | Global Standard | **Traceability:** Google Cloud BigQuery append-only architecture guarantees tamper-proof audit trails. |