# Reference — MCP Tools

The Guppy Kit MCP server exposes all registered tools as MCP tools. This reference covers discovery, authentication, and calling patterns.

---

## Server Info

```
Transport: HTTP (SSE)
Endpoint: http://localhost:4000/mcp  (dev)
Auth: X-Guppy-Api-Key: <api_key>
```

---

## Discovery

```
MCP: initialize → get server capabilities
MCP: tools/list → returns all registered tools
```

Each tool entry:
```json
{
  "name": "json_formatter",
  "description": "Format and pretty-print JSON with configurable indentation",
  "inputSchema": {
    "type": "object",
    "properties": {
      "code": { "type": "string", "description": "JSON to format" },
      "indent": { "type": "integer", "default": 2 }
    },
    "required": ["code"]
  }
}
```

Tool names in MCP use **underscores** (`json_formatter`) — the same tool is `json-formatter` in the REST API and UI.

---

## Calling a Tool

```
MCP: tools/call
  name: "csv_to_json"
  arguments: {
    "data": "name,age\nAlice,30",
    "delimiter": ","
  }
```

Response:
```json
{
  "content": [
    {
      "type": "text",
      "text": "[{\"name\": \"Alice\", \"age\": 30}]"
    }
  ],
  "isError": false,
  "_meta": {
    "execution_id": "3f8a...",
    "artifact_id": "7b2c...",
    "artifact_type": "json",
    "duration_ms": 42
  }
}
```

For binary artifact types (PDF, PNG, PPTX), the response includes the artifact URL:
```json
{
  "content": [
    {
      "type": "text",
      "text": "Artifact created: https://storage/artifacts/..."
    }
  ],
  "_meta": { "artifact_id": "...", "artifact_type": "pdf" }
}
```

---

## Passing an Artifact as Input

```
MCP: tools/call
  name: "data_cleaner"
  arguments: {
    "artifact_id": "7b2c...",
    "operations": ["trim", "drop_nulls"]
  }
```

---

## Tool Name Mapping

| REST name | MCP name |
|---|---|
| `json-formatter` | `json_formatter` |
| `csv-to-json` | `csv_to_json` |
| `url-encoder` | `url_encoder` |
| `er-diagram` | `er_diagram` |

Rule: replace hyphens with underscores.

---

## Full Tool Catalog via MCP

All tools in all 8 families are available. Call `tools/list` on the running server for the authoritative list. See [`docs/tools/`](../tools/) for the human-readable catalog.
