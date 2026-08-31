from __future__ import annotations

import base64
from io import BytesIO

import openpyxl
from pydantic import BaseModel

from guppy.core.types import ArtifactType, ToolCategory
from guppy.tools.base import BaseTool, NoConfig


class ExcelToJsonInput(BaseModel):
    excel_base64: str
    sheet_name: str = ""


class ExcelToJsonOutput(BaseModel):
    sheets: list[dict]
    sheet_count: int


class ExcelToJsonTool(BaseTool[ExcelToJsonInput, NoConfig, ExcelToJsonOutput]):
    name = "excel-to-json"
    version = "1.0.0"
    category = ToolCategory.DATA
    description = "A standard tool implementation."
    tags = ["data", "utility"]  # noqa: RUF012
    input_artifact_types = []  # noqa: RUF012
    output_artifact_type = ArtifactType.JSON
    icon = "📗"

    input_schema = ExcelToJsonInput
    output_schema = ExcelToJsonOutput
    config_schema = NoConfig

    async def execute(self, input: ExcelToJsonInput, config: NoConfig) -> ExcelToJsonOutput:
        data = base64.b64decode(input.excel_base64)
        wb = openpyxl.load_workbook(BytesIO(data), data_only=True)
        sheets = []
        for sheet in wb.worksheets:
            if input.sheet_name and sheet.title != input.sheet_name:
                continue

            rows = list(sheet.iter_rows(values_only=True))
            if not rows:
                continue

            headers = [str(c) if c else f"col_{i}" for i, c in enumerate(rows[0])]
            sheet_data = []
            for row in rows[1:]:
                row_dict = {}
                for i, val in enumerate(row):
                    if i < len(headers):
                        row_dict[headers[i]] = val
                sheet_data.append(row_dict)

            sheets.append(
                {
                    "name": sheet.title,
                    "data": sheet_data,
                    "row_count": len(sheet_data),
                    "column_count": len(headers),
                }
            )

        return ExcelToJsonOutput(sheets=sheets, sheet_count=len(sheets))
