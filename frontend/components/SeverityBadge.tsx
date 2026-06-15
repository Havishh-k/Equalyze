import React from "react";

export interface SeverityBadgeProps {
  severity: string;
  label?: string;
  size?: "sm" | "md" | "lg";
}

const severityConfig: Record<string, { label: string; variant: string }> = {
  GREEN: { label: "COMPLIANT — Proceed", variant: "green" },
  AMBER: { label: "WARNING — Proceed with Caution", variant: "amber" },
  RED: { label: "HALT — Do Not Deploy", variant: "red" },
};

export function SeverityBadge({ severity, label, size = "md" }: SeverityBadgeProps) {
  const c = severityConfig[severity] || severityConfig.GREEN;
  const displayLabel = label || c.label;

  return (
    <span
      className={`severity-badge severity-badge--${c.variant} ${size === "lg" ? "severity-badge--lg" : ""}`}
      role="status"
      aria-label={`Severity: ${severity} — ${displayLabel}`}
      style={size === "sm" ? { padding: "2px 8px", fontSize: "11px" } : undefined}
    >
      <span className="severity-dot" aria-hidden="true" />
      {severity} — {displayLabel}
    </span>
  );
}

