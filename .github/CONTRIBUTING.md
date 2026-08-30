# Contributing to Guppy Kit

Thank you for contributing. Every contribution — code, tools, documentation, bug reports — makes the platform better.

**Coding agent?** Read [`AGENTS.md`](../AGENTS.md) instead of this file.

---

## Table of Contents

1. [Development Setup](#1-development-setup)
2. [Contribution Types](#2-contribution-types)
3. [Coding Standards](#3-coding-standards)
4. [Commit Conventions](#4-commit-conventions)
5. [Pull Request Process](#5-pull-request-process)

---

## 1. Development Setup

```bash
git clone https://github.com/guppy-kit/guppy-kit.git
cd guppy-kit
# VS Code: "Reopen in Container"
# OR: devcontainer up --workspace-folder .
```

See [`docs/guides/quickstart.md`](../docs/guides/quickstart.md) for full details.

---

## 2. Contribution Types

| Type | Review requirement |
|---|---|
| Bug fix | 1 maintainer approval |
| Documentation | 1 maintainer approval |
| New tool (in an existing family) | 1 maintainer approval + tests |
| New tool family | RFC + 2 maintainer approvals |
| Changes to Tool SDK contract (`BaseTool`) | RFC + all maintainers |
| Changes to Artifact System | RFC + all maintainers |
| Any Phase 2 (AI/Intelligence) work | **Blocked** — Phase 1 must be complete first |

### Adding a new tool

The most common contribution. See [`docs/guides/building-a-tool.md`](../docs/guides/building-a-tool.md) for the complete guide.

1. Create `backend/guppy/tools/<family>/<tool-name>/executor.py` (extends `BaseTool`)
2. Create `tool-definitions/<family>/<tool-name>.yaml`
3. Add the UI tool workspace component in `apps/web/src/app/tools/<family>/<tool-name>/`
4. Run `pnpm test` and `pytest` — both must pass
5. Open a PR with the DoD checklist filled

---

## 3. Coding Standards

### Python
```bash
ruff format backend/          # format
ruff check backend/           # lint
mypy backend/guppy            # type check
pytest backend/tests/ -v      # test
```

### TypeScript
```bash
pnpm format                   # prettier
pnpm lint                     # eslint
pnpm type-check               # tsc --noEmit
pnpm test                     # vitest / jest
```

### Design system rules
- All UI components must use `packages/ui` — no ad-hoc component creation
- Styling via Tailwind v4 design tokens defined in `packages/config/tailwind.config.ts`
- No raw arbitrary Tailwind values in component code — add design tokens instead
- Icons from `lucide-react` only

---

## 4. Commit Conventions

```
<type>(<scope>): <subject>
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`

Scopes: `backend`, `frontend`, `ui`, `tool-sdk`, `tools`, `mcp`, `artifacts`, `workflows`, `docs`, `ci`

Examples:
```
feat(tools): add JSON diff tool executor and UI
fix(artifacts): resolve S3 upload race condition on concurrent executions
docs(guides): add building-a-tool.md guide
test(tools): add CSV profiler executor integration tests
```

---

## 5. Pull Request Process

1. Branch from `main`: `feat/json-diff-tool`, `fix/artifact-upload`
2. One logical change per PR
3. Fill the PR template (auto-populated)
4. Ensure CI passes — lint, type-check, and tests
5. Request review from at least one maintainer
6. PRs are squash-merged
