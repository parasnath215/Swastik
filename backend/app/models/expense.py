from typing import Optional
from sqlmodel import Field
from app.models.base import BaseSchema

class Expense(BaseSchema, table=True):
    project_id: Optional[int] = Field(foreign_key="project.id", default=None)
    machine_id: Optional[int] = Field(foreign_key="machine.id", default=None)
    worker_id: Optional[int] = Field(foreign_key="user.id", default=None)
    
    title: str
    amount: float
    category: str # Transport, Electricity, Maintenance, etc.
    description: Optional[str] = None
    
    is_approved: bool = False
