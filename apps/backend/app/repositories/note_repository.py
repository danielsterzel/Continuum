

from uuid import UUID

from app.models import Media, Library
from app.models.note import Note
from app.repositories.base_repository import BaseRepository
from sqlalchemy import select

class NoteRepository(BaseRepository):
    model = Note

    async def fetch_all(self) -> list[Note]:

        query = select(self.model)

        notes = await self.db.execute(query)
        return list(notes.scalars().all())

    async def fetch_all_by_user(self, user_id: UUID) -> list[Note]:

        query = (select(self.model)
                 .join(Media, self.model.media_id == Media.id)
                 .join(Library, Media.library_id == Library.id)
                 .where(Library.user_id == user_id))

        notes = await self.db.execute(query)
        return list(notes.scalars().all())

    async def fetch_permitted(self, note_id: UUID, user_id: UUID) -> Note | None:

        query = (select(self.model)
                 .join(Media, self.model.media_id == Media.id)
                 .join(Library, Media.library_id == Library.id)
                 .where(Note.id == note_id, Library.user_id == user_id))

        res = await self.db.execute(query)

        return res.scalar_one_or_none()
