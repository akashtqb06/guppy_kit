# ADR 0003 — One Implementation, Three Surfaces (UI / REST / MCP)

**Status:** Accepted  
**Date:** 2026-08-30

---

## Context

Guppy Kit needs to be useful to three distinct consumers:
1. **Human users** — interactive UI in the browser
2. **External developers** — programmable API for integrations and scripts
3. **AI clients (Phase 2)** — MCP interface for the intelligence layer

The naive approach is to build each surface separately. This creates three implementations of the same logic, three validation layers, and three maintenance burdens.

## Decision

Every tool has exactly **three surfaces auto-generated from one `BaseTool` implementation**:

| Surface | How it's created | Consumer |
|---|---|---|
| **UI** | `ToolWorkspace` component in `packages/ui` — wires to REST API; `page.tsx` per tool is typically 5 lines | Human users |
| **REST** | Auto-generated FastAPI route: `POST /api/v1/tools/{name}/execute` — input/response schemas from Pydantic | External devs |
| **MCP** | Auto-registered MCP tool on server startup — schema from `mcp_tool_definition` property | AI clients |

Tool authors write `execute()` once. The platform generates all three surfaces.

## Consequences

**Easier:** One implementation to test. One schema to maintain. Adding a tool means it's immediately available on all three surfaces. Phase 2 AI gets the full toolbox for free.

**Harder:** The three surfaces must be designed to a common denominator. Tools with complex streaming UI interactions may need custom `page.tsx` implementations (still using shared components).

**Impossible:** Exposing a tool on one surface but not another — all three are always generated. If a tool should not be in the MCP catalog, it should not be a platform tool.

## Alternatives Rejected

**Separate implementations per surface:** 3× the code, 3× the validation, divergent schemas. Rejected.

**REST only, no MCP:** Loses the Phase 2 readiness benefit. Phase 2 agents work natively with MCP; wrapping REST in MCP later is extra work. Rejected.
