from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.sync_change import EntityType
from app.schemas.sync_change_schema import SyncChangeWrite
from app.services.resolve.resolve_base import ResolveContract
from app.services.resolve.resolve_media import ResolveMedia
from app.services.resolve.resolve_note import ResolveNote
from app.services.resolve.resolve_library import ResolveLibrary
from app.services.resolve.resolve_media_progress import ResolveMediaProgress

from uuid import UUID


class SyncService:
    """IMPLEMENT CREATE SYNC_CHANGE ROW"""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def sync(self, changes: list[SyncChangeWrite], user_id: UUID) -> None:
        for change in changes:
            resolver = self._get_resolver(change, user_id)
            await resolver.resolve()

    def _get_resolver(self, change: SyncChangeWrite, user_id: UUID) -> ResolveContract:

        # try:
        match change.entity_type:
            case EntityType.Media:
                return ResolveMedia(change, self.db, user_id)
            case EntityType.MediaProgress:
                return ResolveMediaProgress(change, self.db, user_id)
            case EntityType.Library:
                return ResolveLibrary(change, self.db, user_id)
            case EntityType.Note:
                return ResolveNote(change, self.db, user_id)

        # except SQLAlchemyError:
        #     await self.db.rollback()
        #     raise
