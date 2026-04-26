"""
=============================================================================
 MASTER MULTI-DATASET TRAINING PIPELINE
 Trains bias-audit ML models across Healthcare, MSME, Insurance, and HR domains
=============================================================================
"""
import os
import sys
import time
import warnings
import traceback
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler, OneHotEncoder, LabelEncoder
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model import SGDClassifier, LogisticRegression
from sklearn.metrics import classification_report, accuracy_score, roc_auc_score
import joblib

warnings.filterwarnings('ignore')

# ── Output directory ────────────────────────────────────────────────────────
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), 'trained_models')
os.makedirs(OUTPUT_DIR, exist_ok=True)

RESULTS = []   # Collect results for summary


def save_model(model_dict, name):
    path = os.path.join(OUTPUT_DIR, f'{name}.joblib')
    joblib.dump(model_dict, path)
    print(f"  💾 Saved → {path}")
    return path


def log_result(domain, name, rows, accuracy, auc=None, extra=""):
    RESULTS.append({
        'domain': domain,
        'dataset': name,
        'rows': rows,
        'accuracy': round(accuracy, 4),
        'auc': round(auc, 4) if auc else 'N/A',
        'notes': extra
    })


def build_pipeline(numeric_features, categorical_features, classifier=None):
    """Build a standard sklearn preprocessing + classifier pipeline."""
    numeric_transformer = Pipeline([
        ('imputer', SimpleImputer(strategy='median')),
        ('scaler', StandardScaler())
    ])
    categorical_transformer = Pipeline([
        ('imputer', SimpleImputer(strategy='constant', fill_value='missing')),
        ('onehot', OneHotEncoder(handle_unknown='ignore', sparse_output=False))
    ])
    preprocessor = ColumnTransformer(transformers=[
        ('num', numeric_transformer, numeric_features),
        ('cat', categorical_transformer, categorical_features)
    ])
    if classifier is None:
        classifier = RandomForestClassifier(n_estimators=100, max_depth=12, random_state=42, n_jobs=-1)
    return Pipeline([('preprocessor', preprocessor), ('classifier', classifier)])


def train_and_evaluate(X, y, pipeline, dataset_name, domain):
    """Standard train/test split, fit, evaluate, and save."""
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    pipeline.fit(X_train, y_train)
    y_pred = pipeline.predict(X_test)

    acc = accuracy_score(y_test, y_pred)
    try:
        if len(np.unique(y)) == 2:
            y_proba = pipeline.predict_proba(X_test)[:, 1]
            auc = roc_auc_score(y_test, y_proba)
        else:
            auc = None
    except Exception:
        auc = None

    print(f"  ✅ Accuracy: {acc:.4f}" + (f"  |  AUC: {auc:.4f}" if auc else ""))
    print(classification_report(y_test, y_pred, zero_division=0))

    save_model({'model': pipeline, 'features': list(X.columns)}, dataset_name)
    log_result(domain, dataset_name, len(X), acc, auc)


# ═══════════════════════════════════════════════════════════════════════════
# PHASE 1: HEALTHCARE
# ═══════════════════════════════════════════════════════════════════════════
def phase1_maternal_health():
    print("\n" + "="*70)
    print("PHASE 1A: Maternal Health Risk (Healthcare / South Asia)")
    print("="*70)
    try:
        import kagglehub
        path = kagglehub.dataset_download("csafrit2/maternal-health-risk-data")
        csv = os.path.join(path, 'Maternal Health Risk Data Set.csv')
        if not os.path.exists(csv):
            # try alternate filename
            for f in os.listdir(path):
                if f.endswith('.csv'):
                    csv = os.path.join(path, f)
                    break
        df = pd.read_csv(csv)
        print(f"  Loaded {len(df)} rows, {len(df.columns)} columns")

        target = 'RiskLevel'
        le = LabelEncoder()
        df[target] = le.fit_transform(df[target])

        features = [c for c in df.columns if c != target]
        numeric = df[features].select_dtypes(include=[np.number]).columns.tolist()
        categorical = [c for c in features if c not in numeric]

        pipeline = build_pipeline(numeric, categorical)
        train_and_evaluate(df[features], df[target], pipeline, 'maternal_health_risk', 'Healthcare')
    except Exception as e:
        print(f"  ❌ Failed: {e}")
        traceback.print_exc()


