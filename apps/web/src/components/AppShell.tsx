"use client";
import { useEffect, useState } from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import type { CategorySummary } from "@/lib/api";
import { Button, Badge } from "@guppy-kit/ui";
import { GuppyLogo } from "@/components/GuppyLogo";
import { ThemeToggle } from "@/components/ThemeToggle";

export function AppShell({
  children,
  categories,
}: {
  children: React.ReactNode;
  categories: CategorySummary[];
}) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const router = useRouter();

  const [recentExecCount, setRecentExecCount] = useState(0);

  useEffect(() => {
    async function fetchExecs() {
      try {
        const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
        const res = await fetch(`${API_BASE}/api/v1/executions?limit=100`, { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          const count = Array.isArray(data) ? data.length : (data.items?.length || 0);
          setRecentExecCount(Math.min(count, 5));
        }
      } catch (e) {}
    }
    fetchExecs();
  }, []);

  async function handleLogout() {
    await logout();
    router.push("/");
  }

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: "⊞" },
    { href: "/history", label: "History", icon: "🕒" },
    { href: "/projects", label: "Projects", icon: "📁" },
    ...categories.map((c) => ({
      href: `/tools/${c.id}`,
      label: c.name,
      icon: c.icon,
    })),
  ];

  if (user?.is_admin) {
    navItems.push({ href: "/admin/users", label: "Admin", icon: "⚙️" });
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* ── Sidebar ── */}
      <aside
        id="app-sidebar"
        className="flex w-56 shrink-0 flex-col border-r border-border bg-sidebar"
      >
        {/* Logo */}
        <div className="flex h-14 items-center gap-2.5 border-b border-sidebar-border px-4">
          <GuppyLogo size={24} />
          <span className="text-sm font-bold tracking-tight text-sidebar-foreground">
            Guppy Kit
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-2">
          <ul className="space-y-0.5" role="list">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname.startsWith(item.href));
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                      isActive
                        ? "bg-sidebar-primary/10 text-brand font-medium"
                        : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground"
                    }`}
                  >
                    <span className="text-base">{item.icon}</span>
                    {item.label}
                    {item.href === "/history" && recentExecCount > 0 && (
                      <Badge variant="secondary" className="ml-auto text-[10px] px-1.5 py-0 h-5 bg-brand text-brand-foreground">
                        {recentExecCount}
                      </Badge>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User area */}
        <div className="border-t border-sidebar-border p-3">
          <div className="flex items-center gap-2.5 rounded-lg px-2 py-2">
            <div
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold bg-brand text-brand-foreground"
            >
              {user?.email?.[0]?.toUpperCase() ?? "?"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-sidebar-foreground">
                {user?.email ?? "…"}
              </p>
            </div>
            <Button
              id="app-logout-btn"
              onClick={handleLogout}
              title="Sign out"
              variant="ghost"
              size="icon"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </Button>
          </div>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-background px-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/dashboard" className="hover:text-foreground transition-colors">
              Home
            </Link>
            {pathname !== "/dashboard" && (
              <>
                <span>/</span>
                <span className="text-foreground capitalize">
                  {pathname.split("/").filter(Boolean).join(" / ")}
                </span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/"
              className="rounded-md px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              ← Back to home
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
