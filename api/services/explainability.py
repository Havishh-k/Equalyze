"""
Equalyze — Explainability Service
Statistical explainability tools: Variance Inflation Factor (VIF),
feature importance ranking, and proxy variable diagnostics.

All implementations use pure numpy — no sklearn/scipy/statsmodels dependencies.
"""

import numpy as np
import pandas as pd
from typing import Any


def compute_vif(df: pd.DataFrame, columns: list[str] | None = None) -> list[dict[str, Any]]:
    """
    Compute Variance Inflation Factor (VIF) for each numeric feature.

    VIF measures multicollinearity between features. High VIF (>5) suggests
    a variable is strongly correlated with other features and may act as
    a proxy for a protected attribute.

    Implementation:
    - VIF_j = 1 / (1 - R²_j)
    - R²_j is from regressing X_j on all other X columns using OLS.
    - Pure numpy — no statsmodels or sklearn required.

    Args:
        df: DataFrame with the numeric features to analyze.
        columns: Specific columns to compute VIF for.
                 If None, uses all numeric columns.

    Returns:
        List of dicts: [{"column": str, "vif": float, "flag": str}, ...]
        flag is "LOW" (<5), "MODERATE" (5-10), or "HIGH" (>10).
    """
    if columns is None:
        columns = df.select_dtypes(include=[np.number]).columns.tolist()

    if len(columns) < 2:
        return [{"column": c, "vif": 1.0, "flag": "LOW"} for c in columns]

    # Build the numeric matrix, drop rows with NaN
    X = df[columns].dropna().values.astype(float)
    n, p = X.shape

    if n < p + 1:
        # Not enough observations for meaningful VIF
        return [
            {"column": col, "vif": float("inf"), "flag": "HIGH",
             "note": f"Too few observations ({n}) for {p} features"}
            for col in columns
        ]

    results = []
    for j in range(p):
        # Regress X[:,j] on all other columns using OLS
        y = X[:, j]
        others = np.delete(X, j, axis=1)

        # Add intercept
        ones = np.ones((n, 1))
        X_reg = np.hstack([ones, others])

        # OLS: β = (X'X)^{-1} X'y
        try:
            XtX = X_reg.T @ X_reg
            # Regularize slightly to avoid singular matrix
            XtX += np.eye(XtX.shape[0]) * 1e-10
            Xty = X_reg.T @ y
            beta = np.linalg.solve(XtX, Xty)

            y_hat = X_reg @ beta
            ss_res = np.sum((y - y_hat) ** 2)
            ss_tot = np.sum((y - np.mean(y)) ** 2)

            r_squared = 1.0 - (ss_res / ss_tot) if ss_tot > 0 else 0.0
            r_squared = max(0.0, min(r_squared, 0.9999))  # Clamp to avoid div-by-zero

            vif = 1.0 / (1.0 - r_squared)
        except np.linalg.LinAlgError:
            vif = float("inf")

        # Flag
        if vif > 10:
            flag = "HIGH"
        elif vif > 5:
            flag = "MODERATE"
        else:
            flag = "LOW"

        results.append({
            "column": columns[j],
            "vif": round(float(vif), 2),
            "flag": flag,
        })

    # Sort by VIF descending
    results.sort(key=lambda x: x["vif"], reverse=True)

    return results


def compute_feature_importance(
    df: pd.DataFrame,
    outcome_col: str,
    feature_cols: list[str],
) -> list[dict[str, Any]]:
    """
    Compute simple feature importance via absolute Pearson correlation
    with the outcome variable.

    This is a lightweight alternative to SHAP that requires no model.
    For each feature, we compute |corr(feature, outcome)| and rank them.

    Args:
        df: DataFrame with features and outcome.
        outcome_col: Name of the outcome column.
        feature_cols: List of feature column names.

    Returns:
        List of dicts: [{"column": str, "importance": float, "rank": int}, ...]
    """
    if outcome_col not in df.columns:
        return []

    outcome = df[outcome_col].dropna()
    if not pd.api.types.is_numeric_dtype(outcome):
        return []

    results = []
    for col in feature_cols:
        if col not in df.columns or not pd.api.types.is_numeric_dtype(df[col]):
            continue

        valid = df[[col, outcome_col]].dropna()
        if len(valid) < 10:
            continue

        x = valid[col].values.astype(float)
        y = valid[outcome_col].values.astype(float)

        # Pearson correlation
        x_mean, y_mean = x.mean(), y.mean()
        x_dev, y_dev = x - x_mean, y - y_mean

        numerator = np.sum(x_dev * y_dev)
        denominator = np.sqrt(np.sum(x_dev ** 2) * np.sum(y_dev ** 2))

        corr = float(numerator / denominator) if denominator > 0 else 0.0

        results.append({
            "column": col,
            "importance": round(abs(corr), 4),
            "direction": "positive" if corr > 0 else "negative",
            "raw_correlation": round(corr, 4),
        })

    # Rank by importance
    results.sort(key=lambda x: x["importance"], reverse=True)
    for i, r in enumerate(results):
        r["rank"] = i + 1

    return results


