from __future__ import annotations

import json

from pydantic import BaseModel

from guppy.core.types import ArtifactType, ToolCategory
from guppy.tools.base import BaseTool, NoConfig


class PipelineValidatorInput(BaseModel):
    pipeline_json: str


class PipelineValidatorOutput(BaseModel):
    is_valid: bool
    step_count: int
    errors: list[str]
    warnings: list[str]
    step_names: list[str]


class PipelineValidatorTool(BaseTool[PipelineValidatorInput, NoConfig, PipelineValidatorOutput]):
    name = "pipeline-validator"
    version = "1.0.0"
    category = ToolCategory.WORKFLOW
    description = "A standard tool implementation."
    tags = ["workflow", "utility"]  # noqa: RUF012
    input_artifact_types = []  # noqa: RUF012
    output_artifact_type = ArtifactType.JSON
    icon = "🔁"

    input_schema = PipelineValidatorInput
    output_schema = PipelineValidatorOutput
    config_schema = NoConfig

    async def execute(
        self, input: PipelineValidatorInput, config: NoConfig
    ) -> PipelineValidatorOutput:
        errors = []
        warnings = []
        step_names = []

        try:
            pipeline = json.loads(input.pipeline_json)
            if "name" not in pipeline:
                errors.append("Missing pipeline 'name'.")

            steps = pipeline.get("steps", [])
            if not isinstance(steps, list):
                errors.append("'steps' must be a list.")
                steps = []

            step_ids = set()
            for step in steps:
                s_id = step.get("id")
                if not s_id:
                    errors.append("Step missing 'id'.")
                else:
                    if s_id in step_ids:
                        errors.append(f"Duplicate step ID: {s_id}")
                    step_ids.add(s_id)
                    step_names.append(s_id)

                if "tool" not in step:
                    errors.append(f"Step {s_id} missing 'tool'.")

                input_from = step.get("input_from")
                if input_from and input_from not in step_ids:
                    # simplistic check for inputs defined before current step
                    errors.append(
                        f"Step {s_id} references unknown or future input_from: {input_from}"
                    )

        except Exception as e:
            errors.append(f"JSON parsing error: {e}")

        return PipelineValidatorOutput(
            is_valid=len(errors) == 0,
            step_count=len(step_names),
            errors=errors,
            warnings=warnings,
            step_names=step_names,
        )
