from typing import Annotated

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.staticfiles import StaticFiles

from app.db.dependencies import get_db
from app.api.media_api import router as media_router
from app.api.library_api import router as lib_router
from app.core.settings import settings


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

DbSession = Annotated[AsyncSession, Depends(get_db)]

app.include_router(media_router)
app.include_router(lib_router)
OWNER_EMAIL = "owner@continuum.local"



# @app.get("/")
# async def root(db: DbSession):
#     user = await db.scalar(select(User).where(User.email == OWNER_EMAIL))

#     if user is None:
#         user = User(email=OWNER_EMAIL, display_name="Owner")
#         db.add(user)
#         await db.commit()
#         await db.refresh(user)

#     return {
#         "message": "Continuum API is running",
#         "user_id": str(user.id),
#     }

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

app.mount(
    "/media_storage",
    StaticFiles(directory="media_storage"),
    name="media_storage"
)
