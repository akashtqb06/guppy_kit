from __future__ import annotations

import json

from pydantic import BaseModel

from guppy.core.types import ArtifactType, ToolCategory
from guppy.tools.base import BaseTool, NoConfig


class JsonFormatterInput(BaseModel):
    json_string: str
    indent: int = 2
    sort_keys: bool = False


class JsonFormatterOutput(BaseModel):
    formatted: str
    valid: bool
    key_count: int
    error: str | None = None


class JsonFormatterTool(BaseTool[JsonFormatterInput, NoConfig, JsonFormatterOutput]):
    name = "json-formatter"
    version = "1.0.0"
    category = ToolCategory.DEVELOPER
    icon = "{ }"
    description = "Format and validate JSON with configurable indentation."
    tags = ["json", "developer", "formatter"]  # noqa: RUF012
    input_artifact_types = []  # noqa: RUF012
    output_artifact_type = ArtifactType.JSON

    input_schema = JsonFormatterInput
    output_schema = JsonFormatterOutput
    config_schema = NoConfig

    async def execute(self, input: JsonFormatterInput, config: NoConfig) -> JsonFormatterOutput:
        try:
            parsed = json.loads(input.json_string)
            formatted = json.dumps(parsed, indent=input.indent, sort_keys=input.sort_keys)
            key_count = len(parsed) if isinstance(parsed, dict) else 0
            return JsonFormatterOutput(formatted=formatted, valid=True, key_count=key_count)
        except Exception as exc:
            return JsonFormatterOutput(formatted="", valid=False, key_count=0, error=str(exc))
