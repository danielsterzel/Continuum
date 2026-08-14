
from app.repositories.base_repository import BaseRepository
from app.models.media_progress import MediaProgress
from app.models.media import  Media
from app.models.libraries import Library
from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert

class MediaProgressRepository(BaseRepository):
    model = MediaProgress

    async def get_user_media(self, user_id, library_id, media_id) -> MediaProgress | None:
        """user -> lib -> media -> media progress"""
        stmt = (
        select(self.model)
        .join(Media, MediaProgress.media_id == Media.id)
        .join(Library, Media.library_id == Library.id)
        .where(
            Library.user_id == user_id,
            Library.id == library_id,
            Media.id == media_id
            )
        )

        result = await self.db.execute(stmt)

        return result.scalar_one_or_none()
    async def save_or_update(self, media_progress: MediaProgress):

        query = insert(MediaProgress).values(
            media_id=media_progress.media_id,
            current_position=media_progress.current_position,
            last_device_id=media_progress.last_device_id
        )

        query = query.on_conflict_do_update(index_elements=[MediaProgress.media_id],
                                            set_={
                                                "current_position": query.excluded.current_position,
                                                "last_device_id": query.excluded.last_device_id,
                                            })
        await self.db.execute(query)