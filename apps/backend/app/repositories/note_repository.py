from uuid import UUID

from app.models import Media, Library
from app.models.note import Note
from app.repositories.base_repository import BaseRepository
from sqlalchemy import select, delete, update

from datetime import datetime, timezone


class NoteRepository(BaseRepository):
    model = Note
    allowed_updates = {"title", "content", "timestamp"}

    async def fetch_all(self) -> list[Note]:

        query = select(self.model)

        notes = await self.db.execute(query)
        return list(notes.scalars().all())

    async def fetch_all_by_user(self, user_id: UUID) -> list[Note]:

        query = (
            select(self.model)
            .join(Media, self.model.media_id == Media.id)
            .join(Library, Media.library_id == Library.id)
            .where(Library.user_id == user_id)
        )

        notes = await self.db.execute(query)
        return list(notes.scalars().all())

    async def fetch_by_user(self, note_id: UUID, user_id: UUID) -> Note | None:
        query = (
            select(self.model)
            .join(Media, Media.id == self.model.media_id)
            .join(Library, Library.id == Media.library_id)
            .where(Library.user_id == user_id, self.model.id == note_id)
        )
        note = await self.db.execute(query)
        return note.scalar_one_or_none()

    async def fetch_permitted(self, note_id: UUID, user_id: UUID) -> Note | None:

        query = (
            select(self.model)
            .join(Media, self.model.media_id == Media.id)
            .join(Library, Media.library_id == Library.id)
            .where(Note.id == note_id, Library.user_id == user_id)
        )

        res = await self.db.execute(query)

        return res.scalar_one_or_none()

    async def soft_delete_one_by_id(self, note_id: UUID, user_id: UUID) -> bool:

        query = (
            select(self.model)
            .join(Media, self.model.media_id == Media.id)
            .join(Library, Media.library_id == Library.id)
            .where(Note.id == note_id, Library.user_id == user_id)
        )

        res = await self.db.execute(query)
        note: Note = res.scalar_one_or_none()

        if not note:
            return False

        if note.deleted_at:
            return True

        note.deleted_at = datetime.now(timezone.utc)
        return True

    async def update_note_validate(self, note_id: UUID, user_id: UUID, **kwargs) -> bool:

        if not kwargs:
            return False

        if any(k not in self.allowed_updates for k in kwargs):
            return False

        permitted_note = (
            select(self.model.id)
            .join(Media, Note.media_id == Media.id)
            .join(Library, Media.library_id == Library.id)
            .where(Note.id == note_id, Library.user_id == user_id)
        )

        query = (
            update(self.model).where(self.model.id.in_(permitted_note)).values(**kwargs)
        )

        res = await self.db.execute(query)

        return res.rowcount == 1

    async def is_media_owned_by_user(self, media_id: UUID, user_id: UUID) -> bool:
        query = (
            select(Media.id)
            .join(Library, Library.id == Media.library_id)
            .where(Media.id == media_id, Library.user_id == user_id)
        )

        res = await self.db.execute(query)
        return res.scalar_one_or_none() is not None
