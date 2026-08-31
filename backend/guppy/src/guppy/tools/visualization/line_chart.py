from __future__ import annotations

from pydantic import BaseModel

from guppy.core.types import ArtifactType, ToolCategory
from guppy.tools.base import BaseTool, NoConfig


class LineChartInput(BaseModel):
    labels: list[str]
    values: list[float]
    title: str = ""
    color: str = "#6366f1"
    fill: bool = False
    width: int = 800
    height: int = 400


class LineChartOutput(BaseModel):
    svg: str
    point_count: int
    max_value: float
    min_value: float


class LineChartTool(BaseTool[LineChartInput, NoConfig, LineChartOutput]):
    name = "line-chart"
    version = "1.0.0"
    category = ToolCategory.VISUALIZATION
    description = "A standard tool implementation."
    tags = ["visualization", "utility"]  # noqa: RUF012
    input_artifact_types = []  # noqa: RUF012
    output_artifact_type = ArtifactType.SVG
    icon = "📈"

    input_schema = LineChartInput
    output_schema = LineChartOutput
    config_schema = NoConfig

    async def execute(self, input: LineChartInput, config: NoConfig) -> LineChartOutput:
        svg = [
            f'<svg viewBox="0 0 {input.width} {input.height}" width="{input.width}" height="{input.height}" xmlns="http://www.w3.org/2000/svg">'  # noqa: E501
        ]
        svg.append(f'<rect width="{input.width}" height="{input.height}" fill="white" />')

        if input.title:
            svg.append(
                f'<text x="{input.width / 2}" y="30" font-family="sans-serif" font-size="20" font-weight="bold" text-anchor="middle">{input.title}</text>'  # noqa: E501
            )

        margin_left = 60
        margin_bottom = 60
        plot_w = input.width - margin_left - 20
        plot_h = input.height - 60 - margin_bottom

        max_v = max(input.values) if input.values else 0
        min_v = min(input.values) if input.values else 0

        points = []
        n = len(input.values)
        if n > 1:
            for i, val in enumerate(input.values):
                x = margin_left + (i / (n - 1)) * plot_w
                y = 60 + plot_h - (val / max_v * plot_h if max_v > 0 else 0)
                points.append(f"{x},{y}")

            pts_str = " ".join(points)
            if input.fill:
                svg.append(
                    f'<polygon points="{margin_left},{60 + plot_h} {pts_str} {margin_left + plot_w},{60 + plot_h}" fill="{input.color}" opacity="0.3" />'  # noqa: E501
                )
            svg.append(
                f'<polyline points="{pts_str}" fill="none" stroke="{input.color}" stroke-width="2" />'  # noqa: E501
            )

            for i, (label, val) in enumerate(zip(input.labels, input.values, strict=False)):
                x = margin_left + (i / (n - 1)) * plot_w
                y = 60 + plot_h - (val / max_v * plot_h if max_v > 0 else 0)
                svg.append(f'<circle cx="{x}" cy="{y}" r="4" fill="{input.color}" />')
                svg.append(
                    f'<text x="{x}" y="{60 + plot_h + 20}" font-family="sans-serif" font-size="12" text-anchor="middle">{label}</text>'  # noqa: E501
                )

        svg.append("</svg>")
        return LineChartOutput(svg="\n".join(svg), point_count=n, max_value=max_v, min_value=min_v)
