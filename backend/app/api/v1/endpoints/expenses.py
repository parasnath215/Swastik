from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.api import deps
from app.models.expense import Expense

router = APIRouter()

@router.post("/", response_model=Expense)
async def create_expense(
    expense: Expense,
    db: AsyncSession = Depends(deps.get_db),
):
    db.add(expense)
    await db.commit()
    await db.refresh(expense)
    return expense

@router.get("/project/{project_id}", response_model=List[Expense])
async def read_project_expenses(
    project_id: int,
    db: AsyncSession = Depends(deps.get_db),
):
    result = await db.execute(select(Expense).where(Expense.project_id == project_id))
    return result.scalars().all()
