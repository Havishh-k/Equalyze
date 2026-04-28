"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useEffect } from "react";
import {
  LayoutDashboard,
  FileSearch,
  Plus,
  Activity,
  User,
  Users,
  LogOut,
  Loader2,
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();

  // Auth guard
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--surface-base)" }}
      >
        <Loader2
          className="w-6 h-6 animate-spinner"
          style={{ color: "var(--brand-500)" }}
        />
      </div>
    );
  }

  if (!user) return null;

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/audits/new", label: "New Audit", icon: Plus },
    { href: "/dashboard/audits", label: "All Audits", icon: FileSearch },
    { href: "/dashboard/counterfactual", label: "Twin Explorer", icon: Users },
    { href: "/dashboard/monitoring", label: "Monitoring", icon: Activity },
  ];

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  // Build breadcrumb from pathname
  const segments = pathname.split("/").filter(Boolean);
  const breadcrumb = segments.map((seg, i) => ({
    label: seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, " "),
    href: "/" + segments.slice(0, i + 1).join("/"),
  }));

  return (
    <div className="flex min-h-screen" style={{ background: "var(--surface-base)" }}>
      {/* ── Sidebar ──────────────────────── */}
      <aside
        className="w-60 flex flex-col fixed left-0 top-0 bottom-0 z-40"
        style={{
          background: "var(--surface-sidebar)",
          borderRight: "1px solid var(--border-default)",
        }}
      >
        {/* Logo */}
        <div
          className="px-5 py-4 flex items-center gap-2"
          style={{ borderBottom: "1px solid var(--border-default)" }}
        >
          <span
            style={{
              fontFamily: "var(--font-body)",
              fontWeight: 700,
              fontSize: "18px",
              color: "var(--text-primary)",
              letterSpacing: "-0.01em",
            }}
          >
            Equalyze
          </span>
        </div>

        {/* Section Label */}
        <div className="px-5 pt-5 pb-1">
          <span className="text-label-sm">Navigation</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-1 space-y-0.5">
          {navItems.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2 text-sm transition-all"
                style={{
                  borderRadius: "var(--radius-md)",
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? "var(--brand-600)" : "var(--text-secondary)",
                  background: isActive ? "var(--brand-50)" : "transparent",
                }}
              >
                <item.icon
                  style={{
                    width: 18,
                    height: 18,
                    color: isActive ? "var(--brand-500)" : "var(--text-tertiary)",
                  }}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Bottom section label */}
        <div className="px-5 pb-1">
          <span className="text-label-sm">Account</span>
        </div>

        {/* User profile */}
        <div
          className="px-3 py-3"
          style={{ borderTop: "1px solid var(--border-default)" }}
        >
          <div
            className="flex items-center gap-3 px-3 py-2.5"
            style={{
              borderRadius: "var(--radius-md)",
              background: "var(--surface-card)",
              border: "1px solid var(--border-default)",
            }}
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                background: "var(--brand-100)",
                color: "var(--brand-600)",
              }}
            >
              <User style={{ width: 14, height: 14 }} />
            </div>
            <div className="flex-1 min-w-0">
              <p
                className="text-xs font-semibold truncate"
                style={{ color: "var(--text-primary)" }}
              >
                {user.displayName || user.email?.split("@")[0] || "User"}
              </p>
              <p
                className="truncate"
                style={{
                  fontSize: "10px",
                  color: "var(--text-tertiary)",
                }}
              >
                {user.email}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded transition-all"
              style={{
                color: "var(--text-tertiary)",
                borderRadius: "var(--radius-sm)",
              }}
              title="Sign out"
            >
              <LogOut style={{ width: 14, height: 14 }} />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main Content ─────────────────── */}
      <main className="flex-1 ml-60">
        {/* Top Bar — 56px */}
        <header
          className="sticky top-0 z-30 px-8 flex items-center justify-between"
          style={{
            height: 56,
            background: "var(--surface-card)",
            borderBottom: "1px solid var(--border-default)",
          }}
          role="banner"
        >
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-sm" aria-label="Breadcrumb">
            {breadcrumb.map((crumb, i) => (
              <span key={crumb.href} className="flex items-center gap-1.5">
                {i > 0 && (
                  <span style={{ color: "var(--text-tertiary)" }}>/</span>
                )}
                {i === breadcrumb.length - 1 ? (
                  <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                    {crumb.label}
                  </span>
                ) : (
                  <Link
                    href={crumb.href}
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {crumb.label}
                  </Link>
                )}
              </span>
            ))}
          </nav>

          <div />
        </header>

        {/* Page Content — 32px padding */}
        <div style={{ padding: "var(--space-8)" }}>{children}</div>
      </main>
    </div>
  );
}
