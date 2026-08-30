import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Guppy Kit — Professional Digital Workbench",
};

const TOOL_FAMILIES = [
  {
    id: "data",
    name: "Data",
    description: "Convert, profile, clean, and transform tabular data.",
    icon: "📊",
    color: "oklch(0.55 0.22 240)",
    tools: ["CSV → JSON", "Excel → JSON", "JSON formatter", "Data profiler"],
  },
  {
    id: "documents",
    name: "Documents",
    description: "Convert, merge, split, and compare files.",
    icon: "📄",
    color: "oklch(0.55 0.2 160)",
    tools: ["PDF → Text", "Markdown → PDF", "PDF merger", "DOCX → PDF"],
  },
  {
    id: "developer",
    name: "Developer",
    description: "Format, encode, decode, validate, and generate.",
    icon: "⚡",
    color: "oklch(0.55 0.25 60)",
    tools: ["JSON formatter", "JWT decoder", "Base64", "Regex tester"],
  },
  {
    id: "database",
    name: "Database",
    description: "Design schemas, generate SQL, and visualize relationships.",
    icon: "🗄️",
    color: "oklch(0.55 0.22 30)",
    tools: ["SQL formatter", "Schema designer", "ER diagram", "SQL validator"],
  },
  {
    id: "visualization",
    name: "Visualization",
    description: "Charts, diagrams, flowcharts, and architecture maps.",
    icon: "📈",
    color: "oklch(0.55 0.24 300)",
    tools: ["Bar chart", "Line chart", "Flowchart", "Architecture diagram"],
  },
  {
    id: "presentation",
    name: "Presentation",
    description: "Create, edit, and export slide decks.",
    icon: "🎯",
    color: "oklch(0.55 0.22 350)",
    tools: ["Slide builder", "Chart → Slide", "Export PPTX", "Export PDF"],
  },
  {
    id: "workflow",
    name: "Workflow",
    description: "Chain tools together in visual data pipelines.",
    icon: "🔁",
    color: "oklch(0.55 0.2 190)",
    tools: ["Pipeline builder", "Scheduled runs", "Step branching", "Error handling"],
  },
  {
    id: "utilities",
    name: "Utilities",
    description: "Hash, encode, convert, diff, and miscellaneous helpers.",
    icon: "🔧",
    color: "oklch(0.55 0.18 90)",
    tools: ["Hash generator", "URL encoder", "Timestamp converter", "Color picker"],
  },
];

