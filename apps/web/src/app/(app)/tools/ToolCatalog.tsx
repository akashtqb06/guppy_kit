"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { Input, Card, CardHeader, CardTitle, CardContent, CardDescription, Badge, cn } from "@guppy-kit/ui";
import { Wrench, Search, ArrowRight } from "lucide-react";
import { CategoryIcon } from "@/lib/icons";

interface Tool {
  name: string;
  category: string;
  description: string;
  tags: string[];
  icon?: string;
}

interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export function ToolCatalog({ tools, categories }: { tools: Tool[]; categories: Category[] }) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  
  const filtered = useMemo(() => {
    return tools.filter(tool => {
      const matchesSearch = !search || 
        tool.name.toLowerCase().includes(search.toLowerCase()) ||
        tool.description.toLowerCase().includes(search.toLowerCase()) ||
        tool.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
      const matchesCategory = activeCategory === "all" || tool.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [tools, search, activeCategory]);

  const countByCat = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const tool of tools) {
      counts[tool.category] = (counts[tool.category] || 0) + 1;
    }
    return counts;
  }, [tools]);
  
  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Tool Catalog</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {tools.length} tools across {categories.length} categories
        </p>
      </div>
      
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search tools..." 
          className="pl-9"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      
      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        <button
          onClick={() => setActiveCategory("all")}
          className={cn(
            "shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors border",
            activeCategory === "all"
              ? "bg-foreground text-background border-foreground"
              : "bg-muted text-muted-foreground border-border hover:border-foreground/30"
          )}
        >
          All <span className="ml-1 opacity-60">{tools.length}</span>
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={cn(
              "shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors border flex items-center",
              activeCategory === cat.id
                ? "bg-foreground text-background border-foreground"
                : "bg-muted text-muted-foreground border-border hover:border-foreground/30"
            )}
          >
            <span className="flex items-center gap-1.5">
              <CategoryIcon category={cat.id} className="h-3 w-3" />
              {cat.name} <span className="ml-1 opacity-60">{countByCat[cat.id] || 0}</span>
            </span>
          </button>
        ))}
      </div>
      
      {/* Results count */}
      {search && (
        <p className="text-sm text-muted-foreground">
          {filtered.length} result{filtered.length !== 1 ? 's' : ''} for "{search}"
        </p>
      )}
      
      {/* Tool Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map(tool => (
          <Link key={tool.name} href={"/tools/" + tool.category + "/" + tool.name} className="group block">
            <Card className="h-full transition-all hover:border-foreground/20 hover:shadow-sm hover:-translate-y-0.5 relative">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <CategoryIcon category={tool.category ?? "utilities"} className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <CardTitle className="text-sm capitalize group-hover:text-foreground">
                      {tool.name.replace(/-/g, ' ')}
                    </CardTitle>
                  </div>
                  <Badge variant="secondary" className="text-[10px] capitalize shrink-0">
                    {tool.category}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-xs line-clamp-2 pr-6">
                  {tool.description}
                </CardDescription>
                {tool.tags && tool.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {tool.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
      
      {filtered.length === 0 && (
        <div className="col-span-full py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mx-auto mb-3">
            <Search className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="font-medium">No tools found</p>
          <p className="text-sm text-muted-foreground">Try a different search or category</p>
        </div>
      )}
    </div>
  );
}
