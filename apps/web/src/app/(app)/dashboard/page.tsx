import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard" };

const RECENT_TOOLS = [
  { name: "JSON Formatter", family: "developer", icon: "⚡" },
  { name: "CSV → JSON", family: "data", icon: "📊" },
  { name: "Hash Generator", family: "utilities", icon: "🔧" },
];

const FAMILY_CARDS = [
  { id: "data", name: "Data", icon: "📊", desc: "Convert, profile, and transform" },
  { id: "developer", name: "Developer", icon: "⚡", desc: "Format, decode, validate" },
  { id: "database", name: "Database", icon: "🗄️", desc: "SQL, schemas, ER diagrams" },
  { id: "visualization", name: "Visualization", icon: "📈", desc: "Charts and diagrams" },
];

import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="px-8 py-8 max-w-5xl mx-auto space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Welcome back. What are you working on today?
        </p>
      </div>

      {/* Quick access */}
      <section>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Quick Start
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {RECENT_TOOLS.map((tool) => (
            <Link
              key={tool.name}
              href={`/tools/${tool.family}/${tool.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
              className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-all hover:border-foreground/20 hover:shadow-sm"
            >
              <span className="text-xl">{tool.icon}</span>
              <div>
                <p className="text-sm font-medium">{tool.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{tool.family}</p>
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
          {FAMILY_CARDS.map((family) => (
            <Link
              key={family.id}
              href={`/tools/${family.id}`}
              className="rounded-xl border border-border bg-card p-5 transition-all hover:border-foreground/20 hover:shadow-sm hover:-translate-y-0.5"
            >
              <span className="text-2xl">{family.icon}</span>
              <p className="mt-3 font-semibold text-sm">{family.name}</p>
              <p className="text-xs text-muted-foreground mt-1">{family.desc}</p>
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
