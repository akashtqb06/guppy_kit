import pytest

from guppy.tools.base import NoConfig
from guppy.tools.developer.jwt_decoder import JwtDecoderInput, JwtDecoderTool


@pytest.mark.asyncio
async def test_jwt_decoder():
    tool = JwtDecoderTool()
    result = await tool.execute(
        JwtDecoderInput(
            token="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
        ),
        NoConfig(),
    )
    assert result.payload["name"] == "John Doe"
