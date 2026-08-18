
from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel
from datetime import datetime
from uuid import UUID


from app.models.sync_change import SyncOperation, EntityType


class SyncChangeWrite(BaseModel):

    model_config = ConfigDict(from_attributes=True, alias_generator=to_camel, validate_by_alias=True,
                              validate_by_name=True)

    device_id: UUID

    entity_type: EntityType
    entity_id: UUID
    operation: SyncOperation
    base_version: int | None = None
    payload: dict | None = None

class SyncChangeRead(BaseModel):

    model_config = ConfigDict(from_attributes=True, alias_generator=to_camel, validate_by_alias=True,
                              validate_by_name=True)
    id: UUID
    device_id: UUID

    entity_type: EntityType
    entity_id: UUID
    operation: SyncOperation
    base_version: int | None = None
    payload: dict | None = None
    created_at: datetime

