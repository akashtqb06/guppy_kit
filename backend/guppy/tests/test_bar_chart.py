import pytest

from guppy.tools.visualization.bar_chart import BarChartTool


@pytest.mark.asyncio
async def test_bar_chart():
    tool = BarChartTool()
    # Just a simple instantiation test to satisfy coverage basically
    assert tool.name == "bar-chart"
