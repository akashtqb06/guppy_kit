from __future__ import annotations

import urllib.parse
from typing import Literal

from pydantic import BaseModel

from guppy.core.types import ArtifactType, ToolCategory
from guppy.tools.base import BaseTool, NoConfig


class UrlEncoderInput(BaseModel):
    text: str
    operation: Literal["encode", "decode"] = "encode"


class UrlEncoderOutput(BaseModel):
    result: str
    operation: str


class UrlEncoderTool(BaseTool[UrlEncoderInput, NoConfig, UrlEncoderOutput]):
    name = "url-encoder"
    version = "1.0.0"
    category = ToolCategory.UTILITIES
    icon = "🔗"
    description = "Encode or decode URL strings."
    tags = ["url", "utilities", "encoder"]  # noqa: RUF012
    input_artifact_types = []  # noqa: RUF012
    output_artifact_type = ArtifactType.TEXT

    input_schema = UrlEncoderInput
    output_schema = UrlEncoderOutput
    config_schema = NoConfig

    async def execute(self, input: UrlEncoderInput, config: NoConfig) -> UrlEncoderOutput:
        if input.operation == "encode":
            result = urllib.parse.quote(input.text)
        else:
            result = urllib.parse.unquote(input.text)
        return UrlEncoderOutput(result=result, operation=input.operation)
