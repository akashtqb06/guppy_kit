# Guide — Building a Tool

This guide walks you through adding a complete new tool to Guppy Kit — from YAML definition to working UI workspace, REST endpoint, and MCP tool.

---

## Prerequisites

- Dev stack running locally (see [`guides/quickstart.md`](quickstart.md))
- Understanding of the Tool SDK contract ([`architecture/tool-sdk.md`](../architecture/tool-sdk.md))

---

## 1. Define the Tool in YAML

Create `tool-definitions/<category>/<tool-name>.yaml`:

```yaml
# tool-definitions/developer/url-encoder.yaml

name: url-encoder
version: "1.0.0"
category: developer
description: URL-encode or URL-decode a string
tags: [url, encode, decode, developer, utility]

input:
  - name: text
    type: text
    description: Text to encode or decode
    required: true
    ui_widget: file_or_textarea

  - name: mode
    type: enum
    values: [encode, decode]
    description: Whether to encode or decode the text
    default: encode
    required: false

output:
  type: text
  description: The encoded or decoded text

artifact_type: text
accepts_artifacts: [text]

execution:
  mode: sync
  timeout_seconds: 10

ui:
  layout: split
  input_label: "Input"
  output_label: "Output"
  example_input: "Hello World & Co."
```

Validate the YAML:
```bash
python -m guppy.tools.validate tool-definitions/developer/url-encoder.yaml
```

---

## 2. Implement the Executor

Create `backend/guppy/tools/developer/url_encoder/executor.py`:

```python
# backend/guppy/tools/developer/url_encoder/executor.py

from urllib.parse import quote, unquote
from pydantic import BaseModel
from typing import Literal
from guppy.tools.base import BaseTool, ToolCategory
from guppy.core.types import ArtifactType


class UrlEncoderInput(BaseModel):
    text: str
    mode: Literal["encode", "decode"] = "encode"


class UrlEncoderOutput(BaseModel):
    result: str
    original_length: int
    output_length: int


class UrlEncoderTool(BaseTool[UrlEncoderInput, None, UrlEncoderOutput]):
    name = "url-encoder"
    version = "1.0.0"
    category = ToolCategory.DEVELOPER
    description = "URL-encode or URL-decode a string"
    tags = ["url", "encode", "decode", "developer"]

    input_schema = UrlEncoderInput
    output_schema = UrlEncoderOutput
    output_artifact_type = ArtifactType.TEXT
    input_accepts_artifacts = [ArtifactType.TEXT]

    async def execute(self, input: UrlEncoderInput, config=None) -> UrlEncoderOutput:
        if input.mode == "encode":
            result = quote(input.text, safe="")
        else:
            result = unquote(input.text)

        return UrlEncoderOutput(
            result=result,
            original_length=len(input.text),
            output_length=len(result),
        )
```

---

## 3. Write Tests

Create `backend/tests/tools/developer/test_url_encoder.py`:

```python
import pytest
from guppy.tools.developer.url_encoder.executor import UrlEncoderTool, UrlEncoderInput


@pytest.mark.asyncio
async def test_encode():
    tool = UrlEncoderTool()
    result = await tool.execute(UrlEncoderInput(text="Hello World & Co.", mode="encode"))
    assert result.result == "Hello%20World%20%26%20Co."
    assert result.original_length == 17


@pytest.mark.asyncio
async def test_decode():
    tool = UrlEncoderTool()
    result = await tool.execute(UrlEncoderInput(text="Hello%20World", mode="decode"))
    assert result.result == "Hello World"


@pytest.mark.asyncio
async def test_roundtrip():
    tool = UrlEncoderTool()
    original = "foo bar & baz = 42"
    encoded = await tool.execute(UrlEncoderInput(text=original, mode="encode"))
    decoded = await tool.execute(UrlEncoderInput(text=encoded.result, mode="decode"))
    assert decoded.result == original
```

Run tests:
```bash
pytest backend/tests/tools/developer/test_url_encoder.py -v
```

---

## 4. Build the UI Workspace Page

Create `apps/web/src/app/tools/developer/url-encoder/page.tsx`:

```tsx
// apps/web/src/app/tools/developer/url-encoder/page.tsx
import { ToolWorkspace } from "@guppy-kit/ui"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "URL Encoder / Decoder — Guppy Kit",
  description: "URL-encode or URL-decode any string instantly.",
}

export default function UrlEncoderPage() {
  return (
    <ToolWorkspace
      toolName="url-encoder"
      layout="split"
    />
  )
}
```

That's it. `ToolWorkspace` automatically:
- Fetches the tool schema from the API
- Renders the input fields (text textarea + mode select)
- Calls `POST /api/v1/tools/url-encoder/execute`
- Renders the text output in the output panel
- Shows the Copy / Download / Share / View API / View MCP toolbar

For tools that need custom input or output rendering, extend with:

```tsx
<ToolWorkspace
  toolName="url-encoder"
  layout="split"
  customInput={<MyCustomInput />}      // optional override
  customOutput={<MyCustomOutput />}    // optional override
/>
```

---

## 5. Verify End-to-End

```bash
# Restart the backend to discover the new tool
# (or in dev mode, changes are hot-reloaded)

# 1. Check tool is registered
curl http://localhost:8000/api/v1/tools/url-encoder

# 2. Execute via REST
curl -X POST http://localhost:8000/api/v1/tools/url-encoder/execute \
  -H "Content-Type: application/json" \
  -d '{"input": {"text": "Hello World", "mode": "encode"}}'

# 3. Check MCP tool is discoverable
# (via your MCP client, or check the MCP server debug page)

# 4. Open the UI at http://localhost:3000/tools/developer/url-encoder
```

---

## Definition of Done Checklist

Before opening a PR:

- [ ] `tool-definitions/<category>/<name>.yaml` is valid (`python -m guppy.tools.validate`)
- [ ] Python executor extends `BaseTool` with no type errors (`mypy`)
- [ ] Unit tests cover the executor (≥ 80% branch coverage)
- [ ] `GET /api/v1/tools/<name>` returns the tool
- [ ] `POST /api/v1/tools/<name>/execute` succeeds with valid input
- [ ] `POST /api/v1/tools/<name>/execute` returns a typed error with invalid input
- [ ] MCP `list_tools` includes the tool
- [ ] MCP `call_tool` works with the tool
- [ ] UI workspace page renders and executes
- [ ] Artifact is created on successful execution (verify in project panel or `/api/v1/artifacts`)
- [ ] `tool.execution.completed` event is emitted (verify via `/api/v1/events`)
- [ ] No `ruff` lint errors, no `mypy` errors, no `eslint` errors
