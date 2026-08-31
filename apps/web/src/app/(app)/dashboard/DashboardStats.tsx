"use client";

import { useEffect, useState } from "react";
import { Card } from "@guppy-kit/ui";

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
      <Card className="p-5 flex items-center gap-4">
        <div className="text-3xl">🛠️</div>
        <div>
          <p className="text-2xl font-bold">{toolsCount}</p>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Tools Available</p>
        </div>
      </Card>
      <Card className="p-5 flex items-center gap-4">
        <div className="text-3xl">🗂️</div>
        <div>
          <p className="text-2xl font-bold">{categoriesCount}</p>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Categories</p>
        </div>
      </Card>
      <Card className="p-5 flex items-center gap-4">
        <div className="text-3xl">⚡</div>
        <div>
          <p className="text-2xl font-bold">{executionsCount !== null ? executionsCount : "..."}</p>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">Recent Executions</p>
        </div>
      </Card>
    </div>
  );
}
