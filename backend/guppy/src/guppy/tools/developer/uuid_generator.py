from __future__ import annotations

import contextlib
import uuid
from typing import Literal

from pydantic import BaseModel, Field

from guppy.core.types import ArtifactType, ToolCategory
from guppy.tools.base import BaseTool, NoConfig


class UuidGeneratorInput(BaseModel):
    version: Literal[1, 3, 4, 5] = 4
    count: int = Field(default=1, ge=1, le=100)
    namespace: str = Field(default="")
    name: str = Field(default="")
    hyphenated: bool = True
    uppercase: bool = False


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
        ns = uuid.NAMESPACE_DNS
        if input.namespace.lower() == "url":
            ns = uuid.NAMESPACE_URL
        elif input.namespace.lower() == "oid":
            ns = uuid.NAMESPACE_OID
        elif input.namespace.lower() == "x500":
            ns = uuid.NAMESPACE_X500
        elif input.namespace:
            with contextlib.suppress(ValueError):
                ns = uuid.UUID(input.namespace)

        for _ in range(input.count):
            if input.version == 1:
                val = uuid.uuid1()
            elif input.version == 3:
                val = uuid.uuid3(ns, input.name)
            elif input.version == 5:
                val = uuid.uuid5(ns, input.name)
            else:
                val = uuid.uuid4()

            s = str(val) if input.hyphenated else val.hex
            if input.uppercase:
                s = s.upper()
            uuids.append(s)

        return UuidGeneratorOutput(uuids=uuids, version=input.version)
