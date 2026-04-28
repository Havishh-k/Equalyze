"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  Sparkles,
  Download,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Database,
  BarChart3,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { SeverityBadge } from "@/components/SeverityBadge";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

interface AuditData {
  id: string;
  status: string;
  overall_score: number;
  overall_severity: string;
  findings: any[];
  dataset: { filename: string };
  schema_map?: any;
  type?: string;
}

export default function RemediationPage() {
  const { audit_id } = useParams();
  const { token } = useAuth();
  const [audit, setAudit] = useState<AuditData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [stats, setStats] = useState<{ 
    original_rows: number; 
    synthetic_rows: number; 
    new_total: number;
    before_dir?: number;
    after_dir?: number;
    improvement_percent?: number;
    validation_passed?: boolean;
    dp_epsilon?: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAudit = async () => {
      try {
        const res = await fetch(`${API_BASE}/audits/${audit_id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = await res.json();
        setAudit(data);
      } catch {
        // handle error
      } finally {
        setLoading(false);
      }
    };
    if (audit_id) fetchAudit();
  }, [audit_id, token]);

  const handleGenerate = async () => {
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/audits/${audit_id}/remediate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ num_rows: 50 }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Failed to generate remediation dataset");
      }
      const data = await res.json();
      if (data.message === "Cannot identify target column" || data.message === "No bias findings to remediate") {
        throw new Error(data.message);
      }
      setGenerated(true);
      setDownloadUrl(data.download_url || null);
      setStats(data.stats || null);
    } catch (e: any) {
      setError(e.message || "An unexpected error occurred.");
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--brand-500)" }} />
      </div>
    );
  }

  if (!audit) {
    return (
      <div className="text-center py-20 text-label">
        <p>Audit not found.</p>
      </div>
    );
  }

  if ((audit_id as string).startsWith("sch-") || audit.type === "scheduled") {
    return (
      <div className="text-center py-20 space-y-4">
        <AlertTriangle className="w-10 h-10 mx-auto" style={{ color: "var(--severity-amber-text)" }} />
        <p className="text-lg font-medium" style={{ color: "var(--text-primary)" }}>Scheduled Monitor Alerts Cannot Be Remediated Directly</p>
        <p className="max-w-md mx-auto text-sm" style={{ color: "var(--text-secondary)" }}>
          This is a lightweight monitor alert designed to detect model drift. To generate a synthetic remediation dataset, please run a full manual audit against this dataset.
        </p>
        <Link
          href={`/dashboard/audits/${audit_id}`}
          className="inline-flex items-center gap-2 mt-4 text-sm font-medium hover:underline"
          style={{ color: "var(--text-link)" }}
        >
          <ArrowLeft className="w-4 h-4" /> Go Back to Audit
        </Link>
      </div>
    );
  }

  const biasedFindings = audit.findings?.filter((f: any) =>
    ["AMBER", "RED"].includes(f.severity?.toUpperCase())
  ) || [];

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      {/* Back link */}
      <Link
        href={`/dashboard/audits/${audit_id}`}
        className="inline-flex items-center gap-2 text-sm font-medium transition-all hover:underline"
        style={{ color: "var(--text-link)" }}
      >
        <ArrowLeft className="w-4 h-4" /> Back to Audit Results
      </Link>

      {/* Hero card */}
      <div className="card p-8">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-3 font-display" style={{ color: "var(--text-primary)" }}>
              <Sparkles className="w-7 h-7" style={{ color: "var(--brand-500)" }} />
              Synthetic Data Remediation
            </h2>
            <p className="text-sm mt-2" style={{ color: "var(--text-secondary)" }}>
              Generate AI-crafted synthetic data to balance underrepresented groups and reduce bias in your dataset.
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="text-label">Overall Risk</span>
            <div className="flex items-center gap-3">
               <span className="text-lg font-bold font-mono" style={{ color: "var(--text-primary)" }}>
                 {audit.overall_score?.toFixed(1)}
               </span>
               <SeverityBadge severity={audit.overall_severity} size="lg" />
            </div>
          </div>
        </div>

        {/* Findings summary */}
        {biasedFindings.length > 0 && (
          <div className="mt-8 space-y-3">
            <h4 className="text-label mb-2">Bias Findings to Remediate</h4>
            {biasedFindings.slice(0, 5).map((f: any, i: number) => (
              <div
                key={i}
                className="flex items-center gap-3 px-4 py-3 rounded-lg"
                style={{ background: "var(--surface-sunken)", border: "1px solid var(--border-default)" }}
              >
                <AlertTriangle className="w-4 h-4 flex-shrink-0" style={{ color: `var(--severity-${f.severity?.toLowerCase() || 'red'}-text)` }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
                    {f.protected_attribute || "Unknown attribute"} — {f.finding_type || "Bias detected"}
                  </p>
                  <p className="text-xs truncate" style={{ color: "var(--text-secondary)" }}>
                    {f.description || "Statistical disparity detected between groups"}
                  </p>
                </div>
                <SeverityBadge severity={f.severity} size="sm" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Generate action */}
      {!generated ? (
        <div className="card p-8 text-center">
          <Database className="w-16 h-16 mx-auto mb-4 opacity-50" style={{ color: "var(--brand-400)" }} />
          <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--text-primary)" }}>Ready to Generate</h3>
          <p className="text-sm mb-6 max-w-md mx-auto" style={{ color: "var(--text-secondary)" }}>
            Gemini will analyze the statistical distributions of your dataset and generate synthetic rows
            for underrepresented groups to balance the dataset.
          </p>
          
          {error && (
            <div className="mb-6 p-4 rounded-lg" style={{ background: "var(--severity-red-bg)", border: "1px solid var(--severity-red-border)" }}>
              <p className="text-sm font-semibold flex items-center justify-center gap-2" style={{ color: "var(--severity-red-text)" }}>
                <AlertTriangle className="w-4 h-4" />
                {error}
              </p>
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={generating}
            className="btn btn-primary px-8 py-3 text-sm"
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating with Gemini...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate Synthetic Dataset
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="card p-8">
          <div className="flex items-center gap-3 mb-6">
            <CheckCircle2 className="w-6 h-6" style={{ color: "var(--severity-green-dot)" }} />
            <h3 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>Remediated Dataset Generated</h3>
          </div>

          {stats && (
            <>
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="p-4 rounded-lg text-center" style={{ background: "var(--surface-sunken)", border: "1px solid var(--border-default)" }}>
                  <p className="text-label-sm mb-1">Original Rows</p>
                  <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{stats.original_rows}</p>
                </div>
                <div className="p-4 rounded-lg text-center" style={{ background: "var(--surface-sunken)", border: "1px solid var(--border-default)" }}>
                  <p className="text-label-sm mb-1">Synthetic Rows Added</p>
                  <p className="text-2xl font-bold" style={{ color: "var(--severity-green-text)" }}>+{stats.synthetic_rows}</p>
                </div>
                <div className="p-4 rounded-lg text-center" style={{ background: "var(--surface-sunken)", border: "1px solid var(--border-default)" }}>
                  <p className="text-label-sm mb-1">New Total</p>
                  <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>{stats.new_total}</p>
                </div>
              </div>

              {stats.before_dir !== undefined && (
                <div className="mb-8">
                  <h4 className="text-sm font-semibold mb-4 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                    <BarChart3 className="w-4 h-4" style={{ color: "var(--brand-500)" }} />
                    Fairness Validation (Disparate Impact Ratio)
                  </h4>
                  
                  {stats.validation_passed ? (
                    <div className="mb-4 p-4 rounded-lg" style={{ background: "var(--severity-green-bg)", border: "1px solid var(--severity-green-border)" }}>
                      <p className="text-sm font-semibold flex items-center gap-2" style={{ color: "var(--severity-green-text)" }}>
                        <CheckCircle2 className="w-4 h-4" />
                        Remediation Successful: Disparate Impact Ratio {'>'} 0.80
                      </p>
                    </div>
                  ) : (
                    <div className="mb-4 p-4 rounded-lg" style={{ background: "var(--severity-amber-bg)", border: "1px solid var(--severity-amber-border)" }}>
                      <p className="text-sm font-semibold flex items-center gap-2" style={{ color: "var(--severity-amber-text)" }}>
                        <AlertTriangle className="w-4 h-4" />
                        Remediation Insufficient: Model still exhibits bias.
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 rounded-lg" style={{ background: "var(--surface-sunken)", border: "1px solid var(--border-default)" }}>
                      <p className="text-label-sm mb-1">Before Remediation</p>
                      <p className="text-xl font-bold" style={{ color: "var(--severity-red-text)" }}>{stats.before_dir?.toFixed(3)}</p>
                    </div>
                    <div className="p-4 rounded-lg" style={{ background: "var(--surface-sunken)", border: "1px solid var(--border-default)" }}>
                      <p className="text-label-sm mb-1">After Remediation</p>
                      <p className="text-xl font-bold flex items-center gap-2" style={{ color: stats.validation_passed ? "var(--severity-green-text)" : "var(--severity-amber-text)" }}>
                        {stats.after_dir?.toFixed(3)}
                        <span className="text-xs font-normal" style={{ color: "var(--severity-green-text)" }}>
                          (↑ {stats.improvement_percent}%)
                        </span>
                      </p>
                    </div>
                    <div className="p-4 rounded-lg relative group" style={{ background: "var(--surface-sunken)", border: "1px solid var(--border-default)" }}>
                      <p className="text-label-sm mb-1 flex items-center gap-1 cursor-help">
                        Differential Privacy (ε)
                        <span className="opacity-60 text-[10px]">ⓘ</span>
                      </p>
                      <div className="absolute inset-x-0 bottom-full mb-2 hidden group-hover:block z-10 w-64 p-3 rounded-lg text-xs" style={{ background: "var(--surface-overlay)", border: "1px solid var(--border-default)", color: "var(--text-primary)", boxShadow: "var(--shadow-md)" }}>
                        Mathematical guarantee of zero PII leakage. A lower epsilon (ε) score indicates higher privacy protection for the synthetic data.
                      </div>
                      <p className="text-xl font-bold" style={{ color: "var(--brand-600)" }}>
                        {stats.dp_epsilon !== undefined ? stats.dp_epsilon.toFixed(2) : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {downloadUrl ? (
            <a
              href={downloadUrl}
              className="btn btn-primary"
            >
              <Download className="w-4 h-4" />
              Download Remediated CSV
            </a>
          ) : (
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Dataset generated in memory. Re-run audit to verify improvement.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
