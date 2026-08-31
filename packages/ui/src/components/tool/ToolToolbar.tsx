"use client";

/// <reference types="node" />
import { useState } from "react";

import { Button } from "../ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { Badge } from "../ui/badge";
import { API_BASE } from "../../lib/constants";

interface ToolToolbarProps {
  toolName: string;
  toolIcon?: string;
  isExecuting: boolean;
  hasOutput: boolean;
  output: Record<string, unknown> | null;
  artifactId?: string | null;
  durationMs: number | null;
  onExecute: () => void;
}

export function ToolToolbar({
  toolName,
  toolIcon,
  isExecuting,
  hasOutput,
  output,
  artifactId,
  durationMs,
  onExecute,
}: ToolToolbarProps) {
  const [copied, setCopied] = useState(false);
  const [urlCopied, setUrlCopied] = useState(false);

  async function handleCopy() {
    if (!output) return;
    await navigator.clipboard.writeText(JSON.stringify(output, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleShare() {
    await navigator.clipboard.writeText(window.location.href);
    setUrlCopied(true);
    setTimeout(() => setUrlCopied(false), 2000);
  }

  function handleDownload() {
    if (artifactId) {
      window.open(`${API_BASE}/api/v1/artifacts/${artifactId}/download`, "_blank");
      return;
    }
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

  return (
    <div
      id={`tool-toolbar-${toolName}`}
      className="flex h-12 shrink-0 items-center justify-between border-b border-border bg-background px-4"
    >
      {/* Tool name */}
      <div className="flex items-center gap-2">
        {toolIcon && <span className="text-sm">{toolIcon}</span>}
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
        <TooltipProvider>
          {/* Share */}
          {hasOutput && (
            <Tooltip>
              <TooltipTrigger>
                <Button
                  id={`toolbar-share-${toolName}`}
                  onClick={handleShare}
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 text-muted-foreground"
                >
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  {urlCopied ? "Copied URL!" : "Share"}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Copy page URL</TooltipContent>
            </Tooltip>
          )}

          {/* Copy */}
          {hasOutput && (
            <Tooltip>
              <TooltipTrigger>
                <Button
                  id={`toolbar-copy-${toolName}`}
                  onClick={handleCopy}
                  disabled={!output}
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 text-muted-foreground"
                >
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                  {copied ? "Copied Data!" : "Copy Data"}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Copy output JSON</TooltipContent>
            </Tooltip>
          )}

          {/* Download */}
          {hasOutput && (
            <Tooltip>
              <TooltipTrigger>
                <Button
                  id={`toolbar-download-${toolName}`}
                  onClick={handleDownload}
                  disabled={!output}
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 text-muted-foreground"
                >
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download
                </Button>
              </TooltipTrigger>
              <TooltipContent>{artifactId ? "Download artifact" : "Download JSON"}</TooltipContent>
            </Tooltip>
          )}

          {/* View API */}
          <Tooltip>
            <TooltipTrigger>
              <Button
                id={`toolbar-api-${toolName}`}
                variant="ghost"
                size="sm"
                className="gap-1.5 text-muted-foreground p-0"
              >
                <a
                  href={`${API_BASE}/docs#/tools/execute_tool_api_v1_tools__name__execute_post`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 flex items-center gap-1.5 w-full h-full"
                >
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                  API
                </a>
              </Button>
            </TooltipTrigger>
            <TooltipContent>View API Docs</TooltipContent>
          </Tooltip>
        
          {/* Run button */}
          <Tooltip>
            <TooltipTrigger>
              <Button
                id={`toolbar-run-${toolName}`}
                onClick={onExecute}
                disabled={isExecuting}
                className="gap-1.5 bg-brand text-brand-foreground hover:bg-brand/90"
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
              </Button>
            </TooltipTrigger>
            <TooltipContent>Run Tool (Ctrl+⏎)</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
