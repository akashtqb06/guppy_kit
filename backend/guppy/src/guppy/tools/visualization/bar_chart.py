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
    x_label: str = ""
    y_label: str = ""
    show_values: bool = True


class BarChartOutput(BaseModel):
    svg: str
    bar_count: int
    max_value: float
    min_value: float


class BarChartTool(BaseTool[BarChartInput, NoConfig, BarChartOutput]):
    name = "bar-chart"
    version = "1.0.0"
    category = ToolCategory.VISUALIZATION
    description = (
        "Render a polished bar chart as an SVG with grid lines, axis labels, and value annotations."
    )
    tags = ["visualization", "utility", "chart", "bar"]  # noqa: RUF012
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

        # Defs for shadow
        svg_parts.append("<defs>")
        svg_parts.append('<filter id="drop-shadow" x="-20%" y="-20%" width="140%" height="140%">')
        svg_parts.append('<feDropShadow dx="2" dy="2" stdDeviation="3" flood-opacity="0.15" />')
        svg_parts.append("</filter>")
        svg_parts.append("</defs>")

        svg_parts.append(f'<rect width="{input.width}" height="{input.height}" fill="white" />')

        if input.title:
            svg_parts.append(
                f'<text x="{input.width / 2}" y="30" font-family="sans-serif" font-size="20" font-weight="bold" text-anchor="middle" fill="#1f2937">{input.title}</text>'  # noqa: E501
            )

        margin_left = 80
        margin_right = 40
        margin_top = 60
        margin_bottom = 80

        plot_width = input.width - margin_left - margin_right
        plot_height = input.height - margin_top - margin_bottom

        max_val = max(input.values) if input.values else 0
        min_val = min(input.values) if input.values else 0
        # Round max_val up to something nice, or just use max_val
        grid_max = max_val if max_val > 0 else 1

        n = len(input.values)

        # Y-axis grid lines (5 lines)
        for i in range(5):
            y_ratio = i / 4
            val = grid_max * (1 - y_ratio)
            y_pos = margin_top + (y_ratio * plot_height)

            # Grid line
            svg_parts.append(
                f'<line x1="{margin_left}" y1="{y_pos}" x2="{margin_left + plot_width}" y2="{y_pos}" stroke="#e5e7eb" stroke-dasharray="4" />'  # noqa: E501
            )
            # Y-axis label / tick mark
            svg_parts.append(
                f'<line x1="{margin_left - 5}" y1="{y_pos}" x2="{margin_left}" y2="{y_pos}" stroke="#9ca3af" />'  # noqa: E501
            )
            svg_parts.append(
                f'<text x="{margin_left - 10}" y="{y_pos + 4}" font-family="sans-serif" font-size="12" fill="#6b7280" text-anchor="end">{val:.1f}</text>'  # noqa: E501
            )

        if input.y_label:
            y_label_x = margin_left / 3
            y_label_y = margin_top + (plot_height / 2)
            svg_parts.append(
                f'<text x="{y_label_x}" y="{y_label_y}" font-family="sans-serif" font-size="14" font-weight="bold" fill="#4b5563" text-anchor="middle" transform="rotate(-90 {y_label_x} {y_label_y})">{input.y_label}</text>'  # noqa: E501
            )

        if n > 0:
            bar_width = (plot_width / n) * 0.7
            bar_spacing = plot_width / n

            for i, (label, val) in enumerate(zip(input.labels, input.values, strict=False)):
                x = margin_left + i * bar_spacing + (bar_spacing - bar_width) / 2
                h = (val / grid_max) * plot_height if grid_max > 0 else 0
                y = margin_top + plot_height - h

                # Bar
                svg_parts.append(
                    f'<rect x="{x}" y="{y}" width="{bar_width}" height="{h}" fill="{input.color}" rx="4" filter="url(#drop-shadow)" />'  # noqa: E501
                )

                # Tick mark for X axis
                tick_x = margin_left + i * bar_spacing + (bar_spacing / 2)
                svg_parts.append(
                    f'<line x1="{tick_x}" y1="{margin_top + plot_height}" x2="{tick_x}" y2="{margin_top + plot_height + 5}" stroke="#9ca3af" />'  # noqa: E501
                )

                # X-axis label
                svg_parts.append(
                    f'<text x="{tick_x}" y="{margin_top + plot_height + 20}" font-family="sans-serif" font-size="12" fill="#6b7280" text-anchor="middle">{label}</text>'  # noqa: E501
                )

                # Value label
                if input.show_values:
                    svg_parts.append(
                        f'<text x="{tick_x}" y="{y - 8}" font-family="sans-serif" font-size="12" font-weight="bold" fill="{input.color}" text-anchor="middle">{val}</text>'  # noqa: E501
                    )

        # X/Y axis main lines
        svg_parts.append(
            f'<line x1="{margin_left}" y1="{margin_top + plot_height}" x2="{margin_left + plot_width}" y2="{margin_top + plot_height}" stroke="#4b5563" stroke-width="2" />'  # noqa: E501
        )
        svg_parts.append(
            f'<line x1="{margin_left}" y1="{margin_top}" x2="{margin_left}" y2="{margin_top + plot_height}" stroke="#4b5563" stroke-width="2" />'  # noqa: E501
        )

        if input.x_label:
            x_label_x = margin_left + (plot_width / 2)
            x_label_y = margin_top + plot_height + 50
            svg_parts.append(
                f'<text x="{x_label_x}" y="{x_label_y}" font-family="sans-serif" font-size="14" font-weight="bold" fill="#4b5563" text-anchor="middle">{input.x_label}</text>'  # noqa: E501
            )

        svg_parts.append("</svg>")

        return BarChartOutput(
            svg="\n".join(svg_parts), bar_count=n, max_value=max_val, min_value=min_val
        )
