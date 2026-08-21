from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import update

from app.models.sync_change import EntityType, SyncChange, SyncOperation
from app.repositories.device_repository import DeviceRepository
from app.schemas.sync_change_schema import SyncChangeWrite
from app.services.resolve.resolve_base import ResolveBase
from app.services.resolve.resolve_media import ResolveMedia
from app.services.resolve.resolve_note import ResolveNote
from app.services.resolve.resolve_library import ResolveLibrary
from app.services.resolve.resolve_media_progress import ResolveMediaProgress
from app.services.EntityMapping import ENTITY_MAPPING, ENTITY_UNION
from uuid import UUID


class SyncService:
    """IMPLEMENT CREATE SYNC_CHANGE ROW"""

    """
    if change.base_version == entity.version:
        # normal write
    else:
        # concurrent/stale write
        await resolve_conflict(...)"""

    """
    if change.base_version == entity.version:
        # klient pracował na aktualnej wersji
        ...
    else:
        # klient pracował na starej wersji
        ...
    """


    def __init__(self, db: AsyncSession):
        self.db = db

    async def __increment_version(self, entity_type: type[ENTITY_UNION], entity_id : UUID):

        query = (
            update(entity_type)
            .where(entity_type.id == entity_id)
            .values(version=entity_type.version + 1)
        )

        res = await self.db.execute(query)

        if res.rowcount != 1:
            raise ValueError("SYNC - failed to increment entity version")

    async def _validate_device(self, device_id: UUID, user_id: UUID) -> None:

        device_repository = DeviceRepository(self.db)

        res = await device_repository.fetch_device_by_id_and_user_id(device_id=device_id, user_id=user_id)

        if not res:
            raise ValueError("SYNC PERMISSION DENIED")

    async def sync(self, changes: list[SyncChangeWrite], user_id: UUID) -> None:
        try:
            for change in changes:

                await self._validate_device(device_id=change.device_id, user_id=user_id)

                if change.operation == SyncOperation.DELETE and change.entity_type == EntityType.MediaProgress:
                    # no delete defined for media_progress
                    continue
                await self._validate_device(change.device_id, user_id)

                resolver = self._get_resolver(change, user_id)
                await resolver.resolve(change)

                sync_entity = SyncChange(**change.model_dump())

                self.db.add(sync_entity)

                await self.__increment_version(ENTITY_MAPPING[change.entity_type], change.entity_id)

            await self.db.commit()

        except (SQLAlchemyError, ValueError, KeyError, TypeError, AttributeError):

            await self.db.rollback()
            raise

    def _get_resolver(self, change: SyncChangeWrite, user_id: UUID) -> ResolveBase:

        match change.entity_type:
            case EntityType.Media:
                return ResolveMedia(user_id=user_id, db=self.db)
            case EntityType.MediaProgress:
                return ResolveMediaProgress(user_id=user_id, db=self.db)
            case EntityType.Library:
                return ResolveLibrary(user_id=user_id, db=self.db)
            case EntityType.Note:
                return ResolveNote(user_id=user_id, db=self.db)
            case _:
                raise ValueError(f"Unsupported entity type: {change.entity_type}")

