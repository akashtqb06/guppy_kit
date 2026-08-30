import { AppShell } from "@/components/AppShell";
import { getCategories } from "@/lib/api";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const categories = await getCategories();
  return <AppShell categories={categories}>{children}</AppShell>;
}
