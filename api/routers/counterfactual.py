"""
Equalyze — Counterfactual Twin Explorer API
The "smoking gun" endpoint: prove bias by showing how flipping
a single protected attribute changes the model's decision.
"""

import os
import copy
import joblib
import numpy as np
import pandas as pd
from pathlib import Path
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

MODELS_DIR = Path(__file__).parent.parent.parent / "trained_models"

# ── Registry of trained models + their schema ────────────────────────────
MODEL_REGISTRY = {
    "lending_club": {
        "file": "lending_club_incremental.joblib",
        "domain": "MSME / Lending",
        "label": "Lending Club Loan Default",
        "features": [
            "loan_amnt", "int_rate", "installment", "annual_inc", "dti",
            "delinq_2yrs", "inq_last_6mths", "open_acc", "pub_rec",
            "revol_bal", "revol_util", "total_acc"
        ],
        "protected_attrs": {
            "annual_inc": {"type": "numeric", "label": "Annual Income", "flip_values": [30000, 80000, 150000]},
        },
        "outcome_label": ["Charged Off", "Fully Paid"],
        "type": "incremental",
    },
    "taiwan_credit": {
        "file": "taiwan_credit_default.joblib",
        "domain": "MSME / Lending",
        "label": "Taiwan Credit Card Default",
        "features": None,  # loaded from model
        "protected_attrs": {
            "SEX": {"type": "categorical", "label": "Gender", "flip_values": [1, 2], "value_labels": {1: "Male", 2: "Female"}},
            "AGE": {"type": "numeric", "label": "Age", "flip_values": [25, 35, 50, 65]},
            "EDUCATION": {"type": "categorical", "label": "Education", "flip_values": [1, 2, 3], "value_labels": {1: "Graduate School", 2: "University", 3: "High School"}},
        },
        "outcome_label": ["No Default", "Default"],
        "type": "pipeline",
    },
    "adult_census": {
        "file": "adult_census_income.joblib",
        "domain": "HR / Hiring",
        "label": "Adult Census Income (>$50K)",
        "features": None,
        "protected_attrs": {
            "sex": {"type": "categorical", "label": "Gender", "flip_values": [" Male", " Female"], "value_labels": {" Male": "Male", " Female": "Female"}},
            "race": {"type": "categorical", "label": "Race", "flip_values": [" White", " Black", " Asian-Pac-Islander"], "value_labels": {" White": "White", " Black": "Black", " Asian-Pac-Islander": "Asian"}},
            "age": {"type": "numeric", "label": "Age", "flip_values": [25, 35, 45, 55]},
        },
        "outcome_label": ["<=50K", ">50K"],
        "type": "pipeline",
    },
    "ibm_hr": {
        "file": "ibm_hr_attrition.joblib",
        "domain": "HR / Hiring",
        "label": "IBM Employee Attrition",
        "features": None,
        "protected_attrs": {
            "Gender": {"type": "categorical", "label": "Gender", "flip_values": ["Male", "Female"], "value_labels": {"Male": "Male", "Female": "Female"}},
            "Age": {"type": "numeric", "label": "Age", "flip_values": [25, 35, 45, 55]},
            "MaritalStatus": {"type": "categorical", "label": "Marital Status", "flip_values": ["Single", "Married", "Divorced"], "value_labels": {"Single": "Single", "Married": "Married", "Divorced": "Divorced"}},
        },
        "outcome_label": ["Stays", "Leaves"],
        "type": "pipeline",
    },
    "medical_cost": {
        "file": "medical_cost_insurance.joblib",
        "domain": "Insurance",
        "label": "Medical Insurance Cost",
        "features": None,
        "protected_attrs": {
            "sex": {"type": "categorical", "label": "Gender", "flip_values": ["male", "female"], "value_labels": {"male": "Male", "female": "Female"}},
            "smoker": {"type": "categorical", "label": "Smoker", "flip_values": ["yes", "no"], "value_labels": {"yes": "Yes", "no": "No"}},
            "region": {"type": "categorical", "label": "Region", "flip_values": ["northeast", "southeast", "southwest", "northwest"], "value_labels": {"northeast": "Northeast", "southeast": "Southeast", "southwest": "Southwest", "northwest": "Northwest"}},
        },
        "outcome_label": ["Low Cost", "High Cost"],
        "type": "pipeline",
    },
    "campus_recruitment": {
        "file": "campus_recruitment_india.joblib",
        "domain": "HR / Hiring",
        "label": "Campus Recruitment (India)",
        "features": None,
        "protected_attrs": {
            "gender": {"type": "categorical", "label": "Gender", "flip_values": ["M", "F"], "value_labels": {"M": "Male", "F": "Female"}},
        },
        "outcome_label": ["Not Placed", "Placed"],
        "type": "pipeline",
    },
}

