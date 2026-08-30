"""Core types and enums for the Guppy Kit platform."""

from __future__ import annotations

from enum import StrEnum


class ToolCategory(StrEnum):
    DATA = "data"
    DOCUMENTS = "documents"
    DEVELOPER = "developer"
    DATABASE = "database"
    VISUALIZATION = "visualization"
    PRESENTATION = "presentation"
    WORKFLOW = "workflow"
    UTILITIES = "utilities"


class ArtifactType(StrEnum):
    # Structured data
    JSON = "json"
    CSV = "csv"
    PARQUET = "parquet"
    YAML = "yaml"
    XML = "xml"

    # Documents
    TEXT = "text"
    MARKDOWN = "markdown"
    HTML = "html"
    PDF = "pdf"
    DOCX = "docx"
    XLSX = "xlsx"
    ZIP = "zip"

    # Visuals
    SVG = "svg"
    PNG = "png"

    # Code / config
    SQL = "sql"
    CODE = "code"

    # Presentations
    PPTX = "pptx"

    # Raw binary
    BINARY = "binary"


class ExecutionStatus(StrEnum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"


ARTIFACT_MIME_TYPES: dict[ArtifactType, str] = {
    ArtifactType.JSON: "application/json",
    ArtifactType.CSV: "text/csv",
    ArtifactType.PARQUET: "application/octet-stream",
    ArtifactType.YAML: "application/yaml",
    ArtifactType.XML: "application/xml",
    ArtifactType.TEXT: "text/plain",
    ArtifactType.MARKDOWN: "text/markdown",
    ArtifactType.HTML: "text/html",
    ArtifactType.PDF: "application/pdf",
    ArtifactType.DOCX: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ArtifactType.XLSX: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ArtifactType.ZIP: "application/zip",
    ArtifactType.SVG: "image/svg+xml",
    ArtifactType.PNG: "image/png",
    ArtifactType.SQL: "application/sql",
    ArtifactType.CODE: "text/plain",
    ArtifactType.PPTX: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ArtifactType.BINARY: "application/octet-stream",
}
