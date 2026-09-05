import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from guppy.auth.dependencies import require_admin
from guppy.auth.models import LoginEvent, RoleModel, User
from guppy.core.db import get_db

router = APIRouter(prefix="/admin", tags=["admin"])


class UserAdminRead(BaseModel):
    id: uuid.UUID
    email: str
    is_active: bool
    is_admin: bool
    created_at: datetime
    roles: list[str]  # role names
    model_config = {"from_attributes": True}


class UserUpdateBody(BaseModel):
    is_active: bool | None = None
    is_admin: bool | None = None


@router.get("/users", response_model=list[UserAdminRead])
async def list_users(
    skip: int = 0,
    limit: int = Query(default=50, le=200),
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),
) -> list[User]:
    result = await db.scalars(
        select(User).order_by(User.created_at.desc()).offset(skip).limit(limit)
    )
    # The response_model is UserAdminRead, which expects roles as list of strings.
    # We should map user to something that matches UserAdminRead if it doesn't automatically.
    # pydantic from_attributes might not magically turn User.roles into strings.
    # Let's map it manually.
    users = result.all()
    out = []
    for u in users:
        out.append(
            {
                "id": u.id,
                "email": u.email,
                "is_active": u.is_active,
                "is_admin": u.is_admin,
                "created_at": u.created_at,
                "roles": [r.name for r in u.roles],
            }
        )
    return out


@router.get("/users/{user_id}", response_model=UserAdminRead)
async def get_user(
    user_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),
) -> dict:
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(404, "User not found")
    return {
        "id": user.id,
        "email": user.email,
        "is_active": user.is_active,
        "is_admin": user.is_admin,
        "created_at": user.created_at,
        "roles": [r.name for r in user.roles],
    }


@router.patch("/users/{user_id}", response_model=UserAdminRead)
async def update_user(
    user_id: uuid.UUID,
    body: UserUpdateBody,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),
) -> dict:
    if user_id == admin.id and body.is_admin is False:
        raise HTTPException(400, "Cannot remove admin from yourself")
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(404, "User not found")
    if body.is_active is not None:
        user.is_active = body.is_active
    if body.is_admin is not None:
        user.is_admin = body.is_admin
    await db.commit()
    await db.refresh(user)
    return {
        "id": user.id,
        "email": user.email,
        "is_active": user.is_active,
        "is_admin": user.is_admin,
        "created_at": user.created_at,
        "roles": [r.name for r in user.roles],
    }


@router.delete("/users/{user_id}", status_code=204)
async def delete_user(
    user_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),
) -> None:
    if user_id == admin.id:
        raise HTTPException(400, "Cannot delete yourself")
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(404, "User not found")
    await db.delete(user)
    await db.commit()


@router.post("/users/{user_id}/roles/{role_name}", response_model=UserAdminRead)
async def assign_role(
    user_id: uuid.UUID,
    role_name: str,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),
) -> dict:
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(404, "User not found")
    role = await db.scalar(select(RoleModel).where(RoleModel.name == role_name))
    if not role:
        raise HTTPException(404, f"Role '{role_name}' not found")
    if role not in user.roles:
        user.roles.append(role)
        await db.commit()
        await db.refresh(user)
    return {
        "id": user.id,
        "email": user.email,
        "is_active": user.is_active,
        "is_admin": user.is_admin,
        "created_at": user.created_at,
        "roles": [r.name for r in user.roles],
    }


@router.delete("/users/{user_id}/roles/{role_name}", response_model=UserAdminRead)
async def remove_role(
    user_id: uuid.UUID,
    role_name: str,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),
) -> dict:
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(404, "User not found")
    role = await db.scalar(select(RoleModel).where(RoleModel.name == role_name))
    if role and role in user.roles:
        user.roles.remove(role)
        await db.commit()
        await db.refresh(user)
    return {
        "id": user.id,
        "email": user.email,
        "is_active": user.is_active,
        "is_admin": user.is_admin,
        "created_at": user.created_at,
        "roles": [r.name for r in user.roles],
    }


@router.get("/roles")
async def list_roles(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),
) -> list[dict]:
    result = await db.scalars(select(RoleModel))
    roles = result.all()
    return [
        {
            "name": r.name,
            "description": r.description,
            "permissions": [p.code for p in r.permissions],
        }
        for r in roles
    ]


@router.get("/audit-log")
async def get_audit_log(
    skip: int = 0,
    limit: int = Query(default=100, le=500),
    success: bool | None = None,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),
) -> list:
    stmt = select(LoginEvent).order_by(LoginEvent.created_at.desc()).offset(skip).limit(limit)
    if success is not None:
        stmt = stmt.where(LoginEvent.success == success)
    result = await db.scalars(stmt)
    events = result.all()
    return [
        {
            "id": str(e.id),
            "email": e.email_attempted,
            "ip": e.ip_address,
            "success": e.success,
            "failure_reason": e.failure_reason,
            "created_at": e.created_at.isoformat(),
        }
        for e in events
    ]
