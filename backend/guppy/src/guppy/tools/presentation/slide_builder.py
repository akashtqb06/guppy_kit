from __future__ import annotations

from typing import Literal

from pydantic import BaseModel

from guppy.core.types import ArtifactType, ToolCategory
from guppy.tools.base import BaseTool, NoConfig


class SlideBuilderInput(BaseModel):
    title: str
    slides: list[dict]
    theme: Literal["default", "dark", "minimal"] = "default"


class SlideBuilderOutput(BaseModel):
    slide_count: int
    title: str
    outline: list[str]
    export_format: str
    presentation_data: dict


class SlideBuilderTool(BaseTool[SlideBuilderInput, NoConfig, SlideBuilderOutput]):
    name = "slide-builder"
    version = "1.0.0"
    category = ToolCategory.PRESENTATION
    description = "A standard tool implementation."
    tags = ["presentation", "utility"]  # noqa: RUF012
    input_artifact_types = []  # noqa: RUF012
    output_artifact_type = ArtifactType.JSON
    icon = "🎯"

    input_schema = SlideBuilderInput
    output_schema = SlideBuilderOutput
    config_schema = NoConfig

    async def execute(self, input: SlideBuilderInput, config: NoConfig) -> SlideBuilderOutput:
        outline = [s.get("title", "Untitled") for s in input.slides]

        presentation_data = {"title": input.title, "theme": input.theme, "slides": input.slides}

        return SlideBuilderOutput(
            slide_count=len(input.slides),
            title=input.title,
            outline=outline,
            export_format="json",
            presentation_data=presentation_data,
        )
