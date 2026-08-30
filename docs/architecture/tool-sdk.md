# Architecture — Tool SDK

The Tool SDK is the most important architectural document in Guppy Kit. Every tool must conform to it. The SDK defines what a tool is, how it is implemented, and how it is made available across all three platform surfaces.

---

## The Tool Contract

A tool is a Python class that extends `BaseTool`. The contract:

```python
from guppy.tools.base import BaseTool, ToolCategory
from pydantic import BaseModel

class MyToolInput(BaseModel):
    # Every input field is explicitly typed via Pydantic
    data: str
    delimiter: str = ","

class MyToolConfig(BaseModel):
    # Optional configuration (user can set before executing)
    encoding: str = "utf-8"

class MyToolOutput(BaseModel):
    # Typed output — becomes the artifact schema
    result: dict
    row_count: int

class MyTool(BaseTool[MyToolInput, MyToolConfig, MyToolOutput]):
    # ── Identity (required) ──────────────────────────────────────────
    name: str = "my-tool"                    # kebab-case, globally unique
    version: str = "1.0.0"                  # semver
    category: ToolCategory = ToolCategory.DATA
    description: str = "One-line description shown in the UI and MCP"
    tags: list[str] = ["csv", "conversion"]
    
    # ── Input/Output types (required) ────────────────────────────────
    input_schema = MyToolInput
    config_schema = MyToolConfig             # omit if no config needed
    output_schema = MyToolOutput
    
    # ── Output artifact type (required) ─────────────────────────────
    output_artifact_type: ArtifactType = ArtifactType.JSON
    
    # ── Executor (required — implement this) ─────────────────────────
    async def execute(
        self,
        input: MyToolInput,
        config: MyToolConfig,
    ) -> MyToolOutput:
        # Pure function: input → output
        # No side effects. No DB writes. No HTTP calls outside of tool logic.
        # The runtime handles artifact persistence and event emission.
        result = do_the_work(input.data, input.delimiter, config.encoding)
        return MyToolOutput(result=result, row_count=len(result))
    
    # ── Optional: UI hints ───────────────────────────────────────────
    input_accepts_artifacts: list[ArtifactType] = [ArtifactType.CSV, ArtifactType.TEXT]
    # If set, the UI offers an "Use artifact" button when an artifact of this type exists in the project
```

### What the runtime does (automatically)

When `execute()` returns:
1. Validates the output against `output_schema`
2. Serializes the output to the `output_artifact_type` format
3. Uploads to object storage → creates an `Artifact` record in PostgreSQL
4. Emits `tool.execution.completed` event with metadata
5. Returns the execution result to the caller (UI, REST, or MCP)

The executor is a **pure function**. It never touches the database, object storage, or event bus.

---

## Tool YAML Definition

Every tool also has a YAML definition in `tool-definitions/<category>/<tool-name>.yaml`. This is the source of truth for the tool registry.

```yaml
# tool-definitions/data/csv-to-json.yaml

name: csv-to-json
version: "1.0.0"
category: data
description: Convert a CSV file or CSV text to JSON
tags: [csv, json, conversion, data]

input:
  - name: data
    type: string
    description: CSV content (text or file content)
    required: true
    ui_widget: file_or_textarea   # how the UI renders this input
  - name: delimiter
    type: string
    description: Column delimiter character
    default: ","
    required: false

config:
  - name: encoding
    type: string
    default: "utf-8"
    description: File encoding

output:
  type: json
  description: JSON array of objects, one per CSV row

artifact_type: json

# Which artifact types this tool can accept as input (for composition)
accepts_artifacts: [csv, text]

ui:
  layout: split           # split | single | canvas
  input_label: "CSV Input"
  output_label: "JSON Output"
  example_input: |
    name,age,city
    Alice,30,NYC
    Bob,25,SF
```

See [`docs/reference/tool-contract.md`](../reference/tool-contract.md) for the complete YAML spec.

---

## Tool Categories

```python
class ToolCategory(str, Enum):
    DATA = "data"
    DOCUMENTS = "documents"
    DEVELOPER = "developer"
    DATABASE = "database"
    VISUALIZATION = "visualization"
    PRESENTATION = "presentation"
    WORKFLOW = "workflow"
    UTILITIES = "utilities"
```

---

## Tool Registration

