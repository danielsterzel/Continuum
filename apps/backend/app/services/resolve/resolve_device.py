from app.models.sync_change import SyncOperation
from app.repositories.device_repository import DeviceRepository
from app.schemas.device_schema import DeviceSyncWrite
from app.services.resolve.resolve_base import ResolveBase
from uuid import UUID
from app.models.device import Device
from typing import Any

class ResolveDevice(ResolveBase[DeviceRepository]):
    repository_type = DeviceRepository
    entity_type = "device"

    async def get_current_entity(self, entity_id: UUID, sync_operation: SyncOperation) -> dict[str, Any]:
        if sync_operation == SyncOperation.CREATE:
            return {"object": "create"}

        current_entity = await self.repository.fetch_device_by_id_and_user_id(device_id=entity_id, user_id=self.user_id)

        return {"object": current_entity}

    @staticmethod
    def deserialize_device(entity_id: UUID, payload: dict[str, Any]):

        payload = DeviceSyncWrite.model_validate(payload)
        print(repr(payload))

        return Device(
            id=entity_id,
            user_id=payload.user_id,
            name=payload.name,
            last_seen=payload.last_seen,
        )

    async def sync_create(self, entity_id: UUID, payload: dict[str, Any]):

        device = self.deserialize_device(entity_id=entity_id, payload=payload)

        await self.repository.save(device)

    async def sync_update(self, entity_id: UUID, payload: dict[str, Any]):
        db_res = await self.repository.update_device_validate(
            device_id=entity_id, user_id=self.user_id, **payload
        )

        if not db_res:
            raise ValueError("SYNC DEVICE UPDATE FAIL")

    async def sync_delete(self, entity_id: UUID):
        db_res = await self.repository.soft_delete_one_by_id(
            entity_id=entity_id, user_id=self.user_id
        )

        if not db_res:
            raise ValueError("SYNC DEVICE DELETE FAIL")
