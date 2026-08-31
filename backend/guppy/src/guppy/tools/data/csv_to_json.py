from __future__ import annotations

import csv
import io

from pydantic import BaseModel

from guppy.core.types import ArtifactType, ToolCategory
from guppy.tools.base import BaseTool, NoConfig


class CsvToJsonInput(BaseModel):
    csv_content: str
    delimiter: str = ","
    has_header: bool = True


class CsvToJsonOutput(BaseModel):
    json_data: list[dict]
    row_count: int
    column_count: int
    columns: list[str]


class CsvToJsonTool(BaseTool[CsvToJsonInput, NoConfig, CsvToJsonOutput]):
    name = "csv-to-json"
    version = "1.0.0"
    category = ToolCategory.DATA
    icon = "📊"
    description = "Convert CSV to JSON."
    tags = ["csv", "data", "converter"]  # noqa: RUF012
    input_artifact_types = []  # noqa: RUF012
    output_artifact_type = ArtifactType.JSON

    input_schema = CsvToJsonInput
    output_schema = CsvToJsonOutput
    config_schema = NoConfig

    async def execute(self, input: CsvToJsonInput, config: NoConfig) -> CsvToJsonOutput:
        f = io.StringIO(input.csv_content)
        if input.has_header:
            reader = csv.DictReader(f, delimiter=input.delimiter)
            data = list(reader)
            columns = list(reader.fieldnames or [])
            row_count = len(data)
            return CsvToJsonOutput(
                json_data=data, row_count=row_count, column_count=len(columns), columns=columns
            )
        else:
            reader = csv.reader(f, delimiter=input.delimiter)
            data = []
            columns = []
            for row in reader:
                if not columns:
                    columns = [f"col_{i}" for i in range(len(row))]
                data.append(dict(zip(columns, row, strict=False)))
            return CsvToJsonOutput(
                json_data=data, row_count=len(data), column_count=len(columns), columns=columns
            )
