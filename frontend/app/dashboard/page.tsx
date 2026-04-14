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
  TrendingUp,
  Shield,
} from "lucide-react";
import { listAudits, type AuditSummary } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

function SeverityBadge({ severity }: { severity: string }) {
  const config: Record<string, { label: string; class: string }> = {
    GREEN: { label: "Compliant", class: "severity-green" },
    AMBER: { label: "Monitor", class: "severity-amber" },
    RED: { label: "Action Required", class: "severity-red" },
  };
  const c = config[severity] || config.GREEN;
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${c.class}`}>
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

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-2xl font-bold text-white mb-1">
          Welcome back, <span className="gradient-text">{user?.displayName || user?.email?.split('@')[0] || "User"}</span>
        </h2>
        <p style={{ color: "var(--text-secondary)" }}>
          Here&apos;s your organization&apos;s AI fairness overview.
        </p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Audits", value: stats.total, icon: FileSearch, color: "#3B82F6" },
          { label: "Critical (Red)", value: stats.red, icon: AlertTriangle, color: "#EF4444" },
          { label: "Warning (Amber)", value: stats.amber, icon: Clock, color: "#F59E0B" },
          { label: "Compliant (Green)", value: stats.green, icon: CheckCircle, color: "#22C55E" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
              <span className="text-2xl font-bold text-white">{stat.value}</span>
            </div>
            <p className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
              {stat.label}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/dashboard/audits/new"
            className="group flex items-center gap-4 p-5 rounded-xl transition-all hover:scale-[1.02]"
            style={{
              background: "rgba(59, 130, 246, 0.06)",
              border: "1px solid rgba(59, 130, 246, 0.15)",
            }}
          >
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "rgba(59, 130, 246, 0.15)" }}>
              <Plus className="w-6 h-6" style={{ color: "var(--accent-blue)" }} />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-white">Start New Audit</p>
              <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                Upload a dataset and run a comprehensive bias analysis
              </p>
            </div>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" style={{ color: "var(--text-muted)" }} />
          </Link>

          <div
            className="flex items-center gap-4 p-5 rounded-xl"
            style={{
              background: "rgba(139, 92, 246, 0.06)",
              border: "1px solid rgba(139, 92, 246, 0.15)",
            }}
          >
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "rgba(139, 92, 246, 0.15)" }}>
              <TrendingUp className="w-6 h-6" style={{ color: "var(--accent-purple)" }} />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-white">Bias Drift Monitor</p>
              <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                Track bias trends across all models over time
              </p>
            </div>
            <span className="text-[10px] px-2 py-1 rounded-md font-medium" style={{ color: "var(--text-muted)", background: "var(--bg-card)" }}>
              Coming Soon
            </span>
          </div>
        </div>
      </motion.div>

      {/* Recent Audits */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-card p-6"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-white">Recent Audits</h3>
          {audits.length > 0 && (
            <Link
              href="/dashboard/audits"
              className="text-xs font-medium hover:underline"
              style={{ color: "var(--accent-blue)" }}
            >
              View All →
            </Link>
          )}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-3" style={{ borderColor: "var(--accent-blue)", borderTopColor: "transparent" }} />
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>Loading audits...</p>
          </div>
        ) : audits.length === 0 ? (
          <div className="text-center py-12">
            <Shield className="w-12 h-12 mx-auto mb-4" style={{ color: "var(--text-muted)" }} />
            <p className="text-sm font-medium text-white mb-1">No audits yet</p>
            <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>
              Upload a dataset to run your first bias analysis
            </p>
            <Link
              href="/dashboard/audits/new"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-white"
              style={{ background: "var(--accent-blue)" }}
            >
              <Plus className="w-3.5 h-3.5" />
              New Audit
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {audits.slice(0, 5).map((audit) => (
              <Link
                key={audit.id}
                href={`/dashboard/audits/${audit.id}`}
                className="flex items-center gap-4 p-4 rounded-xl transition-all hover:scale-[1.01]"
                style={{ background: "var(--bg-card)", border: "1px solid var(--border-default)" }}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">
                    {audit.dataset_filename}
                  </p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {audit.domain} · {audit.findings_count} finding{audit.findings_count !== 1 ? "s" : ""} · {new Date(audit.created_at).toLocaleDateString()}
                  </p>
                </div>
                <SeverityBadge severity={audit.overall_severity} />
                <ArrowRight className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
              </Link>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
