"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  FileSearch,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Plus,
  Loader2,
} from "lucide-react";
import { listAudits, type AuditSummary } from "@/lib/api";

function SeverityBadge({ severity }: { severity: string }) {
  const config: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
    GREEN: { label: "Compliant", cls: "severity-green", icon: <CheckCircle className="w-3 h-3" /> },
    AMBER: { label: "Monitor", cls: "severity-amber", icon: <AlertTriangle className="w-3 h-3" /> },
    RED: { label: "Action Required", cls: "severity-red", icon: <XCircle className="w-3 h-3" /> },
  };
  const c = config[severity] || config.GREEN;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold ${c.cls}`}>
      {c.icon} {c.label}
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
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">All Audits</h2>
        <Link
          href="/dashboard/audits/new"
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white"
          style={{ background: "linear-gradient(135deg, #3B82F6, #2563EB)" }}
        >
          <Plus className="w-3.5 h-3.5" />
          New Audit
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3" style={{ color: "var(--accent-blue)" }} />
        </div>
      ) : audits.length === 0 ? (
        <div className="text-center py-20 glass-card">
          <FileSearch className="w-12 h-12 mx-auto mb-4" style={{ color: "var(--text-muted)" }} />
          <p className="text-sm font-medium text-white mb-1">No audits yet</p>
          <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>
            Run your first bias audit to see results here
          </p>
          <Link
            href="/dashboard/audits/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold text-white"
            style={{ background: "var(--accent-blue)" }}
          >
            <Plus className="w-3.5 h-3.5" />
            Start Audit
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {audits.map((audit, i) => (
            <motion.div
              key={audit.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                href={`/dashboard/audits/${audit.id}`}
                className="flex items-center gap-4 p-5 rounded-xl glass-card hover:scale-[1.01] transition-all"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">
                    {audit.dataset_filename}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                    {audit.domain} · {audit.findings_count} finding{audit.findings_count !== 1 ? "s" : ""} · {new Date(audit.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium px-2 py-1 rounded-md" style={{ 
                    background: audit.status === "complete" ? "rgba(34,197,94,0.1)" : audit.status === "running" ? "rgba(59,130,246,0.1)" : "rgba(239,68,68,0.1)",
                    color: audit.status === "complete" ? "var(--severity-green)" : audit.status === "running" ? "var(--accent-blue)" : "var(--severity-red)",
                  }}>
                    {audit.status}
                  </span>
                  <SeverityBadge severity={audit.overall_severity} />
                  <ArrowRight className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
