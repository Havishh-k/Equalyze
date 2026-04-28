"use client";

import { useState, useCallback, useRef } from "react";
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
  Building2,
  Eye,
  X,
  Loader2,
  Hospital,
  Landmark,
  Shield,
  BarChart3,
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
  { value: "healthcare", label: "Healthcare / Insurance", icon: Hospital },
  { value: "lending", label: "MSME Lending / Finance", icon: Landmark },
  { value: "insurance", label: "Insurance", icon: Shield },
  { value: "hiring", label: "Hiring / HR", icon: Eye },
  { value: "other", label: "Other", icon: BarChart3 },
];

export default function NewAuditPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);

  // Step 1 state
  const [file, setFile] = useState<File | null>(null);
  const [domain, setDomain] = useState("");
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
  const [orgName, setOrgName] = useState("");
  const [modelName, setModelName] = useState("");
  const [launching, setLaunching] = useState(false);

  const handleDomainChange = (newDomain: string) => {
    setDomain(newDomain);
    if (newDomain === "lending") {
      setOrgName("Global MSME Finance");
      setModelName("Credit Scoring Model v4.0");
    } else if (newDomain === "hiring") {
      setOrgName("TechTalent Corp.");
      setModelName("Resume Screening AI v1.2");
    } else if (newDomain === "insurance") {
      setOrgName("Shield Insurance Co.");
      setModelName("Claim Approval Model v3.1");
    } else {
      setOrgName("Acme Healthcare Ltd.");
      setModelName("Insurance Premium Model v2.1");
    }
  };

  const canUpload = !!file && !!domain && !uploading;

  // Drag & drop
  const [isDragging, setIsDragging] = useState(false);
  const isUploadingRef = useRef(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) setFile(droppedFile);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file || isUploadingRef.current) return;
    isUploadingRef.current = true;
    setUploading(true);
    try {
      const uploadInit = await uploadDataset(file, domain);
      let finalData: any;

      if (uploadInit.row_count && uploadInit.column_names) {
        finalData = uploadInit;
      } else {
        let isReady = false;
        while (!isReady) {
          await new Promise((r) => setTimeout(r, 2000));
          const statusCheck = await import("@/lib/api").then((m) =>
            m.getDatasetStatus(uploadInit.dataset_id)
          );
          if (statusCheck.status === "READY") {
            isReady = true;
            finalData = statusCheck;
          } else if (statusCheck.status === "FAILED") {
            throw new Error(
              statusCheck.error || "Dataset processing failed in background"
            );
          }
        }
      }

      setUploadResult({
        dataset_id: finalData.dataset_id,
        filename: finalData.filename,
        row_count: finalData.row_count!,
        column_count: finalData.column_count!,
        column_names: finalData.column_names!,
        sample_data: finalData.sample_data!,
      });

      setSchemaLoading(true);
      setStep(2);

      const schemaResult = await getSchemaSuggestions(uploadInit.dataset_id);
      setSchemaMap(schemaResult.schema_map);
      setColumnTags(schemaResult.schema_map.column_tags || []);
      setProxyWarnings(schemaResult.schema_map.proxy_warnings || []);
    } catch (err) {
      alert(`Upload failed: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      isUploadingRef.current = false;
      setUploading(false);
      setSchemaLoading(false);
    }
  };

  const toggleColumnTag = (colName: string, newTag: string) => {
    if (!schemaMap) return;

    const updated = { ...schemaMap };
    updated.protected_attributes = updated.protected_attributes.filter(
      (c) => c !== colName
    );
    updated.valid_factors = updated.valid_factors.filter((c) => c !== colName);
    if (updated.outcome === colName) updated.outcome = "";

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

  // Using CSS variables from globals.css for TAG_COLORS
  const TAG_COLORS: Record<string, { bg: string; border: string; text: string; label: string }> = {
    PROTECTED_ATTRIBUTE: {
      bg: "var(--severity-red-bg)",
      border: "var(--severity-red-border)",
      text: "var(--severity-red-text)",
      label: "Protected",
    },
    VALID_FACTOR: {
      bg: "var(--brand-50)",
      border: "var(--brand-200)",
      text: "var(--brand-600)",
      label: "Valid Factor",
    },
    OUTCOME: {
      bg: "var(--severity-amber-bg)",
      border: "var(--severity-amber-border)",
      text: "var(--severity-amber-text)",
      label: "Outcome",
    },
    IDENTIFIER: {
      bg: "var(--neutral-100)",
      border: "var(--neutral-200)",
      text: "var(--neutral-600)",
      label: "ID",
    },
    METADATA: {
      bg: "var(--neutral-50)",
      border: "var(--neutral-200)",
      text: "var(--neutral-500)",
      label: "Metadata",
    },
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      {/* ── Header ────────────────────────── */}
      <div className="mb-10">
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "var(--text-h1)",
            color: "var(--text-primary)",
            marginBottom: "var(--space-2)",
          }}
        >
          New Compliance Audit
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "var(--text-body)" }}>
          Upload your model&apos;s predictions to analyze for algorithmic bias.
        </p>
      </div>

      {/* ── Progress Steps ────────────────── */}
      <div className="flex items-center gap-4 mb-10">
        {[
          { n: 1, label: "Upload Dataset", icon: Upload },
          { n: 2, label: "Map Schema", icon: Tag },
          { n: 3, label: "Launch Audit", icon: Rocket },
        ].map((s, i) => (
          <div key={s.n} className="flex items-center gap-3 flex-1">
            <div
              className="w-10 h-10 rounded flex items-center justify-center text-sm font-bold transition-all"
              style={{
                background: step >= s.n ? "var(--brand-500)" : "var(--surface-card)",
                color: step >= s.n ? "var(--neutral-0)" : "var(--text-tertiary)",
                border: step >= s.n ? "1px solid var(--brand-600)" : "1px solid var(--border-default)",
              }}
            >
              {step > s.n ? <CheckCircle className="w-5 h-5" /> : <s.icon className="w-5 h-5" />}
            </div>
            <span
              className="text-sm font-medium hidden md:inline"
              style={{ color: step >= s.n ? "var(--text-primary)" : "var(--text-tertiary)" }}
            >
              {s.label}
            </span>
            {i < 2 && (
              <div
                className="flex-1 h-px"
                style={{ background: step > s.n ? "var(--brand-500)" : "var(--border-default)" }}
              />
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
            <div className="card p-6">
              <label className="text-sm font-semibold block mb-4" style={{ color: "var(--text-primary)" }}>
                What domain is this AI model deployed in?
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {DOMAINS.map((d) => (
                  <button
                    key={d.value}
                    onClick={() => handleDomainChange(d.value)}
                    className="p-4 rounded text-left transition-all"
                    style={{
                      background: domain === d.value ? "var(--brand-50)" : "var(--surface-card)",
                      border: domain === d.value ? "1px solid var(--brand-400)" : "1px solid var(--border-default)",
                    }}
                  >
                    <d.icon className="w-5 h-5 mb-2" style={{ color: domain === d.value ? "var(--brand-600)" : "var(--text-tertiary)" }} />
                    <p
                      className="text-sm font-medium"
                      style={{ color: domain === d.value ? "var(--brand-700)" : "var(--text-secondary)" }}
                    >
                      {d.label}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* File upload */}
            <div className="card p-6">
              <label className="text-sm font-semibold block mb-4" style={{ color: "var(--text-primary)" }}>
                Upload your model&apos;s prediction dataset
              </label>
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => document.getElementById("file-input")?.click()}
                className="cursor-pointer flex flex-col items-center justify-center p-10 rounded transition-all"
                style={{
                  background: isDragging ? "var(--brand-50)" : "var(--surface-sunken)",
                  border: isDragging ? "1px dashed var(--brand-500)" : "1px dashed var(--border-strong)",
                }}
              >
                <input
                  id="file-input"
                  type="file"
                  accept=".csv,.xlsx,.xls,.json"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                {file ? (
                  <div className="flex items-center gap-4">
                    <FileSpreadsheet className="w-8 h-8" style={{ color: "var(--brand-500)" }} />
                    <div className="text-left">
                      <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                        {file.name}
                      </p>
                      <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                      }}
                      className="ml-4 p-2 rounded hover:bg-black/5 transition-colors"
                    >
                      <X className="w-4 h-4" style={{ color: "var(--text-tertiary)" }} />
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload className="w-8 h-8 mx-auto mb-3" style={{ color: "var(--text-tertiary)" }} />
                    <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>
                      Drag & drop your CSV file here
                    </p>
                    <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
                      Supports CSV, XLSX, JSON · Max 500MB
                    </p>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={handleUpload}
              disabled={!canUpload}
              className="btn btn-primary w-full py-3 text-base flex justify-center items-center gap-2"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Uploading & Analyzing...
                </>
              ) : (
                <>
                  Upload & Analyze
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Upload progress indicator */}
            {uploading && (
              <div className="space-y-2 mt-4">
                <div
                  className="w-full h-1.5 rounded-full overflow-hidden"
                  style={{ background: "var(--surface-sunken)" }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{
                      background: "var(--brand-500)",
                      animation: "uploadProgress 2s ease-in-out infinite",
                      width: "60%",
                    }}
                  />
                </div>
                <p className="text-xs text-center" style={{ color: "var(--text-secondary)" }}>
                  Parsing and profiling your dataset...
                </p>
                <style jsx>{`
                  @keyframes uploadProgress {
                    0% {
                      width: 10%;
                      margin-left: 0;
                    }
                    50% {
                      width: 60%;
                      margin-left: 20%;
                    }
                    100% {
                      width: 10%;
                      margin-left: 90%;
                    }
                  }
                `}</style>
              </div>
            )}
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
              <div className="card p-12 text-center">
                <Loader2
                  className="w-8 h-8 animate-spin mx-auto mb-4"
                  style={{ color: "var(--brand-500)" }}
                />
                <p className="text-sm font-semibold mb-1" style={{ color: "var(--text-primary)" }}>
                  Analyzing dataset columns...
                </p>
                <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
                  Auto-detecting protected attributes, valid factors, and outcomes
                </p>
              </div>
            ) : (
              <>
                {/* Dataset summary */}
                {uploadResult && (
                  <div className="card p-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileSpreadsheet className="w-5 h-5" style={{ color: "var(--brand-500)" }} />
                      <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
                        {uploadResult.filename}
                      </span>
                    </div>
                    <div className="flex gap-4 text-xs font-medium" style={{ color: "var(--text-secondary)" }}>
                      <span>{uploadResult.row_count.toLocaleString()} rows</span>
                      <span>{uploadResult.column_count} columns</span>
                    </div>
                  </div>
                )}

                {/* Proxy warnings */}
                {proxyWarnings.length > 0 && (
                  <div
                    className="p-4 rounded"
                    style={{
                      background: "var(--severity-amber-bg)",
                      border: "1px solid var(--severity-amber-border)",
                    }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4" style={{ color: "var(--severity-amber-dot)" }} />
                      <span
                        className="text-sm font-semibold"
                        style={{ color: "var(--severity-amber-text)" }}
                      >
                        Proxy Variables Detected
                      </span>
                    </div>
                    {proxyWarnings.map((pw, i) => (
                      <p
                        key={i}
                        className="text-xs ml-6 mt-1"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        <strong style={{ color: "var(--text-primary)" }}>{pw.column}</strong> correlates with{" "}
                        <strong style={{ color: "var(--severity-red-text)" }}>{pw.correlated_with}</strong>{" "}
                        (r = {pw.correlation_coefficient.toFixed(3)}) — {pw.severity} risk
                      </p>
                    ))}
                  </div>
                )}

                {/* Column tag editor */}
                <div className="card p-6">
                  <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--text-primary)" }}>
                    Column Classification
                    <span className="font-normal ml-2" style={{ color: "var(--text-tertiary)" }}>
                      (click tags to reassign)
                    </span>
                  </h3>
                  <div className="space-y-3">
                    {uploadResult?.column_names.map((col) => {
                      const category = getColumnCategory(col);
                      const tagInfo = TAG_COLORS[category] || TAG_COLORS.METADATA;
                      const tagOptions = Object.entries(TAG_COLORS);

                      return (
                        <div
                          key={col}
                          className="flex items-center justify-between p-3 rounded"
                          style={{
                            background: "var(--surface-base)",
                            border: "1px solid var(--border-default)",
                          }}
                        >
                          <span
                            className="text-sm font-mono font-medium truncate flex-1 pr-4"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {col}
                          </span>
                          <div className="flex gap-1.5 flex-shrink-0">
                            {tagOptions.map(([tag, info]) => {
                              const isActive = category === tag;
                              return (
                                <button
                                  key={tag}
                                  onClick={() => toggleColumnTag(col, tag)}
                                  className="px-2.5 py-1 rounded text-xs font-medium transition-all"
                                  style={{
                                    background: isActive ? info.bg : "transparent",
                                    border: `1px solid ${isActive ? info.border : "var(--border-default)"}`,
                                    color: isActive ? info.text : "var(--text-tertiary)",
                                    opacity: isActive ? 1 : 0.6,
                                  }}
                                >
                                  {info.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex gap-3 pt-4">
                  <button onClick={() => setStep(1)} className="btn btn-secondary flex-1 flex justify-center gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    disabled={!schemaMap?.outcome || schemaMap.protected_attributes.length === 0}
                    className="btn btn-primary flex-[2] flex justify-center gap-2"
                  >
                    Confirm Schema
                    <ArrowRight className="w-4 h-4" />
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
            <div className="card p-6">
              <h3 className="text-sm font-semibold mb-5 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                <Building2 className="w-4 h-4" style={{ color: "var(--brand-500)" }} />
                Model Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="text-xs font-semibold block mb-2" style={{ color: "var(--text-secondary)" }}>
                    Organization Name
                  </label>
                  <input
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    className="w-full px-3 py-2 rounded text-sm outline-none transition-colors"
                    style={{
                      background: "var(--surface-sunken)",
                      border: "1px solid var(--border-default)",
                      color: "var(--text-primary)",
                      fontFamily: "var(--font-body)",
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "var(--brand-400)")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border-default)")}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-2" style={{ color: "var(--text-secondary)" }}>
                    Model Name
                  </label>
                  <input
                    value={modelName}
                    onChange={(e) => setModelName(e.target.value)}
                    className="w-full px-3 py-2 rounded text-sm outline-none transition-colors"
                    style={{
                      background: "var(--surface-sunken)",
                      border: "1px solid var(--border-default)",
                      color: "var(--text-primary)",
                      fontFamily: "var(--font-body)",
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "var(--brand-400)")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border-default)")}
                  />
                </div>
              </div>
            </div>

            {/* Audit summary */}
            <div className="card p-6">
              <h3 className="text-sm font-semibold mb-5 flex items-center gap-2" style={{ color: "var(--text-primary)" }}>
                <Eye className="w-4 h-4" style={{ color: "var(--brand-500)" }} />
                Audit Configuration
              </h3>
              <div className="grid grid-cols-2 gap-6 text-sm">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--text-tertiary)" }}>
                    Dataset
                  </p>
                  <p className="font-medium" style={{ color: "var(--text-primary)" }}>
                    {uploadResult?.filename}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--text-tertiary)" }}>
                    Domain
                  </p>
                  <p className="font-medium" style={{ color: "var(--text-primary)" }}>
                    {DOMAINS.find((d) => d.value === domain)?.label}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--text-tertiary)" }}>
                    Protected Attributes
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {schemaMap?.protected_attributes.map((a) => (
                      <span
                        key={a}
                        className="px-2 py-0.5 rounded text-xs font-medium"
                        style={{
                          background: "var(--severity-red-bg)",
                          color: "var(--severity-red-text)",
                          border: "1px solid var(--severity-red-border)",
                        }}
                      >
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--text-tertiary)" }}>
                    Outcome Variable
                  </p>
                  <span
                    className="px-2 py-0.5 rounded text-xs font-medium"
                    style={{
                      background: "var(--severity-amber-bg)",
                      color: "var(--severity-amber-text)",
                      border: "1px solid var(--severity-amber-border)",
                    }}
                  >
                    {schemaMap?.outcome}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--text-tertiary)" }}>
                    Jurisdictions
                  </p>
                  <p className="font-medium" style={{ color: "var(--text-primary)" }}>
                    India, EU, USA
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--text-tertiary)" }}>
                    Rows
                  </p>
                  <p className="font-medium" style={{ color: "var(--text-primary)" }}>
                    {uploadResult?.row_count.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* What will happen */}
            <div
              className="p-5 rounded"
              style={{
                background: "var(--brand-50)",
                border: "1px solid var(--brand-200)",
              }}
            >
              <p className="text-sm font-semibold mb-3" style={{ color: "var(--brand-700)" }}>
                What happens next:
              </p>
              <ul className="space-y-2 text-sm" style={{ color: "var(--brand-600)" }}>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 opacity-70" /> 5 fairness metrics computed across all protected attributes
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 opacity-70" /> Counterfactual twins generated to prove discrimination
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 opacity-70" /> Legal exposure mapped to DPDPA, EU AI Act, ECOA
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 opacity-70" /> Ranked remediation strategies generated
                </li>
              </ul>
            </div>

            {/* Navigation */}
            <div className="flex gap-3 pt-4">
              <button onClick={() => setStep(2)} className="btn btn-secondary flex-1 flex justify-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
              <button
                onClick={handleLaunch}
                disabled={launching}
                className="btn btn-primary flex-[2] flex justify-center gap-2"
              >
                {launching ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Launching Audit...
                  </>
                ) : (
                  <>
                    <Rocket className="w-4 h-4" />
                    Launch Bias Audit
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
