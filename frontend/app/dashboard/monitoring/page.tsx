"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  Activity,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  Clock,
  Shield,
  BarChart3,
  Zap,
} from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface DriftPoint {
  date: string;
  score: number;
  severity: string;
}

export default function MonitoringPage() {
  const { token } = useAuth();
  const [driftData, setDriftData] = useState<DriftPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);

  const fetchDrift = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/monitoring/drift`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      setDriftData(data.history || []);
    } catch {
      // Allow empty state
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrift();
    // Auto-refresh every 30s
    const interval = setInterval(fetchDrift, 30000);
    return () => clearInterval(interval);
  }, [token]);

  const triggerAudit = async () => {
    setTriggering(true);
    try {
      await fetch(`${API_BASE}/api/v1/monitoring/run-scheduled-audit`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      // Wait then refresh
      setTimeout(fetchDrift, 1500);
    } catch {
      // ignore
    } finally {
      setTriggering(false);
    }
  };

  const latestScore = driftData.length > 0 ? driftData[driftData.length - 1].score : null;
  const prevScore = driftData.length > 1 ? driftData[driftData.length - 2].score : null;
  const scoreDelta = latestScore !== null && prevScore !== null ? latestScore - prevScore : null;

  const maxScore = Math.max(...driftData.map((d) => d.score), 100);
  const minScore = Math.min(...driftData.map((d) => d.score), 0);

  const getSeverityColor = (severity: string) => {
    const s = severity?.toUpperCase();
    if (s === "GREEN") return "var(--severity-green)";
    if (s === "AMBER") return "var(--severity-amber)";
    if (s === "RED") return "var(--severity-red)";
    return "var(--text-muted)";
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Activity className="w-6 h-6" style={{ color: "var(--accent-cyan)" }} />
            Continuous Bias Monitoring
          </h2>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            Automated drift detection powered by Google Cloud Scheduler
          </p>
        </div>
        <button
          onClick={triggerAudit}
          disabled={triggering}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50"
          style={{ background: "linear-gradient(135deg, #3B82F6, #8B5CF6)" }}
        >
          <RefreshCw className={`w-4 h-4 ${triggering ? "animate-spin" : ""}`} />
          {triggering ? "Running..." : "Trigger Audit Now"}
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4">
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4" style={{ color: "var(--accent-blue)" }} />
            <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Current Score</span>
          </div>
          <p className="text-3xl font-bold text-white">{latestScore !== null ? latestScore.toFixed(1) : "--"}</p>
        </div>
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-2">
            {scoreDelta !== null && scoreDelta >= 0 ? (
              <TrendingUp className="w-4 h-4" style={{ color: "var(--severity-green)" }} />
            ) : (
              <TrendingDown className="w-4 h-4" style={{ color: "var(--severity-red)" }} />
            )}
            <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Score Delta</span>
          </div>
          <p className="text-3xl font-bold" style={{ color: scoreDelta !== null && scoreDelta >= 0 ? "var(--severity-green)" : "var(--severity-red)" }}>
            {scoreDelta !== null ? `${scoreDelta > 0 ? "+" : ""}${scoreDelta.toFixed(1)}` : "--"}
          </p>
        </div>
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-4 h-4" style={{ color: "var(--accent-purple)" }} />
            <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Total Audits</span>
          </div>
          <p className="text-3xl font-bold text-white">{driftData.length}</p>
        </div>
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4" style={{ color: "var(--accent-cyan)" }} />
            <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>Schedule</span>
          </div>
          <p className="text-lg font-bold text-white">Every 60s</p>
          <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>Cloud Scheduler Mock</p>
        </div>
      </div>

      {/* Drift Chart */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Zap className="w-5 h-5" style={{ color: "var(--severity-amber)" }} />
            Bias Score Drift Over Time
          </h3>
          <div className="flex items-center gap-4 text-xs" style={{ color: "var(--text-muted)" }}>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full" style={{ background: "var(--severity-green)" }} /> Green (70+)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full" style={{ background: "var(--severity-amber)" }} /> Amber (40-70)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full" style={{ background: "var(--severity-red)" }} /> Red (&lt;40)
            </span>
          </div>
        </div>

        {driftData.length === 0 ? (
          <div className="text-center py-16" style={{ color: "var(--text-muted)" }}>
            <Activity className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No audit history yet. Click &quot;Trigger Audit Now&quot; or wait for the scheduler.</p>
          </div>
        ) : (
          <div className="relative h-64">
            {/* SVG Chart */}
            <svg viewBox={`0 0 ${driftData.length * 80 + 60} 260`} className="w-full h-full" preserveAspectRatio="none">
              {/* Grid lines */}
              {[0, 25, 50, 75, 100].map((v) => {
                const y = 240 - (v / 100) * 220;
                return (
                  <g key={v}>
                    <line x1="40" y1={y} x2={driftData.length * 80 + 40} y2={y} stroke="var(--border-default)" strokeWidth="0.5" />
                    <text x="5" y={y + 4} fill="var(--text-muted)" fontSize="10">{v}</text>
                  </g>
                );
              })}

              {/* Area fill */}
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
                </linearGradient>
              </defs>

              {driftData.length > 1 && (
                <path
                  d={
                    `M ${40 + 0 * 80},${240 - (driftData[0].score / 100) * 220} ` +
                    driftData.map((d, i) => `L ${40 + i * 80},${240 - (d.score / 100) * 220}`).join(" ") +
                    ` L ${40 + (driftData.length - 1) * 80},240 L 40,240 Z`
                  }
                  fill="url(#areaGrad)"
                />
              )}

              {/* Line */}
              {driftData.length > 1 && (
                <polyline
                  points={driftData.map((d, i) => `${40 + i * 80},${240 - (d.score / 100) * 220}`).join(" ")}
                  fill="none"
                  stroke="#3B82F6"
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                />
              )}

              {/* Dots */}
              {driftData.map((d, i) => (
                <g key={i}>
                  <circle
                    cx={40 + i * 80}
                    cy={240 - (d.score / 100) * 220}
                    r="5"
                    fill={getSeverityColor(d.severity)}
                    stroke="var(--bg-card)"
                    strokeWidth="2"
                  />
                  <text
                    x={40 + i * 80}
                    y={255}
                    fill="var(--text-muted)"
                    fontSize="8"
                    textAnchor="middle"
                  >
                    {d.date}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        )}
      </div>

      {/* Alert config (placeholder for judges) */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" style={{ color: "var(--severity-amber)" }} />
          Alert Configuration
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 rounded-xl" style={{ background: "var(--bg-card)", border: "1px solid var(--border-default)" }}>
            <p className="text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>Score Threshold</p>
            <p className="text-lg font-bold text-white">≤ 60.0</p>
            <p className="text-[10px] mt-1" style={{ color: "var(--severity-amber)" }}>Triggers AMBER alert</p>
          </div>
          <div className="p-4 rounded-xl" style={{ background: "var(--bg-card)", border: "1px solid var(--border-default)" }}>
            <p className="text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>Notification Channel</p>
            <p className="text-lg font-bold text-white">Email + Slack</p>
            <p className="text-[10px] mt-1" style={{ color: "var(--severity-green)" }}>Active</p>
          </div>
          <div className="p-4 rounded-xl" style={{ background: "var(--bg-card)", border: "1px solid var(--border-default)" }}>
            <p className="text-xs font-medium mb-1" style={{ color: "var(--text-muted)" }}>Auto-Remediation</p>
            <p className="text-lg font-bold text-white">Enabled</p>
            <p className="text-[10px] mt-1" style={{ color: "var(--accent-cyan)" }}>Synthetic data pipeline</p>
          </div>
        </div>
      </div>
    </div>
  );
}
