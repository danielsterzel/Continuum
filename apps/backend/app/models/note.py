from app.db.base import Base
from uuid import UUID

from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, ForeignKey, Interval, DateTime

from datetime import datetime, timedelta
from app.models.mixins import TimestampMixin, UUIDMixin


class Note(Base, TimestampMixin, UUIDMixin):
    __tablename__ = "note"

    __table_args__ = ()

    media_id: Mapped[UUID] = mapped_column(ForeignKey("media.id", ondelete="CASCADE"))

    media: Mapped["Media"] = relationship(back_populates="notes")

    title: Mapped[str] = mapped_column(String(50))
    content: Mapped[str] = mapped_column(String(300))
    timestamp: Mapped[timedelta | None] = mapped_column(Interval, nullable=True)
    deleted_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
