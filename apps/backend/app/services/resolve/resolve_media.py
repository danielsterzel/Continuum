
from app.repositories.media_repository import MediaRepository
from app.services.resolve.resolve_base import ResolveBase
from app.schemas.sync_change_schema import SyncChangeWrite

from app.models.sync_change import SyncOperation
from app.models.media import Media


class ResolveMedia(ResolveBase[MediaRepository]):

    @staticmethod
    def deserialize_payload( payload: dict, entity_id):

        return Media(id=entity_id, **payload)

    async def sync_create(self, payload, entity_id) -> None:

        media = self.deserialize_payload(payload, entity_id)

        validate_user = await self.repository.resolve_media_user(library_id=media.library_id, user_id=self.user_id)

        if not validate_user:
            raise ValueError("[MEDIA CREATE] - No permission to sync")

        await self.repository.save(media)

    async def sync_update(self, media_id, user_id, payload):

        db_res = await self.repository.update_media_validate(media_id, user_id, **payload)
        if not db_res:
            raise ValueError("Failed update Media - sync")

    async def sync_delete(self, media_id) -> None:

        db_res = await self.repository.soft_delete_one_by_id(media_id=media_id, user_id=self.user_id)
        if not db_res:
            raise ValueError("DELETE MEDIA - FAIL in sync")

    async def resolve(self, change: SyncChangeWrite) -> None:

        if change.entity_type != "media":
            raise ValueError("Incorrect resolver")

        match change.operation:
            case SyncOperation.CREATE:

                await self.sync_create(change.payload, change.entity_id)

            case SyncOperation.UPDATE:

                await self.sync_update(change.entity_id, user_id=self.user_id, payload=change.payload)

            case SyncOperation.DELETE:

                await self.sync_delete(change.entity_id)
