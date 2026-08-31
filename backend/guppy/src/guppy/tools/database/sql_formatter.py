from __future__ import annotations

from typing import Literal

import sqlparse
from pydantic import BaseModel

from guppy.core.types import ArtifactType, ToolCategory
from guppy.tools.base import BaseTool, NoConfig


class SqlFormatterInput(BaseModel):
    sql: str
    dialect: Literal["generic", "postgresql", "mysql", "sqlite"] = "generic"
    uppercase_keywords: bool = True
    indent_width: int = 2


class SqlFormatterOutput(BaseModel):
    formatted: str
    statement_count: int


class SqlFormatterTool(BaseTool[SqlFormatterInput, NoConfig, SqlFormatterOutput]):
    name = "sql-formatter"
    version = "1.0.0"
    category = ToolCategory.DATABASE
    description = "A standard tool implementation."
    tags = ["database", "utility"]  # noqa: RUF012
    input_artifact_types = []  # noqa: RUF012
    output_artifact_type = ArtifactType.SQL
    icon = "🗄️"

    input_schema = SqlFormatterInput
    output_schema = SqlFormatterOutput
    config_schema = NoConfig

    async def execute(self, input: SqlFormatterInput, config: NoConfig) -> SqlFormatterOutput:
        kw_case = "upper" if input.uppercase_keywords else "lower"
        formatted = sqlparse.format(
            input.sql, keyword_case=kw_case, reindent=True, indent_width=input.indent_width
        )
        stmts = sqlparse.parse(input.sql)
        return SqlFormatterOutput(formatted=formatted, statement_count=len(stmts))