# ── Cache loaded models ──────────────────────────────────────────────────
_model_cache = {}


def _load_model(model_key: str):
    if model_key in _model_cache:
        return _model_cache[model_key]

    info = MODEL_REGISTRY.get(model_key)
    if not info:
        raise HTTPException(status_code=404, detail=f"Model '{model_key}' not found in registry")

    path = MODELS_DIR / info["file"]
    if not path.exists():
        raise HTTPException(status_code=404, detail=f"Model file not found: {path}")

    data = joblib.load(str(path))
    _model_cache[model_key] = data
    return data


# ── Request / Response Models ────────────────────────────────────────────
class CounterfactualRequest(BaseModel):
    model_key: str
    profile: dict  # feature_name → value
    flip_attribute: str
    flip_value: object  # the new value for the protected attribute


class CounterfactualResponse(BaseModel):
    original_prediction: int
    original_confidence: float
    flipped_prediction: int
    flipped_confidence: float
    bias_delta: float
    smoking_gun: bool
    original_label: str
    flipped_label: str
    flip_attribute_label: str
    original_attr_display: str
    flipped_attr_display: str


# ── Endpoints ────────────────────────────────────────────────────────────
@router.get("/counterfactual/models")
async def list_counterfactual_models():
    """List all available models for counterfactual analysis."""
    models = []
    for key, info in MODEL_REGISTRY.items():
        path = MODELS_DIR / info["file"]
        models.append({
            "key": key,
            "label": info["label"],
            "domain": info["domain"],
            "available": path.exists(),
            "protected_attrs": {
                k: {"label": v["label"], "type": v["type"], "flip_values": v["flip_values"],
                     "value_labels": v.get("value_labels", {})}
                for k, v in info["protected_attrs"].items()
            },
        })
    return {"models": models}


@router.get("/counterfactual/models/{model_key}/sample")
async def get_sample_profile(model_key: str):
    """Get a sample/default profile for a given model to populate the UI."""
    info = MODEL_REGISTRY.get(model_key)
    if not info:
        raise HTTPException(status_code=404, detail="Model not found")

    model_data = _load_model(model_key)

    if info["type"] == "incremental":
        features = model_data.get("features", info["features"])
        # Return sensible defaults
        sample = {f: 0.0 for f in features}
        sample.update({
            "loan_amnt": 15000, "int_rate": 13.5, "installment": 450,
            "annual_inc": 65000, "dti": 18.5, "delinq_2yrs": 0,
            "inq_last_6mths": 1, "open_acc": 8, "pub_rec": 0,
            "revol_bal": 12000, "revol_util": 55.0, "total_acc": 20,
        })
    else:
        features = model_data.get("features", [])
        sample = {f: 0.0 for f in features}

    return {"profile": sample, "features": list(sample.keys())}


@router.post("/counterfactual/explore", response_model=CounterfactualResponse)
async def explore_counterfactual(req: CounterfactualRequest):
    """
    The smoking gun endpoint.
    Takes a profile, flips one protected attribute, and compares predictions.
    """
    info = MODEL_REGISTRY.get(req.model_key)
    if not info:
        raise HTTPException(status_code=404, detail="Model not found")

    model_data = _load_model(req.model_key)

    if info["type"] == "incremental":
        return _predict_incremental(model_data, info, req)
    else:
        return _predict_pipeline(model_data, info, req)


