from __future__ import annotations

import math

from pydantic import BaseModel

from guppy.core.types import ArtifactType, ToolCategory
from guppy.tools.base import BaseTool, NoConfig


class PieChartInput(BaseModel):
    labels: list[str]
    values: list[float]
    title: str = ""
    width: int = 600
    height: int = 400


class PieChartOutput(BaseModel):
    svg: str
    slice_count: int
    total: float


class PieChartTool(BaseTool[PieChartInput, NoConfig, PieChartOutput]):
    name = "pie-chart"
    version = "1.0.0"
    category = ToolCategory.VISUALIZATION
    description = "A standard tool implementation."
    tags = ["visualization", "utility"]  # noqa: RUF012
    input_artifact_types = []  # noqa: RUF012
    output_artifact_type = ArtifactType.SVG
    icon = "🥧"

    input_schema = PieChartInput
    output_schema = PieChartOutput
    config_schema = NoConfig

    async def execute(self, input: PieChartInput, config: NoConfig) -> PieChartOutput:
        total = sum(input.values)
        cx, cy = input.width / 2 - 50, input.height / 2
        r = min(cx, cy) - 40

        svg = [
            f'<svg viewBox="0 0 {input.width} {input.height}" width="{input.width}" height="{input.height}" xmlns="http://www.w3.org/2000/svg">'  # noqa: E501
        ]
        svg.append(f'<rect width="{input.width}" height="{input.height}" fill="white" />')

        if input.title:
            svg.append(
                f'<text x="{input.width / 2}" y="30" font-family="sans-serif" font-size="20" font-weight="bold" text-anchor="middle">{input.title}</text>'  # noqa: E501
            )

        colors = ["#6366f1", "#ec4899", "#14b8a6", "#f59e0b", "#8b5cf6", "#ef4444", "#10b981"]

        start_angle = 0
        for i, (label, val) in enumerate(zip(input.labels, input.values, strict=False)):
            if total == 0:
                break
            angle = (val / total) * 2 * math.pi
            end_angle = start_angle + angle

            x1 = cx + r * math.cos(start_angle)
            y1 = cy + r * math.sin(start_angle)
            x2 = cx + r * math.cos(end_angle)
            y2 = cy + r * math.sin(end_angle)

            large_arc = 1 if angle > math.pi else 0

            color = colors[i % len(colors)]
            if val == total:
                svg.append(f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{color}" />')
            else:
                path = f"M {cx} {cy} L {x1} {y1} A {r} {r} 0 {large_arc} 1 {x2} {y2} Z"
                svg.append(f'<path d="{path}" fill="{color}" />')

            # legend
            leg_x = cx + r + 40
            leg_y = cy - r + i * 20
            svg.append(f'<rect x="{leg_x}" y="{leg_y}" width="10" height="10" fill="{color}" />')
            svg.append(
                f'<text x="{leg_x + 15}" y="{leg_y + 10}" font-family="sans-serif" font-size="12">{label} ({val})</text>'  # noqa: E501
            )

            start_angle = end_angle

        svg.append("</svg>")
        return PieChartOutput(svg="\n".join(svg), slice_count=len(input.values), total=total)
