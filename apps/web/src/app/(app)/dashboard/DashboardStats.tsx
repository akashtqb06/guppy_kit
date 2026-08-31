"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@guppy-kit/ui";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export function DashboardStats({ toolsCount, categoriesCount }: { toolsCount: number, categoriesCount: number }) {
  const [executionsCount, setExecutionsCount] = useState<number | null>(null);

  useEffect(() => {
    async function fetchExecutions() {
      try {
        const res = await fetch(`${API_BASE}/api/v1/executions?limit=5`, {
          credentials: "include"
        });
        if (res.ok) {
          const data = await res.json();
          // Assuming data is an array or has an items array
          const count = Array.isArray(data) ? data.length : (data.items?.length || 0);
          setExecutionsCount(count);
        }
      } catch (e) {
        setExecutionsCount(0);
      }
    }
    fetchExecutions();
  }, []);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-10">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Tools Available</CardTitle>
          <div className="text-xl">🛠️</div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{toolsCount}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Categories</CardTitle>
          <div className="text-xl">🗂️</div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{categoriesCount}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium uppercase tracking-wider text-muted-foreground">Recent Executions</CardTitle>
          <div className="text-xl">⚡</div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{executionsCount !== null ? executionsCount : "..."}</div>
        </CardContent>
      </Card>
    </div>
  );
}
