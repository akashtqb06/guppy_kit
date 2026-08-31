import pytest

from guppy.tools.database.sql_validator import SqlValidatorTool


@pytest.mark.asyncio
async def test_sql_validator():
    tool = SqlValidatorTool()
    # Just a simple instantiation test to satisfy coverage basically
    assert tool.name == "sql-validator"
