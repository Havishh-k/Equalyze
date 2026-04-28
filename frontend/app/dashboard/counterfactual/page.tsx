"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  ArrowRight,
  AlertTriangle,
  CheckCircle,
  Zap,
  RefreshCw,
  ChevronDown,
} from "lucide-react";

const getApiBase = () => {
  const fromEnv = process.env.NEXT_PUBLIC_API_URL;
  if (fromEnv) return fromEnv;

  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host.includes("equalyze-frontend")) {
      return `https://${host.replace("equalyze-frontend", "equalyze-backend")}/api/v1`;
    }
  }

  return "http://localhost:8000/api/v1";
};

type ModelInfo = {
  key: string;
  label: string;
  domain: string;
  available: boolean;
  protected_attrs: Record<string, { label: string; type: string; flip_values: (string | number)[]; value_labels: Record<string, string> }>;
};

type Result = {
  original_prediction: number;
  original_confidence: number;
  flipped_prediction: number;
  flipped_confidence: number;
  bias_delta: number;
  smoking_gun: boolean;
  original_label: string;
  flipped_label: string;
  flip_attribute_label: string;
  original_attr_display: string;
  flipped_attr_display: string;
};

function ConfidenceGauge({ value, label, color }: { value: number; label: string; color: string }) {
  const pct = Math.round(value * 100);
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ position: "relative", width: 120, height: 120, margin: "0 auto" }}>
        <svg viewBox="0 0 120 120" style={{ transform: "rotate(-90deg)" }}>
          <circle cx="60" cy="60" r="52" fill="none" stroke="var(--neutral-200)" strokeWidth="8" />
          <motion.circle
            cx="60" cy="60" r="52" fill="none" stroke={color} strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 52}`}
            initial={{ strokeDashoffset: 2 * Math.PI * 52 }}
            animate={{ strokeDashoffset: 2 * Math.PI * 52 * (1 - value) }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
        </svg>
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          style={{
            position: "absolute", inset: 0, display: "flex", alignItems: "center",
            justifyContent: "center", flexDirection: "column",
          }}
        >
          <span style={{ fontSize: 28, fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-mono, monospace)" }}>{pct}%</span>
        </motion.div>
      </div>
      <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginTop: 8 }}>{label}</p>
    </div>
  );
}

export default function CounterfactualPage() {
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [profile, setProfile] = useState<Record<string, number | string>>({});
  const [flipAttr, setFlipAttr] = useState<string>("");
  const [flipValue, setFlipValue] = useState<string | number>("");
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingModels, setLoadingModels] = useState(true);
  const [loadError, setLoadError] = useState<string>("");

  // Fetch models
  useEffect(() => {
    const API = getApiBase();
    fetch(`${API}/counterfactual/models`)
      .then((r) => r.json())
      .then((d) => {
        const available = (d.models || []).filter((m: ModelInfo) => m.available);
        setModels(available);
        if (available.length > 0) {
          setSelectedModel(available[0].key);
          setLoadError("");
        } else {
          setLoadError("No trained models are currently available in the backend container.");
        }
      })
      .catch(() => {
        setModels([]);
        setLoadError("Could not connect to the backend. Please verify API URL/deployment.");
      })
      .finally(() => setLoadingModels(false));
  }, []);

  // Fetch sample profile when model changes
  useEffect(() => {
    if (!selectedModel) return;
    const API = getApiBase();
    setResult(null);
    fetch(`${API}/counterfactual/models/${selectedModel}/sample`)
      .then((r) => r.json())
      .then((d) => {
        setProfile(d.profile || {});
        const model = models.find((m) => m.key === selectedModel);
        if (model) {
          const attrs = Object.keys(model.protected_attrs);
          if (attrs.length > 0) {
            setFlipAttr(attrs[0]);
            const vals = model.protected_attrs[attrs[0]].flip_values;
            setFlipValue(vals.length > 1 ? vals[1] : vals[0]);
          }
        }
      })
      .catch(() => {});
  }, [selectedModel, models]);

  const currentModel = models.find((m) => m.key === selectedModel);

  const runExplorer = async () => {
    if (!selectedModel || !flipAttr) return;
    const API = getApiBase();
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`${API}/counterfactual/explore`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model_key: selectedModel, profile, flip_attribute: flipAttr, flip_value: flipValue }),
      });
      const data = await res.json();
      setResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 1080, margin: "0 auto" }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: "var(--space-6, 24px)" }}>
        <div className="flex items-center gap-3" style={{ marginBottom: 4 }}>
          <div style={{ width: 40, height: 40, borderRadius: "var(--radius-lg, 12px)", background: "var(--brand-50)", border: "1px solid var(--brand-200)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Users style={{ width: 20, height: 20, color: "var(--brand-500)" }} />
          </div>
          <div>
            <h1 style={{ fontWeight: 700, fontSize: 26, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>Counterfactual Twin Explorer</h1>
            <p style={{ fontSize: 14, color: "var(--text-secondary)" }}>Prove bias exists — flip one protected attribute and watch the model change its mind.</p>
          </div>
        </div>
      </motion.div>

      {loadingModels ? (
        <div className="card" style={{ padding: 48, textAlign: "center" }}>
          <RefreshCw className="animate-spinner" style={{ width: 24, height: 24, color: "var(--brand-500)", margin: "0 auto 12px" }} />
          <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>Loading trained models...</p>
        </div>
      ) : models.length === 0 ? (
        <div className="card" style={{ padding: 48, textAlign: "center" }}>
          <AlertTriangle style={{ width: 36, height: 36, color: "var(--text-tertiary)", margin: "0 auto 12px" }} />
          <p style={{ color: "var(--text-primary)", fontWeight: 600, fontSize: 15 }}>No trained models found</p>
          <p style={{ color: "var(--text-secondary)", fontSize: 13, marginTop: 4 }}>
            {loadError || "Run train_all_datasets.py first to generate models in trained_models/"}
          </p>
        </div>
      ) : (
        <>
          {/* Controls Row */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card" style={{ padding: "var(--space-5, 20px)", marginBottom: "var(--space-5, 20px)" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 16, alignItems: "end" }}>
              {/* Model Selector */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Model</label>
                <div style={{ position: "relative" }}>
                  <select value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)}
                    style={{ width: "100%", padding: "10px 36px 10px 12px", borderRadius: "var(--radius-md, 8px)", border: "1px solid var(--border-default)", background: "var(--surface-card)", color: "var(--text-primary)", fontSize: 13, fontWeight: 500, appearance: "none", cursor: "pointer" }}>
                    {models.map((m) => (
                      <option key={m.key} value={m.key}>{m.label}</option>
                    ))}
                  </select>
                  <ChevronDown style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", width: 16, height: 16, color: "var(--text-tertiary)", pointerEvents: "none" }} />
                </div>
              </div>

              {/* Protected Attribute */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Flip Attribute</label>
                <div style={{ position: "relative" }}>
                  <select value={flipAttr} onChange={(e) => {
                    setFlipAttr(e.target.value);
                    const vals = currentModel?.protected_attrs[e.target.value]?.flip_values || [];
                    setFlipValue(vals.length > 1 ? vals[1] : vals[0]);
                  }}
                    style={{ width: "100%", padding: "10px 36px 10px 12px", borderRadius: "var(--radius-md, 8px)", border: "1px solid var(--border-default)", background: "var(--surface-card)", color: "var(--text-primary)", fontSize: 13, fontWeight: 500, appearance: "none", cursor: "pointer" }}>
                    {currentModel && Object.entries(currentModel.protected_attrs).map(([k, v]) => (
                      <option key={k} value={k}>{v.label}</option>
                    ))}
                  </select>
                  <ChevronDown style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", width: 16, height: 16, color: "var(--text-tertiary)", pointerEvents: "none" }} />
                </div>
              </div>

              {/* Flip To Value */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Flip To</label>
                <div style={{ position: "relative" }}>
                  <select value={String(flipValue)} onChange={(e) => {
                    const v = e.target.value;
                    setFlipValue(isNaN(Number(v)) ? v : Number(v));
                  }}
                    style={{ width: "100%", padding: "10px 36px 10px 12px", borderRadius: "var(--radius-md, 8px)", border: "1px solid var(--border-default)", background: "var(--surface-card)", color: "var(--text-primary)", fontSize: 13, fontWeight: 500, appearance: "none", cursor: "pointer" }}>
                    {currentModel && currentModel.protected_attrs[flipAttr]?.flip_values.map((v) => {
                      const labels = currentModel.protected_attrs[flipAttr]?.value_labels || {};
                      return <option key={String(v)} value={String(v)}>{labels[String(v)] || String(v)}</option>;
                    })}
                  </select>
                  <ChevronDown style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", width: 16, height: 16, color: "var(--text-tertiary)", pointerEvents: "none" }} />
                </div>
              </div>

              {/* Run Button */}
              <button onClick={runExplorer} disabled={loading} className="btn btn-primary"
                style={{ height: 40, padding: "0 20px", cursor: loading ? "wait" : "pointer", opacity: loading ? 0.7 : 1, whiteSpace: "nowrap" }}>
                {loading ? <RefreshCw className="animate-spinner" style={{ width: 16, height: 16 }} /> : <Zap style={{ width: 16, height: 16 }} />}
                {loading ? "Analyzing..." : "Run Twin Test"}
              </button>
            </div>
          </motion.div>

          {/* Results */}
          <AnimatePresence mode="wait">
            {result && (
              <motion.div key="result" initial={{ opacity: 0, y: 20, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5, ease: "easeOut" }}>

                {/* Smoking Gun Banner */}
                {result.smoking_gun && (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}
                    style={{ padding: "16px 24px", borderRadius: "var(--radius-lg, 12px)", background: "var(--severity-red-bg)", border: "1px solid var(--severity-red-border)", color: "var(--severity-red-text)", marginBottom: 20, display: "flex", alignItems: "center", gap: 12 }}>
                    <AlertTriangle style={{ width: 24, height: 24, flexShrink: 0 }} />
                    <div>
                      <p style={{ fontWeight: 700, fontSize: 16 }}>Smoking Gun Detected</p>
                      <p style={{ fontSize: 13 }}>
                        Changing {result.flip_attribute_label} from &quot;{result.original_attr_display}&quot; to &quot;{result.flipped_attr_display}&quot; flipped the decision from <strong>{result.original_label}</strong> to <strong>{result.flipped_label}</strong>.
                      </p>
                    </div>
                  </motion.div>
                )}

                {!result.smoking_gun && (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}
                    style={{ padding: "16px 24px", borderRadius: "var(--radius-lg, 12px)", background: "var(--severity-green-bg)", border: "1px solid var(--severity-green-border)", color: "var(--severity-green-text)", marginBottom: 20, display: "flex", alignItems: "center", gap: 12 }}>
                    <CheckCircle style={{ width: 24, height: 24, flexShrink: 0 }} />
                    <div>
                      <p style={{ fontWeight: 700, fontSize: 16 }}>No Decision Flip Detected</p>
                      <p style={{ fontSize: 13 }}>
                        The prediction stayed as <strong>{result.original_label}</strong>, though confidence shifted by {(result.bias_delta * 100).toFixed(1)}%.
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Twin Cards */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 0, alignItems: "center" }}>
                  {/* Original Twin */}
                  <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="card"
                    style={{ padding: "var(--space-6, 24px)", borderColor: "var(--brand-200)", position: "relative", overflow: "hidden" }}>
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "var(--brand-500)" }} />
                    <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--brand-500)", marginBottom: 16 }}>Original Profile</p>
                    <ConfidenceGauge value={result.original_confidence} label={result.original_label} color="var(--brand-500)" />
                    <div style={{ marginTop: 16, padding: "12px 16px", borderRadius: "var(--radius-md, 8px)", background: "var(--surface-sunken, #f9fafb)", border: "1px solid var(--border-default)" }}>
                      <p style={{ fontSize: 12, color: "var(--text-secondary)" }}>{result.flip_attribute_label}</p>
                      <p style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>{result.original_attr_display}</p>
                    </div>
                  </motion.div>

                  {/* Arrow */}
                  <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }}
                    style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "0 16px" }}>
                    <ArrowRight style={{ width: 28, height: 28, color: result.smoking_gun ? "var(--severity-red-text)" : "var(--text-tertiary)" }} />
                    <div style={{ padding: "4px 10px", borderRadius: "var(--radius-full, 100px)", background: result.smoking_gun ? "var(--severity-red-bg)" : "var(--neutral-100)", border: `1px solid ${result.smoking_gun ? "var(--severity-red-border)" : "var(--border-default)"}` }}>
                      <span style={{ fontSize: 11, fontWeight: 700, fontFamily: "var(--font-mono, monospace)", color: result.smoking_gun ? "var(--severity-red-text)" : "var(--text-secondary)" }}>
                        {result.bias_delta > 0 ? "+" : ""}{(result.bias_delta * 100).toFixed(1)}%
                      </span>
                    </div>
                  </motion.div>

                  {/* Flipped Twin */}
                  <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="card"
                    style={{ padding: "var(--space-6, 24px)", borderColor: result.smoking_gun ? "var(--severity-red-border)" : "var(--severity-green-border)", position: "relative", overflow: "hidden" }}>
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: result.smoking_gun ? "var(--severity-red-dot)" : "var(--severity-green-dot)" }} />
                    <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: result.smoking_gun ? "var(--severity-red-text)" : "var(--severity-green-text)", marginBottom: 16 }}>Flipped Profile</p>
                    <ConfidenceGauge value={result.flipped_confidence} label={result.flipped_label} color={result.smoking_gun ? "var(--severity-red-dot)" : "var(--severity-green-dot)"} />
                    <div style={{ marginTop: 16, padding: "12px 16px", borderRadius: "var(--radius-md, 8px)", background: result.smoking_gun ? "var(--severity-red-bg)" : "var(--severity-green-bg)", border: `1px solid ${result.smoking_gun ? "var(--severity-red-border)" : "var(--severity-green-border)"}` }}>
                      <p style={{ fontSize: 12, color: "var(--text-secondary)" }}>{result.flip_attribute_label}</p>
                      <p style={{ fontSize: 16, fontWeight: 700, color: result.smoking_gun ? "var(--severity-red-text)" : "var(--severity-green-text)" }}>{result.flipped_attr_display}</p>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}
