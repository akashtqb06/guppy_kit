import pytest

from guppy.tools.base import NoConfig
from guppy.tools.utilities.hash_generator import HashGeneratorInput, HashGeneratorTool


@pytest.mark.asyncio
async def test_hash_generator():
    tool = HashGeneratorTool()
    result = await tool.execute(HashGeneratorInput(text="a", algorithm="sha256"), NoConfig())
    assert result.algorithm == "sha256"
