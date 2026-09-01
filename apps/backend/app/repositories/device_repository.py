from app.repositories.base_repository import BaseRepository
from app.models.device import Device
from uuid import UUID
from sqlalchemy import select, and_
from sqlalchemy.orm import selectinload


class DeviceRepository(BaseRepository):
    model = Device
    allowed_updates = {"name", "last_seen"}

    async def fetch_device_by_id_and_user_id(
        self, device_id: UUID, user_id: UUID
    ) -> Device | None:

        query = (
            select(Device)
            .where(
                and_(
                    Device.id == device_id,
                    Device.user_id == user_id,
                    Device.deleted_at.is_(None),
                )
            )
            .options(selectinload(Device.user))
        )

        res = await self.db.execute(query)

        return res.scalar_one_or_none()

    async def update_device_validate(
        self, device_id: UUID, user_id: UUID, **kwargs
    ) -> bool:

        permitted_device = select(self.model.id).where(
            self.model.user_id == user_id,
            self.model.id == device_id,
            self.model.deleted_at.is_(None),
        )

        return await self.update_entity_validate(permissions=permitted_device, **kwargs)

    async def soft_delete_one_by_id(self, entity_id: UUID, user_id: UUID) -> bool:

        query = select(self.model).where(
            self.model.user_id == user_id, self.model.id == entity_id
        )

        res = await self.db.execute(query)

        device: Device | None = res.scalar_one_or_none()

        return self.soft_delete_entity(device)
