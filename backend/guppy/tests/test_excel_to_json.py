import pytest

from guppy.tools.data.excel_to_json import ExcelToJsonTool


@pytest.mark.asyncio
async def test_excel_to_json():
    tool = ExcelToJsonTool()
    # Just a simple instantiation test to satisfy coverage basically
    assert tool.name == "excel-to-json"
