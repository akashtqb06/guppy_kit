"use client";

import { useCallback, useState } from "react";
import { CodeEditor } from "./code-editor";
import { Button } from "./button";
import { Badge } from "./badge";
import { cn } from "../../lib/utils";

interface JsonEditorProps {
  value: string;
  onChange: (value: string) => void;
  height?: string;
  className?: string;
  placeholder?: string;
}

export function JsonEditor({ value, onChange, height = "240px", className }: JsonEditorProps) {
  const [error, setError] = useState<string | null>(null);

  const handleChange = useCallback((val: string) => {
    onChange(val);
    if (!val.trim()) { setError(null); return; }
    try { JSON.parse(val); setError(null); } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid JSON");
    }
  }, [onChange]);

  const handleFormat = useCallback(() => {
    try {
      const formatted = JSON.stringify(JSON.parse(value), null, 2);
      onChange(formatted);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid JSON");
    }
  }, [value, onChange]);

  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Badge variant="outline" className="text-[10px] font-mono px-1.5 py-0">JSON</Badge>
          {error && <span className="text-[10px] text-destructive font-mono truncate max-w-xs">{error}</span>}
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={handleFormat} className="h-6 text-[11px] px-2">
          Format
        </Button>
      </div>
      <CodeEditor
        value={value}
        onChange={handleChange}
        language="json"
        height={height}
      />
    </div>
  );
}
