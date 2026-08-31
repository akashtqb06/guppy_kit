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
    x_label: str = ""
    y_label: str = ""


class LineChartOutput(BaseModel):
    svg: str
    point_count: int
    max_value: float
    min_value: float


class LineChartTool(BaseTool[LineChartInput, NoConfig, LineChartOutput]):
    name = "line-chart"
    version = "1.0.0"
    category = ToolCategory.VISUALIZATION
    description = (
        "Render a polished line chart as SVG with grid lines, data point markers, and axis labels."
    )
    tags = ["visualization", "utility", "chart", "line"]  # noqa: RUF012
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
                f'<text x="{input.width / 2}" y="30" font-family="sans-serif" font-size="20" font-weight="bold" text-anchor="middle" fill="#1f2937">{input.title}</text>'  # noqa: E501
            )

        margin_left = 80
        margin_right = 40
        margin_top = 60
        margin_bottom = 80
        plot_w = input.width - margin_left - margin_right
        plot_h = input.height - margin_top - margin_bottom

        max_v = max(input.values) if input.values else 0
        min_v = min(input.values) if input.values else 0
        grid_max = max_v if max_v > 0 else 1

        n = len(input.values)

        # Horizontal Y-axis grid lines (5 lines)
        for i in range(5):
            y_ratio = i / 4
            val = grid_max * (1 - y_ratio)
            y_pos = margin_top + (y_ratio * plot_h)

            svg.append(
                f'<line x1="{margin_left}" y1="{y_pos}" x2="{margin_left + plot_w}" y2="{y_pos}" stroke="#e5e7eb" stroke-dasharray="4" />'  # noqa: E501
            )
            svg.append(
                f'<text x="{margin_left - 10}" y="{y_pos + 4}" font-family="sans-serif" font-size="12" fill="#6b7280" text-anchor="end">{val:.1f}</text>'  # noqa: E501
            )

        # Vertical X-axis grid lines
        if n > 1:
            for i in range(n):
                x_pos = margin_left + (i / (n - 1)) * plot_w
                svg.append(
                    f'<line x1="{x_pos}" y1="{margin_top}" x2="{x_pos}" y2="{margin_top + plot_h}" stroke="#e5e7eb" stroke-dasharray="4" />'  # noqa: E501
                )

        points = []
        if n > 1:
            for i, val in enumerate(input.values):
                x = margin_left + (i / (n - 1)) * plot_w
                y = margin_top + plot_h - (val / grid_max * plot_h if grid_max > 0 else 0)
                points.append(f"{x},{y}")

            pts_str = " ".join(points)
            if input.fill:
                svg.append(
                    f'<polygon points="{margin_left},{margin_top + plot_h} {pts_str} {margin_left + plot_w},{margin_top + plot_h}" fill="{input.color}" opacity="0.15" />'  # noqa: E501
                )
            svg.append(
                f'<polyline points="{pts_str}" fill="none" stroke="{input.color}" stroke-width="3" />'  # noqa: E501
            )

            for i, (label, val) in enumerate(zip(input.labels, input.values, strict=False)):
                x = margin_left + (i / (n - 1)) * plot_w
                y = margin_top + plot_h - (val / grid_max * plot_h if grid_max > 0 else 0)
                svg.append(
                    f'<circle cx="{x}" cy="{y}" r="5" fill="white" stroke="{input.color}" stroke-width="2" />'  # noqa: E501
                )
                svg.append(
                    f'<text x="{x}" y="{margin_top + plot_h + 20}" font-family="sans-serif" font-size="12" fill="#6b7280" text-anchor="middle">{label}</text>'  # noqa: E501
                )

        # X/Y axis lines
        svg.append(
            f'<line x1="{margin_left}" y1="{margin_top + plot_h}" x2="{margin_left + plot_w}" y2="{margin_top + plot_h}" stroke="#4b5563" stroke-width="2" />'  # noqa: E501
        )
        svg.append(
            f'<line x1="{margin_left}" y1="{margin_top}" x2="{margin_left}" y2="{margin_top + plot_h}" stroke="#4b5563" stroke-width="2" />'  # noqa: E501
        )

        if input.y_label:
            y_label_x = margin_left / 3
            y_label_y = margin_top + (plot_h / 2)
            svg.append(
                f'<text x="{y_label_x}" y="{y_label_y}" font-family="sans-serif" font-size="14" font-weight="bold" fill="#4b5563" text-anchor="middle" transform="rotate(-90 {y_label_x} {y_label_y})">{input.y_label}</text>'  # noqa: E501
            )

        if input.x_label:
            x_label_x = margin_left + (plot_w / 2)
            x_label_y = margin_top + plot_h + 50
            svg.append(
                f'<text x="{x_label_x}" y="{x_label_y}" font-family="sans-serif" font-size="14" font-weight="bold" fill="#4b5563" text-anchor="middle">{input.x_label}</text>'  # noqa: E501
            )

        if input.title:
            # Add a legend if title is provided
            leg_x = margin_left + plot_w - 100
            leg_y = margin_top - 20
            svg.append(
                f'<rect x="{leg_x}" y="{leg_y - 10}" width="16" height="16" fill="{input.color}" rx="2" />'  # noqa: E501
            )
            svg.append(
                f'<text x="{leg_x + 24}" y="{leg_y + 3}" font-family="sans-serif" font-size="12" fill="#4b5563">{input.title} Data</text>'  # noqa: E501
            )

        svg.append("</svg>")
        return LineChartOutput(svg="\n".join(svg), point_count=n, max_value=max_v, min_value=min_v)
