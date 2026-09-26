"""ENV Parser — parse .env files and convert to JSON/shell exports."""

from __future__ import annotations

import re
from typing import Literal

from pydantic import BaseModel, Field

from guppy.core.types import ArtifactType, ToolCategory
from guppy.tools.base import BaseTool, NoConfig


class Input(BaseModel):
    env_content: str = Field(description="Contents of a .env file")
    output_format: Literal["json", "shell", "both"] = Field(default="json")
    include_comments: bool = Field(default=False, description="Include comment lines in output")
    mask_values: bool = Field(default=False, description="Mask all values with ***")


class Output(BaseModel):
    variables: dict[str, str]
    json_output: str | None = None
    shell_output: str | None = None
    variable_count: int
    comment_count: int
    empty_line_count: int


class EnvParserTool(BaseTool):
    name = "env-parser"
    version = "1.0.0"
    category = ToolCategory.DEVELOPER
    description = "Parse .env files and convert to JSON or shell export statements."
    tags = ["env", "dotenv", "parse", "config", "developer"]  # noqa: RUF012
    output_artifact_type = ArtifactType.JSON
    input_artifact_types = []  # noqa: RUF012
    input_schema = Input
    output_schema = Output
    config_schema = NoConfig
    icon = "file-code-2"

    async def execute(self, input: Input, config: NoConfig) -> Output:
        import json as json_lib

        variables: dict[str, str] = {}
        comment_count = 0
        empty_line_count = 0

        for line in input.env_content.splitlines():
            stripped = line.strip()
            if not stripped:
                empty_line_count += 1
                continue
            if stripped.startswith("#"):
                comment_count += 1
                continue
            # Match KEY=VALUE or KEY="VALUE" or KEY='VALUE'
            m = re.match(r"^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$", stripped)
            if m:
                key = m.group(1)
                val = m.group(2).strip()
                # Strip surrounding quotes
                if len(val) >= 2 and val[0] == val[-1] and val[0] in ('"', "'"):
                    val = val[1:-1]
                # Handle escaped characters in double-quoted values
                val = val.replace("\\n", "\n").replace("\\t", "\t")
                variables[key] = val

        display_vars = {k: "***" if input.mask_values else v for k, v in variables.items()}

        json_out = None
        shell_out = None
        if input.output_format in ("json", "both"):
            json_out = json_lib.dumps(display_vars, indent=2)
        if input.output_format in ("shell", "both"):
            lines = [f'export {k}="{v}"' for k, v in display_vars.items()]
            shell_out = "\n".join(lines)

        return Output(
            variables=display_vars,
            json_output=json_out,
            shell_output=shell_out,
            variable_count=len(variables),
            comment_count=comment_count,
            empty_line_count=empty_line_count,
        )
