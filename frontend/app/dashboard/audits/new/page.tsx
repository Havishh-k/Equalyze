"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Upload,
  FileSpreadsheet,
  CheckCircle,
  Tag,
  Rocket,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Shield,
  Eye,
  X,
  Loader2,
  Building2,
} from "lucide-react";
import {
  uploadDataset,
  getSchemaSuggestions,
  createAudit,
  type SchemaMap,
  type ColumnTag,
  type ProxyWarning,
} from "@/lib/api";

type Step = 1 | 2 | 3;

const DOMAINS = [
  { value: "healthcare", label: "Healthcare / Insurance", icon: "🏥" },
  { value: "lending", label: "MSME Lending / Finance", icon: "🏦" },
  { value: "insurance", label: "Insurance", icon: "🛡️" },
  { value: "hiring", label: "Hiring / HR", icon: "👥" },
  { value: "other", label: "Other", icon: "📊" },
];

export default function NewAuditPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);

  // Step 1 state
  const [file, setFile] = useState<File | null>(null);
  const [domain, setDomain] = useState("healthcare");
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{
    dataset_id: string;
    filename: string;
    row_count: number;
    column_count: number;
    column_names: string[];
    sample_data: Record<string, unknown>[];
  } | null>(null);

  // Step 2 state
  const [schemaLoading, setSchemaLoading] = useState(false);
  const [schemaMap, setSchemaMap] = useState<SchemaMap | null>(null);
  const [columnTags, setColumnTags] = useState<ColumnTag[]>([]);
  const [proxyWarnings, setProxyWarnings] = useState<ProxyWarning[]>([]);

  // Step 3 state
  const [orgName, setOrgName] = useState("Acme Healthcare Ltd.");
  const [modelName, setModelName] = useState("Insurance Premium Model v2.1");
  const [launching, setLaunching] = useState(false);

  // Drag & drop
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) setFile(droppedFile);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setFile(e.target.files[0]);
  };

  // Step 1 → Step 2
  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const uploadInit = await uploadDataset(file, domain);
      
      // Poll for readiness
      let isReady = false;
      let finalData = null;
      while (!isReady) {
        await new Promise(r => setTimeout(r, 2000));
        const statusCheck = await import('@/lib/api').then(m => m.getDatasetStatus(uploadInit.dataset_id));
        if (statusCheck.status === "READY") {
          isReady = true;
          finalData = statusCheck;
        } else if (statusCheck.status === "FAILED") {
          throw new Error(statusCheck.error || "Dataset processing failed in background");
        }
      }

      setUploadResult({
        dataset_id: finalData.dataset_id,
        filename: finalData.filename,
        row_count: finalData.row_count!,
        column_count: finalData.column_count!,
        column_names: finalData.column_names!,
        sample_data: finalData.sample_data!
      });
      
      // Auto-fetch schema suggestions
      setSchemaLoading(true);
      setStep(2);
      
      const schemaResult = await getSchemaSuggestions(uploadInit.dataset_id);
      setSchemaMap(schemaResult.schema_map);
      setColumnTags(schemaResult.schema_map.column_tags || []);
      setProxyWarnings(schemaResult.schema_map.proxy_warnings || []);
    } catch (err) {
      alert(`Upload failed: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setUploading(false);
      setSchemaLoading(false);
    }
  };

  // Toggle column tag
  const toggleColumnTag = (colName: string, newTag: string) => {
    if (!schemaMap) return;
    
    const updated = { ...schemaMap };
    // Remove from all categories
    updated.protected_attributes = updated.protected_attributes.filter((c) => c !== colName);
    updated.valid_factors = updated.valid_factors.filter((c) => c !== colName);
    if (updated.outcome === colName) updated.outcome = "";
    
    // Add to new category
    if (newTag === "PROTECTED_ATTRIBUTE") updated.protected_attributes.push(colName);
    else if (newTag === "VALID_FACTOR") updated.valid_factors.push(colName);
    else if (newTag === "OUTCOME") updated.outcome = colName;
    
    setSchemaMap(updated);
  };

  const getColumnCategory = (colName: string): string => {
    if (!schemaMap) return "METADATA";
    if (schemaMap.protected_attributes.includes(colName)) return "PROTECTED_ATTRIBUTE";
    if (schemaMap.valid_factors.includes(colName)) return "VALID_FACTOR";
    if (schemaMap.outcome === colName) return "OUTCOME";
    if (schemaMap.identifier === colName) return "IDENTIFIER";
    return "METADATA";
  };

  // Step 3 → Launch
  const handleLaunch = async () => {
    if (!uploadResult || !schemaMap) return;
    setLaunching(true);
    try {
      const result = await createAudit({
        dataset_id: uploadResult.dataset_id,
        schema_map: schemaMap,
        model_metadata: {
          organization_name: orgName,
          model_name: modelName,
          domain: domain,
          model_type: "classification",
          jurisdiction: ["india", "eu", "usa"],
        },
      });
      router.push(`/dashboard/audits/${result.audit_id}`);
    } catch (err) {
      alert(`Launch failed: ${err instanceof Error ? err.message : "Unknown error"}`);
      setLaunching(false);
    }
  };

  const TAG_COLORS: Record<string, { bg: string; border: string; text: string; label: string }> = {
    PROTECTED_ATTRIBUTE: { bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.25)", text: "#EF4444", label: "Protected" },
    VALID_FACTOR: { bg: "rgba(59,130,246,0.1)", border: "rgba(59,130,246,0.25)", text: "#3B82F6", label: "Valid Factor" },
    OUTCOME: { bg: "rgba(139,92,246,0.1)", border: "rgba(139,92,246,0.25)", text: "#8B5CF6", label: "Outcome" },
    IDENTIFIER: { bg: "rgba(100,116,139,0.1)", border: "rgba(100,116,139,0.25)", text: "#64748B", label: "ID" },
    METADATA: { bg: "rgba(100,116,139,0.06)", border: "rgba(100,116,139,0.15)", text: "#475569", label: "Metadata" },
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* ── Progress Steps ────────────────── */}
      <div className="flex items-center gap-4 mb-10">
        {[
          { n: 1, label: "Upload Dataset", icon: Upload },
          { n: 2, label: "Map Schema", icon: Tag },
          { n: 3, label: "Launch Audit", icon: Rocket },
        ].map((s, i) => (
          <div key={s.n} className="flex items-center gap-3 flex-1">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold transition-all"
              style={{
                background: step >= s.n ? "linear-gradient(135deg, #3B82F6, #8B5CF6)" : "var(--bg-card)",
                color: step >= s.n ? "white" : "var(--text-muted)",
                border: step >= s.n ? "none" : "1px solid var(--border-default)",
              }}
            >
              {step > s.n ? <CheckCircle className="w-5 h-5" /> : <s.icon className="w-5 h-5" />}
            </div>
            <span className="text-sm font-medium hidden md:inline" style={{ color: step >= s.n ? "white" : "var(--text-muted)" }}>
              {s.label}
            </span>
            {i < 2 && (
              <div className="flex-1 h-px" style={{ background: step > s.n ? "var(--accent-blue)" : "var(--border-default)" }} />
            )}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* ── Step 1: Upload ──────────────── */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* Domain selector */}
            <div>
              <label className="text-sm font-medium text-white mb-3 block">
                What domain is this AI model deployed in?
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {DOMAINS.map((d) => (
                  <button
                    key={d.value}
                    onClick={() => setDomain(d.value)}
                    className="p-4 rounded-xl text-left transition-all"
                    style={{
                      background: domain === d.value ? "rgba(59,130,246,0.1)" : "var(--bg-card)",
                      border: domain === d.value ? "1px solid rgba(59,130,246,0.3)" : "1px solid var(--border-default)",
                    }}
                  >
                    <span className="text-lg">{d.icon}</span>
                    <p className="text-sm font-medium mt-1" style={{ color: domain === d.value ? "white" : "var(--text-secondary)" }}>
                      {d.label}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* File upload */}
            <div>
              <label className="text-sm font-medium text-white mb-3 block">
                Upload your model&apos;s prediction dataset
              </label>
              <div
                className={`dropzone ${isDragging ? "active" : ""}`}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => document.getElementById("file-input")?.click()}
              >
                <input
                  id="file-input"
                  type="file"
                  accept=".csv,.xlsx,.xls,.json"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                {file ? (
                  <div className="flex items-center justify-center gap-3">
                    <FileSpreadsheet className="w-8 h-8" style={{ color: "var(--accent-blue)" }} />
                    <div className="text-left">
                      <p className="text-sm font-semibold text-white">{file.name}</p>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); setFile(null); }}
                      className="ml-2 p-1 rounded-lg hover:bg-white/5"
                    >
                      <X className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload className="w-10 h-10 mx-auto mb-3" style={{ color: "var(--text-muted)" }} />
                    <p className="text-sm font-medium text-white">
                      Drag & drop your CSV file here
                    </p>
                    <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                      Supports CSV, XLSX, JSON · Max 500MB
                    </p>
                  </>
                )}
              </div>
            </div>

            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="w-full py-3.5 rounded-xl text-sm font-semibold text-white transition-all hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
              style={{ background: "linear-gradient(135deg, #3B82F6, #2563EB)" }}
            >
              {uploading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Uploading & Analyzing...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Upload & Analyze
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </button>
          </motion.div>
        )}

        {/* ── Step 2: Schema Mapping ─────── */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {schemaLoading ? (
              <div className="text-center py-20">
                <Loader2 className="w-10 h-10 animate-spin mx-auto mb-4" style={{ color: "var(--accent-blue)" }} />
                <p className="text-sm font-medium text-white">
                  AI is analyzing your dataset columns...
                </p>
                <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                  Auto-detecting protected attributes, valid factors, and outcomes
                </p>
              </div>
            ) : (
              <>
                {/* Dataset summary */}
                {uploadResult && (
                  <div className="glass-card p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <FileSpreadsheet className="w-5 h-5" style={{ color: "var(--accent-blue)" }} />
                      <span className="text-sm font-semibold text-white">{uploadResult.filename}</span>
                    </div>
                    <div className="flex gap-6 text-xs" style={{ color: "var(--text-secondary)" }}>
                      <span>{uploadResult.row_count.toLocaleString()} rows</span>
                      <span>{uploadResult.column_count} columns</span>
                    </div>
                  </div>
                )}

                {/* Proxy warnings */}
                {proxyWarnings.length > 0 && (
                  <div className="p-4 rounded-xl" style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)" }}>
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4" style={{ color: "var(--severity-amber)" }} />
                      <span className="text-sm font-semibold" style={{ color: "var(--severity-amber)" }}>
                        Proxy Variables Detected
                      </span>
                    </div>
                    {proxyWarnings.map((pw, i) => (
                      <p key={i} className="text-xs ml-6" style={{ color: "var(--text-secondary)" }}>
                        <strong className="text-white">{pw.column}</strong> correlates with{" "}
                        <strong style={{ color: "var(--severity-red)" }}>{pw.correlated_with}</strong>{" "}
                        (r = {pw.correlation_coefficient.toFixed(3)}) — {pw.severity} risk
                      </p>
                    ))}
                  </div>
                )}

                {/* Column tag editor */}
                <div>
                  <h3 className="text-sm font-semibold text-white mb-3">
                    Column Classification
                    <span className="font-normal ml-2" style={{ color: "var(--text-muted)" }}>
                      (click to change)
                    </span>
                  </h3>
                  <div className="space-y-2">
                    {uploadResult?.column_names.map((col) => {
                      const category = getColumnCategory(col);
                      const tagInfo = TAG_COLORS[category] || TAG_COLORS.METADATA;
                      const tagOptions = Object.entries(TAG_COLORS);

                      return (
                        <div
                          key={col}
                          className="flex items-center gap-3 p-3 rounded-xl"
                          style={{ background: "var(--bg-card)", border: "1px solid var(--border-default)" }}
                        >
                          <span className="text-sm font-mono font-medium text-white flex-1 min-w-0 truncate">
                            {col}
                          </span>
                          <div className="flex gap-1.5 flex-shrink-0">
                            {tagOptions.map(([tag, info]) => (
                              <button
                                key={tag}
                                onClick={() => toggleColumnTag(col, tag)}
                                className="px-2 py-1 rounded-md text-[10px] font-semibold transition-all"
                                style={{
                                  background: category === tag ? info.bg : "transparent",
                                  border: `1px solid ${category === tag ? info.border : "transparent"}`,
                                  color: category === tag ? info.text : "var(--text-muted)",
                                  opacity: category === tag ? 1 : 0.5,
                                }}
                              >
                                {info.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2"
                    style={{ color: "var(--text-secondary)", border: "1px solid var(--border-default)" }}
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    disabled={!schemaMap?.outcome || schemaMap.protected_attributes.length === 0}
                    className="flex-[2] py-3 rounded-xl text-sm font-semibold text-white transition-all hover:scale-[1.02] disabled:opacity-50"
                    style={{ background: "linear-gradient(135deg, #3B82F6, #2563EB)" }}
                  >
                    <span className="flex items-center justify-center gap-2">
                      Confirm Schema
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </button>
                </div>
              </>
            )}
          </motion.div>
        )}

        {/* ── Step 3: Review & Launch ────── */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* Model metadata */}
            <div className="glass-card p-6 space-y-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Building2 className="w-4 h-4" style={{ color: "var(--accent-blue)" }} />
                Model Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium block mb-1.5" style={{ color: "var(--text-secondary)" }}>
                    Organization Name
                  </label>
                  <input
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl text-sm text-white outline-none"
                    style={{ background: "var(--bg-card)", border: "1px solid var(--border-default)" }}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium block mb-1.5" style={{ color: "var(--text-secondary)" }}>
                    Model Name
                  </label>
                  <input
                    value={modelName}
                    onChange={(e) => setModelName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl text-sm text-white outline-none"
                    style={{ background: "var(--bg-card)", border: "1px solid var(--border-default)" }}
                  />
                </div>
              </div>
            </div>

            {/* Audit summary */}
            <div className="glass-card p-6">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <Eye className="w-4 h-4" style={{ color: "var(--accent-purple)" }} />
                Audit Configuration
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p style={{ color: "var(--text-muted)" }}>Dataset</p>
                  <p className="font-medium text-white">{uploadResult?.filename}</p>
                </div>
                <div>
                  <p style={{ color: "var(--text-muted)" }}>Domain</p>
                  <p className="font-medium text-white">{DOMAINS.find((d) => d.value === domain)?.label}</p>
                </div>
                <div>
                  <p style={{ color: "var(--text-muted)" }}>Protected Attributes</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {schemaMap?.protected_attributes.map((a) => (
                      <span key={a} className="px-2 py-0.5 rounded text-[10px] font-semibold severity-red">
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p style={{ color: "var(--text-muted)" }}>Outcome Variable</p>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold" style={{ background: "rgba(139,92,246,0.1)", color: "#8B5CF6", border: "1px solid rgba(139,92,246,0.25)" }}>
                    {schemaMap?.outcome}
                  </span>
                </div>
                <div>
                  <p style={{ color: "var(--text-muted)" }}>Jurisdictions</p>
                  <p className="font-medium text-white text-xs">India, EU, USA</p>
                </div>
                <div>
                  <p style={{ color: "var(--text-muted)" }}>Rows</p>
                  <p className="font-medium text-white">{uploadResult?.row_count.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* What will happen */}
            <div className="p-4 rounded-xl" style={{ background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.15)" }}>
              <p className="text-xs font-medium mb-2" style={{ color: "var(--accent-blue)" }}>
                What happens next:
              </p>
              <ul className="space-y-1 text-xs" style={{ color: "var(--text-secondary)" }}>
                <li>✓ 5 fairness metrics computed across all protected attributes</li>
                <li>✓ Counterfactual twins generated to prove detected discrimination</li>
                <li>✓ Legal exposure mapped to DPDPA, EU AI Act, ECOA regulations</li>
                <li>✓ 3 ranked remediation strategies per finding</li>
                <li>✓ Full Bias Receipt generated for download</li>
              </ul>
            </div>

            {/* Navigation */}
            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="flex-1 py-3.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2"
                style={{ color: "var(--text-secondary)", border: "1px solid var(--border-default)" }}
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <button
                onClick={handleLaunch}
                disabled={launching}
                className="flex-[2] py-3.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-[1.02] glow-blue disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, #3B82F6, #8B5CF6)" }}
              >
                {launching ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Launching Audit...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Rocket className="w-4 h-4" />
                    Launch Bias Audit
                  </span>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
