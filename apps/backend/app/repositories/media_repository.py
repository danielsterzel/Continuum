from app.repositories.base_repository import BaseRepository
from app.models.media import Media
from app.models.libraries import Library

from uuid import UUID
from datetime import datetime, timezone

from sqlalchemy import select, and_


class MediaRepository(BaseRepository[Media]):

    model = Media

    allowed_updates = {'filename', 'thumbnail_url', 'rating'}

    async def fetch_by_library(self, library_id: UUID) -> list[Media]:

        query = select(Media).where(Media.library_id == library_id)

        list_media = await self.db.execute(query)

        return list(list_media.scalars().all())

    async def fetch_one_by_library(
        self, library_id: UUID, media_id: UUID
    ) -> Media | None:

        query = select(Media).where(
            and_(Media.library_id == library_id, Media.id == media_id)
        )
        res = await self.db.execute(query)

        return res.scalar_one_or_none()
    async def fetch_all_by_user(self, user_id) -> list[Media]:
        query = (
            select(self.model)
            .join(Library, self.model.library_id == Library.id)
            .where(Library.user_id == user_id)
        )

        res = await self.db.execute(query)

        return list(res.scalars().all())

    async def fetch_one_by_user(self, media_id: UUID, user_id: UUID) -> Media | None:

        query = (
            select(self.model)
            .join(Library, Media.library_id == Library.id)
            .where(Media.id == media_id, Library.user_id == user_id)
        )

        res = await self.db.execute(query)

        return res.scalar_one_or_none()

    async def resolve_media_user(self, library_id: UUID, user_id: UUID) -> bool:

        query = (
            select(Library)
            .where(Library.user_id == user_id, Library.id == library_id)
        )

        res = await self.db.execute(query)

        return res.scalar_one_or_none() is not None

    async def update_media_validate(
            self,
            entity_id: UUID,
            user_id: UUID,
            **kwargs
    ) -> bool:

        permitted_media = (
            select(self.model.id)
            .join(Library, Library.id == self.model.library_id)
            .where(
                Library.user_id == user_id,
                self.model.id == entity_id
            )
        )

        return await self.update_entity_validate(permissions=permitted_media, **kwargs)

    async def soft_delete_one_by_id(self, entity_id: UUID, user_id: UUID) -> bool:

        query = (select(self.model)
            .join(Library, Library.id == self.model.library_id)
            .where(
            Library.user_id == user_id,
            self.model.id == entity_id
            ))

        res = await self.db.execute(query)

        media: Media | None = res.scalar_one_or_none()

        return self.soft_delete_entity(media)