# Visualization Tools

Charts, graphs, and diagrams — all rendered as SVG (scalable, embeddable, exportable to PNG).

---

## Data Charts

Data-driven charts built from JSON or CSV input using ECharts.

| Tool | Description | Input → Output |
|---|---|---|
| `bar-chart` | Vertical or horizontal bar chart | JSON / CSV → SVG |
| `line-chart` | Single or multi-series line chart | JSON / CSV → SVG |
| `area-chart` | Stacked or filled area chart | JSON / CSV → SVG |
| `scatter-chart` | Scatter plot with optional color and size dimensions | JSON / CSV → SVG |
| `pie-chart` | Pie or donut chart | JSON / CSV → SVG |
| `heatmap` | Grid heatmap (e.g. calendar, correlation matrix) | JSON / CSV → SVG |
| `treemap` | Hierarchical treemap from nested JSON | JSON → SVG |
| `funnel-chart` | Funnel or conversion chart | JSON → SVG |
| `radar-chart` | Radar / spider chart | JSON → SVG |
| `svg-to-png` | Convert any SVG to a PNG at specified resolution | SVG → PNG |

---

## Diagrams

Structural and architectural diagrams — text-driven (Mermaid) or visual (React Flow canvas).

| Tool | Description | Input → Output |
|---|---|---|
| `flowchart` | Flowchart from Mermaid syntax | Text (Mermaid) → SVG |
| `sequence-diagram` | Sequence diagram from Mermaid syntax | Text (Mermaid) → SVG |
| `architecture-diagram` | Architecture diagram from Mermaid syntax | Text (Mermaid) → SVG |
| `class-diagram` | UML class diagram from Mermaid syntax | Text (Mermaid) → SVG |
| `state-machine` | State machine diagram from Mermaid syntax | Text (Mermaid) → SVG |
| `gantt-chart` | Gantt chart from JSON task/milestone spec | JSON → SVG |
| `mind-map` | Mind map from JSON tree or indented text | JSON / Text → SVG |
| `network-diagram` | Network topology from JSON node/edge spec | JSON → SVG |
| `org-chart` | Organizational chart from JSON hierarchy | JSON → SVG |
| `dependency-graph` | Dependency graph from JSON edges | JSON → SVG |
