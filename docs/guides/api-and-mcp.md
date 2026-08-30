# Guide — API and MCP

Guppy Kit exposes all tools through a REST API and an MCP server. This guide shows how to use both for programmatic access and integration.

---

## REST API

### Authentication

```bash
# Get your API key from Settings → API Keys (UI)
# Dev default:
API_KEY="dev_key_local"
BASE="http://localhost:8000/api/v1"
```

### Execute a tool

```bash
curl -X POST $BASE/tools/json-formatter/execute \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "input": { "code": "{\"name\":\"Alice\"}", "indent": 4 },
    "project_id": "optional-uuid"
  }'
```

### Use an artifact from a previous execution

```bash
# First execution produces an artifact
ARTIFACT=$(curl -sX POST $BASE/tools/csv-to-json/execute \
  -H "Authorization: Bearer $API_KEY" \
  -d '{"input": {"data": "a,b\n1,2"}}' | jq -r '.artifact.id')

# Second execution consumes it
curl -X POST $BASE/tools/json-formatter/execute \
  -H "Authorization: Bearer $API_KEY" \
  -d "{\"input\": {\"artifact_id\": \"$ARTIFACT\"}}"
```

### Download an artifact

```bash
curl -OJ $BASE/artifacts/$ARTIFACT_ID/download \
  -H "Authorization: Bearer $API_KEY"
```

### List all tools

```bash
curl $BASE/tools -H "Authorization: Bearer $API_KEY" | jq '.[].name'

# Filter by category
curl "$BASE/tools?category=developer" -H "Authorization: Bearer $API_KEY"

# Search
curl "$BASE/tools?q=json" -H "Authorization: Bearer $API_KEY"
```

---

## MCP Server

The MCP server makes all platform tools available to any MCP-compatible AI client.

### Configuration (Claude Desktop example)

```json
{
  "mcpServers": {
    "guppy-kit": {
      "url": "http://localhost:4000/mcp",
      "headers": { "X-Guppy-Api-Key": "dev_key_local" }
    }
  }
}
```

### Configuration (Cursor / Windsurf)

```json
{
  "mcp": {
    "servers": {
      "guppy-kit": {
        "url": "http://localhost:4000/mcp",
        "env": { "X-GUPPY-API-KEY": "dev_key_local" }
      }
    }
  }
}
```

### Using from Python (direct MCP client)

```python
from mcp import ClientSession
from mcp.client.sse import sse_client

async with sse_client("http://localhost:4000/mcp") as (read, write):
    async with ClientSession(read, write) as session:
        await session.initialize()

        # List all tools
        tools = await session.list_tools()
        print([t.name for t in tools.tools])

        # Call a tool
        result = await session.call_tool(
            "json_formatter",
            arguments={"code": '{"name":"Alice"}', "indent": 2}
        )
        print(result.content[0].text)   # formatted JSON string
```

### Passing artifacts via MCP

```python
# After running a tool that produces an artifact
result = await session.call_tool(
    "csv_to_json",
    arguments={"data": "name,age\nAlice,30"}
)
artifact_id = result.content[0]._meta["artifact_id"]

# Pass the artifact to the next tool
result2 = await session.call_tool(
    "json_formatter",
    arguments={"artifact_id": artifact_id, "indent": 4}
)
```

---

## Webhooks

Register a webhook to receive events when executions complete (Milestone 5):

```bash
curl -X POST $BASE/webhooks \
  -H "Authorization: Bearer $API_KEY" \
  -d '{
    "url": "https://your-server.com/hooks/guppy",
    "events": ["tool.execution.completed", "artifact.created"],
    "project_id": "optional-filter"
  }'
```

Webhook payload:
```json
{
  "type": "tool.execution.completed",
  "payload": { "execution_id": "...", "artifact_id": "...", "tool_name": "..." },
  "emitted_at": "2026-08-30T12:00:00Z"
}
```

---

## Rate Limits

| Tier | Calls/minute | Concurrent executions |
|---|---|---|
| Dev (local) | unlimited | unlimited |
| Community | 60 | 5 |
| Team | 600 | 20 |
| Enterprise | custom | custom |

Rate limit headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`
