"use client";

/// <reference types="node" />
import { useState } from "react";
import { Button } from "../ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { API_BASE } from "../../lib/constants";
import { Share2, Copy, Check, Download, Code, Play, Loader2, Zap } from "lucide-react";

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
      className="flex h-11 shrink-0 items-center justify-between border-b border-border bg-background px-4 gap-3"
    >
      {/* Left: Tool identity */}
      <div className="flex items-center gap-2 min-w-0">
        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-brand/10">
          <Zap className="h-3.5 w-3.5 text-brand" />
        </div>
        <span className="text-sm font-semibold capitalize truncate">
          {toolName.replace(/-/g, " ")}
        </span>
        {durationMs !== null && (
          <span className="text-xs text-muted-foreground shrink-0">
            · {durationMs.toFixed(0)}ms
          </span>
        )}
      </div>

      {/* Right: Action buttons */}
      <div className="flex items-center gap-1">
        <TooltipProvider>
          {hasOutput && (
            <>
              {/* Share */}
              <Tooltip>
                <TooltipTrigger render={<span className="contents" />}>
                  <Button
                    id={`toolbar-share-${toolName}`}
                    onClick={handleShare}
                    variant="ghost" size="sm"
                    className="h-7 w-7 p-0 text-muted-foreground"
                  >
                    {urlCopied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Share2 className="h-3.5 w-3.5" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{urlCopied ? "URL copied!" : "Copy link"}</TooltipContent>
              </Tooltip>

              {/* Copy output */}
              <Tooltip>
                <TooltipTrigger render={<span className="contents" />}>
                  <Button
                    id={`toolbar-copy-${toolName}`}
                    onClick={handleCopy}
                    disabled={!output}
                    variant="ghost" size="sm"
                    className="h-7 w-7 p-0 text-muted-foreground"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{copied ? "Copied!" : "Copy output"}</TooltipContent>
              </Tooltip>

              {/* Download */}
              <Tooltip>
                <TooltipTrigger render={<span className="contents" />}>
                  <Button
                    id={`toolbar-download-${toolName}`}
                    onClick={handleDownload}
                    disabled={!output}
                    variant="ghost" size="sm"
                    className="h-7 w-7 p-0 text-muted-foreground"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{artifactId ? "Download artifact" : "Download JSON"}</TooltipContent>
              </Tooltip>
            </>
          )}

          {/* Separator */}
          <div className="h-4 w-px bg-border mx-1" />

          {/* API Docs */}
          <Tooltip>
            <TooltipTrigger render={<span className="contents" />}>
              <Button
                id={`toolbar-api-${toolName}`}
                variant="ghost" size="sm"
                nativeButton={false}
                className="h-7 w-7 p-0 text-muted-foreground"
                render={
                  <a
                    href={`${API_BASE}/docs#/tools/execute_tool_api_v1_tools__name__execute_post`}
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                }
              >
                <Code className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>API Docs</TooltipContent>
          </Tooltip>

          {/* Separator */}
          <div className="h-4 w-px bg-border mx-1" />

          {/* Run */}
          <Tooltip>
            <TooltipTrigger render={<span className="contents" />}>
              <Button
                id={`toolbar-run-${toolName}`}
                onClick={onExecute}
                disabled={isExecuting}
                size="sm"
                className="h-7 px-3 bg-brand text-brand-foreground hover:bg-brand/90 gap-1.5"
              >
                {isExecuting ? (
                  <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Running…</>
                ) : (
                  <><Play className="h-3.5 w-3.5 fill-current" /> Run</>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>Run Tool &middot; Ctrl+Enter</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
