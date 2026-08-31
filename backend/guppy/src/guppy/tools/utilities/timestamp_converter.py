from __future__ import annotations

import datetime
import email.utils
from typing import Literal

from pydantic import BaseModel

from guppy.core.types import ArtifactType, ToolCategory
from guppy.tools.base import BaseTool, NoConfig


class TimestampConverterInput(BaseModel):
    value: str
    from_format: Literal["unix", "iso8601", "rfc2822"] = "unix"


class TimestampConverterOutput(BaseModel):
    unix: int
    iso8601: str
    rfc2822: str
    utc: str
    human: str


class TimestampConverterTool(BaseTool[TimestampConverterInput, NoConfig, TimestampConverterOutput]):
    name = "timestamp-converter"
    version = "1.0.0"
    category = ToolCategory.UTILITIES
    icon = "⏱️"
    description = "Convert timestamps."
    tags = ["timestamp", "utilities", "converter"]  # noqa: RUF012
    input_artifact_types = []  # noqa: RUF012
    output_artifact_type = ArtifactType.JSON

    input_schema = TimestampConverterInput
    output_schema = TimestampConverterOutput
    config_schema = NoConfig

    async def execute(
        self, input: TimestampConverterInput, config: NoConfig
    ) -> TimestampConverterOutput:
        dt = None
        if input.from_format == "unix":
            dt = datetime.datetime.fromtimestamp(float(input.value), tz=datetime.UTC)
        elif input.from_format == "iso8601":
            dt = datetime.datetime.fromisoformat(input.value.replace("Z", "+00:00"))
        elif input.from_format == "rfc2822":
            parsed = email.utils.parsedate_to_datetime(input.value)
            dt = parsed.astimezone(datetime.UTC)

        return TimestampConverterOutput(
            unix=int(dt.timestamp()),
            iso8601=dt.isoformat(),
            rfc2822=email.utils.format_datetime(dt),
            utc=dt.astimezone(datetime.UTC).isoformat(),
            human=dt.strftime("%Y-%m-%d %H:%M:%S %Z"),
        )
