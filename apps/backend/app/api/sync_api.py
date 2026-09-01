from http.client import HTTPException
from typing import Annotated

from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from app.core.settings import settings
from app.repositories.library_repository import LibraryRepository
from app.repositories.media_progress_repository import MediaProgressRepository
from app.repositories.media_repository import MediaRepository
from app.repositories.note_repository import NoteRepository
from app.schemas.sync_change_schema import SyncChangeWrite, SyncStateRead
from fastapi import Form, UploadFile, File
from app.schemas.library_schema import LibraryRead
from app.schemas.media_schema import MediaRead
from app.schemas.media_progress_schema import MediaProgressRead
from app.schemas.note_schema import NoteRead
from pathlib import Path
from fastapi import APIRouter, Depends, Response
from app.services.SyncService import SyncService
from app.db.dependencies import get_db
from uuid import UUID

router = APIRouter(prefix="/sync")

MEDIA_ROOT = Path(settings.media_storage_dir)
CHUNK_SIZE = 1024 * 1024


# TODO: Later change to JWT Auth if time allows
@router.post("/initiate/{user_id}")
async def sync(
    changes: list[SyncChangeWrite],
    user_id: UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
):

    service = SyncService(db)

    try:
        await service.sync(changes=changes, user_id=user_id)
    except (SQLAlchemyError, ValueError, TypeError, KeyError) as e:
        print("SYNC ERROR:", repr(e))
        response = Response(
            status_code=404,
        )
        return response

    return {"status": "ok"}


@router.get("/state/{user_id}", response_model=SyncStateRead)
async def get_sync_state(
    user_id: UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    library_repository = LibraryRepository(db)
    media_repository = MediaRepository(db)
    note_repository = NoteRepository(db)
    media_progress_repository = MediaProgressRepository(db)

    libraries = await library_repository.fetch_all_by_user(user_id)
    media = await media_repository.fetch_all_by_user(user_id)
    notes = await note_repository.fetch_all_by_user(user_id)
    media_progress = await media_progress_repository.fetch_all_by_user(user_id)

    libraries_read = [LibraryRead.model_validate(library) for library in libraries]

    media_read = [MediaRead.model_validate(media_entity) for media_entity in media]

    notes_read = [NoteRead.model_validate(note) for note in notes]

    media_progress_read = [
        MediaProgressRead.model_validate(progress) for progress in media_progress
    ]

    return SyncStateRead(
        libraries=libraries_read,
        media=media_read,
        notes=notes_read,
        media_progress=media_progress_read,
    )


@router.post("/icon/{user_id}")
async def sync_file(
    user_id: UUID, path: Annotated[str, Form()], file: Annotated[UploadFile, File()]
):

    filepath = MEDIA_ROOT / str(user_id) / path

    filepath.parent.mkdir(parents=True, exist_ok=True)

    with open(filepath, "wb") as out:
        while chunk := await file.read(CHUNK_SIZE):
            out.write(chunk)


# @router.post("/media/{user_id}/{library_id}")
