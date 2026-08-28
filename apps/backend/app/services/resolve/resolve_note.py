
from app.repositories.note_repository import NoteRepository
from app.schemas.note_schema import NoteSyncPayload
from app.services.resolve.resolve_base import ResolveBase
from app.models.note import Note

from typing import Any
from uuid import UUID
class ResolveNote(ResolveBase[NoteRepository]):

    repository_type = NoteRepository
    entity_type = "note"

    @staticmethod
    def deserialize_payload_as_note(entity_id: UUID, payload: dict[str, Any]):
        """celowo pomijam tutaj edge case: user zrobil notatke i usunal zanim sync
        dlatego nie ma deleted_at
        """
        return Note(
            id=entity_id,**NoteSyncPayload.model_validate(payload).model_dump()
        )

    async def sync_create(self, entity_id: UUID, payload: dict[str, Any]) -> None:

        note = self.deserialize_payload_as_note(entity_id=entity_id, payload=payload)

        check_user_permission = await self.repository.is_media_owned_by_user(
            media_id=note.media_id, user_id=self.user_id
        )
        if not check_user_permission:
            raise ValueError("PERMISSION DENIED - DROPPING CREATE NOTE - SYNC")

        await self.repository.save(note)

    async def sync_update(self, entity_id: UUID, payload: dict[str, Any]) -> None:

        db_res = await self.repository.update_note_validate(
            entity_id=entity_id, user_id=self.user_id, **payload
        )
        if not db_res:
            raise ValueError("Failed to execute sync update")

    async def sync_delete(self, entity_id: UUID) -> None:
        db_res = await self.repository.soft_delete_one_by_id(
            user_id=self.user_id, entity_id=entity_id
        )
        if not db_res:
            raise ValueError("Failed to execute sync delete")
