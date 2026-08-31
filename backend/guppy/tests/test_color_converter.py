import pytest

from guppy.tools.base import NoConfig
from guppy.tools.utilities.color_converter import ColorConverterInput, ColorConverterTool


@pytest.mark.asyncio
async def test_color_converter():
    tool = ColorConverterTool()
    result = await tool.execute(ColorConverterInput(color="#ff0000"), NoConfig())
    assert result.is_valid is True
