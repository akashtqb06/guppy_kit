from __future__ import annotations

import json

import yaml
from pydantic import BaseModel, Field

from guppy.core.types import ArtifactType, ToolCategory
from guppy.tools.base import BaseTool, NoConfig


class JsonToYamlInput(BaseModel):
    json_content: str
    indent: int = Field(default=2, ge=1, le=8)


class JsonToYamlOutput(BaseModel):
    yaml_content: str
    key_count: int


class JsonToYamlTool(BaseTool[JsonToYamlInput, NoConfig, JsonToYamlOutput]):
    name = "json-to-yaml"
    version = "1.0.0"
    category = ToolCategory.DATA
    description = "Convert JSON data to YAML format."
    tags = ["data", "converter", "json", "yaml"]  # noqa: RUF012
    input_artifact_types = []  # noqa: RUF012
    output_artifact_type = ArtifactType.TEXT
    icon = "🔄"

    input_schema = JsonToYamlInput
    output_schema = JsonToYamlOutput
    config_schema = NoConfig

    async def execute(self, input: JsonToYamlInput, config: NoConfig) -> JsonToYamlOutput:
        parsed = json.loads(input.json_content)

        # Count keys at top level (or recursively? let's do top level or total based on type, usually top level is fine or we count dict keys recursively)  # noqa: E501
        # Assuming just len if it's a dict/list for simplicity, or we can count all dict keys. Let's count all keys.  # noqa: E501
        def count_keys(obj):
            if isinstance(obj, dict):
                return sum(count_keys(v) for v in obj.values()) + len(obj.keys())
            elif isinstance(obj, list):
                return sum(count_keys(v) for v in obj)
            return 0

        k_count = count_keys(parsed)

        yaml_content = yaml.dump(parsed, indent=input.indent, sort_keys=False)
        return JsonToYamlOutput(yaml_content=yaml_content, key_count=k_count)

