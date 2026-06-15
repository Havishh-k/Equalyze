"use client";

import React, { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * React Error Boundary — catches rendering errors in child components
 * and displays a recovery UI instead of a white screen.
 *
 * Usage:
 *   <ErrorBoundary>
 *     <YourComponent />
 *   </ErrorBoundary>
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    // Log to console in dev — in prod would send to error tracking
    console.error("[ErrorBoundary]", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div
          style={{
            padding: "var(--space-10)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 300,
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "var(--radius-full)",
              background: "var(--severity-red-bg)",
              border: "2px solid var(--severity-red-border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "var(--space-5)",
            }}
          >
            <AlertTriangle
              style={{ width: 32, height: 32, color: "var(--severity-red-dot)" }}
            />
          </div>

          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 22,
              fontWeight: 400,
              color: "var(--text-primary)",
              marginBottom: "var(--space-2)",
            }}
          >
            Something went wrong
          </h2>

          <p
            style={{
              fontSize: 14,
              color: "var(--text-secondary)",
              maxWidth: 400,
              marginBottom: "var(--space-6)",
              lineHeight: 1.6,
            }}
          >
            An unexpected error occurred while rendering this component.
            Try refreshing, or contact support if the issue persists.
          </p>

          {/* Error details (dev only) */}
          {process.env.NODE_ENV === "development" && this.state.error && (
            <details
              style={{
                width: "100%",
                maxWidth: 500,
                marginBottom: "var(--space-6)",
                textAlign: "left",
              }}
            >
              <summary
                style={{
                  fontSize: 12,
                  color: "var(--text-tertiary)",
                  cursor: "pointer",
                  marginBottom: "var(--space-2)",
                }}
              >
                Error details
              </summary>
              <pre
                style={{
                  fontSize: 11,
                  fontFamily: "var(--font-mono)",
                  background: "var(--surface-sunken)",
                  border: "1px solid var(--border-default)",
                  borderRadius: "var(--radius-md)",
                  padding: "var(--space-4)",
                  overflow: "auto",
                  maxHeight: 200,
                  color: "var(--severity-red-text)",
                }}
              >
                {this.state.error.message}
                {"\n\n"}
                {this.state.errorInfo?.componentStack}
              </pre>
            </details>
          )}

          <button
            onClick={this.handleReset}
            className="btn btn-primary"
            style={{ gap: 8 }}
          >
            <RefreshCw style={{ width: 16, height: 16 }} />
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
