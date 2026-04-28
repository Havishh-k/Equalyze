"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Plus,
  FileSearch,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowRight,
  Shield,
  Activity,
} from "lucide-react";
import { listAudits, type AuditSummary } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

function SeverityBadge({ severity }: { severity: string }) {
  const config: Record<string, { label: string; variant: string }> = {
    GREEN: { label: "Compliant", variant: "green" },
    AMBER: { label: "Monitor", variant: "amber" },
    RED: { label: "Action Required", variant: "red" },
  };
  const c = config[severity] || config.GREEN;
  return (
    <span
      className={`severity-badge severity-badge--${c.variant}`}
      role="status"
      aria-label={`Severity: ${c.label}`}
    >
      <span className="severity-dot" />
      {c.label}
    </span>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [audits, setAudits] = useState<AuditSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listAudits()
      .then((data) => setAudits(data.audits))
      .catch(() => setAudits([]))
      .finally(() => setLoading(false));
  }, []);

  const stats = {
    total: audits.length,
    red: audits.filter((a) => a.overall_severity === "RED").length,
    amber: audits.filter((a) => a.overall_severity === "AMBER").length,
    green: audits.filter((a) => a.overall_severity === "GREEN").length,
  };

  const statCards = [
    { label: "Total Audits", value: stats.total, icon: FileSearch, dotColor: "var(--brand-500)" },
    { label: "Action Required", value: stats.red, icon: AlertTriangle, dotColor: "var(--severity-red-dot)" },
    { label: "Needs Monitoring", value: stats.amber, icon: Clock, dotColor: "var(--severity-amber-dot)" },
    { label: "Compliant", value: stats.green, icon: CheckCircle, dotColor: "var(--severity-green-dot)" },
  ];

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto" }}>
      {/* ── Page Header ─────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
        style={{ marginBottom: "var(--space-8)" }}
      >
        <div>
          <h1
            style={{
              fontFamily: "var(--font-body)",
              fontWeight: 700,
              fontSize: 30,
              color: "var(--text-primary)",
              letterSpacing: "-0.02em",
              marginBottom: 4,
            }}
          >
            Dashboard
          </h1>
          <p style={{ fontSize: 15, color: "var(--text-secondary)" }}>
            AI fairness overview for{" "}
            {user?.displayName || user?.email?.split("@")[0] || "your organization"}.
          </p>
        </div>
        <Link href="/dashboard/audits/new" className="btn btn-primary">
          <Plus style={{ width: 16, height: 16 }} />
          New Audit
        </Link>
      </motion.div>

      {/* ── Stat Cards ──────────────────────── */}
      <div
        className="grid grid-cols-1 md:grid-cols-4"
        style={{ gap: "var(--space-4)", marginBottom: "var(--space-8)" }}
      >
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="card"
            style={{ padding: "var(--space-5)" }}
          >
            <div className="flex items-center justify-between" style={{ marginBottom: "var(--space-3)" }}>
              <stat.icon
                style={{ width: 18, height: 18, color: "var(--text-tertiary)" }}
              />
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: stat.dotColor,
                  display: "inline-block",
                }}
              />
            </div>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontWeight: 700,
                fontSize: 28,
                color: "var(--text-primary)",
                lineHeight: 1,
                marginBottom: 4,
              }}
            >
              {stat.value}
            </p>
            <p
              style={{
                fontSize: 13,
                fontWeight: 400,
                color: "var(--text-secondary)",
              }}
            >
              {stat.label}
            </p>
          </motion.div>
        ))}
      </div>

      {/* ── Quick Actions ───────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="card"
        style={{ marginBottom: "var(--space-8)" }}
      >
        <div className="card-header">
          <h3
            style={{
              fontWeight: 600,
              fontSize: 16,
              color: "var(--text-primary)",
            }}
          >
            Quick Actions
          </h3>
        </div>
        <div
          className="card-body grid grid-cols-1 md:grid-cols-2"
          style={{ gap: "var(--space-4)" }}
        >
          <Link
            href="/dashboard/audits/new"
            className="group flex items-center gap-4 p-4 transition-all"
            style={{
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--border-default)",
              background: "var(--surface-card)",
            }}
          >
            <div
              className="flex items-center justify-center"
              style={{
                width: 44,
                height: 44,
                borderRadius: "var(--radius-lg)",
                background: "var(--brand-50)",
                color: "var(--brand-500)",
                flexShrink: 0,
              }}
            >
              <Plus style={{ width: 20, height: 20 }} />
            </div>
            <div className="flex-1">
              <p
                style={{
                  fontWeight: 600,
                  fontSize: 14,
                  color: "var(--text-primary)",
                  marginBottom: 2,
                }}
              >
                Start New Audit
              </p>
              <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                Upload a dataset and run a comprehensive bias analysis
              </p>
            </div>
            <ArrowRight
              className="group-hover:translate-x-1 transition-transform"
              style={{ width: 16, height: 16, color: "var(--text-tertiary)" }}
            />
          </Link>

          <Link
            href="/dashboard/monitoring"
            className="group flex items-center gap-4 p-4 transition-all"
            style={{
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--border-default)",
              background: "var(--surface-card)",
            }}
          >
            <div
              className="flex items-center justify-center"
              style={{
                width: 44,
                height: 44,
                borderRadius: "var(--radius-lg)",
                background: "var(--brand-50)",
                color: "var(--brand-500)",
                flexShrink: 0,
              }}
            >
              <Activity style={{ width: 20, height: 20 }} />
            </div>
            <div className="flex-1">
              <p
                style={{
                  fontWeight: 600,
                  fontSize: 14,
                  color: "var(--text-primary)",
                  marginBottom: 2,
                }}
              >
                Bias Drift Monitor
              </p>
              <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                Track bias trends across all models over time
              </p>
            </div>
            <span
              style={{
                fontSize: 11,
                fontWeight: 500,
                padding: "3px 8px",
                borderRadius: "var(--radius-full)",
                background: "var(--severity-green-bg)",
                color: "var(--severity-green-text)",
                border: "1px solid var(--severity-green-border)",
              }}
            >
              Live
            </span>
            <ArrowRight
              className="group-hover:translate-x-1 transition-transform"
              style={{ width: 16, height: 16, color: "var(--text-tertiary)" }}
            />
          </Link>
        </div>
      </motion.div>

      {/* ── Recent Audits ───────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="card"
      >
        <div className="card-header flex items-center justify-between">
          <h3
            style={{
              fontWeight: 600,
              fontSize: 16,
              color: "var(--text-primary)",
            }}
          >
            Recent Audits
          </h3>
          {audits.length > 0 && (
            <Link
              href="/dashboard/audits"
              className="text-xs font-medium"
              style={{ color: "var(--text-link)" }}
            >
              View All →
            </Link>
          )}
        </div>

        <div className="card-body">
          {loading ? (
            <div className="text-center" style={{ padding: "var(--space-12) 0" }}>
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
              <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>Loading audits…</p>
            </div>
          ) : audits.length === 0 ? (
            <div className="text-center" style={{ padding: "var(--space-12) 0" }}>
              <Shield
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
                Upload a dataset to run your first bias analysis
              </p>
              <Link href="/dashboard/audits/new" className="btn btn-primary">
                <Plus style={{ width: 14, height: 14 }} />
                New Audit
              </Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
              {audits.slice(0, 5).map((audit) => (
                <Link
                  key={audit.id}
                  href={`/dashboard/audits/${audit.id}`}
                  className="flex items-center gap-4 transition-all"
                  style={{
                    padding: "var(--space-3) var(--space-4)",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid transparent",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "var(--neutral-50)";
                    e.currentTarget.style.borderColor = "var(--border-default)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.borderColor = "transparent";
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <p
                      className="truncate"
                      style={{
                        fontWeight: 500,
                        fontSize: 14,
                        color: "var(--text-primary)",
                        marginBottom: 2,
                      }}
                    >
                      {audit.dataset_filename}
                    </p>
                    <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                      {audit.domain} · {audit.findings_count} finding
                      {audit.findings_count !== 1 ? "s" : ""} ·{" "}
                      {new Date(audit.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <SeverityBadge severity={audit.overall_severity} />
                  <ArrowRight
                    style={{ width: 14, height: 14, color: "var(--text-tertiary)" }}
                  />
                </Link>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
