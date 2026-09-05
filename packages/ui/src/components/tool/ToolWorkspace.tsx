"use client";

/// <reference types="node" />
import { useCallback, useState, useEffect, useRef } from "react";
import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from "react-resizable-panels";
import { ToolInput } from "./ToolInput";
import { ToolOutput } from "./ToolOutput";
import { ToolToolbar } from "./ToolToolbar";
import { Button } from "../ui/button";

import { Alert, AlertDescription } from "../ui/alert";
import { API_BASE } from "../../lib/constants";
import { PenLine, Layers, RotateCcw, Loader2, CheckCircle2, XCircle } from "lucide-react";

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
    executionStatusNode = (
      <span className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground">
        <Loader2 className="h-3 w-3 animate-spin" />
        Running…
      </span>
    );
  } else if (error) {
    executionStatusNode = (
      <span className="ml-auto flex items-center gap-1.5 text-xs text-destructive">
        <XCircle className="h-3 w-3" />
        Failed
      </span>
    );
  } else if (result && result.status === "completed") {
    executionStatusNode = (
      <span className="ml-auto flex items-center gap-1.5 text-xs text-emerald-600">
        <CheckCircle2 className="h-3 w-3" />
        {result.duration_ms.toFixed(0)}ms
      </span>
    );
  }

  return (
    <div id={`tool-workspace-${toolName}`} className="flex h-full flex-col overflow-hidden">
      {/* Main toolbar */}
      <ToolToolbar
        toolName={toolName}
        isExecuting={isExecuting}
        hasOutput={Boolean(result)}
        output={outputValue}
        artifactId={result?.artifact_id ?? null}
        durationMs={result?.duration_ms ?? null}
        onExecute={execute}
      />

      {/* Split panels */}
      {layout === "split" ? (
        <PanelGroup orientation="horizontal" className="flex-1 overflow-hidden">
          {/* Input Panel */}
          <Panel defaultSize={45} minSize={20} className="flex flex-col overflow-hidden">
            <div className="flex h-9 shrink-0 items-center justify-between border-b border-border bg-muted/30 px-3">
              <div className="flex items-center gap-2">
                <PenLine className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Input</span>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost" size="sm"
                  onClick={() => setInputValues({})}
                  className="h-6 px-2 text-[11px] text-muted-foreground gap-1"
                >
                  <RotateCcw className="h-3 w-3" />
                  Clear
                </Button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-4">
              {customInput ?? (
                <ToolInput toolName={toolName} values={inputValues} onChange={setInputValues} />
              )}
            </div>
          </Panel>

          {/* Resize handle */}
          <PanelResizeHandle className="w-px bg-border hover:bg-brand/50 hover:w-[3px] transition-all cursor-col-resize" />

          {/* Output Panel */}
          <Panel defaultSize={55} minSize={20} className="flex flex-col overflow-hidden">
            <div className="flex h-9 shrink-0 items-center justify-between border-b border-border bg-muted/30 px-3">
              <div className="flex items-center gap-2">
                <Layers className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Output</span>
              </div>
              {executionStatusNode}
            </div>
            <div className="flex-1 overflow-auto p-4">
              {error ? (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              ) : customOutput ? (
                customOutput
              ) : (
                <ToolOutput
                  output={outputValue}
                  isLoading={isExecuting}
                  artifactType={schema?.output_artifact_type}
                />
              )}
            </div>
          </Panel>
        </PanelGroup>
      ) : (
        // Single column layout (mobile)
        <div className="flex flex-1 flex-col overflow-auto divide-y divide-border">
          <div className="flex flex-col">
            <div className="flex h-9 shrink-0 items-center justify-between border-b border-border bg-muted/30 px-3">
              <div className="flex items-center gap-2">
                <PenLine className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Input</span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setInputValues({})} className="h-6 px-2 text-[11px] gap-1">
                <RotateCcw className="h-3 w-3" />
                Clear
              </Button>
            </div>
            <div className="p-4">
              {customInput ?? <ToolInput toolName={toolName} values={inputValues} onChange={setInputValues} />}
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex h-9 shrink-0 items-center justify-between border-b border-border bg-muted/30 px-3">
              <div className="flex items-center gap-2">
                <Layers className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Output</span>
              </div>
              {executionStatusNode}
            </div>
            <div className="p-4">
              {error ? (
                <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>
              ) : customOutput ? customOutput : (
                <ToolOutput output={outputValue} isLoading={isExecuting} artifactType={schema?.output_artifact_type} />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
