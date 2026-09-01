from typing import Any

import regex
from pydantic import BaseModel, ConfigDict, Field, field_validator
from pydantic.alias_generators import to_camel
from datetime import datetime, timedelta
from uuid import UUID

PATTERN = regex.compile(
    r"^[\p{L}\p{N}\p{Emoji_Presentation}\p{Extended_Pictographic}‍️ ]+$"
)


class NoteRead(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
        alias_generator=to_camel,
        validate_by_alias=True,
        validate_by_name=True,
    )

    id: UUID
    media_id: UUID
    title: str = Field(..., max_length=50)
    content: str = Field(..., max_length=300)
    timestamp: float | None
    version: int
    deleted_at: datetime | None
    created_at: datetime
    updated_at: datetime

    @field_validator("timestamp", mode="before")
    @classmethod
    def convert_timestamp(cls, value: Any) -> Any:
        if isinstance(value, timedelta):
            return value.total_seconds()
        return value

    @field_validator("title")
    @classmethod
    def validate(cls, value: str) -> str:
        if not PATTERN.fullmatch(value):
            raise ValueError("Invalid note title")
        return value


class NoteCreate(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
        alias_generator=to_camel,
        validate_by_alias=True,
        validate_by_name=True,
    )

    media_id: str
    title: str = Field(..., max_length=50)
    content: str = Field(..., max_length=300)
    timestamp: float | None


class NoteSyncPayload(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
        alias_generator=to_camel,
        validate_by_alias=True,
        validate_by_name=True,
    )
    media_id: UUID
    title: str
    content: str
    timestamp: int | None
    created_at: datetime
    updated_at: datetime

    deleted_at: datetime
