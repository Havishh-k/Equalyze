"use client";

import React from "react";

interface SpinnerProps {
  size?: number;
  color?: string;
  className?: string;
  style?: React.CSSProperties;
}

export function Spinner({
  size = 16,
  color = "var(--brand-500)",
  className = "",
  style,
}: SpinnerProps) {
  return (
    <svg
      className={`animate-spinner ${className}`}
      style={{ width: size, height: size, color, ...style }}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="status"
      aria-label="Loading"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.2"
      />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
