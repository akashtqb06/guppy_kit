"use client"
import { useEffect, useState, useRef } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@guppy-kit/ui"
import { Wrench, FolderOpen, Zap } from "lucide-react"

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"

// Animated number counter hook
function useCounter(target: number, duration = 1000) {
  const [count, setCount] = useState(0)
  const frameRef = useRef<number>(0)
  useEffect(() => {
    const start = performance.now()
    const tick = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      // ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(eased * target))
      if (progress < 1) frameRef.current = requestAnimationFrame(tick)
    }
    frameRef.current = requestAnimationFrame(tick)
    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current) }
  }, [target, duration])
  return count
}

interface Execution {
  id: string
  tool_name: string
  status: string
  duration_ms: number
  started_at: string
}

function StatCard({ label, value, icon, description }: { label: string; value: number; icon: React.ReactNode; description?: string }) {
  const animated = useCounter(value)
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        <div className="h-8 w-8 rounded-lg bg-brand/10 text-brand flex items-center justify-center">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold tabular-nums">{animated}</div>
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
      </CardContent>
    </Card>
  )
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export function DashboardStats({ toolsCount, categoriesCount }: { toolsCount: number; categoriesCount: number }) {
  const [executions, setExecutions] = useState<Execution[]>([])

  useEffect(() => {
    fetch(`${API_BASE}/api/v1/executions?limit=5`, { credentials: "include" })
      .then(r => r.ok ? r.json() : [])
      .then(d => setExecutions(Array.isArray(d) ? d : []))
      .catch(() => {})
  }, [])

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Tools Available" value={toolsCount} icon={<Wrench className="h-4 w-4" />} description="Across 8 categories" />
        <StatCard label="Categories" value={categoriesCount} icon={<FolderOpen className="h-4 w-4" />} description="Data, Docs, Dev & more" />
        <StatCard label="Recent Executions" value={executions.length} icon={<Zap className="h-4 w-4" />} description="In your session" />
      </div>

      {/* Activity feed */}
      {executions.length > 0 && (
        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Recent Activity</h2>
          <div className="space-y-2">
            {executions.map(exec => (
              <div key={exec.id} className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3">
                <div className={`h-2 w-2 rounded-full shrink-0 ${
                  exec.status === 'completed' ? 'bg-green-500' : exec.status === 'failed' ? 'bg-red-500' : 'bg-yellow-500'
                }`} />
                <span className="text-sm font-medium capitalize flex-1">{exec.tool_name.replace(/-/g, ' ')}</span>
                <span className="text-xs text-muted-foreground">{exec.duration_ms ? `${Math.round(exec.duration_ms)}ms` : ''}</span>
                <span className="text-xs text-muted-foreground">{timeAgo(exec.started_at)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
