import React from "react";
import { Check, X } from "lucide-react";

export interface TwinCardProps {
  findingTitle: string;
  severity: "GREEN" | "AMBER" | "RED";
  severityLabel: string;
  originalName?: string;
  twinName?: string;
  originalProfile: Record<string, string | number>;
  twinProfile: Record<string, string | number>;
  changedAttributes: string[];
  originalOutcomeStatus: "APPROVED" | "REJECTED";
  originalOutcomeValue: string;
  twinOutcomeStatus: "APPROVED" | "REJECTED";
  twinOutcomeValue: string;
  discriminationStatement: string;
  qualityScore: number;
  qualityLabel: string;
  preservedCount: number;
  totalCount: number;
}

export function TwinCard({
  findingTitle,
  severity,
  severityLabel,
  originalName = "Original Applicant",
  twinName = "Counterfactual Twin",
  originalProfile,
  twinProfile,
  changedAttributes,
  originalOutcomeStatus,
  originalOutcomeValue,
  twinOutcomeStatus,
  twinOutcomeValue,
  discriminationStatement,
  qualityScore,
  qualityLabel,
  preservedCount,
  totalCount,
}: TwinCardProps) {
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

  const getOutcomeStyle = (status: "APPROVED" | "REJECTED") => {
    if (status === "APPROVED") {
      return {
        background: "var(--severity-green-bg)",
        border: "1px solid var(--severity-green-border)",
        color: "var(--severity-green-text)",
      };
    }
    return {
      background: "var(--severity-red-bg)",
      border: "1px solid var(--severity-red-border)",
      color: "var(--severity-red-text)",
    };
  };

  return (
    <div
      className="twin-card animate-fade-in"
      style={{
        border: "1px solid var(--border-default)",
        borderRadius: "var(--radius-xl)",
        overflow: "hidden",
        boxShadow: "var(--shadow-md)",
        background: "var(--surface-card)",
      }}
    >
      {/* Header */}
      <div
        className="twin-card__header"
        style={{
          padding: "16px 24px",
          background: "var(--surface-sunken)",
          borderBottom: "1px solid var(--border-default)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-body)",
            fontWeight: 600,
            fontSize: "15px",
            color: "var(--text-primary)",
          }}
        >
          FINDING: {findingTitle}
        </span>
        <div className="flex items-center gap-2">
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
      </div>

      {/* Body: Side by Side */}
      <div
        className="twin-card__body"
        style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}
      >
        {/* Original */}
        <div
          className="twin-card__profile"
          style={{ padding: "24px", borderRight: "1px solid var(--border-default)" }}
        >
          <h4
            style={{
              fontFamily: "var(--font-body)",
              fontWeight: 600,
              fontSize: "12px",
              color: "var(--text-tertiary)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              marginBottom: "16px",
            }}
          >
            Original Applicant
          </h4>
          <div className="mb-4 text-sm font-medium" style={{ color: "var(--text-primary)" }}>
            Name: {originalName}
          </div>
          <div className="space-y-1 mb-6">
            {Object.entries(originalProfile).map(([key, value]) => (
              <div key={key} className="flex justify-between py-1.5 text-sm" style={{ borderBottom: "1px solid var(--neutral-100)" }}>
                <span style={{ color: "var(--text-secondary)", textTransform: "capitalize" }}>{key.replace(/_/g, " ")}:</span>
                <span style={{ color: "var(--text-primary)" }}>{value}</span>
              </div>
            ))}
          </div>
          <div
            className="outcome-box"
            style={{
              marginTop: "16px",
              padding: "12px 16px",
              borderRadius: "var(--radius-md)",
              fontWeight: 600,
              fontSize: "15px",
              ...getOutcomeStyle(originalOutcomeStatus),
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              {originalOutcomeStatus === "APPROVED" ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
              {originalOutcomeStatus}
            </div>
            <div style={{ fontSize: "13px", opacity: 0.9, fontWeight: 400 }}>{originalOutcomeValue}</div>
          </div>
        </div>

        {/* Twin */}
        <div className="twin-card__profile" style={{ padding: "24px" }}>
          <h4
            style={{
              fontFamily: "var(--font-body)",
              fontWeight: 600,
              fontSize: "12px",
              color: "var(--text-tertiary)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              marginBottom: "16px",
            }}
          >
            Counterfactual Twin
          </h4>
          <div className="mb-4 text-sm font-medium" style={{ color: "var(--text-primary)" }}>
            Name: {twinName}
          </div>
          <div className="space-y-1 mb-6">
            {Object.entries(twinProfile).map(([key, value]) => {
              const isChanged = changedAttributes.includes(key);
              return (
                <div
                  key={key}
                  className={`flex justify-between text-sm ${isChanged ? "profile-row--changed" : ""}`}
                  style={{
                    padding: isChanged ? "6px 8px" : "6px 0",
                    margin: isChanged ? "0 -8px" : "0",
                    background: isChanged ? "var(--severity-amber-bg)" : "transparent",
                    borderRadius: isChanged ? "4px" : "0",
                    borderBottom: isChanged ? "none" : "1px solid var(--neutral-100)",
                  }}
                >
                  <span style={{ color: isChanged ? "var(--severity-amber-text)" : "var(--text-secondary)", textTransform: "capitalize" }}>
                    {key.replace(/_/g, " ")}:
                  </span>
                  <div className="flex items-center gap-2">
                    <span style={{ color: isChanged ? "var(--severity-amber-text)" : "var(--text-primary)", fontWeight: isChanged ? 600 : 400 }}>
                      {value}
                    </span>
                    {isChanged ? (
                      <span style={{ color: "var(--text-tertiary)", fontSize: 11, fontWeight: 600 }}>← CHANGED</span>
                    ) : (
                      <Check className="w-3 h-3" style={{ color: "var(--severity-green-dot)" }} />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <div
            className="outcome-box"
            style={{
              marginTop: "16px",
              padding: "12px 16px",
              borderRadius: "var(--radius-md)",
              fontWeight: 600,
              fontSize: "15px",
              ...getOutcomeStyle(twinOutcomeStatus),
            }}
          >
            <div className="flex items-center gap-2 mb-1">
              {twinOutcomeStatus === "APPROVED" ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
              {twinOutcomeStatus}
            </div>
            <div style={{ fontSize: "13px", opacity: 0.9, fontWeight: 400 }}>{twinOutcomeValue}</div>
          </div>
        </div>
      </div>

      {/* Discrimination Statement */}
      <div
        className="twin-card__statement"
        style={{
          padding: "16px 24px",
          borderTop: "1px solid var(--border-default)",
          fontFamily: "var(--font-display)",
          fontStyle: "italic",
          fontSize: "17px",
          lineHeight: 1.6,
          color: "var(--text-primary)",
          background: "var(--surface-card)",
        }}
      >
        "{discriminationStatement}"
      </div>

      {/* Quality Score */}
      <div
        className="twin-card__quality"
        style={{
          padding: "12px 24px",
          background: "var(--surface-sunken)",
          borderTop: "1px solid var(--border-default)",
          fontSize: "13px",
          color: "var(--text-secondary)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div className="flex items-center gap-3">
          <span>Twin Quality Score: {qualityScore.toFixed(2)}</span>
          <div className="flex gap-0.5">
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: 4,
                  height: 12,
                  background: i < qualityScore * 20 ? "var(--brand-500)" : "var(--neutral-300)",
                  borderRadius: 1,
                }}
              />
            ))}
          </div>
          <span style={{ fontWeight: 500, color: "var(--text-primary)" }}>{qualityLabel}</span>
        </div>
        <div>
          Attributes preserved: {preservedCount}/{totalCount}
          <span className="mx-2">·</span>
          Changed: {changedAttributes.join(", ")} ({changedAttributes.length})
        </div>
      </div>
    </div>
  );
}
