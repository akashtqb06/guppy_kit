"use client"
import { toast } from "sonner"
import { ToolWorkspace } from "@guppy-kit/ui"

interface ToolPageClientProps {
  tool: string
}

export function ToolPageClient({ tool }: ToolPageClientProps) {
  return (
    <ToolWorkspace
      toolName={tool}
      layout="split"
      onSuccess={({ duration_ms, tool_name }) => {
        toast.success(`${tool_name.replace(/-/g, ' ')} completed in ${Math.round(duration_ms)}ms`)
      }}
      onError={(err) => toast.error(err)}
    />
  )
}

