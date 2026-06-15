"use client";

import React from "react";

type ProgressVariant = "default" | "green" | "amber" | "red";

interface ProgressProps {
  value: number; // 0–100
  max?: number;
  variant?: ProgressVariant;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  label?: string;
  className?: string;
  style?: React.CSSProperties;
}

const heights: Record<string, number> = { sm: 4, md: 8, lg: 12 };

const variantColors: Record<ProgressVariant, { bg: string; fill: string }> = {
  default: { bg: "var(--neutral-200)", fill: "var(--brand-500)" },
  green: { bg: "var(--severity-green-bg)", fill: "var(--severity-green-dot)" },
  amber: { bg: "var(--severity-amber-bg)", fill: "var(--severity-amber-dot)" },
  red: { bg: "var(--severity-red-bg)", fill: "var(--severity-red-dot)" },
};

export function Progress({
  value,
  max = 100,
  variant = "default",
  size = "md",
  showLabel = false,
  label,
  className = "",
  style,
}: ProgressProps) {
  const percent = Math.min(100, Math.max(0, (value / max) * 100));
  const colors = variantColors[variant];

  return (
    <div className={className} style={style}>
      {(showLabel || label) && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 6,
          }}
        >
          {label && (
            <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>
              {label}
            </span>
          )}
          {showLabel && (
            <span style={{ fontSize: 12, color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>
              {Math.round(percent)}%
            </span>
          )}
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label || `Progress: ${Math.round(percent)}%`}
        style={{
          width: "100%",
          height: heights[size],
          background: colors.bg,
          borderRadius: "var(--radius-full)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${percent}%`,
            height: "100%",
            background: colors.fill,
            borderRadius: "var(--radius-full)",
            transition: "width 400ms cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        />
      </div>
    </div>
  );
}
