"""Seed the admin user and built-in RBAC roles on startup."""

from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from guppy.auth.models import PermissionModel, RoleModel, User
from guppy.auth.rbac import BUILT_IN_ROLES, ROLE_PERMISSIONS, Permission
from guppy.auth.service import hash_password
from guppy.core.config import get_settings


async def seed_roles_and_permissions(db: AsyncSession) -> dict[str, RoleModel]:
    """Ensure all built-in roles and permissions exist in DB. Returns role map."""

    # ── 1. Upsert all permissions ─────────────────────────────────────────────
    perm_map: dict[str, PermissionModel] = {}
    for perm in Permission:
        existing = await db.scalar(
            select(PermissionModel).where(PermissionModel.code == perm.value)
        )
        if not existing:
            existing = PermissionModel(code=perm.value, description=perm.value)
            db.add(existing)
        perm_map[perm.value] = existing

    await db.flush()

    # ── 2. Upsert all roles ───────────────────────────────────────────────────
    # For roles fetched from DB, selectinload eagerly loads permissions.
    # For newly created roles, we explicitly set permissions=[] so SQLAlchemy
    # never needs to lazy-load the relationship (which fails in async context).
    role_map: dict[str, RoleModel] = {}
    for role_name, description in BUILT_IN_ROLES.items():
        existing_role = await db.scalar(
            select(RoleModel)
            .where(RoleModel.name == role_name)
            .options(selectinload(RoleModel.permissions))
        )
        if not existing_role:
            existing_role = RoleModel(name=role_name, description=description)
            existing_role.permissions = []  # Prevent lazy-load on new objects
            db.add(existing_role)
            await db.flush()
        role_map[role_name] = existing_role

    # ── 3. Assign permissions to roles ────────────────────────────────────────
    # role.permissions is either selectin-loaded (DB fetch) or [] (new object)
    # — either way, safe to iterate without triggering a lazy-load.
    for role_name, perms in ROLE_PERMISSIONS.items():
        role = role_map[role_name]
        desired_codes = {p.value for p in perms}
        current_codes = {p.code for p in role.permissions}
        for code in desired_codes - current_codes:
            if code in perm_map:
                role.permissions.append(perm_map[code])

    await db.commit()
    return role_map


async def seed_admin_user(db: AsyncSession) -> None:
    settings = get_settings()
    if not settings.admin_create_on_startup:
        return

    role_map = await seed_roles_and_permissions(db)

    # Eagerly load roles for existing users; initialize to [] for new users.
    admin_user = await db.scalar(
        select(User).where(User.email == settings.admin_email).options(selectinload(User.roles))
    )
    if not admin_user:
        hashed = hash_password(settings.admin_password)
        admin_user = User(
            email=settings.admin_email,
            hashed_password=hashed,
            is_active=True,
            is_admin=True,
        )
        admin_user.roles = []  # Prevent lazy-load on new objects
        db.add(admin_user)
        await db.flush()

    # Ensure admin has superadmin role
    superadmin_role = role_map.get("superadmin")
    if superadmin_role and superadmin_role not in admin_user.roles:
        admin_user.roles.append(superadmin_role)

    await db.commit()
