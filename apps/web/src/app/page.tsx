import Link from "next/link";
import type { Metadata } from "next";
import { getCategories, getTools } from "@/lib/api";
import { Button, Badge, Card, CardContent, CardHeader, CardTitle, CardDescription } from "@guppy-kit/ui";
import { Zap, Database, FileText, BarChart3, Code2, Layers, Shield, Clock, ArrowRight } from "lucide-react";
import { GuppyLogo } from "@/components/GuppyLogo";
import { HeroSearch } from "@/components/HeroSearch";
import { CategoryIcon } from "@/lib/icons";

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
      {/* 1. Navigation */}
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
            <Button nativeButton={false} render={<Link href="/register" id="nav-get-started" />} className="bg-brand text-brand-foreground hover:opacity-90">
              Get started free
            </Button>
          </div>
        </div>
      </nav>

      {/* 2. Hero Section */}
      <section className="relative px-6 py-24 text-center">
        {/* Animated gradient background — overflow-hidden here keeps the orb inside */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden flex justify-center" aria-hidden="true">
          <div
            className="absolute -top-1/2 h-[800px] w-[1000px] animate-pulse rounded-full opacity-20 bg-brand blur-3xl"
            style={{ backgroundImage: "radial-gradient(circle, var(--color-brand) 0%, transparent 60%)" }}
          />
        </div>
        <div className="relative mx-auto max-w-4xl z-10">
          <Badge variant="outline" className="mb-6 rounded-full border-border bg-muted/50 px-4 py-1.5 text-xs text-muted-foreground backdrop-blur-sm">
            <span className="mr-2 inline-block h-2 w-2 rounded-full bg-brand animate-pulse" />
            Guppy Kit 1.0 is now live
          </Badge>
          <h1 className="mb-6 text-6xl font-black tracking-tight sm:text-7xl">
            Every tool you need,
            <span className="block mt-2 text-brand" style={{ color: 'var(--color-brand)' }}>right here.</span>
          </h1>
          <p className="mb-10 text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            40+ professional tools for data, documents, databases, and developer workflows. All in one place. No installs.
          </p>
          <div className="mb-14 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button nativeButton={false} render={<Link href="/register" />} size="lg" className="h-12 px-8 bg-brand text-brand-foreground hover:opacity-90 rounded-xl text-base w-full sm:w-auto">
              Get started free <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button nativeButton={false} render={<Link href="/tools" />} size="lg" variant="outline" className="h-12 px-8 rounded-xl text-base w-full sm:w-auto bg-background/50 backdrop-blur">
              Explore tools
            </Button>
          </div>

          {/* Search bar */}
          <div className="max-w-2xl mx-auto">
             <HeroSearch tools={allTools} />
          </div>
        </div>
      </section>

      {/* 3. Stats Strip */}
      <section className="border-y border-border bg-muted/30">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-border/50">
            <div className="flex flex-col items-center justify-center">
              <div className="text-4xl font-black text-foreground mb-2">40+</div>
              <div className="text-sm text-muted-foreground font-medium flex items-center gap-2"><Zap className="h-4 w-4 text-brand" /> Tools</div>
            </div>
            <div className="flex flex-col items-center justify-center">
              <div className="text-4xl font-black text-foreground mb-2">8</div>
              <div className="text-sm text-muted-foreground font-medium flex items-center gap-2"><Layers className="h-4 w-4 text-brand" /> Categories</div>
            </div>
            <div className="flex flex-col items-center justify-center">
              <div className="text-4xl font-black text-foreground mb-2">100%</div>
              <div className="text-sm text-muted-foreground font-medium flex items-center gap-2"><Code2 className="h-4 w-4 text-brand" /> Open Source</div>
            </div>
            <div className="flex flex-col items-center justify-center">
              <div className="text-4xl font-black text-foreground mb-2">Zero</div>
              <div className="text-sm text-muted-foreground font-medium flex items-center gap-2"><Clock className="h-4 w-4 text-brand" /> Install</div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Feature Bento Grid */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold tracking-tight mb-4">Everything you need to ship faster</h2>
            <p className="text-lg text-muted-foreground">A unified workspace that replaces dozens of single-purpose apps and disjointed scripts.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2 bg-gradient-to-br from-card to-muted/50 border-border/50 overflow-hidden group">
              <CardContent className="p-8 h-full flex flex-col justify-between">
                <div>
                  <div className="h-12 w-12 rounded-xl bg-brand/10 flex items-center justify-center text-brand mb-6 group-hover:scale-110 transition-transform">
                    <Zap className="h-6 w-6" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">Instant Execution</h3>
                  <p className="text-muted-foreground">Run complex operations in milliseconds. No servers to provision, no dependencies to install. Just input your data and get results instantly.</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-card to-muted/50 border-border/50 overflow-hidden group">
              <CardContent className="p-8 h-full flex flex-col justify-between">
                <div>
                  <div className="h-12 w-12 rounded-xl bg-brand/10 flex items-center justify-center text-brand mb-6 group-hover:scale-110 transition-transform">
                    <Shield className="h-6 w-6" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">Private & Secure</h3>
                  <p className="text-muted-foreground">Your data never leaves your control. Local-first execution for sensitive workloads.</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-card to-muted/50 border-border/50 overflow-hidden group">
              <CardContent className="p-8 h-full flex flex-col justify-between">
                <div>
                  <div className="h-12 w-12 rounded-xl bg-brand/10 flex items-center justify-center text-brand mb-6 group-hover:scale-110 transition-transform">
                    <Database className="h-6 w-6" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">Data Tooling</h3>
                  <p className="text-muted-foreground">Transform, query, and visualize data without writing boilerplate.</p>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2 bg-gradient-to-br from-card to-muted/50 border-border/50 overflow-hidden group">
              <CardContent className="p-8 h-full flex flex-col justify-between">
                <div>
                  <div className="h-12 w-12 rounded-xl bg-brand/10 flex items-center justify-center text-brand mb-6 group-hover:scale-110 transition-transform">
                    <Layers className="h-6 w-6" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">Composable Artifacts</h3>
                  <p className="text-muted-foreground">Tools aren't silos. The output of one tool seamlessly becomes the input for the next, creating powerful automated workflows.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* 5. Category Showcase */}
      <section className="px-6 py-24 bg-muted/20 border-y border-border">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold tracking-tight mb-2">Explore by Category</h2>
              <p className="text-muted-foreground">Find exactly what you need from our extensive library.</p>
            </div>
            <Button nativeButton={false} variant="ghost" render={<Link href="/tools" />} className="shrink-0">
              View all categories <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex overflow-x-auto pb-8 -mx-6 px-6 gap-4 snap-x snap-mandatory hide-scrollbar">
            {categories.map((family) => {
              const familyTools = allTools.filter((t) => t.category === family.id);
              return (
                <Link
                  key={family.id}
                  href={`/tools/${family.id}`}
                  className="snap-start shrink-0 w-[280px] sm:w-[320px] group rounded-2xl border border-border bg-card p-6 transition-all duration-200 hover:border-brand/50 hover:shadow-md block relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-brand/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500" />
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center text-2xl group-hover:bg-brand group-hover:text-brand-foreground transition-colors">
                        <CategoryIcon category={family.id} className="h-6 w-6" />
                      </div>
                      <Badge variant="secondary" className="font-mono">{familyTools.length} tools</Badge>
                    </div>
                    <h3 className="text-xl font-bold mb-2">{family.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {family.description}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. Popular Tools Grid */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Most Popular Tools</h2>
            <p className="text-muted-foreground">The tools our community relies on every day.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularTools.map((tool) => (
              <Link
                key={tool.name}
                href={`/tools/${tool.category}/${tool.name}`}
                className="group block"
              >
                <Card className="h-full transition-all hover:border-brand/50 hover:shadow-md overflow-hidden bg-card/50 backdrop-blur-sm">
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="text-3xl"><CategoryIcon category={tool.category || "utilities"} className="h-6 w-6" /></div>
                      <Badge variant="outline" className="bg-background capitalize">{tool.category.replace(/-/g, ' ')}</Badge>
                    </div>
                    <CardTitle className="capitalize text-lg">{tool.name.replace(/-/g, ' ')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{tool.description}</p>
                    <div className="flex items-center text-sm font-medium text-brand opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 transform duration-200">
                      Try this tool <ArrowRight className="ml-1 h-4 w-4" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 7. How It Works */}
      <section className="px-6 py-24 bg-muted/30">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold tracking-tight mb-4">How Guppy Kit Works</h2>
            <p className="text-muted-foreground">A unified pipeline from input to insight.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-[2px] bg-border border-dashed border-b-2" />
            
            <div className="relative text-center z-10">
              <div className="h-24 w-24 mx-auto bg-background border-4 border-muted rounded-full flex items-center justify-center mb-6 shadow-sm">
                <FileText className="h-10 w-10 text-brand" />
              </div>
              <h3 className="text-xl font-bold mb-2">1. Select a Tool</h3>
              <p className="text-muted-foreground text-sm">Choose from 40+ specialized tools across categories like data, documents, and dev.</p>
            </div>
            
            <div className="relative text-center z-10">
              <div className="h-24 w-24 mx-auto bg-background border-4 border-muted rounded-full flex items-center justify-center mb-6 shadow-sm">
                <Zap className="h-10 w-10 text-brand" />
              </div>
              <h3 className="text-xl font-bold mb-2">2. Execute</h3>
              <p className="text-muted-foreground text-sm">Provide inputs and run instantly. Processing happens securely and fast.</p>
            </div>
            
            <div className="relative text-center z-10">
              <div className="h-24 w-24 mx-auto bg-background border-4 border-muted rounded-full flex items-center justify-center mb-6 shadow-sm">
                <BarChart3 className="h-10 w-10 text-brand" />
              </div>
              <h3 className="text-xl font-bold mb-2">3. Get Artifacts</h3>
              <p className="text-muted-foreground text-sm">Receive typed, reusable artifacts you can export or pipe into the next tool.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. CTA Banner */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <div className="relative rounded-3xl overflow-hidden bg-brand text-brand-foreground px-8 py-16 text-center">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at center, white 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-black mb-6">Ready to upgrade your workflow?</h2>
              <p className="text-brand-foreground/80 text-lg mb-10 max-w-2xl mx-auto">
                Join thousands of developers and data professionals building faster with Guppy Kit.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button nativeButton={false} render={<Link href="/register" />} size="lg" variant="secondary" className="h-14 px-8 rounded-xl text-base font-bold w-full sm:w-auto">
                  Start building for free
                </Button>
                <p className="mt-4 sm:hidden text-sm opacity-80">No credit card required.</p>
              </div>
              <p className="hidden sm:block mt-6 text-sm opacity-80">No credit card required. Open source.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 9. Footer */}
      <footer className="border-t border-border bg-background">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <GuppyLogo />
              <span className="font-bold">Guppy Kit</span>
            </div>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <Link href="/tools" className="hover:text-foreground transition-colors">Tools</Link>
              <a href="https://github.com/guppy-kit" target="_blank" rel="noreferrer" className="hover:text-foreground transition-colors">GitHub</a>
              <Link href="/login" className="hover:text-foreground transition-colors">Sign in</Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-border/50 text-center md:text-left text-xs text-muted-foreground flex flex-col md:flex-row justify-between">
            <p>© {new Date().getFullYear()} Guppy Kit. Open Source.</p>
            <p className="mt-2 md:mt-0">MIT License</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
