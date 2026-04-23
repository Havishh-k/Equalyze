/**
 * Equalyze — API Client
 * Typed fetch wrapper for all backend API calls.
 */

import { auth } from "./firebase";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  
  const headers: Record<string, string> = { ...(options.headers as Record<string, string>) };

  if (auth?.currentUser) {
    try {
      const token = await auth.currentUser.getIdToken();
      headers["Authorization"] = `Bearer ${token}`;
    } catch {}
  } else if (process.env.NEXT_PUBLIC_DEV_MOCK_TOKEN) {
    headers["Authorization"] = `Bearer ${process.env.NEXT_PUBLIC_DEV_MOCK_TOKEN}`;
  }

  const res = await fetch(url, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }));
    let errorMsg = `API Error: ${res.status}`;
    if (error.detail) {
      errorMsg = typeof error.detail === 'string' ? error.detail : JSON.stringify(error.detail);
    }
    throw new Error(errorMsg);
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
  };
  model_metadata: ModelMetadata;
  schema_map: SchemaMap;
  findings: Finding[];
  overall_severity: string;
  overall_score: number;
  report_hash: string | null;
  agents: Record<string, AgentState>;
  audit_log: { event: string; details: string; timestamp: string }[];
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
