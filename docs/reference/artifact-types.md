# Reference — Artifact Types

All artifact types produced and consumed by Guppy Kit tools.

---

## Type Registry

| Type ID | MIME Type | File Extension | Description |
|---|---|---|---|
| `json` | `application/json` | `.json` | Structured JSON — objects, arrays |
| `csv` | `text/csv` | `.csv` | Tabular data, delimiter-separated |
| `xlsx` | `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` | `.xlsx` | Excel workbook |
| `pdf` | `application/pdf` | `.pdf` | PDF document |
| `pptx` | `application/vnd.openxmlformats-officedocument.presentationml.presentation` | `.pptx` | PowerPoint presentation |
| `svg` | `image/svg+xml` | `.svg` | Scalable vector graphic (diagrams, charts) |
| `png` | `image/png` | `.png` | Raster image |
| `sql` | `application/sql` | `.sql` | SQL script |
| `markdown` | `text/markdown` | `.md` | Markdown document |
| `diagram` | `application/json` | `.diagram.json` | Platform diagram format (React Flow-compatible) |
| `text` | `text/plain` | `.txt` | Plain text |
| `html` | `text/html` | `.html` | HTML document |
| `archive` | `application/zip` | `.zip` | Multi-file bundle (for tools producing multiple outputs) |

---

## Compatibility Matrix

Which artifact types each family's tools commonly produce and accept:

| Family | Produces | Accepts |
|---|---|---|
| Data | `json`, `csv`, `xlsx`, `text` | `json`, `csv`, `xlsx`, `text` |
| Documents | `pdf`, `markdown`, `text`, `html` | `pdf`, `markdown`, `text`, `html`, `xlsx` |
| Developer | `json`, `text`, `sql`, `markdown` | `json`, `text`, `sql`, `markdown` |
| Database | `sql`, `svg`, `markdown`, `json` | `sql`, `json` |
| Visualization | `svg`, `png`, `json` | `json`, `csv`, `diagram` |
| Presentation | `pptx`, `pdf`, `markdown` | `svg`, `png`, `json`, `csv`, `markdown` |
| Workflow | any (pipeline output) | any (pipeline input) |
| Utilities | `text`, `json`, `png` | `text`, `json` |

---

## Artifact Metadata Fields

All artifacts carry this metadata regardless of type:

```json
{
  "id": "7b2c...",
  "type": "json",
  "filename": "output.json",
  "mime_type": "application/json",
  "size_bytes": 1024,
  "tool_name": "csv-to-json",
  "tool_version": "1.0.0",
  "execution_id": "3f8a...",
  "project_id": "abc...",
  "created_at": "2026-08-30T12:00:00Z",
  "url": "https://storage/artifacts/..."
}
```

---

## Using Artifact Types in Tool YAML

```yaml
# Produce a JSON artifact
artifact_type: json

# Accept CSV or text as input (for composition)
accepts_artifacts: [csv, text]
```

```python
# In the executor
from guppy.core.types import ArtifactType

class MyTool(BaseTool):
    output_artifact_type = ArtifactType.JSON
    input_accepts_artifacts = [ArtifactType.CSV, ArtifactType.TEXT]
```
