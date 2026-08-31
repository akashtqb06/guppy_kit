"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { Input, Card, CardHeader, CardTitle, CardContent, CardDescription, Badge } from "@guppy-kit/ui";
import { Wrench, Search } from "lucide-react";

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
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveCategory("all")}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            activeCategory === "all" 
              ? "bg-brand text-brand-foreground" 
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          All ({tools.length})
        </button>
        {categories.map(cat => {
          const count = tools.filter(t => t.category === cat.id).length;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                activeCategory === cat.id 
                  ? "bg-brand text-brand-foreground" 
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {cat.name} ({count})
            </button>
          );
        })}
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
          <Link key={tool.name} href={"/tools/" + tool.category + "/" + tool.name}>
            <Card className="h-full transition-all hover:border-foreground/20 hover:shadow-sm hover:-translate-y-0.5">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Wrench className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <CardTitle className="text-sm capitalize">
                      {tool.name.replace(/-/g, ' ')}
                    </CardTitle>
                  </div>
                  <Badge variant="secondary" className="text-[10px] capitalize shrink-0">
                    {tool.category}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-xs line-clamp-2">
                  {tool.description}
                </CardDescription>
                {tool.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {tool.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
      
      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Wrench className="h-10 w-10 text-muted-foreground mb-4" />
          <p className="font-medium">No tools found</p>
          <p className="text-sm text-muted-foreground mt-1">Try a different search or category filter</p>
        </div>
      )}
    </div>
  );
}
