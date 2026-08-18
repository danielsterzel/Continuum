from typing import Literal

from app.repositories.base_repository import BaseRepository
from app.models.device import Device
from uuid import UUID
from sqlalchemy import select, and_
from sqlalchemy.orm import selectinload


class DeviceRepository(BaseRepository):
    async def fetch_device(self, device_id: UUID, user_id: UUID) -> Device | None:

        query = (
            select(Device)
            .where(and_(Device.id == device_id, Device.user_id == user_id))
            .options(selectinload(Device.user))
        )

        res = await self.db.execute(query)

        return res.scalar_one_or_none()
