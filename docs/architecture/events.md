# Architecture — Event System

The event system is Phase 1's deliberate preparation for Phase 2. Every meaningful action in the platform emits a structured, typed event. Phase 2 AI choreography will subscribe to these events.

---

## Design Philosophy

Events are **facts** — they record what happened, not what should happen. They are:
- Immutable (never updated after emission)
- Typed (structured schema, not free-form strings)
- Persisted (stored in PostgreSQL for history and replay)
- Streamed (published to Redis PubSub for real-time subscribers)

---

## Event Storage

```sql
CREATE TABLE events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type            TEXT NOT NULL,        -- e.g. "tool.execution.completed"
  payload         JSONB NOT NULL,       -- event-specific data
  project_id      UUID,                 -- null for project-agnostic events
  execution_id    UUID,                 -- null for non-execution events
  artifact_id     UUID,                 -- null for non-artifact events
  emitted_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX ON events (type);
CREATE INDEX ON events (project_id);
CREATE INDEX ON events (emitted_at);
-- Append-only. No UPDATE or DELETE.
```

---

## Platform Events

### Tool Execution Events

| Event | When | Payload |
|---|---|---|
| `tool.execution.started` | Execution record created, executor about to run | `{ execution_id, tool_name, tool_version, project_id, caller_type }` |
| `tool.execution.completed` | Executor returned successfully, artifact created | `{ execution_id, tool_name, tool_version, artifact_id, artifact_type, duration_ms }` |
| `tool.execution.failed` | Executor raised an exception | `{ execution_id, tool_name, error_message, duration_ms }` |

### Artifact Events

| Event | When | Payload |
|---|---|---|
| `artifact.created` | New artifact persisted | `{ artifact_id, artifact_type, tool_name, project_id, size_bytes }` |
| `artifact.deleted` | Artifact deleted with its project | `{ artifact_id, artifact_type, project_id }` |

### Project Events

| Event | When | Payload |
|---|---|---|
| `project.created` | New project created | `{ project_id, name }` |
| `project.file.uploaded` | User uploaded a file to a project | `{ project_id, file_id, filename, size_bytes, mime_type }` |
| `project.deleted` | Project deleted | `{ project_id }` |

### Pipeline Events

| Event | When | Payload |
|---|---|---|
| `pipeline.execution.started` | Pipeline begins running | `{ pipeline_execution_id, pipeline_id, project_id, step_count }` |
| `pipeline.step.completed` | One step in a pipeline completes | `{ pipeline_execution_id, step_index, tool_name, artifact_id }` |
| `pipeline.execution.completed` | All pipeline steps completed | `{ pipeline_execution_id, pipeline_id, duration_ms, artifact_ids }` |
| `pipeline.execution.failed` | A pipeline step failed | `{ pipeline_execution_id, step_index, tool_name, error_message }` |

---

## Event Emission (Python)

Events are emitted via the Event Bus service — not directly from tool executors:

```python
# backend/guppy/events/bus.py

class EventBus:
    async def emit(self, event: PlatformEvent) -> None:
        # 1. Persist to PostgreSQL (append-only)
        await db.execute(
            "INSERT INTO events (type, payload, project_id, execution_id, artifact_id) VALUES ($1, $2, $3, $4, $5)",
            [event.type, event.payload, event.project_id, event.execution_id, event.artifact_id]
        )
        # 2. Publish to Redis PubSub for real-time subscribers
        await redis.publish(f"events:{event.type}", event.model_dump_json())
        # 3. (Phase 2) Publish to subscriber channels by project_id
        if event.project_id:
            await redis.publish(f"events:project:{event.project_id}", event.model_dump_json())
```

The tool runtime calls the event bus — tool executors never call it directly.

---

## Real-Time UI Updates

The Next.js frontend subscribes to events via **Server-Sent Events (SSE)**:

```
GET /api/v1/events/stream?project_id=abc...
→  data: {"type": "tool.execution.completed", "execution_id": "...", "artifact_id": "..."}
→  data: {"type": "artifact.created", "artifact_id": "..."}
```

When the UI receives `tool.execution.completed`, it:
1. Marks the execution as complete in the UI
2. Fetches the new artifact metadata
3. Shows the "Use as input" button on the artifact card

---

## Phase 2 Subscription Model

When Phase 2 (Intelligence Layer) launches, AI choreography agents subscribe to events:

```python
# Phase 2 (not built in Phase 1)
@subscribe("tool.execution.completed", filter={"tool_name": "data-cleaner"})
async def on_data_cleaned(event: ToolExecutionCompleted) -> None:
    # Automatically trigger the next step in an AI-driven pipeline
    await planner.dispatch_next_step(artifact_id=event.artifact_id)
```

Phase 1 emits all the events. Phase 2 subscribes to them. No changes to Phase 1 code.

---

## Event Replay

Events are stored permanently in PostgreSQL. Any component (or external system) can replay events:

```http
GET /api/v1/events?project_id=abc&type=tool.execution.completed&from=2026-08-01T00:00:00Z
```

This enables:
- Debugging — replay exactly what happened during a session
- Analytics — aggregate event data for usage metrics
- Phase 2 onboarding — replay project history as context for an AI system
