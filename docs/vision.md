# Vision — Guppy Kit

## The Problem

Tools exist everywhere. What doesn't exist is a **unified, composable workbench** where those tools work together, produce structured artifacts, and expose a consistent interface to humans and machines alike.

Today a typical data/ops/engineering workflow looks like this:

1. Export CSV from system A
2. Open Excel — manipulate it manually
3. Paste into a web converter — download JSON
4. Upload JSON to another tool — download chart image
5. Open PowerPoint — manually insert chart
6. Export PDF — email it

Every step is a context switch. Every file is a dead-end artifact. There is no composition. There is no history. There is no API.

---

## The Product

> **A Professional Digital Workbench** — a platform where any person can accomplish real, meaningful work (convert data, design a database, build a presentation, visualize a dataset, generate SQL) without knowing anything about AI, without downloading five separate tools, and without manually moving files between them.

Guppy Kit is that workbench.

### It feels like a product, not a dashboard

The landing experience asks: *"What are you working on?"*

Tools are organized into families. Every tool has a consistent, clean workspace. Every output is a structured artifact. Artifacts flow into other tools. Everything is saved to a Project.

### It works without AI

Phase 1 is deliberately AI-free. The quality of the tool, the cleanliness of the artifact system, and the reliability of the composition layer are the product. No AI is required to make this useful.

### It prepares for AI without being driven by it

Every tool execution emits a structured event. Every tool has a typed REST API and an MCP interface. When Phase 2 (the Intelligence Layer) arrives, it finds a fully capable, documented, tested toolbox — not a collection of string-interpolated prompts.

---

## The Locked Boundary

> **Phase 1 = Capability Layer — knows *how* to do things.**
>
> **Phase 2 = Intelligence Layer — knows *what* to do, *why*, and *in what order*.**

This boundary is enforced structurally, not just conceptually:

- Phase 2 work is blocked in CI until the Capability Readiness Gate is passed
- The Readiness Gate requires: all tool families complete, all tools DoD-verified, API + MCP live, composition tested, test coverage ≥ 80%
- No AI/LLM code is permitted in the Phase 1 codebase

---

## The 8 Tool Families

Rather than a collection of random utilities, tools are organized into capability families. Each family is a coherent domain with related tools that share UI patterns, data types, and artifact formats.

| Family | Domain | Key capabilities |
|---|---|---|
| **Data** | Tabular data | Convert, profile, clean, transform, diff, generate |
| **Documents** | Files and text | Convert, merge, split, compare, extract, summarize format |
| **Developer** | Code + dev utils | Format, decode, test, generate, encode, validate |
| **Database** | Databases and SQL | Design schemas, generate SQL, visualize relationships, convert between engines |
| **Visualization** | Charts and diagrams | Bar/line/scatter/pie, flowcharts, ER, sequence, Gantt, architecture, mind maps |
| **Presentation** | Slide decks | Create, edit, template, export PPTX/PDF/Markdown |
| **Workflow** | Data pipelines | Visual deterministic pipeline builder — chain tools, branch, schedule |
| **Utilities** | General purpose | Hash, color, QR, encode/decode, diff, timestamp, text tools |

---

## The Artifact System

The artifact system is the killer feature of Phase 1 — and the interface the Phase 2 intelligence layer will use.

Every tool produces a **typed artifact**:

```
JSON | CSV | XLSX | PDF | PPTX | SVG | PNG | SQL | Markdown | Diagram | Text
```

Artifacts can be passed directly to any compatible tool — no download, no upload, no manual file management:

```
Excel Upload
     ↓ artifact: production.xlsx
Data Profiler
     ↓ artifact: profile.json
Data Cleaner
     ↓ artifact: clean.csv
Chart Builder
     ↓ artifact: oee_chart.svg
Presentation Builder
     ↓ artifact: weekly_report.pptx
```

This is the composition model. It works without AI today. Tomorrow the AI planner assembles these chains automatically.

---

## The Three-Interface Model

Every tool exposes exactly three interfaces from one implementation:

| Interface | Surface | Consumer |
|---|---|---|
| **UI** | Next.js tool workspace | Human users |
| **REST** | `POST /api/v1/tools/{name}/execute` | External developers, integrations |
| **MCP** | MCP tool named `{name}` | Any MCP-compatible AI client (Phase 2 and beyond) |

This is not three separate implementations. It is one `BaseTool` executor with three adapters auto-generated from the schema.

---

## Target Users

| User | Problem today | Guppy Kit value |
|---|---|---|
| Data analyst | Juggling 5 converters, Excel, manual copy-paste | One workbench, tools chain automatically via artifacts |
| Database developer | ER diagram in one tool, SQL generator in another, docs in Word | One workspace: design → generate SQL → auto-docs |
| Operations person | Build presentation from spreadsheet data manually | Spreadsheet → profiler → chart → presentation, all linked |
| Developer | JSON in browser console, JWT in JWT.io, regex in regexr.com | One workbench, history saved, shareable links |
| Engineering team | Architecture diagrams in Miro, docs in Confluence, SQL in DBeaver | One place, all chained, API-accessible for CI/CD |
| Future AI (Phase 2) | Needs a clean API to assemble capability chains | Finds MCP server with 80+ typed tools and full artifact composition |

---

## Why Open Source?

- **Trust:** Tools that process real business data (financial spreadsheets, database schemas, internal documents) are trusted more when the code is open
- **Extensibility:** Any team can add tools for their domain without waiting for a vendor roadmap
- **Phase 2 ecosystem:** When AI orchestration lands, having an open MCP server means any AI client can use the toolbox
- **Community catalog:** The tool registry becomes a community asset — contributed tools from practitioners who understand their domain

---

## Business Model (Directional)

- **Open Core:** The toolbox is fully open (MIT)
- **Hosted service:** SaaS for teams who want hosted storage, sharing, and collaboration without self-hosting
- **Enterprise:** SSO, audit log, private deployment, SLA

---

## Phase 2 Preview (Not Starting Yet)

When Phase 1 is certified complete:

```
              AI SYSTEM (Phase 2)
                     │
                 Planner
                     │
         ┌───────────┴───────────┐
         ▼                       ▼
   Orchestration            Choreography
   (central plan)           (event-driven)
         │                       │
         └───────────┬───────────┘
                     ▼
              TOOLBOX API (Phase 1)
                     │
       ┌─────────────┼─────────────┐
       ▼             ▼             ▼
   Data Tools    Dev Tools   Creative Tools
```

The intelligence layer knows **what** needs to be done. The capability layer knows **how** to do it. They are coupled only by typed contracts — not by implementation.
