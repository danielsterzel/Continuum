from datetime import datetime, timezone
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.dependencies import get_db
from app.repositories.device_repository import DeviceRepository
from app.schemas.device_schema import DeviceDeleteRequest, DeviceRead


router = APIRouter(prefix="/devices")


@router.get("/{user_id}", response_model=list[DeviceRead])
async def list_devices(
    user_id: UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    devices = await DeviceRepository(db).active_devices(user_id)
    return [DeviceRead.model_validate(device) for device in devices]


@router.delete("/{user_id}/{device_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_device(
    user_id: UUID,
    device_id: UUID,
    request: DeviceDeleteRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    repository = DeviceRepository(db)
    requesting_device = await repository.fetch_device_by_id_and_user_id(
        request.requesting_device_id, user_id
    )
    if not requesting_device:
        raise HTTPException(status_code=403, detail="Requesting device is not active")

    if request.requesting_device_id == device_id:
        raise HTTPException(
            status_code=409,
            detail="The current device cannot be removed",
        )

    deleted = await repository.soft_delete_one_by_id(device_id, user_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Device not found")

    await db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


async def touch_device(
    user_id: UUID,
    device_id: UUID,
    db: AsyncSession,
) -> None:
    device = await DeviceRepository(db).mark_seen(
        device_id=device_id,
        user_id=user_id,
        seen_at=datetime.now(timezone.utc),
    )
    if not device:
        raise HTTPException(status_code=403, detail="Device is not active")
