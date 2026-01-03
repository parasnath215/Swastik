from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.api import deps
from app.models.machine import Machine, MachineSchedule

router = APIRouter()

@router.post("/machines", response_model=Machine)
async def create_machine(
    machine: Machine,
    db: AsyncSession = Depends(deps.get_db),
):
    db.add(machine)
    await db.commit()
    await db.refresh(machine)
    return machine

@router.get("/machines", response_model=List[Machine])
async def read_machines(
    db: AsyncSession = Depends(deps.get_db),
):
    result = await db.execute(select(Machine))
    return result.scalars().all()

@router.post("/schedule", response_model=MachineSchedule)
async def schedule_machine(
    schedule: MachineSchedule,
    db: AsyncSession = Depends(deps.get_db),
):
    # Logic to check availability could go here
    db.add(schedule)
    await db.commit()
    await db.refresh(schedule)
    return schedule

@router.get("/schedule", response_model=List[MachineSchedule])
async def read_schedule(
    db: AsyncSession = Depends(deps.get_db),
):
    result = await db.execute(select(MachineSchedule))
    return result.scalars().all()
