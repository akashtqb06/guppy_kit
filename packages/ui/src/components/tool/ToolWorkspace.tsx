"use client";

/// <reference types="node" />
import { useCallback, useState, useEffect } from "react";
import { ToolInput } from "./ToolInput";
import { ToolOutput } from "./ToolOutput";
import { ToolToolbar } from "./ToolToolbar";
import { Button } from "../ui/button";

import { Alert, AlertDescription } from "../ui/alert";
import { API_BASE } from "../../lib/constants";

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

  const [schema, setSchema] = useState<ToolSchema | null>(null);

  useEffect(() => {
    async function fetchSchema() {
      try {
        const res = await fetch(`${API_BASE}/api/v1/tools/${toolName}`);
        if (res.ok) {
          const data = await res.json() as ToolSchema;
          setSchema(data);
        }
      } catch (err) {}
    }
    fetchSchema();
  }, [toolName]);

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

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        if (!isExecuting) execute();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [execute, isExecuting]);

  const outputValue = result?.output ?? null;

  let executionStatusNode = null;
  if (isExecuting) {
    executionStatusNode = <span className="ml-auto text-xs text-muted-foreground">⏳ Running...</span>;
  } else if (error) {
    executionStatusNode = <span className="ml-auto text-xs text-red-500">❌ Failed</span>;
  } else if (result && result.status === "completed") {
    executionStatusNode = <span className="ml-auto text-xs text-green-600">✅ {result.duration_ms.toFixed(0)}ms</span>;
  }

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
            <Button variant="ghost" size="sm" onClick={() => setInputValues({})} className="ml-auto h-7 text-xs">
              Clear
            </Button>
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
            {executionStatusNode}
          </div>
          <div className="flex-1 overflow-auto p-4">
            {error ? (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : customOutput ? (
              customOutput
            ) : (
              <ToolOutput output={outputValue} isLoading={isExecuting} artifactType={schema?.output_artifact_type} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
