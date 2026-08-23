from pydantic import BaseModel, ConfigDict, Field
from pydantic.alias_generators import to_camel
from uuid import UUID
from datetime import datetime


class DeviceRead(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
        alias_generator=to_camel,
        validate_by_alias=True,
        validate_by_name=True,
    )
    id: UUID = Field(...)
    user_id: UUID = Field(...)
    name: str
    last_seen: datetime


class DeviceWrite(BaseModel):
    name: str | None = Field(default=None, max_length=50)

class DeviceSyncWrite(BaseModel):

    model_config = ConfigDict(
        from_attributes=True,
        alias_generator=to_camel,
        validate_by_alias=True,
        validate_by_name=True,
    )
    user_id: UUID = Field(...)
    name: str | None = Field(default=None, max_length=50)
    last_seen: datetime
