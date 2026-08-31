/**
 * Client-side API utilities for tools and categories.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export interface CategorySummary {
  id: string;
  name: string;
  icon: string;
  description: string;
  tool_count: number;
}

export interface ToolSummary {
  name: string;
  version: string;
  category: string;
  description: string;
  icon?: string;
  tags: string[];
  input_artifact_types: string[];
  output_artifact_type: string;
}

export interface ToolDetail extends ToolSummary {
  input_schema: Record<string, unknown>;
}

/**
 * Fetch all tool categories.
 */
export async function getCategories(): Promise<CategorySummary[]> {
  const res = await fetch(`${API_BASE}/api/v1/tools/categories`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error("Failed to fetch categories");
  }
  return res.json() as Promise<CategorySummary[]>;
}

/**
 * Fetch all tools, optionally filtered by category.
 */
export async function getTools(category?: string): Promise<ToolSummary[]> {
  const url = new URL(`${API_BASE}/api/v1/tools`);
  if (category) {
    url.searchParams.set("category", category);
  }
  const res = await fetch(url.toString(), {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error("Failed to fetch tools");
  }
  return res.json() as Promise<ToolSummary[]>;
}

/**
 * Fetch details for a specific tool.
 */
export async function getTool(name: string): Promise<ToolDetail> {
  const res = await fetch(`${API_BASE}/api/v1/tools/${name}`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch tool ${name}`);
  }
  return res.json() as Promise<ToolDetail>;
}
