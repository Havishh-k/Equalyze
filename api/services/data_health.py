"""
Equalyze — Data Health Service
Validates dataset quality BEFORE any LLM or bias metric computation.
Blocks audit if critical issues are detected.
"""

import pandas as pd
import numpy as np
from typing import Any


class DataHealthFinding:
    """A single data quality finding."""

    def __init__(
        self,
        category: str,
        severity: str,  # "CRITICAL" | "WARNING" | "INFO"
        title: str,
        detail: str,
        metric_value: float = 0.0,
        threshold: float = 0.0,
    ):
        self.category = category
        self.severity = severity
        self.title = title
        self.detail = detail
        self.metric_value = metric_value
        self.threshold = threshold

    def to_dict(self) -> dict[str, Any]:
        return {
            "category": self.category,
            "severity": self.severity,
            "title": self.title,
            "detail": self.detail,
            "metric_value": self.metric_value,
            "threshold": self.threshold,
        }


class DataHealthReport:
    """Result of a data health assessment."""

    def __init__(
        self,
        score: float,
        can_proceed: bool,
        findings: list[DataHealthFinding],
    ):
        self.score = score
        self.can_proceed = can_proceed
        self.findings = findings

    def to_dict(self) -> dict[str, Any]:
        return {
            "score": self.score,
            "can_proceed": self.can_proceed,
            "findings": [f.to_dict() for f in self.findings],
            "critical_count": sum(1 for f in self.findings if f.severity == "CRITICAL"),
            "warning_count": sum(1 for f in self.findings if f.severity == "WARNING"),
            "info_count": sum(1 for f in self.findings if f.severity == "INFO"),
        }


# ── Thresholds ──────────────────────────────────────

MISSING_RATE_CRITICAL = 0.40   # > 40% missing in any column → CRITICAL
MISSING_RATE_WARNING  = 0.15   # > 15% → WARNING

CLASS_IMBALANCE_CRITICAL = 0.05  # < 5% minority group → CRITICAL
CLASS_IMBALANCE_WARNING  = 0.15  # < 15% → WARNING

ROW_COUNT_CRITICAL = 50        # < 50 rows → CRITICAL
ROW_COUNT_WARNING  = 200       # < 200 → WARNING

OUTCOME_VARIANCE_CRITICAL = 0.02  # outcome std < 2% → CRITICAL (nearly constant)


