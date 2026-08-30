# Architecture — Artifact System

Artifacts are the composition glue of Guppy Kit. Every tool produces a typed artifact. Artifacts can be passed directly as input to the next tool — no download, no upload, no manual file transfer.

---

## What is an Artifact?

An artifact is the structured, persisted output of a tool execution. It has:

- A **type** (JSON, CSV, XLSX, PDF, SVG, PNG, PPTX, SQL, Markdown, Diagram, Text)
- A **storage ref** (S3 key pointing to the actual content)
- **Metadata** (tool name, version, execution ID, project ID, MIME type, size)
- **Schema snapshot** (the output schema used to produce it — for compatibility checking)

Artifacts are immutable once created. A new execution produces a new artifact.

---

## Artifact Types

| Type | MIME | File ext | Produced by |
|---|---|---|---|
| `json` | `application/json` | `.json` | Converter tools, profiler, formatter |
| `csv` | `text/csv` | `.csv` | Data cleaner, column mapper, transformer |
| `xlsx` | `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` | `.xlsx` | Excel generators |
| `pdf` | `application/pdf` | `.pdf` | Document converters, presentation export |
| `pptx` | `application/vnd.openxmlformats...presentationml.presentation` | `.pptx` | Presentation builder |
| `svg` | `image/svg+xml` | `.svg` | Diagram tools, chart builders |
| `png` | `image/png` | `.png` | Chart export, diagram export |
| `sql` | `application/sql` | `.sql` | SQL generator, schema → SQL tools |
| `markdown` | `text/markdown` | `.md` | Documentation generator, Markdown tools |
| `diagram` | `application/json` | `.diagram.json` | Visual diagram builder (internal format) |
| `text` | `text/plain` | `.txt` | Text extraction, PDF → text |

---

## PostgreSQL Schema

```sql
CREATE TABLE artifacts (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  execution_id     UUID NOT NULL REFERENCES executions(id),
  project_id       UUID REFERENCES projects(id),
  tool_name        TEXT NOT NULL,
  tool_version     TEXT NOT NULL,
  artifact_type    TEXT NOT NULL,              -- enum: json | csv | xlsx | ...
  storage_ref      TEXT NOT NULL,              -- S3 key: artifacts/{project_id}/{execution_id}/{name}.{ext}
  filename         TEXT NOT NULL,              -- human-readable name
  size_bytes       BIGINT NOT NULL,
  mime_type        TEXT NOT NULL,
  output_schema    JSONB NOT NULL,             -- snapshot of the tool's output_schema
  metadata         JSONB,                      -- tool-specific metadata (e.g. row count for CSV)
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
  -- No updated_at. Artifacts are immutable.
);

CREATE INDEX ON artifacts (project_id);
CREATE INDEX ON artifacts (artifact_type);
CREATE INDEX ON artifacts (tool_name);
```

---

## Object Storage Layout

```
guppy-{workspace}/
  artifacts/
    {project_id}/
      {execution_id}/
        output.json         ← the actual artifact content
  uploads/
    {project_id}/
      {upload_id}/
        {original_filename} ← user-uploaded files (not artifacts)
  temp/
    {execution_id}/
      *                     ← temp files during execution, cleaned up after
```

---

## Artifact Compatibility

The composition system uses a **compatibility matrix** to determine which tools accept which artifact types as input:

| Artifact type | Tools that accept it |
|---|---|
| `json` | JSON formatter, JSON diff, chart builders, presentation builder, any data tool |
| `csv` | Data profiler, data cleaner, column mapper, chart builders, CSV → JSON |
| `xlsx` | Excel analyzer, Excel → JSON, Excel → CSV |
| `pdf` | PDF splitter, PDF → text, document compare |
| `svg` | Presentation builder (embed diagram), SVG → PNG |
| `sql` | SQL formatter, SQL validator, ER diagram |
| `markdown` | Markdown → PDF, Markdown preview |
| `diagram` | Diagram editor (open for editing), SVG export |

The compatibility matrix is declared in each tool's YAML:

```yaml
accepts_artifacts: [json, csv]    # artifact types this tool can accept as input
```

---

## Artifact Lifecycle

```
tool.execute() returns output
         ↓
Runtime serializes output to artifact_type format
         ↓
Uploaded to S3: artifacts/{project_id}/{execution_id}/output.{ext}
         ↓
Artifact record created in PostgreSQL
         ↓
artifact.created event emitted
         ↓
Artifact available via API: GET /api/v1/artifacts/{artifact_id}
         ↓
Artifact available in Project UI: "Use as input" button on compatible tools
```

---

## Using an Artifact as Input

### In the UI
1. User runs Tool A → artifact is created and shown in the project panel
2. User clicks "Use as input" on the artifact → opens a compatible Tool B with the artifact pre-loaded
3. Tool B executes → produces a new artifact

### Via REST API
```http
POST /api/v1/tools/data-cleaner/execute
Content-Type: application/json

{
  "input": {
    "artifact_id": "3f8a-...",    ← reference an existing artifact
    "operations": ["trim", "drop_nulls"]
  },
  "project_id": "abc..."
}
```

The runtime resolves the artifact from S3 and passes its content to the executor as if it were direct input.

### Via MCP
```json
{
  "tool": "data_cleaner",
  "arguments": {
    "artifact_id": "3f8a-...",
    "operations": ["trim", "drop_nulls"]
  }
}
```

---

## Artifact Retention

- Artifacts are retained for the lifetime of the project
- Projects can be archived (artifacts moved to cold storage) or deleted (artifacts permanently deleted)
- Temporary execution files (`temp/`) are deleted immediately after execution completes or fails
- No automatic artifact expiry in Phase 1 — all artifacts are kept unless the project is deleted
