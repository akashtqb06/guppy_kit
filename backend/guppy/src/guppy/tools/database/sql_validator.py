from __future__ import annotations

from typing import Literal

import sqlparse
from pydantic import BaseModel

from guppy.core.types import ArtifactType, ToolCategory
from guppy.tools.base import BaseTool, NoConfig


class SqlValidatorInput(BaseModel):
    sql: str
    dialect: Literal["generic", "postgresql", "mysql", "sqlite"] = "generic"


class SqlValidatorOutput(BaseModel):
    is_valid: bool
    statement_count: int
    statement_types: list[str]
    errors: list[str]
    warnings: list[str]


class SqlValidatorTool(BaseTool[SqlValidatorInput, NoConfig, SqlValidatorOutput]):
    name = "sql-validator"
    version = "1.0.0"
    category = ToolCategory.DATABASE
    description = "A standard tool implementation."
    tags = ["database", "utility"]  # noqa: RUF012
    input_artifact_types = []  # noqa: RUF012
    output_artifact_type = ArtifactType.JSON
    icon = "✅"

    input_schema = SqlValidatorInput
    output_schema = SqlValidatorOutput
    config_schema = NoConfig

    async def execute(self, input: SqlValidatorInput, config: NoConfig) -> SqlValidatorOutput:
        stmts = sqlparse.parse(input.sql)
        types = []
        errors = []
        for stmt in stmts:
            if stmt.get_type() != "UNKNOWN":
                types.append(stmt.get_type())
            else:
                types.append("UNKNOWN")
        # extremely basic validation
        is_valid = len(errors) == 0
        return SqlValidatorOutput(
            is_valid=is_valid,
            statement_count=len(stmts),
            statement_types=types,
            errors=errors,
            warnings=[],
        )
