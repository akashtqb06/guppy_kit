from __future__ import annotations

from typing import Literal

from pydantic import BaseModel

from guppy.core.types import ArtifactType, ToolCategory
from guppy.tools.base import BaseTool, NoConfig


class ColumnDef(BaseModel):
    name: str
    type: str
    nullable: bool = True
    primary_key: bool = False
    unique: bool = False
    default: str | None = None


class SchemaDesignerInput(BaseModel):
    table_name: str
    columns: list[ColumnDef]
    add_timestamps: bool = True
    dialect: Literal["postgresql", "mysql", "sqlite"] = "postgresql"


class SchemaDesignerOutput(BaseModel):
    sql: str
    column_count: int
    has_primary_key: bool


class SchemaDesignerTool(BaseTool[SchemaDesignerInput, NoConfig, SchemaDesignerOutput]):
    name = "schema-designer"
    version = "1.0.0"
    category = ToolCategory.DATABASE
    description = "Design a database table schema and generate the SQL CREATE TABLE statement."
    tags = ["database", "sql", "schema"]  # noqa: RUF012
    input_artifact_types = []  # noqa: RUF012
    output_artifact_type = ArtifactType.TEXT
    icon = "📐"

    input_schema = SchemaDesignerInput
    output_schema = SchemaDesignerOutput
    config_schema = NoConfig

    async def execute(self, input: SchemaDesignerInput, config: NoConfig) -> SchemaDesignerOutput:
        lines = []
        lines.append(f"CREATE TABLE {input.table_name} (")

        col_defs = []
        has_pk = False

        for col in input.columns:
            if col.primary_key:
                has_pk = True

            # Map type to dialect if it's serial/autoincrement for PK
            ctype = col.type
            if col.primary_key and ctype.lower() in ["serial", "integer", "int"]:
                if input.dialect == "postgresql":
                    ctype = "SERIAL"
                elif input.dialect == "mysql":
                    ctype = "INT AUTO_INCREMENT"
                elif input.dialect == "sqlite":
                    ctype = "INTEGER"  # SQLite uses INTEGER PRIMARY KEY AUTOINCREMENT

            parts = [f"    {col.name}", ctype]

            if col.primary_key:
                parts.append("PRIMARY KEY")
                if input.dialect == "sqlite" and ctype == "INTEGER":
                    parts.append("AUTOINCREMENT")
            else:
                if not col.nullable:
                    parts.append("NOT NULL")
                if col.unique:
                    parts.append("UNIQUE")
                if col.default is not None:
                    parts.append(f"DEFAULT {col.default}")

            col_defs.append(" ".join(parts))

        if input.add_timestamps:
            if input.dialect == "postgresql":
                col_defs.append("    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
                col_defs.append("    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
            elif input.dialect == "mysql":
                col_defs.append("    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
                col_defs.append(
                    "    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
                )
            elif input.dialect == "sqlite":
                col_defs.append("    created_at DATETIME DEFAULT CURRENT_TIMESTAMP")
                col_defs.append("    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP")

        lines.append(",\n".join(col_defs))
        lines.append(");")

        sql = "\n".join(lines)
        col_count = len(input.columns) + (2 if input.add_timestamps else 0)

        return SchemaDesignerOutput(sql=sql, column_count=col_count, has_primary_key=has_pk)
