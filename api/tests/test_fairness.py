"""
Equalyze — Unit Tests
Tests for FairnessEvaluator, DataHealth, Explainability, and ProxyDetector.
Run: python -m pytest api/tests/test_fairness.py -v
"""

import pytest
import pandas as pd
import numpy as np
from api.services.fairness_metrics import FairnessEvaluator
from api.services.data_health import compute_data_health
from api.services.explainability import compute_vif, compute_feature_importance


# ── Test Fixtures ─────────────────────────────────

@pytest.fixture
def fair_dataset():
    """Dataset with NO bias — equal outcome rates across groups."""
    np.random.seed(42)
    n = 200
    return pd.DataFrame({
        "gender": np.random.choice(["male", "female"], n),
        "age": np.random.randint(25, 65, n),
        "income": np.random.normal(50000, 10000, n),
        "approved": np.random.choice([0, 1], n, p=[0.5, 0.5]),
    })


@pytest.fixture
def biased_dataset():
    """Dataset with clear gender bias in outcomes."""
    np.random.seed(42)
    n = 300
    gender = np.random.choice(["male", "female"], n)
    # Males get 80% approval, females get 30%
    approved = [
        1 if (g == "male" and np.random.random() < 0.8) or
             (g == "female" and np.random.random() < 0.3)
        else 0
        for g in gender
    ]
    return pd.DataFrame({
        "gender": gender,
        "age": np.random.randint(25, 65, n),
        "income": np.random.normal(50000, 10000, n),
        "approved": approved,
    })


@pytest.fixture
def schema_map():
    return {
        "outcome": "approved",
        "protected_attributes": ["gender"],
        "valid_factors": ["age", "income"],
    }


# ── FairnessEvaluator Tests ───────────────────────

class TestFairnessEvaluator:

    def test_full_audit_returns_all_metrics(self, fair_dataset, schema_map):
        """run_full_audit returns results for each protected attr."""
        evaluator = FairnessEvaluator(fair_dataset, schema_map)
        results = evaluator.run_full_audit()
        assert "gender" in results
        assert "demographic_parity" in results["gender"]
        assert "disparate_impact" in results["gender"]
        assert "equalized_odds" in results["gender"]

    def test_fair_dataset_low_disparity(self, fair_dataset, schema_map):
        """Fair dataset → low demographic parity difference."""
        evaluator = FairnessEvaluator(fair_dataset, schema_map)
        results = evaluator.run_full_audit()
        dp = results["gender"]["demographic_parity"]
        # Fair dataset — disparity should be small
        assert dp["value"] is not None
        assert dp["value"] < 0.2

    def test_biased_dataset_high_disparity(self, biased_dataset, schema_map):
        """Biased dataset → high demographic parity difference."""
        evaluator = FairnessEvaluator(biased_dataset, schema_map)
        results = evaluator.run_full_audit()
        dp = results["gender"]["demographic_parity"]
        assert dp["value"] > 0.3
        assert dp["severity"] in ("AMBER", "RED")

    def test_disparate_impact_four_fifths(self, biased_dataset, schema_map):
        """Biased dataset violates 4/5ths rule (DI < 0.8)."""
        evaluator = FairnessEvaluator(biased_dataset, schema_map)
        results = evaluator.run_full_audit()
        di = results["gender"]["disparate_impact"]
        assert di["value"] < 0.8
        assert di["legal_flag"] is True

    def test_missing_column_graceful(self, fair_dataset, schema_map):
        """Missing protected attr column → skipped, no crash."""
        schema_map["protected_attributes"] = ["nonexistent_column"]
        evaluator = FairnessEvaluator(fair_dataset, schema_map)
        results = evaluator.run_full_audit()
        assert "nonexistent_column" not in results

    def test_single_group_no_crash(self, schema_map):
        """Single-group protected attr → returns no_data result."""
        df = pd.DataFrame({
            "gender": ["male"] * 100,
            "approved": np.random.choice([0, 1], 100),
            "age": np.random.randint(25, 65, 100),
            "income": np.random.normal(50000, 10000, 100),
        })
        evaluator = FairnessEvaluator(df, schema_map)
        results = evaluator.run_full_audit()
        dp = results["gender"]["demographic_parity"]
        assert dp["value"] is None or dp["severity"] == "GREEN"


