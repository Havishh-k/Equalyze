"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useEffect } from "react";
import {
  LayoutDashboard,
  FileSearch,
  Plus,
  Scale,
  Shield,
  Activity,
  User,
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
        style={{ background: "var(--bg-primary)" }}
      >
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--accent-blue)" }} />
      </div>
    );
  }

  if (!user) return null;

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/audits/new", label: "New Audit", icon: Plus },
    { href: "/dashboard/audits", label: "All Audits", icon: FileSearch },
    { href: "/dashboard/monitoring", label: "Monitoring", icon: Activity },
  ];

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <div className="flex min-h-screen" style={{ background: "var(--bg-primary)" }}>
      {/* ── Sidebar ──────────────────────── */}
      <aside
        className="w-64 flex flex-col fixed left-0 top-0 bottom-0 z-40"
        style={{
          background: "var(--bg-secondary)",
          borderRight: "1px solid var(--border-default)",
        }}
      >
        {/* Logo */}
        <div className="px-6 py-5 flex items-center gap-3" style={{ borderBottom: "1px solid var(--border-default)" }}>
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #3B82F6, #8B5CF6)" }}
          >
            <Scale className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold text-white">Equalyze</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all"
                style={{
                  color: isActive ? "white" : "var(--text-secondary)",
                  background: isActive ? "rgba(59, 130, 246, 0.12)" : "transparent",
                  border: isActive ? "1px solid rgba(59, 130, 246, 0.2)" : "1px solid transparent",
                }}
              >
                <item.icon className="w-4.5 h-4.5" style={{ color: isActive ? "var(--accent-blue)" : "var(--text-muted)" }} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User profile */}
        <div className="px-4 py-4" style={{ borderTop: "1px solid var(--border-default)" }}>
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl" style={{ background: "var(--bg-card)" }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, #3B82F6, #8B5CF6)" }}>
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">
                {user.displayName || user.email?.split("@")[0] || "User"}
              </p>
              <p className="text-[10px] truncate" style={{ color: "var(--text-muted)" }}>
                {user.email}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg transition-all hover:opacity-80"
              style={{ color: "var(--text-muted)" }}
              title="Sign out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main Content ─────────────────── */}
      <main className="flex-1 ml-64">
        {/* Top Bar */}
        <header
          className="sticky top-0 z-30 px-8 py-4 flex items-center justify-between"
          style={{
            background: "rgba(6, 10, 27, 0.85)",
            backdropFilter: "blur(20px)",
            borderBottom: "1px solid var(--border-default)",
          }}
        >
          <div>
            <h1 className="text-lg font-semibold text-white">
              {navItems.find((n) => n.href === pathname)?.label || "Equalyze"}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs" style={{ background: "var(--bg-card)", color: "var(--text-secondary)" }}>
              <Shield className="w-3.5 h-3.5" style={{ color: "var(--severity-green)" }} />
              Authenticated
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
