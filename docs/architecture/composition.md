# Architecture — Tool Composition

Tool composition is the capability that transforms Guppy Kit from a collection of utilities into a workbench. It lets users chain tool outputs into tool inputs — without downloading or uploading anything.

---

## The Composition Model

```
Artifact (output of Tool A)
            ↓
      [compatible with Tool B's input_accepts_artifacts?]
            ↓ yes
         Tool B
            ↓
         Artifact (output of Tool B)
            ↓
         Tool C
            ↓
         ...
```

The composition rule is simple: **any artifact whose type appears in a tool's `input_accepts_artifacts` list can be passed to that tool as input.**

---

## Linear Pipeline

The simplest composition: a sequence of tool steps.

```
Excel Upload (artifact: xlsx)
      ↓
Data Profiler (accepts: xlsx, csv) → artifact: profile.json
      ↓
Data Cleaner (accepts: json, csv, xlsx) → artifact: clean.csv
      ↓
Chart Builder (accepts: csv, json) → artifact: chart.svg
      ↓
Presentation Builder (accepts: svg, json, csv) → artifact: report.pptx
```

The user builds this by:
1. Running Tool A → getting an artifact in the project panel
2. Clicking "Use as input" on the artifact → selecting Tool B
3. Executing Tool B → getting another artifact
4. Repeating

Or by using the **Visual Pipeline Builder** (see below).

---

## Visual Pipeline Builder

Built with **React Flow**. Users compose pipelines by:

1. Searching for a tool → dragging it onto the canvas
2. Connecting tool nodes with edges (artifact type shown on the edge)
3. Configuring each tool node
4. Hitting "Run" — the execution engine runs the pipeline

```
┌──────────────┐      xlsx      ┌──────────────┐     csv      ┌──────────────┐
│   Excel      │ ─────────────▶ │   Data       │ ───────────▶ │   Chart      │
│   Upload     │                │   Cleaner    │              │   Builder    │
└──────────────┘                └──────────────┘              └──────────────┘
                                                                     │
                                                                   svg ↓
                                                              ┌──────────────┐
                                                              │ Presentation │
                                                              │ Builder      │
                                                              └──────────────┘
```

### Pipeline persistence

A pipeline is saved as a JSON graph in PostgreSQL:

```sql
CREATE TABLE pipelines (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id    UUID NOT NULL REFERENCES projects(id),
  name          TEXT NOT NULL,
  description   TEXT,
  graph         JSONB NOT NULL,     -- { nodes: [...], edges: [...] }
  version       INT NOT NULL DEFAULT 1,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## Pipeline Execution Engine

When a pipeline runs:

1. **Topological sort** of nodes (detect cycles → reject)
2. For each node in order:
   a. Resolve input: explicit value OR artifact from a previous step's output
   b. Execute the tool (same runtime as standalone execution)
   c. Persist artifact
   d. Emit step event
3. On any step failure: pipeline stops, status = `failed`, error logged
4. On all steps complete: pipeline status = `completed`

Pipelines can run steps in parallel when there are no data dependencies between them (determined by the graph topology).

```python
# Pipeline execution record
CREATE TABLE pipeline_executions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pipeline_id     UUID NOT NULL REFERENCES pipelines(id),
  project_id      UUID NOT NULL,
  status          TEXT NOT NULL,          -- running | completed | failed
  step_results    JSONB NOT NULL,         -- { node_id: { execution_id, artifact_id, status } }
  started_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at    TIMESTAMPTZ
);
```

---

## Composition Constraints

| Constraint | Rule |
|---|---|
| Type safety | An edge between two tool nodes is only valid if the source tool's `output_artifact_type` appears in the target tool's `input_accepts_artifacts` |
| Cycles | Pipelines with cycles are rejected at save time (topological sort fails) |
| Fan-out | One artifact can be input to multiple tool nodes simultaneously |
| Fan-in | A tool that accepts multiple artifacts as input must declare separate input fields |
| Max steps | No hard limit in Phase 1; monitored for performance |

---

## Templates

Pre-built pipelines for common tasks (Milestone 6):

| Template | Steps |
|---|---|
| Excel Dashboard | Upload Excel → Data Profiler → Chart Builder → Presentation |
| DB Documentation | SQL Schema → ER Diagram → SQL → Docs Markdown → PDF |
| Data Report | Upload CSV → Data Cleaner → Chart Builder → Presentation |
| Codebase Map | Upload ZIP → Repo Analyzer → Dependency Graph → Architecture Doc |