const POPULAR_TOOLS = [
  { name: "JSON Formatter", family: "developer", description: "Beautify and validate JSON" },
  { name: "CSV → JSON", family: "data", description: "Convert spreadsheet data to JSON" },
  { name: "URL Encoder", family: "developer", description: "Encode or decode URLs" },
  { name: "Hash Generator", family: "utilities", description: "MD5, SHA-1, SHA-256, SHA-512" },
  { name: "JWT Decoder", family: "developer", description: "Inspect and decode JWT tokens" },
  { name: "Base64", family: "developer", description: "Encode and decode Base64 strings" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ── Navigation ── */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div
              className="flex h-7 w-7 items-center justify-center rounded-lg"
              style={{ background: "oklch(0.5 0.25 264)" }}
            >
              <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
              </svg>
            </div>
            <span className="text-sm font-bold">Guppy Kit</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              id="nav-get-started"
              className="rounded-lg px-4 py-1.5 text-sm font-semibold text-white transition-all hover:opacity-90"
              style={{ background: "oklch(0.5 0.25 264)" }}
            >
              Get started free
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden px-6 py-24 text-center">
        {/* Gradient background */}
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div
            className="absolute left-1/2 top-0 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/3 rounded-full opacity-15"
            style={{ background: "radial-gradient(ellipse, oklch(0.6 0.25 264) 0%, transparent 70%)" }}
          />
        </div>
        <div className="relative mx-auto max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-1 text-xs text-muted-foreground">
            <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: "oklch(0.65 0.25 160)" }} />
            Phase 1 — Capability Layer · Open Source MIT
          </div>
          <h1 className="mb-5 text-5xl font-extrabold tracking-tight leading-tight md:text-6xl">
            Your Professional
            <br />
            <span style={{ color: "oklch(0.55 0.25 264)" }}>Digital Workbench</span>
          </h1>
          <p className="mb-8 text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            One place to convert data, design databases, build visualizations, create presentations,
            and run developer utilities — all composable, all with a REST API and MCP interface.
          </p>

          {/* Search bar */}
          <form
            id="hero-search-form"
            className="mx-auto mb-8 flex max-w-xl overflow-hidden rounded-xl border border-border bg-card shadow-lg"
          >
            <input
              id="hero-search"
              type="search"
              placeholder="Search tools… e.g. CSV, JWT, SQL, diagram"
              className="flex-1 bg-transparent px-5 py-3.5 text-sm outline-none placeholder:text-muted-foreground"
            />
            <button
              type="submit"
              id="hero-search-btn"
              className="m-1.5 rounded-lg px-5 py-2 text-sm font-semibold text-white"
              style={{ background: "oklch(0.5 0.25 264)" }}
            >
              Search
            </button>
          </form>

          <div className="flex flex-wrap justify-center gap-2 text-xs text-muted-foreground">
            <span>Popular:</span>
            {["JSON formatter", "CSV → JSON", "JWT decoder", "SQL formatter", "Base64"].map((t) => (
              <button
                key={t}
                className="rounded-full border border-border px-2.5 py-0.5 transition-colors hover:border-foreground/30 hover:text-foreground"
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tool Families ── */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold tracking-tight">8 Tool Families</h2>
            <p className="mt-2 text-muted-foreground">
              Everything a data analyst, developer, or operations team needs — in one place.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {TOOL_FAMILIES.map((family) => (
              <Link
                key={family.id}
                href={`/tools/${family.id}`}
                id={`family-card-${family.id}`}
                className="group rounded-2xl border border-border bg-card p-6 transition-all duration-200 hover:border-transparent hover:shadow-lg hover:-translate-y-0.5"
                style={{ "--family-color": family.color } as React.CSSProperties}
              >
                <div
                  className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl text-2xl shadow-sm"
                  style={{ background: `${family.color}20` }}
                >
                  {family.icon}
                </div>
                <h3 className="mb-1 font-semibold">{family.name}</h3>
                <p className="mb-4 text-xs text-muted-foreground leading-relaxed">
                  {family.description}
                </p>
                <ul className="space-y-1">
                  {family.tools.slice(0, 3).map((tool) => (
                    <li key={tool} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span className="h-1 w-1 rounded-full bg-muted-foreground/50" />
                      {tool}
                    </li>
                  ))}
                  <li className="text-xs font-medium" style={{ color: family.color }}>
                    + more →
                  </li>
                </ul>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Popular Tools ── */}
      <section className="px-6 py-16 bg-muted/30">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold tracking-tight">Popular Tools</h2>
            <p className="mt-2 text-muted-foreground">Start with the most-used tools</p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {POPULAR_TOOLS.map((tool) => (
              <Link
                key={tool.name}
                href={`/tools/${tool.family}/${tool.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-all hover:border-foreground/20 hover:shadow-sm"
              >
                <div className="text-xl">🛠️</div>
                <div>
                  <p className="text-sm font-semibold">{tool.name}</p>
                  <p className="text-xs text-muted-foreground">{tool.description}</p>
                </div>
                <svg className="ml-auto h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Feature highlights ── */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              {
                icon: "🔗",
                title: "Tools Compose",
                description:
                  "Every tool output is a typed artifact. Pass it directly to the next tool — no downloads, no manual file management.",
              },
              {
                icon: "🔌",
                title: "REST API + MCP",
                description:
                  "Every tool has a REST endpoint and an MCP interface — out of the box, no extra code required.",
              },
              {
                icon: "📦",
                title: "Open Source",
                description:
                  "MIT licensed. Self-host it, extend it, add your own tools, and keep full control of your data.",
              },
            ].map((feature) => (
              <div key={feature.title} className="text-center">
                <div className="mb-4 text-4xl">{feature.icon}</div>
                <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-6 py-20 text-center">
        <div className="mx-auto max-w-2xl">
          <h2 className="mb-4 text-3xl font-bold tracking-tight">
            Ready to get started?
          </h2>
          <p className="mb-8 text-muted-foreground">
            Free to use. Open source. No credit card required.
          </p>
          <Link
            href="/register"
            id="cta-get-started"
            className="inline-flex items-center gap-2 rounded-xl px-8 py-3.5 text-base font-semibold text-white transition-all hover:opacity-90 hover:scale-105"
            style={{ background: "oklch(0.5 0.25 264)" }}
          >
            Start building for free →
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border px-6 py-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between text-xs text-muted-foreground">
          <span>© 2026 Guppy Kit — MIT License</span>
          <div className="flex gap-4">
            <Link href="/docs" className="hover:text-foreground transition-colors">Docs</Link>
            <Link href="https://github.com" className="hover:text-foreground transition-colors">GitHub</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
