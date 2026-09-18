from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import User
from app.models.sync_change import EntityType, SyncChange, SyncOperation
from app.repositories.device_repository import DeviceRepository
from app.repositories.sync_repository import SyncRepository
from app.schemas.sync_change_schema import SyncChangeWrite
from app.services.resolve.resolve_base import ResolveBase
from app.services.resolve.resolve_device import ResolveDevice
from app.services.resolve.resolve_media import ResolveMedia
from app.services.resolve.resolve_note import ResolveNote
from app.services.resolve.resolve_library import ResolveLibrary
from app.services.resolve.resolve_media_progress import ResolveMediaProgress
from app.services.EntityMapping import ENTITY_MAPPING
from uuid import UUID


class SyncService:
    """
    Synchronization: Receive SyncChange that includes operation, changed entity and it's fields,
    afterward use a resolver to apply changes in a way that does not yield any merge conflicts

    Synchronization conflict: conflict is based on the version of the saved entity and incoming one
    version decides whether there is a conflict.
    """

    def __init__(self, db: AsyncSession):
        self.sync_repository = SyncRepository(db)
        self.db = db

    async def prevent_race_condition(self, user_id: UUID):

        lock = select(User.id).where(User.id == user_id).with_for_update()

        result = await self.db.execute(lock)

        if result.scalar_one_or_none() is None:
            raise ValueError("User not found")

    async def _validate_device(self, device_id: UUID, user_id: UUID) -> None:

        device_repository = DeviceRepository(self.db)

        res = await device_repository.fetch_device_by_id_and_user_id(
            device_id=device_id, user_id=user_id
        )

        if not res:
            raise ValueError(f"SYNC PERMISSION DENIED for : {user_id}")

    async def sync(self, changes: list[SyncChangeWrite], user_id: UUID) -> None:
        try:
            # A: version1, B: version1 -> A processed, B in parallel -> mno conflict detected despite
            # conflict
            await self.prevent_race_condition(user_id=user_id)
            for change in changes:
                sync_push_id = change.id

                exists = await self.sync_repository.fetch(entity_id=sync_push_id)
                if exists:
                    continue

                is_device_registration = (
                    change.entity_type == EntityType.Device
                    and change.operation == SyncOperation.CREATE
                )
                if not is_device_registration:
                    await self._validate_device(
                        device_id=change.device_id, user_id=user_id
                    )

                if (
                    change.operation == SyncOperation.DELETE
                    and change.entity_type == EntityType.MediaProgress
                ):
                    # no delete defined for media_progress
                    continue

                resolver = self._get_resolver(change, user_id)

                current_response = await resolver.get_current_entity(
                    entity_id=change.entity_id,
                    sync_operation=change.operation,
                )

                current_entity = current_response["object"]

                if current_entity == "create":
                    resolved_entity_id = await resolver.resolve(change)

                elif current_entity is None:
                    raise ValueError("Entity not found and operation is not CREATE")

                elif current_entity.version == change.expected_version:
                    resolved_entity_id = await resolver.resolve(change)

                else:
                    resolved_entity_id = await resolver.resolve_conflict(change)

                sync_data = change.model_dump()
                sync_data["entity_id"] = resolved_entity_id
                sync_entity = SyncChange(**sync_data)

                await self.sync_repository.save(sync_entity)

                await self.sync_repository.increment_version(
                    ENTITY_MAPPING[change.entity_type], resolved_entity_id
                )

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
            case EntityType.Device:
                return ResolveDevice(user_id=user_id, db=self.db)
            case _:
                raise ValueError(f"Unsupported entity type: {change.entity_type}")
