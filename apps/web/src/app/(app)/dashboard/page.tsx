import { Wrench, Package2 } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";
import { getCategories, getTools } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@guppy-kit/ui";

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
            <Link key={tool.name} href={"/tools/" + tool.category + "/" + tool.name}>
              <Card className="flex items-center gap-3 p-4 transition-all hover:border-foreground/20 hover:shadow-sm">
                <Wrench className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium capitalize">{tool.name.replace(/-/g, ' ')}</p>
                  <p className="text-xs text-muted-foreground capitalize">{tool.category}</p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Explore tool families */}
      <section>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Explore Tool Families
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((family) => (
            <Link key={family.id} href={"/tools/" + family.id}>
              <Card className="h-full transition-all hover:border-foreground/20 hover:shadow-sm hover:-translate-y-0.5">
                <CardHeader className="pb-2">
                  <Package2 className="h-6 w-6 text-muted-foreground mb-2" />
                  <CardTitle className="text-sm">{family.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-xs">{family.description}</CardDescription>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
