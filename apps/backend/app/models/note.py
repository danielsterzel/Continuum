from app.db.base import Base
from uuid import UUID

from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, ForeignKey, Interval

from datetime import timedelta
from typing import TYPE_CHECKING

from app.models.mixins import TimestampMixin, UUIDMixin, TombstoneMixin, VersionMixin

if TYPE_CHECKING:
    from app.models.media import Media


class Note(Base, TimestampMixin, UUIDMixin, TombstoneMixin, VersionMixin):
    __tablename__ = "notes"

    __table_args__ = ()

    media_id: Mapped[UUID] = mapped_column(ForeignKey("media.id", ondelete="CASCADE"))

    media: Mapped["Media"] = relationship(back_populates="notes")

    title: Mapped[str] = mapped_column(String(50))
    content: Mapped[str] = mapped_column(String(300))
    timestamp: Mapped[timedelta | None] = mapped_column(Interval, nullable=True)
