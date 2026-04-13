"""
Equalyze — Demo Dataset Generator
Generates the two core demo datasets with known, verifiable biases.
"""

import pandas as pd
import numpy as np
from pathlib import Path


def generate_healthcare_insurance_dataset(n: int = 500, seed: int = 42) -> pd.DataFrame:
    """
    Healthcare/Insurance dataset with ZIP CODE PROXY BIAS.
    
    KNOWN BIAS: Rural zip codes systematically get higher premiums,
    even with identical clinical profiles. Zip code proxies for
    socioeconomic status / race.
    
    The "Counterfactual Twin" moment:
    Patient A: 45yo, Type 2 Diabetes, BMI 28, urban zip → ₹8,400/yr
    Patient B: 45yo, Type 2 Diabetes, BMI 28, rural zip → ₹14,200/yr
    """
    rng = np.random.RandomState(seed)
    
    # Demographics
    patient_ids = [f"P{str(i).zfill(4)}" for i in range(n)]
    ages = rng.randint(25, 70, n)
    genders = rng.choice(["Male", "Female"], n, p=[0.52, 0.48])
    
    # Clinical features (valid decision factors)
    bmi = rng.normal(27, 4, n).clip(18, 45).round(1)
    blood_pressure_systolic = rng.normal(130, 15, n).clip(90, 180).astype(int)
    cholesterol = rng.normal(210, 30, n).clip(120, 320).astype(int)
    hba1c = rng.normal(6.5, 1.2, n).clip(4.0, 12.0).round(1)
    smoking = rng.choice(["Yes", "No"], n, p=[0.25, 0.75])
    exercise_hours_weekly = rng.randint(0, 12, n)
    pre_existing_conditions = rng.randint(0, 4, n)
    family_history_risk = rng.choice(["Low", "Medium", "High"], n, p=[0.4, 0.35, 0.25])
    
    # Protected attribute: Zip code (proxy for socioeconomic status)
    zip_types = rng.choice(["Urban", "Semi-Urban", "Rural"], n, p=[0.45, 0.30, 0.25])
    
    # Another protected attribute: Gender already defined above
    
    # Calculate a "fair" base premium based on clinical factors
    base_premium = (
        3000
        + (bmi - 22) * 120
        + (blood_pressure_systolic - 120) * 25
        + (cholesterol - 180) * 8
        + (hba1c - 5.5) * 500
        + np.where(smoking == "Yes", 2000, 0)
        + pre_existing_conditions * 800
        - exercise_hours_weekly * 100
        + np.where(family_history_risk == "High", 1500, np.where(family_history_risk == "Medium", 700, 0))
    )
    
    # INJECT BIAS: Zip code systematically affects premium
    zip_bias = np.where(
        zip_types == "Rural", 
        rng.uniform(3000, 6000, n),       # Rural: +₹3000-6000 UNFAIR
        np.where(
            zip_types == "Semi-Urban",
            rng.uniform(500, 2000, n),     # Semi-Urban: +₹500-2000
            rng.uniform(-500, 500, n)      # Urban: ±₹500 (baseline)
        )
    )
    
    # INJECT GENDER BIAS: Slight but detectable
    gender_bias = np.where(genders == "Female", rng.uniform(400, 1200, n), 0)
    
    # Final premium
    annual_premium = (base_premium + zip_bias + gender_bias + rng.normal(0, 300, n)).clip(4000, 30000).astype(int)
    
    # Claim approval (binary outcome) — also biased by zip code
    approval_score = (
        0.6 
        - (bmi - 25) * 0.01
        - (blood_pressure_systolic - 120) * 0.003
        - (hba1c - 6.0) * 0.05
        + np.where(smoking == "No", 0.1, -0.05)
        - pre_existing_conditions * 0.05
        # BIAS: zip code unfairly reduces approval chance
        + np.where(zip_types == "Urban", 0.15, np.where(zip_types == "Semi-Urban", 0.0, -0.2))
    )
    claim_approved = (approval_score + rng.normal(0, 0.1, n) > 0.5).astype(int)
    
    df = pd.DataFrame({
        "patient_id": patient_ids,
        "age": ages,
        "gender": genders,
        "zip_type": zip_types,
        "bmi": bmi,
        "blood_pressure_systolic": blood_pressure_systolic,
        "cholesterol": cholesterol,
        "hba1c": hba1c,
        "smoking_status": smoking,
        "exercise_hours_weekly": exercise_hours_weekly,
        "pre_existing_conditions": pre_existing_conditions,
        "family_history_risk": family_history_risk,
        "annual_premium_inr": annual_premium,
        "claim_approved": claim_approved,
    })
    
    return df


