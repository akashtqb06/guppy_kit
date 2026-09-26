import { Wrench, Package2 } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import { getCategories, getTools } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@guppy-kit/ui";
import { CategoryIcon } from "@/lib/icons";

import { DashboardStats } from "./DashboardStats";
import { DashboardGreeting, DashboardQuickActions, DashboardRecentExecutions } from "./DashboardClient";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const categories = await getCategories();
  const tools = await getTools();

  const recentTools = tools.slice(0, 3);

  return (
    <div className="px-8 py-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <DashboardGreeting />

      <DashboardQuickActions />

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left column (Main) */}
        <div className="flex-1 space-y-8 min-w-0">
          <DashboardStats toolsCount={tools.length} categoriesCount={categories.length} />

          {/* Quick access */}
          <section>
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Quick Start Tools
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {recentTools.map((tool) => (
                <Link key={tool.name} href={"/tools/" + tool.category + "/" + tool.name}>
                  <div className="relative group p-[1px] rounded-xl overflow-hidden bg-border hover:bg-gradient-to-r hover:from-brand hover:to-indigo-500 transition-all duration-300">
                    <div className="bg-card h-full rounded-[11px] p-4 flex items-center gap-3">
                      <CategoryIcon category={tool.category ?? "utilities"} className="h-5 w-5 text-muted-foreground group-hover:text-brand transition-colors" />
                      <div>
                        <p className="text-sm font-medium capitalize group-hover:text-foreground">{tool.name.replace(/-/g, ' ')}</p>
                        <p className="text-xs text-muted-foreground capitalize">{tool.category}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <DashboardRecentExecutions />
        </div>

        {/* Right column (Sidebar) */}
        <div className="lg:w-1/3 w-full shrink-0 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Explore Categories
          </h2>
          <div className="flex flex-col gap-3">
            {categories.map((family) => (
              <Link key={family.id} href={"/tools/" + family.id}>
                <Card className="h-full transition-all hover:border-foreground/20 hover:shadow-sm hover:-translate-y-0.5">
                  <CardHeader className="pb-2 flex flex-row items-center gap-3 space-y-0">
                    <div className="p-2 rounded-md bg-muted">
                      <CategoryIcon category={family.id} className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <CardTitle className="text-sm">{family.name}</CardTitle>
                      <CardDescription className="text-xs line-clamp-1">{family.description}</CardDescription>
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
