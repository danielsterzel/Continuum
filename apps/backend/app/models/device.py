from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import ForeignKey, String, DateTime, func, Index
from datetime import datetime
from uuid import UUID

from app.db.base import Base
from app.models.mixins import UUIDMixin, VersionMixin
from app.models.user import User

class Device(Base, UUIDMixin, VersionMixin):
    __tablename__ = "device"

    __table_args__ = (Index("idx_device_user", "user_id"),)

    user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    name: Mapped[str] = mapped_column(String(50))

    last_seen: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    user: Mapped["User"] = relationship(
        back_populates="devices",
    )
