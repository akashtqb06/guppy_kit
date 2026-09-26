"""
ToolRegistry — discovers, validates, and serves tool instances.

Tools are registered either:
  1. Programmatically via `registry.register(MyTool)`
  2. Automatically by calling `registry.discover()`, which imports every
     module listed in TOOL_MODULES and registers all BaseTool subclasses.

The registry is a singleton instantiated at startup.
"""

from __future__ import annotations

import importlib
import logging
from typing import TYPE_CHECKING

from guppy.core.exceptions import ToolNotFoundError
from guppy.tools.base import BaseTool

if TYPE_CHECKING:
    pass

logger = logging.getLogger(__name__)

# Map of "<package>.<module>" → list of tool class names to auto-import.
# Add new tool modules here as they are implemented.
TOOL_MODULES: list[str] = [
    # Utilities
    "guppy.tools.utilities.echo",
    "guppy.tools.utilities.hash_generator",
    "guppy.tools.utilities.url_encoder",
    "guppy.tools.utilities.timestamp_converter",
    "guppy.tools.utilities.color_converter",
    "guppy.tools.utilities.qr_code_generator",
    "guppy.tools.utilities.password_generator",
    "guppy.tools.utilities.text_case_converter",
    "guppy.tools.utilities.string_utilities",
    # Developer
    "guppy.tools.developer.json_formatter",
    "guppy.tools.developer.base64_encoder",
    "guppy.tools.developer.uuid_generator",
    "guppy.tools.developer.jwt_decoder",
    "guppy.tools.developer.regex_tester",
    "guppy.tools.developer.cron_parser",
    "guppy.tools.developer.http_status_codes",
    "guppy.tools.developer.xml_formatter",
    "guppy.tools.developer.number_base_converter",
    "guppy.tools.developer.env_parser",
    # Data
    "guppy.tools.data.csv_to_json",
    "guppy.tools.data.json_to_csv",
    "guppy.tools.data.json_diff",
    "guppy.tools.data.excel_to_json",
    "guppy.tools.data.csv_profiler",
    "guppy.tools.data.json_schema_validator",
    "guppy.tools.data.json_to_yaml",
    "guppy.tools.data.yaml_to_json",
    "guppy.tools.data.table_generator",
    "guppy.tools.data.toml_converter",
    # Documents
    "guppy.tools.documents.word_count",
    "guppy.tools.documents.markdown_to_html",
    "guppy.tools.documents.text_diff",
    "guppy.tools.documents.lorem_ipsum",
    "guppy.tools.documents.pdf_to_text",
    "guppy.tools.documents.pdf_merger",
    "guppy.tools.documents.docx_to_text",
    "guppy.tools.documents.pdf_generator",
    "guppy.tools.documents.html_to_pdf",
    "guppy.tools.presentation.pptx_exporter",
    # Database
    "guppy.tools.database.sql_formatter",
    "guppy.tools.database.sql_validator",
    "guppy.tools.database.er_diagram",
    "guppy.tools.database.schema_designer",
    # Visualization
    "guppy.tools.visualization.bar_chart",
    "guppy.tools.visualization.line_chart",
    "guppy.tools.visualization.pie_chart",
    "guppy.tools.visualization.mermaid_renderer",
    "guppy.tools.visualization.scatter_chart",
    # Presentation
    "guppy.tools.presentation.slide_builder",
    # Workflow
    "guppy.tools.workflow.pipeline_validator",
    "guppy.tools.workflow.data_pipeline_runner",
]


class ToolRegistry:
    """Thread-safe (single-process) registry of all available tools."""

    def __init__(self) -> None:
        self._tools: dict[str, BaseTool] = {}  # type: ignore[type-arg]

    # ── Registration ──────────────────────────────────────────────────────

    def register(self, tool_class: type[BaseTool]) -> None:  # type: ignore[type-arg]
        """Register a tool class. Raises ValueError on name collision."""
        instance: BaseTool = tool_class()  # type: ignore[type-arg]
        name = tool_class.name
        if name in self._tools:
            raise ValueError(f"Tool '{name}' is already registered.")
        self._tools[name] = instance
        logger.info("Registered tool: %s @ %s", name, tool_class.version)

    def discover(self) -> None:
        """Import all modules in TOOL_MODULES and register their tools."""
        for module_path in TOOL_MODULES:
            try:
                importlib.import_module(module_path)
            except ImportError as exc:
                logger.warning("Could not import tool module %s: %s", module_path, exc)

        # Auto-register all concrete BaseTool subclasses found after imports
        for subclass in _all_subclasses(BaseTool):
            if _is_concrete(subclass) and subclass.name not in self._tools:
                try:
                    self.register(subclass)
                except (ValueError, AttributeError) as exc:
                    logger.warning("Skipping tool class %s: %s", subclass, exc)

    # ── Lookup ────────────────────────────────────────────────────────────

    def get(self, name: str) -> BaseTool:  # type: ignore[type-arg]
        """Return a registered tool by name or raise ToolNotFoundError."""
        try:
            return self._tools[name]
        except KeyError:
            raise ToolNotFoundError(f"Tool '{name}' not found in registry.") from None

    def list_all(self) -> list[BaseTool]:  # type: ignore[type-arg]
        """Return all registered tool instances."""
        return list(self._tools.values())

    def __len__(self) -> int:
        return len(self._tools)


# ── Helpers ───────────────────────────────────────────────────────────────────


def _all_subclasses(cls: type) -> list[type]:
    """Recursively collect all subclasses of cls."""
    result: list[type] = []
    for sub in cls.__subclasses__():
        result.append(sub)
        result.extend(_all_subclasses(sub))
    return result


def _is_concrete(cls: type) -> bool:
    """Return True if the class is a concrete (non-abstract) BaseTool."""
    return (
        not getattr(cls, "__abstractmethods__", None)
        and hasattr(cls, "name")
        and hasattr(cls, "version")
        and isinstance(getattr(cls, "name", None), str)
    )


# Singleton instance
registry = ToolRegistry()