def compute_data_health(
    df: pd.DataFrame,
    schema_map: dict[str, Any],
) -> DataHealthReport:
    """
    Validate dataset quality and return a DataHealthReport.

    Checks:
    1. Row count sufficiency
    2. Missing value rates per column
    3. Class imbalance in protected attributes
    4. Outcome distribution sanity
    5. Duplicate row detection
    6. Zero-variance column detection

    Returns a DataHealthReport with a composite score (0-100),
    a can_proceed flag, and a list of findings.
    """
    findings: list[DataHealthFinding] = []
    score_deductions = 0.0

    outcome_col = schema_map.get("outcome")
    protected_attrs = schema_map.get("protected_attributes", [])

    # ── 1. Row Count ──────────────────────────────────

    n_rows = len(df)
    if n_rows < ROW_COUNT_CRITICAL:
        findings.append(DataHealthFinding(
            category="sample_size",
            severity="CRITICAL",
            title="Insufficient sample size",
            detail=f"Dataset has only {n_rows} rows. Minimum {ROW_COUNT_CRITICAL} required for meaningful statistical analysis.",
            metric_value=n_rows,
            threshold=ROW_COUNT_CRITICAL,
        ))
        score_deductions += 40
    elif n_rows < ROW_COUNT_WARNING:
        findings.append(DataHealthFinding(
            category="sample_size",
            severity="WARNING",
            title="Low sample size",
            detail=f"Dataset has {n_rows} rows. Consider at least {ROW_COUNT_WARNING} rows for robust bias detection.",
            metric_value=n_rows,
            threshold=ROW_COUNT_WARNING,
        ))
        score_deductions += 15

    # ── 2. Missing Values ─────────────────────────────

    for col in df.columns:
        miss_rate = float(df[col].isnull().mean())
        if miss_rate > MISSING_RATE_CRITICAL:
            findings.append(DataHealthFinding(
                category="missing_values",
                severity="CRITICAL",
                title=f"Critical missing data in '{col}'",
                detail=f"{miss_rate:.0%} of values in '{col}' are missing. This column cannot reliably participate in fairness analysis.",
                metric_value=miss_rate,
                threshold=MISSING_RATE_CRITICAL,
            ))
            score_deductions += 20
        elif miss_rate > MISSING_RATE_WARNING:
            findings.append(DataHealthFinding(
                category="missing_values",
                severity="WARNING",
                title=f"High missing rate in '{col}'",
                detail=f"{miss_rate:.0%} of values in '{col}' are missing. Consider imputation or exclusion.",
                metric_value=miss_rate,
                threshold=MISSING_RATE_WARNING,
            ))
            score_deductions += 8

    # ── 3. Class Imbalance in Protected Attributes ────

    for attr in protected_attrs:
        if attr not in df.columns:
            findings.append(DataHealthFinding(
                category="class_imbalance",
                severity="WARNING",
                title=f"Protected attribute '{attr}' not found",
                detail=f"Column '{attr}' specified as protected but does not exist in the dataset.",
                metric_value=0,
                threshold=0,
            ))
            score_deductions += 10
            continue

        value_counts = df[attr].value_counts(normalize=True)
        if len(value_counts) < 2:
            findings.append(DataHealthFinding(
                category="class_imbalance",
                severity="CRITICAL",
                title=f"No variation in '{attr}'",
                detail=f"Protected attribute '{attr}' has only {len(value_counts)} unique value(s). Cannot compute disparity.",
                metric_value=1.0,
                threshold=0,
            ))
            score_deductions += 25
            continue

        minority_rate = float(value_counts.min())
        minority_label = str(value_counts.idxmin())

        if minority_rate < CLASS_IMBALANCE_CRITICAL:
            findings.append(DataHealthFinding(
                category="class_imbalance",
                severity="CRITICAL",
                title=f"Extreme underrepresentation in '{attr}'",
                detail=f"Group '{minority_label}' represents only {minority_rate:.1%} of data. Statistical tests will be unreliable.",
                metric_value=minority_rate,
                threshold=CLASS_IMBALANCE_CRITICAL,
            ))
            score_deductions += 25
        elif minority_rate < CLASS_IMBALANCE_WARNING:
            findings.append(DataHealthFinding(
                category="class_imbalance",
                severity="WARNING",
                title=f"Underrepresentation in '{attr}'",
                detail=f"Group '{minority_label}' represents {minority_rate:.1%} of data. Results should be interpreted with caution.",
                metric_value=minority_rate,
                threshold=CLASS_IMBALANCE_WARNING,
            ))
            score_deductions += 10

    # ── 4. Outcome Distribution ───────────────────────

    if outcome_col and outcome_col in df.columns:
        outcome_series = df[outcome_col].dropna()
        if len(outcome_series) > 0:
            if pd.api.types.is_numeric_dtype(outcome_series):
                outcome_std = float(outcome_series.std())
                if outcome_std < OUTCOME_VARIANCE_CRITICAL:
                    findings.append(DataHealthFinding(
                        category="outcome_distribution",
                        severity="CRITICAL",
                        title="Near-constant outcome variable",
                        detail=f"Outcome '{outcome_col}' has standard deviation of {outcome_std:.4f}. The outcome is nearly constant — no bias can be measured.",
                        metric_value=outcome_std,
                        threshold=OUTCOME_VARIANCE_CRITICAL,
                    ))
                    score_deductions += 35

                # Check if binary outcome is extremely skewed
                unique_vals = outcome_series.nunique()
                if unique_vals == 2:
                    minority_outcome = float(outcome_series.value_counts(normalize=True).min())
                    if minority_outcome < CLASS_IMBALANCE_CRITICAL:
                        findings.append(DataHealthFinding(
                            category="outcome_distribution",
                            severity="CRITICAL",
                            title="Extremely skewed outcome",
                            detail=f"Minority outcome class represents only {minority_outcome:.1%} of cases. Metrics like equalized odds will be unreliable.",
                            metric_value=minority_outcome,
                            threshold=CLASS_IMBALANCE_CRITICAL,
                        ))
                        score_deductions += 20
            else:
                findings.append(DataHealthFinding(
                    category="outcome_distribution",
                    severity="WARNING",
                    title="Non-numeric outcome",
                    detail=f"Outcome column '{outcome_col}' is not numeric. Fairness metrics require a numeric or binary outcome.",
                    metric_value=0,
                    threshold=0,
                ))
                score_deductions += 15
    elif outcome_col:
        findings.append(DataHealthFinding(
            category="outcome_distribution",
            severity="CRITICAL",
            title="Outcome column not found",
            detail=f"Specified outcome column '{outcome_col}' does not exist in the dataset.",
            metric_value=0,
            threshold=0,
        ))
        score_deductions += 30

    # ── 5. Duplicate Rows ─────────────────────────────

    dup_rate = float(df.duplicated().mean())
    if dup_rate > 0.10:
        findings.append(DataHealthFinding(
            category="duplicates",
            severity="WARNING",
            title="High duplicate rate",
            detail=f"{dup_rate:.0%} of rows are exact duplicates. This may inflate group sizes and distort fairness metrics.",
            metric_value=dup_rate,
            threshold=0.10,
        ))
        score_deductions += 10

    # ── 6. Zero-Variance Columns ──────────────────────

    for col in df.columns:
        if df[col].nunique(dropna=True) <= 1:
            findings.append(DataHealthFinding(
                category="zero_variance",
                severity="INFO",
                title=f"Zero-variance column '{col}'",
                detail=f"Column '{col}' has only {df[col].nunique(dropna=True)} unique value(s). It provides no discriminatory information.",
                metric_value=df[col].nunique(dropna=True),
                threshold=2,
            ))
            score_deductions += 3

    # ── Compute Score ─────────────────────────────────

    # If no findings at all, give a perfect score with a positive finding
    if not findings:
        findings.append(DataHealthFinding(
            category="overall",
            severity="INFO",
            title="All checks passed",
            detail="Dataset passed all data health validations. No critical or warning issues detected.",
            metric_value=100,
            threshold=0,
        ))

    final_score = max(0.0, min(100.0, 100.0 - score_deductions))

    # can_proceed = True unless there are any CRITICAL findings
    has_critical = any(f.severity == "CRITICAL" for f in findings)

    return DataHealthReport(
        score=round(final_score, 1),
        can_proceed=not has_critical,
        findings=findings,
    )
