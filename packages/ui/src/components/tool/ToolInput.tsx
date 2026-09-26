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
import { RichTextEditor } from "../ui/rich-text-editor";
import { CodeEditor } from "../ui/code-editor";
import { JsonEditor } from "../ui/json-editor";
import { Button } from "../ui/button";
import { FlaskConical } from "lucide-react";

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

const TOOL_SAMPLES: Record<string, Record<string, unknown>> = {
  'bar-chart': {
    labels: JSON.stringify(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']),
    values: JSON.stringify([42, 68, 55, 83, 91]),
    title: 'Weekly Activity',
  },
  'line-chart': {
    labels: JSON.stringify(['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']),
    values: JSON.stringify([120, 145, 98, 167, 201, 185]),
    title: 'Monthly Growth',
  },
  'pie-chart': {
    labels: JSON.stringify(['JavaScript', 'Python', 'TypeScript', 'Rust', 'Go']),
    values: JSON.stringify([35, 28, 20, 10, 7]),
    title: 'Language Usage',
  },
  'scatter-chart': {
    points: JSON.stringify([
      {x: 1, y: 4, label: 'A'}, {x: 2, y: 7, label: 'B'},
      {x: 3, y: 3, label: 'C'}, {x: 4, y: 9, label: 'D'},
      {x: 5, y: 6, label: 'E'}, {x: 6, y: 8, label: 'F'},
    ]),
    title: 'Sample Scatter',
  },
  'regex-tester': {
    pattern: '^[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}$',
    text: 'user@example.com',
  },
  'json-formatter': {
    json_string: '{"name":"Guppy Kit","version":1,"features":["tools","api","mcp"]}',
  },
  'sql-formatter': {
    sql: 'SELECT u.id, u.email, COUNT(e.id) as executions FROM users u LEFT JOIN executions e ON u.id = e.user_id WHERE u.is_active = true GROUP BY u.id ORDER BY executions DESC LIMIT 10',
  },
};

function ArrayLineEditor({
  value,
  onChange,
  itemType = 'string',
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  itemType?: 'string' | 'number';
  placeholder?: string;
}) {
  let displayValue = '';
  try {
    const arr = JSON.parse(value || '[]');
    displayValue = Array.isArray(arr) ? arr.join('\n') : '';
  } catch {
    displayValue = value;
  }

  function handleChange(text: string) {
    const lines = text.split('\n').filter(l => l.trim() !== '');
    let items: (string | number)[];
    if (itemType === 'number') {
      items = lines.map(l => parseFloat(l)).filter(n => !isNaN(n));
    } else {
      items = lines;
    }
    onChange(JSON.stringify(items));
  }

  return (
    <div className="space-y-1">
      <p className="text-[11px] text-muted-foreground">One item per line</p>
      <CodeEditor
        value={displayValue}
        onChange={handleChange}
        language="plaintext"
        height="160px"
        placeholder={placeholder ?? (itemType === 'number' ? '1.5\n3.2\n7.8' : 'Item 1\nItem 2\nItem 3')}
      />
    </div>
  );
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
      {TOOL_SAMPLES[toolName] && (
        <div className="flex justify-end mb-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 text-xs gap-1.5"
            onClick={() => {
              const sample = TOOL_SAMPLES[toolName];
              if (sample) {
                // Merge sample into current values
                onChange({ ...values, ...sample });
              }
            }}
          >
            <FlaskConical className="h-3.5 w-3.5" />
            Load sample
          </Button>
        </div>
      )}
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
        const isList = field.type === "array" && (
          field.items?.type === "string" || field.items?.type === "number"
        );
        
        const isSql = field.name === "sql" || field.name.endsWith("_sql") || field.name === "query";
        const isJson = field.type === "object" || (field.type === "array" && !isList) || field.name === "json" || field.name.endsWith("_json") || field.name.startsWith("json_");
        const isMarkdown = field.name.startsWith("markdown") || field.name.endsWith("_markdown");
        const isLongText = field.name.endsWith("_text") || field.name === "text" || field.name === "content" || field.name === "input" || field.name.endsWith("_content");
        const isCsv = field.name.includes("csv") || field.type === "csv";

        const getDisplayValue = (v: unknown) => {
          if (v === undefined || v === null) return "";
          if (typeof v === "object") return JSON.stringify(v, null, 2);
          return String(v);
        };
        
        if (isList) {
          return (
            <div key={field.name} className="space-y-1.5">
              {labelNode}
              <ArrayLineEditor
                value={typeof val === 'string' ? val : JSON.stringify(val ?? field.default ?? [])}
                onChange={(str) => {
                  try {
                    onChange({ ...values, [field.name]: JSON.parse(str) });
                  } catch {
                    onChange({ ...values, [field.name]: str });
                  }
                }}
                itemType={field.items?.type as "string" | "number"}
              />
            </div>
          );
        }

        if (isSql || isJson || isMarkdown || isLongText || isCsv) {
          let placeholder = "";
          if (isJson) { placeholder = '{"key": "value"}'; }
          else if (isMarkdown) placeholder = "# Heading\n\nText";

          const handleFieldChange = (name: string, str: string) => {
            if (isJson) {
              try {
                onChange({ ...values, [name]: JSON.parse(str) });
                return;
              } catch {
                // fallback to string if invalid JSON while typing
              }
            }
            onChange({ ...values, [name]: str });
          };

          return (
            <div key={field.name} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {labelNode}
                  {isJson && (
                    <Button type="button" variant="ghost" size="sm"
                      onClick={() => {
                        const sample = field.default !== undefined 
                          ? JSON.stringify(field.default, null, 2)
                          : field.type === "array" ? "[]" : "{}";
                        handleFieldChange(field.name, sample);
                      }}
                      className="h-6 text-[11px] px-2"
                    >
                      Use sample
                    </Button>
                  )}
                </div>
                <div>
                  <input
                    type="file"
                    id={`file-upload-text-${toolName}-${field.name}`}
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = () => {
                          const str = reader.result as string;
                          handleFieldChange(field.name, str);
                        };
                        reader.readAsText(file);
                      }
                    }}
                  />
                  <Label
                    htmlFor={`file-upload-text-${toolName}-${field.name}`}
                    className="text-[10px] text-brand uppercase cursor-pointer hover:underline"
                  >
                    Upload File
                  </Label>
                </div>
              </div>
              {isMarkdown ? (
                <RichTextEditor
                  mode="rich"
                  value={getDisplayValue(val ?? field.default)}
                  onChange={(str) => onChange({ ...values, [field.name]: str })}
                  placeholder={placeholder}
                />
              ) : isSql ? (
                <CodeEditor
                  language="sql"
                  value={getDisplayValue(val ?? field.default)}
                  onChange={(str) => handleFieldChange(field.name, str)}
                  height="220px"
                />
              ) : isJson ? (
                <JsonEditor
                  value={getDisplayValue(val ?? field.default)}
                  onChange={(str) => handleFieldChange(field.name, str)}
                  height="220px"
                />
              ) : isCsv ? (
                <CodeEditor
                  language="csv"
                  value={getDisplayValue(val ?? field.default)}
                  onChange={(str) => handleFieldChange(field.name, str)}
                  height="200px"
                />
              ) : (
                <CodeEditor
                  language="plaintext"
                  value={getDisplayValue(val ?? field.default)}
                  onChange={(str) => handleFieldChange(field.name, str)}
                  height="160px"
                />
              )}
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
              value={getDisplayValue(val ?? field.default)}
              onChange={(e) => onChange({ ...values, [field.name]: e.target.value })}
            />
          </div>
        );
      })}
    </div>
  );
}
