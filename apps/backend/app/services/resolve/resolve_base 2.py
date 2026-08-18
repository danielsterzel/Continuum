from abc import ABC, abstractmethod

from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas.sync_change_schema import SyncChangeWrite
from uuid import UUID


class ResolveBase[T](ABC):
    repository_type: type[T]

    def __init__(self, user_id: UUID, db: AsyncSession):
        self.user_id = user_id
        self.db = db
        self.repository: T = self.repository_type(db)

    @abstractmethod
    async def resolve(self, change: SyncChangeWrite) -> None: ...
