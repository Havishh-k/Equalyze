import os
import requests
from typing import Any, Dict
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type

from .exceptions import EqualyzeAPIError, EqualyzeAuthenticationError, EqualyzeRateLimitError
from .resources.datasets import DatasetsResource
from .resources.audits import AuditsResource

class EqualyzeClient:
    """
    The main client for the Equalyze API.
    Provides access to resources like `client.datasets` and `client.audits`.
    """
    def __init__(self, api_key: str = None, base_url: str = None):
        self.api_key = api_key or os.environ.get("EQUALYZE_API_KEY")
        if not self.api_key:
            raise ValueError(
                "API Key is required. Pass it to the client directly or set EQUALYZE_API_KEY in your environment."
            )
            
        self.base_url = (base_url or os.environ.get("EQUALYZE_BASE_URL") or "http://localhost:8000").rstrip("/")
        
        self.session = requests.Session()
        self.session.headers.update({
            "Authorization": f"Bearer {self.api_key}",
            "User-Agent": "equalyze-python-sdk/0.1.0"
        })

        # Mount resources
        self.datasets = DatasetsResource(self)
        self.audits = AuditsResource(self)

    @retry(
        retry=retry_if_exception_type(EqualyzeRateLimitError),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        stop=stop_after_attempt(3),
        reraise=True
    )
    def _request(self, method: str, path: str, **kwargs) -> Dict[str, Any]:
        """Internal method to execute HTTP requests with robust error handling and retries."""
        url = f"{self.base_url}{path}"
        
        try:
            response = self.session.request(method, url, **kwargs)
        except requests.RequestException as e:
            raise EqualyzeAPIError(f"Network error: {str(e)}")
            
        if response.status_code == 401 or response.status_code == 403:
            raise EqualyzeAuthenticationError(
                "Invalid or expired API Key. Please verify your EQUALYZE_API_KEY.", 
                status_code=response.status_code,
                response_data=self._parse_json(response)
            )
            
        if response.status_code == 429:
            raise EqualyzeRateLimitError(
                "Rate limit exceeded. Waiting before retrying...",
                status_code=429
            )
            
        if not response.ok:
            raise EqualyzeAPIError(
                f"API Error ({response.status_code}): {response.text}",
                status_code=response.status_code,
                response_data=self._parse_json(response)
            )
            
        return self._parse_json(response)

    def _parse_json(self, response: requests.Response) -> Dict[str, Any]:
        try:
            return response.json()
        except ValueError:
            return {}
