import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from guppy.auth.dependencies import get_current_user
from guppy.auth.models import User
from guppy.core.db import get_db
from guppy.projects.service import project_service

router = APIRouter(prefix="/projects", tags=["projects"])


class ProjectCreate(BaseModel):
    name: str
    description: str | None = None


class ProjectResponse(BaseModel):
    id: str
    name: str
    description: str | None
    visibility: str
    created_at: str
    updated_at: str


@router.get("", summary="List user projects", response_model=list[ProjectResponse])
async def list_projects(
    limit: int = 20,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    projects = await project_service.list_projects(db, limit=limit)
    return [
        ProjectResponse(
            id=str(p.id),
            name=p.name,
            description=p.description,
            visibility=p.visibility,
            created_at=p.created_at.isoformat(),
            updated_at=p.updated_at.isoformat(),
        )
        for p in projects
    ]


@router.post(
    "",
    summary="Create project",
    response_model=ProjectResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_project(
    data: ProjectCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    project = await project_service.create_project(
        db=db,
        name=data.name,
        description=data.description,
    )
    return ProjectResponse(
        id=str(project.id),
        name=project.name,
        description=project.description,
        visibility=project.visibility,
        created_at=project.created_at.isoformat(),
        updated_at=project.updated_at.isoformat(),
    )


@router.get("/{project_id}", summary="Get project detail", response_model=ProjectResponse)
async def get_project(
    project_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        proj_uuid = uuid.UUID(project_id)
    except ValueError:
        raise HTTPException(400, "Invalid project ID") from None
    project = await project_service.get_project(db, proj_uuid)
    if not project:
        raise HTTPException(404, "Project not found")
    return ProjectResponse(
        id=str(project.id),
        name=project.name,
        description=project.description,
        visibility=project.visibility,
        created_at=project.created_at.isoformat(),
        updated_at=project.updated_at.isoformat(),
    )


@router.delete("/{project_id}", summary="Delete project", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(
    project_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        proj_uuid = uuid.UUID(project_id)
    except ValueError:
        raise HTTPException(400, "Invalid project ID") from None
    project = await project_service.get_project(db, proj_uuid)
    if not project:
        raise HTTPException(404, "Project not found")
    await project_service.delete_project(db, proj_uuid)