# ═══════════════════════════════════════════════════════════════════════════
# PHASE 2: MSME & LENDING
# ═══════════════════════════════════════════════════════════════════════════
def phase2a_german_credit():
    print("\n" + "="*70)
    print("PHASE 2A: German Credit Data (MSME / Fairness Benchmark)")
    print("="*70)
    try:
        import kagglehub
        path = kagglehub.dataset_download("uciml/german-credit")
        csv = None
        for f in os.listdir(path):
            if f.endswith('.csv'):
                csv = os.path.join(path, f)
                break
        if csv is None:
            # Walk subdirectories
            for root, dirs, files in os.walk(path):
                for f in files:
                    if f.endswith('.csv'):
                        csv = os.path.join(root, f)
                        break
        df = pd.read_csv(csv)
        print(f"  Loaded {len(df)} rows, {len(df.columns)} columns")

        # The target column varies — typically last column or 'default'
        possible_targets = ['default', 'Risk', 'class', 'Creditability']
        target = None
        for t in possible_targets:
            if t in df.columns:
                target = t
                break
        if target is None:
            target = df.columns[-1]  # fallback: last column

        features = [c for c in df.columns if c != target]
        numeric = df[features].select_dtypes(include=[np.number]).columns.tolist()
        categorical = [c for c in features if c not in numeric]

        pipeline = build_pipeline(numeric, categorical)
        train_and_evaluate(df[features], df[target], pipeline, 'german_credit', 'MSME/Lending')
    except Exception as e:
        print(f"  ❌ Failed: {e}")
        traceback.print_exc()


def phase2b_taiwan_credit():
    print("\n" + "="*70)
    print("PHASE 2B: Taiwan Credit Card Default (MSME / Lending)")
    print("="*70)
    try:
        import kagglehub
        path = kagglehub.dataset_download("uciml/default-of-credit-card-clients-dataset")
        csv = None
        for root, dirs, files in os.walk(path):
            for f in files:
                if f.endswith('.csv'):
                    csv = os.path.join(root, f)
                    break
        df = pd.read_csv(csv)
        print(f"  Loaded {len(df)} rows, {len(df.columns)} columns")

        # Target: 'default.payment.next.month' or 'default payment next month'
        target = None
        for col in df.columns:
            if 'default' in col.lower():
                target = col
                break
        if target is None:
            target = df.columns[-1]

        features = [c for c in df.columns if c != target and c.lower() != 'id']
        numeric = df[features].select_dtypes(include=[np.number]).columns.tolist()
        categorical = [c for c in features if c not in numeric]

        pipeline = build_pipeline(numeric, categorical)
        train_and_evaluate(df[features], df[target], pipeline, 'taiwan_credit_default', 'MSME/Lending')
    except Exception as e:
        print(f"  ❌ Failed: {e}")
        traceback.print_exc()


def phase2c_sba_loans():
    print("\n" + "="*70)
    print("PHASE 2C: SBA Small Business Loans (MSME / Lending)")
    print("="*70)
    try:
        import kagglehub
        path = kagglehub.dataset_download("mizbahul/small-business-administration-sba")
        csv = None
        for root, dirs, files in os.walk(path):
            for f in files:
                if f.endswith('.csv'):
                    csv = os.path.join(root, f)
                    break
        if csv is None:
            print("  ⚠️  CSV not found, trying alternate slug...")
            path = kagglehub.dataset_download("larsen0966/sba-loans-case-data-set")
            for root, dirs, files in os.walk(path):
                for f in files:
                    if f.endswith('.csv'):
                        csv = os.path.join(root, f)
                        break

        df = pd.read_csv(csv, low_memory=False)
        print(f"  Loaded {len(df)} rows, {len(df.columns)} columns")

        # Target is 'MIS_Status' → 'P I F' (Paid in Full) or 'CHGOFF' (Charged Off)
        target_col = 'MIS_Status'
        if target_col not in df.columns:
            # Try finding it
            for col in df.columns:
                if 'status' in col.lower() or 'mis' in col.lower():
                    target_col = col
                    break

        df = df[df[target_col].isin(['P I F', 'CHGOFF'])].copy()
        df['target'] = (df[target_col] == 'P I F').astype(int)

        # Select numeric-friendly features
        drop_cols = [target_col, 'target', 'Name', 'City', 'State', 'Bank', 'BankState',
                     'ApprovalDate', 'DisbursementDate', 'LoanNr_ChkDgt', 'ChgOffDate']
        features = [c for c in df.columns if c not in drop_cols]
        
        for col in features:
            df[col] = pd.to_numeric(df[col].astype(str).str.replace(r'[\$,]', '', regex=True), errors='coerce')

        df = df.dropna(axis=1, thresh=int(len(df)*0.5))
        features = [c for c in df.columns if c not in [target_col, 'target']]
        numeric = features  # all converted to numeric
        categorical = []

        pipeline = build_pipeline(numeric, categorical,
                                  classifier=GradientBoostingClassifier(n_estimators=100, max_depth=6, random_state=42))
        train_and_evaluate(df[features], df['target'], pipeline, 'sba_loans', 'MSME/Lending')
    except Exception as e:
        print(f"  ❌ Failed: {e}")
        traceback.print_exc()