def generate_msme_lending_dataset(n: int = 600, seed: int = 42) -> pd.DataFrame:
    """
    MSME Lending dataset with GENDER + GEOGRAPHY BIAS.
    
    KNOWN BIAS: Female business owners and rural applicants
    are systematically rejected despite equivalent financials.
    
    The "Counterfactual Twin" moment:
    Applicant A: Male, ₹28L revenue, 4 yrs, credit 710 → Approved, 12.5%
    Applicant B: Female, identical financials → Rejected
    """
    rng = np.random.RandomState(seed)
    
    applicant_ids = [f"MSME{str(i).zfill(4)}" for i in range(n)]
    
    # Protected attributes
    genders = rng.choice(["Male", "Female"], n, p=[0.62, 0.38])
    regions = rng.choice(["Urban", "Semi-Urban", "Rural"], n, p=[0.40, 0.35, 0.25])
    
    # Valid decision factors
    annual_revenue_lakhs = rng.lognormal(3.0, 0.6, n).clip(2, 200).round(1)
    years_in_business = rng.randint(1, 20, n)
    credit_score = rng.normal(680, 50, n).clip(500, 850).astype(int)
    num_employees = rng.randint(1, 50, n)
    existing_loans = rng.randint(0, 4, n)
    collateral_ratio = rng.uniform(0.3, 2.0, n).round(2)
    
    business_types = rng.choice(
        ["Manufacturing", "Services", "Retail", "Agriculture", "Technology"],
        n, p=[0.25, 0.30, 0.20, 0.15, 0.10]
    )
    
    loan_amount_lakhs = (annual_revenue_lakhs * rng.uniform(0.3, 1.5, n)).round(1)
    
    # Calculate fair credit score
    fair_score = (
        0.5
        + (credit_score - 600) * 0.003
        + np.log(annual_revenue_lakhs + 1) * 0.08
        + years_in_business * 0.02
        + collateral_ratio * 0.1
        - existing_loans * 0.08
        - (loan_amount_lakhs / (annual_revenue_lakhs + 1)) * 0.1
    )
    
    # INJECT GENDER BIAS: Female applicants face a penalty
    gender_penalty = np.where(genders == "Female", -0.18, 0.05)
    
    # INJECT GEOGRAPHY BIAS: Rural applicants face a penalty
    region_penalty = np.where(
        regions == "Rural", -0.15,
        np.where(regions == "Semi-Urban", -0.05, 0.08)
    )
    
    # Final approval decision
    final_score = fair_score + gender_penalty + region_penalty + rng.normal(0, 0.08, n)
    loan_approved = (final_score > 0.55).astype(int)
    
    # Interest rate (for approved loans) — also biased
    base_interest = 14 - (credit_score - 600) * 0.01 - years_in_business * 0.1
    interest_bias = np.where(genders == "Female", 1.5, 0) + np.where(regions == "Rural", 1.2, 0)
    interest_rate = (base_interest + interest_bias + rng.normal(0, 0.5, n)).clip(8, 24).round(1)
    interest_rate = np.where(loan_approved == 1, interest_rate, 0.0)
    
    df = pd.DataFrame({
        "applicant_id": applicant_ids,
        "gender": genders,
        "region": regions,
        "business_type": business_types,
        "annual_revenue_lakhs": annual_revenue_lakhs,
        "years_in_business": years_in_business,
        "credit_score": credit_score,
        "num_employees": num_employees,
        "existing_loans": existing_loans,
        "collateral_ratio": collateral_ratio,
        "loan_amount_requested_lakhs": loan_amount_lakhs,
        "loan_approved": loan_approved,
        "interest_rate": interest_rate,
    })
    
    return df


