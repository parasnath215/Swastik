from typing import Optional, List
from datetime import datetime
from enum import Enum
from sqlmodel import Field, Relationship
from app.models.base import BaseSchema

class ProjectPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"

class ProjectStatus(str, Enum):
    INTAKE = "intake"
    DESIGN = "design"
    COSTING = "costing"
    MACHINE_WORK = "machine_work"
    FINISHING = "finishing"
    DELIVERY = "delivery"
    COMPLETED = "completed"

class Project(BaseSchema, table=True):
    client_name: str
    contact_details: str
    location: str
    project_type: str  # Kitchen, Bedroom, etc.
    estimated_area: float  # sq ft
    
    architect_id: Optional[int] = Field(default=None, foreign_key="user.id")
    # architect: Optional["User"] = Relationship(back_populates="projects") # Pydantic circular ref issue handling later
    
    start_date: Optional[datetime] = None
    estimated_delivery_date: Optional[datetime] = None
    priority: ProjectPriority = Field(default=ProjectPriority.MEDIUM)
    status: ProjectStatus = Field(default=ProjectStatus.INTAKE)
    
    notes: Optional[str] = None
