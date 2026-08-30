# Architecture Overview

Guppy Kit is a modular monolith. The stack is intentionally simple for Phase 1; complexity is added only when load measurements demand it.

---

## System Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER EXPERIENCE                         │
│                                                                 │
│   Next.js 14 · shadcn/ui · Tailwind v4 · React Flow · Monaco   │
│   packages/ui (shared design system)                           │
└────────────────────────────┬────────────────────────────────────┘
                             │  HTTP / WebSocket
┌────────────────────────────▼────────────────────────────────────┐
│                      API GATEWAY (FastAPI)                      │
│                                                                 │
│   /api/v1/tools/*    /api/v1/artifacts/*    /api/v1/projects/*  │
│   Auth · Rate limiting · Request validation · OTel spans       │
└──────┬──────────────────────────────────────────────────────────┘
       │
┌──────▼──────────────────────────────────────────────────────────┐
│                      TOOLBOX PLATFORM                           │
│                                                                 │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │ Tool        │  │ Tool         │  │ Artifact Service      │   │
│  │ Registry    │→ │ Runtime      │→ │ (S3 + metadata in PG) │   │
│  └─────────────┘  └──────┬───────┘  └──────────────────────┘   │
│                          │                                       │
│  ┌─────────────────────── ▼ ─────────────────────────────────┐  │
│  │             Event Bus (PostgreSQL + Redis PubSub)         │  │
│  │  tool.execution.started/completed/failed · artifact.*     │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────┐   ┌─────────────────────────────────┐    │
│  │ Workflow Runtime │   │ Project Service                 │    │
│  │ (pipeline exec)  │   │ (files, executions, artifacts)  │    │
│  └──────────────────┘   └─────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────── ┘
       │                                    │
┌──────▼──────────┐              ┌──────────▼──────────────────────┐
│  REST API       │              │  MCP Server                     │
│  (external devs)│              │  (AI clients, Phase 2 planner)  │
└─────────────────┘              └─────────────────────────────────┘
       │                                    │
       └──────────────────┬─────────────────┘
                          │
              ┌───────────▼──────────────┐
              │        DATA LAYER        │
              │  PostgreSQL · Redis      │
              │  MinIO (S3-compatible)   │
              └──────────────────────────┘
```

---

## Architecture Documents

| Document | What it covers |
|---|---|
| [`tool-sdk.md`](tool-sdk.md) | **The most important doc.** Tool contract, `BaseTool` class, executor interface, registration |
| [`execution-model.md`](execution-model.md) | Tool execution lifecycle: validate → execute → emit event → persist artifact |
| [`artifact-system.md`](artifact-system.md) | Artifact types, storage model, how artifacts enable tool composition |
| [`composition.md`](composition.md) | Pipeline model, visual builder, execution engine |
| [`interfaces.md`](interfaces.md) | Three-interface model: one implementation → UI + REST + MCP |
| [`events.md`](events.md) | Platform event system, all events, Phase 2 subscriber model |
| [`data.md`](data.md) | PostgreSQL schema, Redis usage, object storage layout |

---

## Architecture Decision Records

| ADR | Decision |
|---|---|
| [0001](../adr/0001-modular-monolith.md) | Modular monolith first |
| [0002](../adr/0002-tool-sdk-contract.md) | Common Tool SDK contract as the core primitive |
| [0003](../adr/0003-three-interface-model.md) | One implementation, three surfaces (UI / REST / MCP) |
| [0004](../adr/0004-artifact-system.md) | Artifacts as the composition glue |
| [0005](../adr/0005-phase-separation.md) | Capability Layer before Intelligence Layer |
