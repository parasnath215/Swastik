from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.api import deps
from app.models.material import MaterialType, ProjectMaterial

router = APIRouter()

@router.post("/types", response_model=MaterialType)
async def create_material_type(
    material: MaterialType,
    db: AsyncSession = Depends(deps.get_db),
):
    db.add(material)
    await db.commit()
    await db.refresh(material)
    return material

@router.get("/types", response_model=List[MaterialType])
async def read_material_types(
    db: AsyncSession = Depends(deps.get_db),
):
    result = await db.execute(select(MaterialType))
    return result.scalars().all()

@router.post("/project-usage", response_model=ProjectMaterial)
async def add_project_material(
    material_usage: ProjectMaterial,
    db: AsyncSession = Depends(deps.get_db),
):
    # Logic to calculate cost
    # This assumes 'rate' is passed, or we fetch from MaterialType if not overridden
    # For now, simple save
    if material_usage.length and material_usage.width:
         material_usage.total_area = material_usage.length * material_usage.width * material_usage.quantity
         material_usage.total_cost = material_usage.total_area * material_usage.rate
    
    db.add(material_usage)
    await db.commit()
    await db.refresh(material_usage)
    return material_usage
