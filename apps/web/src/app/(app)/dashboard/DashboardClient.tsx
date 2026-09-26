"use client";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, Badge, Button } from "@guppy-kit/ui";
import { Clock, CheckCircle2, XCircle, Play, FolderPlus, History, BookOpen } from "lucide-react";
import Link from "next/link";

export function DashboardGreeting() {
  const { user } = useAuth();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const name = user?.email?.split('@')[0] ?? 'there';
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">{greeting}, {name}!</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Welcome back. What are you working on today?
      </p>
    </div>
  );
}

export function DashboardQuickActions() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
      {[
        { title: "Run a Tool", icon: <Play className="h-5 w-5" />, href: "/tools", color: "text-brand" },
        { title: "New Project", icon: <FolderPlus className="h-5 w-5" />, href: "/projects/new", color: "text-emerald-500" },
        { title: "View History", icon: <History className="h-5 w-5" />, href: "/history", color: "text-blue-500" },
        { title: "API Docs", icon: <BookOpen className="h-5 w-5" />, href: "http://localhost:8000/docs", color: "text-amber-500", external: true },
      ].map((action, i) => {
        const content = (
          <Card className="hover:border-foreground/30 hover:shadow-sm transition-all h-full">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center gap-2 h-full">
              <div className={`p-2 rounded-full bg-muted ${action.color}`}>
                {action.icon}
              </div>
              <span className="text-sm font-medium">{action.title}</span>
            </CardContent>
          </Card>
        );
        return action.external ? (
          <a key={i} href={action.href} target="_blank" rel="noopener noreferrer">{content}</a>
        ) : (
          <Link key={i} href={action.href}>{content}</Link>
        );
      })}
    </div>
  );
}

export function DashboardRecentExecutions() {
  const [executions, setExecutions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchExecs() {
      try {
        const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
        const res = await fetch(`${API_BASE}/api/v1/executions?limit=5`, { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setExecutions(Array.isArray(data) ? data : (data.items ?? []));
        }
      } finally {
        setLoading(false);
      }
    }
    fetchExecs();
  }, []);

  function timeAgo(iso: string) {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  }

  return (
    <Card className="mt-8">
      <CardHeader className="pb-3 border-b border-border">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            Recent Executions
          </CardTitle>
          <Link href="/history">
            <Button variant="ghost" size="sm" className="text-xs">View all</Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Loading...</div>
        ) : executions.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">No recent executions</div>
        ) : (
          <div className="divide-y divide-border">
            {executions.map((exec) => (
              <div key={exec.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-3">
                  {exec.status === "completed" ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  ) : exec.status === "failed" ? (
                    <XCircle className="h-4 w-4 text-destructive" />
                  ) : (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-brand border-t-transparent" />
                  )}
                  <div>
                    <Link
                      href={`/tools/${exec.tool_name.split('-')[0]}/${exec.tool_name}`}
                      className="text-sm font-medium capitalize hover:underline"
                    >
                      {exec.tool_name.replace(/-/g, ' ')}
                    </Link>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {timeAgo(exec.started_at)} {exec.duration_ms && `· ${exec.duration_ms.toFixed(0)}ms`}
                    </div>
                  </div>
                </div>
                <Badge variant="outline" className="text-[10px]">v{exec.tool_version}</Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
