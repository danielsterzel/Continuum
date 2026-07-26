from app.db.base import Base
from uuid import UUID
from sqlalchemy.orm import mapped_column, Mapped, relationship
from sqlalchemy import (
    Enum as SqlEnum,
    String,
    ForeignKey,
    Integer,
    BigInteger,
    CheckConstraint,
    Interval,
)
from enum import Enum
from datetime import timedelta
from app.models.mixins import TimestampMixin, UUIDMixin


class MediaType(str, Enum):
    VIDEO = "video"
    AUDIOBOOK = "audiobook"
    PODCAST = "podcast"
    RECORDING = "recording"


class Media(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "media"

    __table_args__ = (
        CheckConstraint("rating >= 1 AND rating <= 5", name="rating_betwen_1_and_5"),
    )

    library_id: Mapped[UUID] = mapped_column(
        ForeignKey(
            "libraries.id",
            ondelete="CASCADE",
        ),
        nullable=False,
    )
    filename: Mapped[str] = mapped_column(String(128))
    filepath: Mapped[str] = mapped_column(String(256))
    file_size: Mapped[int] = mapped_column(BigInteger)

    duration: Mapped[timedelta] = mapped_column(Interval)
    thumbnail_url: Mapped[str | None] = mapped_column(String(256))

    media_type: Mapped["MediaType"] = mapped_column(
        SqlEnum(MediaType, name="media_type")
    )

    rating: Mapped[int | None] = mapped_column(Integer, nullable=True)

    library: Mapped["Library"] = relationship(back_populates="media")

    media_progress: Mapped["MediaProgress | None"] = relationship(
        back_populates="media", cascade="all, delete-orphan", passive_deletes=True
    )

    notes: Mapped[list["Note"]] = relationship(
        back_populates="media", cascade="all, delete-orphan", passive_deletes=True
    )
