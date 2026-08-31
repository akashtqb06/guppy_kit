import type { Metadata } from "next";
import { getCategories, getTools } from "@/lib/api";
import { ToolCatalog } from "./ToolCatalog";

export const metadata: Metadata = { title: "Tool Catalog" };

export default async function ToolsPage() {
  const [tools, categories] = await Promise.all([getTools(), getCategories()]);
  return <ToolCatalog tools={tools} categories={categories} />;
}
