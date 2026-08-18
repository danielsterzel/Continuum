from app.repositories.media_repository import MediaRepository
from app.services.resolve.resolve_base import ResolveBase
from app.schemas.sync_change_schema import SyncChangeWrite

from app.models.sync_change import SyncOperation
from app.models.media import Media

class ResolveMedia(ResolveBase[MediaRepository]):

    class_operations = [
        SyncOperation.CREATE,
        SyncOperation.DELETE
    ]

    @staticmethod
    def deserialize_payload(payload: dict):

        return Media()


    async def sync_create(self):
        ...

    async def sync_update(self):
        ...

    async def sync_delete(self):
        ...

    async def resolve(self, change: SyncChangeWrite) -> None:
        ...
        if change.entity_type != "media":
            raise ValueError("Incorrect resolver")


        match change.operation:
            case SyncOperation.CREATE:
                ...

            case SyncOperation.UPDATE:
                ...
            case SyncOperation.DELETE:








