from abc import ABC

from sqlalchemy.ext.asyncio import AsyncSession

from sqlalchemy import select, delete, update, Select

from uuid import UUID
from datetime import datetime, timezone


class BaseRepository[T](ABC):
    model: type[T]
    allowed_updates: set[str]

    PermissionQueryType = Select[tuple[UUID]]

    def __init__(self, db: AsyncSession):
        self.db = db

    async def save(self, obj: T) -> None:

        self.db.add(obj)
        await self.db.flush([obj])

    async def fetch(self, entity_id: UUID) -> T | None:

        query = select(self.model).where(self.model.id == entity_id)

        result = await self.db.execute(query)

        return result.scalar_one_or_none()

    async def remove(self, entity_id: UUID) -> None:

        query = delete(self.model).where(self.model.id == entity_id)

        await self.db.execute(query)
        await self.db.flush()

    async def update_entity_validate(self, permissions: PermissionQueryType, **kwargs) -> bool:

        kwargs = {
            key: value
            for key, value in kwargs.items()
            if key in self.allowed_updates
        }

        if not kwargs:
            return False


        query = (
            update(self.model).where(self.model.id.in_(permissions)).values(**kwargs)
        )

        res = await self.db.execute(query)

        return res.rowcount == 1

    # async def fetch_by_user_join_media_library(self, entity_id: UUID, user_id: UUID) -> T | None:
    #
    #     query = (
    #         select(self.model)
    #         .join(Media, Media.id == self.model.media_id)
    #         .join(Library, Library.id == Media.library_id)
    #         .where(Library.user_id == user_id, self.model.id == entity_id)
    #     )
    #
    #     entity = await self.db.execute(query)
    #     return entity.scalar_one_or_none()

    @staticmethod
    def soft_delete_entity(saved_entity: T | None) -> bool:

        if not saved_entity:
            return False

        if not hasattr(saved_entity, "deleted_at"):
            return False

        if saved_entity.deleted_at:
            return True

        saved_entity.deleted_at = datetime.now(timezone.utc)
        return True
