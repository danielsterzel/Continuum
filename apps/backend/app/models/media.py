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
    DateTime
)
from enum import Enum
from datetime import timedelta
from app.models.mixins import TimestampMixin, UUIDMixin, TombstoneMixin


class MediaType(str, Enum):
    VIDEO = "video"
    RECORDING = "recording"
    IMAGE = "image"
    PDF = "pdf"
    UNKNOWN = "unknown"


MEDIA_TYPE_MAP = {
    "image/": MediaType.IMAGE,
    "video/": MediaType.VIDEO,
    "audio/": MediaType.RECORDING,
    "application/pdf": MediaType.PDF,
}


class Media(Base, UUIDMixin, TimestampMixin, TombstoneMixin):
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

    duration: Mapped[timedelta | None] = mapped_column(Interval, nullable=True)
    thumbnail_url: Mapped[str | None] = mapped_column(String(256))

    media_type: Mapped["MediaType"] = mapped_column(
        SqlEnum(
            MediaType,
            name="media_type",
            values_callable=lambda enum: [item.value for item in enum],
        )
    )

    rating: Mapped[int | None] = mapped_column(Integer, nullable=True)



    library: Mapped["Library"] = relationship(back_populates="media")

    media_progress: Mapped["MediaProgress | None"] = relationship(
        back_populates="media", cascade="all, delete-orphan", passive_deletes=True
    )

    notes: Mapped[list["Note"]] = relationship(
        back_populates="media", cascade="all, delete-orphan", passive_deletes=True
    )
