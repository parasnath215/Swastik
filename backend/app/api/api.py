from fastapi import APIRouter

from app.api.v1.endpoints import projects, materials, machines, expenses, users

api_router = APIRouter()

api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(projects.router, prefix="/projects", tags=["projects"])
api_router.include_router(materials.router, prefix="/materials", tags=["materials"])
api_router.include_router(machines.router, prefix="/machines", tags=["machines"])
api_router.include_router(expenses.router, prefix="/expenses", tags=["expenses"])

