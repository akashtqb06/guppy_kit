# Reference — Tool Contract (Full YAML Spec)

Every tool must have a YAML definition in `tool-definitions/<category>/<name>.yaml`. This document specifies every field.

---

## Complete Schema

```yaml
# tool-definitions/<category>/<name>.yaml

# ── Identity ────────────────────────────────────────────────────────────────
name: <string>           # required — kebab-case, globally unique (e.g. csv-to-json)
version: "<semver>"      # required — e.g. "1.0.0"
category: <category>     # required — data | documents | developer | database
                         #            visualization | presentation | workflow | utilities
description: <string>    # required — one-line description shown in UI search, API, MCP
tags: [<string>]         # optional — search tags (e.g. [csv, json, conversion])

# ── Input Fields ────────────────────────────────────────────────────────────
input:
  - name: <string>       # required — snake_case, matches Pydantic model field name
    type: <type>         # required — see Field Types below
    description: <string># required — shown as label/tooltip in UI
    required: <bool>     # default: true
    default: <value>     # optional — used when field is not provided
    ui_widget: <widget>  # optional — see UI Widgets below

# ── Config Fields (optional configuration, shown as settings panel) ─────────
config:
  - name: <string>
    type: <type>
    description: <string>
    default: <value>
    required: false      # config fields are typically optional

# ── Output ──────────────────────────────────────────────────────────────────
output:
  type: <artifact_type>  # required — see Artifact Types below
  description: <string>  # optional — shown in UI and API docs

# ── Artifact ────────────────────────────────────────────────────────────────
artifact_type: <type>    # required — must match output.type
                         # json | csv | xlsx | pdf | pptx | svg | png | sql | markdown | diagram | text

# Which artifact types this tool accepts as input (enables composition)
accepts_artifacts: [<type>]   # optional — empty means no artifact input

# ── Execution ───────────────────────────────────────────────────────────────
execution:
  mode: sync             # sync (default) | async | auto
                         # auto: runtime decides based on input size
  timeout_seconds: 30    # default: 30

# ── UI ──────────────────────────────────────────────────────────────────────
ui:
  layout: split          # split (input|output) | single | canvas | editor
  input_label: <string>  # default: "Input"
  output_label: <string> # default: "Output"
  example_input: <string># optional — shown as placeholder / example in UI
```

---

## Field Types

| Type | Python equivalent | UI widget |
|---|---|---|
| `string` | `str` | `input` / `textarea` |
| `text` | `str` | `textarea` (multi-line) |
| `number` | `float` | `number input` |
| `integer` | `int` | `number input` (step=1) |
| `boolean` | `bool` | `checkbox` |
| `enum` | `Literal[...]` | `select` |
| `file` | `UploadedFile` | `file upload dropzone` |
| `json` | `dict \| list` | Monaco editor (JSON mode) |
| `code` | `str` | Monaco editor (with `language` hint) |
| `markdown` | `str` | Monaco editor (Markdown mode) |
| `sql` | `str` | Monaco editor (SQL mode) |

---

## UI Widgets

| Widget | When to use |
|---|---|
| `file_or_textarea` | Input can be either a file upload or pasted text |
| `file_upload` | File upload only |
| `monaco_json` | JSON editor with syntax highlighting and validation |
| `monaco_sql` | SQL editor |
| `monaco_markdown` | Markdown editor |
| `monaco_code` | Generic code editor (specify `language:` alongside) |
| `select` | For `enum` fields |
| `toggle` | For `boolean` fields |
| `color_picker` | For color value inputs |

---

## Full Annotated Example

```yaml
# tool-definitions/data/csv-to-json.yaml

name: csv-to-json
version: "1.0.0"
category: data
description: Convert a CSV file or pasted CSV text to a JSON array of objects
tags: [csv, json, conversion, data, transform]

input:
  - name: data
    type: text
    description: CSV content — paste or upload a .csv file
    required: true
    ui_widget: file_or_textarea

  - name: delimiter
    type: string
    description: Column delimiter character
    required: false
    default: ","

  - name: has_header
    type: boolean
    description: Whether the first row is a header row
    required: false
    default: true

config:
  - name: encoding
    type: string
    description: File encoding
    default: "utf-8"
  
  - name: null_values
    type: string
    description: Comma-separated list of strings to treat as null (e.g. "NA,N/A,null")
    default: ""

output:
  type: json
  description: JSON array of objects, one per CSV row

artifact_type: json
accepts_artifacts: [csv, text]

execution:
  mode: sync
  timeout_seconds: 60

ui:
  layout: split
  input_label: "CSV Input"
  output_label: "JSON Output"
  example_input: |
    name,age,city
    Alice,30,New York
    Bob,25,San Francisco
```
