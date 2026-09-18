from app.repositories.note_repository import NoteRepository
from app.schemas.note_schema import NoteSyncPayload
from app.schemas.sync_change_schema import SyncChangeWrite
from app.services.resolve.resolve_base import ResolveBase
from app.models.note import Note

from typing import Any
from uuid import UUID, uuid5
from app.models.sync_change import SyncOperation


class ResolveNote(ResolveBase[NoteRepository]):
    repository_type = NoteRepository
    entity_type = "note"

    async def get_current_entity(
        self, entity_id: UUID, sync_operation: SyncOperation
    ) -> dict[str, Any]:
        if sync_operation == SyncOperation.CREATE:
            return {"object": "create"}

        current_entity = await self.repository.fetch_by_user(
            note_id=entity_id, user_id=self.user_id
        )

        return {"object": current_entity}

    @staticmethod
    def deserialize_payload(entity_id: UUID, payload: dict[str, Any]):
        """celowo pomijam tutaj edge case: user zrobil notatke i usunal zanim sync
        dlatego nie ma deleted_at

        to actually moze byc problematyczne bo wsm nie wiem czy to usunie z syncQueue
        musze to ogarnac jeszcze
        TODO
        """
        return Note(
            id=entity_id, **NoteSyncPayload.model_validate(payload).model_dump()
        )

    async def sync_create(self, entity_id: UUID, payload: dict[str, Any]) -> None:

        note = self.deserialize_payload(entity_id=entity_id, payload=payload)

        check_user_permission = await self.repository.is_media_owned_by_user(
            media_id=note.media_id, user_id=self.user_id
        )
        if not check_user_permission:
            raise ValueError("PERMISSION DENIED - DROPPING CREATE NOTE - SYNC")

        await self.repository.save(note)

    async def sync_update(self, entity_id: UUID, payload: dict[str, Any]) -> None:
        validated_payload = NoteSyncPayload.model_validate(payload).model_dump()

        db_res = await self.repository.update_note_validate(
            entity_id=entity_id, user_id=self.user_id, **validated_payload
        )
        if not db_res:
            raise ValueError("Failed to execute sync update")

    async def sync_delete(self, entity_id: UUID) -> None:
        db_res = await self.repository.soft_delete_one_by_id(
            user_id=self.user_id, entity_id=entity_id
        )
        if not db_res:
            raise ValueError("Failed to execute sync delete")

    async def resolve_conflict(self, change: SyncChangeWrite) -> UUID:

        saved_entity = await self.repository.fetch_by_user(
            note_id=change.entity_id, user_id=self.user_id
        )

        if not saved_entity:
            raise ValueError("No such entity ID")

        match change.operation:
            case SyncOperation.UPDATE:
                payload_parsed = self.deserialize_payload(
                    change.entity_id, change.payload
                )

                for field in change.payload:
                    if field not in self.repository.allowed_updates:
                        continue

                    if field == "title":
                        # LWW
                        if saved_entity.updated_at < payload_parsed.updated_at:
                            new_title = payload_parsed.title
                            await self.repository.update_note_validate(
                                entity_id=saved_entity.id,
                                user_id=self.user_id,
                                **{field: new_title},
                            )

                    elif field == "content":
                        # MultiValue Preserver - moj wlasny typ CRDT bazujacy na MVR

                        if saved_entity.content == payload_parsed.content:
                            continue
                        conflict_title = "[CONFLICTED] " + saved_entity.title

                        await self.repository.update_note_validate(
                            entity_id=saved_entity.id,
                            user_id=self.user_id,
                            **{"title": conflict_title},
                        )

                        # uuid5 used for deterministic id
                        # needed for idempotency -> needed for CRDT
                        conflict_id = uuid5(change.entity_id, str(change.id))

                        payload_parsed.id = conflict_id
                        await self.repository.save(payload_parsed)

                    elif field == "timestamp":
                        # LWW
                        if saved_entity.updated_at < payload_parsed.updated_at:
                            new_timestamp = payload_parsed.timestamp
                            await self.repository.update_note_validate(
                                entity_id=saved_entity.id,
                                user_id=self.user_id,
                                **{field: new_timestamp},
                            )

                return saved_entity.id

            case SyncOperation.DELETE:
                # Persist note
                return saved_entity.id
            case _:
                raise ValueError("Invalid Sync Operation")
