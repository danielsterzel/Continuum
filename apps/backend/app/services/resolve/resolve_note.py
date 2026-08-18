from sqlalchemy.exc import SQLAlchemyError

from app.models.sync_change import SyncOperation
from app.repositories.note_repository import NoteRepository
from app.schemas.sync_change_schema import SyncChangeWrite
from app.services.resolve.resolve_base import ResolveBase
from uuid import UUID
from app.models.note import Note

class ResolveNote(ResolveBase[NoteRepository]):

    @staticmethod
    def deserialize_payload_as_note(payload: dict):
        """ celowo pomijam tutaj edge case: user zrobil notatke i usunal zanim sync
            dlatego nie ma deleted_at
        """
        return Note(media_id=payload['media_id'],
                    title=payload['title'],
                    content=payload['content'],
                    timestamp=payload['timestamp'])

    async def sync_create(self, note_id: UUID, payload: dict):


        note = self.deserialize_payload_as_note(payload)
        note.id = note_id

        check_user_permission = await self.repository.is_media_owned_by_user(media_id=note.media_id, user_id=self.user_id)
        if not check_user_permission:
            raise ValueError("PERMISSION DENIED - DROPPING CREATE NOTE - SYNC")

        await self.repository.save(note)

    async def sync_update(self, note_id : UUID, payload: dict):

        db_res = await self.repository.update_note(note_id=note_id, user_id=self.user_id, **payload)
        if not db_res:
            raise ValueError("Failed to execute sync update")

    async def sync_delete(self, note_id):
        db_res = await self.repository.soft_delete_one_by_id(user_id=self.user_id, note_id=note_id)
        if not db_res:
            raise ValueError("Failed to execute sync delete")

    async def resolve(self, change: SyncChangeWrite) -> None:

        if change.entity_type != "note":
            raise ValueError("Incorrect resolver - type is not 'note'")

        match change.operation:
            case SyncOperation.CREATE:

                await self.sync_create(note_id=change.entity_id, payload=change.payload)

            case SyncOperation.UPDATE:

                saved_note = await self.repository.fetch_by_user(self.user_id, change.entity_id)

                if not saved_note:
                    raise ValueError("Invalid operation: couldn't execute note fetch")

                await self.sync_update(note_id=change.entity_id, payload=change.payload)

            case SyncOperation.DELETE:

                await self.sync_delete(note_id=change.entity_id)
