# Architecture — Three-Interface Model

Every tool in Guppy Kit is automatically available through three surfaces from a single implementation. This is the most important developer-experience principle in the platform.

---

## The Principle

```
              Tool (Python BaseTool executor)
                            │
          ┌─────────────────┼─────────────────┐
          ▼                 ▼                 ▼
     Next.js UI         REST API         MCP Server
     /tools/json     POST /api/v1/     json_formatter
     -formatter      tools/json        (MCP tool)
                     -formatter
                     /execute
```

**One implementation. Three surfaces. No duplication.**

The adapters (REST and MCP) are auto-generated from the tool's Pydantic schemas. The UI workspace page is built using shared components from `packages/ui` that wire to the REST API automatically.

---

## Surface 1 — UI (Next.js)

The tool workspace is a standardized layout defined in `packages/ui`:

```
┌─────────────────────────────────────────────────────────────────┐
│  JSON Formatter                                  Save  Export   │
├─────────────────────────────┬───────────────────────────────────┤
│                             │                                   │
│  Input                      │  Output                          │
│                             │                                   │
│  (Monaco editor / file      │  (Monaco editor / preview /      │
│   upload / form fields)     │   chart / diagram canvas)        │
│                             │                                   │
├─────────────────────────────┴───────────────────────────────────┤
│  Format  Copy  Download  Share  View API  View MCP             │
└─────────────────────────────────────────────────────────────────┘
```

### UI Component Architecture

```
apps/web/src/app/tools/[family]/[tool-name]/page.tsx
         │
         │  uses
         ▼
packages/ui/src/components/tool/
  ├── ToolWorkspace.tsx      ← layout shell (input | output | toolbar)
  ├── ToolInput.tsx          ← renders input fields from tool's input_schema
  ├── ToolOutput.tsx         ← renders output by artifact_type
  ├── ToolToolbar.tsx        ← copy / download / share / API / MCP buttons
  ├── ArtifactViewer.tsx     ← renders any artifact type (JSON, CSV, SVG, etc.)
  └── ArtifactPicker.tsx     ← "Use artifact" selector from project
```

The `page.tsx` for a tool is typically just:

```tsx
// apps/web/src/app/tools/data/json-formatter/page.tsx
import { ToolWorkspace } from "@guppy-kit/ui"

export default function JsonFormatterPage() {
  return (
    <ToolWorkspace
      toolName="json-formatter"
      layout="split"         // matches YAML ui.layout
    />
  )
}
```

`ToolWorkspace` fetches the tool schema from `GET /api/v1/tools/json-formatter`, renders the appropriate input widgets, calls `POST /api/v1/tools/json-formatter/execute`, and renders the output.

---

## Surface 2 — REST API (FastAPI)

Auto-generated from the tool's Pydantic schemas. No manual route registration.

```http
POST /api/v1/tools/{tool_name}/execute
Content-Type: application/json
Authorization: Bearer <api_key>

{
  "input": { ...tool's input_schema fields... },
  "config": { ...tool's config_schema fields... },
  "project_id": "uuid-optional"
}
```

Response:
```json
{
  "execution_id": "3f8a...",
  "status": "completed",
  "artifact": {
    "id": "7b2c...",
    "type": "json",
    "url": "https://storage.guppy-kit.dev/artifacts/...",
    "size_bytes": 1024,
    "created_at": "2026-08-30T12:00:00Z"
  },
  "duration_ms": 142
}
```

Other REST endpoints:

```http
GET  /api/v1/tools                    ← list all tools
GET  /api/v1/tools/{tool_name}        ← tool schema, metadata
GET  /api/v1/tools/{tool_name}/schema ← OpenAPI schema for this tool
```

---

## Surface 3 — MCP Server (Python MCP SDK)

Every tool is registered as an MCP tool automatically on server startup.

**Tool name:** kebab-case with underscores for MCP (e.g. `json_formatter`)

**Tool discovery:**
```
MCP: list_tools
→ returns all registered tools with name, description, inputSchema
```

**Tool execution:**
```
MCP: call_tool
  name: "json_formatter"
  arguments: { "code": "{ \"name\": \"AK\" }", "indent": 2 }
→ returns { content: [{ type: "text", text: "{ ... formatted JSON ... }" }] }
```

The MCP server is the interface that Phase 2 AI systems will use. The full capability of Phase 1 is exposed through it — no extra work required.

---

## Why This Matters for Phase 2

When the Intelligence Layer arrives, it:
1. Calls `MCP: list_tools` → discovers all 80+ platform tools with typed schemas
2. Calls individual tools via `MCP: call_tool` → gets structured artifact outputs
3. Passes artifact IDs between tool calls (composition via API)
4. **Never needs to know how any tool works** — only what its typed contract says

The Phase 2 planner treats the toolbox as a black box of capabilities. The three-interface model is what makes this possible without any rewiring.

---

## "View API" and "View MCP" Buttons

Every tool workspace in the UI includes buttons that show:

**View API:**
```http
POST /api/v1/tools/json-formatter/execute
{
  "input": {
    "code": "YOUR_JSON_HERE",
    "indent": 2
  }
}
```

**View MCP:**
```
Tool name: json_formatter
Input schema: { code: string, indent?: number }
Call: mcp.call_tool("json_formatter", { code: "...", indent: 2 })
```

This makes the API and MCP surface immediately discoverable by developers directly from the UI.
