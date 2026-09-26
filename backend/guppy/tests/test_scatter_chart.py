import pytest
from guppy.tools.visualization.scatter_chart import ScatterChartTool, Input, DataPoint

@pytest.mark.asyncio
async def test_scatter_chart():
    tool = ScatterChartTool()
    out = await tool.execute(Input(points=[DataPoint(x=1, y=2), DataPoint(x=3, y=4)]), None)
    assert "<svg" in out.svg
    assert out.point_count == 2
