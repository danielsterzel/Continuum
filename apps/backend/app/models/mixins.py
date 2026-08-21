from sqlalchemy import DateTime, func, Integer, text
from sqlalchemy.orm import mapped_column, Mapped
from uuid import UUID, uuid4
from datetime import datetime


class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


class UUIDMixin:
    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)

class TombstoneMixin:
    deleted_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )

class VersionMixin:
    version: Mapped[int] = mapped_column(Integer(), server_default=text("0"))