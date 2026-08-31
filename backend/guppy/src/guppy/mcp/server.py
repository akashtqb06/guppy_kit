"""
Guppy Kit MCP Server — exposes all registered tools via the MCP protocol.

Uses mcp>=2.x MCPServer API (FastMCP was renamed in v2).
Mount via: app.mount("/mcp", mcp.streamable_http_app())
"""

from __future__ import annotations

import logging

from mcp.server.mcpserver.server import MCPServer

from guppy.tools.registry import registry
from guppy.tools.runtime import ToolRuntime

logger = logging.getLogger(__name__)

mcp = MCPServer(
    name="Guppy Kit",
    version="0.1.0",
    description="Professional Digital Workbench — Capability Layer",
)


def _register_tools() -> None:
    """Register all tools from the registry with MCPServer.

    Called once from the lifespan after registry.discover().
    """
    runtime = ToolRuntime(registry)
    for tool in registry.list_all():
        _make_mcp_tool(runtime, tool)
    logger.info("MCP: registered %d tool(s)", len(registry))


def _make_mcp_tool(runtime: ToolRuntime, tool: object) -> None:
    """Dynamically create an MCP tool entry for each registered Guppy tool."""
    tool_name: str = tool.name  # type: ignore[attr-defined]
    tool_description: str = tool.description  # type: ignore[attr-defined]

    @mcp.tool(name=tool_name, description=tool_description)
    async def mcp_tool_handler(input: dict) -> dict:
        """Execute a Guppy tool without DB persistence (MCP caller)."""
        result = await runtime.execute(
            tool_name=tool_name,
            raw_input=input,
            raw_config=None,
            session=None,
        )
        if hasattr(result.output, "model_dump"):
            return result.output.model_dump()
        return {}
