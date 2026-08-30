# Guide — Quickstart

Get the full Guppy Kit stack running in under 5 minutes.

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [VS Code](https://code.visualstudio.com/) + [Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)

---

## Step 1 — Clone and Open

```bash
git clone https://github.com/guppy-kit/guppy-kit.git
cd guppy-kit
```

Open in VS Code → click **"Reopen in Container"** when prompted.

**Terminal only (no VS Code):**
```bash
devcontainer up --workspace-folder .
devcontainer exec --workspace-folder . bash
```

The devcontainer builds images and runs `post-create.sh` which:
1. Installs Python packages (`pip install -e ".[dev]"`)
2. Installs Node packages (`pnpm install`)
3. Runs database migrations (`alembic upgrade head`)
4. Creates the MinIO bucket

First run: ~3–5 minutes. Subsequent: ~30 seconds.

---

## Step 2 — Start Dev Servers

```bash
# In one terminal — backend (hot reload)
cd backend && uvicorn guppy.main:app --reload --host 0.0.0.0 --port 8000

# In another terminal — frontend (hot reload)
pnpm dev --filter web
```

---

## Step 3 — Verify

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| API docs (Swagger) | http://localhost:8000/docs |
| API docs (ReDoc) | http://localhost:8000/redoc |
| MinIO Console | http://localhost:9001 (user: `guppy`, pw: `guppy-secret`) |

---

## Step 4 — Try Your First Tool

1. Visit http://localhost:3000
2. Search for **"JSON Formatter"** → click it
3. Paste some JSON in the input panel → click **Format**
4. See the formatted output in the output panel
5. Click **Download** to get the artifact

---

## Step 5 — Try the API

```bash
# List all tools
curl http://localhost:8000/api/v1/tools \
  -H "Authorization: Bearer dev_key_local" | jq .

# Execute the JSON formatter
curl -X POST http://localhost:8000/api/v1/tools/json-formatter/execute \
  -H "Authorization: Bearer dev_key_local" \
  -H "Content-Type: application/json" \
  -d '{"input": {"code": "{\"name\":\"Alice\",\"age\":30}", "indent": 2}}'
```

---

## Step 6 — Try the MCP Server

If you have an MCP-compatible client (Claude Desktop, Cursor, etc.):

```json
{
  "mcpServers": {
    "guppy-kit": {
      "command": "uvicorn",
      "args": ["guppy.mcp:app", "--host", "0.0.0.0", "--port", "4000"],
      "env": { "GUPPY_API_KEY": "dev_key_local" }
    }
  }
}
```

Or via HTTP (SSE transport):
```
http://localhost:4000/mcp
```

---

## Next Steps

- Add a new tool → [`guides/building-a-tool.md`](building-a-tool.md)
- Explore tool families → [`guides/tool-families.md`](tool-families.md)
- Build a project → [`guides/projects.md`](projects.md)
- Chain tools together → [`guides/composition.md`](composition.md)
