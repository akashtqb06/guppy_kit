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
    "guppy.tools.utilities.echo",
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
