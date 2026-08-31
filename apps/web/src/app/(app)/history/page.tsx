"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge, Skeleton, Button, Dialog, DialogContent, DialogHeader, DialogTitle } from "@guppy-kit/ui";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

interface Execution {
  execution_id: string;
  tool_name: string;
  tool_version?: string;
  status: string;
  duration_ms: number;
  created_at: string;
  input_snapshot?: any;
  artifact_id?: string;
}

export default function HistoryPage() {
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [selectedExec, setSelectedExec] = useState<Execution | null>(null);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const res = await fetch(`${API_BASE}/api/v1/executions?limit=50`, { credentials: "include" });
        if (!res.ok) throw new Error("Failed to load history");
        const data = await res.json();
        setExecutions(Array.isArray(data) ? data : (data.items || []));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error loading history");
      } finally {
        setIsLoading(false);
      }
    }
    fetchHistory();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
      case "success":
        return <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20">Completed</Badge>;
      case "failed":
      case "error":
        return <Badge variant="destructive">Failed</Badge>;
      case "running":
        return <Badge className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20">Running</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (error) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center">
        <div className="mb-4 text-4xl text-red-500">⚠️</div>
        <h2 className="mb-2 text-xl font-semibold">Error</h2>
        <p className="mb-6 text-sm text-muted-foreground max-w-md">{error}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-8 max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold tracking-tight mb-8">History</h1>
        <div className="space-y-4">
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (executions.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center">
        <div className="mb-4 text-4xl">📜</div>
        <h2 className="mb-2 text-xl font-semibold">No executions yet</h2>
        <p className="mb-6 text-sm text-muted-foreground max-w-md">
          Run a tool to see your history.
        </p>
        <Link href="/dashboard">
          <Button className="bg-brand text-brand-foreground hover:bg-brand/90">Go to Dashboard</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold tracking-tight mb-8">History</h1>
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/50 text-muted-foreground border-b border-border">
            <tr>
              <th className="px-6 py-4 font-medium">Tool</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Duration</th>
              <th className="px-6 py-4 font-medium">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {executions.map((exec) => (
              <tr 
                key={exec.execution_id} 
                className="hover:bg-muted/30 transition-colors cursor-pointer"
                onClick={() => setSelectedExec(exec)}
              >
                <td className="px-6 py-4">
                  <span className="font-medium text-foreground capitalize">
                    {exec.tool_name.replace(/-/g, ' ')}
                  </span>
                </td>
                <td className="px-6 py-4">{getStatusBadge(exec.status)}</td>
                <td className="px-6 py-4 text-muted-foreground">
                  {exec.duration_ms ? `${exec.duration_ms.toFixed(0)} ms` : "—"}
                </td>
                <td className="px-6 py-4 text-muted-foreground">
                  {new Date(exec.created_at).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={!!selectedExec} onOpenChange={(open) => !open && setSelectedExec(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <span className="capitalize">{selectedExec?.tool_name.replace(/-/g, ' ')}</span>
              <Badge variant="outline" className="font-normal text-xs">{selectedExec?.tool_version || "1.0.0"}</Badge>
              {selectedExec && getStatusBadge(selectedExec.status)}
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground font-medium mb-1">Started</p>
                <p>{selectedExec ? new Date(selectedExec.created_at).toLocaleString() : "-"}</p>
              </div>
              <div>
                <p className="text-muted-foreground font-medium mb-1">Duration</p>
                <p>{selectedExec?.duration_ms ? `${selectedExec.duration_ms.toFixed(0)} ms` : "-"}</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-muted-foreground font-medium text-sm">Input Snapshot</p>
              <pre className="p-4 rounded-lg bg-muted text-xs overflow-x-auto border">
                {JSON.stringify(selectedExec?.input_snapshot || { message: "No input provided" }, null, 2)}
              </pre>
            </div>

            {selectedExec?.artifact_id && (
              <div className="space-y-2 pt-2 border-t">
                <p className="text-muted-foreground font-medium text-sm mb-2">Artifact</p>
                <Button variant="outline">
                  <span className="mr-2">⬇️</span>
                  Download Artifact ({selectedExec.artifact_id})
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
