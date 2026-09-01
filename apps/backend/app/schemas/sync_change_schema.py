from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel
from datetime import datetime
from uuid import UUID
from typing import Any

from app.models.sync_change import SyncOperation, EntityType
from app.schemas.library_schema import LibraryRead
from app.schemas.media_progress_schema import MediaProgressRead
from app.schemas.media_schema import MediaRead
from app.schemas.note_schema import NoteRead


class SyncChangeWrite(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
        alias_generator=to_camel,
        validate_by_alias=True,
        validate_by_name=True,
    )

    device_id: UUID

    entity_type: EntityType
    entity_id: UUID
    operation: SyncOperation
    expected_version: int
    payload: dict[str, Any] | None = None


class SyncChangeRead(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
        alias_generator=to_camel,
        validate_by_alias=True,
        validate_by_name=True,
    )
    id: UUID
    device_id: UUID

    entity_type: EntityType
    entity_id: UUID
    operation: SyncOperation
    expected_version: int
    payload: dict[str, Any] | None = None
    created_at: datetime


class SyncStateRead(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
        alias_generator=to_camel,
        validate_by_alias=True,
        validate_by_name=True,
    )
    libraries: list[LibraryRead]
    media: list[MediaRead]
    notes: list[NoteRead]
    media_progress: list[MediaProgressRead]
