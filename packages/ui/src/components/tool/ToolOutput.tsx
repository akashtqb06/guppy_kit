"use client";

interface ToolOutputProps {
  output: Record<string, unknown> | null;
  isLoading: boolean;
}

export function ToolOutput({ output, isLoading }: ToolOutputProps) {
  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <div
            className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          />
          <span className="text-sm">Running…</span>
        </div>
      </div>
    );
  }

  if (!output) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-muted-foreground">
          Run the tool to see output here.
        </p>
      </div>
    );
  }

  // Detect single string/text field output
  const outputKeys = Object.keys(output);
  const firstKey = outputKeys[0];
  const primaryValue =
    outputKeys.length === 1 && firstKey !== undefined
      ? output[firstKey]
      : output.result ?? output.output ?? output.text ?? null;

  if (typeof primaryValue === "string") {
    return (
      <pre
        id="tool-output-text"
        className="whitespace-pre-wrap break-all text-sm font-mono leading-relaxed"
      >
        {primaryValue}
      </pre>
    );
  }

  // JSON output
  return (
    <pre
      id="tool-output-json"
      className="whitespace-pre-wrap break-all text-sm font-mono leading-relaxed"
    >
      {JSON.stringify(output, null, 2)}
    </pre>
  );
}
