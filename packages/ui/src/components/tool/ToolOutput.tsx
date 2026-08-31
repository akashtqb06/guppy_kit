"use client";

import { ArtifactViewer } from "../ui/artifact-viewer";

interface ToolOutputProps {
  output: Record<string, unknown> | null;
  isLoading: boolean;
  artifactType?: string | undefined;
}

export function ToolOutput({ output, isLoading, artifactType }: ToolOutputProps) {
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

  return (
    <ArtifactViewer
      output={output.result ?? output.output ?? output.text ?? output}
      artifactType={artifactType}
      isLoading={isLoading}
    />
  );
}
