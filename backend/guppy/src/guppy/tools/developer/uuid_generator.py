from __future__ import annotations

import uuid
from typing import Literal

from pydantic import BaseModel, Field

from guppy.core.types import ArtifactType, ToolCategory
from guppy.tools.base import BaseTool, NoConfig


class UuidGeneratorInput(BaseModel):
    version: Literal[1, 4] = 4
    count: int = Field(default=1, ge=1, le=100)


class UuidGeneratorOutput(BaseModel):
    uuids: list[str]
    version: int


class UuidGeneratorTool(BaseTool[UuidGeneratorInput, NoConfig, UuidGeneratorOutput]):
    name = "uuid-generator"
    version = "1.0.0"
    category = ToolCategory.DEVELOPER
    icon = "🆔"
    description = "Generate UUIDs."
    tags = ["uuid", "developer", "generator"]  # noqa: RUF012
    input_artifact_types = []  # noqa: RUF012
    output_artifact_type = ArtifactType.TEXT

    input_schema = UuidGeneratorInput
    output_schema = UuidGeneratorOutput
    config_schema = NoConfig

    async def execute(self, input: UuidGeneratorInput, config: NoConfig) -> UuidGeneratorOutput:
        uuids = []
        for _ in range(input.count):
            if input.version == 1:
                uuids.append(str(uuid.uuid1()))
            else:
                uuids.append(str(uuid.uuid4()))
        return UuidGeneratorOutput(uuids=uuids, version=input.version)
