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

from guppy.artifacts.service import artifact_service
from guppy.core.config import get_settings
from guppy.core.exceptions import ToolExecutionError, ToolInputError, ToolTimeoutError
from guppy.core.types import ExecutionStatus
from guppy.events.bus import event_bus
from guppy.models.execution import Execution
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
        session: AsyncSession | None = None,
        project_id: str | None = None,
    ) -> ExecutionResult:
        """
        Run a named tool end-to-end.

        Args:
            tool_name:  Registered tool identifier.
            raw_input:  Unvalidated input dict from the API layer.
            raw_config: Unvalidated config dict from the API layer (optional).
            session:    Active DB session for this request. Optional for tests/MCP.
            project_id: Optional project to associate the execution with.

        Returns:
            ExecutionResult with output, artifact_id, timing, and status.

        Raises:
            ToolNotFoundError:   tool_name not in registry.
            ToolInputError:      input / config validation failed.
            ToolExecutionError:  tool raised an unexpected exception.
            ToolTimeoutError:    tool exceeded the configured timeout.
        """
        import json

        execution_id_obj = uuid.uuid4()
        execution_id = str(execution_id_obj)
        project_id_obj = uuid.UUID(project_id) if project_id else None
        start = time.perf_counter()

        # 1. Resolve the tool
        tool = self._registry.get(tool_name)  # raises ToolNotFoundError
        tool_version = tool.version
        artifact_type = tool.output_artifact_type

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

        # Pre-execution: create DB record & emit event
        execution = None
        if session:
            execution = Execution(
                id=execution_id_obj,
                tool_name=tool_name,
                tool_version=tool_version,
                project_id=project_id_obj,
                status=ExecutionStatus.RUNNING.value,
                input_snapshot=raw_input,
                config_snapshot=raw_config,
            )
            session.add(execution)
            await session.flush()

            await event_bus.emit(
                db=session,
                event_type="tool.execution.started",
                payload={"tool_name": tool_name},
                execution_id=execution_id_obj,
                project_id=project_id_obj,
            )

        # 4. Execute with timeout
        logger.info(
            "Executing tool %s [execution_id=%s]",
            tool_name,
            execution_id,
        )
        error_msg = None
        try:
            output = await asyncio.wait_for(
                tool.execute(validated_input, validated_config),
                timeout=self._settings.tool_execution_timeout_seconds,
            )
        except TimeoutError:
            timeout_sec = self._settings.tool_execution_timeout_seconds
            error_msg = f"Tool '{tool_name}' timed out after {timeout_sec}s"
            if session and execution:
                execution.status = ExecutionStatus.FAILED.value
                execution.error = error_msg
                execution.completed_at = datetime.now(UTC)
                execution.duration_ms = (time.perf_counter() - start) * 1000
                await event_bus.emit(
                    db=session,
                    event_type="tool.execution.failed",
                    payload={"error": error_msg},
                    execution_id=execution_id_obj,
                    project_id=project_id_obj,
                )
            raise ToolTimeoutError(error_msg) from None
        except (ToolInputError, ToolExecutionError) as exc:
            error_msg = str(exc)
            if session and execution:
                execution.status = ExecutionStatus.FAILED.value
                execution.error = error_msg
                execution.completed_at = datetime.now(UTC)
                execution.duration_ms = (time.perf_counter() - start) * 1000
                await event_bus.emit(
                    db=session,
                    event_type="tool.execution.failed",
                    payload={"error": error_msg},
                    execution_id=execution_id_obj,
                    project_id=project_id_obj,
                )
            raise
        except Exception as exc:
            error_msg = f"Tool '{tool_name}' raised an unexpected error: {exc}"
            if session and execution:
                execution.status = ExecutionStatus.FAILED.value
                execution.error = error_msg
                execution.completed_at = datetime.now(UTC)
                execution.duration_ms = (time.perf_counter() - start) * 1000
                await event_bus.emit(
                    db=session,
                    event_type="tool.execution.failed",
                    payload={"error": error_msg},
                    execution_id=execution_id_obj,
                    project_id=project_id_obj,
                )
            raise ToolExecutionError(error_msg) from exc

        duration_ms = (time.perf_counter() - start) * 1000
        logger.info(
            "Tool %s completed in %.1fms [execution_id=%s]",
            tool_name,
            duration_ms,
            execution_id,
        )

        # 5. Artifact persistence + event emission
        artifact_id_str = None
        if session and execution:
            output_dump = output.model_dump() if hasattr(output, "model_dump") else output
            content_bytes = json.dumps(output_dump).encode("utf-8")

            output_schema = {}
            if hasattr(tool.output_schema, "model_json_schema"):
                output_schema = tool.output_schema.model_json_schema()

            artifact = await artifact_service.store(
                db=session,
                execution_id=execution_id_obj,
                tool_name=tool_name,
                tool_version=tool_version,
                artifact_type=artifact_type,
                content=content_bytes,
                project_id=project_id_obj,
                output_schema=output_schema,
            )
            artifact_id_str = str(artifact.id)

            execution.status = ExecutionStatus.COMPLETED.value
            execution.completed_at = datetime.now(UTC)
            execution.duration_ms = duration_ms
            execution.artifact_id = artifact.id

            await event_bus.emit(
                db=session,
                event_type="tool.execution.completed",
                payload={"tool_name": tool_name},
                execution_id=execution_id_obj,
                artifact_id=artifact.id,
                project_id=project_id_obj,
            )

        return ExecutionResult(
            execution_id=execution_id,
            tool_name=tool_name,
            output=output,
            artifact_id=artifact_id_str,
            duration_ms=duration_ms,
            status=ExecutionStatus.COMPLETED,
        )
