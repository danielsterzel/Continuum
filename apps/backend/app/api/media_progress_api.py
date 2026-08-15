
from typing import Annotated
from fastapi import APIRouter, HTTPException, status

from fastapi.params import Depends

from sqlalchemy.ext.asyncio import AsyncSession
from app.db.dependencies import get_db, OwnerId

from app.repositories.media_progress_repository import MediaProgressRepository
from app.repositories.library_repository import LibraryRepository
from app.repositories.media_repository import MediaRepository

from app.schemas.media_progress_schema import MediaProgressRead, MediaProgressWrite
from app.models.media_progress import MediaProgress

from uuid import UUID

router = APIRouter(prefix="/media_progress")


@router.get("/recent/{library_id}/{media_id}", response_model=MediaProgressRead | None)
async def recent_progress(user_id: OwnerId, library_id: UUID, media_id: UUID, db: Annotated[AsyncSession, Depends(get_db)]):

    db_client = MediaProgressRepository(db)

    media_progress = await db_client.get_user_media(user_id=user_id, library_id=library_id, media_id=media_id)

    if not media_progress:
        return media_progress
    return MediaProgressRead.model_validate(media_progress)


@router.post("/update/{library_id}/{media_id}")
async def update_progress(request: MediaProgressWrite, user_id: OwnerId, library_id: UUID, media_id: UUID, db: Annotated[AsyncSession, Depends(get_db)]):


    library_repository = LibraryRepository(db)
    media_progress_repository = MediaProgressRepository(db)
    media_repository = MediaRepository(db)

    library = await library_repository.fetch_single_by_user(user_id, library_id)

    if not library:

        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Could not process request")

    media = await media_repository.fetch_one_by_library(library_id, media_id)

    if not media:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Something went wrong with fetching media")

    media_progress = MediaProgress(media_id=media_id,**request.model_dump())

    await media_progress_repository.save_or_update(media_progress)

    await db.commit()