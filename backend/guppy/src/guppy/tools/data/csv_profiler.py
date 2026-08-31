from __future__ import annotations

import csv
from io import StringIO

from pydantic import BaseModel, Field

from guppy.core.types import ArtifactType, ToolCategory
from guppy.tools.base import BaseTool, NoConfig


class CsvProfilerInput(BaseModel):
    csv_content: str
    delimiter: str = ","
    sample_rows: int = Field(default=100, ge=10, le=10000)


class CsvProfilerOutput(BaseModel):
    row_count: int
    column_count: int
    columns: list[dict]


class CsvProfilerTool(BaseTool[CsvProfilerInput, NoConfig, CsvProfilerOutput]):
    name = "csv-profiler"
    version = "1.0.0"
    category = ToolCategory.DATA
    description = "A standard tool implementation."
    tags = ["data", "utility"]  # noqa: RUF012
    input_artifact_types = []  # noqa: RUF012
    output_artifact_type = ArtifactType.JSON
    icon = "🔬"

    input_schema = CsvProfilerInput
    output_schema = CsvProfilerOutput
    config_schema = NoConfig

    async def execute(self, input: CsvProfilerInput, config: NoConfig) -> CsvProfilerOutput:
        reader = csv.reader(StringIO(input.csv_content), delimiter=input.delimiter)
        rows = list(reader)
        if not rows:
            return CsvProfilerOutput(row_count=0, column_count=0, columns=[])

        headers = rows[0]
        data_rows = rows[1:]

        columns = []
        for i, header in enumerate(headers):
            col_data = [row[i] for row in data_rows if i < len(row)]
            unique_vals = list(set(col_data))
            non_null = [v for v in col_data if v.strip()]
            null_count = len(col_data) - len(non_null)

            col_info = {
                "name": header,
                "type_guess": "string",
                "null_count": null_count,
                "unique_count": len(unique_vals),
                "min_value": min(non_null) if non_null else None,
                "max_value": max(non_null) if non_null else None,
                "sample_values": list(set(non_null))[:3],
            }
            # simple type guess
            if non_null:
                try:
                    [int(v) for v in non_null]
                    col_info["type_guess"] = "integer"
                except Exception:
                    try:
                        [float(v) for v in non_null]
                        col_info["type_guess"] = "float"
                    except Exception:
                        pass

            columns.append(col_info)

        return CsvProfilerOutput(
            row_count=len(data_rows), column_count=len(headers), columns=columns
        )
