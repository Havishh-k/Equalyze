"use client";

import { useState, useEffect, use } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle,
  Loader2,
  AlertTriangle,
  Shield,
  Scale,
  Zap,
  FileText,
  Users,
  TrendingDown,
  XCircle,
  Sparkles,
} from "lucide-react";
import {
  getAudit,
  getAuditStatus,
  type AuditFull,
  type Finding,
  type BiasMetric,
  type CounterfactualTwin,
} from "@/lib/api";

// ── Severity Badge ──────────────────────────────

function SeverityBadge({ severity, size = "md" }: { severity: string; size?: "sm" | "md" | "lg" }) {
  const config: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
    GREEN: { label: "Compliant", cls: "severity-green", icon: <CheckCircle className="w-3.5 h-3.5" /> },
    AMBER: { label: "Monitor", cls: "severity-amber", icon: <AlertTriangle className="w-3.5 h-3.5" /> },
    RED: { label: "Action Required", cls: "severity-red", icon: <XCircle className="w-3.5 h-3.5" /> },
  };
  const c = config[severity] || config.GREEN;
  const sizeClasses = { sm: "px-2 py-0.5 text-[10px]", md: "px-3 py-1.5 text-xs", lg: "px-4 py-2 text-sm" };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-lg font-semibold ${c.cls} ${sizeClasses[size]}`}>
      {c.icon} {c.label}
    </span>
  );
}

// ── Score Gauge ─────────────────────────────────

function ScoreGauge({ score, severity }: { score: number; severity: string }) {
  const color = severity === "RED" ? "#EF4444" : severity === "AMBER" ? "#F59E0B" : "#22C55E";
  const pct = Math.round(score * 100);
  return (
    <div className="flex items-center gap-4">
      <div className="relative w-20 h-20">
        <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r="32" fill="none" stroke="var(--border-default)" strokeWidth="6" />
          <circle
            cx="40" cy="40" r="32" fill="none" stroke={color} strokeWidth="6"
            strokeDasharray={`${pct * 2.01} 201`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold" style={{ color }}>{pct}%</span>
        </div>
      </div>
      <div>
        <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Risk Score</p>
        <SeverityBadge severity={severity} size="sm" />
      </div>
    </div>
  );
}

// ── Agent Status Tracker ────────────────────────

function AgentTracker({ agents = {} }: { agents?: Record<string, { status: string }> }) {
  const agentList = [
    { key: "ingestion", label: "Ingestion", icon: FileText },
    { key: "twin_engine", label: "Twin Engine", icon: Users },
    { key: "governance", label: "Governance", icon: Scale },
    { key: "remediation", label: "Remediation", icon: Zap },
    { key: "reporting", label: "Reporting", icon: Shield },
  ];
  return (
    <div className="flex items-center gap-2">
      {agentList.map((a, i) => {
        const status = agents[a.key]?.status || "pending";
        const color =
          status === "complete" ? "var(--severity-green)"
          : status === "running" ? "var(--accent-blue)"
          : status === "failed" ? "var(--severity-red)"
          : "var(--text-muted)";
        return (
          <div key={a.key} className="flex items-center gap-2">
            <div
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium"
              style={{ background: "var(--bg-card)", border: `1px solid ${color}30`, color }}
            >
              {status === "running" ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : status === "complete" ? (
                <CheckCircle className="w-3.5 h-3.5" />
              ) : status === "failed" ? (
                <XCircle className="w-3.5 h-3.5" />
              ) : (
                <a.icon className="w-3.5 h-3.5" />
              )}
              {a.label}
            </div>
            {i < agentList.length - 1 && (
              <div className="w-4 h-px" style={{ background: status === "complete" ? "var(--severity-green)" : "var(--border-default)" }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Metric Card ─────────────────────────────────

function MetricCard({ metric }: { metric: BiasMetric }) {
  return (
    <div className="glass-card p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
          {metric.metric_name.replace(/_/g, " ")}
        </span>
        <SeverityBadge severity={metric.severity} size="sm" />
      </div>
      <div className="text-3xl font-bold font-mono mb-2" style={{ color: metric.severity === "RED" ? "var(--severity-red)" : metric.severity === "AMBER" ? "var(--severity-amber)" : "var(--severity-green)" }}>
        {typeof metric.value === "number" ? metric.value.toFixed(4) : "N/A"}
      </div>
      <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
        {metric.interpretation}
      </p>
      {metric.legal_flag && (
        <div className="mt-3 flex items-center gap-1.5 text-[10px] font-semibold severity-red px-2 py-1 rounded-md w-fit">
          <AlertTriangle className="w-3 h-3" />
          Legal threshold violated
        </div>
      )}
    </div>
  );
}

// ── THE Counterfactual Twin Card ────────────────

function TwinCard({ twin, protectedAttr }: { twin: CounterfactualTwin; protectedAttr: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6 glow-red"
    >
      <div className="flex items-center gap-2 mb-5">
        <Users className="w-5 h-5" style={{ color: "var(--severity-red)" }} />
        <h4 className="text-sm font-bold text-white">Counterfactual Twin — {protectedAttr}</h4>
        <span className="ml-auto text-[10px] font-mono px-2 py-0.5 rounded" style={{ background: "var(--bg-elevated)", color: "var(--text-muted)" }}>
          Quality: {(twin.twin_quality_score * 100).toFixed(0)}%
        </span>
      </div>

      <div className="twin-card mb-5">
        {/* Original */}
        <div className="p-5 rounded-xl" style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)" }}>
          <div className="text-[10px] font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--severity-red)" }}>
            Original — Negative Outcome
          </div>
          <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--text-secondary)" }}>
            {twin.original_narrative}
          </p>
          <div className="space-y-1.5">
            {Object.entries(twin.original_profile).slice(0, 8).map(([k, v]) => (
              <div key={k} className="flex justify-between text-xs">
                <span style={{ color: "var(--text-muted)" }}>{k.replace(/_/g, " ")}</span>
                <span className="font-mono font-medium" style={{
                  color: twin.changed_attributes.includes(k) ? "var(--severity-red)" : "var(--text-primary)"
                }}>
                  {String(v)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="twin-divider" />

        {/* Twin */}
        <div className="p-5 rounded-xl" style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.15)" }}>
          <div className="text-[10px] font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--severity-green)" }}>
            Twin — Positive Outcome
          </div>
          <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--text-secondary)" }}>
            {twin.twin_narrative}
          </p>
          <div className="space-y-1.5">
            {Object.entries(twin.twin_profile).slice(0, 8).map(([k, v]) => (
              <div key={k} className="flex justify-between text-xs">
                <span style={{ color: "var(--text-muted)" }}>{k.replace(/_/g, " ")}</span>
                <span className="font-mono font-medium" style={{
                  color: twin.changed_attributes.includes(k) ? "var(--severity-green)" : "var(--text-primary)"
                }}>
                  {String(v)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* THE discrimination statement */}
      {twin.discrimination_statement && (
        <div className="p-4 rounded-xl text-center" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}>
          <p className="text-sm font-semibold leading-relaxed" style={{ color: "var(--severity-red)" }}>
            &ldquo;{twin.discrimination_statement}&rdquo;
          </p>
        </div>
      )}
    </motion.div>
  );
}

// ── Finding Section ─────────────────────────────

function FindingSection({ finding, index }: { finding: Finding; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.15 }}
      className="space-y-5"
    >
      {/* Finding header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white flex items-center gap-3">
          <span className="text-xs font-mono px-2 py-1 rounded" style={{ background: "var(--bg-elevated)", color: "var(--text-muted)" }}>
            #{index + 1}
          </span>
          Bias in: <span className="gradient-text">{finding.protected_attribute.replace(/_/g, " ")}</span>
        </h3>
        <SeverityBadge severity={finding.severity} size="md" />
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {finding.metrics.map((m) => (
          <MetricCard key={m.metric_name} metric={m} />
        ))}
      </div>

      {/* Counterfactual twins */}
      {finding.counterfactual_twins.map((twin) => (
        <TwinCard key={twin.id} twin={twin} protectedAttr={finding.protected_attribute} />
      ))}

      {/* Legal violations */}
      {finding.legal_violations.length > 0 && (
        <div className="glass-card p-6">
          <h4 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
            <Scale className="w-4 h-4" style={{ color: "var(--severity-red)" }} />
            Legal Exposure
          </h4>
          <div className="space-y-3">
            {finding.legal_violations.map((v, i) => (
              <div key={i} className="p-4 rounded-xl" style={{ background: "var(--bg-card)", border: "1px solid var(--border-default)" }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-white">{v.regulation_name}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    v.risk_level === "CRITICAL" || v.risk_level === "HIGH" ? "severity-red" : v.risk_level === "MEDIUM" ? "severity-amber" : "severity-green"
                  }`}>
                    {v.risk_level}
                  </span>
                </div>
                <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>
                  {v.jurisdiction} — {v.article}
                </p>
                <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  {v.plain_english}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Remediation strategies */}
      {finding.remediation_strategies.length > 0 && (
        <div className="glass-card p-6">
          <h4 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
            <Zap className="w-4 h-4" style={{ color: "var(--severity-amber)" }} />
            Remediation Strategies
          </h4>
          <div className="space-y-3">
            {finding.remediation_strategies.map((s) => (
              <div key={s.rank} className="p-4 rounded-xl" style={{ background: "var(--bg-card)", border: "1px solid var(--border-default)" }}>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center" style={{ background: "rgba(59,130,246,0.15)", color: "var(--accent-blue)" }}>
                    {s.rank}
                  </span>
                  <span className="text-sm font-semibold text-white">{s.name}</span>
                  <span className="ml-auto text-[10px] font-medium px-2 py-0.5 rounded" style={{ background: "var(--bg-elevated)", color: "var(--text-muted)" }}>
                    {s.level} · {s.estimated_effort}
                  </span>
                </div>
                <p className="text-xs leading-relaxed ml-9" style={{ color: "var(--text-secondary)" }}>
                  {s.description}
                </p>
                {s.estimated_bias_reduction && (
                  <p className="text-[10px] ml-9 mt-2 flex items-center gap-1" style={{ color: "var(--severity-green)" }}>
                    <TrendingDown className="w-3 h-3" />
                    {s.estimated_bias_reduction}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Genealogy */}
      {finding.genealogy_tree.length > 0 && (
        <div className="glass-card p-6">
          <h4 className="text-sm font-bold text-white mb-4">Bias Genealogy — Root Cause Analysis</h4>
          <div className="space-y-3">
            {finding.genealogy_tree.map((node) => (
              <div key={node.level} className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                  style={{
                    background: node.bias_contribution > 0.3 ? "rgba(239,68,68,0.15)" : "rgba(59,130,246,0.1)",
                    color: node.bias_contribution > 0.3 ? "var(--severity-red)" : "var(--accent-blue)",
                    border: `1px solid ${node.bias_contribution > 0.3 ? "rgba(239,68,68,0.25)" : "rgba(59,130,246,0.2)"}`,
                  }}
                >
                  L{node.level}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-white">{node.level_name}</span>
                    <span className="text-[10px] font-mono" style={{ color: "var(--text-muted)" }}>
                      ({(node.bias_contribution * 100).toFixed(0)}% contribution)
                    </span>
                  </div>
                  <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{node.root_cause}</p>
                  <p className="text-[10px] mt-1" style={{ color: "var(--accent-blue)" }}>Fix: {node.fix_suggestion}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

// ── Main Page ───────────────────────────────────

export default function AuditResultsPage({ params }: { params: Promise<{ audit_id: string }> }) {
  const { audit_id } = use(params);
  const [audit, setAudit] = useState<AuditFull | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const fetchAudit = async () => {
      try {
        const data = await getAudit(audit_id);
        setAudit(data);
        if (data.status === "complete" || data.status === "failed") {
          setLoading(false);
          clearInterval(interval);
        }
      } catch {
        setLoading(false);
      }
    };

    fetchAudit();
    interval = setInterval(fetchAudit, 3000); // Poll every 3s while running

    return () => clearInterval(interval);
  }, [audit_id]);

  if (!audit) {
    return (
      <div className="text-center py-20">
        <Loader2 className="w-10 h-10 animate-spin mx-auto mb-4" style={{ color: "var(--accent-blue)" }} />
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>Loading audit...</p>
      </div>
    );
  }

  const isRunning = audit.status === "running";

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link href="/dashboard" className="flex items-center gap-1.5 text-xs mb-3 hover:underline" style={{ color: "var(--accent-blue)" }}>
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Dashboard
          </Link>
          <h2 className="text-2xl font-bold text-white">{audit.dataset?.filename || "Bias Audit"}</h2>
          <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
            {audit.model_metadata?.organization_name} · {audit.model_metadata?.domain} · {new Date(audit.created_at).toLocaleString()}
          </p>
        </div>
        {!isRunning && <ScoreGauge score={audit.overall_score} severity={audit.overall_severity} />}
        {!isRunning && audit.overall_severity !== "GREEN" && (
          <Link
            href={`/dashboard/audits/${audit_id}/remediation`}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #8B5CF6, #06B6D4)" }}
          >
            <Sparkles className="w-4 h-4" />
            Remediate with AI
          </Link>
        )}
      </div>

      {/* Agent status tracker */}
      <div className="glass-card p-5 overflow-x-auto">
        <p className="text-xs font-medium mb-3" style={{ color: "var(--text-muted)" }}>
          Agent Pipeline {isRunning ? "(running...)" : ""}
        </p>
        <AgentTracker agents={audit.agents} />
      </div>

      {/* Running state */}
      {isRunning && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16 glass-card"
        >
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" style={{ color: "var(--accent-blue)" }} />
          <p className="text-lg font-semibold text-white mb-2">Audit in Progress</p>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Our AI agents are analyzing your dataset for bias. This usually takes 2-5 minutes.
          </p>
        </motion.div>
      )}

      {/* Findings */}
      {!isRunning && audit.findings && (
        <div className="space-y-10">
          {audit.findings.length === 0 ? (
            <div className="text-center py-16 glass-card">
              <CheckCircle className="w-12 h-12 mx-auto mb-4" style={{ color: "var(--severity-green)" }} />
              <p className="text-lg font-semibold text-white mb-2">No Bias Detected</p>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                Your model appears fair across all tested protected attributes. 🎉
              </p>
            </div>
          ) : (
            audit.findings.map((finding, i) => (
              <FindingSection key={finding.id} finding={finding} index={i} />
            ))
          )}
        </div>
      )}

      {/* Audit log */}
      {!isRunning && audit.audit_log && audit.audit_log.length > 0 && (
        <div className="glass-card p-6">
          <h4 className="text-sm font-bold text-white mb-4">Audit Log — Chain of Custody</h4>
          <div className="space-y-2">
            {audit.audit_log.map((entry, i) => (
              <div key={i} className="flex items-center gap-3 text-xs">
                <span className="font-mono" style={{ color: "var(--text-muted)" }}>
                  {new Date(entry.timestamp).toLocaleTimeString()}
                </span>
                <span className="font-medium text-white">{entry.event}</span>
                <span style={{ color: "var(--text-secondary)" }}>{entry.details}</span>
              </div>
            ))}
          </div>
          {audit.report_hash && (
            <p className="text-[10px] font-mono mt-4 pt-3" style={{ color: "var(--text-muted)", borderTop: "1px solid var(--border-default)" }}>
              Report Hash (SHA-256): {audit.report_hash}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
