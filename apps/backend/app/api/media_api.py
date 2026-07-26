from fastapi import APIRouter, Depends, File, UploadFile, Form

from typing import Annotated

from sqlalchemy.ext.asyncio import AsyncSession


from app.schemas.media_schema import MediaRead
from app.models.media import MediaType
from app.db.dependencies import get_db

from uuid import UUID

API_BASE = "/api/v1"

router = APIRouter(prefix=API_BASE)


@router.get("/libraries/{library_id}/media", response_model=list[MediaRead])
async def get_media_files(
    library_id: UUID, db: Annotated[AsyncSession, Depends(get_db)]
):
    pass


@router.get("/libraries/{library_id}/media/{media_id}", response_model=MediaRead)
async def get_file(
    library_id: UUID, media_id: UUID, db: Annotated[AsyncSession, Depends(get_db)]
):
    pass


@router.post("/libraries/{library_id}/media/upload", response_model=MediaRead)
async def upload_file(
    library_id: UUID,
    media_type: Annotated[MediaType, Form()],
    db: Annotated[AsyncSession, Depends(get_db)],
    file: UploadFile = File(...),
):
    pass
