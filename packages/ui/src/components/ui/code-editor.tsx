"use client";

import { useRef, useCallback } from "react";
import Editor, { type OnMount, type OnChange } from "@monaco-editor/react";
import type { editor } from "monaco-editor";
import { cn } from "../../lib/utils";

export type CodeLanguage = "json" | "sql" | "markdown" | "csv" | "plaintext" | "javascript" | "typescript" | "python" | "html" | "css" | "yaml";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: CodeLanguage;
  placeholder?: string;
  readOnly?: boolean;
  height?: string;
  className?: string;
  minLines?: number;
  "data-testid"?: string;
}

export function CodeEditor({
  value,
  onChange,
  language = "plaintext",
  readOnly = false,
  height = "240px",
  className,
  "data-testid": testId,
}: CodeEditorProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  const handleMount: OnMount = useCallback((ed) => {
    editorRef.current = ed;
    // Format JSON on mount
    if (language === "json" && value) {
      try {
        const formatted = JSON.stringify(JSON.parse(value), null, 2);
        if (formatted !== value) {
          ed.setValue(formatted);
        }
      } catch {
        // leave as-is if invalid JSON
      }
    }
  }, [language, value]);

  const handleChange: OnChange = useCallback((val) => {
    onChange(val ?? "");
  }, [onChange]);

  return (
    <div
      data-testid={testId}
      className={cn(
        "overflow-hidden rounded-md border border-input bg-background",
        "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-0",
        className,
      )}
    >
      <Editor
        height={height}
        language={language}
        value={value}
        onChange={handleChange}
        onMount={handleMount}
        theme="vs-dark"
        options={{
          readOnly,
          minimap: { enabled: false },
          fontSize: 13,
          lineHeight: 20,
          fontFamily: "'Geist Mono', 'Fira Code', 'Cascadia Code', monospace",
          wordWrap: "on",
          tabSize: 2,
          scrollBeyondLastLine: false,
          overviewRulerLanes: 0,
          hideCursorInOverviewRuler: true,
          renderLineHighlight: "none",
          scrollbar: {
            vertical: "auto",
            horizontal: "hidden",
            verticalScrollbarSize: 6,
          },
          padding: { top: 12, bottom: 12 },
          lineNumbers: language === "plaintext" ? "off" : "on",
          glyphMargin: false,
          folding: language !== "plaintext",
          contextmenu: false,
          quickSuggestions: language === "json" || language === "sql",
          formatOnPaste: language === "json",
          formatOnType: false,
        }}
      />
    </div>
  );
}
