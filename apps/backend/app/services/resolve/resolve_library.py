
from app.repositories.library_repository import LibraryRepository
from app.schemas.library_schema import LibrarySyncPayload
from app.services.resolve.resolve_base import ResolveBase
from app.models.libraries import Library
from typing import Any
from uuid import UUID
class ResolveLibrary(ResolveBase[LibraryRepository]):

    repository_type = LibraryRepository
    entity_type = "library"

    @staticmethod
    def deserialize_library(entity_id: UUID, payload: dict[str, Any]):

        return Library(id=entity_id, **LibrarySyncPayload.model_validate(payload).model_dump())

    async def sync_create(self, entity_id: UUID, payload: dict[str, Any]) -> None:

        if payload["user_id"] != str(self.user_id):
            raise ValueError("Library owner does not match sync user")

        library = self.deserialize_library(entity_id=entity_id, payload=payload,)
        await self.repository.save(library)

    async def sync_update(self, entity_id: UUID, payload: dict[str, Any]) -> None:
        db_res = await self.repository.update_library_validate(entity_id=entity_id, user_id=self.user_id, **payload)
        if not db_res:
            raise ValueError("UPDATE SYNC LIBRARY - failure")

    async def sync_delete(self, entity_id: UUID) -> None:

        db_res = await self.repository.soft_delete_one_by_id(entity_id=entity_id, user_id=self.user_id)

        if not db_res:
            raise ValueError("DELETE SYNC LIBRARY - failure")
