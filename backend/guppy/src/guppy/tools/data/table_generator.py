"""Table Generator — convert JSON array to Markdown/HTML table."""

from __future__ import annotations

import json
from typing import Literal

from pydantic import BaseModel, Field

from guppy.core.types import ArtifactType, ToolCategory
from guppy.tools.base import BaseTool, NoConfig


class Input(BaseModel):
    json_data: str = Field(description="JSON array of objects to convert to table")
    output_format: Literal["markdown", "html", "both"] = Field(default="markdown")
    include_index: bool = Field(default=False, description="Include row index column")
    max_cell_length: int = Field(
        default=100, ge=10, le=500, description="Truncate cell values longer than this"
    )
    html_striped: bool = Field(default=True, description="Add alternating row colors to HTML")


class Output(BaseModel):
    markdown: str | None = None
    html: str | None = None
    row_count: int
    column_count: int
    columns: list[str]
    is_valid: bool
    error: str | None = None


class TableGeneratorTool(BaseTool):
    name = "table-generator"
    version = "1.0.0"
    category = ToolCategory.DATA
    description = "Convert a JSON array to a Markdown or HTML table."
    tags = ["table", "json", "markdown", "html", "convert", "data"]  # noqa: RUF012
    output_artifact_type = ArtifactType.MARKDOWN
    input_artifact_types = []  # noqa: RUF012
    input_schema = Input
    output_schema = Output
    config_schema = NoConfig
    icon = "table"

    async def execute(self, input: Input, config: NoConfig) -> Output:
        try:
            data = json.loads(input.json_data)
        except json.JSONDecodeError as e:
            return Output(row_count=0, column_count=0, columns=[], is_valid=False, error=str(e))

        if not isinstance(data, list) or not data:
            return Output(
                row_count=0,
                column_count=0,
                columns=[],
                is_valid=False,
                error="Input must be a non-empty JSON array",
            )

        # Collect all columns across all rows
        columns: list[str] = []
        for row in data:
            if isinstance(row, dict):
                for k in row:
                    if k not in columns:
                        columns.append(k)

        def cell(val) -> str:
            s = str(val) if val is not None else ""
            if len(s) > input.max_cell_length:
                s = s[: input.max_cell_length] + "…"
            return s

        markdown_out = None
        html_out = None

        if input.output_format in ("markdown", "both"):
            all_cols = (["#"] if input.include_index else []) + columns
            lines = [
                "| " + " | ".join(all_cols) + " |",
                "| " + " | ".join("---" for _ in all_cols) + " |",
            ]
            for i, row in enumerate(data):
                cells = [str(i + 1)] if input.include_index else []
                cells += [
                    cell(row.get(c, "")) if isinstance(row, dict) else cell(row) for c in columns
                ]
                lines.append("| " + " | ".join(cells) + " |")
            markdown_out = "\n".join(lines)

        if input.output_format in ("html", "both"):
            style = 'style="border-collapse:collapse;width:100%;font-family:system-ui,sans-serif;font-size:14px"'  # noqa: E501
            th_style = 'style="border:1px solid #e5e7eb;padding:8px 12px;background:#f9fafb;font-weight:600;text-align:left"'  # noqa: E501
            rows_html = []
            for i, row in enumerate(data):
                bg = ' style="background:#f9fafb"' if input.html_striped and i % 2 == 1 else ""
                cells_html = ""
                if input.include_index:
                    cells_html += f'<td style="border:1px solid #e5e7eb;padding:8px 12px;color:#6b7280">{i + 1}</td>'  # noqa: E501
                for c in columns:
                    val = cell(row.get(c, "") if isinstance(row, dict) else row)
                    cells_html += (
                        f'<td style="border:1px solid #e5e7eb;padding:8px 12px">{val}</td>'
                    )
                rows_html.append(f"<tr{bg}>{cells_html}</tr>")
            headers = ("<th " + th_style + ">#</th>" if input.include_index else "") + "".join(
                f"<th {th_style}>{c}</th>" for c in columns
            )
            html_out = f"<table {style}><thead><tr>{headers}</tr></thead><tbody>{''.join(rows_html)}</tbody></table>"  # noqa: E501

        return Output(
            markdown=markdown_out,
            html=html_out,
            row_count=len(data),
            column_count=len(columns),
            columns=columns,
            is_valid=True,
        )