def compute_proxy_vif_analysis(
    df: pd.DataFrame,
    protected_attrs: list[str],
    valid_factors: list[str],
) -> dict[str, Any]:
    """
    Combined proxy analysis using VIF and correlation.

    For each valid factor, determines:
    1. Its VIF (multicollinearity with all other factors)
    2. Its correlation with each protected attribute
    3. A composite proxy risk score

    This helps identify which legitimate features might be acting as
    proxies for protected characteristics.

    Returns:
        {
            "vif_results": [...],
            "proxy_risks": [
                {"column": str, "vif": float, "max_protected_corr": float,
                 "correlated_with": str, "risk_level": str}
            ],
            "summary": str
        }
    """
    # VIF on valid factors
    numeric_factors = [c for c in valid_factors if c in df.columns and pd.api.types.is_numeric_dtype(df[c])]
    vif_results = compute_vif(df, numeric_factors) if len(numeric_factors) >= 2 else []

    vif_map = {r["column"]: r["vif"] for r in vif_results}

    proxy_risks = []
    for factor in valid_factors:
        if factor not in df.columns:
            continue

        # Get this factor's VIF
        vif_val = vif_map.get(factor, 1.0)

        # Check correlation with each protected attribute
        max_corr = 0.0
        corr_with = ""

        for attr in protected_attrs:
            if attr not in df.columns:
                continue

            valid = df[[factor, attr]].dropna()
            if len(valid) < 10:
                continue

            f_vals = valid[factor]
            a_vals = valid[attr]

            # Handle both numeric-numeric and categorical-numeric
            if pd.api.types.is_numeric_dtype(f_vals) and pd.api.types.is_numeric_dtype(a_vals):
                x = f_vals.values.astype(float)
                y = a_vals.values.astype(float)
                x_mean, y_mean = x.mean(), y.mean()
                x_dev, y_dev = x - x_mean, y - y_mean
                num = np.sum(x_dev * y_dev)
                den = np.sqrt(np.sum(x_dev ** 2) * np.sum(y_dev ** 2))
                corr = abs(float(num / den)) if den > 0 else 0.0
            else:
                # Cramér's V approximation using value_counts cross-tab
                try:
                    contingency = pd.crosstab(f_vals, a_vals)
                    n = contingency.values.sum()
                    expected = np.outer(contingency.sum(axis=1), contingency.sum(axis=0)) / n
                    chi2 = np.sum((contingency.values - expected) ** 2 / (expected + 1e-10))
                    k = min(contingency.shape) - 1
                    corr = float(np.sqrt(chi2 / (n * max(k, 1)))) if n > 0 else 0.0
                except Exception:
                    corr = 0.0

            if corr > max_corr:
                max_corr = corr
                corr_with = attr

        # Composite risk
        # High VIF + high correlation = HIGH risk
        if vif_val > 10 and max_corr > 0.5:
            risk = "HIGH"
        elif vif_val > 5 or max_corr > 0.4:
            risk = "MODERATE"
        elif max_corr > 0.2:
            risk = "LOW"
        else:
            risk = "NONE"

        proxy_risks.append({
            "column": factor,
            "vif": round(float(vif_val), 2),
            "max_protected_corr": round(max_corr, 4),
            "correlated_with": corr_with,
            "risk_level": risk,
        })

    # Sort by risk
    risk_order = {"HIGH": 0, "MODERATE": 1, "LOW": 2, "NONE": 3}
    proxy_risks.sort(key=lambda x: (risk_order.get(x["risk_level"], 4), -x["max_protected_corr"]))

    high_risk = [r for r in proxy_risks if r["risk_level"] == "HIGH"]
    summary = (
        f"{len(high_risk)} feature(s) identified as high-risk proxies for protected attributes."
        if high_risk
        else "No high-risk proxy variables detected."
    )

    return {
        "vif_results": vif_results,
        "proxy_risks": proxy_risks,
        "summary": summary,
    }
