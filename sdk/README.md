# Equalyze SDK

**AI Fairness & Compliance SDK for CI/CD Pipelines**

Equalyze is a Python SDK that integrates AI bias auditing directly into your CI/CD pipeline. It evaluates datasets against multiple fairness metrics — including Disparate Impact Ratio, Equalized Odds, and FPR Parity — and blocks deployments that fail compliance thresholds with a standard `sys.exit(1)`.

Built for EU AI Act compliance.

## Installation

```bash
pip install equalyze
```

## Quick Start

```python
from equalyze import EqualyzeSDK

sdk = EqualyzeSDK(api_key="your_api_key", base_url="https://your-equalyze-instance.com")

# Upload a dataset
dataset_id = sdk.upload_dataset("hiring_data.csv")

# Run a fairness audit with a compliance threshold
# This will sys.exit(1) if the model fails — blocking your pipeline automatically.
sdk.run_audit(
    dataset_id=dataset_id,
    protected_attributes=["gender", "race", "age"],
    threshold=0.85
)
```

## CI/CD Integration

### GitHub Actions

```yaml
- name: Equalyze Fairness Gate
  env:
    EQUALYZE_API_KEY: ${{ secrets.EQUALYZE_API_KEY }}
    DATASET_PATH: ./data/model_output.csv
  run: equalyze-audit-gate
```

### GitLab CI

```yaml
fairness-gate:
  script:
    - pip install equalyze
    - equalyze-audit-gate
  variables:
    EQUALYZE_API_KEY: $EQUALYZE_API_KEY
    DATASET_PATH: ./data/model_output.csv
```

## Metrics Evaluated

| Metric | Description |
|--------|-------------|
| Disparate Impact Ratio | Outcome ratio between protected groups (4/5ths rule) |
| Equalized Odds | True Positive Rate parity across groups |
| FPR Parity | False Positive Rate parity across groups |
| Statistical Parity | Outcome distribution equality |

## License

MIT
