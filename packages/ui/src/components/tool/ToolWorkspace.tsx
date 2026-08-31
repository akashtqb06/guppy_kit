"use client";

/// <reference types="node" />
import { useCallback, useState, useEffect, useRef } from "react";
// @ts-ignore
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
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
  onSuccess?: (result: { duration_ms: number; tool_name: string }) => void;
  onError?: (error: string) => void;
}

export function ToolWorkspace({
  toolName,
  layout = "split",
  customInput,
  customOutput,
  onSuccess,
  onError,
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
        const errMsg = (data as { message?: string }).message ?? "Execution failed";
        setError(errMsg);
        onError?.(errMsg);
        return;
      }
      setResult(data as ExecutionResult);
      onSuccess?.({ duration_ms: (data as ExecutionResult).duration_ms, tool_name: toolName });
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : "Network error";
      setError(errMsg);
      onError?.(errMsg);
    } finally {
      setIsExecuting(false);
    }
  }, [toolName, inputValues, onSuccess, onError]);

  const handleRunRef = useRef(execute);
  useEffect(() => {
    handleRunRef.current = execute;
  }, [execute]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        // trigger handleRun
        handleRunRef.current?.();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

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
      {layout === "split" ? (
        <PanelGroup direction="horizontal" className="flex-1 overflow-hidden">
          <Panel defaultSize={45} minSize={25} className="flex flex-col overflow-hidden">
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
          </Panel>
          <PanelResizeHandle className="w-1.5 bg-border hover:bg-brand/60 transition-colors cursor-col-resize" />
          <Panel defaultSize={55} minSize={25} className="flex flex-col overflow-hidden">
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
          </Panel>
        </PanelGroup>
      ) : (
        <div className="flex flex-1 overflow-hidden flex-col">
          {/* Input panel */}
          <div className="flex flex-col overflow-hidden border-border w-full border-b">
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
          <div className="flex flex-col overflow-hidden w-full">
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
      )}
    </div>
  );
}
