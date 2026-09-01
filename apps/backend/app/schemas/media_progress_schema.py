from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel
from datetime import timedelta, datetime
from uuid import UUID


class MediaProgressRead(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
        alias_generator=to_camel,
        validate_by_alias=True,
        validate_by_name=True,
        ser_json_temporal="seconds",
    )
    id: UUID
    media_id: UUID
    current_position: timedelta | None
    last_watched: datetime
    last_device_id: UUID | None
    version: int


class MediaProgressWrite(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
        alias_generator=to_camel,
        validate_by_alias=True,
        validate_by_name=True,
    )

    current_position: timedelta | None
    last_device_id: str | None


class MediaProgressSyncPayload(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
        alias_generator=to_camel,
        validate_by_alias=True,
        validate_by_name=True,
    )

    media_id: UUID
    current_position: int | None
    last_watched: datetime
    last_device_id: UUID | None