def generate_clean_healthcare_dataset(n: int = 300, seed: int = 99) -> pd.DataFrame:
    """
    Clean/unbiased healthcare dataset — should produce GREEN results.
    Used to validate no false positives.
    """
    rng = np.random.RandomState(seed)
    
    patient_ids = [f"CP{str(i).zfill(4)}" for i in range(n)]
    ages = rng.randint(25, 70, n)
    genders = rng.choice(["Male", "Female"], n, p=[0.50, 0.50])
    zip_types = rng.choice(["Urban", "Semi-Urban", "Rural"], n, p=[0.33, 0.34, 0.33])
    bmi = rng.normal(26, 4, n).clip(18, 42).round(1)
    hba1c = rng.normal(6.0, 1.0, n).clip(4.0, 10.0).round(1)
    smoking = rng.choice(["Yes", "No"], n, p=[0.20, 0.80])
    
    # Fair premium — NO bias injected
    premium = (
        5000
        + (bmi - 22) * 100
        + (hba1c - 5.5) * 400
        + np.where(smoking == "Yes", 1500, 0)
        + rng.normal(0, 300, n)
    ).clip(3000, 20000).astype(int)
    
    # Fair approval — NO bias injected
    approval_score = 0.6 - (bmi - 25) * 0.01 - (hba1c - 6.0) * 0.04 + rng.normal(0, 0.1, n)
    claim_approved = (approval_score > 0.5).astype(int)
    
    return pd.DataFrame({
        "patient_id": patient_ids,
        "age": ages,
        "gender": genders,
        "zip_type": zip_types,
        "bmi": bmi,
        "hba1c": hba1c,
        "smoking_status": smoking,
        "annual_premium_inr": premium,
        "claim_approved": claim_approved,
    })


if __name__ == "__main__":
    """Generate and save all demo datasets."""
    out_dir = Path(__file__).parent.parent.parent / "tests" / "fixtures" / "datasets"
    out_dir.mkdir(parents=True, exist_ok=True)
    
    # Healthcare with bias
    hc = generate_healthcare_insurance_dataset()
    hc.to_csv(out_dir / "healthcare_insurance_biased.csv", index=False)
    print(f"DONE Healthcare (biased): {len(hc)} rows")
    print(f"   Claim approval by zip: {hc.groupby('zip_type')['claim_approved'].mean().to_dict()}")
    print(f"   Claim approval by gender: {hc.groupby('gender')['claim_approved'].mean().to_dict()}")
    
    # MSME Lending with bias
    msme = generate_msme_lending_dataset()
    msme.to_csv(out_dir / "msme_lending_gender_bias.csv", index=False)
    print(f"\nDONE MSME Lending (biased): {len(msme)} rows")
    print(f"   Approval by gender: {msme.groupby('gender')['loan_approved'].mean().to_dict()}")
    print(f"   Approval by region: {msme.groupby('region')['loan_approved'].mean().to_dict()}")
    
    # Clean healthcare
    clean = generate_clean_healthcare_dataset()
    clean.to_csv(out_dir / "healthcare_unbiased.csv", index=False)
    print(f"\nDONE Healthcare (clean): {len(clean)} rows")
    print(f"   Claim approval by zip: {clean.groupby('zip_type')['claim_approved'].mean().to_dict()}")
    print(f"   Claim approval by gender: {clean.groupby('gender')['claim_approved'].mean().to_dict()}")
