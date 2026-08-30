"use client";

/// <reference types="node" />
import { useState } from "react";

interface ToolToolbarProps {
  toolName: string;
  isExecuting: boolean;
  hasOutput: boolean;
  output: Record<string, unknown> | null;
  artifactId: string | null;
  durationMs: number | null;
  onExecute: () => void;
}

export function ToolToolbar({
  toolName,
  isExecuting,
  hasOutput,
  output,
  artifactId,
  durationMs,
  onExecute,
}: ToolToolbarProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    if (!output) return;
    await navigator.clipboard.writeText(JSON.stringify(output, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownload() {
    if (!output) return;
    const blob = new Blob([JSON.stringify(output, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${toolName}-output.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

  return (
    <div
      id={`tool-toolbar-${toolName}`}
      className="flex h-12 shrink-0 items-center justify-between border-b border-border bg-background px-4"
    >
      {/* Tool name */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold capitalize">
          {toolName.replace(/-/g, " ")}
        </span>
        {durationMs !== null && (
          <span className="text-xs text-muted-foreground">
            · {durationMs.toFixed(1)} ms
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Copy */}
        {hasOutput && (
          <button
            id={`toolbar-copy-${toolName}`}
            onClick={handleCopy}
            disabled={!output}
            className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40"
          >
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
            </svg>
            {copied ? "Copied!" : "Copy"}
          </button>
        )}

        {/* Download */}
        {hasOutput && (
          <button
            id={`toolbar-download-${toolName}`}
            onClick={handleDownload}
            disabled={!output}
            className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40"
          >
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download
          </button>
        )}

        {/* View API */}
        <a
          id={`toolbar-api-${toolName}`}
          href={`${API_BASE}/docs#/tools/execute_tool_api_v1_tools__name__execute_post`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
          API
        </a>

        {/* Run button */}
        <button
          id={`toolbar-run-${toolName}`}
          onClick={onExecute}
          disabled={isExecuting}
          className="flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-sm font-semibold text-white transition-all disabled:opacity-60"
          style={{ background: isExecuting ? "oklch(0.55 0.2 264)" : "oklch(0.5 0.25 264)" }}
        >
          {isExecuting ? (
            <>
              <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              Running…
            </>
          ) : (
            <>
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3l14 9-14 9V3z" />
              </svg>
              Run
            </>
          )}
        </button>
      </div>
    </div>
  );
}
