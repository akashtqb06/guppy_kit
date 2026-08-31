from __future__ import annotations

import json

import yaml
from pydantic import BaseModel, Field

from guppy.core.types import ArtifactType, ToolCategory
from guppy.tools.base import BaseTool, NoConfig


class YamlToJsonInput(BaseModel):
    yaml_content: str
    indent: int = Field(default=2, ge=0, le=8)


class YamlToJsonOutput(BaseModel):
    json_content: str
    key_count: int


class YamlToJsonTool(BaseTool[YamlToJsonInput, NoConfig, YamlToJsonOutput]):
    name = "yaml-to-json"
    version = "1.0.0"
    category = ToolCategory.DATA
    description = "Convert YAML data to JSON format."
    tags = ["data", "converter", "yaml", "json"]  # noqa: RUF012
    input_artifact_types = []  # noqa: RUF012
    output_artifact_type = ArtifactType.JSON
    icon = "🔄"

    input_schema = YamlToJsonInput
    output_schema = YamlToJsonOutput
    config_schema = NoConfig

    async def execute(self, input: YamlToJsonInput, config: NoConfig) -> YamlToJsonOutput:
        parsed = yaml.safe_load(input.yaml_content)

        def count_keys(obj):
            if isinstance(obj, dict):
                return sum(count_keys(v) for v in obj.values()) + len(obj.keys())
            elif isinstance(obj, list):
                return sum(count_keys(v) for v in obj)
            return 0

        k_count = count_keys(parsed)

        # If indent is 0, use None (compact)
        json_indent = input.indent if input.indent > 0 else None
        json_content = json.dumps(parsed, indent=json_indent)
        return YamlToJsonOutput(json_content=json_content, key_count=k_count)
