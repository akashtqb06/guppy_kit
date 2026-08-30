# Architecture — Execution Model

Every tool execution follows the same lifecycle, regardless of which tool is running or which surface (UI, REST, MCP) initiated it.

---

## Lifecycle Diagram

```
Caller (UI / REST / MCP)
           │
           │  {tool_name, input, config, project_id}
           ▼
┌──────────────────────────────────────────────────────────────┐
│                    API GATEWAY                               │
│                                                              │
│  1. Authenticate caller                                      │
│  2. Rate limit check                                         │
│  3. Validate tool_name exists in registry                    │
└──────────────────────────────┬───────────────────────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────────────────────┐
│                    TOOL RUNTIME                              │
│                                                              │
│  4. Create Execution record (status=running) in PostgreSQL   │
│  5. Emit tool.execution.started event                        │
│  6. Validate input against tool's input_schema               │
│  7. Validate config against tool's config_schema             │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │                 EXECUTOR (tool.execute())              │  │
│  │                                                        │  │
│  │  Pure function: input → output                         │  │
│  │  No side effects. No DB/network outside tool logic.    │  │
│  └──────────────────────────┬─────────────────────────────┘  │
│                             │ output (typed)                  │
│  8. Validate output against tool's output_schema             │
│  9. Serialize output to artifact_type format                 │
│  10. Upload artifact to object storage (MinIO)               │
│  11. Create Artifact record in PostgreSQL                    │
│  12. Update Execution record (status=completed)              │
│  13. Emit tool.execution.completed event                     │
│  14. Return ExecutionResult to caller                        │
└──────────────────────────────────────────────────────────────┘
           │
           │  { execution_id, status, artifact_id, artifact_url }
           ▼
        Caller
```

---

## Execution Record

Every execution creates a persistent record:

```sql
CREATE TABLE executions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_name        TEXT NOT NULL,
  tool_version     TEXT NOT NULL,        -- exact version used — immutable
  project_id       UUID REFERENCES projects(id),
  status           TEXT NOT NULL,        -- running | completed | failed
  input_snapshot   JSONB NOT NULL,       -- snapshot of input at execution time
  config_snapshot  JSONB,               -- snapshot of config at execution time
  artifact_id      UUID REFERENCES artifacts(id),  -- null until completed
  error            TEXT,                -- null unless failed
  started_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at     TIMESTAMPTZ,
  duration_ms      INT,
  caller_type      TEXT NOT NULL        -- ui | rest | mcp
);
```

**Immutability rules:**
- `tool_version` is the exact version string at execution time — never updated
- `input_snapshot` is the verbatim input — never updated after creation
- `status` transitions: `running → completed` or `running → failed` — no other transitions
- Executions are never deleted — they are the audit trail

---

## Error Handling

If `execute()` raises an exception:

1. The exception is caught by the runtime
2. `Execution.status` → `failed`
3. `Execution.error` is set to the exception message (never the full traceback in the API response — logged internally only)
4. `tool.execution.failed` event is emitted
5. Caller receives `{ status: "failed", error: "..." }` — no 500 unless the runtime itself crashed

Tool executors should raise typed exceptions:

```python
from guppy.core.exceptions import ToolInputError, ToolExecutionError

class CsvToJsonTool(BaseTool):
    async def execute(self, input, config):
        try:
            parsed = parse_csv(input.data, input.delimiter)
        except ValueError as e:
            raise ToolInputError(f"Invalid CSV: {e}") from e   # 422 to caller
        except Exception as e:
            raise ToolExecutionError(f"Processing failed: {e}") from e  # 500 to caller
        return CsvToJsonOutput(result=parsed, row_count=len(parsed))
```

---

## Async Execution

For tools that take longer than ~2 seconds (large file processing, complex generation):

1. Caller receives `{ execution_id, status: "running" }` immediately
2. Runtime executes in a background task
3. Caller polls `GET /api/v1/executions/{execution_id}` for status
4. UI subscribes to Redis PubSub on the execution ID channel for real-time updates
5. On completion, `tool.execution.completed` is emitted and the UI updates automatically

The threshold for async execution is configurable per tool via the YAML:

```yaml
execution:
  mode: async          # sync (default) | async | auto
  timeout_seconds: 120 # default: 30
```

---

## Concurrency and Isolation

- Each tool execution runs in its own async task — no shared mutable state between executions
- Tool executors must be stateless — no instance variables that persist between `execute()` calls
- File uploads are written to a temporary S3 prefix scoped to the execution ID, then moved to the artifact prefix on completion
- Multiple concurrent executions of the same tool are fully supported

---

## Performance Targets

| Metric | Target | Measured at |
|---|---|---|
| Sync execution (< 1MB input) | < 500ms p95 | Milestone 3 |
| Async execution (< 50MB input) | < 30s p95 | Milestone 3 |
| Concurrent executions | 50 simultaneous | Milestone 6 |
| Tool registry load time | < 100ms | Milestone 1 |
| REST API cold response (tool lookup) | < 50ms p99 | Milestone 5 |
