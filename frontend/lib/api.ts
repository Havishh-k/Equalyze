/**
 * Equalyze — API Client (Enterprise Edition)
 * Typed fetch wrapper with retry, timeout, request tracing, and structured errors.
 */

import { auth } from "./firebase";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

// ── Structured API Error ────────────────────

export class ApiError extends Error {
  status: number;
  errorCode: string;
  requestId: string;
  detail: string;

  constructor(status: number, detail: string, errorCode: string = "", requestId: string = "") {
    super(detail);
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
    this.errorCode = errorCode;
    this.requestId = requestId;
  }
}

// ── Request ID Generator ────────────────────

function generateRequestId(): string {
  return crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// ── Retry with Exponential Backoff ──────────

async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries: number = 3,
  timeoutMs: number = 30000,
): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      // Only retry on 5xx server errors
      if (res.status >= 500 && attempt < retries) {
        const backoffMs = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
        await new Promise((r) => setTimeout(r, backoffMs));
        continue;
      }

      return res;
    } catch (err: any) {
      clearTimeout(timeoutId);
      lastError = err;

      if (err.name === "AbortError") {
        throw new ApiError(408, `Request timed out after ${timeoutMs}ms`, "TIMEOUT");
      }

      // Network error — retry
      if (attempt < retries) {
        const backoffMs = Math.pow(2, attempt) * 1000;
        await new Promise((r) => setTimeout(r, backoffMs));
        continue;
      }
    }
  }

  throw lastError || new ApiError(0, "Network error after all retries", "NETWORK_ERROR");
}

// ── Core Fetch Wrapper ──────────────────────

async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {},
  config: { timeoutMs?: number; retries?: number } = {},
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const requestId = generateRequestId();

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
    "X-Request-ID": requestId,
  };

  if (auth?.currentUser) {
    try {
      const token = await auth.currentUser.getIdToken();
      headers["Authorization"] = `Bearer ${token}`;
    } catch {}
  } else if (process.env.NEXT_PUBLIC_DEV_MOCK_TOKEN) {
    headers["Authorization"] = `Bearer ${process.env.NEXT_PUBLIC_DEV_MOCK_TOKEN}`;
  }

  const res = await fetchWithRetry(
    url,
    { ...options, headers },
    config.retries ?? 2,
    config.timeoutMs ?? 30000,
  );

  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: res.statusText }));
    const detail = typeof body.detail === "string" ? body.detail : JSON.stringify(body.detail);
    const serverRequestId = res.headers.get("X-Request-ID") || requestId;

    throw new ApiError(
      res.status,
      detail,
      body.error || `HTTP_${res.status}`,
      serverRequestId,
    );
  }

  return res.json();
}

// ── Dataset APIs ──────────────────────────

export async function uploadDataset(file: File, domain: string = "other") {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("domain", domain);

  return fetchAPI<{
    status: string;
    job_id: string;
    dataset_id: string;
    filename: string;
    row_count?: number;
    column_names?: string[];
  }>("/datasets/upload", {
    method: "POST",
    body: formData,
  });
}

export async function getDatasetStatus(datasetId: string) {
  return fetchAPI<{
    status: string;
    dataset_id: string;
    filename: string;
    row_count?: number;
    column_count?: number;
    column_names?: string[];
    sample_data?: Record<string, unknown>[];
    error?: string;
  }>(`/datasets/${datasetId}/status`);
}

export async function getSchemaSuggestions(datasetId: string) {
  return fetchAPI<{
    dataset_id: string;
    schema_map: SchemaMap;
    column_stats: Record<string, unknown>;
  }>(`/datasets/${datasetId}/schema-suggestions`);
}

// ── Audit APIs ────────────────────────────

