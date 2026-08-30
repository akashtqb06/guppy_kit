# ADR 0001 — Modular Monolith Over Microservices

**Status:** Accepted  
**Date:** 2026-08-30

---

## Context

Guppy Kit's surface area covers 8 tool families, a tool runtime, artifact service, workflow engine, project service, REST API, MCP server, and event system. This naturally creates pressure to deploy each as an independent microservice.

Counter-pressure: the team is small, the product is pre-product-market-fit, and the biggest execution risk is building infrastructure overhead instead of shipping tool value.

## Decision

Start as a **modular monolith**: one Python package (`backend/guppy`), one deployed FastAPI process, internal domain boundaries enforced by directory structure (`core/`, `tools/`, `artifacts/`, `workflows/`, `projects/`, `api/`, `mcp/`, `events/`) but not by network.

**Extraction triggers** — a module becomes a separate service only when:
- Its load profile is measured (not predicted) to differ enough to require independent scaling
- A security boundary demands network isolation (e.g. a sandboxed code execution tool)
- Extraction has a real user benefit (not just engineering preference)

## Consequences

**Easier:** One `docker-compose up` runs everything. Refactoring domain boundaries is a file move. Transactions across domains work natively. Onboarding a new contributor is faster.

**Harder:** Discipline is required to keep domain boundaries clean (imports across modules only through defined interfaces). Enforced by `ruff` import rules.

**Impossible (now):** Independently scaling one domain before extraction. Accepted trade-off at this stage.

## Alternatives Rejected

**Microservices from day one:** Operational overhead (service mesh, inter-service auth, separate CI) consumes team capacity before a single tool ships. Rejected.
