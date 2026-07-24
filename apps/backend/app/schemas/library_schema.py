

from pydantic import BaseModel, Field, ConfigDict
from uuid import UUID

from app.schemas.media_schema import MediaRead

class LibraryCreate(BaseModel):

    user_id : UUID = Field(...)
    name: str = Field(..., max_length=100, min_length=1)
    description: str | None = Field(default=None)
    icon_url: str | None = Field(default=None, max_length=512)


class LibraryRead(BaseModel):

    model_config=ConfigDict(from_attributes=True)
    
    user_id: UUID = Field(...)
    name: str = Field(..., max_length=100, min_length=1)
    description: str | None = Field(default=None)
    icon_url: str | None = Field(default=None)
    media: list[MediaRead]
