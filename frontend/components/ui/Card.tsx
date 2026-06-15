"use client";

import React from "react";

/* ── Card ──────────────────────────────────────────── */
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function Card({ children, className = "", style, ...props }: CardProps) {
  return (
    <div className={`card ${className}`} style={style} {...props}>
      {children}
    </div>
  );
}

/* ── CardHeader ────────────────────────────────────── */
interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  children?: React.ReactNode;
}

export function CardHeader({
  title,
  subtitle,
  action,
  children,
  className = "",
  style,
  ...props
}: CardHeaderProps) {
  return (
    <div
      className={`card-header ${className}`}
      style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", ...style }}
      {...props}
    >
      {children || (
        <>
          <div>
            {title && (
              <h3
                style={{
                  fontFamily: "var(--font-display)",
                  fontStyle: "italic",
                  fontSize: 18,
                  fontWeight: 400,
                  color: "var(--text-primary)",
                  margin: 0,
                  lineHeight: 1.3,
                }}
              >
                {title}
              </h3>
            )}
            {subtitle && (
              <p
                style={{
                  fontSize: 13,
                  color: "var(--text-secondary)",
                  margin: "4px 0 0 0",
                }}
              >
                {subtitle}
              </p>
            )}
          </div>
          {action && <div>{action}</div>}
        </>
      )}
    </div>
  );
}

/* ── CardBody ──────────────────────────────────────── */
export function CardBody({
  children,
  className = "",
  style,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`card-body ${className}`} style={style} {...props}>
      {children}
    </div>
  );
}

/* ── CardFooter ────────────────────────────────────── */
export function CardFooter({
  children,
  className = "",
  style,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={className}
      style={{
        padding: "var(--space-4) var(--space-6)",
        borderTop: "1px solid var(--border-default)",
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        gap: "var(--space-3)",
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}
