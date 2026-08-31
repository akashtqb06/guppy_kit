from __future__ import annotations

from pydantic import BaseModel, Field

from guppy.core.types import ArtifactType, ToolCategory
from guppy.tools.base import BaseTool, NoConfig


class BarChartInput(BaseModel):
    labels: list[str]
    values: list[float]
    title: str = ""
    color: str = "#6366f1"
    width: int = Field(default=800, ge=400, le=1600)
    height: int = Field(default=400, ge=200, le=1000)


class BarChartOutput(BaseModel):
    svg: str
    bar_count: int
    max_value: float
    min_value: float


class BarChartTool(BaseTool[BarChartInput, NoConfig, BarChartOutput]):
    name = "bar-chart"
    version = "1.0.0"
    category = ToolCategory.VISUALIZATION
    description = "A standard tool implementation."
    tags = ["visualization", "utility"]  # noqa: RUF012
    input_artifact_types = []  # noqa: RUF012
    output_artifact_type = ArtifactType.SVG
    icon = "📊"

    input_schema = BarChartInput
    output_schema = BarChartOutput
    config_schema = NoConfig

    async def execute(self, input: BarChartInput, config: NoConfig) -> BarChartOutput:
        svg_parts = [
            f'<svg viewBox="0 0 {input.width} {input.height}" width="{input.width}" height="{input.height}" xmlns="http://www.w3.org/2000/svg">'  # noqa: E501
        ]
        svg_parts.append(f'<rect width="{input.width}" height="{input.height}" fill="white" />')

        if input.title:
            svg_parts.append(
                f'<text x="{input.width / 2}" y="30" font-family="sans-serif" font-size="20" font-weight="bold" text-anchor="middle">{input.title}</text>'  # noqa: E501
            )

        margin_left = 60
        margin_right = 20
        margin_top = 60
        margin_bottom = 60

        plot_width = input.width - margin_left - margin_right
        plot_height = input.height - margin_top - margin_bottom

        max_val = max(input.values) if input.values else 0
        min_val = min(input.values) if input.values else 0

        n = len(input.values)
        if n > 0:
            bar_width = (plot_width / n) * 0.8
            bar_spacing = plot_width / n

            for i, (label, val) in enumerate(zip(input.labels, input.values, strict=False)):
                x = margin_left + i * bar_spacing + (bar_spacing - bar_width) / 2
                h = (val / max_val) * plot_height if max_val > 0 else 0
                y = margin_top + plot_height - h

                svg_parts.append(
                    f'<rect x="{x}" y="{y}" width="{bar_width}" height="{h}" fill="{input.color}" />'  # noqa: E501
                )
                svg_parts.append(
                    f'<text x="{x + bar_width / 2}" y="{margin_top + plot_height + 20}" font-family="sans-serif" font-size="12" text-anchor="middle">{label}</text>'  # noqa: E501
                )
                svg_parts.append(
                    f'<text x="{x + bar_width / 2}" y="{y - 5}" font-family="sans-serif" font-size="12" text-anchor="middle">{val}</text>'  # noqa: E501
                )

        svg_parts.append(
            f'<line x1="{margin_left}" y1="{margin_top + plot_height}" x2="{margin_left + plot_width}" y2="{margin_top + plot_height}" stroke="black" />'  # noqa: E501
        )
        svg_parts.append(
            f'<line x1="{margin_left}" y1="{margin_top}" x2="{margin_left}" y2="{margin_top + plot_height}" stroke="black" />'  # noqa: E501
        )

        svg_parts.append("</svg>")

        return BarChartOutput(
            svg="\n".join(svg_parts), bar_count=n, max_value=max_val, min_value=min_val
        )
