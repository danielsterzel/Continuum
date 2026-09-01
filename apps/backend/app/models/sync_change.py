from sqlalchemy import ForeignKey, Integer, DateTime, func, Uuid, Index, text
from sqlalchemy.dialects.postgresql import JSONB

from app.db.base import Base
from app.models.mixins import UUIDMixin
from sqlalchemy import Enum as SqlEnum
from sqlalchemy.orm import mapped_column, Mapped
from uuid import UUID
from enum import Enum
from datetime import datetime


class EntityType(str, Enum):
    Note = "note"
    Library = "library"
    Media = "media"
    MediaProgress = "media_progress"
    Device = "device"


class SyncOperation(str, Enum):
    CREATE = "create"
    UPDATE = "update"
    DELETE = "delete"


class SyncChange(Base, UUIDMixin):
    __tablename__ = "sync_changes"

    device_id: Mapped[UUID] = mapped_column(
        ForeignKey("devices.id", ondelete="CASCADE"), index=True
    )
    entity_type: Mapped["EntityType"] = mapped_column(
        SqlEnum(
            EntityType,
            name="entity_type",
            values_callable=lambda enum: [item.value for item in enum],
        )
    )
    entity_id: Mapped[UUID] = mapped_column(Uuid)

    operation: Mapped[SyncOperation] = mapped_column(
        SqlEnum(
            SyncOperation,
            name="operation",
            values_callable=lambda enum: [item.value for item in enum],
        )
    )
    expected_version: Mapped[int] = mapped_column(Integer, server_default=text("1"))
    payload: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    __table_args__ = (
        Index(
            "ix_sync_changes_entity",
            "entity_type",
            "entity_id",
        ),
    )
