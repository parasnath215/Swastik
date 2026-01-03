# Shree Swastik Backend

This is the FastAPI backend for the Shree Swastik Project Management System.

## Prerequisites

- Python 3.8+
- pip (Python package manager)
- PostgreSQL (or your configured database)

## Setup

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```

2.  **Create a virtual environment:**
    ```bash
    # Windows
    python -m venv venv
    ```

3.  **Activate the virtual environment:**
    ```bash
    # Windows (PowerShell)
    .\venv\Scripts\Activate.ps1
    
    # Windows (Command Prompt)
    .\venv\Scripts\activate.bat
    ```

4.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

## Environment Variables

Ensure you have a `.env` file in the `backend` directory with necessary configuration (DB connection string, etc.).
If there is an `.env.example`, copy it to `.env`.

## Running the Server

To start the development server with live reload:

```bash
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`.
API Documentation (Swagger UI) is available at `http://localhost:8000/docs`.

## Database Migrations

To apply database migrations:

```bash
alembic upgrade head
```
