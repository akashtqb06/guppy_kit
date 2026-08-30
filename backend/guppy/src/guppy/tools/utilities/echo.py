"""
Echo tool — the platform smoke-test tool.

Returns its input unchanged. Used to verify that the full execution chain
(API → Registry → Runtime → Tool → Response) works end-to-end.

This is the first tool in the Utilities family.
"""

from __future__ import annotations

from pydantic import BaseModel, Field

from guppy.core.types import ArtifactType, ToolCategory
from guppy.tools.base import BaseTool, NoConfig


class EchoInput(BaseModel):
    """Input for the Echo tool."""

    message: str = Field(
        description="Any string to echo back.",
        min_length=1,
        max_length=10_000,
    )
    metadata: dict[str, str] = Field(
        default_factory=dict,
        description="Optional key-value pairs to include in the response.",
    )


class EchoOutput(BaseModel):
    """Output from the Echo tool — identical to input."""

    message: str
    metadata: dict[str, str]
    echoed: bool = True


class EchoTool(BaseTool[EchoInput, NoConfig, EchoOutput]):
    """Returns its input unchanged. Used for smoke-testing the platform."""

    name = "echo"
    version = "1.0.0"
    category = ToolCategory.UTILITIES
    description = "Returns its input unchanged. Used to verify the execution pipeline."
    tags = ["test", "utilities", "smoke-test"]
    input_artifact_types = []
    output_artifact_type = ArtifactType.JSON

    input_schema = EchoInput
    output_schema = EchoOutput
    config_schema = NoConfig

    async def execute(self, input: EchoInput, config: NoConfig) -> EchoOutput:  # noqa: A002
        return EchoOutput(
            message=input.message,
            metadata=input.metadata,
        )
