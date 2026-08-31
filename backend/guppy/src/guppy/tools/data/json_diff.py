from __future__ import annotations

import json

from pydantic import BaseModel

from guppy.core.types import ArtifactType, ToolCategory
from guppy.tools.base import BaseTool, NoConfig


class JsonDiffInput(BaseModel):
    json_a: str
    json_b: str


class JsonDiffOutput(BaseModel):
    added: list[str]
    removed: list[str]
    changed: list[dict]
    is_identical: bool


class JsonDiffTool(BaseTool[JsonDiffInput, NoConfig, JsonDiffOutput]):
    name = "json-diff"
    version = "1.0.0"
    category = ToolCategory.DATA
    icon = "🔀"
    description = "Compute difference between two JSON objects."
    tags = ["json", "data", "diff"]  # noqa: RUF012
    input_artifact_types = []  # noqa: RUF012
    output_artifact_type = ArtifactType.JSON

    input_schema = JsonDiffInput
    output_schema = JsonDiffOutput
    config_schema = NoConfig

    async def execute(self, input: JsonDiffInput, config: NoConfig) -> JsonDiffOutput:
        a = json.loads(input.json_a)
        b = json.loads(input.json_b)

        added = []
        removed = []
        changed = []

        def diff(obj1, obj2, path=""):
            if isinstance(obj1, dict) and isinstance(obj2, dict):
                for k in obj1:
                    if k not in obj2:
                        removed.append(f"{path}.{k}" if path else k)
                    else:
                        diff(obj1[k], obj2[k], f"{path}.{k}" if path else k)
                for k in obj2:
                    if k not in obj1:
                        added.append(f"{path}.{k}" if path else k)
            elif isinstance(obj1, list) and isinstance(obj2, list):
                for i in range(max(len(obj1), len(obj2))):
                    if i >= len(obj1):
                        added.append(f"{path}[{i}]")
                    elif i >= len(obj2):
                        removed.append(f"{path}[{i}]")
                    else:
                        diff(obj1[i], obj2[i], f"{path}[{i}]")
            else:
                if obj1 != obj2:
                    changed.append({"path": path, "old": obj1, "new": obj2})

        diff(a, b)

        return JsonDiffOutput(
            added=added,
            removed=removed,
            changed=changed,
            is_identical=len(added) == 0 and len(removed) == 0 and len(changed) == 0,
        )
