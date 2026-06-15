# Feature Requirements Document (FRD)
**Project Name:** Equalyze  
**Project Scope:** Enterprise Architecture Portfolio Project  
**Tech Stack:** Next.js (App Router), FastAPI (Python), Google Cloud Platform (BigQuery), Google Gemini AI Swarm  

## 1. Executive Summary
Equalyze is an automated AI governance and bias-auditing platform designed to bridge the gap between complex MLOps and strict global regulatory frameworks. This document outlines the end-to-end technical requirements for completing the final prototype. The architecture demonstrates how to enforce verifiable, cryptographically secure algorithmic equity across both traditional ML models and Generative AI systems.

## 2. Target Personas
The system architecture will serve three distinct simulated roles to demonstrate Role-Based Access Control (RBAC) and contextual explainability:
1.  **The Data Scientist:** Focuses on algorithmic fairness, feature engineering, and model metrics.
2.  **The Data Engineer:** Focuses on data pipelines, upstream data ingestion, and balancing training sets.
3.  **The Compliance Officer:** Focuses on legal risk, audit trails, and authorization.

## 3. Core Workflow (Current Baseline)
The foundational pipeline must execute the following sequence:
1.  **Ingestion:** Accept tabular prediction data (CSV).
2.  **Math Check:** Deterministic calculation of fairness metrics (e.g., Disparate Impact Ratio) using Python/Pandas.
3.  **Twin Engine:** Gemini generates counterfactual twins (flipping the protected attribute) for human-readable proof.
4.  **Remediation:** Gemini generates privacy-preserving synthetic data to balance the dataset.
5.  **Bias Receipt:** Maps findings to regulatory frameworks and hashes the report to BigQuery.

## 4. Detailed Feature Requirements (Sprint Scope)

### Feature 1: Pre-Audit Data Health Scorecard
**Description:** An initial validation checkpoint immediately following data ingestion to enforce the "garbage in, garbage out" principle.
* **Frontend (Next.js):** Render a dashboard widget displaying top-level data health metrics prior to any LLM processing.
* **Backend (FastAPI/Pandas):** * Scan for severe class imbalances (e.g., 85% majority group vs. 15% minority group).
    * Detect and flag missing values or nulls in protected attribute columns.
* **Acceptance Criteria:** The UI must display a "Data Quality Score" and visual warnings for imbalances before the user can trigger the Twin Engine.

### Feature 2: ML Model + LLM Bias Detection (Prompt Twin Engine)
**Description:** Expansion of the core audit engine to evaluate Generative AI text prompts alongside traditional tabular data.
* **Frontend (Next.js):** A universal toggle switch: `[ Tabular ML Audit ]` | `[ Generative AI Audit ]`.
* **Backend (FastAPI & Gemini):**
    * Accept a system prompt template (e.g., "Review candidate: [NAME]").
    * Generate Prompt Twins by dynamically injecting majority vs. minority demographic identifiers (e.g., "Greg" vs. "Aisha").
    * Utilize Gemini in an "LLM-as-a-Judge" capacity to evaluate the semantic difference between the target LLM's responses.
* **Acceptance Criteria:** System must successfully flag semantic bias in text generation based on prompt manipulation.

### Feature 3: Explainability & Root Cause Analysis
**Description:** Deep diagnostic tooling to explain *why* a model failed the mathematical fairness check.
* **Frontend (Next.js):** Render a horizontal "Feature Impact" waterfall chart. Include an adjacent text container for the AI-generated root cause summary.
* **Backend (FastAPI & Gemini):**
    * Calculate feature correlations to identify proxy variables (e.g., Zip Code acting as a proxy for Race).
    * Pass the statistical correlation data to Gemini with a strict prompt to generate a simple, 2-3 sentence English explanation of the root cause.
* **Acceptance Criteria:** Users must be able to visually identify the specific dataset column causing the bias.

### Feature 4: Role-Based Views & Prescriptive Analysis
**Description:** Dynamic UI rendering and context-aware AI recommendations tailored to the active user persona.
* **Frontend (Next.js):** * Implement a global state toggle to switch the active session between Admin, Compliance Officer, and Data Scientist.
    * Utilize App Router layouts to display distinct navigation and widget configurations per role.
* **Backend (FastAPI & Gemini):**
    * Endpoints must accept the `user_role` parameter.
    * Dynamically inject the `user_role` into the Gemini prescriptive analysis prompt.
    * *Outputs:* Algorithm fixes for Data Scientists, pipeline fixes for Data Engineers, and legal risk summaries for Compliance Officers.
* **Acceptance Criteria:** Changing the role toggle must instantly alter both the UI layout and the text of the AI's final recommendation.

### Feature 5: CI/CD Fairness Gateway
**Description:** An automated deployment blocker simulating an MLOps integration.
* **Frontend (Next.js):** A "Developer Terminal" UI component simulating a GitHub Actions or Jenkins pipeline run.
* **Backend (FastAPI):**
    * Expose a `/api/v1/cicd-gate` endpoint.
    * Accept a JSON payload containing model fairness metrics.
    * If Disparate Impact Ratio < 0.80, the endpoint must deterministically return a `403 Forbidden` status code with a descriptive "Deployment Blocked" error.
* **Acceptance Criteria:** The mock terminal must visually fail and display the 403 error when a non-compliant payload is sent.

## 5. Universal Backend Security & Legal Checkpoints
The FastAPI middleware must enforce the following strict controls to satisfy global regulatory frameworks:

1.  **India DPDPA (2026) Stop-Gates:** The 0.80 Disparate Impact Ratio threshold must be hardcoded. Any metric below this must trigger a mandatory block. Data minimization filters must strip exact PII before assembling any Gemini payload.
2.  **EU AI Act (Annex IV & Art 14):** Human-in-the-Loop (HITL) enforcement. Automated remediation (synthetic data injection) cannot execute without a logged "Approval Token" from a human role.
3.  **NIST AI 600-1:** Adversarial payload sanitization must be active on the Generative AI text input routes to prevent prompt injection.
4.  **ISO/IEC 42001 (Immutable Ledger):** The final JSON Bias Receipt must be cryptographically hashed (SHA-256) before appending the record to Google BigQuery, ensuring an unalterable chain of custody.
