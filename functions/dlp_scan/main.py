import os
import io
import csv
from google.cloud import dlp_v2
from google.cloud import storage

DLP_PROJECT_ID = os.environ.get("GCP_PROJECT", "equalyze-dev")
SAFE_BUCKET_NAME = os.environ.get("SAFE_BUCKET_NAME", "equalyze-safe-processing")
SAMPLE_SIZE = 1000

dlp_client = dlp_v2.DlpServiceClient()
storage_client = storage.Client()

def analyze_and_mask_csv(event, context):
    """Triggered by a change to a Cloud Storage bucket.
    Reads a CSV, samples first 1000 rows, identifies PII columns using DLP,
    and applies a blanket mask to those columns for the whole file.
    Moves cleaned data to SAFE_BUCKET_NAME.
    """
    file_name = event['name']
    bucket_name = event['bucket']

    if not file_name.endswith('.csv'):
        print(f"Skipping non-CSV file: {file_name}")
        return

    bucket = storage_client.bucket(bucket_name)
    blob = bucket.blob(file_name)
    content = blob.download_as_text()

    # Read CSV
    lines = content.splitlines()
    if not lines:
        return
        
    reader = csv.reader(lines)
    header = next(reader)
    
    # Sample first 1000 rows
    sample_rows = [row for _, row in zip(range(SAMPLE_SIZE), reader)]
    
    # Format for DLP tabular scan
    table = dlp_v2.Table()
    table.headers = [{"name": col} for col in header]
    table.rows = [{"values": [{"string_value": val} for val in row]} for row in sample_rows]

    item = {"table": table}
    
    # Configure info types to look for
    inspect_config = {
        "info_types": [
            {"name": "PERSON_NAME"},
            {"name": "PHONE_NUMBER"},
            {"name": "EMAIL_ADDRESS"},
            {"name": "US_SOCIAL_SECURITY_NUMBER"},
            {"name": "STREET_ADDRESS"}
        ]
    }
    
    parent = f"projects/{DLP_PROJECT_ID}/locations/global"
    
    try:
        response = dlp_client.inspect_content(
            request={
                "parent": parent,
                "inspect_config": inspect_config,
                "item": item
            }
        )
    except Exception as e:
        print(f"DLP API Error: {e}")
        # In a real environment, send to DLQ
        return

    # Identify columns containing PII
    pii_columns = set()
    for finding in response.result.findings:
        pii_columns.add(finding.location.content_locations[0].record_location.field_id.name)
        
    print(f"Identified PII columns: {pii_columns}")

    # Process full file with blanket masking
    output_lines = io.StringIO()
    writer = csv.writer(output_lines)
    writer.writerow(header)
    
    pii_indices = [header.index(col) for col in pii_columns if col in header]
    
    # Reset iterator
    reader = csv.reader(lines[1:])
    for row in reader:
        masked_row = list(row)
        for idx in pii_indices:
            masked_row[idx] = "[REDACTED]"
        writer.writerow(masked_row)
        
    # Upload to safe bucket
    safe_bucket = storage_client.bucket(SAFE_BUCKET_NAME)
    safe_blob = safe_bucket.blob(f"clean_{file_name}")
    safe_blob.upload_from_string(output_lines.getvalue(), content_type="text/csv")
    
    print(f"Processed file uploaded to {SAFE_BUCKET_NAME}/clean_{file_name}")
    
    # Optional: Delete original raw file to minimize exposure window
    blob.delete()
    print(f"Deleted raw file {file_name}")
