"use client"
import * as React from "react"
import { Skeleton } from "./skeleton"
import { Button } from "./button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs"
import { cn } from "../../lib/utils"
import mermaid from "mermaid"

function JsonTree({ data, depth = 0 }: { data: unknown; depth?: number }) {
  const [isExpanded, setIsExpanded] = React.useState(depth < 5)

  if (data === null) return <span className="text-gray-500">null</span>
  if (typeof data === "string") return <span className="text-green-600">"{data}"</span>
  if (typeof data === "number") return <span className="text-blue-600">{data}</span>
  if (typeof data === "boolean") return <span className="text-purple-600">{data ? "true" : "false"}</span>

  if (Array.isArray(data)) {
    if (data.length === 0) return <span>[]</span>
    if (!isExpanded) {
      return (
        <span 
          className="cursor-pointer text-blue-600 hover:underline" 
          onClick={() => setIsExpanded(true)}
        >
          [...] ({data.length} items)
        </span>
      )
    }
    return (
      <span>
        <span className="cursor-pointer" onClick={() => setIsExpanded(false)}>{"["}</span>
        <div className="ml-4 border-l pl-2">
          {data.map((item, i) => (
            <div key={i}>
              <JsonTree data={item} depth={depth + 1} />
              {i < data.length - 1 ? "," : ""}
            </div>
          ))}
        </div>
        <span>{"]"}</span>
      </span>
    )
  }

  if (typeof data === "object") {
    const keys = Object.keys(data as Record<string, unknown>)
    if (keys.length === 0) return <span>{"{}"}</span>
    if (!isExpanded) {
      return (
        <span 
          className="cursor-pointer text-blue-600 hover:underline" 
          onClick={() => setIsExpanded(true)}
        >
          {"{...}"} ({keys.length} keys)
        </span>
      )
    }
    return (
      <span>
        <span className="cursor-pointer" onClick={() => setIsExpanded(false)}>{"{"}</span>
        <div className="ml-4 border-l pl-2">
          {keys.map((key, i) => (
            <div key={key}>
              <span className="text-gray-700 font-medium">"{key}"</span>:{" "}
              <JsonTree data={(data as Record<string, unknown>)[key]} depth={depth + 1} />
              {i < keys.length - 1 ? "," : ""}
            </div>
          ))}
        </div>
        <span>{"}"}</span>
      </span>
    )
  }

  return <span>{String(data)}</span>
}

function MermaidDiagram({ chart }: { chart: string }) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    mermaid.initialize({ startOnLoad: false })
    const renderChart = async () => {
      try {
        if (containerRef.current) {
          containerRef.current.innerHTML = ''
          const { svg } = await mermaid.render(`mermaid-${Math.random().toString(36).substring(7)}`, chart)
          containerRef.current.innerHTML = svg
        }
      } catch (err) {
        setError(String(err))
      }
    }
    renderChart()
  }, [chart])

  if (error) {
    return (
      <div className="p-4 border border-red-300 bg-red-50 text-red-700 rounded-lg whitespace-pre-wrap font-mono text-sm overflow-auto">
        Error rendering diagram:\n{error}\n\n{chart}
      </div>
    )
  }

  return <div ref={containerRef} className="w-full overflow-auto rounded-lg border border-border bg-background p-4 flex justify-center" />
}

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

  const outputString = typeof output === 'string' ? output : JSON.stringify(output, null, 2)
  const isSvg = artifactType === "svg" || (typeof output === 'string' && output.trim().startsWith("<svg"))
  const isHtml = artifactType === "html"
  const isJson = artifactType === "json" || typeof output === "object"
  
  let mermaidMatch = null
  if (typeof output === 'string') {
    const m = output.match(/```mermaid\s+([\s\S]*?)```/)
    if (m) mermaidMatch = m[1]
  }
  const isMermaid = !!mermaidMatch

  const CopyButton = () => (
    <Button 
      variant="ghost" 
      size="sm" 
      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-background/80"
      onClick={copyToClipboard}
    >
      {copied ? "Copied!" : "Copy"}
    </Button>
  )

  if (isSvg || isHtml || isMermaid) {
    return (
      <div className="relative group flex flex-col h-full space-y-2">
        <Tabs defaultValue="preview" className="w-full h-full flex flex-col">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="raw">Raw</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="preview" className="flex-1 min-h-0 mt-2 relative">
            <CopyButton />
            {isSvg && (
              <div 
                className="w-full h-full min-h-[24rem] overflow-auto rounded-lg border border-border bg-background p-2 flex items-center justify-center" 
                dangerouslySetInnerHTML={{ __html: outputString }} 
              />
            )}
            {isHtml && (
              <iframe
                srcDoc={outputString}
                sandbox="allow-scripts"
                className="h-96 w-full rounded-lg border border-border bg-white"
                title="HTML Preview"
              />
            )}
            {isMermaid && mermaidMatch && (
              <MermaidDiagram chart={mermaidMatch} />
            )}
          </TabsContent>
          
          <TabsContent value="raw" className="flex-1 min-h-0 mt-2 relative">
            <CopyButton />
            <div className="rounded-lg border bg-muted/50 p-4 h-full min-h-[24rem] overflow-auto">
              <pre className="text-sm font-mono whitespace-pre-wrap">{outputString}</pre>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    )
  }

  return (
    <div className="relative group rounded-lg border bg-muted/50 p-4">
      <CopyButton />
      {isJson && typeof output === "object" ? (
        <div className="text-sm font-mono overflow-auto whitespace-pre-wrap">
          <JsonTree data={output} />
        </div>
      ) : (
        <pre className="text-sm font-mono overflow-auto whitespace-pre-wrap">{outputString}</pre>
      )}
    </div>
  )
}
