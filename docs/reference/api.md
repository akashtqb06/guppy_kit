# Reference — REST API

Base URL: `http://localhost:8000/api/v1` (dev) · `https://api.guppy-kit.dev/v1` (production)

Interactive spec: `http://localhost:8000/docs` (Swagger UI) · `http://localhost:8000/redoc` (ReDoc)

---

## Authentication

```http
Authorization: Bearer <api_key>
```

API keys are created in Settings → API Keys. In dev mode, use the dev key from `.env`:

```bash
curl -H "Authorization: Bearer dev_key_local" http://localhost:8000/api/v1/tools
```

---

## Tools

| Method | Path | Description |
|---|---|---|
| `GET` | `/tools` | List all registered tools |
| `GET` | `/tools/{name}` | Get a tool's metadata and schema |
| `GET` | `/tools/{name}/schema` | OpenAPI schema for the tool's input/output |
| `POST` | `/tools/{name}/execute` | Execute a tool |
| `GET` | `/tools?category={cat}` | Filter tools by category |
| `GET` | `/tools?q={query}` | Search tools by name/description/tags |

### Execute a tool

```http
POST /api/v1/tools/csv-to-json/execute
Content-Type: application/json

{
  "input": {
    "data": "name,age\nAlice,30\nBob,25",
    "delimiter": ",",
    "has_header": true
  },
  "config": {
    "encoding": "utf-8"
  },
  "project_id": "abc-123-optional"
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
    "url": "https://storage/artifacts/...",
    "filename": "output.json",
    "size_bytes": 512,
    "created_at": "2026-08-30T12:00:00Z"
  },
  "duration_ms": 42
}
```

For async executions: `status: "running"`, no `artifact` yet — poll `GET /executions/{id}`.

### Pass an artifact as input

```http
POST /api/v1/tools/data-cleaner/execute
{
  "input": {
    "artifact_id": "3f8a...",      ← artifact from a previous execution
    "operations": ["trim", "drop_nulls"]
  }
}
```

---

## Executions

| Method | Path | Description |
|---|---|---|
| `GET` | `/executions/{id}` | Get execution status and artifact |
| `GET` | `/executions?project_id={id}` | List executions for a project |
| `GET` | `/executions?tool_name={name}` | List executions for a tool |

---

## Artifacts

| Method | Path | Description |
|---|---|---|
| `GET` | `/artifacts/{id}` | Get artifact metadata |
| `GET` | `/artifacts/{id}/download` | Download artifact content |
| `GET` | `/artifacts?project_id={id}` | List artifacts for a project |
| `DELETE` | `/artifacts/{id}` | Delete an artifact |

---

## Projects

| Method | Path | Description |
|---|---|---|
| `GET` | `/projects` | List all projects |
| `POST` | `/projects` | Create a new project |
| `GET` | `/projects/{id}` | Get project details |
| `PATCH` | `/projects/{id}` | Update project name/description |
| `DELETE` | `/projects/{id}` | Delete project and all its artifacts |
| `GET` | `/projects/{id}/files` | List uploaded files |
| `POST` | `/projects/{id}/files` | Upload a file to a project |
| `GET` | `/projects/{id}/executions` | List all executions in a project |
| `GET` | `/projects/{id}/artifacts` | List all artifacts in a project |
| `GET` | `/projects/{id}/pipelines` | List saved pipelines |
| `POST` | `/projects/{id}/pipelines` | Save a pipeline |
| `POST` | `/projects/{id}/pipelines/{pipeline_id}/execute` | Execute a pipeline |

---

## Events

| Method | Path | Description |
|---|---|---|
| `GET` | `/events` | List events (filterable by type, project_id, time range) |
| `GET` | `/events/stream` | SSE stream for real-time events |

SSE stream: `GET /api/v1/events/stream?project_id=abc` — streams events as `data: {json}` lines.

---

## Common Response Patterns

### Pagination
```
GET /tools?limit=20&cursor=<opaque>
→ { "data": [...], "pagination": { "next_cursor": "...", "has_more": true } }
```

### Errors (RFC 7807)
```json
{
  "type": "https://docs.guppy-kit.dev/errors/validation-error",
  "title": "Validation Error",
  "status": 422,
  "detail": "Field 'data' is required",
  "execution_id": "3f8a..."
}
```

Common error types: `validation-error` (422), `tool-not-found` (404), `execution-failed` (200 with `status: failed`), `rate-limit-exceeded` (429).
