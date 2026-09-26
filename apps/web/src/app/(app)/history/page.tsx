"use client";
import { useEffect, useState, useCallback } from "react";
import { Badge, Button, Card, CardContent, Input } from "@guppy-kit/ui";
import { Search, Clock, CheckCircle2, XCircle, Download, RefreshCw, Filter } from "lucide-react";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface Execution {
  id: string;
  tool_name: string;
  tool_version: string;
  status: "completed" | "failed" | "running";
  duration_ms: number | null;
  artifact_id: string | null;
  started_at: string;
  completed_at: string | null;
  caller_type: string | null;
}

export default function HistoryPage() {
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "completed" | "failed">("all");
  const [view, setView] = useState<"list" | "timeline">("list");

  const fetchExecutions = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/executions?limit=100`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setExecutions(Array.isArray(data) ? data : (data.items ?? []));
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchExecutions(); }, [fetchExecutions]);

  const filtered = executions.filter(e => {
    const matchSearch = !search || e.tool_name.includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || e.status === statusFilter;
    return matchSearch && matchStatus;
  });

  function timeAgo(iso: string) {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  }

  const completedCount = executions.filter(e => e.status === "completed").length;
  const failedCount = executions.filter(e => e.status === "failed").length;
  const avgDuration = executions
    .filter(e => e.duration_ms !== null)
    .reduce((acc, e, _, arr) => acc + (e.duration_ms! / arr.length), 0);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="border-b border-border bg-background px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold">History</h1>
            <p className="text-sm text-muted-foreground">
              {executions.length} executions · {completedCount} completed · {failedCount} failed
              {avgDuration > 0 && ` · avg ${avgDuration.toFixed(0)}ms`}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchExecutions} className="gap-1.5">
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>
        </div>

        {/* Stats mini cards */}
        <div className="mt-4 grid grid-cols-3 gap-3">
          {[
            { label: "Total", value: executions.length, color: "text-foreground" },
            { label: "Success", value: completedCount, color: "text-emerald-600" },
            { label: "Failed", value: failedCount, color: "text-destructive" },
          ].map(s => (
            <div key={s.label} className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-center">
              <div className={`text-2xl font-bold tabular-nums ${s.color}`}>{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 border-b border-border bg-background px-6 py-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Filter by tool name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 h-8 text-sm"
          />
        </div>
        <div className="flex items-center gap-1">
          {(["all", "completed", "failed"] as const).map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border ${
                statusFilter === s
                  ? "bg-foreground text-background border-foreground"
                  : "border-border text-muted-foreground hover:border-foreground/30"
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-muted border-t-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Clock className="h-10 w-10 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">{search ? "No matching executions" : "No executions yet"}</p>
            {!search && <Link href="/tools"><Button variant="outline" size="sm">Explore tools</Button></Link>}
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map(exec => (
              <div key={exec.id} className="flex items-center gap-4 px-6 py-3 hover:bg-muted/30 transition-colors">
                {/* Status icon */}
                <div className="shrink-0">
                  {exec.status === "completed" ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  ) : exec.status === "failed" ? (
                    <XCircle className="h-4 w-4 text-destructive" />
                  ) : (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-brand border-t-transparent" />
                  )}
                </div>
                {/* Tool info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/tools/${exec.tool_name.split('-')[0]}/${exec.tool_name}`}
                      className="text-sm font-medium capitalize hover:underline truncate"
                    >
                      {exec.tool_name.replace(/-/g, ' ')}
                    </Link>
                    <Badge variant="outline" className="text-[10px] shrink-0">
                      v{exec.tool_version}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {timeAgo(exec.started_at)}
                    {exec.duration_ms !== null && ` · ${exec.duration_ms.toFixed(0)}ms`}
                    {exec.caller_type && ` · via ${exec.caller_type}`}
                  </div>
                </div>
                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {exec.artifact_id && (
                    <a
                      href={`${API_BASE}/api/v1/artifacts/${exec.artifact_id}/download`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                        <Download className="h-3.5 w-3.5" />
                      </Button>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
