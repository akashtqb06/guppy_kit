"""Number Base Converter — convert numbers between bases."""

from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field

from guppy.core.types import ArtifactType, ToolCategory
from guppy.tools.base import BaseTool, NoConfig


class Input(BaseModel):
    value: str = Field(description="Number to convert (e.g. 255, 0xFF, 0b11111111, 0o377)")
    from_base: Literal["auto", "2", "8", "10", "16"] = Field(
        default="auto", description="Source base (auto-detects 0x/0b/0o prefixes)"
    )


class Output(BaseModel):
    decimal: str
    binary: str
    octal: str
    hexadecimal: str
    hex_upper: str
    bit_length: int
    is_negative: bool
    is_valid: bool
    error: str | None = None


class NumberBaseConverterTool(BaseTool):
    name = "number-base-converter"
    version = "1.0.0"
    category = ToolCategory.DEVELOPER
    description = "Convert integers between decimal, binary, octal, and hexadecimal."
    tags = ["number", "binary", "hex", "base", "convert", "developer"]  # noqa: RUF012
    output_artifact_type = ArtifactType.JSON
    input_artifact_types = []  # noqa: RUF012
    input_schema = Input
    output_schema = Output
    config_schema = NoConfig
    icon = "binary"

    async def execute(self, input: Input, config: NoConfig) -> Output:
        try:
            val = input.value.strip()
            if input.from_base == "auto":
                if val.lower().startswith("0x") or val.lower().startswith("-0x"):
                    n = int(val, 16)
                elif val.lower().startswith("0b") or val.lower().startswith("-0b"):
                    n = int(val, 2)
                elif val.lower().startswith("0o") or val.lower().startswith("-0o"):
                    n = int(val, 8)
                else:
                    n = int(val, 10)
            else:
                n = int(val, int(input.from_base))

            return Output(
                decimal=str(n),
                binary=bin(n),
                octal=oct(n),
                hexadecimal=hex(n),
                hex_upper=hex(n).upper().replace("0X", "0x"),
                bit_length=n.bit_length() if n >= 0 else (n + 1).bit_length() + 1,
                is_negative=n < 0,
                is_valid=True,
            )
        except (ValueError, TypeError) as e:
            return Output(
                decimal="",
                binary="",
                octal="",
                hexadecimal="",
                hex_upper="",
                bit_length=0,
                is_negative=False,
                is_valid=False,
                error=str(e),
            )
