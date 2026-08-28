from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel

from app.models.media import MediaType

from uuid import UUID
from datetime import datetime, timedelta


class MediaRead(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
        alias_generator=to_camel,
        validate_by_alias=True,
        validate_by_name=True,
    )

    id: UUID
    library_id: UUID
    filename: str = Field(..., max_length=128)
    file_size: int
    media_type: MediaType
    duration: timedelta | None
    thumbnail_url: str | None
    rating: int | None
    created_at: datetime
    updated_at: datetime
    version: int
    deleted_at: datetime | None

class MediaSyncPayload(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
        alias_generator=to_camel,
        validate_by_alias=True,
        validate_by_name=True,
    )


