from sqlmodel import SQLModel, Field
from datetime import datetime
from typing import Optional

class BaseSchema(SQLModel):
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
