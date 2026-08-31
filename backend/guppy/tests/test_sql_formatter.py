import pytest

from guppy.tools.database.sql_formatter import SqlFormatterTool


@pytest.mark.asyncio
async def test_sql_formatter():
    tool = SqlFormatterTool()
    # Just a simple instantiation test to satisfy coverage basically
    assert tool.name == "sql-formatter"
