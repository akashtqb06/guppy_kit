"use client"
import * as React from "react"
import { Skeleton } from "./skeleton"
import { Button } from "./button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs"
import { cn } from "../../lib/utils"
import mermaid from "mermaid"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./table"
import { ScrollArea } from "./scroll-area"
import { Dialog, DialogContent, DialogTitle } from "./dialog"
import { Download } from "lucide-react"

function JsonTree({ data, depth = 0 }: { data: unknown; depth?: number }) {
  const [isExpanded, setIsExpanded] = React.useState(depth < 5)

  if (data === null) return <span className="text-muted-foreground">null</span>
  if (typeof data === "string") return <span className="text-emerald-600 dark:text-emerald-400">"{data}"</span>
  if (typeof data === "number") return <span className="text-blue-500 dark:text-blue-400">{data}</span>
  if (typeof data === "boolean") return <span className="text-violet-600 dark:text-violet-400">{data ? "true" : "false"}</span>

  if (Array.isArray(data)) {
    if (data.length === 0) return <span>[]</span>
    if (!isExpanded) {
      return (
        <span 
          className="cursor-pointer text-blue-500 dark:text-blue-400 hover:underline" 
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
          className="cursor-pointer text-blue-500 dark:text-blue-400 hover:underline" 
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
              <span className="text-foreground font-medium">"{key}"</span>:{" "}
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

function CsvTable({ data }: { data: any[] }) {
  const [page, setPage] = React.useState(1);
  const rowsPerPage = 20;
  
  if (!data || data.length === 0) return null;
  
  const headers = Object.keys(data[0] || {});
  const totalPages = Math.ceil(data.length / rowsPerPage);
  const startIdx = (page - 1) * rowsPerPage;
  const currentRows = data.slice(startIdx, startIdx + rowsPerPage);
  
  return (
    <div className="space-y-4">
      <ScrollArea className="w-full whitespace-nowrap rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {headers.map((h, i) => (
                <TableHead key={i}>{h}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentRows.map((row, i) => (
              <TableRow key={i}>
                {headers.map((h, j) => (
                  <TableCell key={j}>{String(row[h] ?? "")}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {startIdx + 1}–{Math.min(startIdx + rowsPerPage, data.length)} of {data.length} rows
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Prev</Button>
          <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</Button>
        </div>
      </div>
    </div>
  );
}

function DownloadButton({ output, artifactType, fileName }: { output: any; artifactType?: string | undefined; fileName?: string | undefined }) {
  const handleDownload = () => {
    let content: string;
    let mime: string;
    let ext: string;
    
    if (artifactType === 'svg' || (typeof output === 'string' && output.trim().startsWith('<svg'))) {
      content = typeof output === 'string' ? output : JSON.stringify(output);
      mime = 'image/svg+xml'; ext = 'svg';
    } else if (artifactType === 'html') {
      content = typeof output === 'string' ? output : JSON.stringify(output);
      mime = 'text/html'; ext = 'html';
    } else if (artifactType === 'csv' || (typeof output === 'object' && output?.csv_content)) {
      content = output?.csv_content ?? JSON.stringify(output);
      mime = 'text/csv'; ext = 'csv';
    } else if (typeof output === 'object') {
      content = JSON.stringify(output, null, 2);
      mime = 'application/json'; ext = 'json';
    } else {
      content = String(output);
      mime = 'text/plain'; ext = 'txt';
    }
    
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName ?? `artifact.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  return (
    <Button variant="outline" size="sm" onClick={handleDownload} className="gap-1.5">
      <Download className="h-3.5 w-3.5" />
      Download
    </Button>
  );
}

export interface ArtifactViewerProps {
  output: any
  artifactType?: string | undefined;
  isLoading?: boolean
}

export function ArtifactViewer({ output, artifactType, isLoading }: ArtifactViewerProps) {
  const [copied, setCopied] = React.useState(false)
  const [isExpanded, setIsExpanded] = React.useState(false)

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

  const isPdf = artifactType === "pdf" || (typeof output === 'object' && output?.pdf_base64);

  // When isPdf is true, show a PDF download card:
  if (isPdf) {
    const pdfB64 = typeof output === 'object' ? (output as any)?.pdf_base64 : null;
    const metadata = typeof output === 'object' ? {
      pageCount: (output as any)?.page_count,
      sizeBytes: (output as any)?.file_size_bytes,
      title: (output as any)?.title,
      slideCount: (output as any)?.slide_count, // for PPTX
      pptxB64: (output as any)?.pptx_base64,
    } : {};

    const isPptx = !!(output as any)?.pptx_base64;
    const b64data = isPptx ? metadata.pptxB64 : pdfB64;
    const mimeType = isPptx ? 'application/vnd.openxmlformats-officedocument.presentationml.presentation' : 'application/pdf';
    const ext = isPptx ? 'pptx' : 'pdf';

    const handleDownload = () => {
      if (!b64data) return;
      const bytes = atob(b64data);
      const buf = new Uint8Array(bytes.length);
      for (let i = 0; i < bytes.length; i++) buf[i] = bytes.charCodeAt(i);
      const blob = new Blob([buf], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${metadata.title ?? 'document'}.${ext}`;
      a.click();
      URL.revokeObjectURL(url);
    };

    return (
      <div className="flex flex-col items-center justify-center py-12 gap-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-red-50 dark:bg-red-900/20">
          {/* File icon */}
          <svg className="h-10 w-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div className="text-center space-y-1">
          <p className="font-semibold">{metadata.title ?? (isPptx ? 'Presentation' : 'Document')}</p>
          <p className="text-sm text-muted-foreground">
            {isPptx && metadata.slideCount ? `${metadata.slideCount} slides` : ''}
            {!isPptx && metadata.pageCount ? `${metadata.pageCount} pages` : ''}
            {metadata.sizeBytes ? ` · ${(metadata.sizeBytes / 1024).toFixed(1)} KB` : ''}
          </p>
        </div>
        <Button onClick={handleDownload} className="gap-2">
          <Download className="h-4 w-4" />
          Download {isPptx ? '.pptx' : '.pdf'}
        </Button>
      </div>
    );
  }

  const isColorOutput = (
    typeof output === 'object' &&
    output !== null &&
    'hex' in (output as any) &&
    'rgb' in (output as any) &&
    'hsl' in (output as any)
  );

  if (isColorOutput) {
    const co = output as any;
    const hex = co.hex as string;
    const rgb = co.rgb as {r:number,g:number,b:number};
    const hsl = co.hsl as {h:number,s:number,l:number};

    return (
      <div className="space-y-4">
        {/* Color preview swatch */}
        <div
          className="w-full h-32 rounded-xl border border-border shadow-inner"
          style={{ backgroundColor: hex }}
        />
        {/* Color values */}
        <div className="grid grid-cols-1 gap-2">
          {[
            { label: 'HEX', value: hex },
            { label: 'RGB', value: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` },
            { label: 'HSL', value: `hsl(${hsl.h}°, ${hsl.s}%, ${hsl.l}%)` },
          ].map(item => (
            <div key={item.label} className="flex items-center justify-between rounded-lg border border-border bg-muted/50 px-3 py-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground w-10">{item.label}</span>
              <code className="flex-1 text-center text-sm font-mono">{item.value}</code>
              <Button
                variant="ghost" size="sm"
                className="h-6 px-2 text-[11px]"
                onClick={() => navigator.clipboard.writeText(item.value)}
              >
                Copy
              </Button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const isSvg = artifactType === "svg" || (typeof output === 'string' && output.trim().startsWith("<svg"))
  const isHtml = artifactType === "html"
  const isJson = artifactType === "json" || typeof output === "object"
  
  let mermaidMatch = null
  if (typeof output === 'string') {
    const m = output.match(/```mermaid\s+([\s\S]*?)```/)
    if (m) mermaidMatch = m[1]
  }
  const isMermaid = !!mermaidMatch

  let parsedCsvData: any[] | null = null;
  const isCsvType = artifactType === "csv" || (typeof output === "object" && output?.csv_content) || (typeof output === "object" && Array.isArray(output?.json_data));
  if (isCsvType) {
    if (typeof output === "object" && Array.isArray(output.json_data)) {
      parsedCsvData = output.json_data;
    } else {
      const csvString = typeof output === "object" && output?.csv_content ? output.csv_content : outputString;
      if (typeof csvString === "string") {
        const lines = csvString.trim().split('\n');
        if (lines.length > 0) {
           // basic parse handling simple commas (not inside quotes)
           const parseLine = (line: string) => {
             const row = [];
             let inQuotes = false;
             let val = '';
             for (let i = 0; i < line.length; i++) {
               const char = line[i];
               if (char === '"') inQuotes = !inQuotes;
               else if (char === ',' && !inQuotes) { row.push(val); val = ''; }
               else val += char;
             }
             row.push(val);
             return row;
           };
           const headers = parseLine(lines[0] || "").map(h => h.trim());
           parsedCsvData = lines.slice(1).map(line => {
             const values = parseLine(line);
             const obj: any = {};
             headers.forEach((h, i) => {
               obj[h] = values[i] !== undefined ? values[i].trim() : "";
             });
             return obj;
           });
        }
      }
    }
  }

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

  if (isSvg || isHtml || isMermaid || isCsvType) {
    const canExpand = isSvg || isHtml || isMermaid;
    return (
      <div className="relative group flex flex-col h-full gap-2">
        <Tabs defaultValue="preview" className="flex flex-col h-full min-h-0">
          {/* Tabs bar */}
          <div className="flex items-center justify-between gap-2 shrink-0">
            <TabsList>
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="raw">Raw</TabsTrigger>
            </TabsList>
            <div className="flex items-center gap-1.5">
              {canExpand && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(true)}
                  className="h-7 gap-1.5 text-xs"
                >
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l5-5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                  Expand
                </Button>
              )}
              <DownloadButton output={output} artifactType={artifactType} />
            </div>
          </div>

          {/* Preview tab */}
          <TabsContent value="preview" className="flex-1 min-h-0 mt-1 relative overflow-hidden rounded-lg border border-border bg-background">
            <CopyButton />
            {isSvg && (
              <div
                className="w-full h-full min-h-[20rem] overflow-auto p-4 flex items-center justify-center"
                dangerouslySetInnerHTML={{ __html: outputString }}
              />
            )}
            {isHtml && (
              <iframe
                srcDoc={outputString}
                sandbox="allow-scripts"
                className="w-full h-full min-h-[20rem] bg-white"
                title="HTML Preview"
              />
            )}
            {isMermaid && mermaidMatch && (
              <div className="w-full h-full min-h-[20rem] overflow-auto p-4">
                <MermaidDiagram chart={mermaidMatch} />
              </div>
            )}
            {isCsvType && parsedCsvData && (
              <div className="w-full h-full min-h-[20rem] overflow-auto p-2">
                <CsvTable data={parsedCsvData} />
              </div>
            )}
          </TabsContent>

          {/* Raw tab */}
          <TabsContent value="raw" className="flex-1 min-h-0 mt-1 relative overflow-hidden rounded-lg border border-border bg-muted/50">
            <CopyButton />
            <div className="h-full overflow-auto p-4">
              <pre className="text-sm font-mono whitespace-pre-wrap">{outputString}</pre>
            </div>
          </TabsContent>
        </Tabs>

        {/* Expand dialog — full-bleed, all breakpoints overridden */}
        <Dialog open={isExpanded} onOpenChange={setIsExpanded}>
          <DialogContent
            className={[
              /* Force full-width at every breakpoint — overrides sm:max-w-sm default */
              "w-[95vw] max-w-[95vw] sm:max-w-[95vw] md:max-w-[95vw] lg:max-w-[95vw]",
              "h-[92vh] max-h-[92vh]",
              "flex flex-col gap-0 p-0 overflow-hidden",
            ].join(" ")}
          >
            {/* Dialog header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
              <DialogTitle className="text-sm font-semibold">
                {isSvg ? "Chart Preview" : isHtml ? "HTML Preview" : "Diagram Preview"}
              </DialogTitle>
              <div className="flex items-center gap-2 mr-8">
                <DownloadButton output={output} artifactType={artifactType} />
              </div>
            </div>

            {/* Content area — fills all remaining space */}
            <div className="flex-1 min-h-0 overflow-auto bg-muted/20 p-6 flex items-start justify-center">
              {isSvg && (
                <div
                  /* Scale SVG to fill dialog: override hardcoded width/height attrs */
                  className="w-full h-full [&_svg]:w-full [&_svg]:h-auto [&_svg]:max-h-[calc(92vh-5rem)] overflow-auto"
                  dangerouslySetInnerHTML={{ __html: outputString }}
                />
              )}
              {isHtml && (
                <iframe
                  srcDoc={outputString}
                  sandbox="allow-scripts"
                  className="w-full h-full rounded-lg bg-white border border-border"
                  title="HTML Preview"
                />
              )}
              {isMermaid && mermaidMatch && (
                <div className="w-full h-full overflow-auto">
                  <MermaidDiagram chart={mermaidMatch} />
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  return (
    <div className="relative group rounded-lg border bg-muted/50 p-4">
      <CopyButton />
      <div className="absolute top-2 right-12 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <DownloadButton output={output} artifactType={artifactType} />
      </div>
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
