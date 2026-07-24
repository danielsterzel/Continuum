from fastapi import APIRouter, Depends, File, UploadFile, Form, HTTPException

from typing import Annotated

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.libraries import Library
from app.models.media import Media
from app.schemas.media_schema import MediaRead
from app.models.media import MediaType
from app.db.dependencies import get_db

from app.repositories.library_repository import LibraryRepository
from app.repositories.media_repository import MediaRepository

from pathlib import Path

from uuid import UUID, uuid4

API_BASE = "/api/v1"
MEDIA_ROOT = Path("media_storage")
CHUNK_SIZE = 1024 * 1024

router = APIRouter(prefix=API_BASE)


@router.get("/libraries/{library_id}/media", response_model=list[MediaRead])
async def get_media_files(
    library_id: UUID, db: Annotated[AsyncSession, Depends(get_db)]
):
    media_repository = MediaRepository(db=db)

    media_list = await media_repository.fetch_by_library(id=library_id)

    media_schemas = [
        MediaRead.model_validate(media_model) for media_model in media_list
    ]

    return media_schemas


@router.get("/libraries/{library_id}/media/{media_id}", response_model=MediaRead)
async def get_file(
    library_id: UUID, media_id: UUID, db: Annotated[AsyncSession, Depends(get_db)]
):
    media_repository = MediaRepository(db=db)

    media = await media_repository.fetch(media_id)

    if not media:
        raise HTTPException(status_code=404, detail="Media was not found")

    return media


@router.post("/libraries/{library_id}/media/upload", response_model=MediaRead)
async def upload_file(
    library_id: UUID,
    media_type: Annotated[MediaType, Form()],
    db: Annotated[AsyncSession, Depends(get_db)],
    file: UploadFile = File(...),
):

    library_repository = LibraryRepository(db=db)
    media_repository = MediaRepository(db=db)

    library = await library_repository.fetch(id=library_id)

    if library is None:
        raise HTTPException(status_code=404, detail="Library not found")

    media_id = uuid4()  # bo sciezka do pliku jest po uuid wiec musi byc przed
    # wrzuceniem do bazy i musi byc zgodne z baza

    safe_name = Path(file.filename or "unnamed").name
    folder = MEDIA_ROOT / str(media_id)
    folder.mkdir(parents=True, exist_ok=True)
    dest = folder / safe_name

    size = 0
    with open(dest, "wb") as out:
        while chunk := await file.read(CHUNK_SIZE):
            out.write(chunk)
            size += len(chunk)

    media: Media = Media(
        id=media_id,
        library_id=library_id,
        filename=safe_name,
        filepath=str(dest),
        file_size=size,
        media_type=media_type,
    )

    await media_repository.save(obj=media)

    return media
