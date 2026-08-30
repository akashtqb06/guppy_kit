"""
ToolRuntime — orchestrates the full tool execution lifecycle:

  validate input → resolve artifacts → execute tool → persist artifact
  → persist execution record → emit platform event

Every tool invocation goes through the runtime. The runtime is stateless;
it is instantiated once at application startup and shared across requests.
"""

from __future__ import annotations

import asyncio
import logging
import time
import uuid
from datetime import UTC, datetime

from pydantic import ValidationError
from sqlalchemy.ext.asyncio import AsyncSession

from guppy.core.config import get_settings
from guppy.core.exceptions import ToolExecutionError, ToolInputError, ToolTimeoutError
from guppy.core.types import ExecutionStatus
from guppy.tools.registry import ToolRegistry

logger = logging.getLogger(__name__)


class ExecutionResult:
    """Returned by ToolRuntime.execute() on success."""

    def __init__(
        self,
        execution_id: str,
        tool_name: str,
        output: object,
        artifact_id: str | None,
        duration_ms: float,
        status: ExecutionStatus,
    ) -> None:
        self.execution_id = execution_id
        self.tool_name = tool_name
        self.output = output
        self.artifact_id = artifact_id
        self.duration_ms = duration_ms
        self.status = status
        self.completed_at = datetime.now(UTC)


class ToolRuntime:
    """
    Orchestrates tool execution.

    Dependencies (artifact service, event bus) are injected at construction
    time. The session is injected per-request via the execute() call.
    """

    def __init__(self, registry: ToolRegistry) -> None:
        self._registry = registry
        self._settings = get_settings()

    async def execute(
        self,
        *,
        tool_name: str,
        raw_input: dict,
        raw_config: dict | None = None,
        session: AsyncSession,
        project_id: str | None = None,
    ) -> ExecutionResult:
        """
        Run a named tool end-to-end.

        Args:
            tool_name:  Registered tool identifier.
            raw_input:  Unvalidated input dict from the API layer.
            raw_config: Unvalidated config dict from the API layer (optional).
            session:    Active DB session for this request.
            project_id: Optional project to associate the execution with.

        Returns:
            ExecutionResult with output, artifact_id, timing, and status.

        Raises:
            ToolNotFoundError:   tool_name not in registry.
            ToolInputError:      input / config validation failed.
            ToolExecutionError:  tool raised an unexpected exception.
            ToolTimeoutError:    tool exceeded the configured timeout.
        """
        execution_id = str(uuid.uuid4())
        start = time.perf_counter()

        # 1. Resolve the tool
        tool = self._registry.get(tool_name)  # raises ToolNotFoundError

        # 2. Validate input
        try:
            validated_input = tool.input_schema.model_validate(raw_input)
        except ValidationError as exc:
            raise ToolInputError(
                f"Invalid input for tool '{tool_name}'",
                detail=exc.json(),
            ) from exc

        # 3. Validate config (use defaults if not supplied)
        try:
            validated_config = tool.config_schema.model_validate(raw_config or {})
        except ValidationError as exc:
            raise ToolInputError(
                f"Invalid config for tool '{tool_name}'",
                detail=exc.json(),
            ) from exc

        # 4. Execute with timeout
        logger.info(
            "Executing tool %s [execution_id=%s]",
            tool_name,
            execution_id,
        )
        try:
            output = await asyncio.wait_for(
                tool.execute(validated_input, validated_config),
                timeout=self._settings.tool_execution_timeout_seconds,
            )
        except asyncio.TimeoutError:
            raise ToolTimeoutError(
                f"Tool '{tool_name}' timed out after "
                f"{self._settings.tool_execution_timeout_seconds}s"
            )
        except (ToolInputError, ToolExecutionError):
            raise
        except Exception as exc:
            raise ToolExecutionError(
                f"Tool '{tool_name}' raised an unexpected error: {exc}"
            ) from exc

        duration_ms = (time.perf_counter() - start) * 1000
        logger.info(
            "Tool %s completed in %.1fms [execution_id=%s]",
            tool_name,
            duration_ms,
            execution_id,
        )

        # 5. Artifact persistence + event emission will be wired in M1 step 2
        #    (ArtifactService and EventBus are not yet instantiated)

        return ExecutionResult(
            execution_id=execution_id,
            tool_name=tool_name,
            output=output,
            artifact_id=None,  # Populated when ArtifactService is wired
            duration_ms=duration_ms,
            status=ExecutionStatus.COMPLETED,
        )
