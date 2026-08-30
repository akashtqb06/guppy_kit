# Workflow Tools

The Workflow family is not a collection of standalone tools — it is the **composition runtime** that chains all other tool families together into deterministic, reusable pipelines.

---

## What Workflows Do

A workflow is a saved, named pipeline of tool steps. Each step produces an artifact that feeds the next step.

```
Upload Excel
     ↓  artifact: xlsx
Data Profiler
     ↓  artifact: profile.json
Data Cleaner
     ↓  artifact: clean.csv
Chart Builder
     ↓  artifact: chart.svg
Presentation Builder
     ↓  artifact: report.pptx
```

---

## Building a Workflow

### Visual Builder (React Flow)

1. Open a project → click **"New Pipeline"**
2. Drag tools from the sidebar onto the canvas
3. Connect tool nodes with edges (the platform validates artifact type compatibility)
4. Configure each step's input and settings
5. Click **"Run"**

### Saving and Reusing

- Click **"Save Pipeline"** → give it a name
- The pipeline is saved to the project
- Run it again with new inputs at any time

### Via API

```bash
# Execute a saved pipeline
curl -X POST $BASE/projects/{project_id}/pipelines/{pipeline_id}/execute \
  -H "Authorization: Bearer $API_KEY" \
  -d '{"inputs": {"step_0": {"artifact_id": "new-file-id"}}}'
```

---

## Pipeline Features

| Feature | Status |
|---|---|
| Linear steps | Milestone 4 |
| Parallel steps (when no data dependency) | Milestone 4 |
| Conditional branching | Milestone 4 |
| Scheduled pipelines | Milestone 6 |
| Pipeline templates | Milestone 6 |
| Pipeline sharing | Milestone 6 |

---

## Built-in Templates (Milestone 6)

| Template | Steps |
|---|---|
| **Excel Dashboard** | Upload → Data Profiler → Chart Builder → Presentation |
| **DB Docs** | SQL Schema → ER Diagram → SQL Docs → PDF |
| **Data Report** | Upload CSV → Cleaner → Chart → Presentation |
| **PDF to Structured JSON** | PDF → Text → Data Extractor → JSON Formatter |
