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
    <div className="min-h-screen" style={{ background: "var(--bg-primary)" }}>
      {/* ── Header ──────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4" style={{ background: "rgba(6, 10, 27, 0.85)", backdropFilter: "blur(20px)", borderBottom: "1px solid var(--border-default)" }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #3B82F6, #8B5CF6)" }}>
              <Scale className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">Equalyze</span>
          </div>
          <Link
            href="/dashboard"
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:scale-105"
            style={{ background: "linear-gradient(135deg, #3B82F6, #8B5CF6)" }}
          >
            Launch Platform
          </Link>
        </div>
      </header>

      {/* ── Hero ────────────────────────────── */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        {/* Ambient glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] opacity-30" style={{ background: "radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)" }} />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium mb-8" style={{ background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.25)", color: "var(--severity-red)" }}>
              <AlertTriangle className="w-3.5 h-3.5" />
              Your AI might be discriminating — and you don&apos;t know it
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6">
              <span className="text-white">Make AI Bias</span>
              <br />
              <span className="gradient-text">Visible & Fixable</span>
            </h1>

            <p className="text-lg md:text-xl max-w-3xl mx-auto mb-10 leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              Equalyze detects algorithmic discrimination with{" "}
              <strong className="text-white">counterfactual proof</strong>, maps it to{" "}
              <strong className="text-white">legal regulations</strong>, and generates{" "}
              <strong className="text-white">remediation pathways</strong> — all in a
              format a CEO can read.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="/dashboard/audits/new"
              className="group flex items-center gap-2 px-8 py-4 rounded-xl text-base font-semibold text-white glow-blue hover:scale-105 transition-all"
              style={{ background: "linear-gradient(135deg, #3B82F6, #2563EB)" }}
            >
              Start Bias Audit
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/dashboard"
              className="px-8 py-4 rounded-xl text-base font-semibold transition-all hover:scale-105"
              style={{ color: "var(--text-secondary)", border: "1px solid var(--border-default)" }}
            >
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
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              The <span className="gradient-text">Counterfactual Twin</span> Proof
            </h2>
            <p style={{ color: "var(--text-secondary)" }} className="text-lg">
              We don&apos;t just find bias — we <strong className="text-white">prove</strong> it with undeniable evidence
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="glass-card p-8"
          >
            <div className="twin-card">
              {/* Original */}
              <div className="p-6 rounded-xl" style={{ background: "rgba(34, 197, 94, 0.06)", border: "1px solid rgba(34, 197, 94, 0.15)" }}>
                <div className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--severity-green)" }}>
                  Patient A — Urban Zip Code
                </div>
                <div className="space-y-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                  <p>Age: <span className="text-white font-medium">45 years</span></p>
                  <p>Diagnosis: <span className="text-white font-medium">Type 2 Diabetes</span></p>
                  <p>BMI: <span className="text-white font-medium">28.3</span></p>
                  <p>HbA1c: <span className="text-white font-medium">7.2</span></p>
                  <p>Treatment History: <span className="text-white font-medium">Identical</span></p>
                </div>
                <div className="mt-4 pt-4" style={{ borderTop: "1px solid rgba(34, 197, 94, 0.15)" }}>
                  <div className="text-xs uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>Premium</div>
                  <div className="text-2xl font-bold" style={{ color: "var(--severity-green)" }}>₹8,400<span className="text-sm font-normal">/year</span></div>
                </div>
              </div>

              {/* Divider */}
              <div className="twin-divider" />

              {/* Twin */}
              <div className="p-6 rounded-xl" style={{ background: "rgba(239, 68, 68, 0.06)", border: "1px solid rgba(239, 68, 68, 0.15)" }}>
                <div className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--severity-red)" }}>
                  Patient B — Rural Zip Code
                </div>
                <div className="space-y-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                  <p>Age: <span className="text-white font-medium">45 years</span></p>
                  <p>Diagnosis: <span className="text-white font-medium">Type 2 Diabetes</span></p>
                  <p>BMI: <span className="text-white font-medium">28.3</span></p>
                  <p>HbA1c: <span className="text-white font-medium">7.2</span></p>
                  <p>Treatment History: <span className="text-white font-medium">Identical</span></p>
                </div>
                <div className="mt-4 pt-4" style={{ borderTop: "1px solid rgba(239, 68, 68, 0.15)" }}>
                  <div className="text-xs uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>Premium</div>
                  <div className="text-2xl font-bold" style={{ color: "var(--severity-red)" }}>₹14,200<span className="text-sm font-normal">/year</span></div>
                </div>
              </div>
            </div>

            {/* Discrimination statement */}
            <div className="mt-6 p-4 rounded-xl text-center" style={{ background: "rgba(239, 68, 68, 0.08)", border: "1px solid rgba(239, 68, 68, 0.2)" }}>
              <p className="text-base font-semibold" style={{ color: "var(--severity-red)" }}>
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
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Five Layers of <span className="gradient-text">Protection</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: FileSearch, title: "Universal Ingestion", desc: "Upload any model's predictions as CSV. Auto-detect schema in seconds.", color: "#3B82F6" },
              { icon: Users, title: "Counterfactual Twins", desc: "AI-generated adversarial examples that prove discrimination in one comparison.", color: "#8B5CF6" },
              { icon: Scale, title: "Legal Mapping", desc: "Auto-map bias to DPDPA, EU AI Act, ECOA — with exposure scores for compliance.", color: "#06B6D4" },
              { icon: Zap, title: "Remediation Engine", desc: "3 ranked fix strategies per finding with code references and effort estimates.", color: "#F59E0B" },
              { icon: BarChart3, title: "Bias Drift Monitor", desc: "Track bias trends over time. Catch acceleration before a journalist does.", color: "#22C55E" },
              { icon: Eye, title: "Bias Receipt", desc: "A legally-formatted audit report a CEO can sign and file with regulators.", color: "#EF4444" },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-6"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: `${feature.color}15`, border: `1px solid ${feature.color}30` }}>
                  <feature.icon className="w-5 h-5" style={{ color: feature.color }} />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
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
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Stop guessing. Start <span className="gradient-text">proving</span>.
            </h2>
            <p className="text-lg mb-8" style={{ color: "var(--text-secondary)" }}>
              Upload your first dataset and get a complete bias audit in under 10 minutes.
            </p>
            <Link
              href="/dashboard/audits/new"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-semibold text-white glow-blue hover:scale-105 transition-all"
              style={{ background: "linear-gradient(135deg, #3B82F6, #2563EB)" }}
            >
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
            <Scale className="w-4 h-4" style={{ color: "var(--accent-blue)" }} />
            <span className="text-sm font-semibold text-white">Equalyze</span>
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>by Team Trident</span>
          </div>
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            Google Solutions Challenge 2026
          </span>
        </div>
      </footer>
    </div>
  );
}
