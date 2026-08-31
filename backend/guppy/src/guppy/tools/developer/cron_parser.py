from __future__ import annotations

from datetime import UTC, datetime

from pydantic import BaseModel, Field

from guppy.core.types import ArtifactType, ToolCategory
from guppy.tools.base import BaseTool, NoConfig

try:
    from croniter import croniter

    HAS_CRONITER = True
except ImportError:
    HAS_CRONITER = False


class CronParserInput(BaseModel):
    expression: str
    count: int = Field(default=5, ge=1, le=20)


class CronParserOutput(BaseModel):
    description: str
    next_runs: list[str]
    is_valid: bool
    error: str | None = None


class CronParserTool(BaseTool[CronParserInput, NoConfig, CronParserOutput]):
    name = "cron-parser"
    version = "1.0.0"
    category = ToolCategory.DEVELOPER
    icon = "⏰"
    description = "Parse and validate cron expressions."
    tags = ["cron", "developer", "parser"]  # noqa: RUF012
    input_artifact_types = []  # noqa: RUF012
    output_artifact_type = ArtifactType.JSON

    input_schema = CronParserInput
    output_schema = CronParserOutput
    config_schema = NoConfig

    async def execute(self, input: CronParserInput, config: NoConfig) -> CronParserOutput:
        if not HAS_CRONITER:
            # Fallback manual check
            parts = input.expression.split()
            if len(parts) != 5:
                return CronParserOutput(
                    description="",
                    next_runs=[],
                    is_valid=False,
                    error="Invalid cron format. Expected 5 fields.",
                )
            return CronParserOutput(
                description="Cron parsing limited. Install croniter.", next_runs=[], is_valid=True
            )

        try:
            base = datetime.now(UTC)
            cron_iter = croniter(input.expression, base)
            next_runs = [cron_iter.get_next(datetime).isoformat() for _ in range(input.count)]
            return CronParserOutput(
                description="Valid cron expression.", next_runs=next_runs, is_valid=True
            )
        except Exception as exc:
            return CronParserOutput(description="", next_runs=[], is_valid=False, error=str(exc))
