from app.repositories.media_repository import MediaRepository
from app.schemas.media_schema import MediaSyncPayload
from app.schemas.sync_change_schema import SyncChangeWrite
from app.services.resolve.resolve_base import ResolveBase
from app.models.media import Media
from uuid import UUID
from typing import Any
from app.models.sync_change import SyncOperation


class ResolveMedia(ResolveBase[MediaRepository]):
    repository_type = MediaRepository
    entity_type = "media"

    async def get_current_entity(
        self, entity_id: UUID, sync_operation: SyncOperation
    ) -> dict[str, Any]:
        if sync_operation == SyncOperation.CREATE:
            return {"object": "create"}

        current_entity = await self.repository.fetch_one_by_user(
            media_id=entity_id, user_id=self.user_id
        )

        return {"object": current_entity}

    @staticmethod
    def deserialize_payload(
        entity_id,
        payload: dict,
    ):

        return Media(
            id=entity_id, **MediaSyncPayload.model_validate(payload).model_dump()
        )

    async def sync_create(self, entity_id: UUID, payload: dict[str, Any]) -> None:

        media = self.deserialize_payload(entity_id=entity_id, payload=payload)

        validate_user = await self.repository.resolve_media_user(
            library_id=media.library_id, user_id=self.user_id
        )

        if not validate_user:
            raise ValueError("[MEDIA CREATE] - No permission to sync")

        await self.repository.save(media)

    async def sync_update(self, entity_id: UUID, payload: dict[str, Any]) -> None:

        db_res = await self.repository.update_media_validate(
            entity_id, self.user_id, **payload
        )
        if not db_res:
            raise ValueError("Failed update Media - sync")

    async def sync_delete(self, entity_id: UUID) -> None:

        db_res = await self.repository.soft_delete_one_by_id(
            entity_id=entity_id, user_id=self.user_id
        )
        if not db_res:
            raise ValueError("DELETE MEDIA - FAIL in sync")

    async def resolve_conflict(self, change: SyncChangeWrite) -> UUID:

        saved_entity = await self.repository.fetch_one_by_user(
            media_id=change.entity_id, user_id=self.user_id
        )

        if not saved_entity:
            raise ValueError("No such entity ID")

        match change.operation:
            case SyncOperation.UPDATE:
                payload_parsed = self.deserialize_payload(
                    change.entity_id, change.payload
                )

                # LWW for everything allowed
                allowed = {
                    field: getattr(payload_parsed, field)
                    for field in change.payload
                    if field in self.repository.allowed_updates
                }

                if saved_entity.updated_at < payload_parsed.updated_at:
                    await self.repository.update_media_validate(
                        entity_id=saved_entity.id,
                        user_id=self.user_id,
                        **{field: value for field, value in allowed.items()},
                    )

                return saved_entity.id

            case SyncOperation.DELETE:
                # Persist Media
                return saved_entity.id
            case _:
                raise ValueError("Invalid Sync Operation")
