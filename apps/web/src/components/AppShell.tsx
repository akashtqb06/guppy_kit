"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import type { CategorySummary } from "@/lib/api";
import { GuppyLogo } from "@/components/GuppyLogo";
import { LayoutDashboard, History, FolderClosed, Settings, LogOut, Package2 } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Badge,
  Avatar,
  AvatarFallback,
} from "@guppy-kit/ui";

export function AppShell({
  children,
  categories,
}: {
  children: React.ReactNode;
  categories: CategorySummary[];
}) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const router = useRouter();
  const [recentExecCount, setRecentExecCount] = useState(0);

  useEffect(() => {
    async function fetchExecs() {
      try {
        const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
        const res = await fetch(`${API_BASE}/api/v1/executions?limit=100`, { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          const count = Array.isArray(data) ? data.length : (data.items?.length || 0);
          setRecentExecCount(Math.min(count, 5));
        }
      } catch (e) {}
    }
    fetchExecs();
  }, []);

  async function handleLogout() {
    await logout();
    router.push("/");
  }

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
    { href: "/history", label: "History", icon: <History className="h-4 w-4" /> },
    { href: "/projects", label: "Projects", icon: <FolderClosed className="h-4 w-4" /> },
    ...categories.map((c) => ({
      href: `/tools/${c.id}`,
      label: c.name,
      icon: <Package2 className="h-4 w-4" />,
    })),
  ];

  if (user?.is_admin) {
    navItems.push({ href: "/admin/users", label: "Admin", icon: <Settings className="h-4 w-4" /> });
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-background overflow-hidden">
        {/* ── Sidebar ── */}
        <Sidebar variant="sidebar" collapsible="icon">
          <SidebarHeader className="h-14 border-b border-sidebar-border flex items-center px-4">
            <div className="flex items-center gap-2.5 w-full">
              <GuppyLogo size={24} />
              <span className="text-sm font-bold tracking-tight text-sidebar-foreground group-data-[collapsible=icon]:hidden">
                Guppy Kit
              </span>
            </div>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarMenu>
                {navItems.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/dashboard" && pathname.startsWith(item.href));
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton isActive={isActive} tooltip={item.label} render={<Link href={item.href} className="flex items-center gap-2.5" />}>
                        <span className="text-base">{item.icon}</span>
                        <span className="flex-1">{item.label}</span>
                        {item.href === "/history" && recentExecCount > 0 && (
                          <Badge variant="secondary" className="ml-auto text-[10px] px-1.5 py-0 h-5 bg-brand text-brand-foreground group-data-[collapsible=icon]:hidden">
                            {recentExecCount}
                          </Badge>
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-sidebar-border">
            <SidebarMenu>
              <SidebarMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger render={<SidebarMenuButton size="lg" className="w-full" />}>
                    <Avatar className="h-6 w-6 rounded-md">
                      <AvatarFallback className="bg-brand text-brand-foreground rounded-md text-xs font-bold">
                        {user?.email?.[0]?.toUpperCase() ?? "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1 truncate text-xs font-medium text-sidebar-foreground group-data-[collapsible=icon]:hidden ml-2">
                      {user?.email ?? "…"}
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem className="text-xs text-muted-foreground">
                      {user?.email}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        {/* ── Main content ── */}
        <div className="flex flex-1 flex-col overflow-hidden w-full relative">
          {/* Top bar */}
          <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-background px-4 lg:px-6">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-2" />
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
