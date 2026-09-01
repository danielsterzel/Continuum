from typing import Annotated

from fastapi import APIRouter, HTTPException, status, Depends
from app.db.dependencies import get_db

from sqlalchemy.ext.asyncio import AsyncSession

from app.db.dependencies import OwnerId
from app.repositories.device_repository import DeviceRepository

from app.schemas.device_schema import DeviceRead, DeviceWrite
from app.models.device import Device
from uuid import UUID

router = APIRouter(prefix="/device")


@router.get("/fetch/{device_id}", response_model=DeviceRead)
async def get_device(
    device_id: UUID, user_id: OwnerId, db: Annotated[AsyncSession, Depends(get_db)]
):

    device_repository = DeviceRepository(db)

    device = await device_repository.fetch_device_by_id_and_user_id(
        device_id=device_id, user_id=user_id
    )

    if not device:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Could not process request"
        )

    device = DeviceRead.model_validate(device)

    return device


@router.post("/create/", response_model=DeviceRead)
async def create_device(
    request: DeviceWrite, user_id: OwnerId, db: Annotated[AsyncSession, Depends(get_db)]
):

    print(repr(request))
    device_repository = DeviceRepository(db)

    device = Device(user_id=user_id, name=request.name)

    await device_repository.save(device)

    await db.commit()
    await db.refresh(device)

    return DeviceRead.model_validate(device)