def phase2d_lending_club():
    print("\n" + "="*70)
    print("PHASE 2D: Lending Club Full Dataset (MSME / Lending) — Incremental")
    print("="*70)
    DATA_PATH = r'C:\Users\Havish\.cache\kagglehub\datasets\adarshsng\lending-club-loan-data-csv\versions\1\loan.csv'
    if not os.path.exists(DATA_PATH):
        print("  ⚠️  Lending Club CSV not found, skipping.")
        return
    try:
        features = ['loan_amnt', 'int_rate', 'installment', 'annual_inc', 'dti',
                     'delinq_2yrs', 'inq_last_6mths', 'open_acc', 'pub_rec',
                     'revol_bal', 'revol_util', 'total_acc']

        scaler = StandardScaler()
        imputer = SimpleImputer(strategy='median')
        model = SGDClassifier(loss='log_loss', random_state=42)
        classes = np.array([0, 1])

        chunks = pd.read_csv(DATA_PATH, chunksize=100000, low_memory=False)
        phase = 0
        total = 0
        for chunk in chunks:
            chunk = chunk[chunk['loan_status'].isin(['Fully Paid', 'Charged Off'])]
            if len(chunk) == 0:
                continue
            y = (chunk['loan_status'] == 'Fully Paid').astype(int).values
            X = chunk[features].copy()
            for c in features:
                X[c] = pd.to_numeric(X[c], errors='coerce')
            if phase == 0:
                X_imp = imputer.fit_transform(X)
                X_sc = scaler.fit_transform(X_imp)
            else:
                X_imp = imputer.transform(X)
                X_sc = scaler.transform(X_imp)
            model.partial_fit(X_sc, y, classes=classes)
            phase += 1
            total += len(X)
            if phase % 10 == 0:
                print(f"  Phase {phase}: {total} samples trained")

        print(f"  ✅ Incremental training done — {total} total samples across {phase} phases")
        save_model({'model': model, 'scaler': scaler, 'imputer': imputer, 'features': features},
                   'lending_club_incremental')
        log_result('MSME/Lending', 'lending_club_incremental', total, 0.0, extra='incremental—no holdout eval')
    except Exception as e:
        print(f"  ❌ Failed: {e}")
        traceback.print_exc()


# ═══════════════════════════════════════════════════════════════════════════
# PHASE 3: INSURANCE
# ═══════════════════════════════════════════════════════════════════════════
def phase3a_medical_cost():
    print("\n" + "="*70)
    print("PHASE 3A: Medical Cost / Insurance Charges (Insurance)")
    print("="*70)
    try:
        import kagglehub
        path = kagglehub.dataset_download("mirichoi0218/insurance")
        csv = None
        for root, dirs, files in os.walk(path):
            for f in files:
                if f.endswith('.csv'):
                    csv = os.path.join(root, f)
                    break
        df = pd.read_csv(csv)
        print(f"  Loaded {len(df)} rows, {len(df.columns)} columns")

        # This is a regression problem (charges). Convert to classification: high vs low cost
        median_charge = df['charges'].median()
        df['target'] = (df['charges'] >= median_charge).astype(int)

        features = [c for c in df.columns if c not in ['charges', 'target']]
        numeric = df[features].select_dtypes(include=[np.number]).columns.tolist()
        categorical = [c for c in features if c not in numeric]

        pipeline = build_pipeline(numeric, categorical)
        train_and_evaluate(df[features], df['target'], pipeline, 'medical_cost_insurance', 'Insurance')
    except Exception as e:
        print(f"  ❌ Failed: {e}")
        traceback.print_exc()


# ═══════════════════════════════════════════════════════════════════════════
# PHASE 4: HR & HIRING
# ═══════════════════════════════════════════════════════════════════════════
def phase4a_ibm_hr():
    print("\n" + "="*70)
    print("PHASE 4A: IBM HR Analytics — Employee Attrition (HR)")
    print("="*70)
    try:
        import kagglehub
        path = kagglehub.dataset_download("pavansubhasht/ibm-hr-analytics-attrition-dataset")
        csv = None
        for root, dirs, files in os.walk(path):
            for f in files:
                if f.endswith('.csv'):
                    csv = os.path.join(root, f)
                    break
        df = pd.read_csv(csv)
        print(f"  Loaded {len(df)} rows, {len(df.columns)} columns")

        target = 'Attrition'
        df[target] = (df[target] == 'Yes').astype(int)

        drop_cols = [target, 'EmployeeNumber', 'EmployeeCount', 'StandardHours', 'Over18']
        features = [c for c in df.columns if c not in drop_cols]
        numeric = df[features].select_dtypes(include=[np.number]).columns.tolist()
        categorical = [c for c in features if c not in numeric]

        pipeline = build_pipeline(numeric, categorical)
        train_and_evaluate(df[features], df[target], pipeline, 'ibm_hr_attrition', 'HR/Hiring')
    except Exception as e:
        print(f"  ❌ Failed: {e}")
        traceback.print_exc()


