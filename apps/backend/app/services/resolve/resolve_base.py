from abc import ABC, abstractmethod

from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas.sync_change_schema import SyncChangeWrite
from uuid import UUID
from typing import Any
from app.models.sync_change import SyncOperation


class ResolveBase[T](ABC):
    repository_type: type[T]
    entity_type: str

    def __init__(self, user_id: UUID, db: AsyncSession):
        self.user_id = user_id
        self.db = db
        self.repository: T = self.repository_type(db)

    @abstractmethod
    async def sync_create(self, entity_id: UUID, payload: dict[str, Any]) -> None:
        ...
    @abstractmethod
    async def sync_update(self, entity_id: UUID, payload: dict[str, Any]) -> None:
        ...
    # not abstract because of media_progress
    async def sync_delete(self, entity_id: UUID) -> None:
        ...

    async def resolve(self, change: SyncChangeWrite) -> None:

        if change.entity_type != self.entity_type:
            raise ValueError(
                f"Incorrect resolver - expected {self.entity_type}"
            )

        match change.operation:
            case SyncOperation.CREATE:
                await self.sync_create(
                    entity_id=change.entity_id,
                    payload=change.payload
                )

            case SyncOperation.UPDATE:
                await self.sync_update(
                    entity_id=change.entity_id,
                    payload=change.payload
                )

            case SyncOperation.DELETE:
                await self.sync_delete(
                    entity_id=change.entity_id
                )
