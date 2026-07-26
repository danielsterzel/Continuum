from uuid import UUID
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.user import User

from app.models.mixins import TimestampMixin, UUIDMixin

from sqlalchemy import (
    ForeignKey,
    Index,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Library(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "libraries"

    __table_args__ = (
        UniqueConstraint(
            "user_id",
            "name",
            name="uq_library_user_name",
        ),
        Index(
            "ix_library_user_id",
            "user_id",
        ),
    )

    user_id: Mapped[UUID] = mapped_column(
        ForeignKey(
            "users.id",
            ondelete="CASCADE",
        ),
        nullable=False,
    )

    name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    icon_url: Mapped[str | None] = mapped_column(
        String(512),
        nullable=True,
    )

    user: Mapped["User"] = relationship(
        back_populates="libraries",
    )

    media: Mapped[list["Media"]] = relationship(
        back_populates="library",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
