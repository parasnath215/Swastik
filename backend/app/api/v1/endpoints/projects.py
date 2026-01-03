from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.api import deps
from app.models.project import Project, ProjectStatus

router = APIRouter()

@router.post("/", response_model=Project)
async def create_project(
    project: Project,
    db: AsyncSession = Depends(deps.get_db),
    # current_user: User = Depends(deps.get_current_active_user) # Enable later
):
    db.add(project)
    await db.commit()
    await db.refresh(project)
    return project

@router.get("/", response_model=List[Project])
async def read_projects(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(deps.get_db),
):
    result = await db.execute(select(Project).offset(skip).limit(limit))
    projects = result.scalars().all()
    return projects

@router.get("/{project_id}", response_model=Project)
async def read_project(
    project_id: int,
    db: AsyncSession = Depends(deps.get_db),
):
    project = await db.get(Project, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project
