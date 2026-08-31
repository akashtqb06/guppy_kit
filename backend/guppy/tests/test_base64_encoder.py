import pytest

from guppy.tools.base import NoConfig
from guppy.tools.developer.base64_encoder import Base64EncoderInput, Base64EncoderTool


@pytest.mark.asyncio
async def test_base64_encoder():
    tool = Base64EncoderTool()
    result = await tool.execute(Base64EncoderInput(text="hello", operation="encode"), NoConfig())
    assert result.operation == "encode"
