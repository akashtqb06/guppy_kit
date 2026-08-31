import Link from "next/link";
import type { Metadata } from "next";
import { getCategories, getTools } from "@/lib/api";
import { Button } from "@guppy-kit/ui";
import { GuppyLogo } from "@/components/GuppyLogo";
import { HeroSearch } from "@/components/HeroSearch";

export const metadata: Metadata = {
  title: "Guppy Kit — Professional Digital Workbench",
};

export default async function LandingPage() {
  const categories = await getCategories();
  const allTools = await getTools();

  // For the landing page, we want a few popular tools to highlight
  // Here we just pick the first 6 tools as a proxy for "popular"
  const popularTools = allTools.slice(0, 6);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ── Navigation ── */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <GuppyLogo />
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
              className="rounded-lg px-4 py-1.5 text-sm font-semibold transition-all hover:opacity-90 bg-brand text-brand-foreground"
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
            className="absolute left-1/2 top-0 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/3 rounded-full opacity-15 bg-brand"
            style={{ backgroundImage: "radial-gradient(ellipse, var(--color-brand) 0%, transparent 70%)" }}
          />
        </div>
        <div className="relative mx-auto max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-1 text-xs text-muted-foreground">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-brand" />
            Phase 1 — Capability Layer · Open Source MIT
          </div>
          <h1 className="mb-5 text-5xl font-extrabold tracking-tight leading-tight md:text-6xl">
            Your Professional
            <br />
            <span className="text-brand">Digital Workbench</span>
          </h1>
          <p className="mb-8 text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            One place to convert data, design databases, build visualizations, create presentations,
            and run developer utilities — all composable, all with a REST API and MCP interface.
          </p>

          {/* Search bar */}
          <HeroSearch tools={allTools} />

          <div className="flex flex-wrap justify-center gap-2 text-xs text-muted-foreground">
            <span>Popular:</span>
            {popularTools.map((t) => (
              <Button
                key={t.name}
                variant="outline"
                size="sm"
                className="rounded-full px-2.5 py-0.5 capitalize"
              >
                {t.name.replace(/-/g, ' ')}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tool Families ── */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold tracking-tight">{categories.length} Tool Families</h2>
            <p className="mt-2 text-muted-foreground">
              Everything a data analyst, developer, or operations team needs — in one place.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((family) => {
              const familyTools = allTools.filter((t) => t.category === family.id);
              return (
                <Link
                  key={family.id}
                  href={`/tools/${family.id}`}
                  id={`family-card-${family.id}`}
                  className="group rounded-2xl border border-border bg-card p-6 transition-all duration-200 hover:border-transparent hover:shadow-lg hover:-translate-y-0.5"
                >
                  <div
                    className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl text-2xl shadow-sm bg-muted"
                  >
                    {family.icon}
                  </div>
                  <h3 className="mb-1 font-semibold">{family.name}</h3>
                  <p className="mb-4 text-xs text-muted-foreground leading-relaxed">
                    {family.description}
                  </p>
                  <ul className="space-y-1">
                    {familyTools.slice(0, 3).map((tool) => (
                      <li key={tool.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <span className="h-1 w-1 rounded-full bg-muted-foreground/50" />
                        <span className="capitalize">{tool.name.replace(/-/g, ' ')}</span>
                      </li>
                    ))}
                    {familyTools.length > 3 && (
                      <li className="text-xs font-medium text-muted-foreground mt-2">
                        + {familyTools.length - 3} more →
                      </li>
                    )}
                  </ul>
                </Link>
              );
            })}
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
            {popularTools.map((tool) => (
              <div
                key={tool.name}
                className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-all hover:border-foreground/20 hover:shadow-sm"
              >
                <div className="text-xl">{tool.icon || "🛠️"}</div>
                <div>
                  <p className="text-sm font-semibold capitalize">{tool.name.replace(/-/g, ' ')}</p>
                  <p className="text-xs text-muted-foreground mb-2">{tool.description}</p>
                  <Link href={`/tools/${tool.category}/${tool.name}`} className="text-xs text-brand hover:underline">
                    Try it →
                  </Link>
                </div>
                <svg className="ml-auto h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
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
            className="inline-flex items-center gap-2 rounded-xl px-8 py-3.5 text-base font-semibold transition-all hover:opacity-90 hover:scale-105 bg-brand text-brand-foreground"
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
