# Tool Catalog

All tools organized by family. Click a family to see the full list.

| Family | Description | Tool count |
|---|---|---|
| [Data](data.md) | Tabular data — convert, profile, clean, transform, diff | 17 |
| [Documents](documents.md) | Files and text — convert, merge, split, compare, extract | 13 |
| [Developer](developer.md) | Dev utilities — format, decode, test, generate, encode | 17 |
| [Database](database.md) | Databases and SQL — design, generate, visualize, convert | 14 |
| [Visualization](visualization.md) | Charts and diagrams — bar/line/scatter, flowcharts, ER, Gantt | 20 |
| [Presentation](presentation.md) | Slide decks — create, edit, export PPTX/PDF/Markdown | 9 |
| [Workflow](workflow.md) | Deterministic pipeline builder | — |
| [Utilities](utilities.md) | General purpose — hash, color, QR, encode/decode, text | 15 |

---

## Adding a Tool

See [`docs/guides/building-a-tool.md`](../guides/building-a-tool.md) for the step-by-step guide.

All tool YAML definitions live in `tool-definitions/<family>/`. All tool Python executors live in `backend/guppy/tools/<family>/`.
