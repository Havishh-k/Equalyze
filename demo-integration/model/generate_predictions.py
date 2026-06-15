import pandas as pd
import numpy as np

def generate_biased_data(num_samples: int = 1000, output_path: str = "predictions.csv"):
    """
    Generates a synthetic Loan Approval dataset using purely pandas and numpy.
    It intentionally injects severe bias against Female applicants (specifically those from Rural zip codes)
    to ensure the Equalyze CI/CD gate triggers a failure based on Disparate Impact and Equalized Odds.
    """
    np.random.seed(42)
    
    # 1. Base Demographic Distribution
    # Gender: 60% Male, 40% Female
    genders = np.random.choice(['Male', 'Female'], size=num_samples, p=[0.6, 0.4])
    
    # Region: 70% Urban, 30% Rural
    regions = np.random.choice(['Urban', 'Rural'], size=num_samples, p=[0.7, 0.3])
    
    # 2. Legitimate Factors
    # Income (base)
    incomes = np.random.normal(loc=60000, scale=20000, size=num_samples)
    incomes = np.clip(incomes, 20000, 200000)
    
    # Credit Score (base)
    credit_scores = np.random.normal(loc=650, scale=50, size=num_samples)
    credit_scores = np.clip(credit_scores, 300, 850)
    
    # 3. Construct DataFrame
    df = pd.DataFrame({
        'applicant_id': range(1, num_samples + 1),
        'gender': genders,
        'region': regions,
        'income': incomes.astype(int),
        'credit_score': credit_scores.astype(int)
    })
    
    # 4. Define True Default Risk (Legitimate factor)
    # Higher income and higher credit score -> Lower true risk
    base_risk = (850 - df['credit_score']) / 550 + (200000 - df['income']) / 360000
    df['true_default_risk'] = np.clip(base_risk, 0.1, 0.9)
    
    # 5. Inject Algorithmic Bias into the "Model Prediction"
    # The 'model' predicts approval. We want to penalize Female applicants, particularly in Rural areas,
    # regardless of their actual credit score or income.
    
    approval_probabilities = 1.0 - df['true_default_risk']
    
    # Severe penalty for Female applicants
    approval_probabilities = np.where(df['gender'] == 'Female', approval_probabilities * 0.5, approval_probabilities)
    
    # Compounding penalty for Rural Female applicants
    approval_probabilities = np.where((df['gender'] == 'Female') & (df['region'] == 'Rural'), 
                                      approval_probabilities * 0.4, 
                                      approval_probabilities)
    
    # Boost for Male Urban applicants
    approval_probabilities = np.where((df['gender'] == 'Male') & (df['region'] == 'Urban'), 
                                      approval_probabilities * 1.2, 
                                      approval_probabilities)
    
    # Clip probabilities and generate binary outcome
    approval_probabilities = np.clip(approval_probabilities, 0.0, 1.0)
    df['loan_approved'] = np.random.binomial(1, approval_probabilities)
    
    # Drop intermediate columns to mimic a standard output
    df = df.drop(columns=['true_default_risk'])
    
    # Map to strings for readability in the UI
    df['loan_approved'] = df['loan_approved'].map({1: 'Approved', 0: 'Rejected'})
    
    # Save
    df.to_csv(output_path, index=False)
    print(f"Generated synthetic biased dataset at {output_path} with {num_samples} rows.")
    print("WARNING: This dataset contains intentionally injected algorithmic bias.")

if __name__ == "__main__":
    import os
    # Ensure data directory exists if script is run directly
    output_file = os.environ.get("DATASET_PATH", "predictions.csv")
    generate_biased_data(output_path=output_file)
