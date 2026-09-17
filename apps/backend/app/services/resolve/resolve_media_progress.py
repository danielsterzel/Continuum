from typing import Any
from uuid import UUID

from app.repositories.media_progress_repository import MediaProgressRepository
from app.schemas.media_progress_schema import MediaProgressSyncPayload
from app.schemas.sync_change_schema import SyncChangeWrite
from app.services.resolve.resolve_base import ResolveBase
from app.models.media_progress import MediaProgress
from app.models.sync_change import SyncOperation


class ResolveMediaProgress(ResolveBase[MediaProgressRepository]):
    repository_type = MediaProgressRepository
    entity_type = "media_progress"

    async def get_current_entity(
        self, entity_id: UUID, sync_operation: SyncOperation
    ) -> dict[str, Any]:
        if sync_operation == SyncOperation.CREATE:
            return {"object": "create"}

        current_entity = await self.repository.fetch_by_id_and_user(
            media_progress_id=entity_id, user_id=self.user_id
        )

        return {"object": current_entity}

    @staticmethod
    def deserialize_payload(entity_id: UUID, payload: dict[str, Any]):
        payload = MediaProgressSyncPayload.model_validate(payload).model_dump()

        return MediaProgress(
            id=entity_id,
            **payload,
        )

    async def sync_create(self, entity_id, payload) -> UUID:

        progress = self.deserialize_payload(entity_id=entity_id, payload=payload)

        validate_permission = await self.repository.is_media_owned_by_user(
            media_id=progress.media_id, user_id=self.user_id
        )

        if not validate_permission:
            raise ValueError("SYNC CREATE MEDIA_PROGRESS - PERMISSION DENIED")

        return await self.repository.save_or_update(progress)

    async def sync_update(self, entity_id, payload) -> UUID:

        payload = MediaProgressSyncPayload.model_validate(payload).model_dump()

        saved_progress = await self.repository.fetch_media_progress_validate(
            user_id=self.user_id, media_id=payload["media_id"]
        )

        if not saved_progress:
            raise ValueError("SYNC UPDATE MEDIA_PROGRESS - PROGRESS NOT FOUND")

        db_res = await self.repository.update_media_progress_validate(
            entity_id=saved_progress.id, user_id=self.user_id, **payload
        )

        if not db_res:
            raise ValueError("SYNC UPDATE MEDIA_PROGRESS - FAILED UPDATE")

        return saved_progress.id

    async def resolve_conflict(self, change: SyncChangeWrite) -> UUID:

        saved_entity = await self.repository.fetch_by_id_and_user(
            media_progress_id=change.entity_id, user_id=self.user_id
        )

        if not saved_entity:
            raise ValueError("No such entity ID")

        if change.operation == SyncOperation.UPDATE:
            payload_parsed = self.deserialize_payload(
                change.entity_id,
                change.payload
            )

            allowed = {
                field: value
                for field, value in change.payload.items()
                if field in self.repository.allowed_updates
            }

            if saved_entity.last_watched < payload_parsed.last_watched:
                await self.repository.update_media_progress_validate(
                    entity_id=saved_entity.id,
                    user_id=self.user_id,
                    **allowed
                )
            return saved_entity.id

        else: raise ValueError("Incorrect operation")
