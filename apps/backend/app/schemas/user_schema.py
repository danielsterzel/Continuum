
from pydantic import BaseModel, ConfigDict, Field, field_validator
from pydantic.alias_generators import to_camel
from uuid import UUID
from datetime import datetime

class UserWrite(BaseModel):
    model_config = ConfigDict(
        from_attributes=True, alias_generator=to_camel,
        validate_by_name=True, validate_by_alias=True
    )

    display_name: str = Field(max_length=100)
    email: str = Field(max_length=255)
    password: str = Field(min_length=8, max_length=50)

    @field_validator("password")
    @classmethod
    def validate_password(cls, value: str) -> str:
        if len(value) < 8:
            raise ValueError("Password must contain at least 8 characters")

        if len(value) > 128:
            raise ValueError("Password must contain at most 128 characters")

        if not any(char.isupper() for char in value):
            raise ValueError("Password must contain at least one uppercase letter")

        if not any(char.islower() for char in value):
            raise ValueError("Password must contain at least one lowercase letter")

        if not any(char.isdigit() for char in value):
            raise ValueError("Password must contain at least one digit")

        return value

class UserRead(BaseModel):
    model_config = ConfigDict(
        from_attributes=True, alias_generator=to_camel,
        validate_by_name=True, validate_by_alias=True
    )
    id: UUID
    display_name: str
    email: str
    created_at: datetime
    updated_at: datetime

class UserLogin(BaseModel):

    model_config = ConfigDict(
        from_attributes=True, alias_generator=to_camel,
        validate_by_name=True, validate_by_alias=True
    )
    email: str
    password: str