from app.models.sync_change import SyncChange
from app.repositories.base_repository import BaseRepository
from app.services.EntityMapping import ENTITY_UNION
from sqlalchemy import update

from uuid import UUID


class SyncRepository(BaseRepository[SyncChange]):
    model = SyncChange

    async def increment_version(self, entity_type: type[ENTITY_UNION], entity_id: UUID):

        query = (
            update(entity_type)
            .where(entity_type.id == entity_id)
            .values(version=entity_type.version + 1)
        )

        res = await self.db.execute(query)

        if res.rowcount != 1:
            raise ValueError("SYNC - failed to increment entity version")
