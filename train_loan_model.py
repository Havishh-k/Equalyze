import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, accuracy_score
import joblib

DATA_PATH = r'C:\Users\Havish\.cache\kagglehub\datasets\adarshsng\lending-club-loan-data-csv\versions\1\loan.csv'

print("Loading a sample of the dataset...")
# Load a subset of rows to save time and memory. Adjust nrows or remove it for full dataset.
# We will read chunks and filter for completed loans (Fully Paid / Charged Off)
chunks = pd.read_csv(DATA_PATH, chunksize=100000, low_memory=False)
df_list = []
target_statuses = ['Fully Paid', 'Charged Off']

for chunk in chunks:
    chunk = chunk[chunk['loan_status'].isin(target_statuses)]
    df_list.append(chunk.sample(frac=0.05, random_state=42)) # Keep 5% of completed loans for faster training

df = pd.concat(df_list, ignore_index=True)
print(f"Loaded {len(df)} rows of completed loans (Fully Paid / Charged Off).")

# Map target variable
# 1 = Fully Paid, 0 = Charged Off
df['target'] = df['loan_status'].apply(lambda x: 1 if x == 'Fully Paid' else 0)

# Select a subset of features that are available at the time of loan application (no future data leakage)
features = [
    'loan_amnt', 'term', 'int_rate', 'installment', 'grade', 'sub_grade',
    'emp_length', 'home_ownership', 'annual_inc', 'verification_status',
    'purpose', 'dti', 'delinq_2yrs', 'inq_last_6mths', 'open_acc',
    'pub_rec', 'revol_bal', 'revol_util', 'total_acc'
]

X = df[features].copy()
y = df['target']

# Preprocessing
# Identify numeric and categorical columns
numeric_features = X.select_dtypes(include=['int64', 'float64']).columns.tolist()
categorical_features = X.select_dtypes(include=['object']).columns.tolist()

# Drop 'term' string manipulation (e.g. ' 36 months' -> 36)
if 'term' in categorical_features:
    X['term'] = X['term'].str.extract(r'(\d+)').astype(float)
    categorical_features.remove('term')
    numeric_features.append('term')

print("Preprocessing pipeline setup...")
numeric_transformer = Pipeline(steps=[
    ('imputer', SimpleImputer(strategy='median')),
    ('scaler', StandardScaler())
])

categorical_transformer = Pipeline(steps=[
    ('imputer', SimpleImputer(strategy='constant', fill_value='missing')),
    ('onehot', OneHotEncoder(handle_unknown='ignore'))
])

preprocessor = ColumnTransformer(
    transformers=[
        ('num', numeric_transformer, numeric_features),
        ('cat', categorical_transformer, categorical_features)
    ])

# Define the model
model = Pipeline(steps=[
    ('preprocessor', preprocessor),
    ('classifier', RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42, n_jobs=-1))
])

# Train-test split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

print("Training the model...")
model.fit(X_train, y_train)

print("Evaluating the model...")
y_pred = model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)
print(f"Accuracy: {accuracy:.4f}")
print("Classification Report:")
print(classification_report(y_test, y_pred))

# Save the model
model_filename = 'loan_status_model.joblib'
joblib.dump(model, model_filename)
print(f"Model saved successfully to {model_filename}")
