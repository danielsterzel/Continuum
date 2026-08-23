from typing import Annotated

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.staticfiles import StaticFiles

from app.db.dependencies import get_db
from app.api.library_api import router as lib_router
from app.api.media_progress_api import router as progress_router
from app.api.device_api import router as device_router
from app.api.sync_api import router as sync_router
from app.api.user_api import router as user_router
from app.core.settings import settings


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DbSession = Annotated[AsyncSession, Depends(get_db)]

app.include_router(user_router)

app.include_router(lib_router)
app.include_router(device_router)
app.include_router(progress_router)
app.include_router(sync_router)

OWNER_EMAIL = "owner@continuum.local"


@app.get("/")
async def home():
    return RedirectResponse(url=settings.frontend_url, status_code=302)


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.get("/health/db")
async def database_health(db: DbSession):
    result = await db.execute(text("SELECT 1"))
    return {"database": result.scalar()}

MEDIA_STORAGE_DIR = settings.media_storage_dir
MEDIA_STORAGE_DIR.mkdir(parents=True, exist_ok=True)

app.mount(
    "/media_storage", StaticFiles(directory=MEDIA_STORAGE_DIR), name="media_storage"
)
