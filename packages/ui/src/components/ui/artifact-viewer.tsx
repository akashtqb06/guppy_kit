"use client"
import * as React from "react"
import { Skeleton } from "./skeleton"
import { Button } from "./button"
import { cn } from "../../lib/utils"

export interface ArtifactViewerProps {
  output: any
  artifactType?: string | undefined;
  isLoading?: boolean
}

export function ArtifactViewer({ output, artifactType, isLoading }: ArtifactViewerProps) {
  const [copied, setCopied] = React.useState(false)

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    )
  }

  if (!output) {
    return <div className="text-sm text-muted-foreground italic">No output available.</div>
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(typeof output === 'string' ? output : JSON.stringify(output, null, 2))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const content = typeof output === 'string' ? output : JSON.stringify(output, null, 2)

  return (
    <div className="relative group rounded-lg border bg-muted/50 p-4">
      <Button 
        variant="ghost" 
        size="sm" 
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={copyToClipboard}
      >
        {copied ? "Copied!" : "Copy"}
      </Button>
      {artifactType === "svg" && typeof output === 'string' ? (
        <div dangerouslySetInnerHTML={{ __html: output }} />
      ) : (
        <pre className="text-sm font-mono overflow-auto whitespace-pre-wrap">{content}</pre>
      )}
    </div>
  )
}
