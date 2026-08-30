"use client";

/// <reference types="node" />
import { useCallback, useState } from "react";
import { ToolInput } from "./ToolInput";
import { ToolOutput } from "./ToolOutput";
import { ToolToolbar } from "./ToolToolbar";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export type ToolLayout = "split" | "single" | "canvas";

interface ToolSchema {
  name: string;
  description: string;
  input_schema?: Record<string, unknown>;
  output_artifact_type?: string;
}

interface ExecutionResult {
  execution_id: string;
  status: string;
  output: Record<string, unknown>;
  artifact_id: string | null;
  duration_ms: number;
}

interface ToolWorkspaceProps {
  toolName: string;
  layout?: ToolLayout;
  customInput?: React.ReactNode;
  customOutput?: React.ReactNode;
}

export function ToolWorkspace({
  toolName,
  layout = "split",
  customInput,
  customOutput,
}: ToolWorkspaceProps) {
  const [inputValues, setInputValues] = useState<Record<string, unknown>>({});
  const [result, setResult] = useState<ExecutionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  const execute = useCallback(async () => {
    setError(null);
    setIsExecuting(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/tools/${toolName}/execute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ input: inputValues }),
      });
      const data = await res.json() as unknown;
      if (!res.ok) {
        setError((data as { message?: string }).message ?? "Execution failed");
        return;
      }
      setResult(data as ExecutionResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setIsExecuting(false);
    }
  }, [toolName, inputValues]);

  const outputValue = result?.output ?? null;

  return (
    <div id={`tool-workspace-${toolName}`} className="flex h-full flex-col overflow-hidden">
      {/* Toolbar */}
      <ToolToolbar
        toolName={toolName}
        isExecuting={isExecuting}
        hasOutput={Boolean(result)}
        output={outputValue}
        artifactId={result?.artifact_id ?? null}
        durationMs={result?.duration_ms ?? null}
        onExecute={execute}
      />

      {/* Panels */}
      <div
        className={`flex flex-1 overflow-hidden ${
          layout === "single" ? "flex-col" : "flex-row"
        }`}
      >
        {/* Input panel */}
        <div
          className={`flex flex-col overflow-hidden border-border ${
            layout === "split"
              ? "w-1/2 border-r"
              : "w-full border-b"
          }`}
        >
          <div className="flex h-9 shrink-0 items-center justify-between border-b border-border px-4">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Input
            </span>
          </div>
          <div className="flex-1 overflow-auto p-4">
            {customInput ?? (
              <ToolInput
                toolName={toolName}
                values={inputValues}
                onChange={setInputValues}
              />
            )}
          </div>
        </div>

        {/* Output panel */}
        <div className={`flex flex-col overflow-hidden ${layout === "split" ? "w-1/2" : "w-full"}`}>
          <div className="flex h-9 shrink-0 items-center border-b border-border px-4">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Output
            </span>
            {result && (
              <span className="ml-auto text-xs text-muted-foreground">
                {result.duration_ms.toFixed(1)} ms
              </span>
            )}
          </div>
          <div className="flex-1 overflow-auto p-4">
            {error ? (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                {error}
              </div>
            ) : customOutput ? (
              customOutput
            ) : (
              <ToolOutput output={outputValue} isLoading={isExecuting} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
