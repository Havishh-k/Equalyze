"use client";

import React, { forwardRef } from "react";
import { ChevronDown } from "lucide-react";

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "children"> {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
  helperText?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    { label, error, options, placeholder, helperText, className = "", style, id, ...props },
    ref
  ) => {
    const selectId = id || `select-${label?.toLowerCase().replace(/\s+/g, "-")}`;

    return (
      <div className={className} style={style}>
        {label && (
          <label
            htmlFor={selectId}
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
          <select
            ref={ref}
            id={selectId}
            style={{
              width: "100%",
              padding: "10px 36px 10px 12px",
              borderRadius: "var(--radius-md)",
              border: `1px solid ${error ? "var(--severity-red-border)" : "var(--border-default)"}`,
              background: "var(--surface-card)",
              color: "var(--text-primary)",
              fontSize: 14,
              outline: "none",
              transition: "border-color var(--transition-fast)",
              fontFamily: "var(--font-body)",
              appearance: "none",
              cursor: "pointer",
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
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown
            style={{
              position: "absolute",
              right: 12,
              top: "50%",
              transform: "translateY(-50%)",
              width: 16,
              height: 16,
              color: "var(--text-tertiary)",
              pointerEvents: "none",
            }}
          />
        </div>
        {error && (
          <p role="alert" style={{ fontSize: 12, color: "var(--severity-red-text)", marginTop: 4 }}>
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

Select.displayName = "Select";
