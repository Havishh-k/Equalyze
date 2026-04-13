"""
Equalyze — Dataset Parser Service
Parses CSV/XLSX/JSON files into profiled DataFrames.
"""

import hashlib
import pandas as pd
import numpy as np
from pathlib import Path
from typing import Any


class DatasetParser:
    """Parse and profile uploaded datasets."""

    SUPPORTED_EXTENSIONS = {".csv", ".xlsx", ".xls", ".json"}

    def parse(self, file_path: str | Path) -> tuple[pd.DataFrame, dict[str, Any]]:
        """
        Parse a dataset file and return (DataFrame, profile).
        """
        path = Path(file_path)
        ext = path.suffix.lower()

        if ext == ".csv":
            df = pd.read_csv(path)
        elif ext in (".xlsx", ".xls"):
            df = pd.read_excel(path)
        elif ext == ".json":
            df = pd.read_json(path)
        else:
            raise ValueError(f"Unsupported file type: {ext}")

        profile = self._profile_dataset(df, path)
        return df, profile

    def _profile_dataset(self, df: pd.DataFrame, path: Path) -> dict[str, Any]:
        """Generate a statistical profile of the dataset."""
        # File hash
        with open(path, "rb") as f:
            file_hash = hashlib.sha256(f.read()).hexdigest()

        # Column analysis
        column_types = {}
        column_stats = {}
        for col in df.columns:
            dtype = str(df[col].dtype)
            null_rate = float(df[col].isnull().mean())
            unique_count = int(df[col].nunique())

            if pd.api.types.is_numeric_dtype(df[col]):
                col_type = "numeric"
                stats = {
                    "min": float(df[col].min()) if not df[col].isnull().all() else None,
                    "max": float(df[col].max()) if not df[col].isnull().all() else None,
                    "mean": float(df[col].mean()) if not df[col].isnull().all() else None,
                    "std": float(df[col].std()) if not df[col].isnull().all() else None,
                }
            elif pd.api.types.is_bool_dtype(df[col]) or unique_count <= 2:
                col_type = "binary"
                stats = {"values": df[col].value_counts().to_dict()}
            elif unique_count <= 20:
                col_type = "categorical"
                stats = {"values": df[col].value_counts().head(10).to_dict()}
            else:
                col_type = "text"
                stats = {"unique_count": unique_count}

            column_types[col] = col_type
            column_stats[col] = {
                "type": col_type,
                "dtype": dtype,
                "null_rate": null_rate,
                "unique_count": unique_count,
                **stats,
            }

        # Sample data (first 5 rows, cleaned for JSON)
        sample_df = df.head(5).copy()
        for col in sample_df.columns:
            sample_df[col] = sample_df[col].apply(
                lambda x: None if pd.isna(x) else (int(x) if isinstance(x, (np.integer,)) else (float(x) if isinstance(x, (np.floating,)) else x))
            )

        return {
            "file_hash": file_hash,
            "row_count": len(df),
            "column_count": len(df.columns),
            "column_names": list(df.columns),
            "column_types": column_types,
            "column_stats": column_stats,
            "sample_data": sample_df.to_dict(orient="records"),
            "file_size_bytes": path.stat().st_size,
        }


dataset_parser = DatasetParser()
