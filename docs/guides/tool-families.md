# Guide — Tool Families

Guppy Kit organizes tools into 8 families. Each family is a coherent domain — shared data types, related workflows, and consistent UI patterns.

---

## 1. Data

**For working with tabular and structured data.**

| Tool | Input | Output |
|---|---|---|
| CSV → JSON | CSV | JSON |
| JSON → CSV | JSON | CSV |
| Excel → JSON | XLSX | JSON |
| JSON → Excel | JSON | XLSX |
| CSV → Excel | CSV | XLSX |
| XML → JSON | Text (XML) | JSON |
| YAML → JSON | Text (YAML) | JSON |
| JSON → YAML | JSON | Text (YAML) |
| JSON Formatter | JSON | JSON |
| JSON Diff | JSON × 2 | JSON (diff report) |
| CSV Profiler | CSV | JSON (profile stats) |
| Data Cleaner | CSV / JSON | CSV |
| Column Mapper | CSV / JSON | CSV / JSON |
| Data Transformer | CSV / JSON + transform spec | CSV / JSON |
| Data Generator | Schema spec | CSV / JSON |
| Parquet → CSV | Parquet | CSV |
| CSV → Parquet | CSV | Parquet |

---

## 2. Documents

**For converting, merging, splitting, comparing, and extracting from document files.**

| Tool | Input | Output |
|---|---|---|
| PDF → Text | PDF | Text |
| PDF → Markdown | PDF | Markdown |
| Markdown → PDF | Markdown | PDF |
| Markdown → DOCX | Markdown | DOCX |
| DOCX → Markdown | DOCX | Markdown |
| DOCX → PDF | DOCX | PDF |
| HTML → PDF | HTML | PDF |
| PDF Merger | PDF × N | PDF |
| PDF Splitter | PDF | PDF × N |
| PDF Metadata viewer | PDF | JSON |
| Document Compare | Text / Markdown × 2 | HTML (diff view) |
| Document Word Counter | Text / Markdown | JSON (stats) |
| Document Extractor | PDF / DOCX | JSON (structured) |

---

## 3. Developer

**For everyday developer tasks — formatting, decoding, generating, testing.**

| Tool | Input | Output |
|---|---|---|
| JSON Formatter | JSON | JSON |
| JWT Decoder | Text (JWT) | JSON |
| Base64 Encoder | Text | Text |
| Base64 Decoder | Text (Base64) | Text |
| URL Encoder | Text | Text |
| URL Decoder | Text | Text |
| UUID Generator | — | Text |
| Hash Generator | Text | Text (hash) |
| Regex Tester | Text + pattern | JSON (matches) |
| Cron Builder | — | Text (cron expression) |
| Timestamp Converter | Text (timestamp) | JSON |
| HTTP Request Builder | — | Text (curl / JSON) |
| API Response Formatter | JSON | JSON |
| Diff Viewer | Text × 2 | HTML (diff) |
| Code Formatter | Text (code) + language | Text |
| Markdown Preview | Markdown | HTML |
| HTML Preview | HTML | PNG |

---

## 4. Database

**For designing, documenting, and working with databases and SQL.**

| Tool | Input | Output |
|---|---|---|
| SQL Formatter | SQL | SQL |
| SQL Validator | SQL | JSON (validation report) |
| SQL Generator | Natural language description | SQL |
| SQL → ER Diagram | SQL (DDL) | SVG (ER diagram) |
| ER Diagram Builder | — | SVG + Diagram JSON |
| Schema Designer | — | SQL (DDL) |
| Table Designer | — | SQL (CREATE TABLE) |
| SQL Diff | SQL × 2 | SQL (diff) |
| Query Explainer | SQL | Markdown (explanation) |
| PostgreSQL → MySQL | SQL | SQL |
| MySQL → PostgreSQL | SQL | SQL |
| SQL → Documentation | SQL | Markdown |
| JSON → SQL Schema | JSON | SQL |
| SQL → JSON Schema | SQL | JSON |

---

## 5. Visualization

**For charts, graphs, and diagrams of all kinds.**

### Charts (data-driven)
| Tool | Input | Output |
|---|---|---|
| Bar Chart | JSON / CSV | SVG |
| Line Chart | JSON / CSV | SVG |
| Area Chart | JSON / CSV | SVG |
| Scatter Chart | JSON / CSV | SVG |
| Pie / Donut Chart | JSON / CSV | SVG |
| Heatmap | JSON / CSV | SVG |
| Treemap | JSON | SVG |
| Funnel Chart | JSON | SVG |
| Radar Chart | JSON | SVG |

### Diagrams (structural)
| Tool | Input | Output |
|---|---|---|
| Flowchart (Mermaid) | Text (Mermaid) | SVG |
| Sequence Diagram | Text (Mermaid) | SVG |
| Architecture Diagram | Text (Mermaid) | SVG |
| ER Diagram | Text (Mermaid / SQL) | SVG |
| Class Diagram | Text (Mermaid) | SVG |
| State Machine | Text (Mermaid) | SVG |
| Gantt Chart | JSON | SVG |
| Mind Map | Text / JSON | SVG |
| Network Diagram | JSON | SVG |
| Org Chart | JSON | SVG |
| Dependency Graph | JSON | SVG |
| SVG → PNG | SVG | PNG |

---

## 6. Presentation

**A full presentation workbench — not just "generate a PPT".**

| Tool | Input | Output |
|---|---|---|
| Presentation Builder | JSON (slide spec) | PPTX |
| Slide from Template | Template ID + JSON | PPTX |
| Presentation → PDF | PPTX | PDF |
| Presentation → Images | PPTX | PNG × N |
| Presentation → Markdown | PPTX | Markdown |
| Markdown → Presentation | Markdown | PPTX |
| Chart in Slide | SVG + PPTX | PPTX |
| Table in Slide | CSV / JSON + PPTX | PPTX |
| Image in Slide | PNG + PPTX | PPTX |

---

## 7. Workflow

**Deterministic, visual pipeline builder for chaining tools.**

| Capability | Description |
|---|---|
| Linear pipeline | Connect tools in a sequence; artifact output feeds next tool |
| Branching | Conditional step execution based on artifact content |
| Pipeline templates | Pre-built pipelines for common tasks |
| Pipeline save/reuse | Save a pipeline to a project; re-run with new inputs |
| Scheduled pipelines | Run a pipeline on a schedule (Milestone 6) |
| Pipeline history | Complete execution log per pipeline run |

The workflow family is the composition layer — it's not a collection of standalone tools, it's the runtime that chains all other tool families together.

---

## 8. Utilities

**General-purpose tools that don't fit a specific domain.**

| Tool | Input | Output |
|---|---|---|
| Hash Generator (MD5/SHA) | Text | Text |
| HMAC Generator | Text + secret | Text |
| Color Picker | — | JSON (color values) |
| Color Converter | Text (hex/rgb/hsl) | JSON |
| QR Code Generator | Text | PNG |
| Barcode Generator | Text | PNG |
| Encode/Decode (multiple formats) | Text | Text |
| Text Diff | Text × 2 | HTML |
| Word Counter | Text | JSON |
| Case Converter | Text | Text |
| Lorem Ipsum Generator | — | Text |
| Password Generator | — | Text |
| Random Data Generator | Spec | JSON |
