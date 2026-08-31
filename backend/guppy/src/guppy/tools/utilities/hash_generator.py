from __future__ import annotations

import hashlib
from typing import Literal

from pydantic import BaseModel

from guppy.core.types import ArtifactType, ToolCategory
from guppy.tools.base import BaseTool, NoConfig


class HashGeneratorInput(BaseModel):
    text: str
    algorithm: Literal["md5", "sha1", "sha256", "sha512"] = "sha256"


class HashGeneratorOutput(BaseModel):
    hash: str
    algorithm: str
    input_length: int


class HashGeneratorTool(BaseTool[HashGeneratorInput, NoConfig, HashGeneratorOutput]):
    name = "hash-generator"
    version = "1.0.0"
    category = ToolCategory.UTILITIES
    icon = "#️⃣"
    description = "Generate hash from text."
    tags = ["hash", "utilities", "generator"]  # noqa: RUF012
    input_artifact_types = []  # noqa: RUF012
    output_artifact_type = ArtifactType.TEXT

    input_schema = HashGeneratorInput
    output_schema = HashGeneratorOutput
    config_schema = NoConfig

    async def execute(self, input: HashGeneratorInput, config: NoConfig) -> HashGeneratorOutput:
        algo = getattr(hashlib, input.algorithm)
        result = algo(input.text.encode()).hexdigest()
        return HashGeneratorOutput(
            hash=result, algorithm=input.algorithm, input_length=len(input.text)
        )
