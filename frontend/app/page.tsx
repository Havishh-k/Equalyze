"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Shield,
  Eye,
  Scale,
  Zap,
  ArrowRight,
  FileSearch,
  Users,
  BarChart3,
  AlertTriangle,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ background: "var(--surface-base)" }}>
      {/* ── Header ──────────────────────────── */}
      <header
        className="fixed top-0 left-0 right-0 z-50 px-6 py-4"
        style={{ background: "rgba(255, 255, 255, 0.92)", backdropFilter: "blur(12px)", borderBottom: "1px solid var(--border-default)" }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--brand-50)", border: "1px solid var(--brand-200)" }}>
              <Scale className="w-5 h-5" style={{ color: "var(--brand-500)" }} />
            </div>
            <span className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>Equalyze</span>
          </div>
          <Link href="/dashboard" className="btn btn-primary">
            Launch Platform
          </Link>
        </div>
      </header>

      {/* ── Hero ────────────────────────────── */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium mb-8"
              style={{ background: "var(--severity-red-bg)", border: "1px solid var(--severity-red-border)", color: "var(--severity-red-text)" }}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              Your AI might be discriminating — and you don&apos;t know it
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6">
              <span style={{ color: "var(--text-primary)" }}>Make AI Bias</span>
              <br />
              <span style={{ color: "var(--brand-500)" }}>Visible &amp; Fixable</span>
            </h1>

            <p className="text-lg md:text-xl max-w-3xl mx-auto mb-10 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              Equalyze detects algorithmic discrimination with{" "}
              <strong style={{ color: "var(--text-primary)" }}>counterfactual proof</strong>, maps it to{" "}
              <strong style={{ color: "var(--text-primary)" }}>legal regulations</strong>, and generates{" "}
              <strong style={{ color: "var(--text-primary)" }}>remediation pathways</strong> — all in a
              format a CEO can read.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/dashboard/audits/new" className="btn btn-primary" style={{ height: 48, padding: "0 28px" }}>
              Start Bias Audit
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/dashboard" className="btn btn-secondary" style={{ height: 48, padding: "0 28px" }}>
              View Demo Dashboard
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── The Twin Demo ───────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>
              The <span style={{ color: "var(--brand-500)" }}>Counterfactual Twin</span> Proof
            </h2>
            <p style={{ color: "var(--text-secondary)" }} className="text-lg">
              We don&apos;t just find bias — we <strong style={{ color: "var(--text-primary)" }}>prove</strong> it with undeniable evidence
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="card"
            style={{ padding: "var(--space-8)" }}
          >
            <div className="twin-card">
              {/* Original */}
              <div className="p-6 rounded-xl" style={{ background: "var(--severity-green-bg)", border: "1px solid var(--severity-green-border)" }}>
                <div className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--severity-green-text)" }}>
                  Patient A — Urban Zip Code
                </div>
                <div className="space-y-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                  <p>Age: <span className="font-medium" style={{ color: "var(--text-primary)" }}>45 years</span></p>
                  <p>Diagnosis: <span className="font-medium" style={{ color: "var(--text-primary)" }}>Type 2 Diabetes</span></p>
                  <p>BMI: <span className="font-medium" style={{ color: "var(--text-primary)" }}>28.3</span></p>
                  <p>HbA1c: <span className="font-medium" style={{ color: "var(--text-primary)" }}>7.2</span></p>
                  <p>Treatment History: <span className="font-medium" style={{ color: "var(--text-primary)" }}>Identical</span></p>
                </div>
                <div className="mt-4 pt-4" style={{ borderTop: "1px solid var(--severity-green-border)" }}>
                  <div className="text-xs uppercase tracking-wider mb-1" style={{ color: "var(--text-tertiary)" }}>Premium</div>
                  <div className="text-2xl font-bold" style={{ color: "var(--severity-green-text)" }}>₹8,400<span className="text-sm font-normal">/year</span></div>
                </div>
              </div>

              {/* Divider */}
              <div className="twin-divider" />

              {/* Twin */}
              <div className="p-6 rounded-xl" style={{ background: "var(--severity-red-bg)", border: "1px solid var(--severity-red-border)" }}>
                <div className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--severity-red-text)" }}>
                  Patient B — Rural Zip Code
                </div>
                <div className="space-y-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                  <p>Age: <span className="font-medium" style={{ color: "var(--text-primary)" }}>45 years</span></p>
                  <p>Diagnosis: <span className="font-medium" style={{ color: "var(--text-primary)" }}>Type 2 Diabetes</span></p>
                  <p>BMI: <span className="font-medium" style={{ color: "var(--text-primary)" }}>28.3</span></p>
                  <p>HbA1c: <span className="font-medium" style={{ color: "var(--text-primary)" }}>7.2</span></p>
                  <p>Treatment History: <span className="font-medium" style={{ color: "var(--text-primary)" }}>Identical</span></p>
                </div>
                <div className="mt-4 pt-4" style={{ borderTop: "1px solid var(--severity-red-border)" }}>
                  <div className="text-xs uppercase tracking-wider mb-1" style={{ color: "var(--text-tertiary)" }}>Premium</div>
                  <div className="text-2xl font-bold" style={{ color: "var(--severity-red-text)" }}>₹14,200<span className="text-sm font-normal">/year</span></div>
                </div>
              </div>
            </div>

            {/* Discrimination statement */}
            <div className="mt-6 p-4 rounded-xl text-center" style={{ background: "var(--severity-red-bg)", border: "1px solid var(--severity-red-border)" }}>
              <p className="text-base font-semibold" style={{ color: "var(--severity-red-text)" }}>
                &ldquo;Same vitals. Same diagnosis. Same treatment history. The algorithm charges 69% more — 
                not because they&apos;re sicker, but because of where they were born.&rdquo;
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Features ────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>
              Five Layers of <span style={{ color: "var(--brand-500)" }}>Protection</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: FileSearch, title: "Universal Ingestion", desc: "Upload any model's predictions as CSV. Auto-detect schema in seconds." },
              { icon: Users, title: "Counterfactual Twins", desc: "AI-generated adversarial examples that prove discrimination in one comparison." },
              { icon: Scale, title: "Legal Mapping", desc: "Auto-map bias to DPDPA, EU AI Act, ECOA — with exposure scores for compliance." },
              { icon: Zap, title: "Remediation Engine", desc: "3 ranked fix strategies per finding with code references and effort estimates." },
              { icon: BarChart3, title: "Bias Drift Monitor", desc: "Track bias trends over time. Catch acceleration before a journalist does." },
              { icon: Eye, title: "Bias Receipt", desc: "A legally-formatted audit report a CEO can sign and file with regulators." },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card"
                style={{ padding: "var(--space-6)" }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: "var(--brand-50)", border: "1px solid var(--brand-200)" }}>
                  <feature.icon className="w-5 h-5" style={{ color: "var(--brand-500)" }} />
                </div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--text-primary)" }}>{feature.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: "var(--text-primary)" }}>
              Stop guessing. Start <span style={{ color: "var(--brand-500)" }}>proving</span>.
            </h2>
            <p className="text-lg mb-8" style={{ color: "var(--text-secondary)" }}>
              Upload your first dataset and get a complete bias audit in under 10 minutes.
            </p>
            <Link href="/dashboard/audits/new" className="btn btn-primary" style={{ height: 48, padding: "0 28px" }}>
              Launch Your First Audit
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────── */}
      <footer className="py-8 px-6" style={{ borderTop: "1px solid var(--border-default)" }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4" style={{ color: "var(--brand-500)" }} />
            <span className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>Equalyze</span>
            <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>by Team Trident</span>
          </div>
          <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>
            Google Solutions Challenge 2026
          </span>
        </div>
      </footer>
    </div>
  );
}
