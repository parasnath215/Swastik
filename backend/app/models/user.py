from typing import Optional
from enum import Enum
from sqlmodel import Field
from app.models.base import BaseSchema

class UserRole(str, Enum):
    SUPER_ADMIN = "super_admin"
    ADMIN = "admin"
    MANAGER = "manager"
    ARCHITECT = "architect"
    MACHINE_OPERATOR = "machine_operator"
    FINISHING_WORKER = "finishing_worker"
    INSTALLER = "installer"
    ACCOUNTANT = "accountant"

class User(BaseSchema, table=True):
    full_name: str
    email: str = Field(unique=True, index=True)
    hashed_password: str
    role: UserRole = Field(default=UserRole.MACHINE_OPERATOR)
    is_active: bool = Field(default=True)
