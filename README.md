# Equalyze 

**AI Bias Detection & Governance Platform**

Equalyze is an enterprise-grade AI bias auditing and governance platform designed to make algorithmic discrimination visible, explainable, and legally actionable. It bridges the gap between deep ML metrics and regulatory compliance (like the EU AI Act and DPDP Rules), providing human-readable proof of bias and remediation strategies.

## 🚀 Features

### 1. Ingestion & Context Configuration
* **Universal CSV Ingestion:** Secure drag-and-drop upload for datasets with automatic schema parsing.
* **Domain Selection:** Tailor the auditing process by selecting industry-specific domains (e.g., Healthcare, Fintech, HR). This dynamically alters the Legal RAG agent's search parameters.
* **Proxy Variable Detector:** Scans schemas using Gemini to detect variables (like Zip Code) that may illegally correlate with protected attributes (like Race or Gender).

### 2. The Twin Engine (Detection)
* **Deterministic Fairness Math:** Calculates the Disparate Impact Ratio (DIR) automatically. Flags datasets falling below the legally recognized 0.80 threshold (the 4/5ths Rule).
* **Intersectional Deep-Dive:** Scans for composite discrimination (e.g., Rural + Female) rather than single-axis bias alone.
* **Counterfactual Twin Generator:** Uses Gemini 2.0 Pro to create adversarial "Twin Profiles." It proves bias narratively by showing two identical profiles where *only* the protected attribute is flipped (e.g., "Applicant A approved; Identical Applicant B rejected purely due to gender").

### 3. Enterprise Governance (Compliance)
* **The Bias Receipt:** Generates an automated, EU AI Act Annex IV-compliant JSON/PDF document detailing model taxonomy, detected disparities, twin evidence, and regulatory mappings.
* **Cognitive Forcing Functions (Article 14 Compliance):** Features an "Oversight-by-Design" UI that requires operators to explicitly acknowledge statistical uncertainty margins before downloading reports, legally proving active human oversight.
* **Immutable Audit Log:** Maintains a legally defensible chain of custody by hashing and appending every action, schema confirmation, and twin generation to an immutable backend log.

### 4. Remediation Engine
* **Synthetic Data Generation:** Eradicates "Data Shadows" by generating a mathematically robust, privacy-preserving synthetic dataset.
* **Before/After Validation:** Balances demographic parity directly in the UI, allowing operators to visually compare the Disparate Impact Ratio (DIR) before and after synthetic data remediation, ready for model retraining.

## 🛠 Tech Stack
* **Frontend:** Next.js, React, TailwindCSS, Lucide Icons, Recharts
* **Backend:** FastAPI, Python, Pandas/Numpy (Fairness Math)
* **AI Agents:** Google Gemini 2.0 Pro / Flash, Google Antigravity
* **Governance/Storage:** Firebase, Google Cloud Storage, BigQuery

## 📜 Regulatory Alignment
Equalyze helps organizations align with:
* **EU AI Act:** Articles 11 (Technical Documentation) & 14 (Human-in-the-Loop Oversight).
* **India DPDP Rules 2026:** Algorithmic Verification and Immutable Logging.
* **NIST AI 600-1:** Adversarial counterfactual benchmarks.
* **ISO/IEC 42001:** Tamper-proof audit trails for AI Management Systems.
