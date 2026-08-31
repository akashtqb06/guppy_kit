import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from guppy.models.project import Project


class ProjectService:
    async def create_project(
        self,
        *,
        db: AsyncSession,
        name: str,
        description: str | None = None,
        # user_id is ignored for now as Project doesn't have an owner field in the model schema yet
    ) -> Project:
        project = Project(
            name=name,
            description=description,
        )
        db.add(project)
        await db.flush()
        await db.refresh(project)
        return project

    async def get_project(self, db: AsyncSession, project_id: uuid.UUID) -> Project | None:
        return await db.get(Project, project_id)

    async def list_projects(self, db: AsyncSession, limit: int = 20) -> list[Project]:
        stmt = select(Project).order_by(Project.created_at.desc()).limit(limit)
        result = await db.scalars(stmt)
        return list(result.all())

    async def delete_project(self, db: AsyncSession, project_id: uuid.UUID) -> None:
        project = await self.get_project(db, project_id)
        if project:
            await db.delete(project)
            await db.flush()


# Singleton
project_service = ProjectService()
