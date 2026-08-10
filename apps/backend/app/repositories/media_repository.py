

from app.repositories.base_repository import BaseRepository
from app.models.media import Media
from app.models.libraries import Library

from uuid import UUID

from sqlalchemy import select

class MediaRepository(BaseRepository):
    model = Media

    async def fetch_by_library(self, library_id: UUID) -> list[Media]:

        list_media = await self.db.execute(select(Media).where(Media.library_id == library_id))

        return list(list_media.scalars().all())

    async def fetch_owned_by_user(self, media_id: UUID, user_id: UUID) -> Media | None:

        query = (select(Media)
                 .join(Library, Media.library_id == Library.id)
                 .where(Media.id == media_id, Library.user_id == user_id))

        res = await self.db.execute(query)

        return res.scalar_one_or_none()
