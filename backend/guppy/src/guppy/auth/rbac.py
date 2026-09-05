"""
RBAC — Role-Based Access Control definitions.

This module defines all permissions as string enums and the mapping
from built-in role names to their permission sets. Both the DB seeder
and the runtime dependency check use these constants.
"""

from __future__ import annotations

from enum import StrEnum


class Permission(StrEnum):
    """All platform permissions. Format: resource.action"""

    # User management
    USER_VIEW = "user.view"
    USER_CREATE = "user.create"
    USER_UPDATE = "user.update"
    USER_DELETE = "user.delete"
    # Tool access
    TOOL_VIEW = "tool.view"
    TOOL_EXECUTE = "tool.execute"
    # Projects
    PROJECT_OWN = "project.own"
    PROJECT_VIEW = "project.view"
    # Executions
    EXECUTION_OWN = "execution.own"
    EXECUTION_VIEW = "execution.view"
    # Admin panel
    ADMIN_PANEL = "admin.panel"


# Built-in role → permissions mapping
ROLE_PERMISSIONS: dict[str, list[Permission]] = {
    "superadmin": list(Permission),
    "admin": [
        Permission.USER_VIEW,
        Permission.USER_CREATE,
        Permission.USER_UPDATE,
        Permission.USER_DELETE,
        Permission.TOOL_VIEW,
        Permission.TOOL_EXECUTE,
        Permission.PROJECT_VIEW,
        Permission.EXECUTION_VIEW,
        Permission.ADMIN_PANEL,
    ],
    "tool_manager": [
        Permission.TOOL_VIEW,
        Permission.TOOL_EXECUTE,
        Permission.EXECUTION_VIEW,
    ],
    "user": [
        Permission.TOOL_VIEW,
        Permission.TOOL_EXECUTE,
        Permission.PROJECT_OWN,
        Permission.EXECUTION_OWN,
    ],
    "viewer": [
        Permission.TOOL_VIEW,
        Permission.EXECUTION_OWN,
    ],
}

BUILT_IN_ROLES: dict[str, str] = {
    "superadmin": "Full platform access — all permissions",
    "admin": "User management, tool access, and admin panel",
    "tool_manager": "Can view and execute tools, see all executions",
    "user": "Standard user — execute tools, own projects and executions",
    "viewer": "Read-only — view tools and own executions only",
}
