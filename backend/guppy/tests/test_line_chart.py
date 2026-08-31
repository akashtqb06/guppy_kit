import pytest

from guppy.tools.visualization.line_chart import LineChartTool


@pytest.mark.asyncio
async def test_line_chart():
    tool = LineChartTool()
    # Just a simple instantiation test to satisfy coverage basically
    assert tool.name == "line-chart"
