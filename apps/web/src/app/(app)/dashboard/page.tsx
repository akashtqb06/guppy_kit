import Link from "next/link";
import type { Metadata } from "next";
import { getCategories, getTools } from "@/lib/api";

import { DashboardStats } from "./DashboardStats";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const categories = await getCategories();
  const tools = await getTools();

  const recentTools = tools.slice(0, 3); // Proxy for recent/popular for now

  return (
    <div className="px-8 py-8 max-w-5xl mx-auto space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Welcome back. What are you working on today?
        </p>
      </div>

      {/* Stats */}
      <DashboardStats toolsCount={tools.length} categoriesCount={categories.length} />

      {/* Quick access */}
      <section>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Quick Start
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {recentTools.map((tool) => (
            <Link
              key={tool.name}
              href={`/tools/${tool.category}/${tool.name}`}
              className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-all hover:border-foreground/20 hover:shadow-sm"
            >
              <span className="text-xl">{tool.icon || "🛠️"}</span>
              <div>
                <p className="text-sm font-medium capitalize">{tool.name.replace(/-/g, ' ')}</p>
                <p className="text-xs text-muted-foreground capitalize">{tool.category}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Explore tool families */}
      <section>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Explore Tool Families
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((family) => (
            <Link
              key={family.id}
              href={`/tools/${family.id}`}
              className="rounded-xl border border-border bg-card p-5 transition-all hover:border-foreground/20 hover:shadow-sm hover:-translate-y-0.5"
            >
              <span className="text-2xl">{family.icon}</span>
              <p className="mt-3 font-semibold text-sm">{family.name}</p>
              <p className="text-xs text-muted-foreground mt-1">{family.description}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Milestone status */}
      <section>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Platform Status
        </h2>
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-2 w-2 rounded-full animate-pulse" style={{ background: "oklch(0.65 0.22 160)" }} />
            <span className="text-sm font-medium">Milestone 1 — Foundation in Progress</span>
          </div>
          <div className="space-y-2">
            {[
              { label: "Tool Registry + Runtime", done: true },
              { label: "Auth (cookie + session)", done: true },
              { label: "Database schema + migrations", done: true },
              { label: "Artifact service", done: false },
              { label: "Event bus", done: false },
              { label: "MCP server", done: false },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2 text-sm">
                <span className={item.done ? "text-green-500" : "text-muted-foreground"}>
                  {item.done ? "✓" : "○"}
                </span>
                <span className={item.done ? "" : "text-muted-foreground"}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
