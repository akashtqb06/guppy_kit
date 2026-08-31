"use client";

/// <reference types="node" />
import { useEffect, useState } from "react";

import { API_BASE } from "../../lib/constants";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";

interface ToolInputField {
  name: string;
  type: string;
  description?: string | undefined;
  required?: boolean | undefined;
  default?: unknown;
}

interface ToolInputProps {
  toolName: string;
  values: Record<string, unknown>;
  onChange: (values: Record<string, unknown>) => void;
}

export function ToolInput({ toolName, values, onChange }: ToolInputProps) {
  const [fields, setFields] = useState<ToolInputField[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSchema = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/v1/tools/${toolName}`, {
          credentials: "include",
        });
        if (!res.ok) return;
        const tool = await res.json() as { input_schema?: { properties?: Record<string, { type?: string; description?: string }> } };
        const props = tool.input_schema?.properties ?? {};
        setFields(
          Object.entries(props).map(([name, def]) => {
            const d = def as { type?: string; description?: string };
            const field: ToolInputField = {
              name,
              type: d.type ?? "string",
            };
            if (d.description !== undefined) field.description = d.description;
            return field;
          })
        );
      } finally {
        setIsLoading(false);
      }
    };
    fetchSchema();
  }, [toolName]);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    );
  }

  if (fields.length === 0) {
    return (
      <div className="space-y-3">
        <Label htmlFor={`tool-input-${toolName}`}>Input</Label>
        <Textarea
          id={`tool-input-${toolName}`}
          value={(values["input"] as string) ?? ""}
          onChange={(e) => onChange({ ...values, input: e.target.value })}
          rows={10}
          placeholder="Enter your input here…"
          className="font-mono"
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {fields.map((field) => (
        <div key={field.name} className="space-y-1.5">
          <Label
            htmlFor={`field-${toolName}-${field.name}`}
            className="capitalize"
          >
            {field.name.replace(/_/g, " ")}
            {field.description && (
              <span className="ml-1 text-xs font-normal text-muted-foreground">
                — {field.description}
              </span>
            )}
          </Label>
          {field.type === "string" || field.type === "text" ? (
            <Textarea
              id={`field-${toolName}-${field.name}`}
              value={(values[field.name] as string) ?? ""}
              onChange={(e) =>
                onChange({ ...values, [field.name]: e.target.value })
              }
              rows={6}
              className="font-mono"
            />
          ) : (
            <Input
              id={`field-${toolName}-${field.name}`}
              type={field.type === "integer" || field.type === "number" ? "number" : "text"}
              value={(values[field.name] as string) ?? ""}
              onChange={(e) =>
                onChange({ ...values, [field.name]: e.target.value })
              }
            />
          )}
        </div>
      ))}
    </div>
  );
}
