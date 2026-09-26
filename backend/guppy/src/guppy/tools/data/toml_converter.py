"""TOML Converter — convert between TOML and JSON."""

from __future__ import annotations

import json
import tomllib
from typing import Literal

from pydantic import BaseModel, Field

from guppy.core.types import ArtifactType, ToolCategory
from guppy.tools.base import BaseTool, NoConfig


class Input(BaseModel):
    content: str = Field(description="TOML or JSON content to convert")
    direction: Literal["toml_to_json", "json_to_toml"] = Field(
        default="toml_to_json", description="Conversion direction"
    )
    indent: int = Field(default=2, ge=0, le=8)


class Output(BaseModel):
    result: str
    key_count: int
    is_valid: bool
    error: str | None = None


class TomlConverterTool(BaseTool):
    name = "toml-converter"
    version = "1.0.0"
    category = ToolCategory.DATA
    description = "Convert between TOML and JSON formats."
    tags = ["toml", "json", "convert", "config", "data"]  # noqa: RUF012
    output_artifact_type = ArtifactType.TEXT
    input_artifact_types = []  # noqa: RUF012
    input_schema = Input
    output_schema = Output
    config_schema = NoConfig
    icon = "file-json-2"

    async def execute(self, input: Input, config: NoConfig) -> Output:
        try:
            if input.direction == "toml_to_json":
                if tomllib is None:
                    return Output(
                        result="",
                        key_count=0,
                        is_valid=False,
                        error="tomllib not available (requires Python 3.11+)",
                    )
                data = tomllib.loads(input.content)
                result = json.dumps(data, indent=input.indent, default=str)
                return Output(result=result, key_count=len(data), is_valid=True)
            else:  # json_to_toml
                data = json.loads(input.content)
                result = self._dict_to_toml(data)
                return Output(result=result, key_count=len(data), is_valid=True)
        except Exception as e:
            return Output(result="", key_count=0, is_valid=False, error=str(e))

    def _dict_to_toml(self, data: dict, prefix: str = "") -> str:
        """Simple dict-to-TOML serializer (no arrays of tables)."""
        lines: list[str] = []
        tables: list[tuple[str, dict]] = []
        for k, v in data.items():
            key = f"{prefix}.{k}" if prefix else k
            if isinstance(v, dict):
                tables.append((key, v))
            elif isinstance(v, bool):
                lines.append(f"{k} = {str(v).lower()}")
            elif isinstance(v, (int, float)):
                lines.append(f"{k} = {v}")
            elif isinstance(v, str):
                escaped = v.replace("\\", "\\\\").replace('"', '\\"')
                lines.append(f'{k} = "{escaped}"')
            elif isinstance(v, list):
                lines.append(f"{k} = {json.dumps(v)}")
            else:
                lines.append(f'{k} = "{v}"')
        result = "\n".join(lines)
        for table_key, table_val in tables:
            result += f"\n\n[{table_key}]\n" + self._dict_to_toml(table_val)
        return result
