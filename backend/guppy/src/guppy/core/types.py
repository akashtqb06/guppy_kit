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


class CategoryMeta:
    """Display metadata for a tool category. Driven from CATEGORY_METADATA dict."""

    __slots__ = ("description", "icon", "id", "name")

    def __init__(self, id: str, name: str, icon: str, description: str) -> None:
        self.id = id
        self.name = name
        self.icon = icon
        self.description = description


# Single authoritative source for all category display metadata.
# Add new categories here — the API and UI both read from this.
CATEGORY_METADATA: dict[ToolCategory, CategoryMeta] = {
    ToolCategory.DATA: CategoryMeta(
        id="data",
        name="Data",
        icon="📊",
        description="Convert, profile, clean, and transform tabular data.",
    ),
    ToolCategory.DOCUMENTS: CategoryMeta(
        id="documents",
        name="Documents",
        icon="📄",
        description="Convert, merge, split, and compare document files.",
    ),
    ToolCategory.DEVELOPER: CategoryMeta(
        id="developer",
        name="Developer",
        icon="⚡",
        description="Format, encode, decode, validate, and generate utilities.",
    ),
    ToolCategory.DATABASE: CategoryMeta(
        id="database",
        name="Database",
        icon="🗄️",
        description="Design schemas, generate SQL, and visualize database relationships.",
    ),
    ToolCategory.VISUALIZATION: CategoryMeta(
        id="visualization",
        name="Visualization",
        icon="📈",
        description="Build charts, diagrams, flowcharts, and architecture maps.",
    ),
    ToolCategory.PRESENTATION: CategoryMeta(
        id="presentation",
        name="Presentation",
        icon="🎯",
        description="Create, edit, and export slide decks.",
    ),
    ToolCategory.WORKFLOW: CategoryMeta(
        id="workflow",
        name="Workflow",
        icon="🔁",
        description="Chain tools together in visual data pipelines.",
    ),
    ToolCategory.UTILITIES: CategoryMeta(
        id="utilities",
        name="Utilities",
        icon="🔧",
        description="Hash, encode, convert, and miscellaneous helpers.",
    ),
}


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
