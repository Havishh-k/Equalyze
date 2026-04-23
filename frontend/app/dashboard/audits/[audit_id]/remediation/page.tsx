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

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface AuditData {
  id: string;
  status: string;
  overall_score: number;
  overall_severity: string;
  findings: any[];
  dataset: { filename: string };
  schema_map?: any;
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
        const res = await fetch(`${API_BASE}/api/v1/audits/${audit_id}`, {
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
      const res = await fetch(`${API_BASE}/api/v1/audits/${audit_id}/remediate`, {
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

  const getSeverityStyle = (severity: string) => {
    const s = severity?.toUpperCase();
    if (s === "GREEN") return { color: "var(--severity-green)", bg: "rgba(34, 197, 94, 0.12)", border: "rgba(34, 197, 94, 0.25)" };
    if (s === "AMBER") return { color: "var(--severity-amber)", bg: "rgba(245, 158, 11, 0.12)", border: "rgba(245, 158, 11, 0.25)" };
    return { color: "var(--severity-red)", bg: "rgba(239, 68, 68, 0.12)", border: "rgba(239, 68, 68, 0.25)" };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--accent-blue)" }} />
      </div>
    );
  }

  if (!audit) {
    return (
      <div className="text-center py-20" style={{ color: "var(--text-muted)" }}>
        <p>Audit not found.</p>
      </div>
    );
  }

  const sevStyle = getSeverityStyle(audit.overall_severity);
  const biasedFindings = audit.findings?.filter((f: any) =>
    ["AMBER", "RED"].includes(f.severity?.toUpperCase())
  ) || [];

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      {/* Back link */}
      <Link
        href={`/dashboard/audits/${audit_id}`}
        className="inline-flex items-center gap-2 text-sm transition-all hover:opacity-80"
        style={{ color: "var(--accent-blue)" }}
      >
        <ArrowLeft className="w-4 h-4" /> Back to Audit Results
      </Link>

      {/* Hero card */}
      <div className="glass-card p-8 gradient-border">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <Sparkles className="w-7 h-7" style={{ color: "var(--accent-purple)" }} />
              Synthetic Data Remediation
            </h2>
            <p className="text-sm mt-2" style={{ color: "var(--text-secondary)" }}>
              Generate AI-crafted synthetic data to balance underrepresented groups and reduce bias in your dataset.
            </p>
          </div>
          <div
            className="px-4 py-2 rounded-xl text-sm font-semibold"
            style={{ background: sevStyle.bg, border: `1px solid ${sevStyle.border}`, color: sevStyle.color }}
          >
            Score: {audit.overall_score?.toFixed(1)}
          </div>
        </div>

        {/* Findings summary */}
        {biasedFindings.length > 0 && (
          <div className="mt-6 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
              Bias Findings to Remediate
            </h4>
            {biasedFindings.slice(0, 5).map((f: any, i: number) => (
              <div
                key={i}
                className="flex items-center gap-3 px-4 py-3 rounded-xl"
                style={{ background: "var(--bg-card)", border: "1px solid var(--border-default)" }}
              >
                <AlertTriangle className="w-4 h-4 flex-shrink-0" style={{ color: getSeverityStyle(f.severity).color }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {f.protected_attribute || "Unknown attribute"} — {f.finding_type || "Bias detected"}
                  </p>
                  <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
                    {f.description || "Statistical disparity detected between groups"}
                  </p>
                </div>
                <span
                  className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase"
                  style={{ background: getSeverityStyle(f.severity).bg, color: getSeverityStyle(f.severity).color }}
                >
                  {f.severity}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Generate action */}
      {!generated ? (
        <div className="glass-card p-8 text-center">
          <Database className="w-16 h-16 mx-auto mb-4 opacity-30" style={{ color: "var(--accent-purple)" }} />
          <h3 className="text-lg font-semibold text-white mb-2">Ready to Generate</h3>
          <p className="text-sm mb-6 max-w-md mx-auto" style={{ color: "var(--text-secondary)" }}>
            Gemini will analyze the statistical distributions of your dataset and generate synthetic rows
            for underrepresented groups to balance the dataset.
          </p>
          
          {error && (
            <div className="mb-6 p-4 rounded-xl" style={{ background: "rgba(239, 68, 68, 0.12)", border: "1px solid rgba(239, 68, 68, 0.25)" }}>
              <p className="text-sm font-semibold flex items-center justify-center gap-2" style={{ color: "var(--severity-red)" }}>
                <AlertTriangle className="w-4 h-4" />
                {error}
              </p>
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={generating}
            className="inline-flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #8B5CF6, #06B6D4)" }}
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
        <div className="glass-card p-8">
          <div className="flex items-center gap-3 mb-6">
            <CheckCircle2 className="w-6 h-6" style={{ color: "var(--severity-green)" }} />
            <h3 className="text-lg font-semibold text-white">Remediated Dataset Generated</h3>
          </div>

          {stats && (
            <>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="p-4 rounded-xl text-center" style={{ background: "var(--bg-card)", border: "1px solid var(--border-default)" }}>
                  <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>Original Rows</p>
                  <p className="text-2xl font-bold text-white">{stats.original_rows}</p>
                </div>
                <div className="p-4 rounded-xl text-center" style={{ background: "var(--bg-card)", border: "1px solid var(--border-default)" }}>
                  <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>Synthetic Rows Added</p>
                  <p className="text-2xl font-bold" style={{ color: "var(--severity-green)" }}>+{stats.synthetic_rows}</p>
                </div>
                <div className="p-4 rounded-xl text-center" style={{ background: "var(--bg-card)", border: "1px solid var(--border-default)" }}>
                  <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>New Total</p>
                  <p className="text-2xl font-bold text-white">{stats.new_total}</p>
                </div>
              </div>

              {stats.before_dir !== undefined && (
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" style={{ color: "var(--accent-blue)" }} />
                    Fairness Validation (Disparate Impact Ratio)
                  </h4>
                  
                  {stats.validation_passed ? (
                    <div className="mb-4 p-4 rounded-xl" style={{ background: "rgba(34, 197, 94, 0.12)", border: "1px solid rgba(34, 197, 94, 0.25)" }}>
                      <p className="text-sm font-semibold flex items-center gap-2" style={{ color: "var(--severity-green)" }}>
                        <CheckCircle2 className="w-4 h-4" />
                        Remediation Successful: Disparate Impact Ratio {'>'} 0.80
                      </p>
                    </div>
                  ) : (
                    <div className="mb-4 p-4 rounded-xl" style={{ background: "rgba(245, 158, 11, 0.12)", border: "1px solid rgba(245, 158, 11, 0.25)" }}>
                      <p className="text-sm font-semibold flex items-center gap-2" style={{ color: "var(--severity-amber)" }}>
                        <AlertTriangle className="w-4 h-4" />
                        Remediation Insufficient: Model still exhibits bias.
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl" style={{ background: "var(--bg-card)", border: "1px solid var(--border-default)" }}>
                      <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>Before Remediation</p>
                      <p className="text-xl font-bold" style={{ color: "var(--severity-red)" }}>{stats.before_dir?.toFixed(3)}</p>
                    </div>
                    <div className="p-4 rounded-xl" style={{ background: "var(--bg-card)", border: "1px solid var(--border-default)" }}>
                      <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>After Remediation</p>
                      <p className="text-xl font-bold flex items-center gap-2" style={{ color: stats.validation_passed ? "var(--severity-green)" : "var(--severity-amber)" }}>
                        {stats.after_dir?.toFixed(3)}
                        <span className="text-xs font-normal" style={{ color: "var(--severity-green)" }}>
                          (↑ {stats.improvement_percent}%)
                        </span>
                      </p>
                    </div>
                    <div className="p-4 rounded-xl relative group" style={{ background: "var(--bg-card)", border: "1px solid var(--border-default)" }}>
                      <p className="text-xs mb-1 flex items-center gap-1 cursor-help" style={{ color: "var(--text-muted)" }}>
                        Differential Privacy (ε)
                        <span className="opacity-60 text-[10px]">ⓘ</span>
                      </p>
                      <div className="absolute inset-x-0 bottom-full mb-2 hidden group-hover:block z-10 w-64 p-3 rounded-lg text-xs" style={{ background: "var(--bg-card-hover)", border: "1px solid var(--border-default)", color: "var(--text-secondary)" }}>
                        Mathematical guarantee of zero PII leakage. A lower epsilon (ε) score indicates higher privacy protection for the synthetic data.
                      </div>
                      <p className="text-xl font-bold" style={{ color: "var(--accent-purple)" }}>
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
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #22C55E, #06B6D4)" }}
            >
              <Download className="w-4 h-4" />
              Download Remediated CSV
            </a>
          ) : (
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Dataset generated in memory. Re-run audit to verify improvement.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
