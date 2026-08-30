# Presentation Tools

A full presentation workbench — not just a "generate PPT" button. Create, edit, and export professional presentations with precise control over slides, content, and layout.

---

## Creation and Editing

| Tool | Description | Input → Output |
|---|---|---|
| `presentation-builder` | Create a complete presentation from a JSON slide spec | JSON → PPTX |
| `slide-from-template` | Generate a single slide from a named template and data | Template + JSON → PPTX |
| `markdown-to-presentation` | Convert a Markdown document (with headings as slides) to a presentation | Markdown → PPTX |

## Slide Components

Individual component tools — insert elements into an existing presentation.

| Tool | Description | Input → Output |
|---|---|---|
| `chart-in-slide` | Embed an SVG chart into a specific slide of a PPTX | SVG + PPTX → PPTX |
| `table-in-slide` | Render CSV or JSON data as a formatted table slide | CSV/JSON + PPTX → PPTX |
| `image-in-slide` | Embed a PNG into a specific slide | PNG + PPTX → PPTX |
| `diagram-in-slide` | Embed an SVG diagram into a slide | SVG + PPTX → PPTX |

## Export

| Tool | Description | Input → Output |
|---|---|---|
| `presentation-to-pdf` | Convert a PPTX to PDF | PPTX → PDF |
| `presentation-to-images` | Export each slide as a PNG image (zipped) | PPTX → ZIP (PNG × N) |
| `presentation-to-markdown` | Extract slide text as Markdown | PPTX → Markdown |

---

## Slide Spec Format

The `presentation-builder` accepts a JSON slide spec:

```json
{
  "title": "OEE Weekly Report",
  "theme": "professional-dark",
  "slides": [
    {
      "type": "title",
      "title": "OEE Analysis — Week 34",
      "subtitle": "Line 4 · Manufacturing Plant Alpha"
    },
    {
      "type": "kpi",
      "title": "Key Metrics",
      "kpis": [
        { "label": "OEE", "value": "73%", "trend": "down", "delta": "-2pp" },
        { "label": "Availability", "value": "89%", "trend": "up" }
      ]
    },
    {
      "type": "chart",
      "title": "OEE Trend",
      "artifact_id": "svg-artifact-id-from-chart-builder"
    },
    {
      "type": "text",
      "title": "Root Cause",
      "content": "Vibration anomaly on M-12 identified as primary cause..."
    }
  ]
}
```

### Available slide types

| Type | Description |
|---|---|
| `title` | Title + subtitle |
| `text` | Title + body text |
| `kpi` | Grid of KPI metrics with trend indicators |
| `chart` | Embedded chart (SVG artifact) |
| `table` | Formatted data table (CSV/JSON artifact) |
| `timeline` | Horizontal timeline of events |
| `process` | Process flow diagram |
| `comparison` | Side-by-side comparison layout |
| `quote` | Large pull quote with attribution |
| `image` | Full or partial slide image |
| `blank` | Empty slide for custom content |
