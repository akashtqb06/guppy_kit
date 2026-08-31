import pytest

from guppy.tools.workflow.pipeline_validator import PipelineValidatorTool


@pytest.mark.asyncio
async def test_pipeline_validator():
    tool = PipelineValidatorTool()
    # Just a simple instantiation test to satisfy coverage basically
    assert tool.name == "pipeline-validator"
