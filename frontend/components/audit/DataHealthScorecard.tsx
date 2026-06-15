"use client";

import React from "react";
import { AlertTriangle, CheckCircle, XCircle, Info, ShieldAlert, ShieldCheck } from "lucide-react";

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

interface DataHealthScorecardProps {
  data: DataHealthData;
  onProceed?: () => void;
  onCancel?: () => void;
}

const severityIcon: Record<string, React.ReactNode> = {
  CRITICAL: <XCircle style={{ width: 16, height: 16, color: "var(--severity-red-dot)", flexShrink: 0 }} />,
  WARNING: <AlertTriangle style={{ width: 16, height: 16, color: "var(--severity-amber-dot)", flexShrink: 0 }} />,
  INFO: <Info style={{ width: 16, height: 16, color: "var(--brand-500)", flexShrink: 0 }} />,
};

const severityBg: Record<string, string> = {
  CRITICAL: "var(--severity-red-bg)",
  WARNING: "var(--severity-amber-bg)",
  INFO: "var(--neutral-50)",
};

const severityBorder: Record<string, string> = {
  CRITICAL: "var(--severity-red-border)",
  WARNING: "var(--severity-amber-border)",
  INFO: "var(--border-default)",
};

export function DataHealthScorecard({ data, onProceed, onCancel }: DataHealthScorecardProps) {
  const scoreColor =
    data.score >= 80
      ? "var(--severity-green-dot)"
      : data.score >= 50
        ? "var(--severity-amber-dot)"
        : "var(--severity-red-dot)";

  const scoreBg =
    data.score >= 80
      ? "var(--severity-green-bg)"
      : data.score >= 50
        ? "var(--severity-amber-bg)"
        : "var(--severity-red-bg)";

  // SVG circle math
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (data.score / 100) * circumference;

  return (
    <div
      className="card animate-slide-up"
      style={{ overflow: "hidden" }}
    >
      {/* Header */}
      <div
        className="card-header"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--space-3)",
          background: data.can_proceed ? "var(--severity-green-bg)" : "var(--severity-red-bg)",
          borderBottom: `1px solid ${data.can_proceed ? "var(--severity-green-border)" : "var(--severity-red-border)"}`,
        }}
      >
        {data.can_proceed ? (
          <ShieldCheck style={{ width: 20, height: 20, color: "var(--severity-green-dot)" }} />
        ) : (
          <ShieldAlert style={{ width: 20, height: 20, color: "var(--severity-red-dot)" }} />
        )}
        <div>
          <h3
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: "var(--text-primary)",
              margin: 0,
            }}
          >
            Data Health Scorecard
          </h3>
          <p style={{ fontSize: 12, color: "var(--text-secondary)", margin: 0, marginTop: 2 }}>
            {data.can_proceed
              ? "Dataset passed quality checks. Ready to proceed."
              : "Critical issues detected. Audit blocked until resolved."}
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="card-body" style={{ display: "flex", gap: "var(--space-8)", alignItems: "flex-start" }}>
        {/* Score Circle */}
        <div style={{ textAlign: "center", flexShrink: 0 }}>
          <svg width="130" height="130" viewBox="0 0 130 130">
            {/* Background circle */}
            <circle
              cx="65"
              cy="65"
              r={radius}
              fill="none"
              stroke="var(--neutral-200)"
              strokeWidth="10"
            />
            {/* Progress arc */}
            <circle
              cx="65"
              cy="65"
              r={radius}
              fill="none"
              stroke={scoreColor}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              transform="rotate(-90 65 65)"
              style={{ transition: "stroke-dashoffset 1s var(--ease-decelerate)" }}
            />
            {/* Score text */}
            <text
              x="65"
              y="60"
              textAnchor="middle"
              style={{
                fontSize: 32,
                fontWeight: 700,
                fontFamily: "var(--font-mono)",
                fill: scoreColor,
              }}
            >
              {Math.round(data.score)}
            </text>
            <text
              x="65"
              y="80"
              textAnchor="middle"
              style={{
                fontSize: 11,
                fontFamily: "var(--font-body)",
                fill: "var(--text-tertiary)",
              }}
            >
              / 100
            </text>
          </svg>

          {/* Summary badges */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "var(--space-2)",
              marginTop: "var(--space-3)",
            }}
          >
            {data.critical_count > 0 && (
              <span
                className="severity-badge severity-badge--red"
                style={{ fontSize: 11, padding: "2px 8px" }}
              >
                <span className="severity-dot" aria-hidden="true" />
                {data.critical_count} Critical
              </span>
            )}
            {data.warning_count > 0 && (
              <span
                className="severity-badge severity-badge--amber"
                style={{ fontSize: 11, padding: "2px 8px" }}
              >
                <span className="severity-dot" aria-hidden="true" />
                {data.warning_count} Warning
              </span>
            )}
          </div>
        </div>

        {/* Findings list */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h4
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "var(--text-primary)",
              marginBottom: "var(--space-3)",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
            }}
          >
            Findings ({data.findings.length})
          </h4>

          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
            {data.findings.map((finding, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "var(--space-3)",
                  padding: "var(--space-3) var(--space-4)",
                  borderRadius: "var(--radius-md)",
                  background: severityBg[finding.severity],
                  border: `1px solid ${severityBorder[finding.severity]}`,
                }}
              >
                {severityIcon[finding.severity]}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "var(--text-primary)",
                      margin: 0,
                    }}
                  >
                    {finding.title}
                  </p>
                  <p
                    style={{
                      fontSize: 12,
                      color: "var(--text-secondary)",
                      margin: "2px 0 0 0",
                      lineHeight: 1.5,
                    }}
                  >
                    {finding.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          padding: "var(--space-4) var(--space-6)",
          borderTop: "1px solid var(--border-default)",
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          gap: "var(--space-3)",
        }}
      >
        {onCancel && (
          <button
            className="btn btn-secondary"
            onClick={onCancel}
            style={{ height: 36, fontSize: 13 }}
          >
            Cancel
          </button>
        )}
        {onProceed && (
          <button
            className={`btn ${data.can_proceed ? "btn-primary" : "btn-destructive"}`}
            onClick={data.can_proceed ? onProceed : undefined}
            disabled={!data.can_proceed}
            style={{ height: 36, fontSize: 13, opacity: data.can_proceed ? 1 : 0.5 }}
          >
            {data.can_proceed ? (
              <>
                <CheckCircle style={{ width: 14, height: 14 }} />
                Proceed to Audit
              </>
            ) : (
              <>
                <XCircle style={{ width: 14, height: 14 }} />
                Audit Blocked
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
