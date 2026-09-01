from app.repositories.media_repository import MediaRepository
from app.schemas.media_schema import MediaSyncPayload
from app.services.resolve.resolve_base import ResolveBase
from app.models.media import Media
from uuid import UUID
from typing import Any


class ResolveMedia(ResolveBase[MediaRepository]):
    repository_type = MediaRepository
    entity_type = "media"

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
