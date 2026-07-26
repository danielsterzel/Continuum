

from app.repositories.base_repository import BaseRepository
from app.models.media import Media

from uuid import UUID

from sqlalchemy import select

class MediaRepository(BaseRepository):
    model = Media

    async def fetch_by_library(self, library_id: UUID) -> list[Media]:

        list_media = await self.db.execute(select(Media).where(Media.library_id == library_id))

        return list_media.all()
    