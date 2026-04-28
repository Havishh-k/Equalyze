import React from "react";

export interface SeverityBadgeProps {
  severity: string;
  size?: "sm" | "md" | "lg";
}

export function SeverityBadge({ severity, size = "md" }: SeverityBadgeProps) {
  const config: Record<string, { label: string; variant: string }> = {
    GREEN: { label: "Compliant", variant: "green" },
    AMBER: { label: "Monitor", variant: "amber" },
    RED: { label: "Action Required", variant: "red" },
  };
  const c = config[severity] || config.GREEN;
  
  return (
    <span 
      className={`severity-badge severity-badge--${c.variant} ${size === "lg" ? "severity-badge--lg" : ""}`} 
      role="status"
      style={size === "sm" ? { padding: "2px 8px", fontSize: "11px" } : undefined}
    >
      <span className="severity-dot" />
      {c.label}
    </span>
  );
}
