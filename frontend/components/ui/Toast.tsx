"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { CheckCircle, AlertTriangle, XCircle, Info, X } from "lucide-react";

/* ── Types ──────────────────────────────────────────── */

type ToastVariant = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
  duration: number;
}

interface ToastContextType {
  toast: (message: string, variant?: ToastVariant, duration?: number) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
}

const ToastCtx = createContext<ToastContextType | null>(null);

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
}

/* ── Icons ──────────────────────────────────────────── */

const icons: Record<ToastVariant, React.ReactNode> = {
  success: <CheckCircle style={{ width: 18, height: 18, color: "var(--severity-green-dot)" }} />,
  error: <XCircle style={{ width: 18, height: 18, color: "var(--severity-red-dot)" }} />,
  warning: <AlertTriangle style={{ width: 18, height: 18, color: "var(--severity-amber-dot)" }} />,
  info: <Info style={{ width: 18, height: 18, color: "var(--brand-500)" }} />,
};

const bgColors: Record<ToastVariant, string> = {
  success: "var(--severity-green-bg)",
  error: "var(--severity-red-bg)",
  warning: "var(--severity-amber-bg)",
  info: "var(--brand-50)",
};

const borderColors: Record<ToastVariant, string> = {
  success: "var(--severity-green-border)",
  error: "var(--severity-red-border)",
  warning: "var(--severity-amber-border)",
  info: "var(--brand-100)",
};

/* ── Provider ───────────────────────────────────────── */

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (message: string, variant: ToastVariant = "info", duration = 4000) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setToasts((prev) => [...prev, { id, message, variant, duration }]);
    },
    []
  );

  const api: ToastContextType = {
    toast: addToast,
    success: (msg) => addToast(msg, "success"),
    error: (msg) => addToast(msg, "error"),
    warning: (msg) => addToast(msg, "warning"),
    info: (msg) => addToast(msg, "info"),
  };

  return (
    <ToastCtx.Provider value={api}>
      {children}

      {/* Toast container — fixed bottom-right */}
      <div
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          gap: 8,
          pointerEvents: "none",
        }}
      >
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={() => removeToast(t.id)} />
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

/* ── Toast Item ─────────────────────────────────────── */

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setExiting(true), toast.duration - 300);
    const removeTimer = setTimeout(onDismiss, toast.duration);
    return () => {
      clearTimeout(timer);
      clearTimeout(removeTimer);
    };
  }, [toast.duration, onDismiss]);

  return (
    <div
      role="alert"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "12px 16px",
        borderRadius: "var(--radius-lg)",
        background: bgColors[toast.variant],
        border: `1px solid ${borderColors[toast.variant]}`,
        boxShadow: "var(--shadow-lg)",
        fontSize: 14,
        color: "var(--text-primary)",
        fontFamily: "var(--font-body)",
        pointerEvents: "auto",
        minWidth: 280,
        maxWidth: 420,
        animation: exiting
          ? "slide-down 200ms ease forwards"
          : "slide-up var(--duration-slow) var(--ease-decelerate) forwards",
      }}
    >
      {icons[toast.variant]}
      <span style={{ flex: 1 }}>{toast.message}</span>
      <button
        onClick={() => {
          setExiting(true);
          setTimeout(onDismiss, 200);
        }}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "var(--text-tertiary)",
          padding: 2,
          display: "flex",
        }}
        aria-label="Dismiss"
      >
        <X style={{ width: 14, height: 14 }} />
      </button>
    </div>
  );
}
