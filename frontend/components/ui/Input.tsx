"use client";

import React, { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, helperText, className = "", style, id, ...props }, ref) => {
    const inputId = id || `input-${label?.toLowerCase().replace(/\s+/g, "-")}`;

    return (
      <div className={className} style={style}>
        {label && (
          <label
            htmlFor={inputId}
            style={{
              display: "block",
              fontSize: 13,
              fontWeight: 500,
              color: "var(--text-primary)",
              marginBottom: 6,
              fontFamily: "var(--font-body)",
            }}
          >
            {label}
          </label>
        )}
        <div style={{ position: "relative" }}>
          {icon && (
            <span
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--text-tertiary)",
                display: "flex",
                alignItems: "center",
              }}
            >
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            style={{
              width: "100%",
              padding: icon ? "10px 12px 10px 40px" : "10px 12px",
              borderRadius: "var(--radius-md)",
              border: `1px solid ${error ? "var(--severity-red-border)" : "var(--border-default)"}`,
              background: "var(--surface-card)",
              color: "var(--text-primary)",
              fontSize: 14,
              outline: "none",
              transition: "border-color var(--transition-fast)",
              fontFamily: "var(--font-body)",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = error
                ? "var(--severity-red-dot)"
                : "var(--brand-400)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = error
                ? "var(--severity-red-border)"
                : "var(--border-default)";
            }}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : undefined}
            {...props}
          />
        </div>
        {error && (
          <p
            id={`${inputId}-error`}
            role="alert"
            style={{
              fontSize: 12,
              color: "var(--severity-red-text)",
              marginTop: 4,
            }}
          >
            {error}
          </p>
        )}
        {helperText && !error && (
          <p style={{ fontSize: 12, color: "var(--text-tertiary)", marginTop: 4 }}>
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
