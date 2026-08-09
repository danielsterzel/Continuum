from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel

from app.models.media import MediaType

from uuid import UUID
from datetime import datetime, timedelta


class MediaRead(BaseModel):
    model_config = ConfigDict(from_attributes=True, alias_generator=to_camel, validate_by_name=True,
        validate_by_alias=True)

    id: UUID
    library_id: UUID
    filename: str
    file_size: int
    media_type: MediaType
    duration: timedelta | None
    thumbnail_url: str | None
    rating: int | None
    created_at: datetime
    updated_at: datetime
