from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from guppy.auth.models import User
from guppy.auth.service import hash_password
from guppy.core.config import get_settings


async def seed_admin_user(db: AsyncSession) -> None:
    settings = get_settings()
    if not settings.admin_create_on_startup:
        return

    admin_user = await db.scalar(select(User).where(User.email == settings.admin_email))
    if not admin_user:
        hashed = hash_password(settings.admin_password)
        admin_user = User(
            email=settings.admin_email, hashed_password=hashed, is_active=True, is_admin=True
        )
        db.add(admin_user)
        await db.commit()
