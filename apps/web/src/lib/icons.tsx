import {
  BarChart3,
  FileText,
  Code2,
  Database,
  BarChart2,
  Presentation,
  GitBranch,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";

/** Maps category/family IDs to Lucide icon components */
export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  data: BarChart3,
  documents: FileText,
  developer: Code2,
  database: Database,
  visualization: BarChart2,
  presentation: Presentation,
  workflow: GitBranch,
  utilities: Wrench,
};

/** Returns the Lucide icon for a category, defaulting to Zap */
export function getCategoryIcon(category: string): LucideIcon {
  return CATEGORY_ICONS[category.toLowerCase()] ?? Zap;
}

/** Renders a category icon as a JSX element */
export function CategoryIcon({
  category,
  className = "h-5 w-5",
}: {
  category: string;
  className?: string;
}) {
  const Icon = getCategoryIcon(category);
  return <Icon className={className} />;
}

