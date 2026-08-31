import pytest

from guppy.tools.base import NoConfig
from guppy.tools.utilities.url_encoder import UrlEncoderInput, UrlEncoderTool


@pytest.mark.asyncio
async def test_url_encoder():
    tool = UrlEncoderTool()
    result = await tool.execute(UrlEncoderInput(text="a b", operation="encode"), NoConfig())
    assert result.result == "a%20b"
