from app.db.base import Base
from uuid import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import Interval, DateTime, ForeignKey, UniqueConstraint, func

from datetime import datetime, timedelta
from typing import TYPE_CHECKING

from app.models.mixins import UUIDMixin, VersionMixin

if TYPE_CHECKING:
    from app.models.media import Media


class MediaProgress(Base, UUIDMixin, VersionMixin):
    __tablename__ = "media_progresses"

    __table_args__ = (
        UniqueConstraint("media_id", name="uq_media_progresses_media_id"),
    )

    media_id: Mapped[UUID] = mapped_column(ForeignKey("media.id", ondelete="CASCADE"))

    current_position: Mapped[timedelta | None] = mapped_column(Interval)
    last_watched: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    last_device_id: Mapped[UUID | None] = mapped_column(
        ForeignKey("devices.id", ondelete="SET NULL"), nullable=True
    )

    media: Mapped["Media"] = relationship(back_populates="media_progress")
