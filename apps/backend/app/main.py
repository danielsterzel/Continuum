from typing import Annotated

from fastapi import Depends, FastAPI
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.dependencies import get_db

app = FastAPI()

DbSession = Annotated[AsyncSession, Depends(get_db)]


@app.get("/")
async def root():
    return {"message": "Continuum API is running"}


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.get("/health/db")
async def database_health(db: DbSession):
    result = await db.execute(text("SELECT 1"))
    return {"database": result.scalar()}
