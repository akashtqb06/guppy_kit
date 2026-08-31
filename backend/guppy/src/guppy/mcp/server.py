"""
Guppy Kit MCP Server — exposes all registered tools via the MCP protocol.

Mount via: app.mount("/mcp", mcp.streamable_http_app())
"""

from mcp.server.fastmcp import FastMCP

from guppy.tools.registry import registry
from guppy.tools.runtime import ToolRuntime

mcp = FastMCP("Guppy Kit", description="Professional Digital Workbench — Capability Layer")


def _register_tools() -> None:
    """Register all tools from the registry with FastMCP."""
    runtime = ToolRuntime(registry)
    for tool in registry.list_all():
        _make_mcp_tool(mcp, runtime, tool)


def _make_mcp_tool(mcp_instance, runtime, tool):
    """Dynamically create a FastMCP tool for each registered tool."""
    tool_name = tool.name
    tool_description = tool.description

    @mcp_instance.tool(name=tool_name, description=tool_description)
    async def mcp_tool_handler(input: dict) -> dict:

        # ToolRuntime.execute requires AsyncSession — use None for MCP (no DB persistence yet)
        result = await runtime.execute(
            tool_name=tool_name,
            raw_input=input,
            raw_config=None,
            session=None,
        )
        return result.output.model_dump() if hasattr(result.output, "model_dump") else {}
