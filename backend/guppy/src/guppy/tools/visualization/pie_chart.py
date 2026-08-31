from __future__ import annotations

import math

from pydantic import BaseModel

from guppy.core.types import ArtifactType, ToolCategory
from guppy.tools.base import BaseTool, NoConfig


class PieChartInput(BaseModel):
    labels: list[str]
    values: list[float]
    title: str = ""
    width: int = 800
    height: int = 500


class PieChartOutput(BaseModel):
    svg: str
    slice_count: int
    total: float


class PieChartTool(BaseTool[PieChartInput, NoConfig, PieChartOutput]):
    name = "pie-chart"
    version = "1.0.0"
    category = ToolCategory.VISUALIZATION
    description = (
        "Render a polished pie chart as SVG with percentage labels and a color-coded legend."
    )
    tags = ["visualization", "utility", "chart", "pie"]  # noqa: RUF012
    input_artifact_types = []  # noqa: RUF012
    output_artifact_type = ArtifactType.SVG
    icon = "🥧"

    input_schema = PieChartInput
    output_schema = PieChartOutput
    config_schema = NoConfig

    async def execute(self, input: PieChartInput, config: NoConfig) -> PieChartOutput:
        total = sum(input.values)

        # Adjust center to leave room for right-side legend
        cx, cy = (input.width * 0.4), input.height / 2
        r = min(cx, cy) - 60

        svg = [
            f'<svg viewBox="0 0 {input.width} {input.height}" width="{input.width}" height="{input.height}" xmlns="http://www.w3.org/2000/svg">'  # noqa: E501
        ]

        # Defs for shadow
        svg.append("<defs>")
        svg.append('<filter id="pie-shadow" x="-20%" y="-20%" width="140%" height="140%">')
        svg.append('<feDropShadow dx="0" dy="4" stdDeviation="4" flood-opacity="0.15" />')
        svg.append("</filter>")
        svg.append("</defs>")

        svg.append(f'<rect width="{input.width}" height="{input.height}" fill="white" />')

        if input.title:
            svg.append(
                f'<text x="{input.width / 2}" y="40" font-family="sans-serif" font-size="22" font-weight="bold" text-anchor="middle" fill="#1f2937">{input.title}</text>'  # noqa: E501
            )

        # New Color Palette
        colors = [
            "#6366f1",
            "#f59e0b",
            "#10b981",
            "#f43f5e",
            "#3b82f6",
            "#8b5cf6",
            "#06b6d4",
            "#84cc16",
        ]

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
                svg.append(
                    f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{color}" filter="url(#pie-shadow)" stroke="white" stroke-width="2" />'  # noqa: E501
                )
            else:
                path = f"M {cx} {cy} L {x1} {y1} A {r} {r} 0 {large_arc} 1 {x2} {y2} Z"
                svg.append(
                    f'<path d="{path}" fill="{color}" filter="url(#pie-shadow)" stroke="white" stroke-width="2" />'  # noqa: E501
                )

            # Percentage labels on each slice
            if angle > 0.1:  # Only show if slice is large enough
                mid_angle = start_angle + angle / 2
                label_r = r * 0.6  # Position label slightly more than half-way out
                lx = cx + label_r * math.cos(mid_angle)
                ly = cy + label_r * math.sin(mid_angle)
                pct = (val / total) * 100
                svg.append(
                    f'<text x="{lx}" y="{ly + 5}" font-family="sans-serif" font-size="14" font-weight="bold" fill="white" text-anchor="middle">{pct:.1f}%</text>'  # noqa: E501
                )

            # Legend on the right side
            leg_x = cx + r + 80
            leg_y = cy - r + i * 30
            svg.append(
                f'<rect x="{leg_x}" y="{leg_y}" width="16" height="16" fill="{color}" rx="4" />'
            )
            svg.append(
                f'<text x="{leg_x + 24}" y="{leg_y + 13}" font-family="sans-serif" font-size="14" fill="#4b5563">{label} ({val})</text>'  # noqa: E501
            )

            start_angle = end_angle

        svg.append("</svg>")
        return PieChartOutput(svg="\n".join(svg), slice_count=len(input.values), total=total)
