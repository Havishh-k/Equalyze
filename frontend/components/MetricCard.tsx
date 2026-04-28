import React from "react";

export interface MetricCardProps {
  title: string;
  value: string | number;
  threshold: string | number;
  severity: "GREEN" | "AMBER" | "RED";
  severityLabel: string;
  description: string;
  progress: number; // 0 to 1
}

export function MetricCard({
  title,
  value,
  threshold,
  severity,
  severityLabel,
  description,
  progress,
}: MetricCardProps) {
  const getSeverityDot = () => {
    switch (severity) {
      case "GREEN":
        return "var(--severity-green-dot)";
      case "AMBER":
        return "var(--severity-amber-dot)";
      case "RED":
        return "var(--severity-red-dot)";
      default:
        return "var(--neutral-500)";
    }
  };

  const getSeverityColor = () => {
    switch (severity) {
      case "GREEN":
        return "var(--severity-green-text)";
      case "AMBER":
        return "var(--severity-amber-text)";
      case "RED":
        return "var(--severity-red-text)";
      default:
        return "var(--text-primary)";
    }
  };

  return (
    <div
      className="card animate-fade-in"
      style={{
        padding: "24px",
        background: "var(--surface-card)",
        border: "1px solid var(--border-default)",
        borderRadius: "var(--radius-lg)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <h3
        style={{
          fontFamily: "var(--font-body)",
          fontWeight: 600,
          fontSize: "16px",
          color: "var(--text-primary)",
          marginBottom: "16px",
        }}
      >
        {title}
      </h3>

      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontWeight: 700,
          fontSize: "36px",
          color: "var(--text-primary)",
          marginBottom: "16px",
        }}
      >
        {value}
      </div>

      <div style={{ marginBottom: "20px" }}>
        <div
          style={{
            width: "100%",
            height: "6px",
            background: "var(--neutral-200)",
            borderRadius: "var(--radius-full)",
            overflow: "hidden",
            marginBottom: "6px",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${Math.min(100, Math.max(0, progress * 100))}%`,
              background: getSeverityDot(),
              borderRadius: "var(--radius-full)",
              transition: "width 600ms cubic-bezier(0, 0, 0.2, 1)",
            }}
          />
        </div>
        <div style={{ fontSize: "13px", color: "var(--text-secondary)", fontWeight: 500 }}>
          Threshold: {threshold}
        </div>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: getSeverityDot(),
          }}
        />
        <span
          style={{
            fontFamily: "var(--font-body)",
            fontWeight: 600,
            fontSize: "13px",
            color: getSeverityColor(),
          }}
        >
          {severity} — {severityLabel}
        </span>
      </div>

      <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
        {description}
      </p>
    </div>
  );
}
