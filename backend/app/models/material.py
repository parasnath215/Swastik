from typing import Optional
from sqlmodel import Field
from app.models.base import BaseSchema

class MaterialType(BaseSchema, table=True):
    name: str  # Granite, Marble, etc.
    category: str # Slab, Block, etc.
    default_rate: float
    unit: str # sqft, piece, etc.

class ProjectMaterial(BaseSchema, table=True):
    project_id: int = Field(foreign_key="project.id")
    material_type_id: int = Field(foreign_key="materialtype.id")
    
    material_name_override: Optional[str] = None
    length: float = 0.0
    width: float = 0.0
    thickness: float = 0.0
    quantity: int = 1
    
    rate: float
    
    # Calculated fields to be stored or computed? storing for history
    total_area: float = 0.0
    total_cost: float = 0.0
    wastage_percent: float = 0.0
