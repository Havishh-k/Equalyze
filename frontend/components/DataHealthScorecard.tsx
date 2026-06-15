"use client";

import { AlertTriangle, CheckCircle, Info, ShieldAlert, XCircle } from "lucide-react";

interface DataHealthFinding {
  category: string;
  severity: "CRITICAL" | "WARNING" | "INFO";
  title: string;
  detail: string;
  metric_value: number;
  threshold: number;
}

interface DataHealthData {
  score: number;
  can_proceed: boolean;
  findings: DataHealthFinding[];
  critical_count: number;
  warning_count: number;
  info_count: number;
}

const SEVERITY_CONFIG = {
  CRITICAL: {
    icon: XCircle,
    bg: "var(--severity-red-bg)",
    border: "var(--severity-red-border)",
    text: "var(--severity-red-text)",
    dot: "var(--severity-red-dot)",
    label: "Critical",
  },
  WARNING: {
    icon: AlertTriangle,
    bg: "var(--severity-amber-bg)",
    border: "var(--severity-amber-border)",
    text: "var(--severity-amber-text)",
    dot: "var(--severity-amber-dot)",
    label: "Warning",
  },
  INFO: {
    icon: Info,
    bg: "var(--brand-50)",
    border: "var(--brand-200)",
    text: "var(--brand-600)",
    dot: "var(--brand-500)",
    label: "Info",
  },
};

const CATEGORY_LABELS: Record<string, string> = {
  sample_size: "Sample Size",
  missing_values: "Missing Values",
  class_imbalance: "Class Imbalance",
  outcome_distribution: "Outcome Distribution",
  duplicates: "Duplicate Rows",
  zero_variance: "Zero-Variance Columns",
  overall: "Overall",
};

function ScoreRing({ score, canProceed }: { score: number; canProceed: boolean }) {
  const color = canProceed
    ? score >= 80 ? "var(--severity-green-dot)" : "var(--severity-amber-dot)"
    : "var(--severity-red-dot)";
  const pct = Math.round(score);
  const circumference = 2 * Math.PI * 40;
  const dashLength = (pct / 100) * circumference;

  return (
    <div className="relative w-28 h-28 flex-shrink-0">
      <svg className="w-28 h-28 -rotate-90" viewBox="0 0 96 96">
        <circle cx="48" cy="48" r="40" fill="none" stroke="var(--border-default)" strokeWidth="7" />
        <circle
          cx="48" cy="48" r="40" fill="none" stroke={color} strokeWidth="7"
          strokeDasharray={`${dashLength} ${circumference}`}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.6s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold font-mono" style={{ color }}>{pct}</span>
        <span className="text-[10px] font-semibold" style={{ color: "var(--text-muted)" }}>/ 100</span>
      </div>
    </div>
  );
}

export default function DataHealthScorecard({ data }: { data: DataHealthData }) {
  const { score, can_proceed, findings, critical_count, warning_count, info_count } = data;

  return (
    <div
      className="rounded-xl p-6 space-y-5"
      style={{
        background: "var(--surface-card)",
        border: `1px solid ${can_proceed ? "var(--severity-green-border)" : "var(--severity-red-border)"}`,
      }}
    >
      {/* Header */}
      <div className="flex items-start gap-6">
        <ScoreRing score={score} canProceed={can_proceed} />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <ShieldAlert className="w-5 h-5" style={{ color: can_proceed ? "var(--severity-green-dot)" : "var(--severity-red-dot)" }} />
            <h3 className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
              Data Health Scorecard
            </h3>
          </div>
          <p className="text-sm mb-4" style={{ color: "var(--text-secondary)" }}>
            {can_proceed
              ? "Your dataset passed pre-audit validation. The audit pipeline will proceed."
              : "Your dataset failed critical validation checks. Fix the issues below before running the bias audit."
            }
          </p>
          {/* Summary badges */}
          <div className="flex items-center gap-3">
            {critical_count > 0 && (
              <span className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md"
                style={{ background: "var(--severity-red-bg)", color: "var(--severity-red-text)", border: "1px solid var(--severity-red-border)" }}>
                <XCircle className="w-3 h-3" /> {critical_count} Critical
              </span>
            )}
            {warning_count > 0 && (
              <span className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md"
                style={{ background: "var(--severity-amber-bg)", color: "var(--severity-amber-text)", border: "1px solid var(--severity-amber-border)" }}>
                <AlertTriangle className="w-3 h-3" /> {warning_count} Warning
              </span>
            )}
            {info_count > 0 && (
              <span className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md"
                style={{ background: "var(--brand-50)", color: "var(--brand-600)", border: "1px solid var(--brand-200)" }}>
                <Info className="w-3 h-3" /> {info_count} Info
              </span>
            )}
            {critical_count === 0 && warning_count === 0 && (
              <span className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md"
                style={{ background: "var(--severity-green-bg)", color: "var(--severity-green-text)", border: "1px solid var(--severity-green-border)" }}>
                <CheckCircle className="w-3 h-3" /> All Checks Passed
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Findings list */}
      {findings.length > 0 && (
        <div className="space-y-2">
          {findings.map((f, i) => {
            const cfg = SEVERITY_CONFIG[f.severity] || SEVERITY_CONFIG.INFO;
            const Icon = cfg.icon;
            return (
              <div
                key={i}
                className="flex items-start gap-3 p-3.5 rounded-lg"
                style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
              >
                <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: cfg.dot }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-bold" style={{ color: cfg.text }}>{f.title}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                      style={{ background: `${cfg.dot}15`, color: cfg.dot }}>
                      {CATEGORY_LABELS[f.category] || f.category}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                    {f.detail}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
