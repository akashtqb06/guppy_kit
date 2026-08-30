# Roadmap — Guppy Kit

Phase 1 builds the Capability Layer completely. Phase 2 (Intelligence Layer) does not begin until the Capability Layer Readiness Gate is passed.

**Current status:** Pre-Milestone 1 — documentation complete, coding begins now.

---

## Capability Readiness Gate

> [!CAUTION]
> **This gate must pass before any Phase 2 work begins.** No exceptions.

The gate passes when all of the following are true:

- [ ] All 8 tool families have at least 3 shipped tools each
- [ ] Every shipped tool passes its Definition of Done checklist
- [ ] REST API documented and passing API contract tests
- [ ] MCP server live with all tools discoverable and callable
- [ ] Tool composition (artifact → tool → artifact) tested end-to-end for at least 3 full chains
- [ ] Backend test coverage ≥ 80% (measured, not estimated)
- [ ] Frontend E2E tests cover all tool workspace interactions
- [ ] Load test: tool runtime handles 50 concurrent executions without failure
- [ ] All platform events are emitted and verifiable

---

## Milestone 1 — Tool Platform Foundation

**Goal:** The infrastructure that every tool depends on. No UI yet. No individual tools yet. Just the platform.

**Deliverables:**
- `BaseTool` base class with input/output/config schema validation
- Tool Registry — discovers and loads tools from `tool-definitions/`
- Tool Runtime — validates input → executes → emits event → persists artifact
- Artifact Service — typed artifact storage on S3-compatible object storage
- Event bus — `tool.execution.started/completed/failed`, `artifact.created`
- Project Service — groups files, executions, and artifacts
- PostgreSQL schema: `tools`, `executions`, `artifacts`, `projects`, `events`
- REST API skeleton: `/api/v1/tools/*`, `/api/v1/artifacts/*`, `/api/v1/projects/*`
- MCP Server skeleton: tool discovery endpoint live

**Exit gate:**
- [ ] `BaseTool` contract is final and documented
- [ ] A test tool (`echo` — returns its input) passes through the full stack: API → executor → artifact → event
- [ ] MCP `list_tools` returns the test tool
- [ ] Artifact is retrievable via API after execution

---

## Milestone 2 — Toolbox UI

**Goal:** The shell of the product — without individual tool implementations. The UI that all tools will live inside.

**Deliverables:**
- `packages/ui` — design system with shadcn/ui + Tailwind v4
  - Design tokens (colors, spacing, typography, radius, shadows)
  - Core components: Button, Input, Textarea, Select, Badge, Card, Tabs, Separator, Tooltip, Dialog, Sheet, Dropdown
  - Tool workspace layout component (input panel | output panel | toolbar)
  - Tool category navigation sidebar
  - Artifact viewer component (handles all artifact types)
  - File upload component
- `apps/web` — main Next.js application
  - Landing page: search bar, popular tools grid, category browse
  - Tool family pages (`/tools/data`, `/tools/developer`, etc.)
  - Tool workspace page (generic — parameterized by tool name)
  - Project workspace (`/projects/{id}`)
  - History page
  - Execution status and artifact panel

**Exit gate:**
- [ ] Landing page renders with search and category grid
- [ ] Tool workspace page renders with input/output panels (even without a real tool backend)
- [ ] Project workspace lists files, executions, and artifacts
- [ ] All design tokens are in `packages/config` and used consistently — no ad-hoc values
- [ ] Lighthouse accessibility score ≥ 90

---

## Milestone 3 — Core Tools (Priority Set)

**Goal:** The most-used tools across all 8 families — enough to make the product immediately useful to a real user.

**Priority tools per family:**

