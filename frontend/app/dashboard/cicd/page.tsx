"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Terminal, Play, RotateCcw, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api/v1";

interface TerminalLine {
  text: string;
  type: "info" | "success" | "error" | "command" | "divider";
  delay?: number;
}

const PRESETS = {
  compliant: {
    label: "Compliant Model (DIR = 0.92)",
    payload: {
      model_name: "Credit Scoring Model v4.0",
      model_version: "4.0.1",
      disparate_impact_ratio: 0.92,
      equal_opportunity_diff: 0.04,
      statistical_parity_diff: 0.06,
      pipeline_id: "gh-actions-8829",
      commit_sha: "a3f7c2d",
    },
  },
  noncompliant: {
    label: "Non-Compliant Model (DIR = 0.63)",
    payload: {
      model_name: "Resume Screening AI v1.2",
      model_version: "1.2.0",
      disparate_impact_ratio: 0.63,
      equal_opportunity_diff: 0.22,
      statistical_parity_diff: 0.31,
      pipeline_id: "gh-actions-8830",
      commit_sha: "e5b1f9a",
    },
  },
};

export default function CICDGatewayPage() {
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [running, setRunning] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<"compliant" | "noncompliant">("noncompliant");
  const terminalRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [lines]);

  const addLine = (line: TerminalLine) => {
    setLines((prev) => [...prev, line]);
  };

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  const runPipeline = async () => {
    const preset = PRESETS[selectedPreset];
    setRunning(true);
    setLines([]);

    await sleep(200);
    addLine({ text: "$ equalyze-cli deploy --model " + preset.payload.model_name, type: "command" });
    await sleep(400);
    addLine({ text: "───────────────────────────────────────────────────", type: "divider" });
    addLine({ text: "  EQUALYZE CI/CD FAIRNESS GATEWAY v1.0", type: "info" });
    addLine({ text: "  Powered by India DPDPA 2023 Compliance Engine", type: "info" });
    addLine({ text: "───────────────────────────────────────────────────", type: "divider" });
    await sleep(300);
    addLine({ text: `[INFO]  Model: ${preset.payload.model_name}`, type: "info" });
    addLine({ text: `[INFO]  Version: ${preset.payload.model_version}`, type: "info" });
    addLine({ text: `[INFO]  Pipeline: ${preset.payload.pipeline_id}`, type: "info" });
    addLine({ text: `[INFO]  Commit: ${preset.payload.commit_sha}`, type: "info" });
    await sleep(400);
    addLine({ text: "[STEP 1/3]  Validating fairness metrics payload...", type: "info" });
    await sleep(600);
    addLine({ text: `[STEP 2/3]  Disparate Impact Ratio: ${preset.payload.disparate_impact_ratio.toFixed(4)}`, type: "info" });
    addLine({ text: "[STEP 3/3]  Checking against DPDPA threshold (0.80)...", type: "info" });
    await sleep(800);

    // Make real API call
    try {
      const token = user ? await (user as any).getIdToken?.() : null;
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE}/cicd-gate`, {
        method: "POST",
        headers,
        body: JSON.stringify(preset.payload),
      });

      if (res.status === 403) {
        const err = await res.json();
        const detail = err.detail || {};
        addLine({ text: "", type: "divider" });
        addLine({ text: "╔══════════════════════════════════════════════════╗", type: "error" });
        addLine({ text: "║  ✖  DEPLOYMENT BLOCKED — FAIRNESS VIOLATION     ║", type: "error" });
        addLine({ text: "╚══════════════════════════════════════════════════╝", type: "error" });
        addLine({ text: "", type: "divider" });
        addLine({ text: `[FAIL]  HTTP 403 Forbidden`, type: "error" });
        addLine({ text: `[FAIL]  ${detail.violation || "Fairness threshold violated"}`, type: "error" });
        addLine({ text: `[FAIL]  Regulation: ${detail.regulation || "DPDPA 2023"}`, type: "error" });
        addLine({ text: `[FAIL]  Required Action: ${detail.required_action || "Retrain model"}`, type: "error" });
        addLine({ text: "", type: "divider" });
        addLine({ text: "Pipeline terminated. Deployment to production DENIED.", type: "error" });
      } else if (res.ok) {
        const data = await res.json();
        addLine({ text: "", type: "divider" });
        addLine({ text: "╔══════════════════════════════════════════════════╗", type: "success" });
        addLine({ text: "║  ✔  DEPLOYMENT AUTHORIZED — FAIRNESS COMPLIANT  ║", type: "success" });
        addLine({ text: "╚══════════════════════════════════════════════════╝", type: "success" });
        addLine({ text: "", type: "divider" });
        addLine({ text: `[PASS]  HTTP 200 OK`, type: "success" });
        addLine({ text: `[PASS]  ${data.message}`, type: "success" });
        addLine({ text: `[PASS]  Regulation: ${data.regulation}`, type: "success" });
        addLine({ text: "", type: "divider" });
        addLine({ text: "Pipeline complete. Model deployed to production.", type: "success" });
      } else {
        addLine({ text: `[ERROR]  Unexpected response: HTTP ${res.status}`, type: "error" });
      }
    } catch (err: any) {
      addLine({ text: `[ERROR]  Network error: ${err.message}`, type: "error" });
    }

    setRunning(false);
  };

  const getLineColor = (type: TerminalLine["type"]): string => {
    switch (type) {
      case "error": return "#EF4444";
      case "success": return "#22C55E";
      case "command": return "#60A5FA";
      case "divider": return "#374151";
      default: return "#9CA3AF";
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-6">
      {/* Header */}
      <div>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "var(--text-h1)",
            color: "var(--text-primary)",
            marginBottom: "var(--space-2)",
          }}
        >
          CI/CD Fairness Gateway
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "var(--text-body)" }}>
          Simulate a deployment pipeline. Models that fail the India DPDPA Disparate Impact threshold (0.80) are automatically blocked.
        </p>
      </div>

      {/* Preset Selector */}
      <div className="card p-6">
        <label className="text-sm font-semibold block mb-4" style={{ color: "var(--text-primary)" }}>
          Select a test payload:
        </label>
        <div className="grid grid-cols-2 gap-3">
          {(Object.entries(PRESETS) as [keyof typeof PRESETS, typeof PRESETS[keyof typeof PRESETS]][]).map(
            ([key, preset]) => (
              <button
                key={key}
                onClick={() => setSelectedPreset(key)}
                className="p-4 rounded-lg text-left transition-all"
                style={{
                  background: selectedPreset === key ? (key === "compliant" ? "var(--severity-green-bg)" : "var(--severity-red-bg)") : "var(--surface-sunken)",
                  border: `1px solid ${selectedPreset === key ? (key === "compliant" ? "var(--severity-green-border)" : "var(--severity-red-border)") : "var(--border-default)"}`,
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  {key === "compliant" ? (
                    <CheckCircle className="w-4 h-4" style={{ color: "var(--severity-green-dot)" }} />
                  ) : (
                    <XCircle className="w-4 h-4" style={{ color: "var(--severity-red-dot)" }} />
                  )}
                  <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                    {preset.label}
                  </span>
                </div>
                <p className="text-xs font-mono mt-1" style={{ color: "var(--text-muted)" }}>
                  {preset.payload.model_name} v{preset.payload.model_version}
                </p>
              </button>
            )
          )}
        </div>
      </div>

      {/* Terminal */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ border: "1px solid var(--border-default)" }}
      >
        {/* Terminal header bar */}
        <div
          className="flex items-center justify-between px-4 py-2.5"
          style={{ background: "#1F2937", borderBottom: "1px solid #374151" }}
        >
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <span className="w-3 h-3 rounded-full" style={{ background: "#EF4444" }} />
              <span className="w-3 h-3 rounded-full" style={{ background: "#F59E0B" }} />
              <span className="w-3 h-3 rounded-full" style={{ background: "#22C55E" }} />
            </div>
            <span className="text-xs font-mono ml-2" style={{ color: "#9CA3AF" }}>
              equalyze-ci — bash
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLines([])}
              className="p-1 rounded hover:bg-white/10 transition-colors"
              title="Clear terminal"
            >
              <RotateCcw className="w-3.5 h-3.5" style={{ color: "#9CA3AF" }} />
            </button>
          </div>
        </div>

        {/* Terminal body */}
        <div
          ref={terminalRef}
          className="p-4 font-mono text-sm overflow-y-auto"
          style={{
            background: "#111827",
            minHeight: 300,
            maxHeight: 500,
            lineHeight: 1.7,
          }}
        >
          {lines.length === 0 && (
            <div style={{ color: "#6B7280" }}>
              <p>Welcome to the Equalyze CI/CD Fairness Gateway.</p>
              <p>Select a payload and click &quot;Run Pipeline&quot; to simulate a deployment.</p>
              <p className="mt-2">$ _</p>
            </div>
          )}
          {lines.map((line, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.15 }}
              style={{ color: getLineColor(line.type) }}
            >
              {line.text || "\u00A0"}
            </motion.div>
          ))}
          {running && (
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
              style={{ color: "#60A5FA" }}
            >
              █
            </motion.span>
          )}
        </div>
      </div>

      {/* Run Button */}
      <button
        onClick={runPipeline}
        disabled={running}
        className="btn btn-primary w-full py-3 text-base flex justify-center items-center gap-2"
      >
        {running ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Running Pipeline...
          </>
        ) : (
          <>
            <Play className="w-4 h-4" />
            Run Deployment Pipeline
          </>
        )}
      </button>
    </div>
  );
}
