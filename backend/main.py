from fastapi import FastAPI

app = FastAPI(title="Shree Swastik PMS API", version="0.1.0")

from fastapi.middleware.cors import CORSMiddleware

# Set up CORS
origins = [
    "http://localhost:3000",
    "http://localhost:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.api.api import api_router
from app.core.config import settings

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def read_root():
    return {"message": "Welcome to Shree Swastik Project Management System API"}