# ── DataHealth Tests ──────────────────────────────

class TestDataHealth:

    def test_healthy_dataset(self, fair_dataset, schema_map):
        """Clean dataset → high score, can_proceed=True."""
        report = compute_data_health(fair_dataset, schema_map)
        assert report.score >= 70
        assert report.can_proceed is True

    def test_tiny_dataset_critical(self, schema_map):
        """< 50 rows → CRITICAL finding."""
        df = pd.DataFrame({
            "gender": ["male", "female"] * 10,
            "approved": [1, 0] * 10,
            "age": range(20),
            "income": range(20),
        })
        report = compute_data_health(df, schema_map)
        assert report.can_proceed is False
        critical = [f for f in report.findings if f.severity == "CRITICAL"]
        assert len(critical) > 0

    def test_high_missing_critical(self, schema_map):
        """> 40% missing in column → CRITICAL."""
        n = 200
        df = pd.DataFrame({
            "gender": ["male", "female"] * (n // 2),
            "approved": [1, 0] * (n // 2),
            "age": [None] * (n // 2) + list(range(n // 2)),
            "income": np.random.normal(50000, 10000, n),
        })
        # Make > 40% missing
        df.loc[:120, "age"] = None
        report = compute_data_health(df, schema_map)
        missing_findings = [f for f in report.findings if f.category == "missing_values"]
        assert any(f.severity == "CRITICAL" for f in missing_findings)

    def test_constant_outcome_critical(self, schema_map):
        """Constant outcome → CRITICAL (can't measure bias)."""
        df = pd.DataFrame({
            "gender": ["male", "female"] * 50,
            "approved": [1] * 100,
            "age": np.random.randint(25, 65, 100),
            "income": np.random.normal(50000, 10000, 100),
        })
        report = compute_data_health(df, schema_map)
        outcome_findings = [f for f in report.findings if f.category == "outcome_distribution"]
        assert any(f.severity == "CRITICAL" for f in outcome_findings)


# ── Explainability Tests ──────────────────────────

class TestExplainability:

    def test_vif_returns_results(self, fair_dataset):
        """VIF returns result for each numeric column."""
        results = compute_vif(fair_dataset, ["age", "income", "approved"])
        assert len(results) == 3
        assert all("vif" in r for r in results)
        assert all("flag" in r for r in results)

    def test_vif_low_for_independent(self):
        """Independent columns → VIF near 1."""
        np.random.seed(42)
        df = pd.DataFrame({
            "a": np.random.randn(200),
            "b": np.random.randn(200),
            "c": np.random.randn(200),
        })
        results = compute_vif(df)
        for r in results:
            assert r["vif"] < 2.0
            assert r["flag"] == "LOW"

    def test_vif_high_for_correlated(self):
        """Correlated columns → high VIF."""
        np.random.seed(42)
        x = np.random.randn(200)
        df = pd.DataFrame({
            "a": x,
            "b": x + np.random.randn(200) * 0.01,  # near-perfect correlation
            "c": np.random.randn(200),
        })
        results = compute_vif(df)
        vif_a = next(r for r in results if r["column"] == "a")
        assert vif_a["vif"] > 5
        assert vif_a["flag"] in ("MODERATE", "HIGH")

    def test_feature_importance(self, biased_dataset):
        """Feature importance returns ranked results."""
        results = compute_feature_importance(
            biased_dataset, "approved", ["age", "income"]
        )
        assert len(results) > 0
        assert results[0]["rank"] == 1
        assert "importance" in results[0]

    def test_single_column_vif(self):
        """Single column → VIF = 1.0 (no multicollinearity possible)."""
        df = pd.DataFrame({"x": np.random.randn(100)})
        results = compute_vif(df, ["x"])
        assert len(results) == 1
        assert results[0]["vif"] == 1.0
