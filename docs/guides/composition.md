# Guide — Tool Composition

Tool composition lets you chain the output of one tool directly into the input of the next — no downloading, no re-uploading.

---

## The Mental Model

```
Tool A runs → produces Artifact (JSON, CSV, SVG, etc.)
                    ↓
              Artifact is typed
                    ↓
              Tool B accepts this type? → yes → use it as input
                    ↓
              Tool B runs → produces Artifact
                    ↓
              ...and so on
```

---

## Method 1 — Manual (Click "Use as Input")

1. Run any tool in a project
2. In the Artifacts panel, click **"Use as Input"** on an artifact
3. A dropdown shows all compatible tools (tools whose `accepts_artifacts` includes this type)
4. Select a tool → it opens with the artifact pre-loaded
5. Run it → a new artifact is added to the panel

---

## Method 2 — Visual Pipeline Builder

1. Go to a project → click **"New Pipeline"**
2. Search for a tool → drag it onto the canvas
3. Drag a second tool → connect them with an edge (the edge label shows the artifact type)
4. Repeat for as many steps as needed
5. Configure each step's input and settings
6. Click **"Run"** → all steps execute in order, artifacts flow automatically

### Example pipeline — Excel Dashboard

```
┌──────────────┐   xlsx   ┌────────────────┐   csv   ┌──────────────┐
│  File Upload │ ───────▶ │  Data Cleaner  │ ──────▶ │ Chart Builder│
└──────────────┘          └────────────────┘         └──────────────┘
                                                            │ svg
                                                            ▼
                                                    ┌──────────────────┐
                                                    │ Presentation     │
                                                    │ Builder          │
                                                    └──────────────────┘
                                                            │ pptx
                                                            ▼
                                                         Export
```

---

## Method 3 — Via REST API

```bash
# Step 1: Run Tool A
ARTIFACT_ID=$(curl -s -X POST http://localhost:8000/api/v1/tools/csv-to-json/execute \
  -H "Authorization: Bearer dev_key_local" \
  -H "Content-Type: application/json" \
  -d '{"input": {"data": "name,age\nAlice,30"}, "project_id": "abc..."}' \
  | jq -r '.artifact.id')

# Step 2: Pass artifact to Tool B
curl -X POST http://localhost:8000/api/v1/tools/json-formatter/execute \
  -H "Authorization: Bearer dev_key_local" \
  -H "Content-Type: application/json" \
  -d "{\"input\": {\"artifact_id\": \"$ARTIFACT_ID\"}, \"project_id\": \"abc...\"}"
```

---

## What Makes Two Tools Compatible?

A tool is compatible as input for another tool when:

1. The source tool's `artifact_type` appears in the target tool's `accepts_artifacts` list

```yaml
# csv-to-json produces:
artifact_type: json

# json-formatter accepts:
accepts_artifacts: [json]

# → Compatible ✅
```

2. The UI shows the compatibility at the edge level in the Visual Builder
3. The API enforces it at runtime — passing an incompatible artifact returns a 422 error

---

## Composition Rules

| Rule | Details |
|---|---|
| Artifacts are immutable | Tool B receives a copy of Tool A's artifact — it cannot modify the original |
| Artifacts are typed | Type compatibility is enforced — you cannot pass a PDF to a CSV profiler |
| No cycles | Pipelines cannot reference their own output as input (topological sort enforced) |
| Fan-out allowed | One artifact can be passed to multiple tools simultaneously |
| Artifacts persist independently | If Tool B fails, Tool A's artifact is still available |
