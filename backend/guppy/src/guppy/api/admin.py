from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from guppy.auth.dependencies import require_admin
from guppy.auth.models import User
from guppy.core.db import get_db

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/users")
async def list_users(db: AsyncSession = Depends(get_db), admin: User = Depends(require_admin)):
    result = await db.scalars(select(User))
    return result.all()


@router.patch("/users/{user_id}")
async def update_user(
    user_id: str,
    is_active: bool | None = None,
    is_admin: bool | None = None,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin),
):
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(404, "User not found")
    if is_active is not None:
        user.is_active = is_active
    if is_admin is not None:
        user.is_admin = is_admin
    await db.commit()
    return user


@router.delete("/users/{user_id}")
async def delete_user(
    user_id: str, db: AsyncSession = Depends(get_db), admin: User = Depends(require_admin)
):
    if str(admin.id) == user_id:
        raise HTTPException(400, "Cannot delete yourself")
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(404, "User not found")
    await db.delete(user)
    await db.commit()
    return {"status": "deleted"}
