from __future__ import annotations

import base64
from typing import Literal

from pydantic import BaseModel

from guppy.core.types import ArtifactType, ToolCategory
from guppy.tools.base import BaseTool, NoConfig


class Base64EncoderInput(BaseModel):
    text: str
    operation: Literal["encode", "decode"]


class Base64EncoderOutput(BaseModel):
    result: str
    operation: str
    byte_length: int


class Base64EncoderTool(BaseTool[Base64EncoderInput, NoConfig, Base64EncoderOutput]):
    name = "base64"
    version = "1.0.0"
    category = ToolCategory.DEVELOPER
    icon = "🔐"
    description = "Encode or decode base64 strings."
    tags = ["base64", "developer", "encoder"]  # noqa: RUF012
    input_artifact_types = []  # noqa: RUF012
    output_artifact_type = ArtifactType.TEXT

    input_schema = Base64EncoderInput
    output_schema = Base64EncoderOutput
    config_schema = NoConfig

    async def execute(self, input: Base64EncoderInput, config: NoConfig) -> Base64EncoderOutput:
        if input.operation == "encode":
            encoded = base64.b64encode(input.text.encode()).decode()
            return Base64EncoderOutput(result=encoded, operation="encode", byte_length=len(encoded))
        else:
            decoded = base64.b64decode(input.text.encode()).decode()
            return Base64EncoderOutput(result=decoded, operation="decode", byte_length=len(decoded))
