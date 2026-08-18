
from app.repositories.media_progress_repository import MediaProgressRepository
from app.schemas.sync_change_schema import SyncChangeWrite
from app.services.resolve.resolve_base import ResolveBase

class ResolveMediaProgress(ResolveBase[MediaProgressRepository]):

    async def resolve(self, change: SyncChangeWrite) -> None:
        ...