import os
import sys
import time
import subprocess

# Add SDK src path to sys.path so we can import it locally without pip installing it
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "sdk", "src"))
try:
    from equalyze import EqualyzeClient
    from equalyze.exceptions import EqualyzeAPIError, EqualyzeTimeoutError
except ImportError:
    print("Error: Could not find Equalyze SDK. Ensure it's available in the ../sdk/src directory.")
    sys.exit(2)

def generate_predictions():
    print("--- [CI/CD Pipeline] Step 1: Model Prediction Generation ---")
    script_path = os.path.join(os.path.dirname(__file__), "model", "generate_predictions.py")
    
    try:
        subprocess.run([sys.executable, script_path], check=True)
    except subprocess.CalledProcessError as e:
        print(f"Error generating predictions: {e}")
        sys.exit(2)
        
    print("\n")

def run_fairness_gate():
    print("--- [CI/CD Pipeline] Step 2: Equalyze Fairness Gate ---")
    
    api_key = os.environ.get("EQUALYZE_API_KEY", "DEV_MOCK_TOKEN")
    file_path = os.environ.get("DATASET_PATH", "predictions.csv")
    
    if not os.path.exists(file_path):
        print(f"Error: Dataset {file_path} not found.")
        sys.exit(2)

    try:
        sdk = EqualyzeClient(api_key=api_key, base_url=os.environ.get("EQUALYZE_BASE_URL", "http://localhost:8000"))
        
        print("Uploading dataset...")
        upload_resp = sdk.datasets.upload(file_path)
        dataset_id = upload_resp.dataset_id
        
        # Wait for the backend to process the file schema
        time.sleep(3)
        
        print("\nInitiating Fairness Audit (Timeout: 120s)...")
        # The threshold is 0.85 (Disparate Impact Ratio < 80% is legally risky)
        result = sdk.audits.run(
            dataset_id=dataset_id, 
            protected_attributes=["gender", "region"], 
            outcome="loan_approved",
            threshold=0.85,
            timeout_sec=120
        )
        
        if result.overall_score < 0.85 or result.overall_severity in ["AMBER", "RED"]:
            sys.exit(1)
            
        sys.exit(0)
        
    except SystemExit as e:
        # We capture the exit code to print standard exit messages
        exit_code = e.code
        print("\n--- CI/CD STATUS REPORT ---")
        if exit_code == 0:
            print("Status: [PASSED] Exit Code 0")
            print("Details: Disparate Impact Ratio and fairness metrics are within acceptable thresholds (≥ 0.80).")
        elif exit_code == 1:
            print("Status: [BLOCKED] Exit Code 1")
            print("Details: Disparate Impact Ratio or other critical fairness metrics fell below the 0.80 threshold. Pipeline halted to prevent deployment of discriminatory model.")
        elif exit_code == 2:
            print("Status: [ERROR] Exit Code 2")
            print("Details: API timeout, authentication failure, or malformed data.")
        else:
            print(f"Status: [UNKNOWN] Exit Code {exit_code}")
            
        sys.exit(exit_code)
    except EqualyzeTimeoutError as e:
        print("\n--- CI/CD STATUS REPORT ---")
        print("Status: [ERROR] Exit Code 2")
        print(f"Details: {e}")
        sys.exit(2)
    except EqualyzeAPIError as e:
        print("\n--- CI/CD STATUS REPORT ---")
        print("Status: [ERROR] Exit Code 2")
        print(f"Details: API or Authentication Error: {e}")
        sys.exit(2)
    except Exception as ex:
        print(f"\n--- CI/CD STATUS REPORT ---")
        print("Status: [ERROR] Exit Code 2")
        print(f"Details: Unexpected error occurred: {ex}")
        sys.exit(2)

if __name__ == "__main__":
    # Simulate the pipeline
    generate_predictions()
    run_fairness_gate()
