import pandas as pd
import numpy as np
from sklearn.linear_model import SGDClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.impute import SimpleImputer
import joblib
import warnings

# Suppress warnings for cleaner output
warnings.filterwarnings('ignore')

DATA_PATH = r'C:\Users\Havish\.cache\kagglehub\datasets\adarshsng\lending-club-loan-data-csv\versions\1\loan.csv'
CHUNK_SIZE = 50000

print("Starting phase-wise (incremental) training on the heavy dataset...")

# Features available at loan application
features = [
    'loan_amnt', 'int_rate', 'installment', 'annual_inc', 'dti', 
    'delinq_2yrs', 'inq_last_6mths', 'open_acc', 'pub_rec', 
    'revol_bal', 'revol_util', 'total_acc'
]

# Incremental learning requires us to manually handle preprocessing state
scaler = StandardScaler()
imputer = SimpleImputer(strategy='median')
model = SGDClassifier(loss='log_loss', random_state=42)

# We need to define all possible classes for partial_fit upfront
classes = np.array([0, 1])

chunk_iterator = pd.read_csv(DATA_PATH, chunksize=CHUNK_SIZE, low_memory=False)

phase = 1
total_samples_trained = 0

for chunk in chunk_iterator:
    # Filter only for completed loans (Fully Paid vs Charged Off)
    target_statuses = ['Fully Paid', 'Charged Off']
    chunk = chunk[chunk['loan_status'].isin(target_statuses)]
    
    if len(chunk) == 0:
        continue
        
    # Map target: 1 = Fully Paid, 0 = Charged Off
    y_chunk = chunk['loan_status'].apply(lambda x: 1 if x == 'Fully Paid' else 0).values
    X_chunk = chunk[features].copy()
    
    # Simple preprocessing: convert to numeric, coerce errors to NaN
    for col in features:
        X_chunk[col] = pd.to_numeric(X_chunk[col], errors='coerce')
    
    # Impute missing values
    # For the first phase, fit the imputer and scaler. For subsequent phases, just transform.
    # Note: A true incremental imputer/scaler would update its mean/variance, but for simplicity 
    # we fit on the first chunk or use a basic approximation.
    if phase == 1:
        X_chunk_imputed = imputer.fit_transform(X_chunk)
        X_chunk_scaled = scaler.fit_transform(X_chunk_imputed)
    else:
        X_chunk_imputed = imputer.transform(X_chunk)
        X_chunk_scaled = scaler.transform(X_chunk_imputed)
    
    # Train the model incrementally on this phase (chunk)
    model.partial_fit(X_chunk_scaled, y_chunk, classes=classes)
    
    total_samples_trained += len(X_chunk)
    print(f"Phase {phase} complete. Trained on {len(X_chunk)} samples (Total: {total_samples_trained})")
    phase += 1

print("\nPhase-wise training completed!")
print(f"Total samples trained on: {total_samples_trained}")

# Save the models and preprocessors so they can be used for inference
joblib.dump({
    'model': model,
    'scaler': scaler,
    'imputer': imputer,
    'features': features
}, 'incremental_loan_model.joblib')

print("Model and preprocessing pipeline saved to 'incremental_loan_model.joblib'")
