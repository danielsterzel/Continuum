from app.repositories.base_repository import BaseRepository
from app.models.media_progress import MediaProgress
from app.models.media import Media
from app.models.libraries import Library
from sqlalchemy import select, update
from sqlalchemy.dialects.postgresql import insert

from uuid import UUID

class MediaProgressRepository(BaseRepository[MediaProgress]):
    model = MediaProgress
    allowed_updates = {'current_position', 'last_watched', 'last_device_id'}

    async def fetch_media_progress_validate(
        self, user_id, media_id
    ) -> MediaProgress | None:
        """user -> lib -> media -> media progress"""
        stmt = (
            select(self.model)
            .join(Media, MediaProgress.media_id == Media.id)
            .join(Library, Media.library_id == Library.id)
            .where(
                Library.user_id == user_id,
                Media.id == media_id,
            )
        )

        result = await self.db.execute(stmt)

        return result.scalar_one_or_none()

    async def save_or_update(self, media_progress: MediaProgress):

        query = insert(MediaProgress).values(
            media_id=media_progress.media_id,
            current_position=media_progress.current_position,
            last_device_id=media_progress.last_device_id,
        )

        query = query.on_conflict_do_update(
            index_elements=[MediaProgress.media_id],
            set_={
                "current_position": query.excluded.current_position,
                "last_device_id": query.excluded.last_device_id,
            },
        )
        await self.db.execute(query)

    async def is_media_owned_by_user(self, media_id: UUID, user_id: UUID) -> bool:
        query = (
            select(Media.id)
            .join(Library, Library.id == Media.library_id)
            .where(Media.id == media_id, Library.user_id == user_id)
        )

        res = await self.db.execute(query)
        return res.scalar_one_or_none() is not None

    async def update_media_progress_validate(self, entity_id: UUID, user_id: UUID, **kwargs) -> bool:

        permitted_progress = (
            select(self.model.id)
            .join(Media, self.model.media_id == Media.id)
            .join(Library, Media.library_id == Library.id)
            .where(self.model.id == entity_id, Library.user_id == user_id)
        )

        return await self.update_entity_validate(permissions=permitted_progress, **kwargs)

    async def soft_delete_one_by_id(self, entity_id: UUID, user_id: UUID) -> bool:

        query = (
            select(self.model)
            .join(Media, Media.id == self.model.media_id)
            .join(Library, Library.id == Media.library_id)
            .where(Library.user_id == user_id, self.model.id == entity_id)
        )

        res = await self.db.execute(query)

        media_progress: MediaProgress | None = res.scalar_one_or_none()

        return self.soft_delete_entity(media_progress)