def _predict_incremental(model_data, info, req: CounterfactualRequest):
    """Predict using the SGD incremental model (lending club)."""
    model = model_data["model"]
    scaler = model_data["scaler"]
    imputer = model_data["imputer"]
    features = model_data["features"]

    # Build original profile
    original = np.array([[req.profile.get(f, 0.0) for f in features]])
    original_imp = imputer.transform(original)
    original_sc = scaler.transform(original_imp)

    # Build flipped profile
    flipped_profile = copy.deepcopy(req.profile)
    flipped_profile[req.flip_attribute] = req.flip_value
    flipped = np.array([[flipped_profile.get(f, 0.0) for f in features]])
    flipped_imp = imputer.transform(flipped)
    flipped_sc = scaler.transform(flipped_imp)

    # Predict
    orig_pred = int(model.predict(original_sc)[0])
    orig_conf = float(np.max(model.predict_proba(original_sc)[0]))
    flip_pred = int(model.predict(flipped_sc)[0])
    flip_conf = float(np.max(model.predict_proba(flipped_sc)[0]))

    attr_info = info["protected_attrs"].get(req.flip_attribute, {})
    val_labels = attr_info.get("value_labels", {})

    return CounterfactualResponse(
        original_prediction=orig_pred,
        original_confidence=round(orig_conf, 4),
        flipped_prediction=flip_pred,
        flipped_confidence=round(flip_conf, 4),
        bias_delta=round(abs(orig_conf - flip_conf), 4),
        smoking_gun=orig_pred != flip_pred,
        original_label=info["outcome_label"][orig_pred],
        flipped_label=info["outcome_label"][flip_pred],
        flip_attribute_label=attr_info.get("label", req.flip_attribute),
        original_attr_display=str(val_labels.get(req.profile.get(req.flip_attribute), req.profile.get(req.flip_attribute, ""))),
        flipped_attr_display=str(val_labels.get(req.flip_value, req.flip_value)),
    )


def _predict_pipeline(model_data, info, req: CounterfactualRequest):
    """Predict using a standard sklearn Pipeline model."""
    model = model_data["model"]
    features = model_data["features"]

    # Build original DataFrame
    orig_row = {f: req.profile.get(f, 0) for f in features}
    df_orig = pd.DataFrame([orig_row])

    # Build flipped DataFrame
    flip_row = copy.deepcopy(orig_row)
    flip_row[req.flip_attribute] = req.flip_value
    df_flip = pd.DataFrame([flip_row])

    # Predict
    orig_pred = int(model.predict(df_orig)[0])
    flip_pred = int(model.predict(df_flip)[0])

    try:
        orig_proba = model.predict_proba(df_orig)[0]
        flip_proba = model.predict_proba(df_flip)[0]
        orig_conf = float(np.max(orig_proba))
        flip_conf = float(np.max(flip_proba))
    except Exception:
        orig_conf = 1.0 if orig_pred else 0.0
        flip_conf = 1.0 if flip_pred else 0.0

    attr_info = info["protected_attrs"].get(req.flip_attribute, {})
    val_labels = attr_info.get("value_labels", {})

    return CounterfactualResponse(
        original_prediction=orig_pred,
        original_confidence=round(orig_conf, 4),
        flipped_prediction=flip_pred,
        flipped_confidence=round(flip_conf, 4),
        bias_delta=round(abs(orig_conf - flip_conf), 4),
        smoking_gun=orig_pred != flip_pred,
        original_label=info["outcome_label"][min(orig_pred, len(info["outcome_label"])-1)],
        flipped_label=info["outcome_label"][min(flip_pred, len(info["outcome_label"])-1)],
        flip_attribute_label=attr_info.get("label", req.flip_attribute),
        original_attr_display=str(val_labels.get(req.profile.get(req.flip_attribute), req.profile.get(req.flip_attribute, ""))),
        flipped_attr_display=str(val_labels.get(req.flip_value, req.flip_value)),
    )
