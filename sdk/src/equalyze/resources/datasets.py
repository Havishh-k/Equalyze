import os
import tempfile
import pandas as pd
from typing import TYPE_CHECKING
from ..models import UploadResponse

if TYPE_CHECKING:
    from ..client import EqualyzeClient

class DatasetsResource:
    def __init__(self, client: "EqualyzeClient"):
        self._client = client

    def upload(self, file_path: str, domain: str = "other") -> UploadResponse:
        """Upload a CSV dataset from a file path."""
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"Dataset file not found: {file_path}")
            
        with open(file_path, "rb") as f:
            files = {"file": f}
            data = {"domain": domain}
            # We use the client's internal request wrapper which handles tenacity retries and errors
            response_data = self._client._request("POST", "/api/v1/datasets/upload", files=files, data=data)
            
        return UploadResponse(**response_data)

    def upload_dataframe(self, df: pd.DataFrame, domain: str = "other") -> UploadResponse:
        """Upload a pandas DataFrame directly without saving it manually."""
        with tempfile.NamedTemporaryFile(suffix=".csv", delete=False) as tmp:
            tmp_path = tmp.name
        
        try:
            df.to_csv(tmp_path, index=False)
            return self.upload(tmp_path, domain)
        finally:
            if os.path.exists(tmp_path):
                os.remove(tmp_path)
