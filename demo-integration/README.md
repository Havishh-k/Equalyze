# Equalyze API Demo: CI/CD Integration

This demo showcases how easily the Equalyze API and Python SDK can be integrated into any developer's ML workflow. It demonstrates an "Active AI Governance" approach, where algorithms are audited for fairness *before* deployment, and blocked if they exhibit severe bias.

## Overview
In this demo, we simulate a **Loan Approval Model** pipeline:
1. **Model Step (`model/generate_predictions.py`):** Generates a 1,000-row synthetic prediction dataset (`predictions.csv`) for loan approvals. It intentionally penalizes female and rural applicants regardless of their credit score to mimic a real-world biased model.
2. **Equalyze Gate (`ci_cd_simulation.py`):** Uses the Equalyze SDK to intercept `predictions.csv`, send it to the backend for auditing, and evaluates the metrics.
3. **Status Report:** The SDK evaluates if the **Disparate Impact Ratio** and **Equalized Odds** pass the threshold. Because the data is heavily biased, the SDK will automatically trigger a deployment failure and produce a status report.

## Prerequisites
- Python 3.11+
- Install dependencies:
  ```bash
  pip install -r requirements.txt
  ```
- Make sure the local Equalyze API is running (see the main repository README.md).

## Running the Demo

Simply run the CI/CD simulation script:

```bash
python ci_cd_simulation.py
```

### What You Will See

You will see the pipeline execute step-by-step:
1. The dataset is generated.
2. The Equalyze SDK initiates an audit.
3. The SDK evaluates the fairness score.
4. Because the model fails compliance checks (e.g., Disparate Impact Ratio < 0.8), the script fails with an exit code and provides a clear output describing why the pipeline halted.

### Exit Codes Standard
The SDK utilizes standardized exit codes to integrate cleanly with any CI/CD environment:
- **Exit Code 0:** Passed. Disparate Impact Ratio ≥ 0.80 and metrics are within acceptable thresholds.
- **Exit Code 1:** Blocked by Policy. Disparate Impact Ratio < 0.80. The pipeline halts to prevent deployment of discriminatory models.
- **Exit Code 2:** API / Authentication Failure (or Timeout).

## Using in Your Own Repository (GitHub Actions)

We have provided a sample `.github/workflows/equalyze-gate.yml` to demonstrate how to implement this in a real CI/CD environment.

1. Copy the `.github/workflows/equalyze-gate.yml` file into your `.github/workflows/` directory.
2. In your repository settings, go to **Secrets and variables > Actions**.
3. Add a new repository secret called `EQUALYZE_API_KEY`.
4. Your ML pipelines are now protected by Equalyze.
