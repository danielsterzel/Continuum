from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import ForeignKey, String, DateTime, func, Index
from datetime import datetime
from typing import TYPE_CHECKING
from uuid import UUID

from app.db.base import Base
from app.models.mixins import TombstoneMixin, UUIDMixin, VersionMixin

if TYPE_CHECKING:
    from app.models.user import User


class Device(Base, UUIDMixin, TombstoneMixin, VersionMixin):
    __tablename__ = "devices"

    __table_args__ = (Index("ix_devices_user_id", "user_id"),)

    user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    name: Mapped[str] = mapped_column(String(50))

    last_seen: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now()
    )

    user: Mapped["User"] = relationship(
        back_populates="devices",
    )