export async function createAudit(params: {
  dataset_id: string;
  schema_map: SchemaMap;
  model_metadata: ModelMetadata;
}) {
  return fetchAPI<{
    audit_id: string;
    status: string;
    estimated_minutes: number;
    data_health?: any;
  }>("/audits", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
}

export async function getAudit(auditId: string) {
  return fetchAPI<AuditFull>(`/audits/${auditId}`);
}

export async function getAuditStatus(auditId: string) {
  return fetchAPI<{
    audit_id: string;
    status: string;
    progress_percent: number;
    current_step: string;
    step_index: number;
    total_steps: number;
    agents: Record<string, AgentState>;
    overall_severity: string | null;
    overall_score: number | null;
  }>(`/audits/${auditId}/status`);
}

export async function verifyAuditIntegrity(auditId: string) {
  return fetchAPI<{
    verified: boolean;
    current_hash: string;
    message: string;
  }>(`/audits/${auditId}/verify-integrity`);
}

export async function getAuditFindings(auditId: string) {
  return fetchAPI<{
    audit_id: string;
    status: string;
    overall_severity: string;
    overall_score: number;
    findings: Finding[];
  }>(`/audits/${auditId}/findings`);
}

export async function listAudits() {
  return fetchAPI<{
    audits: AuditSummary[];
  }>("/audits");
}

export async function resolveAudit(auditId: string, params: {
  action: "approve" | "escalate" | "halt";
  comments: string;
  reviewer_2_uid?: string;
  reviewer_role?: string;
  reviewer_email?: string;
  hitl_acknowledged_at?: string;
}) {
  // Map frontend fields to the API's ResolutionRequest schema
  const payload = {
    action_taken: params.action === "approve" ? "Approved" : params.action === "escalate" ? "Escalated" : "Halted",
    reviewer_2_uid: params.reviewer_2_uid || "self-review",
    comments: params.comments,
    reviewer_role: params.reviewer_role || "",
    reviewer_email: params.reviewer_email || "",
    hitl_acknowledged_at: params.hitl_acknowledged_at || null,
  };
  return fetchAPI<{
    message: string;
    approval_status: string;
    approval_token: string;
    approved_by: string;
    approved_by_email: string;
    approved_at: string;
    event: Record<string, unknown>;
  }>(`/audits/${auditId}/resolve`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

// ── Types ─────────────────────────────────

export interface SchemaMap {
  protected_attributes: string[];
  valid_factors: string[];
  outcome: string;
  identifier?: string;
  proxy_warnings: ProxyWarning[];
  column_tags?: ColumnTag[];
}

export interface ColumnTag {
  column_name: string;
  tag: string;
  confidence: number;
  rationale: string;
  proxy_warning: boolean;
}

export interface ProxyWarning {
  column: string;
  correlated_with: string;
  correlation_coefficient: number;
  severity: string;
}

export interface ModelMetadata {
  organization_name: string;
  model_name: string;
  domain: string;
  model_type: string;
  jurisdiction: string[];
}

export interface AgentState {
  status: string;
  started_at: string | null;
  completed_at: string | null;
  error: string | null;
}

export interface BiasMetric {
  metric_name: string;
  value: number;
  severity: string;
  threshold: number;
  interpretation: string;
  legal_flag: boolean;
  minority_group?: string;
  majority_group?: string;
}

export interface CounterfactualTwin {
  id: string;
  original_profile: Record<string, unknown>;
  original_narrative: string;
  original_outcome: string;
  twin_profile: Record<string, unknown>;
  twin_narrative: string;
  twin_outcome: string;
  changed_attributes: string[];
  preserved_attributes: string[];
  twin_quality_score: number;
  discrimination_statement: string;
}

export interface LegalViolation {
  regulation_name: string;
  jurisdiction: string;
  article: string;
  risk_level: string;
  plain_english: string;
  remediation_required: string;
}

export interface RemediationStrategy {
  rank: number;
  name: string;
  level: string;
  description: string;
  implementation_steps: string[];
  code_reference: string;
  estimated_effort: string;
  estimated_bias_reduction: string;
  risks: string;
}

export interface GenealogyNode {
  level: number;
  level_name: string;
  bias_contribution: number;
  root_cause: string;
  fix_suggestion: string;
}

export interface Finding {
  id: string;
  protected_attribute: string;
  finding_type: string;
  severity: string;
  severity_score: number;
  metrics: BiasMetric[];
  legal_violations: LegalViolation[];
  counterfactual_twins: CounterfactualTwin[];
  genealogy_tree: GenealogyNode[];
  remediation_strategies: RemediationStrategy[];
}

export interface AuditFull {
  id: string;
  status: string;
  created_at: string;
  completed_at: string | null;
  dataset: {
    id: string;
    filename: string;
    row_count: number;
    column_count: number;
    file_hash?: string;
  };
  model_metadata: ModelMetadata;
  schema_map: SchemaMap;
  findings: Finding[];
  overall_severity: string;
  overall_score: number;
  deployment_decision?: string;
  report_hash: string | null;
  agents: Record<string, AgentState>;
  audit_log: { event: string; details: string; timestamp: string }[];
  resolution_status?: string;
  resolution_comments?: string;
  resolution_events?: any[];
  approval_status?: string;
  approved_by?: string;
  approved_by_email?: string;
  approved_by_role?: string;
  approved_at?: string;
  approval_token?: string;
  approval_comments?: string;
}

export interface AuditSummary {
  id: string;
  status: string;
  model_name: string;
  domain: string;
  overall_severity: string;
  created_at: string;
  dataset_filename: string;
  findings_count: number;
}

// ── LLM Prompt Audit APIs ────────────────────

export async function runLLMPromptAudit(params: {
  system_prompt: string;
  demographic_axes?: string[];
  organization_name?: string;
  model_name?: string;
}) {
  return fetchAPI<{
    audit_type: string;
    organization_name: string;
    model_name: string;
    timestamp: string;
    system_prompt: string;
    axes_tested: string[];
    analyses: any[];
    overall_severity: string;
    overall_score: number;
    total_axes_tested: number;
    biased_axes_count: number;
  }>("/llm-audits", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
}
