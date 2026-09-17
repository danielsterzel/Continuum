from app.models.sync_change import SyncOperation
from app.repositories.device_repository import DeviceRepository
from app.schemas.device_schema import DeviceSyncWrite
from app.schemas.sync_change_schema import SyncChangeWrite
from app.services.resolve.resolve_base import ResolveBase
from uuid import UUID
from app.models.device import Device
from typing import Any


class ResolveDevice(ResolveBase[DeviceRepository]):
    repository_type = DeviceRepository
    entity_type = "device"

    async def get_current_entity(
        self, entity_id: UUID, sync_operation: SyncOperation
    ) -> dict[str, Any]:
        if sync_operation == SyncOperation.CREATE:
            return {"object": "create"}

        current_entity = await self.repository.fetch_device_by_id_and_user_id(
            device_id=entity_id, user_id=self.user_id
        )

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
            updated_at=payload.updated_at,
        )

    async def resolve_conflict(self, change: SyncChangeWrite) -> UUID:

        saved_entity = await self.repository.fetch_device_by_id_and_user_id(
            device_id=change.entity_id, user_id=self.user_id
        )

        if not saved_entity:
            raise ValueError("No such entity ID")

        match change.operation:
            case SyncOperation.UPDATE:

                payload_parsed = self.deserialize_device(change.entity_id, change.payload)

                for field in change.payload:
                    if field not in self.repository.allowed_updates:
                        continue
                    if field == "name":
                        # LWW
                        if saved_entity.updated_at < payload_parsed.updated_at:
                            new_name = payload_parsed.name

                            await self.repository.update_device_validate(
                                device_id=saved_entity.id,
                                user_id=self.user_id,
                                **{field: new_name},
                            )

                    if field == "last_seen":
                        # max()
                        last_write = max(
                            saved_entity.last_seen, payload_parsed.last_seen
                        )
                        await self.repository.update_device_validate(
                            device_id=saved_entity.id,
                            user_id=self.user_id,
                            **{field: last_write},
                        )
                return saved_entity.id

            case SyncOperation.DELETE:
                # usun stare najwyzej nowy setup
                await self.repository.soft_delete_one_by_id(entity_id=saved_entity.id, user_id=self.user_id)
                return saved_entity.id

            case _:
                raise ValueError("Invalid Sync Operation")

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
