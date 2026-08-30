# Guide — Projects

A Project is your workspace. Every file you upload, tool you run, artifact you produce, and pipeline you build lives inside a Project.

---

## Creating a Project

```bash
# Via UI: Landing page → "+ New Project" → give it a name
# Via API:
curl -X POST http://localhost:8000/api/v1/projects \
  -H "Authorization: Bearer dev_key_local" \
  -d '{"name": "OEE Analysis Q3", "description": "Weekly OEE data from Line 4"}'
```

---

## Project Contents

```
Project
├── Files          ← raw uploaded files (Excel, PDF, CSV, ZIP, etc.)
├── Executions     ← every tool run, with status and timing
├── Artifacts      ← typed outputs of tool executions
└── Pipelines      ← saved tool chains (visual builder)
```

---

## Uploading Files

```bash
# Via UI: Project page → "Upload Files" → drag and drop
# Via API:
curl -X POST http://localhost:8000/api/v1/projects/{id}/files \
  -H "Authorization: Bearer dev_key_local" \
  -F "file=@production.xlsx"
```

Uploaded files appear in the project sidebar. Click any file to:
- Preview (if viewable in browser)
- Pass as input to a compatible tool

---

## Artifacts Panel

Every time a tool runs successfully inside a project, its artifact is added to the Artifacts panel. The panel shows:
- Artifact type and filename
- Tool that produced it
- When it was created
- Size

From any artifact you can:
- **Download** — get the file
- **Preview** — view in-browser (JSON, SVG, Markdown, PNG)
- **Use as input** — pass to the next compatible tool
- **Share** — generate a view-only link (Milestone 6)
- **Copy URL** — direct link to the artifact content

---

## Execution History

Every tool run is logged in the Executions panel:
- Tool name and version
- Start time, duration
- Status (completed / failed)
- Input snapshot (viewable)
- Output artifact link

---

## Pipelines in a Project

Pipelines you build in the Visual Builder are saved to the project. A pipeline can be:
- **Run** — executes all steps, produces artifacts at each step
- **Re-run** — runs again with the same or updated inputs
- **Duplicated** — make a copy for variation
- **Exported** — saves the pipeline graph as JSON (importable to another project)

---

## Project Lifecycle

| Action | Effect |
|---|---|
| Archive project | Project marked inactive, files/artifacts moved to cold storage (Milestone 6) |
| Delete project | All files, artifacts, executions, and pipelines permanently deleted |
| Share project | All artifacts in the project accessible via view-only link (Milestone 6) |

> [!WARNING]
> Project deletion is permanent. All artifacts in the project are deleted from object storage.
