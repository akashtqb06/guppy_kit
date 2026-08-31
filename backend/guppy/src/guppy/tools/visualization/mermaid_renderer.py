from __future__ import annotations

from typing import Literal

from pydantic import BaseModel

from guppy.core.types import ArtifactType, ToolCategory
from guppy.tools.base import BaseTool, NoConfig


class MermaidRendererInput(BaseModel):
    diagram_code: str
    diagram_type: Literal[
        "flowchart", "sequenceDiagram", "classDiagram", "erDiagram", "gantt", "mindmap", "gitGraph"
    ] = "flowchart"


class MermaidRendererOutput(BaseModel):
    markdown: str
    diagram_type: str
    is_valid: bool


class MermaidRendererTool(BaseTool[MermaidRendererInput, NoConfig, MermaidRendererOutput]):
    name = "mermaid-renderer"
    version = "1.0.0"
    category = ToolCategory.VISUALIZATION
    description = "A standard tool implementation."
    tags = ["visualization", "utility"]  # noqa: RUF012
    input_artifact_types = []  # noqa: RUF012
    output_artifact_type = ArtifactType.MARKDOWN
    icon = "🗺️"

    input_schema = MermaidRendererInput
    output_schema = MermaidRendererOutput
    config_schema = NoConfig

    async def execute(self, input: MermaidRendererInput, config: NoConfig) -> MermaidRendererOutput:
        code = input.diagram_code.strip()
        is_valid = code.startswith(input.diagram_type) or code.startswith("graph ")
        md = f"```mermaid\n{code}\n```"
        return MermaidRendererOutput(
            markdown=md, diagram_type=input.diagram_type, is_valid=is_valid
        )
