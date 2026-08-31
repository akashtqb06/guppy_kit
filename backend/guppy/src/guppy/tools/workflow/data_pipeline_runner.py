from __future__ import annotations

import csv
import io

from pydantic import BaseModel

from guppy.core.types import ArtifactType, ToolCategory
from guppy.tools.base import BaseTool, NoConfig


class DataPipelineRunnerInput(BaseModel):
    csv_content: str
    delimiter: str = ","
    has_header: bool = True
    filter_column: str | None = None
    filter_value: str | None = None
    sort_column: str | None = None
    sort_ascending: bool = True
    limit: int | None = None


class DataPipelineRunnerOutput(BaseModel):
    json_data: list[dict]
    original_row_count: int
    filtered_row_count: int
    columns: list[str]
    steps_applied: list[str]


class DataPipelineRunnerTool(BaseTool[DataPipelineRunnerInput, NoConfig, DataPipelineRunnerOutput]):
    name = "data-pipeline-runner"
    version = "1.0.0"
    category = ToolCategory.WORKFLOW
    description = "Run a CSV data pipeline: parse, filter, sort, and limit rows — all in one step."
    tags = ["workflow", "data", "pipeline", "csv"]  # noqa: RUF012
    input_artifact_types = []  # noqa: RUF012
    output_artifact_type = ArtifactType.JSON
    icon = "⚙️"

    input_schema = DataPipelineRunnerInput
    output_schema = DataPipelineRunnerOutput
    config_schema = NoConfig

    async def execute(
        self, input: DataPipelineRunnerInput, config: NoConfig
    ) -> DataPipelineRunnerOutput:
        steps_applied = ["Parsed CSV"]

        f = io.StringIO(input.csv_content.strip())
        reader = csv.reader(f, delimiter=input.delimiter)

        rows = list(reader)
        if not rows:
            return DataPipelineRunnerOutput(
                json_data=[],
                original_row_count=0,
                filtered_row_count=0,
                columns=[],
                steps_applied=steps_applied,
            )

        if input.has_header:
            columns = rows[0]
            data_rows = rows[1:]
        else:
            columns = [f"col_{i}" for i in range(len(rows[0]))]
            data_rows = rows

        original_count = len(data_rows)

        # Convert to list of dicts
        data = [dict(zip(columns, row, strict=False)) for row in data_rows]

        # Filter
        if input.filter_column and input.filter_value is not None:
            if input.filter_column in columns:
                data = [row for row in data if row.get(input.filter_column) == input.filter_value]
                steps_applied.append(
                    f"Filtered where {input.filter_column} == '{input.filter_value}'"
                )
            else:
                steps_applied.append(f"Filter ignored: column '{input.filter_column}' not found")

        # Sort
        if input.sort_column:
            if input.sort_column in columns:
                # Try to sort numerically if possible, otherwise string
                def sort_key(x):
                    val = x.get(input.sort_column, "")
                    try:
                        return (0, float(val))
                    except ValueError:
                        return (1, val)

                data.sort(key=sort_key, reverse=not input.sort_ascending)
                direction = "ASC" if input.sort_ascending else "DESC"
                steps_applied.append(f"Sorted by {input.sort_column} {direction}")
            else:
                steps_applied.append(f"Sort ignored: column '{input.sort_column}' not found")

        # Limit
        if input.limit is not None and input.limit >= 0:
            data = data[: input.limit]
            steps_applied.append(f"Limited to {input.limit} rows")

        return DataPipelineRunnerOutput(
            json_data=data,
            original_row_count=original_count,
            filtered_row_count=len(data),
            columns=columns,
            steps_applied=steps_applied,
        )
