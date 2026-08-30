# ADR 0004 — Artifacts as the Tool Composition Glue

**Status:** Accepted  
**Date:** 2026-08-30

---

## Context

Without a composition mechanism, Guppy Kit is a collection of isolated utilities. Users must download output from one tool, re-upload it to the next. Phase 2 AI cannot build multi-step pipelines without a mechanism to pass results between tools.

Options evaluated:
1. **Direct tool chaining (in-memory)** — Tool A calls Tool B directly in the same execution
2. **Shared state (session object)** — a mutable session object passed between tools
3. **Artifact-based composition** — tools are stateless; output is persisted as a typed artifact; the artifact ID is passed to the next tool

## Decision

**Artifacts are the composition glue.** Every tool:
- Is stateless — `execute()` is a pure function
- Produces exactly one typed artifact on success
- Can accept one or more artifact types as input (declared in `input_accepts_artifacts`)

Composition is achieved by passing an `artifact_id` as the input to the next tool. The runtime resolves the artifact from object storage and passes its content to the executor.

This applies to:
- Manual UI composition (click "Use as input" on an artifact)
- Visual pipeline builder (connect tool nodes with artifact-type edges)
- REST API (pass `artifact_id` in the input payload)
- MCP (pass `artifact_id` in the tool arguments)
- Phase 2 AI orchestration (planner passes `artifact_id` between tool calls)

## Consequences

**Easier:** Tools are independently testable (pure functions). Any tool can be composed with any compatible tool — no coupling between tool implementations. Artifact history is complete and browsable. Phase 2 gets a clean composition interface.

**Harder:** Multi-artifact outputs (a tool that produces multiple files) require returning a bundle artifact. Implemented as an `archive` artifact type containing named entries.

**Impossible:** A tool that mutates another tool's artifact. Artifacts are immutable — a new execution always produces a new artifact.

## Alternatives Rejected

**Direct tool chaining:** Creates tight coupling between tools. A tool failure mid-chain leaves no intermediate result. Rejected.

**Shared mutable session:** Concurrency bugs, no replay, no history, hard to test. Rejected.
