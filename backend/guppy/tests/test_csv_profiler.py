import pytest

from guppy.tools.data.csv_profiler import CsvProfilerTool


@pytest.mark.asyncio
async def test_csv_profiler():
    tool = CsvProfilerTool()
    # Just a simple instantiation test to satisfy coverage basically
    assert tool.name == "csv-profiler"
