from datetime import datetime
from typing import Optional
from enum import Enum
from sqlmodel import Field
from app.models.base import BaseSchema

class MachineType(str, Enum):
    WATERJET = "waterjet"
    GRINDING = "grinding"
    POLISHING = "polishing"
    OTHER = "other"

class Machine(BaseSchema, table=True):
    name: str 
    type: MachineType
    hourly_rate: float
    is_active: bool = True

class MachineSchedule(BaseSchema, table=True):
    machine_id: int = Field(foreign_key="machine.id")
    project_id: int = Field(foreign_key="project.id")
    
    start_time: datetime
    end_time: datetime
    
    assigned_worker_id: Optional[int] = Field(foreign_key="user.id", default=None)
    
    status: str = "scheduled" # scheduled, in_progress, completed, delayed
