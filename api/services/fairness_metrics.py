"""
Equalyze — Fairness Metrics Engine
Pure Python/numpy statistical fairness computation.
This is the computational backbone — no AI, no hallucination risk.
No sklearn/scipy dependency — everything is pure numpy for max compatibility.
"""

import pandas as pd
import numpy as np
from typing import Any

from api.models.audit import BiasMetric, Severity


class FairnessEvaluator:
    """
    Compute all 5 fairness metrics for a dataset.
    Operates on model predictions/outcomes (post-hoc audit).
    """

    def __init__(self, df: pd.DataFrame, schema_map: dict):
        self.df = df.copy()
        self.outcome_col = schema_map["outcome"]
        self.protected_cols = schema_map["protected_attributes"]
        self.valid_factor_cols = schema_map["valid_factors"]

    def run_full_audit(self) -> dict[str, dict[str, Any]]:
        """Run all fairness metrics for every protected attribute."""
        results = {}
        for attr in self.protected_cols:
            if attr not in self.df.columns:
                continue
            results[attr] = {
                "demographic_parity": self._demographic_parity(attr),
                "disparate_impact": self._disparate_impact(attr),
                "equalized_odds": self._equalized_odds(attr),
                "fpr_parity": self._fpr_parity(attr),
                "individual_fairness": self._individual_fairness(attr),
                "intersectional": self._intersectional_analysis(attr),
            }
        return results

    def _demographic_parity(self, attr: str) -> dict[str, Any]:
        """
        Demographic Parity Difference: |P(Y=1|A=0) - P(Y=1|A=1)|
        Measures if positive outcomes are equally distributed across groups.
        """
        try:
            groups = self.df.groupby(attr)[self.outcome_col].mean()
            if len(groups) < 2:
                return self._no_data_result("demographic_parity")

            dpd = float(groups.max() - groups.min())
            severity = self._classify_severity(dpd, [0.1, 0.2])

            return {
                "metric_name": "demographic_parity",
                "value": round(dpd, 4),
                "severity": severity,
                "threshold": 0.1,
                "interpretation": f"Outcome rate differs by {dpd*100:.1f}% between groups",
                "group_rates": {str(k): round(float(v), 4) for k, v in groups.items()},
                "legal_flag": dpd > 0.2,
            }
        except Exception as e:
            return self._error_result("demographic_parity", str(e))

    def _disparate_impact(self, attr: str) -> dict[str, Any]:
        """
        Disparate Impact Ratio: P(Y=1|minority) / P(Y=1|majority)
        The legal 4/5ths rule: ratio < 0.8 = potential violation.
        """
        try:
            groups = self.df.groupby(attr)[self.outcome_col].mean()
            if len(groups) < 2:
                return self._no_data_result("disparate_impact")

            min_rate = float(groups.min())
            max_rate = float(groups.max())
            di_ratio = min_rate / max_rate if max_rate > 0 else 1.0

            if di_ratio >= 0.8:
                severity = Severity.GREEN
            elif di_ratio >= 0.6:
                severity = Severity.AMBER
            else:
                severity = Severity.RED

            return {
                "metric_name": "disparate_impact",
                "value": round(di_ratio, 4),
                "severity": severity,
                "threshold": 0.8,
                "interpretation": f"Disadvantaged group approved at {di_ratio*100:.1f}% the rate of advantaged group",
                "minority_group": str(groups.idxmin()),
                "majority_group": str(groups.idxmax()),
                "minority_rate": round(min_rate, 4),
                "majority_rate": round(max_rate, 4),
                "legal_flag": di_ratio < 0.8,
            }
        except Exception as e:
            return self._error_result("disparate_impact", str(e))

    def _get_y_true_proxy(self) -> np.ndarray:
        """
        Generate a proxy for ground truth using pure numpy Ridge Regression 
        on valid factors to predict the fair outcome.
        """
        if hasattr(self, '_y_true_proxy'):
            return self._y_true_proxy

        numeric_cols = [
            c for c in self.valid_factor_cols
            if c in self.df.columns and pd.api.types.is_numeric_dtype(self.df[c])
        ]
        outcomes = self.df[self.outcome_col].values.astype(float)
        
        if len(numeric_cols) < 1:
            self._y_true_proxy = outcomes
            return outcomes

        X = self.df[numeric_cols].fillna(0).values.astype(float)
        # Normalize X
        mean = X.mean(axis=0)
        std = X.std(axis=0)
        std[std == 0] = 1.0
        X = (X - mean) / std
        
        # Add bias term
        X = np.c_[np.ones(X.shape[0]), X]
        
        # Ridge regression closed form: w = (X^T X + lambda I)^-1 X^T y
        lam = 1.0
        try:
            w = np.linalg.solve(X.T @ X + lam * np.eye(X.shape[1]), X.T @ outcomes)
            preds = X @ w
            # Binarize based on outcome mean to match base rate
            self._y_true_proxy = (preds > np.mean(outcomes)).astype(int)
        except np.linalg.LinAlgError:
            self._y_true_proxy = outcomes

        return self._y_true_proxy

    def _equalized_odds(self, attr: str) -> dict[str, Any]:
        """
        Equalized Odds: |TPR(A=0) - TPR(A=1)|
        Measures if true positive rates are equal across groups.
        Uses a Ridge Regression proxy for ground truth based on valid factors.
        """
        try:
            y_true = self._get_y_true_proxy()
            y_pred = self.df[self.outcome_col].values.astype(int)
            attr_vals = self.df[attr].values
            
            groups = np.unique(attr_vals)
            if len(groups) < 2:
                return self._no_data_result("equalized_odds")
                
            tpr_by_group = {}
            for g in groups:
                mask_g = (attr_vals == g)
                mask_pos_true = (y_true == 1)
                tpr_denom = np.sum(mask_g & mask_pos_true)
                if tpr_denom > 0:
                    tpr_num = np.sum(mask_g & mask_pos_true & (y_pred == 1))
                    tpr_by_group[g] = tpr_num / tpr_denom
                else:
                    tpr_by_group[g] = 0.0
                    
            tprs = list(tpr_by_group.values())
            eod = float(max(tprs) - min(tprs))
            severity = self._classify_severity(eod, [0.1, 0.2])

            return {
                "metric_name": "equalized_odds",
                "value": round(eod, 4),
                "severity": severity,
                "threshold": 0.1,
                "interpretation": f"True positive rate differs by {eod*100:.1f}% between groups",
                "legal_flag": eod > 0.2,
            }
        except Exception as e:
            return self._error_result("equalized_odds", str(e))

    def _fpr_parity(self, attr: str) -> dict[str, Any]:
        """
        False Positive Rate Parity: |FPR(A=0) - FPR(A=1)|
        Uses a Ridge Regression proxy for ground truth based on valid factors.
        """
        try:
            y_true = self._get_y_true_proxy()
            y_pred = self.df[self.outcome_col].values.astype(int)
            attr_vals = self.df[attr].values
            
            groups = np.unique(attr_vals)
            if len(groups) < 2:
                return self._no_data_result("fpr_parity")
                
            fpr_by_group = {}
            for g in groups:
                mask_g = (attr_vals == g)
                mask_neg_true = (y_true == 0)
                fpr_denom = np.sum(mask_g & mask_neg_true)
                if fpr_denom > 0:
                    fpr_num = np.sum(mask_g & mask_neg_true & (y_pred == 1))
                    fpr_by_group[g] = fpr_num / fpr_denom
                else:
                    fpr_by_group[g] = 0.0
                    
            fprs = list(fpr_by_group.values())
            fprp = float(max(fprs) - min(fprs))
            severity = self._classify_severity(fprp, [0.1, 0.2])

            return {
                "metric_name": "fpr_parity",
                "value": round(fprp, 4),
                "severity": severity,
                "threshold": 0.1,
                "interpretation": f"False positive rate differs by {fprp*100:.1f}% between groups",
                "legal_flag": False,
            }
        except Exception as e:
            return self._error_result("fpr_parity", str(e))

    def _individual_fairness(self, attr: str) -> dict[str, Any]:
        """
        Individual Fairness: Are similar individuals treated similarly?
        Uses pure numpy k-NN (cosine similarity) — no sklearn needed.
        """
        try:
            # Get numeric valid factors for similarity computation
            numeric_cols = [
                c for c in self.valid_factor_cols
                if c in self.df.columns and pd.api.types.is_numeric_dtype(self.df[c])
            ]
            if len(numeric_cols) < 2:
                return self._no_data_result("individual_fairness")

            features = self.df[numeric_cols].fillna(0).values.astype(float)

            # Pure numpy StandardScaler
            mean = features.mean(axis=0)
            std = features.std(axis=0)
            std[std == 0] = 1.0  # avoid division by zero
            X_scaled = (features - mean) / std

            # Pure numpy k-NN using cosine distance
            k = min(6, len(self.df) - 1)
            # Normalize for cosine similarity
            norms = np.linalg.norm(X_scaled, axis=1, keepdims=True)
            norms[norms == 0] = 1.0
            X_normed = X_scaled / norms

            # Sample if dataset is large (avoid O(n^2) memory)
            max_samples = min(len(X_normed), 500)
            sample_indices = np.random.choice(len(X_normed), max_samples, replace=False)
            X_sample = X_normed[sample_indices]

            # Cosine similarity matrix for sample
            sim_matrix = X_sample @ X_normed.T  # (sample, all)

            outcomes = self.df[self.outcome_col].values
            consistency_scores = []
            for i_local, i_global in enumerate(sample_indices):
                sims = sim_matrix[i_local].copy()
                sims[i_global] = -2  # exclude self
                top_k = np.argpartition(sims, -k)[-k:]
                same_outcome = sum(outcomes[j] == outcomes[i_global] for j in top_k)
                consistency_scores.append(same_outcome / k)

            avg_consistency = float(np.mean(consistency_scores))

            if avg_consistency >= 0.90:
                severity = Severity.GREEN
            elif avg_consistency >= 0.75:
                severity = Severity.AMBER
            else:
                severity = Severity.RED

            return {
                "metric_name": "individual_fairness",
                "value": round(avg_consistency, 4),
                "severity": severity,
                "threshold": 0.90,
                "interpretation": f"{avg_consistency*100:.1f}% of similar individuals receive the same outcome",
                "legal_flag": False,
            }
        except Exception as e:
            return self._error_result("individual_fairness", str(e))

    def _intersectional_analysis(self, attr: str) -> list[dict[str, Any]]:
        """
        Intersectional Analysis: Bias at the intersection of two attributes.
        E.g., rural + female may face compounded discrimination.
        """
        other_attrs = [a for a in self.protected_cols if a != attr and a in self.df.columns]
        findings = []

        for other in other_attrs:
            try:
                # Compute outcome rates for all intersectional groups
                cross = self.df.groupby([attr, other])[self.outcome_col].agg(["mean", "count"])
                cross.columns = ["rate", "count"]
                cross = cross.reset_index()

                if len(cross) < 2:
                    continue

                max_rate = cross["rate"].max()
                min_rate = cross["rate"].min()
                disparity = float(max_rate - min_rate)

                # Find the most disadvantaged intersection
                worst_row = cross.loc[cross["rate"].idxmin()]
                best_row = cross.loc[cross["rate"].idxmax()]

                findings.append({
                    "attributes": [attr, other],
                    "max_disparity": round(disparity, 4),
                    "severity": self._classify_severity(disparity, [0.15, 0.3]),
                    "worst_group": f"{worst_row[attr]} + {worst_row[other]}",
                    "worst_group_values": [worst_row[attr], worst_row[other]],
                    "worst_rate": round(float(worst_row["rate"]), 4),
                    "best_group": f"{best_row[attr]} + {best_row[other]}",
                    "best_group_values": [best_row[attr], best_row[other]],
                    "best_rate": round(float(best_row["rate"]), 4),
                    "interpretation": f"At the intersection of {attr} and {other}, "
                                     f"'{worst_row[attr]} + {worst_row[other]}' has a "
                                     f"{worst_row['rate']*100:.1f}% positive outcome rate vs. "
                                     f"{best_row['rate']*100:.1f}% for '{best_row[attr]} + {best_row[other]}'",
                })
            except Exception:
                continue

        return findings

    # ── Helpers ──────────────────────────────────

    def _classify_severity(self, value: float, thresholds: list[float]) -> Severity:
        if value <= thresholds[0]:
            return Severity.GREEN
        elif value <= thresholds[1]:
            return Severity.AMBER
        return Severity.RED

    def _no_data_result(self, metric_name: str) -> dict[str, Any]:
        return {
            "metric_name": metric_name,
            "value": None,
            "severity": Severity.GREEN,
            "interpretation": "Insufficient data for analysis",
            "legal_flag": False,
        }

    def _error_result(self, metric_name: str, error: str) -> dict[str, Any]:
        return {
            "metric_name": metric_name,
            "value": None,
            "severity": Severity.GREEN,
            "interpretation": f"Error computing metric: {error}",
            "legal_flag": False,
        }
