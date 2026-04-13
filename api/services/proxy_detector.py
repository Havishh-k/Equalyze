"""
Equalyze — Proxy Variable Detector
Detects when "valid" decision factors are statistical proxies for protected attributes.
No scipy dependency — uses pure numpy chi-squared implementation.
"""

import pandas as pd
import numpy as np
from typing import Any

from api.models.audit import ProxyWarning


class ProxyDetector:
    """Detect proxy variables that correlate with protected attributes."""

    PROXY_THRESHOLD_HIGH = 0.5
    PROXY_THRESHOLD_MEDIUM = 0.3

    def detect_proxies(
        self,
        df: pd.DataFrame,
        protected_cols: list[str],
        valid_factor_cols: list[str],
    ) -> list[ProxyWarning]:
        """
        Detect proxy variables by computing correlations between
        valid factors and protected attributes.
        """
        warnings = []

        for protected in protected_cols:
            if protected not in df.columns:
                continue
            for factor in valid_factor_cols:
                if factor not in df.columns:
                    continue

                corr = self._compute_correlation(df, protected, factor)
                if corr is None:
                    continue

                abs_corr = abs(corr)
                if abs_corr >= self.PROXY_THRESHOLD_MEDIUM:
                    severity = "HIGH" if abs_corr >= self.PROXY_THRESHOLD_HIGH else "MEDIUM"
                    warnings.append(ProxyWarning(
                        column=factor,
                        correlated_with=protected,
                        correlation_coefficient=round(corr, 4),
                        severity=severity,
                    ))

        return warnings

    def _compute_correlation(
        self, df: pd.DataFrame, col_a: str, col_b: str
    ) -> float | None:
        """
        Compute correlation between two columns.
        Handles numeric-numeric (Pearson) and categorical-categorical (Cramér's V).
        """
        try:
            a_numeric = pd.api.types.is_numeric_dtype(df[col_a])
            b_numeric = pd.api.types.is_numeric_dtype(df[col_b])

            if a_numeric and b_numeric:
                # Pearson correlation
                return float(df[col_a].corr(df[col_b]))
            else:
                # Cramér's V for categorical
                return self._cramers_v(df[col_a], df[col_b])
        except Exception:
            return None

    def _cramers_v(self, x: pd.Series, y: pd.Series) -> float:
        """Compute Cramér's V using pure numpy chi-squared (no scipy needed)."""
        observed = pd.crosstab(x, y).values.astype(float)
        row_sums = observed.sum(axis=1, keepdims=True)
        col_sums = observed.sum(axis=0, keepdims=True)
        n = observed.sum()
        if n == 0:
            return 0.0
        expected = row_sums * col_sums / n
        # Chi-squared statistic
        with np.errstate(divide="ignore", invalid="ignore"):
            chi2 = np.nansum((observed - expected) ** 2 / np.where(expected > 0, expected, 1))
        min_dim = min(observed.shape) - 1
        if min_dim == 0:
            return 0.0
        return float(np.sqrt(chi2 / (n * min_dim)))


proxy_detector = ProxyDetector()
