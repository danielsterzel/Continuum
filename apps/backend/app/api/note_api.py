from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.dependencies import get_db, OwnerId
from uuid import UUID
from datetime import timedelta

from app.schemas.note_schema import NoteRead, NoteCreate
from app.repositories.note_repository import NoteRepository
from app.repositories.media_repository import MediaRepository
from app.models.note import Note

router = APIRouter(prefix="/notes")


@router.get("/fetch_notes", response_model=list[NoteRead])
async def fetch_notes(user_id: OwnerId, db: Annotated[AsyncSession, Depends(get_db)]):

    note_repository = NoteRepository(db)

    notes = await note_repository.fetch_all_by_user(user_id)

    note_schemas = [NoteRead.model_validate(note) for note in notes]

    return note_schemas


@router.post("/create", response_model=NoteRead)
async def create_note(
    user_id: OwnerId, request: NoteCreate, db: Annotated[AsyncSession, Depends(get_db)]
):

    media_repository = MediaRepository(db)
    note_repository = NoteRepository(db)

    media = await media_repository.fetch_one_by_user(
        media_id=UUID(request.mediaId), user_id=user_id
    )

    if media is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="No such media"
        )

    note = Note(
        media_id=media.id,
        title=request.title,
        content=request.content,
        timestamp=timedelta(seconds=request.timestamp)
        if request.timestamp is not None
        else None,
    )

    await note_repository.save(note)

    return note


@router.delete("/delete/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_note(
    user_id: OwnerId, note_id: UUID, db: Annotated[AsyncSession, Depends(get_db)]
):

    note_repository = NoteRepository(db)

    note = await note_repository.fetch_permitted(note_id=note_id, user_id=user_id)

    if note is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="No such note"
        )

    await note_repository.remove(note_id)

    return Response(status_code=status.HTTP_204_NO_CONTENT)
