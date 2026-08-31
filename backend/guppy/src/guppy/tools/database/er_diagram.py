from __future__ import annotations

import re

from pydantic import BaseModel

from guppy.core.types import ArtifactType, ToolCategory
from guppy.tools.base import BaseTool, NoConfig


class ErDiagramInput(BaseModel):
    sql: str


class ErDiagramOutput(BaseModel):
    mermaid_diagram: str
    table_count: int
    relationship_count: int


class ErDiagramTool(BaseTool[ErDiagramInput, NoConfig, ErDiagramOutput]):
    name = "er-diagram"
    version = "1.0.0"
    category = ToolCategory.DATABASE
    description = "A standard tool implementation."
    tags = ["database", "utility"]  # noqa: RUF012
    input_artifact_types = []  # noqa: RUF012
    output_artifact_type = ArtifactType.MARKDOWN
    icon = "📐"

    input_schema = ErDiagramInput
    output_schema = ErDiagramOutput
    config_schema = NoConfig

    async def execute(self, input: ErDiagramInput, config: NoConfig) -> ErDiagramOutput:
        # naive implementation for CREATE TABLE extraction
        tables = []
        relationships = []

        table_matches = re.finditer(
            r"CREATE\s+TABLE\s+([a-zA-Z0-9_]+)\s*\((.*?)\);", input.sql, re.IGNORECASE | re.DOTALL
        )
        for match in table_matches:
            table_name = match.group(1)
            columns_str = match.group(2)
            cols = [c.strip() for c in columns_str.split(",")]
            table_cols = []
            for c in cols:
                parts = c.split()
                if len(parts) >= 2:
                    if parts[0].upper() == "FOREIGN" and parts[1].upper() == "KEY":
                        ref_match = re.search(r"REFERENCES\s+([a-zA-Z0-9_]+)", c, re.IGNORECASE)
                        if ref_match:
                            relationships.append((table_name, ref_match.group(1)))
                        continue

                    col_name = parts[0]
                    col_type = parts[1]
                    is_pk = "PK" if "PRIMARY KEY" in c.upper() else ""
                    table_cols.append(f"{col_type} {col_name} {is_pk}".strip())
            tables.append((table_name, table_cols))

        mermaid = ["```mermaid", "erDiagram"]
        for t_name, cols in tables:
            mermaid.append(f"    {t_name} {{")
            for c in cols:
                mermaid.append(f"        {c}")
            mermaid.append("    }")

        for t1, t2 in relationships:
            mermaid.append(f'    {t1} ||--o{{ {t2} : "references"')

        mermaid.append("```")
        return ErDiagramOutput(
            mermaid_diagram="\n".join(mermaid),
            table_count=len(tables),
            relationship_count=len(relationships),
        )
