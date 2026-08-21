from app.db.base import Base
from uuid import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import Interval, DateTime, ForeignKey, UniqueConstraint, func

from datetime import datetime, timedelta
from app.models.mixins import UUIDMixin, TombstoneMixin, VersionMixin


class MediaProgress(Base, UUIDMixin, TombstoneMixin, VersionMixin):
    __tablename__ = "media_progress"

    __table_args__ = (UniqueConstraint("media_id", name="unique_media_for_progress"),)

    media_id: Mapped[UUID] = mapped_column(ForeignKey("media.id", ondelete="CASCADE"))

    current_position: Mapped[timedelta | None] = mapped_column(Interval)
    last_watched: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    last_device_id: Mapped[UUID | None] = mapped_column(
        ForeignKey("device.id", ondelete="SET NULL")
    )

    media: Mapped["Media"] = relationship(back_populates="media_progress")
