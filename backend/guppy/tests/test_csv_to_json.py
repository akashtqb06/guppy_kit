import pytest

from guppy.tools.base import NoConfig
from guppy.tools.data.csv_to_json import CsvToJsonInput, CsvToJsonTool


@pytest.mark.asyncio
async def test_csv_to_json():
    tool = CsvToJsonTool()
    result = await tool.execute(
        CsvToJsonInput(csv_content="a,b\n1,2", delimiter=",", has_header=True), NoConfig()
    )
    assert result.row_count == 1
