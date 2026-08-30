# ADR 0002 — Tool SDK Contract as the Core Platform Primitive

**Status:** Accepted  
**Date:** 2026-08-30

---

## Context

Without a common contract, every tool becomes a bespoke implementation: its own API route, its own validation logic, its own response format, its own error handling. Adding a new tool means touching the framework code in multiple places. The platform becomes hard to extend and hard to test.

## Decision

Every tool must conform to the **Tool SDK contract** — a `BaseTool` base class with:
- `name`, `version`, `category`, `description`, `tags` (identity)
- `input_schema` (Pydantic model — validated automatically)
- `config_schema` (Pydantic model — optional)
- `output_schema` (Pydantic model — validated automatically)
- `output_artifact_type` (from the `ArtifactType` enum)
- `execute()` (async, pure function — the only method a tool implementer writes)

Everything else — validation, artifact persistence, event emission, REST routing, MCP registration — is handled by the platform.

**A parallel YAML definition** in `tool-definitions/<category>/<name>.yaml` is the source of truth for the tool registry and is used for documentation, UI hints, and API schema generation.

## Consequences

**Easier:** Adding a new tool = implementing `execute()` + writing the YAML. No framework changes. Tools are inherently testable (pure async functions). The MCP and REST surfaces are free.

**Harder:** Tool authors must fit their implementation into the contract. Edge cases (streaming output, multi-artifact output) require extending the contract via an RFC.

**Impossible:** A tool that does not conform to the contract — no bypass exists.

## Alternatives Rejected

**No contract (freestyle routes):** Every tool becomes a bespoke FastAPI handler. No shared validation, no automatic MCP, no composition. Rejected.

**OpenAPI-first generation:** Generate Python from OpenAPI specs. Adds tooling complexity without solving the composition and MCP problems. Rejected.
