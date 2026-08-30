# Guppy Kit Documentation

Welcome. This is the complete documentation for the Guppy Kit Professional Digital Workbench.

---

## Start Here

| I want to... | Go to |
|---|---|
| Understand what Guppy Kit is | [`vision.md`](vision.md) |
| Get the stack running locally | [`guides/quickstart.md`](guides/quickstart.md) |
| Build a new tool | [`guides/building-a-tool.md`](guides/building-a-tool.md) |
| Understand the Tool SDK | [`architecture/tool-sdk.md`](architecture/tool-sdk.md) |
| Browse all tools | [`tools/README.md`](tools/README.md) |
| See the roadmap | [`roadmap.md`](roadmap.md) |
| Contribute | [`../.github/CONTRIBUTING.md`](../.github/CONTRIBUTING.md) |
| Read as a coding agent | [`../AGENTS.md`](../AGENTS.md) |

---

## Key Concepts (30-second primer)

**Tool** — the atomic unit of the platform. A tool has a typed input, a typed output, and runs through one executor that is simultaneously exposed as a UI page, a REST endpoint, and an MCP tool.

**Artifact** — the structured output of a tool execution. Artifacts are typed (`JSON`, `CSV`, `XLSX`, `PDF`, `SVG`, `PPTX`, `SQL`, `Markdown`, `Diagram`) and can be passed directly as input to the next tool.

**Project** — a workspace that groups uploaded files, tool executions, artifacts, and pipelines. Everything a user works on lives in a Project.

**Composition** — chaining tools via artifacts. The output artifact of one tool becomes the input of the next. No download/upload required.

**Tool Family** — a group of related tools: Data, Documents, Developer, Database, Visualization, Presentation, Workflow, Utilities.

**Phase Boundary** — Phase 1 (Capability Layer) builds and ships. Phase 2 (Intelligence Layer) is locked until the Capability Readiness Gate passes.

---

## Documentation Map

```
docs/
├── README.md              This file
├── vision.md              Why, what, who, and the phase boundary
├── roadmap.md             7 milestones + Capability Readiness Gate
│
├── architecture/          How the platform is built
│   ├── README.md          Overview + layer diagram
│   ├── tool-sdk.md        Tool contract — the most important doc
│   ├── execution-model.md Execution lifecycle
│   ├── artifact-system.md Artifact types, storage, and composition flow
│   ├── composition.md     Tool chaining and visual pipeline engine
│   ├── interfaces.md      Three-interface model (UI / REST / MCP)
│   ├── events.md          Platform event system
│   └── data.md            PostgreSQL, Redis, object storage
│
├── guides/                Task-oriented how-to guides
│   ├── README.md          Guide index
│   ├── quickstart.md      Running locally in < 5 minutes
│   ├── building-a-tool.md Add a new tool end-to-end
│   ├── tool-families.md   What's in each of the 8 families
│   ├── projects.md        Using the Project workspace
│   ├── composition.md     Chaining tools with artifacts
│   └── api-and-mcp.md     Using the REST API and MCP server
│
├── reference/             Exact contracts and schemas
│   ├── README.md          Reference index
│   ├── tool-contract.md   Full Tool YAML spec
│   ├── artifact-types.md  All artifact types with schemas
│   ├── api.md             REST API endpoint reference
│   ├── mcp.md             MCP tools reference
│   └── events-reference.md All platform events with payloads
│
├── tools/                 Tool catalog — all 8 families
│   ├── README.md          Catalog index
│   ├── data.md
│   ├── documents.md
│   ├── developer.md
│   ├── database.md
│   ├── visualization.md
│   ├── presentation.md
│   ├── workflow.md
│   └── utilities.md
│
└── adr/                   Architecture Decision Records
    ├── README.md
    ├── 0001-modular-monolith.md
    ├── 0002-tool-sdk-contract.md
    ├── 0003-three-interface-model.md
    ├── 0004-artifact-system.md
    └── 0005-phase-separation.md
```
