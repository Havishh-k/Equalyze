"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const { login, loginWithGoogle } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message?.includes("invalid") ? "Invalid email or password" : "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    setLoading(true);
    try {
      await loginWithGoogle();
      router.push("/dashboard");
    } catch (err: any) {
      setError("Google sign-in failed.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 12px 10px 40px",
    borderRadius: "var(--radius-md)",
    border: "1px solid var(--border-default)",
    background: "var(--surface-card)",
    color: "var(--text-primary)",
    fontSize: 14,
    outline: "none",
    transition: "border-color var(--transition-fast)",
    fontFamily: "var(--font-body)",
  };

  return (
    <div
      className="min-h-screen flex"
      style={{ background: "var(--surface-base)" }}
    >
      {/* ── Left: Form ──────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-8">
        <div className="w-full max-w-sm animate-fade-in">
          {/* Wordmark */}
          <div style={{ marginBottom: "var(--space-10)" }}>
            <h1
              style={{
                fontFamily: "var(--font-body)",
                fontWeight: 700,
                fontSize: 22,
                color: "var(--text-primary)",
                marginBottom: 4,
              }}
            >
              Equalyze
            </h1>
            <p style={{ fontSize: 14, color: "var(--text-secondary)" }}>
              AI Bias Detection & Governance Platform
            </p>
          </div>

          {/* Title */}
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 28,
              fontWeight: 400,
              color: "var(--text-primary)",
              marginBottom: "var(--space-8)",
              lineHeight: 1.2,
            }}
          >
            Sign in to your account
          </h2>

          {/* Error */}
          {error && (
            <div
              style={{
                marginBottom: "var(--space-4)",
                padding: "10px 14px",
                borderRadius: "var(--radius-md)",
                background: "var(--severity-red-bg)",
                border: "1px solid var(--severity-red-border)",
                color: "var(--severity-red-text)",
                fontSize: 13,
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div style={{ marginBottom: "var(--space-4)" }}>
              <label
                style={{
                  display: "block",
                  fontSize: 13,
                  fontWeight: 500,
                  color: "var(--text-primary)",
                  marginBottom: 6,
                }}
              >
                Email
              </label>
              <div className="relative">
                <Mail
                  className="absolute top-1/2 -translate-y-1/2"
                  style={{ left: 12, width: 16, height: 16, color: "var(--text-tertiary)" }}
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  required
                  style={inputStyle}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "var(--brand-400)")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border-default)")}
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: "var(--space-6)" }}>
              <label
                style={{
                  display: "block",
                  fontSize: 13,
                  fontWeight: 500,
                  color: "var(--text-primary)",
                  marginBottom: 6,
                }}
              >
                Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute top-1/2 -translate-y-1/2"
                  style={{ left: 12, width: 16, height: 16, color: "var(--text-tertiary)" }}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  style={{ ...inputStyle, paddingRight: 40 }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "var(--brand-400)")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border-default)")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-1/2 -translate-y-1/2"
                  style={{ right: 12, color: "var(--text-tertiary)", background: "none", border: "none", cursor: "pointer" }}
                >
                  {showPassword ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full"
              style={{ height: 42, fontSize: 14 }}
            >
              {loading ? "Signing in…" : "Sign In"}
              {!loading && <ArrowRight style={{ width: 16, height: 16 }} />}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3" style={{ margin: "var(--space-6) 0" }}>
            <div className="flex-1" style={{ height: 1, background: "var(--border-default)" }} />
            <span style={{ fontSize: 12, color: "var(--text-tertiary)" }}>or continue with</span>
            <div className="flex-1" style={{ height: 1, background: "var(--border-default)" }} />
          </div>

          {/* Google */}
          <button
            onClick={handleGoogle}
            disabled={loading}
            className="btn btn-secondary w-full"
            style={{ height: 42 }}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Sign in with Google
          </button>

          {/* Footer */}
          <p className="text-center" style={{ marginTop: "var(--space-6)", fontSize: 14, color: "var(--text-secondary)" }}>
            Don&apos;t have an account?{" "}
            <Link href="/register" style={{ fontWeight: 500, color: "var(--text-link)" }}>
              Create one
            </Link>
          </p>
        </div>
      </div>

      {/* ── Right: Brand Panel ──────────────── */}
      <div
        className="hidden lg:flex flex-col justify-center items-center px-12"
        style={{
          width: "45%",
          background: "var(--brand-700)",
          color: "var(--neutral-0)",
        }}
      >
        <div style={{ maxWidth: 360 }}>
          <p
            style={{
              fontFamily: "var(--font-display)",
              fontStyle: "italic",
              fontSize: 36,
              lineHeight: 1.25,
              marginBottom: "var(--space-6)",
            }}
          >
            Make the invisible, visible.
          </p>
          <p
            style={{
              fontSize: 15,
              lineHeight: 1.7,
              opacity: 0.8,
              marginBottom: "var(--space-10)",
            }}
          >
            Detect, prove, and fix algorithmic discrimination before it costs a life or a livelihood.
          </p>

          {/* Stat callouts */}
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
            {[
              { value: "63M", label: "MSMEs denied credit by biased models annually" },
              { value: "1 in 8", label: "Healthcare AI models show racial bias in diagnosis" },
              { value: "€30M", label: "Maximum EU AI Act fine for non-compliance" },
            ].map((stat) => (
              <div
                key={stat.value}
                style={{
                  paddingLeft: "var(--space-4)",
                  borderLeft: "2px solid rgba(255,255,255,0.25)",
                }}
              >
                <p
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontWeight: 600,
                    fontSize: 18,
                    marginBottom: 2,
                  }}
                >
                  {stat.value}
                </p>
                <p style={{ fontSize: 13, opacity: 0.7 }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
