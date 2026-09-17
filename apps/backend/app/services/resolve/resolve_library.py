from app.repositories.library_repository import LibraryRepository
from app.schemas.library_schema import LibrarySyncPayload
from app.services.resolve.resolve_base import ResolveBase
from app.models.libraries import Library
from typing import Any
from uuid import UUID
from app.models.sync_change import SyncOperation
from app.schemas.sync_change_schema import SyncChangeWrite


class ResolveLibrary(ResolveBase[LibraryRepository]):
    repository_type = LibraryRepository
    entity_type = "library"

    async def get_current_entity(
        self, entity_id: UUID, sync_operation: SyncOperation
    ) -> dict[str, Any]:
        if sync_operation == SyncOperation.CREATE:
            return {"object": "create"}

        current_entity = await self.repository.fetch_single_by_user(
            library_id=entity_id, user_id=self.user_id
        )

        return {"object": current_entity}

    @staticmethod
    def deserialize_payload(entity_id: UUID, payload: dict[str, Any]):

        return Library(
            id=entity_id, **LibrarySyncPayload.model_validate(payload).model_dump()
        )

    async def sync_create(self, entity_id: UUID, payload: dict[str, Any]) -> None:

        if payload["user_id"] != str(self.user_id):
            raise ValueError("Library owner does not match sync user")

        library = self.deserialize_payload(
            entity_id=entity_id,
            payload=payload,
        )
        existing = await self.repository.fetch_single_by_user(
            library_id=entity_id, user_id=self.user_id
        )
        if existing:
            return

        await self.repository.save(library)

    async def sync_update(self, entity_id: UUID, payload: dict[str, Any]) -> None:
        db_res = await self.repository.update_library_validate(
            entity_id=entity_id, user_id=self.user_id, **payload
        )
        if not db_res:
            raise ValueError("UPDATE SYNC LIBRARY - failure")

    async def sync_delete(self, entity_id: UUID) -> None:

        db_res = await self.repository.soft_delete_one_by_id(
            entity_id=entity_id, user_id=self.user_id
        )

        if not db_res:
            raise ValueError("DELETE SYNC LIBRARY - failure")

    async def resolve_conflict(self, change: SyncChangeWrite) -> UUID:

        saved_entity = await self.repository.fetch_single_by_user(
            library_id=change.entity_id, user_id=self.user_id
        )

        if not saved_entity:
            raise ValueError("No such entity ID")

        match change.operation:
            case SyncOperation.UPDATE:

                payload_parsed = self.deserialize_payload(change.entity_id, change.payload)

                for field in change.payload:
                    if field not in self.repository.allowed_updates:
                        continue

                    if field == "name":
                        # LWW
                        if saved_entity.updated_at < payload_parsed.updated_at:

                            new_name = payload_parsed.name

                            await self.repository.update_library_validate(
                                entity_id=saved_entity.id, user_id=self.user_id,
                                **{field: new_name}
                            )

                    elif field == "description":
                        # MVR

                        if saved_entity.description == payload_parsed.description:
                            continue

                        if not saved_entity.description:
                            new_description = payload_parsed.description
                        elif not payload_parsed.description:
                            new_description = saved_entity.description
                        else:
                            new_description = (saved_entity.description
                                               +
                                               "\n\n=====[CONFLICTED BELOW]=====\n\n"
                                               +
                                               payload_parsed.description)

                        await self.repository.update_library_validate(
                            entity_id=saved_entity.id, user_id=self.user_id,
                            **{"description": new_description}
                        )

                return saved_entity.id

            case SyncOperation.DELETE:
                # Persist Library
                return saved_entity.id
            case _:
                raise ValueError("Invalid Sync Operation")
