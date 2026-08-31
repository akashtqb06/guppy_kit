from __future__ import annotations

import csv
import io
import json

from pydantic import BaseModel

from guppy.core.types import ArtifactType, ToolCategory
from guppy.tools.base import BaseTool, NoConfig


class JsonToCsvInput(BaseModel):
    json_content: str
    delimiter: str = ","


class JsonToCsvOutput(BaseModel):
    csv_content: str
    row_count: int
    column_count: int


class JsonToCsvTool(BaseTool[JsonToCsvInput, NoConfig, JsonToCsvOutput]):
    name = "json-to-csv"
    version = "1.0.0"
    category = ToolCategory.DATA
    icon = "📋"
    description = "Convert JSON to CSV."
    tags = ["json", "data", "converter"]  # noqa: RUF012
    input_artifact_types = []  # noqa: RUF012
    output_artifact_type = ArtifactType.CSV

    input_schema = JsonToCsvInput
    output_schema = JsonToCsvOutput
    config_schema = NoConfig

    async def execute(self, input: JsonToCsvInput, config: NoConfig) -> JsonToCsvOutput:
        data = json.loads(input.json_content)
        if not isinstance(data, list) or not all(isinstance(x, dict) for x in data):
            raise ValueError("JSON must be a list of objects.")

        f = io.StringIO()
        if not data:
            return JsonToCsvOutput(csv_content="", row_count=0, column_count=0)

        columns = list(data[0].keys())
        writer = csv.DictWriter(f, fieldnames=columns, delimiter=input.delimiter)
        writer.writeheader()
        writer.writerows(data)

        return JsonToCsvOutput(
            csv_content=f.getvalue(), row_count=len(data), column_count=len(columns)
        )
