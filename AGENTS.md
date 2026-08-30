# AGENTS.md — Guppy Kit Coding Agent Guide

This file is the entry point for all coding agents working on Guppy Kit.
Read it fully before writing a single line of code.

---

## What This Project Is

Guppy Kit is a **Professional Digital Workbench** — an open-source platform of composable tools for data, documents, databases, visualizations, presentations, and developer utilities.

**Phase 1 (active):** The Capability Layer — every tool works perfectly, is tested, has a UI, a REST API, and an MCP interface, and composes cleanly with other tools via the Artifact system.

**Phase 2 (locked until Phase 1 is certified complete):** The Intelligence Layer — an AI planner that orchestrates Phase 1 tools to accomplish complex goals. Phase 2 does not begin until the Capability Layer readiness gate is passed.

> [!CAUTION]
> **Do not build AI/LLM features, agent runtimes, or intelligence orchestration during Phase 1.** If you think a feature requires intelligence logic, stop and escalate.

---

## Monorepo Structure

```
guppy-kit/
├── apps/
│   ├── web/              ← Next.js 14 frontend (primary UI)
│   └── docs/             ← Documentation site (optional, Phase 6+)
├── packages/
│   ├── ui/               ← Shared component library (shadcn/ui + Tailwind v4)
│   ├── types/            ← Shared TypeScript types (generated + hand-written)
│   ├── tool-sdk/         ← Tool contract types and base classes (TypeScript)
│   └── config/           ← Shared ESLint, Prettier, TypeScript, Tailwind config
├── backend/
│   ├── guppy/            ← FastAPI application (modular monolith)
│   │   ├── core/         ← Shared utilities, config, DB, Redis, storage
│   │   ├── tools/        ← Tool Registry and Tool Runtime
│   │   ├── artifacts/    ← Artifact Service
│   │   ├── workflows/    ← Deterministic workflow engine
│   │   ├── projects/     ← Project Service
│   │   ├── api/          ← REST API routers
│   │   ├── mcp/          ← MCP Server
│   │   └── events/       ← Event emission
│   └── tests/
├── tool-definitions/     ← YAML definitions for every registered tool
│   ├── data/
│   ├── documents/
│   ├── developer/
│   ├── database/
│   ├── visualization/
│   ├── presentation/
│   ├── workflow/
│   └── utilities/
├── .devcontainer/
├── .github/
├── docs/
└── turbo.json
```

---

## The Tool Contract

**This is the most important architectural concept.** Every tool must conform to it.

```python
# Every tool is a class that extends BaseTool
class MyTool(BaseTool):
    # 1. Identity
    name: str               # kebab-case, unique
    version: str            # semver
    category: ToolCategory  # DATA | DOCUMENTS | DEVELOPER | DATABASE | VISUALIZATION | PRESENTATION | WORKFLOW | UTILITIES
    description: str
    tags: list[str]

    # 2. Schemas
    input_schema: type[BaseModel]    # Pydantic model
    output_schema: type[BaseModel]   # Pydantic model
    config_schema: type[BaseModel]   # Pydantic model (optional params)

    # 3. Implementation
    async def execute(self, input: InputModel, config: ConfigModel) -> OutputModel: ...

    # 4. Surfaces (auto-generated from the above — do not override)
    # → REST: POST /api/v1/tools/{name}/execute
    # → MCP: tool named {name} with input_schema as arguments
    # → UI: auto-wired to the tool workspace component
```

See [`docs/architecture/tool-sdk.md`](docs/architecture/tool-sdk.md) for the full specification.

---

## Task Loop

For every task assigned to you:

1. **Read** — understand the requirement fully before writing code
2. **Locate** — find the relevant files (`backend/guppy/`, `packages/`, `apps/web/`)
3. **Plan** — for non-trivial changes, write a brief plan as a comment or in a scratch file
4. **Implement** — follow the coding standards below
5. **Test** — write tests alongside the implementation (not after)
6. **Verify** — run lint, type-check, and tests before declaring done

---

## Coding Standards

### Python (backend)
- Formatter: `ruff format` — run before every commit
- Linter: `ruff check` — all errors must be resolved
- Type checking: `mypy backend/guppy` — strict mode
- Tests: `pytest backend/tests/ -v --asyncio-mode=auto`
- All new tools must extend `BaseTool` and be registered in `tool-definitions/`
- All endpoints must emit an OTel span and a platform event on completion

### TypeScript (packages, apps)
- Formatter: `prettier`
- Linter: `eslint`
- Type checking: `tsc --noEmit`
- Tests: `vitest` (packages) / `jest` (apps/web)
- All UI components must use `packages/ui` — no one-off component implementations
- Design system: shadcn/ui on Tailwind v4 — configured in `packages/config/tailwind.config.ts`
- No raw `className` strings with ad-hoc values — use design tokens from the shared config

### No domain-specific logic in core
The `backend/guppy/core/` and `packages/ui/` modules contain **platform infrastructure only**.
Tool-specific logic belongs in `backend/guppy/tools/<tool-name>/` and `tool-definitions/<category>/`.

---

## Definition of Done

A tool is done when:

- [ ] `BaseTool` implementation is complete and type-checked
- [ ] YAML definition in `tool-definitions/<category>/<name>.yaml` is valid
- [ ] REST endpoint works: `POST /api/v1/tools/<name>/execute`
- [ ] MCP tool is registered and callable
- [ ] UI tool workspace renders input, executes, and displays output
- [ ] Artifact is persisted on successful execution
- [ ] Platform event `tool.execution.completed` is emitted
- [ ] Unit tests cover executor (≥ 80% branch coverage)
- [ ] Integration test covers the full UI → API → executor → artifact → event chain
- [ ] No lint or type errors

A **milestone** is done when:
- All tools in the milestone are DoD-complete
- End-to-end integration tests pass
- Milestone exit gate checklist (in [`docs/roadmap.md`](docs/roadmap.md)) is verified

---

## Escalation Protocol

Stop and ask a human if:

- A task requires modifying `backend/guppy/core/` in a non-additive way
- A task would add intelligence/AI logic of any kind
- A task requires changing the Tool Contract (the `BaseTool` interface)
- A task's scope is unclear after reading this file and the relevant architecture docs
- CI is failing and the cause is not clear within 2 investigation cycles

---

## Key Docs

| Document | Read when |
|---|---|
| [`docs/architecture/tool-sdk.md`](docs/architecture/tool-sdk.md) | Before implementing any tool |
| [`docs/architecture/execution-model.md`](docs/architecture/execution-model.md) | Before writing executor logic |
| [`docs/architecture/artifact-system.md`](docs/architecture/artifact-system.md) | Before writing artifact-producing code |
| [`docs/architecture/interfaces.md`](docs/architecture/interfaces.md) | Before adding a new API endpoint or MCP tool |
| [`docs/reference/tool-contract.md`](docs/reference/tool-contract.md) | Full YAML tool definition spec |
| [`docs/guides/building-a-tool.md`](docs/guides/building-a-tool.md) | Step-by-step: add a new tool end-to-end |
