"""
Equalyze — Pydantic Data Models
All core data structures for audits, findings, twins, and reports.
"""

from __future__ import annotations
from datetime import datetime
from enum import Enum
from typing import Any, Optional
from pydantic import BaseModel, Field
import uuid


# ── Enums ──────────────────────────────────────────

class Severity(str, Enum):
    GREEN = "GREEN"
    AMBER = "AMBER"
    RED = "RED"


class RiskLevel(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class AuditStatus(str, Enum):
    UPLOADING = "uploading"
    SCHEMA_REVIEW = "schema_review"
    RUNNING = "running"
    COMPLETE = "complete"
    FAILED = "failed"


class AgentStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETE = "complete"
    FAILED = "failed"


class ModelDomain(str, Enum):
    HEALTHCARE = "healthcare"
    LENDING = "lending"
    INSURANCE = "insurance"
    HIRING = "hiring"
    OTHER = "other"


class FindingType(str, Enum):
    DEMOGRAPHIC_PARITY = "demographic_parity"
    DISPARATE_IMPACT = "disparate_impact"
    EQUALIZED_ODDS = "equalized_odds"
    INDIVIDUAL_FAIRNESS = "individual_fairness"
    INTERSECTIONAL = "intersectional"


class RemediationLevel(str, Enum):
    DATA = "data"
    FEATURE = "feature"
    MODEL = "model"
    POST_PROCESSING = "post-processing"


# ── Schema Mapping ────────────────────────────────

class ColumnTag(BaseModel):
    column_name: str
    tag: str  # PROTECTED_ATTRIBUTE, VALID_FACTOR, OUTCOME, IDENTIFIER, METADATA
    confidence: float = 0.0
    rationale: str = ""
    proxy_warning: bool = False


class ProxyWarning(BaseModel):
    column: str
    correlated_with: str
    correlation_coefficient: float
    severity: str  # LOW, MEDIUM, HIGH


class SchemaMap(BaseModel):
    protected_attributes: list[str] = []
    valid_factors: list[str] = []
    outcome: str = ""
    identifier: Optional[str] = None
    proxy_warnings: list[ProxyWarning] = []
    column_tags: list[ColumnTag] = []


# ── Counterfactual Twins ──────────────────────────

class CounterfactualTwin(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    original_profile: dict[str, Any] = {}
    original_narrative: str = ""
    original_outcome: str = ""
    twin_profile: dict[str, Any] = {}
    twin_narrative: str = ""
    twin_outcome: str = ""
    changed_attributes: list[str] = []
    preserved_attributes: list[str] = []
    twin_quality_score: float = 0.0
    discrimination_statement: str = ""


# ── Legal / Governance ────────────────────────────

class LegalViolation(BaseModel):
    regulation_name: str = ""
    jurisdiction: str = ""
    article: str = ""
    risk_level: RiskLevel = RiskLevel.LOW
    plain_english: str = ""
    remediation_required: str = ""
    regulation_url: Optional[str] = None


# ── Remediation ───────────────────────────────────

class RemediationStrategy(BaseModel):
    rank: int = 1
    name: str = ""
    level: RemediationLevel = RemediationLevel.DATA
    description: str = ""
    implementation_steps: list[str] = []
    code_reference: str = ""
    estimated_effort: str = ""
    estimated_bias_reduction: str = ""
    risks: str = ""


# ── Bias Genealogy ────────────────────────────────

class GenealogyNode(BaseModel):
    level: int  # 1-4
    level_name: str  # "Raw Data", "Feature Engineering", etc.
    bias_contribution: float = 0.0  # 0-1
    root_cause: str = ""
    fix_suggestion: str = ""


# ── Findings ──────────────────────────────────────

class BiasMetric(BaseModel):
    metric_name: str
    value: float
    severity: Severity = Severity.GREEN
    threshold: float = 0.0
    interpretation: str = ""
    legal_flag: bool = False
    minority_group: Optional[str] = None
    majority_group: Optional[str] = None


class Finding(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    protected_attribute: str = ""
    finding_type: FindingType = FindingType.DEMOGRAPHIC_PARITY
    severity: Severity = Severity.GREEN
    severity_score: float = 0.0
    metrics: list[BiasMetric] = []
    legal_violations: list[LegalViolation] = []
    counterfactual_twins: list[CounterfactualTwin] = []
    genealogy_tree: list[GenealogyNode] = []
    remediation_strategies: list[RemediationStrategy] = []


# ── Agent State ───────────────────────────────────

class AgentState(BaseModel):
    status: AgentStatus = AgentStatus.PENDING
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    error: Optional[str] = None
    output: Optional[dict[str, Any]] = None


# ── Audit (Top-level entity) ─────────────────────

class DatasetInfo(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    filename: str = ""
    file_path: str = ""
    file_hash: str = ""
    row_count: int = 0
    column_count: int = 0
    file_size_bytes: int = 0
    column_names: list[str] = []
    column_types: dict[str, str] = {}
    sample_data: list[dict[str, Any]] = []


class ModelMetadata(BaseModel):
    organization_name: str = "Demo Organization"
    model_name: str = ""
    domain: ModelDomain = ModelDomain.OTHER
    model_type: str = "classification"
    jurisdiction: list[str] = ["india"]


class Audit(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    status: AuditStatus = AuditStatus.UPLOADING
    created_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None
    dataset: DatasetInfo = Field(default_factory=DatasetInfo)
    model_metadata: ModelMetadata = Field(default_factory=ModelMetadata)
    schema_map: Optional[SchemaMap] = None
    findings: list[Finding] = []
    overall_severity: Severity = Severity.GREEN
    overall_score: float = 0.0
    report_url: Optional[str] = None
    report_hash: Optional[str] = None
    agents: dict[str, AgentState] = Field(default_factory=lambda: {
        "ingestion": AgentState(),
        "twin_engine": AgentState(),
        "governance": AgentState(),
        "remediation": AgentState(),
        "reporting": AgentState(),
    })
    audit_log: list[dict[str, Any]] = []


# ── API Request/Response Models ────────────────────

class UploadResponse(BaseModel):
    dataset_id: str
    filename: str
    row_count: int
    column_count: int
    column_names: list[str]
    sample_data: list[dict[str, Any]]


class SchemaConfirmRequest(BaseModel):
    dataset_id: str
    schema_map: SchemaMap
    model_metadata: ModelMetadata


class AuditCreateResponse(BaseModel):
    audit_id: str
    status: AuditStatus
    estimated_minutes: int = 5


class AuditStatusResponse(BaseModel):
    audit_id: str
    status: AuditStatus
    progress_percent: int = 0
    agents: dict[str, AgentState] = {}
    overall_severity: Optional[Severity] = None
    overall_score: Optional[float] = None
