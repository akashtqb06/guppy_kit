import Link from "next/link";
import type { Metadata } from "next";
import { getCategories, getTools } from "@/lib/api";
import { Badge, Card, CardContent, CardHeader, CardTitle } from "@guppy-kit/ui";
import { ArrowRight } from "lucide-react";

import { getCategoryIcon } from "@/lib/icons";

interface Props {
  params: Promise<{ family: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { family } = await params;
  const categories = await getCategories();
  const info = categories.find((c) => c.id === family);
  return { title: info?.name ?? family };
}

export default async function ToolFamilyPage({ params }: Props) {
  const { family } = await params;
  const [categories, tools] = await Promise.all([getCategories(), getTools()]);
  const cat = categories.find(c => c.id === family);
  const familyTools = tools.filter(t => t.category === family || (t as any).family === family);
  
  const Icon = getCategoryIcon(family);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      {/* Hero */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/10">
            <Icon className="h-8 w-8 text-brand" />
          </div>
          <div>
            <h1 className="text-2xl font-bold capitalize">{family.replace(/-/g, " ")}</h1>
            <p className="text-sm text-muted-foreground">{familyTools.length} tools</p>
          </div>
        </div>
        {cat?.description && <p className="text-muted-foreground">{cat.description}</p>}
      </div>
      {/* Tools grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {familyTools.map(tool => (
          <Link key={tool.name} href={`/tools/${family}/${tool.name}`}>
            <Card className="h-full transition-all hover:border-foreground/20 hover:shadow-sm hover:-translate-y-0.5">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm capitalize">{tool.name.replace(/-/g, " ")}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground line-clamp-2">{tool.description}</p>
                {tool.tags && tool.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {tool.tags.slice(0, 3).map((tag: string) => (
                      <Badge key={tag} variant="outline" className="text-[10px]">{tag}</Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
