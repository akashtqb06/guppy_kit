"""Unit tests for the Echo tool executor."""

from __future__ import annotations

import pytest

from guppy.tools.base import NoConfig
from guppy.tools.utilities.echo import EchoInput, EchoOutput, EchoTool


@pytest.fixture
def tool() -> EchoTool:
    return EchoTool()


class TestEchoToolMetadata:
    def test_name(self, tool: EchoTool) -> None:
        assert tool.name == "echo"

    def test_version(self, tool: EchoTool) -> None:
        assert tool.version == "1.0.0"

    def test_metadata_serialisable(self, tool: EchoTool) -> None:
        meta = tool.metadata()
        assert meta.name == "echo"
        assert meta.category == "utilities"
        assert meta.output_artifact_type == "json"


class TestEchoToolExecution:
    async def test_echoes_message(self, tool: EchoTool) -> None:
        result = await tool.execute(
            EchoInput(message="hello world"),
            NoConfig(),
        )
        assert isinstance(result, EchoOutput)
        assert result.message == "hello world"
        assert result.echoed is True

    async def test_echoes_metadata(self, tool: EchoTool) -> None:
        result = await tool.execute(
            EchoInput(message="test", metadata={"key": "value"}),
            NoConfig(),
        )
        assert result.metadata == {"key": "value"}

    async def test_empty_metadata_default(self, tool: EchoTool) -> None:
        result = await tool.execute(EchoInput(message="hi"), NoConfig())
        assert result.metadata == {}


class TestEchoInputValidation:
    def test_rejects_empty_message(self) -> None:
        with pytest.raises(ValueError, match=r".*"):
            EchoInput(message="")

    def test_accepts_max_length(self) -> None:
        msg = "x" * 10_000
        inp = EchoInput(message=msg)
        assert len(inp.message) == 10_000

    def test_rejects_over_max_length(self) -> None:
        with pytest.raises(ValueError, match=r".*"):
            EchoInput(message="x" * 10_001)