| Family | Priority tools |
|---|---|
| Data | CSV → JSON, JSON → CSV, Excel → JSON, JSON formatter, JSON diff, CSV profiler |
| Documents | PDF → text, Markdown → PDF, PDF merger, DOCX → PDF, document compare |
| Developer | JSON formatter, JWT decoder, Base64 encode/decode, UUID generator, Cron builder, Regex tester |
| Database | SQL formatter, SQL validator, ER diagram from SQL, Schema designer |
| Visualization | Bar chart, Line chart, Pie chart, Flowchart (Mermaid), Architecture diagram |
| Presentation | Presentation builder — create slides, insert chart, export PPTX + PDF |
| Workflow | Linear pipeline builder: upload → transform → output |
| Utilities | Hash generator, URL encoder/decoder, Timestamp converter, Color picker |

**Exit gate:**
- [ ] All priority tools are DoD-complete (see AGENTS.md)
- [ ] Each tool has a working UI workspace, REST endpoint, and MCP tool entry
- [ ] Each tool produces a typed artifact

---

## Milestone 4 — Tool Composition

**Goal:** Artifacts flow between tools automatically. The project workspace becomes a living workbench.

**Deliverables:**
- Artifact compatibility matrix: which artifact types each tool accepts as input
- "Use as input" button on every artifact in a project
- Visual pipeline builder (React Flow): drag tools, connect artifact → tool edges
- Pipeline execution engine: runs steps in order, handles errors, produces per-step artifacts
- Pipeline save, reuse, and share

**Exit gate:**
- [ ] End-to-end pipeline: Excel → Data Profiler → Chart Builder → Presentation Builder — all in one project, artifacts auto-flowing
- [ ] Pipeline can be saved and re-executed
- [ ] Visual builder renders and executes any pipeline defined in Milestone 3 tools

---

## Milestone 5 — API + MCP

**Goal:** The platform becomes a programmable capability layer — accessible by external developers and AI clients.

**Deliverables:**
- REST API fully documented (OpenAPI spec, Swagger UI, ReDoc)
- API key authentication for external access
- Rate limiting per API key
- Webhooks: `POST` to a configured URL on `tool.execution.completed`, `artifact.created`
- MCP server fully live: all Milestone 3 tools discoverable and callable
- MCP auth: API key header
- Developer docs: [`docs/guides/api-and-mcp.md`](../guides/api-and-mcp.md)
- Usage tracking per API key (call count, artifact size, execution time)

**Exit gate:**
- [ ] External `curl` call to `POST /api/v1/tools/json-formatter/execute` works with API key auth
- [ ] MCP client can discover and call all tools
- [ ] Webhook fires on execution completion
- [ ] API spec passes contract tests

---

## Milestone 6 — Platform Maturity

**Goal:** The platform is production-grade, shareable, and monitorable.

**Deliverables:**
- Versioning: tool definitions are versioned; execution records reference the exact version used
- Sharing: shareable links for executions, artifacts, and projects (view-only or editable)
- Templates: pre-built pipelines for common tasks (e.g. "Excel → Dashboard", "SQL → ERD + Docs")
- Permissions: private / team / public per project
- Execution history: searchable log of all executions per user and per project
- Monitoring: execution latency, artifact sizes, error rates, per-tool usage stats
- Admin dashboard: platform health, usage, tool registry status

**Exit gate:**
- [ ] Capability Readiness Gate (see top of this document) passes in full
- [ ] All items in the gate checklist verified and documented
- [ ] At least one real external user (not a core contributor) has used the platform productively

---

## Milestone 7 — Intelligence Layer (Phase 2)

**Unlocked only after Milestone 6 exit gate passes.**

**Goal:** An AI planner that uses the Toolbox as its capability layer — never building its own tools.

**Deliverables:**
- Planner Agent: takes a natural language goal, decomposes into tool steps
- Orchestration mode: central planner executes tool chain sequentially
- Choreography mode: event-driven — each tool completion triggers the next step
- AI chooses tools from the MCP registry — no hard-coded tool knowledge
- Human approval gate for any pipeline before execution (configurable)
- Memory: conversation and execution history context for iterative tasks
- Evaluation: accuracy, cost, latency per planner run

**The key constraint:** The Intelligence Layer is a **consumer** of the Capability Layer, not an extension of it. It does not add new tools. It does not modify tool implementations. It only plans and orchestrates.
