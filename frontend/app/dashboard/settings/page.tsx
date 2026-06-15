"use client";

import { useAuth } from "@/lib/auth-context";
import { User, Building2, Bell, Shield, Key } from "lucide-react";

export default function SettingsPage() {
  const { user } = useAuth();

  const sectionStyle: React.CSSProperties = {
    background: "var(--surface-card)",
    border: "1px solid var(--border-default)",
    borderRadius: "var(--radius-lg)",
    boxShadow: "var(--shadow-sm)",
    overflow: "hidden",
  };

  const sectionHeaderStyle: React.CSSProperties = {
    padding: "var(--space-5) var(--space-6)",
    borderBottom: "1px solid var(--border-default)",
    display: "flex",
    alignItems: "center",
    gap: "var(--space-3)",
  };

  const sectionBodyStyle: React.CSSProperties = {
    padding: "var(--space-6)",
  };

  const fieldRowStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "var(--space-4) 0",
    borderBottom: "1px solid var(--neutral-100)",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 14,
    fontWeight: 500,
    color: "var(--text-primary)",
  };

  const valueStyle: React.CSSProperties = {
    fontSize: 14,
    color: "var(--text-secondary)",
    fontFamily: "var(--font-mono)",
  };

  return (
    <div style={{ maxWidth: 720 }}>
      {/* Page Header */}
      <div style={{ marginBottom: "var(--space-8)" }}>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 28,
            fontWeight: 400,
            color: "var(--text-primary)",
            marginBottom: "var(--space-2)",
          }}
        >
          Settings
        </h1>
        <p style={{ fontSize: 14, color: "var(--text-secondary)" }}>
          Manage your account, organization, and notification preferences.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
        {/* ── Profile ───────────────────── */}
        <div style={sectionStyle}>
          <div style={sectionHeaderStyle}>
            <User style={{ width: 18, height: 18, color: "var(--brand-500)" }} />
            <span style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)" }}>
              Profile
            </span>
          </div>
          <div style={sectionBodyStyle}>
            <div style={fieldRowStyle}>
              <span style={labelStyle}>Name</span>
              <span style={valueStyle}>
                {user?.displayName || user?.email?.split("@")[0] || "—"}
              </span>
            </div>
            <div style={fieldRowStyle}>
              <span style={labelStyle}>Email</span>
              <span style={valueStyle}>{user?.email || "—"}</span>
            </div>
            <div style={{ ...fieldRowStyle, borderBottom: "none" }}>
              <span style={labelStyle}>Role</span>
              <span
                className="severity-badge severity-badge--green"
                style={{ fontSize: 12 }}
              >
                <span className="severity-dot" aria-hidden="true" />
                {(user as any)?.role || "DATA_SCIENTIST"}
              </span>
            </div>
          </div>
        </div>

        {/* ── Organization ──────────────── */}
        <div style={sectionStyle}>
          <div style={sectionHeaderStyle}>
            <Building2 style={{ width: 18, height: 18, color: "var(--brand-500)" }} />
            <span style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)" }}>
              Organization
            </span>
          </div>
          <div style={sectionBodyStyle}>
            <div style={fieldRowStyle}>
              <span style={labelStyle}>Organization</span>
              <span style={valueStyle}>Equalyze Demo Org</span>
            </div>
            <div style={fieldRowStyle}>
              <span style={labelStyle}>Plan</span>
              <span
                style={{
                  ...valueStyle,
                  background: "var(--brand-50)",
                  color: "var(--brand-600)",
                  padding: "2px 10px",
                  borderRadius: "var(--radius-full)",
                  fontSize: 12,
                  fontWeight: 600,
                  fontFamily: "var(--font-body)",
                }}
              >
                Enterprise
              </span>
            </div>
            <div style={{ ...fieldRowStyle, borderBottom: "none" }}>
              <span style={labelStyle}>Audit Quota</span>
              <span style={valueStyle}>Unlimited</span>
            </div>
          </div>
        </div>

        {/* ── Notifications ────────────── */}
        <div style={sectionStyle}>
          <div style={sectionHeaderStyle}>
            <Bell style={{ width: 18, height: 18, color: "var(--brand-500)" }} />
            <span style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)" }}>
              Notifications
            </span>
          </div>
          <div style={sectionBodyStyle}>
            {[
              { label: "Audit completed", enabled: true },
              { label: "Severity threshold breached", enabled: true },
              { label: "Monitoring drift alerts", enabled: true },
              { label: "Weekly compliance digest", enabled: false },
            ].map((pref, i, arr) => (
              <div
                key={pref.label}
                style={{
                  ...fieldRowStyle,
                  borderBottom: i === arr.length - 1 ? "none" : fieldRowStyle.borderBottom,
                }}
              >
                <span style={labelStyle}>{pref.label}</span>
                <div
                  style={{
                    width: 40,
                    height: 22,
                    borderRadius: "var(--radius-full)",
                    background: pref.enabled ? "var(--severity-green-dot)" : "var(--neutral-300)",
                    position: "relative",
                    cursor: "pointer",
                    transition: "background var(--transition-base)",
                  }}
                >
                  <div
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: "50%",
                      background: "white",
                      position: "absolute",
                      top: 3,
                      left: pref.enabled ? 21 : 3,
                      transition: "left var(--transition-base)",
                      boxShadow: "var(--shadow-xs)",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Security ─────────────────── */}
        <div style={sectionStyle}>
          <div style={sectionHeaderStyle}>
            <Shield style={{ width: 18, height: 18, color: "var(--brand-500)" }} />
            <span style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)" }}>
              Security
            </span>
          </div>
          <div style={sectionBodyStyle}>
            <div style={fieldRowStyle}>
              <span style={labelStyle}>Authentication</span>
              <span style={valueStyle}>Firebase Auth (Google OAuth)</span>
            </div>
            <div style={{ ...fieldRowStyle, borderBottom: "none" }}>
              <div>
                <span style={labelStyle}>API Key</span>
                <p style={{ fontSize: 12, color: "var(--text-tertiary)", marginTop: 2 }}>
                  For programmatic access to the Equalyze API
                </p>
              </div>
              <button className="btn btn-secondary" style={{ height: 32, fontSize: 13 }}>
                <Key style={{ width: 14, height: 14 }} />
                Generate Key
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
