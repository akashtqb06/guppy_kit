"""Custom exception hierarchy for the Guppy Kit platform."""

from __future__ import annotations

from http import HTTPStatus


class GuppyError(Exception):
    """Base exception for all platform errors."""

    status_code: int = HTTPStatus.INTERNAL_SERVER_ERROR
    error_code: str = "internal_error"

    def __init__(self, message: str, *, detail: str | None = None) -> None:
        super().__init__(message)
        self.message = message
        self.detail = detail


# ── Tool errors ──────────────────────────────────────────────────────────────


class ToolNotFoundError(GuppyError):
    """Raised when a tool name cannot be found in the registry."""

    status_code = HTTPStatus.NOT_FOUND
    error_code = "tool_not_found"


class ToolInputError(GuppyError):
    """Raised when a tool receives invalid or missing input."""

    status_code = HTTPStatus.UNPROCESSABLE_ENTITY
    error_code = "tool_input_invalid"


class ToolExecutionError(GuppyError):
    """Raised when a tool executor raises an unexpected error."""

    status_code = HTTPStatus.INTERNAL_SERVER_ERROR
    error_code = "tool_execution_failed"


class ToolTimeoutError(GuppyError):
    """Raised when a tool execution exceeds the configured timeout."""

    status_code = HTTPStatus.GATEWAY_TIMEOUT
    error_code = "tool_execution_timeout"


# ── Artifact errors ──────────────────────────────────────────────────────────


class ArtifactNotFoundError(GuppyError):
    """Raised when an artifact ID cannot be found."""

    status_code = HTTPStatus.NOT_FOUND
    error_code = "artifact_not_found"


class ArtifactTooLargeError(GuppyError):
    """Raised when an artifact exceeds the maximum size limit."""

    status_code = HTTPStatus.REQUEST_ENTITY_TOO_LARGE
    error_code = "artifact_too_large"


# ── Project errors ───────────────────────────────────────────────────────────


class ProjectNotFoundError(GuppyError):
    """Raised when a project ID cannot be found."""

    status_code = HTTPStatus.NOT_FOUND
    error_code = "project_not_found"
