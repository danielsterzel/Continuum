from app.repositories.media_progress_repository import MediaProgressRepository
from app.schemas.media_progress_schema import MediaProgressSyncPayload
from app.services.resolve.resolve_base import ResolveBase
from app.models.media_progress import MediaProgress

"""to be refactored"""
from app.repositories.ownership import is_media_owned_by_user

from uuid import UUID
from typing import Any


class ResolveMediaProgress(ResolveBase[MediaProgressRepository]):
    repository_type = MediaProgressRepository
    entity_type = "media_progress"

    @staticmethod
    def deserialize_payload(entity_id: UUID, payload: dict[str, Any]):
        return MediaProgress(
            id=entity_id,
            **MediaProgressSyncPayload.model_validate(payload).model_dump(),
        )

    async def sync_create(self, entity_id, payload) -> None:

        progress = self.deserialize_payload(entity_id=entity_id, payload=payload)

        validate_permission = await self.repository.is_media_owned_by_user(
            media_id=progress.media_id, user_id=self.user_id
        )

        if not validate_permission:
            raise ValueError("SYNC CREATE MEDIA_PROGRESS - PERMISSION DENIED")

        await self.repository.save(progress)

    async def sync_update(self, entity_id, payload) -> None:

        db_res = await self.repository.update_media_progress_validate(
            entity_id=entity_id, user_id=self.user_id, **payload
        )

        if not db_res:
            raise ValueError("SYNC UPDATE MEDIA_PROGRESS - FAILED UPDATE")