Tools are discovered automatically by the Tool Registry at startup:

1. Registry scans `tool-definitions/` for YAML files
2. For each YAML, loads the corresponding Python class from `backend/guppy/tools/<category>/<name>/executor.py`
3. Validates that the class extends `BaseTool` and the YAML matches the class schemas
4. Registers the tool in memory and exposes it via REST and MCP

To add a new tool:
1. Create `tool-definitions/<category>/<name>.yaml`
2. Create `backend/guppy/tools/<category>/<name>/executor.py` (implement `BaseTool`)
3. Create `apps/web/src/app/tools/<category>/<name>/page.tsx` (tool workspace UI)
4. Run `pnpm dev` — the tool appears automatically in the registry

No manual registration step. No code changes to the registry itself.

---

## The `BaseTool` Base Class (Implementation)

```python
# backend/guppy/tools/base.py

from abc import abstractmethod
from typing import Generic, TypeVar
from pydantic import BaseModel
from guppy.core.types import ArtifactType, ToolCategory

InputT = TypeVar("InputT", bound=BaseModel)
ConfigT = TypeVar("ConfigT", bound=BaseModel)
OutputT = TypeVar("OutputT", bound=BaseModel)

class BaseTool(Generic[InputT, ConfigT, OutputT]):
    name: str
    version: str
    category: ToolCategory
    description: str
    tags: list[str]

    input_schema: type[InputT]
    config_schema: type[ConfigT] | None = None
    output_schema: type[OutputT]
    output_artifact_type: ArtifactType
    input_accepts_artifacts: list[ArtifactType] = []

    @abstractmethod
    async def execute(self, input: InputT, config: ConfigT) -> OutputT: ...

    # ── Provided by the base class (do not override) ──────────────────

    def validate_input(self, raw: dict) -> InputT:
        return self.input_schema.model_validate(raw)

    def validate_config(self, raw: dict) -> ConfigT:
        if self.config_schema is None:
            return None
        return self.config_schema.model_validate(raw)

    def validate_output(self, output: OutputT) -> None:
        self.output_schema.model_validate(output.model_dump())

    @property
    def mcp_tool_definition(self) -> dict:
        """Returns the MCP tool definition JSON-Schema."""
        return {
            "name": self.name,
            "description": self.description,
            "inputSchema": self.input_schema.model_json_schema(),
        }

    @property
    def openapi_schema(self) -> dict:
        """Returns the OpenAPI request/response schemas for the REST endpoint."""
        return {
            "requestBody": self.input_schema.model_json_schema(),
            "response": self.output_schema.model_json_schema(),
        }
```

---

## Adding a Tool — Quick Reference

```bash
# 1. Create the YAML definition
cat > tool-definitions/data/my-tool.yaml << 'EOF'
name: my-tool
version: "1.0.0"
category: data
description: My new tool
tags: [data]
input:
  - name: data
    type: string
    required: true
output:
  type: json
artifact_type: json
EOF

# 2. Create the Python executor
mkdir -p backend/guppy/tools/data/my_tool
cat > backend/guppy/tools/data/my_tool/executor.py << 'EOF'
from guppy.tools.base import BaseTool, ToolCategory
from guppy.core.types import ArtifactType
from pydantic import BaseModel

class MyToolInput(BaseModel):
    data: str

class MyToolOutput(BaseModel):
    result: str

class MyTool(BaseTool[MyToolInput, None, MyToolOutput]):
    name = "my-tool"
    version = "1.0.0"
    category = ToolCategory.DATA
    description = "My new tool"
    tags = ["data"]
    input_schema = MyToolInput
    output_schema = MyToolOutput
    output_artifact_type = ArtifactType.JSON

    async def execute(self, input: MyToolInput, config=None) -> MyToolOutput:
        return MyToolOutput(result=input.data.upper())
EOF

# 3. Create the UI workspace page
mkdir -p apps/web/src/app/tools/data/my-tool
# (implement page.tsx using the ToolWorkspace component from packages/ui)

# 4. Restart the backend — tool is auto-discovered
# 5. Verify: GET /api/v1/tools → my-tool appears
# 6. Verify: MCP list_tools → my-tool appears
```

See [`docs/guides/building-a-tool.md`](../guides/building-a-tool.md) for the complete step-by-step guide.
