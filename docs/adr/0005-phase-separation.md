# ADR 0005 — Capability Layer Before Intelligence Layer (Hard Gate)

**Status:** Accepted  
**Date:** 2026-08-30

---

## Context

It is tempting to build AI features alongside (or before) the toolbox — to use LLMs to generate outputs, to build an "intelligent" wrapper around partial tooling, or to prototype the Phase 2 planner early. This is the most common way a tool platform becomes neither a good tool platform nor a good AI system.

The risks of building AI too early:
- The toolbox is never finished — AI generates plausible outputs for missing tool implementations, masking the gap
- The Tool SDK contract is designed around what's easy to prompt, not what's architecturally clean
- The MCP interface is an afterthought — the AI just calls internal functions directly
- Phase 1 is never independently useful — users depend on the AI to make the partial toolbox work
- Trust is lower — outputs are not reproducible, not explainable, and not testable

## Decision

**Phase 2 (Intelligence Layer) is gated behind a formal Capability Readiness Gate that Phase 1 must pass.**

The gate is a checklist in [`docs/roadmap.md`](../roadmap.md). It requires:
- All 8 tool families complete with ≥ 3 tools each
- Every tool DoD-verified (see `AGENTS.md`)
- REST API and MCP server live and contract-tested
- Composition working end-to-end for ≥ 3 full tool chains
- Backend test coverage ≥ 80%
- Load test: 50 concurrent executions without failure

**Enforcement:**
- CI pipeline has a `phase2-gate` check that fails unless the gate checklist file is marked complete by a maintainer
- `AGENTS.md` explicitly prohibits AI/LLM code in Phase 1
- Contributing guide blocks Phase 2 work until the gate passes

## Consequences

**Easier:** The toolbox is independently useful and well-tested before AI touches it. Tool contracts are designed for correctness, not prompt-friendliness. The MCP interface is production-ready when Phase 2 needs it. Trust in outputs is higher — they come from deterministic tool executors.

**Harder:** It takes longer to have "AI features." This is intentional.

**Impossible:** Merging any AI/LLM code into `main` before the gate passes. CI rejects it.

## Alternatives Rejected

**Build AI and tools in parallel:** AI paper-covers incomplete tooling. The product is never finished. Rejected.

**Build AI first, tools later:** The AI has no reliable capabilities to orchestrate. Produces low-quality outputs. The toolbox never gets built with the right architecture. Rejected.
