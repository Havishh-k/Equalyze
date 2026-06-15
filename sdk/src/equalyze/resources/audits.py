import time
from typing import TYPE_CHECKING, List, Optional
from ..models import AuditRequest, SchemaMap, ModelMetadata, AuditCreateResponse, AuditResult
from ..exceptions import EqualyzeTimeoutError

if TYPE_CHECKING:
    from ..client import EqualyzeClient

class AuditsResource:
    def __init__(self, client: "EqualyzeClient"):
        self._client = client

    def run(self, 
            dataset_id: str, 
            protected_attributes: List[str], 
            outcome: str = "outcome",
            identifier: Optional[str] = None,
            model_name: str = "Model",
            domain: str = "other",
            threshold: float = 0.8,
            wait: bool = True,
            timeout_sec: int = 300,
            poll_interval: int = 5) -> AuditResult:
        """
        Triggers a new fairness audit.
        
        Args:
            dataset_id: The ID returned from client.datasets.upload()
            protected_attributes: List of columns to check for bias (e.g. ['gender', 'race'])
            outcome: The target column of the model.
            identifier: Unique ID column, if any.
            model_name: Name of the model being evaluated.
            domain: The industry domain (e.g. 'lending', 'hiring').
            threshold: Minimum acceptable fairness score (0.0 to 1.0).
            wait: Whether to block and wait for the audit to complete.
            timeout_sec: Maximum seconds to wait if wait=True.
            poll_interval: Seconds between status checks.
        """
        payload = AuditRequest(
            dataset_id=dataset_id,
            schema_map=SchemaMap(
                protected_attributes=protected_attributes,
                outcome=outcome,
                identifier=identifier
            ),
            model_metadata=ModelMetadata(
                model_name=model_name,
                domain=domain
            )
        )
        
        response_data = self._client._request(
            "POST", 
            "/api/v1/audits", 
            json=payload.model_dump(exclude_none=True)
        )
        
        create_resp = AuditCreateResponse(**response_data)
        audit_id = create_resp.audit_id
        
        if not wait:
            return self.get(audit_id)
            
        return self.wait_for_completion(audit_id, timeout_sec, poll_interval)

    def get(self, audit_id: str) -> AuditResult:
        """Fetch the current status and results of an audit."""
        response_data = self._client._request("GET", f"/api/v1/audits/{audit_id}")
        return AuditResult(**response_data)

    def wait_for_completion(self, audit_id: str, timeout_sec: int = 300, poll_interval: int = 5) -> AuditResult:
        """Poll the audit status until complete or failed."""
        start_time = time.time()
        
        while time.time() - start_time < timeout_sec:
            audit = self.get(audit_id)
            status = audit.status.upper()
            
            if status in ("COMPLETE", "FAILED"):
                return audit
                
            time.sleep(poll_interval)
            
        raise EqualyzeTimeoutError(f"Audit {audit_id} timed out after {timeout_sec} seconds.")
