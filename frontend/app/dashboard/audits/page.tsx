"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  FileSearch,
  ArrowRight,
  Plus,
} from "lucide-react";
import { listAudits, type AuditSummary } from "@/lib/api";

function SeverityBadge({ severity }: { severity: string }) {
  const config: Record<string, { label: string; variant: string }> = {
    GREEN: { label: "Compliant", variant: "green" },
    AMBER: { label: "Monitor", variant: "amber" },
    RED: { label: "Action Required", variant: "red" },
  };
  const c = config[severity] || config.GREEN;
  return (
    <span className={`severity-badge severity-badge--${c.variant}`} role="status">
      <span className="severity-dot" />
      {c.label}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, { bg: string; color: string }> = {
    complete: { bg: "var(--severity-green-bg)", color: "var(--severity-green-text)" },
    running: { bg: "var(--brand-50)", color: "var(--brand-600)" },
    failed: { bg: "var(--severity-red-bg)", color: "var(--severity-red-text)" },
  };
  const s = styles[status] || styles.complete;
  return (
    <span
      style={{
        fontSize: 12,
        fontWeight: 500,
        padding: "2px 8px",
        borderRadius: "var(--radius-full)",
        background: s.bg,
        color: s.color,
        textTransform: "capitalize",
      }}
    >
      {status}
    </span>
  );
}

export default function AuditsListPage() {
  const [audits, setAudits] = useState<AuditSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listAudits()
      .then((data) => setAudits(data.audits))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto" }}>
      {/* Header */}
      <div
        className="flex items-center justify-between"
        style={{ marginBottom: "var(--space-6)" }}
      >
        <div>
          <h1
            style={{
              fontWeight: 700,
              fontSize: 30,
              color: "var(--text-primary)",
              letterSpacing: "-0.02em",
              marginBottom: 4,
            }}
          >
            All Audits
          </h1>
          <p style={{ fontSize: 15, color: "var(--text-secondary)" }}>
            {audits.length} audit{audits.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <Link href="/dashboard/audits/new" className="btn btn-primary">
          <Plus style={{ width: 16, height: 16 }} />
          New Audit
        </Link>
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center" style={{ padding: "var(--space-20) 0" }}>
          <div
            className="animate-spinner mx-auto"
            style={{
              width: 24,
              height: 24,
              border: "2px solid var(--neutral-200)",
              borderTopColor: "var(--brand-500)",
              borderRadius: "50%",
              marginBottom: "var(--space-3)",
            }}
          />
        </div>
      ) : audits.length === 0 ? (
        <div className="card text-center" style={{ padding: "var(--space-16) var(--space-8)" }}>
          <FileSearch
            style={{
              width: 40,
              height: 40,
              color: "var(--neutral-300)",
              margin: "0 auto var(--space-4)",
            }}
          />
          <p
            style={{
              fontWeight: 500,
              fontSize: 14,
              color: "var(--text-primary)",
              marginBottom: 4,
            }}
          >
            No audits yet
          </p>
          <p
            style={{
              fontSize: 13,
              color: "var(--text-secondary)",
              marginBottom: "var(--space-4)",
            }}
          >
            Run your first bias audit to see results here
          </p>
          <Link href="/dashboard/audits/new" className="btn btn-primary">
            <Plus style={{ width: 14, height: 14 }} />
            Start Audit
          </Link>
        </div>
      ) : (
        <div className="card" style={{ overflow: "hidden" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Dataset</th>
                <th>Domain</th>
                <th>Findings</th>
                <th>Date</th>
                <th>Status</th>
                <th>Severity</th>
                <th style={{ width: 40 }}></th>
              </tr>
            </thead>
            <tbody>
              {audits.map((audit, i) => (
                <motion.tr
                  key={audit.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="clickable"
                  onClick={() => {
                    window.location.href = `/dashboard/audits/${audit.id}`;
                  }}
                >
                  <td>
                    <span style={{ fontWeight: 500 }}>{audit.dataset_filename}</span>
                  </td>
                  <td style={{ color: "var(--text-secondary)", textTransform: "capitalize" }}>
                    {audit.domain}
                  </td>
                  <td>
                    {audit.findings_count} finding{audit.findings_count !== 1 ? "s" : ""}
                  </td>
                  <td style={{ color: "var(--text-secondary)", fontFamily: "var(--font-mono)", fontSize: 13 }}>
                    {new Date(audit.created_at).toLocaleDateString()}
                  </td>
                  <td>
                    <StatusBadge status={audit.status} />
                  </td>
                  <td>
                    <SeverityBadge severity={audit.overall_severity} />
                  </td>
                  <td>
                    <ArrowRight style={{ width: 14, height: 14, color: "var(--text-tertiary)" }} />
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
