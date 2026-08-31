"use client";

import { useEffect, useState } from "react";
import { API_BASE } from "../../lib/constants";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Switch } from "../ui/switch";
import { FileUpload } from "../ui/file-upload";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

interface ToolInputField {
  name: string;
  type: string;
  description?: string;
  required?: boolean;
  default?: unknown;
  enum?: string[];
  minimum?: number;
  maximum?: number;
  items?: { type: string };
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
        const tool = await res.json() as any;
        const props = tool.input_schema?.properties ?? {};
        
        const newFields = Object.entries(props).map(([name, def]: [string, any]) => {
          const field: ToolInputField = {
            name,
            type: def.type ?? "string",
            description: def.description,
            default: def.default,
            minimum: def.minimum,
            maximum: def.maximum,
            items: def.items,
          };
          if (def.enum) {
            field.enum = def.enum;
          } else if (def.anyOf && Array.isArray(def.anyOf)) {
            const consts = def.anyOf.map((a: any) => a.const).filter((c: any) => c !== undefined);
            if (consts.length > 0) field.enum = consts;
          }
          return field;
        });
        setFields(newFields);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSchema();
  }, [toolName]);

  useEffect(() => {
    if (fields.length > 0) {
      const defaults: Record<string, unknown> = {};
      for (const field of fields) {
        if (!(field.name in values) && field.default !== undefined) {
          defaults[field.name] = field.default;
        }
      }
      if (Object.keys(defaults).length > 0) {
        onChange({ ...values, ...defaults });
      }
    }
  }, [fields]); // Intentionally not including values or onChange to run only when fields load

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
      {fields.map((field) => {
        const val = values[field.name];
        
        let labelNode = (
          <Label htmlFor={`field-${toolName}-${field.name}`} className="capitalize cursor-pointer">
            {field.name.replace(/_/g, " ")}
          </Label>
        );

        if (field.description) {
          labelNode = (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger type="button">{labelNode}</TooltipTrigger>
                <TooltipContent>{field.description}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        }

        // boolean switch
        if (field.type === "boolean") {
          return (
            <div key={field.name} className="flex items-center gap-3">
              <Switch 
                id={`field-${toolName}-${field.name}`}
                checked={!!val} 
                onCheckedChange={(v) => onChange({ ...values, [field.name]: v })} 
              />
              {labelNode}
            </div>
          );
        }

        // file upload
        if (field.name.endsWith("_base64") || field.name.endsWith("_file")) {
          let accept = undefined;
          if (field.name.includes("pdf")) accept = "application/pdf,.pdf";
          else if (field.name.includes("docx")) accept = ".docx";
          else if (field.name.includes("excel") || field.name.includes("xls")) accept = ".xlsx,.xls";
          
          return (
            <div key={field.name} className="space-y-1.5">
              {labelNode}
              <FileUpload
                {...(accept ? { accept } : {})}
                multiple={field.type === "array"}
                onFiles={(files) => {
                  if (files && files.length > 0) {
                    const file = files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = () => {
                        onChange({ ...values, [field.name]: reader.result });
                      };
                      reader.readAsDataURL(file);
                    }
                  }
                }}
              />
            </div>
          );
        }

        // enum / select
        if (field.enum && field.enum.length > 0) {
          return (
            <div key={field.name} className="space-y-1.5">
              {labelNode}
              <Select 
                value={(val as string) ?? field.enum[0]} 
                onValueChange={(v) => onChange({ ...values, [field.name]: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {field.enum.map((opt) => (
                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          );
        }

        // number
        if (field.type === "integer" || field.type === "number") {
          return (
            <div key={field.name} className="space-y-1.5">
              {labelNode}
              <Input
                id={`field-${toolName}-${field.name}`}
                type="number"
                min={field.minimum}
                max={field.maximum}
                value={(val as number | string) ?? field.default ?? ""}
                onChange={(e) => onChange({ ...values, [field.name]: Number(e.target.value) })}
              />
            </div>
          );
        }

        // text fields
        const isSql = field.name === "sql" || field.name.endsWith("_sql") || field.name === "query";
        const isJson = field.name === "json" || field.name.endsWith("_json") || field.name.startsWith("json_");
        const isMarkdown = field.name.startsWith("markdown") || field.name.endsWith("_markdown");
        const isLongText = field.name.endsWith("_text") || field.name === "text" || field.name === "content" || field.name === "input";

        if (isSql || isJson || isMarkdown || isLongText) {
          let placeholder = "";
          let className = "";
          if (isSql) className = "font-mono text-sm";
          else if (isJson) { className = "font-mono text-sm"; placeholder = '{"key": "value"}'; }
          else if (isMarkdown) placeholder = "# Heading\n\nText";

          return (
            <div key={field.name} className="space-y-1.5">
              {labelNode}
              <Textarea
                id={`field-${toolName}-${field.name}`}
                value={(val as string) ?? field.default ?? ""}
                onChange={(e) => onChange({ ...values, [field.name]: e.target.value })}
                rows={6}
                placeholder={placeholder}
                className={className}
              />
            </div>
          );
        }

        // default small text
        return (
          <div key={field.name} className="space-y-1.5">
            {labelNode}
            <Input
              id={`field-${toolName}-${field.name}`}
              type="text"
              value={(val as string) ?? field.default ?? ""}
              onChange={(e) => onChange({ ...values, [field.name]: e.target.value })}
            />
          </div>
        );
      })}
    </div>
  );
}
