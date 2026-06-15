"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from "recharts";
import { AlertTriangle, Lightbulb } from "lucide-react";

interface ProxyWarning {
  column: string;
  correlated_with: string;
  correlation_coefficient: number;
  severity: string;
  explanation?: string;
}

interface BiasMetric {
  metric_name: string;
  value: number;
  severity: string;
}

interface Finding {
  protected_attribute: string;
  severity: string;
  metrics?: BiasMetric[];
  genealogy_tree?: {
    level: number;
    level_name: string;
    root_cause: string;
    bias_contribution: number;
    fix_suggestion: string;
  }[];
}

function getBarColor(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 0.7) return "#EF4444";   // red — strong proxy
  if (abs >= 0.4) return "#F59E0B";   // amber — moderate
  return "#22C55E";                    // green — weak
}

/**
 * FeatureWaterfallChart — Horizontal bar chart showing feature correlations
 * to protected attributes as a visual "root cause" explainability tool.
 *
 * Data sources:
 * 1. proxy_warnings from schema suggestions (correlation coefficients)
 * 2. genealogy_tree from findings (bias contribution scores)
 */
export default function FeatureWaterfallChart({
  proxyWarnings = [],
  findings = [],
}: {
  proxyWarnings?: ProxyWarning[];
  findings?: Finding[];
}) {
  // Build chart data from proxy warnings
  const proxyData = proxyWarnings.map((pw) => ({
    feature: pw.column,
    impact: pw.correlation_coefficient,
    target: pw.correlated_with,
    explanation: pw.explanation || `${pw.column} is correlated with ${pw.correlated_with}`,
    severity: pw.severity,
  }));

  // Also pull in genealogy contributions from findings
  const genealogyData = findings.flatMap((f) =>
    (f.genealogy_tree || []).map((node) => ({
      feature: node.level_name,
      impact: node.bias_contribution,
      target: f.protected_attribute,
      explanation: node.root_cause,
      severity: node.bias_contribution > 0.3 ? "HIGH" : "MEDIUM",
    }))
  );

  // Merge: prefer proxy data, then add genealogy items not already present
  const seenFeatures = new Set(proxyData.map((d) => d.feature));
  const mergedData = [
    ...proxyData,
    ...genealogyData.filter((g) => !seenFeatures.has(g.feature)),
  ];

  // Sort by absolute impact descending
  mergedData.sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));

  // Cap at 10 items
  const chartData = mergedData.slice(0, 10);

  if (chartData.length === 0) return null;

  // Find the top root cause explanation
  const topCause = chartData[0];

  return (
    <div
      className="rounded-xl p-6 space-y-5"
      style={{
        background: "var(--surface-card)",
        border: "1px solid var(--border-default)",
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <Lightbulb className="w-5 h-5" style={{ color: "var(--severity-amber-dot)" }} />
        <h3 className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
          Explainability — Feature Impact Analysis
        </h3>
      </div>

      {/* Chart */}
      <div style={{ width: "100%", height: Math.max(200, chartData.length * 40 + 40) }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" horizontal={false} />
            <XAxis
              type="number"
              domain={[0, 1]}
              tick={{ fontSize: 11, fill: "var(--text-muted)" }}
              tickFormatter={(v: number) => v.toFixed(1)}
              axisLine={{ stroke: "var(--border-default)" }}
            />
            <YAxis
              type="category"
              dataKey="feature"
              width={120}
              tick={{ fontSize: 11, fill: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}
              axisLine={false}
              tickLine={false}
            />
            <ReferenceLine x={0.4} stroke="var(--severity-amber-dot)" strokeDasharray="4 4" />
            <ReferenceLine x={0.7} stroke="var(--severity-red-dot)" strokeDasharray="4 4" />
            <Tooltip
              contentStyle={{
                background: "var(--surface-card)",
                border: "1px solid var(--border-default)",
                borderRadius: 8,
                fontSize: 12,
              }}
              formatter={(value: any) => {
                return [`${Math.abs(Number(value)).toFixed(3)}`, "Correlation"];
              }}
              labelFormatter={(label: any) => `Feature: ${label}`}
            />
            <Bar dataKey="impact" radius={[0, 4, 4, 0]} barSize={20}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.impact)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-[10px] font-medium" style={{ color: "var(--text-muted)" }}>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#EF4444" }} /> Strong Proxy (≥ 0.7)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#F59E0B" }} /> Moderate (0.4–0.7)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#22C55E" }} /> Weak (&lt; 0.4)
        </span>
      </div>

      {/* AI Root Cause Summary */}
      {topCause && (
        <div
          className="p-4 rounded-lg flex items-start gap-3"
          style={{ background: "var(--severity-amber-bg)", border: "1px solid var(--severity-amber-border)" }}
        >
          <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "var(--severity-amber-dot)" }} />
          <div>
            <p className="text-xs font-bold mb-1" style={{ color: "var(--severity-amber-text)" }}>
              Primary Root Cause
            </p>
            <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              <strong style={{ color: "var(--text-primary)" }}>{topCause.feature}</strong> has the highest impact
              (r = {Math.abs(topCause.impact).toFixed(3)}) on <strong style={{ color: "var(--severity-red-text)" }}>{topCause.target}</strong>.
              {" "}{topCause.explanation}
            </p>
          </div>
        </div>
      )}

      {/* All explanations */}
      {chartData.length > 1 && (
        <details className="text-xs">
          <summary className="cursor-pointer font-semibold py-1" style={{ color: "var(--text-secondary)" }}>
            View all {chartData.length} feature explanations
          </summary>
          <div className="space-y-2 mt-3">
            {chartData.map((entry, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-3 rounded-lg"
                style={{ background: "var(--surface-sunken)", border: "1px solid var(--border-default)" }}
              >
                <span
                  className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                  style={{ background: `${getBarColor(entry.impact)}20`, color: getBarColor(entry.impact) }}
                >
                  {i + 1}
                </span>
                <div>
                  <span className="font-semibold font-mono" style={{ color: "var(--text-primary)" }}>
                    {entry.feature}
                  </span>
                  <span className="mx-1" style={{ color: "var(--text-muted)" }}>→</span>
                  <span style={{ color: "var(--severity-red-text)" }}>{entry.target}</span>
                  <span className="ml-2 font-mono" style={{ color: "var(--text-muted)" }}>
                    (r = {Math.abs(entry.impact).toFixed(3)})
                  </span>
                  <p className="mt-1" style={{ color: "var(--text-secondary)" }}>{entry.explanation}</p>
                </div>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
