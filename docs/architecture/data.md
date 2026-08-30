# Architecture — Data Layer

Simple, deliberate, no premature complexity. The right store for each concern — introduced when the specific workload justifies it.

---

## Storage Map

| Concern | Store | Escalation trigger |
|---|---|---|
| Relational state (tools, executions, artifacts, projects, events, pipelines) | **PostgreSQL 16** | Never — this is the canonical store |
| Artifact files, uploaded files, temp execution files | **MinIO** (S3-compatible object storage) | Scale to AWS S3 / Azure Blob in cloud deployments |
| Real-time event streaming (UI SSE subscriptions) | **Redis 7 PubSub** | Kafka when event throughput > 10k/sec (measured) |
| API response cache, tool schema cache | **Redis 7** | Increase Redis memory allocation |
| Analytical queries over execution history | **DuckDB** (in-process, zero infra) | ClickHouse when query latency > 2s p95 at production scale |

---

## PostgreSQL Schema

### Core tables

```sql
-- Tools (loaded from YAML at startup — these are the registry snapshots)
CREATE TABLE tools (
  name          TEXT PRIMARY KEY,
  version       TEXT NOT NULL,
  category      TEXT NOT NULL,
  description   TEXT NOT NULL,
  tags          TEXT[] NOT NULL DEFAULT '{}',
  input_schema  JSONB NOT NULL,
  output_schema JSONB NOT NULL,
  config_schema JSONB,
  artifact_type TEXT NOT NULL,
  accepts_artifacts TEXT[] NOT NULL DEFAULT '{}',
  ui_config     JSONB,
  registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Projects
CREATE TABLE projects (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  description   TEXT,
  visibility    TEXT NOT NULL DEFAULT 'private',  -- private | shared | public
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Uploaded files (not artifacts — raw user uploads)
CREATE TABLE project_files (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id    UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  filename      TEXT NOT NULL,
  storage_ref   TEXT NOT NULL,              -- S3 key
  size_bytes    BIGINT NOT NULL,
  mime_type     TEXT NOT NULL,
  uploaded_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tool executions
CREATE TABLE executions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_name        TEXT NOT NULL REFERENCES tools(name),
  tool_version     TEXT NOT NULL,
  project_id       UUID REFERENCES projects(id),
  status           TEXT NOT NULL,           -- running | completed | failed
  input_snapshot   JSONB NOT NULL,
  config_snapshot  JSONB,
  artifact_id      UUID,                    -- FK set on completion
  error            TEXT,
  started_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at     TIMESTAMPTZ,
  duration_ms      INT,
  caller_type      TEXT NOT NULL            -- ui | rest | mcp
);

-- Artifacts
CREATE TABLE artifacts (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  execution_id     UUID NOT NULL REFERENCES executions(id),
  project_id       UUID REFERENCES projects(id),
  tool_name        TEXT NOT NULL,
  tool_version     TEXT NOT NULL,
  artifact_type    TEXT NOT NULL,
  storage_ref      TEXT NOT NULL,           -- S3 key
  filename         TEXT NOT NULL,
  size_bytes       BIGINT NOT NULL,
  mime_type        TEXT NOT NULL,
  output_schema    JSONB NOT NULL,
  metadata         JSONB,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Platform events (append-only)
CREATE TABLE events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type            TEXT NOT NULL,
  payload         JSONB NOT NULL,
  project_id      UUID,
  execution_id    UUID,
  artifact_id     UUID,
  emitted_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Pipelines
CREATE TABLE pipelines (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id    UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  description   TEXT,
  graph         JSONB NOT NULL,
  version       INT NOT NULL DEFAULT 1,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Pipeline executions
CREATE TABLE pipeline_executions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pipeline_id     UUID NOT NULL REFERENCES pipelines(id),
  project_id      UUID NOT NULL,
  status          TEXT NOT NULL,
  step_results    JSONB NOT NULL DEFAULT '{}',
  started_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at    TIMESTAMPTZ
);
```

### Indexes

```sql
CREATE INDEX ON executions (project_id);
CREATE INDEX ON executions (tool_name, status);
CREATE INDEX ON executions (started_at DESC);
CREATE INDEX ON artifacts (project_id);
CREATE INDEX ON artifacts (artifact_type);
CREATE INDEX ON events (type);
CREATE INDEX ON events (project_id);
CREATE INDEX ON events (emitted_at DESC);
CREATE INDEX ON project_files (project_id);
```

---

## Redis Usage

| Key pattern | Purpose | TTL |
|---|---|---|
| `events:{type}` | PubSub channel for real-time event streaming | — (PubSub, no TTL) |
| `events:project:{project_id}` | PubSub channel scoped to a project | — |
| `tool_schema:{tool_name}` | Cached tool schema (avoid DB hit per request) | 5 minutes |
| `tool_registry` | Cached list of all tools | 1 minute |
| `rate_limit:{api_key}:{window}` | Rate limiting per API key | 60 seconds |

---

## Object Storage Layout (MinIO / S3)

```
guppy-dev/                        ← bucket (one per environment)
  uploads/
    {project_id}/
      {upload_id}/{filename}      ← raw user uploads
  artifacts/
    {project_id}/
      {execution_id}/
        output.{ext}              ← tool output artifact
  temp/
    {execution_id}/
      *                           ← cleaned up after execution completes
```

---

## Migrations

Managed by **Alembic**:

```bash
# Create a new migration
cd backend && alembic revision --autogenerate -m "add pipelines table"

# Apply migrations
alembic upgrade head

# Check current state
alembic current
```

Migration invariants:
- `events` table: append-only — no application-layer `UPDATE` or `DELETE` paths
- `executions.input_snapshot`: written once, never updated
- `artifacts`: immutable after creation — no update path
