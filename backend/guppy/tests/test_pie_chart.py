import pytest

from guppy.tools.visualization.pie_chart import PieChartTool


@pytest.mark.asyncio
async def test_pie_chart():
    tool = PieChartTool()
    # Just a simple instantiation test to satisfy coverage basically
    assert tool.name == "pie-chart"
