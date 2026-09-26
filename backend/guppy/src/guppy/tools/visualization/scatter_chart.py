"""Scatter Chart — generate an SVG scatter plot."""

from __future__ import annotations

from pydantic import BaseModel, Field

from guppy.core.types import ArtifactType, ToolCategory
from guppy.tools.base import BaseTool, NoConfig


class DataPoint(BaseModel):
    x: float
    y: float
    label: str = ""


class Input(BaseModel):
    points: list[DataPoint] = Field(description="List of x,y data points", min_length=1)
    title: str = Field(default="", description="Chart title")
    x_label: str = Field(default="X", description="X axis label")
    y_label: str = Field(default="Y", description="Y axis label")
    color: str = Field(default="#6366f1", description="Point color (hex)")
    point_size: int = Field(default=6, ge=2, le=20, description="Point radius in px")
    width: int = Field(default=800, ge=400, le=1600)
    height: int = Field(default=500, ge=200, le=1000)
    show_grid: bool = Field(default=True)


class Output(BaseModel):
    svg: str
    point_count: int
    x_min: float
    x_max: float
    y_min: float
    y_max: float


class ScatterChartTool(BaseTool):
    name = "scatter-chart"
    version = "1.0.0"
    category = ToolCategory.VISUALIZATION
    description = "Generate an SVG scatter plot from x/y data points."
    tags = ["scatter", "chart", "plot", "visualization", "svg"]  # noqa: RUF012
    output_artifact_type = ArtifactType.SVG
    input_artifact_types = []  # noqa: RUF012
    input_schema = Input
    output_schema = Output
    config_schema = NoConfig
    icon = "scatter-chart"

    async def execute(self, input: Input, config: NoConfig) -> Output:
        points = input.points
        xs = [p.x for p in points]
        ys = [p.y for p in points]
        x_min, x_max = min(xs), max(xs)
        y_min, y_max = min(ys), max(ys)

        W, H = input.width, input.height
        pad_l, pad_r, pad_t, pad_b = 70, 30, 40, 60
        plot_w = W - pad_l - pad_r
        plot_h = H - pad_t - pad_b

        x_range = x_max - x_min if x_max != x_min else 1
        y_range = y_max - y_min if y_max != y_min else 1

        def to_px(x, y):
            px = pad_l + (x - x_min) / x_range * plot_w
            py = pad_t + plot_h - (y - y_min) / y_range * plot_h
            return px, py

        svg_parts = []
        svg_parts.append(
            f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" font-family="system-ui,sans-serif">'  # noqa: E501
        )
        svg_parts.append(f'<rect width="{W}" height="{H}" fill="white" rx="8"/>')

        # Title
        if input.title:
            svg_parts.append(
                f'<text x="{W // 2}" y="{pad_t - 10}" text-anchor="middle" font-size="14" font-weight="bold" fill="#111">{input.title}</text>'  # noqa: E501
            )

        # Grid
        if input.show_grid:
            for i in range(5):
                gy = pad_t + i * plot_h // 4
                svg_parts.append(
                    f'<line x1="{pad_l}" y1="{gy}" x2="{pad_l + plot_w}" y2="{gy}" stroke="#e5e7eb" stroke-width="1"/>'  # noqa: E501
                )
                gx = pad_l + i * plot_w // 4
                svg_parts.append(
                    f'<line x1="{gx}" y1="{pad_t}" x2="{gx}" y2="{pad_t + plot_h}" stroke="#e5e7eb" stroke-width="1"/>'  # noqa: E501
                )

        # Axes
        svg_parts.append(
            f'<line x1="{pad_l}" y1="{pad_t}" x2="{pad_l}" y2="{pad_t + plot_h}" stroke="#9ca3af" stroke-width="1.5"/>'  # noqa: E501
        )
        svg_parts.append(
            f'<line x1="{pad_l}" y1="{pad_t + plot_h}" x2="{pad_l + plot_w}" y2="{pad_t + plot_h}" stroke="#9ca3af" stroke-width="1.5"/>'  # noqa: E501
        )

        # Axis labels
        svg_parts.append(
            f'<text x="{W // 2}" y="{H - 8}" text-anchor="middle" font-size="12" fill="#6b7280">{input.x_label}</text>'  # noqa: E501
        )
        svg_parts.append(
            f'<text x="14" y="{H // 2}" text-anchor="middle" font-size="12" fill="#6b7280" transform="rotate(-90,14,{H // 2})">{input.y_label}</text>'  # noqa: E501
        )

        # Axis tick labels (5 ticks each)
        for i in range(5):
            xv = x_min + i * x_range / 4
            px = pad_l + i * plot_w // 4
            svg_parts.append(
                f'<text x="{px}" y="{pad_t + plot_h + 16}" text-anchor="middle" font-size="10" fill="#6b7280">{xv:.2g}</text>'  # noqa: E501
            )
            yv = y_min + (4 - i) * y_range / 4
            py = pad_t + i * plot_h // 4
            svg_parts.append(
                f'<text x="{pad_l - 8}" y="{py + 4}" text-anchor="end" font-size="10" fill="#6b7280">{yv:.2g}</text>'  # noqa: E501
            )

        # Points
        r = input.point_size
        for p in points:
            px, py = to_px(p.x, p.y)
            svg_parts.append(
                f'<circle cx="{px:.1f}" cy="{py:.1f}" r="{r}" fill="{input.color}" opacity="0.8" stroke="white" stroke-width="1.5"/>'  # noqa: E501
            )
            if p.label:
                svg_parts.append(
                    f'<text x="{px + r + 2:.1f}" y="{py + 4:.1f}" font-size="10" fill="#374151">{p.label}</text>'  # noqa: E501
                )

        svg_parts.append("</svg>")

        return Output(
            svg="".join(svg_parts),
            point_count=len(points),
            x_min=x_min,
            x_max=x_max,
            y_min=y_min,
            y_max=y_max,
        )
