# Reference — Platform Events

All events emitted by the Guppy Kit event system. Events are persisted in the `events` table and published on Redis PubSub channels.

---

## Tool Execution Events

### `tool.execution.started`
Emitted when the tool runtime begins executing a tool (after input validation).

```json
{
  "type": "tool.execution.started",
  "payload": {
    "execution_id": "3f8a...",
    "tool_name": "csv-to-json",
    "tool_version": "1.0.0",
    "project_id": "abc...",    // null if no project
    "caller_type": "ui"        // ui | rest | mcp
  },
  "emitted_at": "2026-08-30T12:00:00Z"
}
```

### `tool.execution.completed`
Emitted when the executor returns successfully and the artifact is persisted.

```json
{
  "type": "tool.execution.completed",
  "payload": {
    "execution_id": "3f8a...",
    "tool_name": "csv-to-json",
    "tool_version": "1.0.0",
    "artifact_id": "7b2c...",
    "artifact_type": "json",
    "project_id": "abc...",
    "duration_ms": 42
  }
}
```

### `tool.execution.failed`
Emitted when the executor raises an exception.

```json
{
  "type": "tool.execution.failed",
  "payload": {
    "execution_id": "3f8a...",
    "tool_name": "csv-to-json",
    "error_message": "Invalid CSV: expected 3 columns, got 2 in row 4",
    "error_type": "ToolInputError",
    "project_id": "abc...",
    "duration_ms": 12
  }
}
```

---

## Artifact Events

### `artifact.created`
```json
{
  "type": "artifact.created",
  "payload": {
    "artifact_id": "7b2c...",
    "artifact_type": "json",
    "tool_name": "csv-to-json",
    "project_id": "abc...",
    "size_bytes": 1024
  }
}
```

### `artifact.deleted`
```json
{
  "type": "artifact.deleted",
  "payload": { "artifact_id": "7b2c...", "artifact_type": "json", "project_id": "abc..." }
}
```

---

## Project Events

### `project.created`
```json
{ "type": "project.created", "payload": { "project_id": "abc...", "name": "OEE Analysis" } }
```

### `project.file.uploaded`
```json
{
  "type": "project.file.uploaded",
  "payload": {
    "project_id": "abc...",
    "file_id": "f1...",
    "filename": "production.xlsx",
    "size_bytes": 204800,
    "mime_type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  }
}
```

### `project.deleted`
```json
{ "type": "project.deleted", "payload": { "project_id": "abc..." } }
```

---

## Pipeline Events

### `pipeline.execution.started`
```json
{
  "type": "pipeline.execution.started",
  "payload": { "pipeline_execution_id": "...", "pipeline_id": "...", "project_id": "...", "step_count": 4 }
}
```

### `pipeline.step.completed`
```json
{
  "type": "pipeline.step.completed",
  "payload": { "pipeline_execution_id": "...", "step_index": 1, "tool_name": "data-cleaner", "artifact_id": "..." }
}
```

### `pipeline.execution.completed`
```json
{
  "type": "pipeline.execution.completed",
  "payload": { "pipeline_execution_id": "...", "pipeline_id": "...", "duration_ms": 3420, "artifact_ids": ["...", "..."] }
}
```

### `pipeline.execution.failed`
```json
{
  "type": "pipeline.execution.failed",
  "payload": { "pipeline_execution_id": "...", "step_index": 2, "tool_name": "chart-builder", "error_message": "..." }
}
```

---

## Querying Events

```http
GET /api/v1/events?type=tool.execution.completed&project_id=abc&from=2026-08-01T00:00:00Z&limit=50
```

## Real-Time Subscription (SSE)

```http
GET /api/v1/events/stream?project_id=abc
```

Returns: `data: {json event}\n\n` stream (Server-Sent Events).
