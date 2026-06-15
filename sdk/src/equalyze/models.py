from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class UploadResponse(BaseModel):
    dataset_id: str
    filename: str
    status: str
    row_count: Optional[int] = None
    column_count: Optional[int] = None

class SchemaMap(BaseModel):
    protected_attributes: List[str] = Field(default_factory=list)
    valid_factors: List[str] = Field(default_factory=list)
    outcome: str = ""
    identifier: Optional[str] = None
    proxy_warnings: List[Any] = Field(default_factory=list)
    column_tags: List[Any] = Field(default_factory=list)

class ModelMetadata(BaseModel):
    organization_name: str = "Demo Organization"
    model_name: str = ""
    domain: str = "other"
    model_type: str = "classification"
    jurisdiction: List[str] = Field(default_factory=lambda: ["usa"])

class AuditRequest(BaseModel):
    dataset_id: str
    schema_map: SchemaMap
    model_metadata: ModelMetadata

class AuditCreateResponse(BaseModel):
    audit_id: str
    status: str
    estimated_minutes: int
    data_health: Optional[Dict[str, Any]] = None

class Metric(BaseModel):
    metric_name: str
    value: float
    severity: str

class Finding(BaseModel):
    protected_attribute: str
    finding_type: str
    severity: str
    metrics: List[Metric] = Field(default_factory=list)

class AuditResult(BaseModel):
    id: str
    status: str
    overall_score: float = 0.0
    overall_severity: str = "GREEN"
    findings: List[Finding] = Field(default_factory=list)
