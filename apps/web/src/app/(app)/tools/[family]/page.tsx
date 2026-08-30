import Link from "next/link";
import type { Metadata } from "next";
import { getCategories, getTools } from "@/lib/api";

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
  
  const categories = await getCategories();
  const info = categories.find((c) => c.id === family);
  
  if (!info) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Unknown tool family: {family}</p>
      </div>
    );
  }

  const tools = await getTools(family);

  return (
    <div className="px-8 py-8 max-w-4xl">
      <div className="mb-8 flex items-center gap-4">
        <span className="text-4xl">{info.icon}</span>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{info.name}</h1>
          <p className="text-sm text-muted-foreground">{info.description}</p>
        </div>
      </div>

      {tools.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
          No tools registered in this category yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {tools.map((tool) => (
            <Link
              key={tool.name}
              href={`/tools/${family}/${tool.name}`}
              id={`tool-link-${tool.name}`}
              className="flex items-start gap-4 rounded-xl border border-border bg-card p-5 transition-all hover:border-foreground/20 hover:shadow-sm hover:-translate-y-0.5"
            >
              <div
                className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm bg-muted"
              >
                🛠️
              </div>
              <div>
                <p className="font-semibold text-sm capitalize">{tool.name.replace(/-/g, ' ')}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{tool.description}</p>
              </div>
              <svg className="ml-auto mt-1 h-4 w-4 shrink-0 text-muted-foreground/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
