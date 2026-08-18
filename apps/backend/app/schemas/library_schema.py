import regex

from pydantic import BaseModel, Field, ConfigDict, field_validator
from uuid import UUID

from app.schemas.media_schema import MediaRead
from datetime import datetime
from pydantic.alias_generators import to_camel

# Litery (w tym np. polskie znaki), cyfry, "-" i "_" — bez spacji i innych znakow specjalnych.
# Ten sam pattern co po stronie frontu (\p{L}\p{N}_-).
LIBRARY_NAME_PATTERN = regex.compile(r"^[\p{L}\p{N}_-]+$")


class LibraryCreate(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel, validate_by_alias=True, validate_by_name=True
    )
    user_id: UUID = Field(...)
    name: str = Field(..., max_length=100, min_length=1)
    description: str | None = Field(default=None)

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: str) -> str:
        value = value.strip()
        if not value or not LIBRARY_NAME_PATTERN.fullmatch(value):
            raise ValueError(
                "Name may only contain letters, numbers, '-' and '_' (no spaces)."
            )
        return value


class LibraryRead(BaseModel):
    model_config = ConfigDict(
        from_attributes=True, alias_generator=to_camel, populate_by_name=True
    )

    id: UUID = Field(...)
    user_id: UUID = Field(...)
    name: str = Field(..., max_length=100, min_length=1)
    description: str | None = Field(default=None)
    icon_url: str | None = Field(default=None)
    media: list[MediaRead]
    updated_at: datetime
