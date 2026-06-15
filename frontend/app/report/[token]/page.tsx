"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { SeverityBadge } from "@/components/SeverityBadge";
import { Spinner } from "@/components/ui/Spinner";
import { Shield, Hash, Calendar, FileText, AlertTriangle, CheckCircle } from "lucide-react";

interface PublicReport {
  audit_id: string;
  model_name: string;
  domain: string;
  organization: string;
  overall_severity: string;
  overall_score: number;
  created_at: string;
  report_hash: string;
  dataset_hash: string;
  findings_summary: {
    protected_attribute: string;
    severity: string;
    metrics_count: number;
    legal_violations_count: number;
  }[];
  integrity_verified: boolean;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export default function PublicReportPage() {
  const params = useParams();
  const token = params.token as string;
  const [report, setReport] = useState<PublicReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchReport() {
      try {
        const res = await fetch(`${API_BASE}/reports/public/${token}`);
        if (!res.ok) {
          if (res.status === 404) throw new Error("Report not found or link expired.");
          throw new Error("Failed to load report.");
        }
        const data = await res.json();
        setReport(data);
      } catch (err: any) {
        setError(err.message || "Failed to load report.");
      } finally {
        setLoading(false);
      }
    }
    if (token) fetchReport();
  }, [token]);

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--surface-base)",
        }}
      >
        <Spinner size={32} />
      </div>
    );
  }

  if (error || !report) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--surface-base)",
          flexDirection: "column",
          gap: "var(--space-4)",
        }}
      >
        <AlertTriangle style={{ width: 48, height: 48, color: "var(--severity-amber-dot)" }} />
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 28,
            color: "var(--text-primary)",
          }}
        >
          Report Unavailable
        </h1>
        <p style={{ fontSize: 15, color: "var(--text-secondary)", maxWidth: 400, textAlign: "center" }}>
          {error || "This report link may have expired or is invalid. Contact the audit owner for a new link."}
        </p>
      </div>
    );
  }

  const scoreColor =
    report.overall_score >= 0.67
      ? "var(--severity-red-dot)"
      : report.overall_score >= 0.34
        ? "var(--severity-amber-dot)"
        : "var(--severity-green-dot)";

  return (
    <div style={{ minHeight: "100vh", background: "var(--surface-base)" }}>
      {/* ── Header ──────────────────── */}
      <header
        style={{
          background: "var(--surface-card)",
          borderBottom: "1px solid var(--border-default)",
          padding: "var(--space-4) var(--space-8)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
          <span
            style={{
              fontFamily: "var(--font-body)",
              fontWeight: 700,
              fontSize: 18,
              color: "var(--text-primary)",
            }}
          >
            Equalyze
          </span>
          <span
            style={{
              fontSize: 12,
              color: "var(--text-tertiary)",
              padding: "2px 8px",
              background: "var(--neutral-100)",
              borderRadius: "var(--radius-full)",
            }}
          >
            Public Bias Receipt
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
          {report.integrity_verified ? (
            <>
              <CheckCircle style={{ width: 16, height: 16, color: "var(--severity-green-dot)" }} />
              <span style={{ fontSize: 13, color: "var(--severity-green-text)", fontWeight: 500 }}>
                Integrity Verified
              </span>
            </>
          ) : (
            <>
              <AlertTriangle style={{ width: 16, height: 16, color: "var(--severity-amber-dot)" }} />
              <span style={{ fontSize: 13, color: "var(--severity-amber-text)", fontWeight: 500 }}>
                Unverified
              </span>
            </>
          )}
        </div>
      </header>

      {/* ── Content ─────────────────── */}
      <main style={{ maxWidth: 800, margin: "0 auto", padding: "var(--space-10) var(--space-6)" }}>
        {/* Title */}
        <div className="animate-slide-up" style={{ marginBottom: "var(--space-8)" }}>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontStyle: "italic",
              fontSize: 32,
              fontWeight: 400,
              color: "var(--text-primary)",
              marginBottom: "var(--space-2)",
            }}
          >
            AI Bias Audit — Bias Receipt
          </h1>
          <p style={{ fontSize: 15, color: "var(--text-secondary)" }}>
            Immutable audit record for <strong>{report.model_name}</strong> in the{" "}
            <strong>{report.domain}</strong> domain
          </p>
        </div>

        {/* Score + Severity Card */}
        <div
          className="card animate-slide-up"
          style={{ marginBottom: "var(--space-6)", animationDelay: "80ms" }}
        >
          <div className="card-body" style={{ display: "flex", alignItems: "center", gap: "var(--space-8)" }}>
            <div style={{ textAlign: "center", minWidth: 100 }}>
              <div
                style={{
                  fontSize: 48,
                  fontWeight: 700,
                  fontFamily: "var(--font-mono)",
                  color: scoreColor,
                  lineHeight: 1,
                }}
              >
                {Math.round(report.overall_score * 100)}
              </div>
              <div style={{ fontSize: 12, color: "var(--text-tertiary)", marginTop: 4 }}>
                Risk Score
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ marginBottom: "var(--space-3)" }}>
                <SeverityBadge severity={report.overall_severity} size="lg" />
              </div>
              <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6 }}>
                This audit found <strong>{report.findings_summary.length}</strong> findings across
                protected attributes. The overall risk assessment is{" "}
                <strong>{report.overall_severity}</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* Metadata */}
        <div
          className="card animate-slide-up"
          style={{ marginBottom: "var(--space-6)", animationDelay: "160ms" }}
        >
          <div className="card-header" style={{ padding: "var(--space-4) var(--space-6)" }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>
              Audit Metadata
            </span>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {[
              { icon: <FileText style={{ width: 16, height: 16 }} />, label: "Model", value: report.model_name },
              { icon: <Shield style={{ width: 16, height: 16 }} />, label: "Domain", value: report.domain },
              { icon: <Calendar style={{ width: 16, height: 16 }} />, label: "Audit Date", value: new Date(report.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) },
              { icon: <Hash style={{ width: 16, height: 16 }} />, label: "Report Hash", value: report.report_hash },
              { icon: <Hash style={{ width: 16, height: 16 }} />, label: "Dataset Hash", value: report.dataset_hash },
            ].map((row, i, arr) => (
              <div
                key={row.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-3)",
                  padding: "var(--space-4) var(--space-6)",
                  borderBottom: i < arr.length - 1 ? "1px solid var(--border-default)" : "none",
                }}
              >
                <span style={{ color: "var(--text-tertiary)" }}>{row.icon}</span>
                <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-secondary)", minWidth: 100 }}>
                  {row.label}
                </span>
                <span
                  style={{
                    fontSize: 13,
                    color: "var(--text-primary)",
                    fontFamily: row.label.includes("Hash") ? "var(--font-mono)" : "var(--font-body)",
                    wordBreak: "break-all",
                  }}
                >
                  {row.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Findings Summary */}
        <div
          className="card animate-slide-up"
          style={{ marginBottom: "var(--space-6)", animationDelay: "240ms" }}
        >
          <div className="card-header" style={{ padding: "var(--space-4) var(--space-6)" }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>
              Findings Summary
            </span>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            <table className="data-table" style={{ border: "none", boxShadow: "none" }}>
              <thead>
                <tr>
                  <th>Protected Attribute</th>
                  <th>Severity</th>
                  <th>Metrics</th>
                  <th>Legal Flags</th>
                </tr>
              </thead>
              <tbody>
                {report.findings_summary.map((f, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 500 }}>{f.protected_attribute}</td>
                    <td>
                      <SeverityBadge severity={f.severity} size="sm" />
                    </td>
                    <td>{f.metrics_count} metrics analyzed</td>
                    <td>
                      {f.legal_violations_count > 0 ? (
                        <span style={{ color: "var(--severity-red-text)", fontWeight: 500 }}>
                          {f.legal_violations_count} violation{f.legal_violations_count > 1 ? "s" : ""}
                        </span>
                      ) : (
                        <span style={{ color: "var(--severity-green-text)" }}>None</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div
          className="animate-slide-up"
          style={{
            textAlign: "center",
            padding: "var(--space-8) 0",
            color: "var(--text-tertiary)",
            fontSize: 12,
            animationDelay: "320ms",
          }}
        >
          <p>
            This Bias Receipt is an immutable audit record generated by Equalyze.
          </p>
          <p style={{ marginTop: 4 }}>
            SHA-256 Report Hash: <code style={{ fontFamily: "var(--font-mono)" }}>{report.report_hash?.slice(0, 16)}...</code>
          </p>
        </div>
      </main>
    </div>
  );
}