def phase4b_adult_census():
    print("\n" + "="*70)
    print("PHASE 4B: Adult Census Income (HR / Fairness Benchmark)")
    print("="*70)
    try:
        import kagglehub
        path = kagglehub.dataset_download("uciml/adult-census-income")
        csv = None
        for root, dirs, files in os.walk(path):
            for f in files:
                if f.endswith('.csv'):
                    csv = os.path.join(root, f)
                    break
        df = pd.read_csv(csv)
        print(f"  Loaded {len(df)} rows, {len(df.columns)} columns")

        # Target: income >50K or <=50K
        target_col = None
        for col in df.columns:
            if 'income' in col.lower():
                target_col = col
                break
        if target_col is None:
            target_col = df.columns[-1]

        df['target'] = df[target_col].astype(str).str.strip().apply(lambda x: 1 if '>50K' in x else 0)

        drop_cols = [target_col, 'target']
        features = [c for c in df.columns if c not in drop_cols]
        numeric = df[features].select_dtypes(include=[np.number]).columns.tolist()
        categorical = [c for c in features if c not in numeric]

        pipeline = build_pipeline(numeric, categorical)
        train_and_evaluate(df[features], df['target'], pipeline, 'adult_census_income', 'HR/Hiring')
    except Exception as e:
        print(f"  ❌ Failed: {e}")
        traceback.print_exc()


def phase4c_campus_recruitment():
    print("\n" + "="*70)
    print("PHASE 4C: Campus Recruitment — India (HR / Hiring)")
    print("="*70)
    try:
        import kagglehub
        path = kagglehub.dataset_download("benroshan/factors-affecting-campus-placement")
        csv = None
        for root, dirs, files in os.walk(path):
            for f in files:
                if f.endswith('.csv'):
                    csv = os.path.join(root, f)
                    break
        df = pd.read_csv(csv)
        print(f"  Loaded {len(df)} rows, {len(df.columns)} columns")

        # Target: 'status' → Placed / Not Placed
        target_col = 'status'
        if target_col not in df.columns:
            for col in df.columns:
                if 'status' in col.lower() or 'placed' in col.lower():
                    target_col = col
                    break

        df['target'] = (df[target_col] == 'Placed').astype(int)

        drop_cols = [target_col, 'target', 'sl_no', 'salary']
        features = [c for c in df.columns if c not in drop_cols and c in df.columns]
        numeric = df[features].select_dtypes(include=[np.number]).columns.tolist()
        categorical = [c for c in features if c not in numeric]

        pipeline = build_pipeline(numeric, categorical)
        train_and_evaluate(df[features], df['target'], pipeline, 'campus_recruitment_india', 'HR/Hiring')
    except Exception as e:
        print(f"  ❌ Failed: {e}")
        traceback.print_exc()


# ═══════════════════════════════════════════════════════════════════════════
# MAIN: RUN ALL PHASES
# ═══════════════════════════════════════════════════════════════════════════
if __name__ == '__main__':
    start = time.time()
    print("╔" + "═"*68 + "╗")
    print("║   MASTER MULTI-DATASET TRAINING PIPELINE                          ║")
    print("║   Domains: Healthcare · MSME/Lending · Insurance · HR/Hiring      ║")
    print("╚" + "═"*68 + "╝")

    # Phase 1: Healthcare
    phase1_maternal_health()

    # Phase 2: MSME & Lending
    phase2a_german_credit()
    phase2b_taiwan_credit()
    phase2c_sba_loans()
    phase2d_lending_club()

    # Phase 3: Insurance
    phase3a_medical_cost()

    # Phase 4: HR & Hiring
    phase4a_ibm_hr()
    phase4b_adult_census()
    phase4c_campus_recruitment()

    elapsed = time.time() - start

    # Print summary
    print("\n" + "="*70)
    print("  TRAINING SUMMARY")
    print("="*70)
    print(f"{'Domain':<16} {'Dataset':<30} {'Rows':>10} {'Accuracy':>10} {'AUC':>8}")
    print("-"*70)
    for r in RESULTS:
        print(f"{r['domain']:<16} {r['dataset']:<30} {r['rows']:>10,} {r['accuracy']:>10} {str(r['auc']):>8}")
    print("-"*70)
    print(f"Total datasets trained: {len(RESULTS)}  |  Total time: {elapsed:.1f}s")
    print(f"All models saved to: {OUTPUT_DIR}")
