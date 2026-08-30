<div align="center">

# Guppy Kit

**A Professional Digital Workbench — Open Source**

*Convert data. Design databases. Build presentations. Visualize anything. All from one platform, without an AI in sight.*

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Phase](https://img.shields.io/badge/Phase-1%20Capability%20Layer-blue)](docs/roadmap.md)
[![Docs](https://img.shields.io/badge/Docs-docs%2FREADME.md-green)](docs/README.md)

</div>

---

## What is Guppy Kit?

Guppy Kit is a composable toolbox of professional utilities — for data work, document handling, database design, code tools, visualizations, and presentations — all accessible through a polished UI, a full REST API, and an MCP server.

You don't need to know what AI is to use it. Every tool works standalone.

**But the architecture is deliberate:** every capability is a clean contract — typed input, typed output, a UI surface, a REST endpoint, and an MCP tool — so when Phase 2 (the Intelligence Layer) arrives, an AI planner can orchestrate the entire toolbox without any rewiring.

---

## 8 Tool Families

| Family | Examples |
|---|---|
| **Data** | CSV ↔ JSON, Excel analyzer, data profiler, column mapper, diff, data generator |
| **Documents** | PDF merger/splitter, Markdown ↔ PDF/DOCX, HTML → PDF, document compare, extractor |
| **Developer** | JSON formatter, JWT decoder, Regex tester, Cron builder, Base64, UUID, HTTP builder |
| **Database** | ER diagram, Schema designer, SQL formatter/generator/diff, DB converter |
| **Visualization** | Bar/line/scatter/pie charts, flowcharts, sequence diagrams, Gantt, mind maps, architecture diagrams |
| **Presentation** | Full presentation workbench — create, edit, templates, export PPTX/PDF/Markdown |
| **Workflow** | Visual deterministic pipeline builder — chain tools, branch on conditions, schedule |
| **Utilities** | Hash, color picker, QR, encode/decode, timestamp, diff viewer, text tools |

See the full catalog → [`docs/tools/`](docs/tools/)

---

## Quick Start

Requires Docker Desktop + VS Code with the Dev Containers extension.

```bash
git clone https://github.com/guppy-kit/guppy-kit.git
cd guppy-kit
# Open in VS Code → "Reopen in Container"
# Full stack starts automatically.
```

Visit `http://localhost:3000`.

Full setup guide → [`docs/guides/quickstart.md`](docs/guides/quickstart.md)

---

## Architecture at a Glance

```
┌──────────────────────────────────────────────────────────┐
│                    USER EXPERIENCE                       │
│  Next.js · shadcn/ui · Tailwind v4 · React Flow · Monaco│
└───────────────────────┬──────────────────────────────────┘
                        │
┌───────────────────────▼──────────────────────────────────┐
│                    TOOLBOX PLATFORM                      │
│                                                          │
│   Tool Registry · Tool Runtime · Artifact Service        │
│   Workflow Runtime · Project Service · Event Bus         │
└──────────────┬────────────────────────┬──────────────────┘
               │                        │
          REST API                 MCP Server
               │                        │
               └────────────┬───────────┘
                            │
                    (Phase 2 — locked)
                    Future AI System
```

**The critical boundary:** Phase 2 (Intelligence Layer) does not begin until Phase 1 (Capability Layer) is fully tested and certified complete.

---

## Three Interfaces, One Implementation

Every tool is automatically available through:

```
              Tool (Python BaseTool)
                       │
       ┌───────────────┼───────────────┐
       ▼               ▼               ▼
  Next.js UI       REST API        MCP Server
  /tools/json    POST /api/v1     json_formatter
  -formatter    /tools/json      (callable by any
               -formatter/execute MCP-compatible client)
```

---

## Tool Composition

Tools chain through artifacts — no data download/upload needed:

```
Excel Upload
     ↓ artifact: xlsx
Data Profiler
     ↓ artifact: profile.json
Data Cleaner
     ↓ artifact: clean.csv
OEE Calculator
     ↓ artifact: metrics.json
Chart Builder
     ↓ artifact: chart.svg
Presentation Builder
     ↓ artifact: report.pptx
```

All inside one Project.

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, TypeScript, Tailwind v4, shadcn/ui, React Flow, Monaco, TanStack Query, Zustand |
| Backend | Python 3.12, FastAPI, Pydantic v2, SQLAlchemy, Alembic |
| Processing | Pandas, Polars, DuckDB, PyArrow, openpyxl |
| Documents | PyMuPDF, python-docx, python-pptx, ReportLab |
| Visualization | ECharts, React Flow, Mermaid, Cytoscape.js |
| MCP | Official MCP SDK (Python) |
| Data | PostgreSQL 16, Redis 7, MinIO (S3-compatible) |
| Build | pnpm, Turborepo, Docker, Dev Containers |

---

## Documentation

| | |
|---|---|
| 📖 [Docs](docs/README.md) | Everything, indexed |
| 🚀 [Quickstart](docs/guides/quickstart.md) | Running in < 5 minutes |
| 🏗 [Architecture](docs/architecture/README.md) | Tool SDK, execution model, artifact system |
| 🛠 [Building a Tool](docs/guides/building-a-tool.md) | Add a new tool end-to-end |
| 📦 [Tool Catalog](docs/tools/README.md) | All 8 families |
| 🗺 [Roadmap](docs/roadmap.md) | 7 milestones with exit gates |
| 🤖 [AGENTS.md](AGENTS.md) | For coding agents |

---

## Contributing

Humans: read [`.github/CONTRIBUTING.md`](.github/CONTRIBUTING.md)

Coding agents: read [`AGENTS.md`](AGENTS.md) first.

---

## License

MIT — see [`LICENSE`](LICENSE).
