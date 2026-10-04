from types import SimpleNamespace
from unittest.mock import AsyncMock
from uuid import uuid4

import pytest
from fastapi import HTTPException

from app.api import device_api
from app.schemas.device_schema import DeviceDeleteRequest


pytestmark = pytest.mark.anyio


@pytest.fixture
def anyio_backend() -> str:
    return "asyncio"


async def test_delete_device_rejects_current_device(monkeypatch) -> None:
    user_id = uuid4()
    current_device_id = uuid4()
    repository = SimpleNamespace(
        fetch_device_by_id_and_user_id=AsyncMock(return_value=SimpleNamespace()),
        soft_delete_one_by_id=AsyncMock(),
    )
    monkeypatch.setattr(device_api, "DeviceRepository", lambda _db: repository)

    with pytest.raises(HTTPException) as error:
        await device_api.delete_device(
            user_id=user_id,
            device_id=current_device_id,
            request=DeviceDeleteRequest(requesting_device_id=current_device_id),
            db=AsyncMock(),
        )

    assert error.value.status_code == 409
    repository.soft_delete_one_by_id.assert_not_awaited()


async def test_delete_device_soft_deletes_other_device(monkeypatch) -> None:
    user_id = uuid4()
    current_device_id = uuid4()
    target_device_id = uuid4()
    repository = SimpleNamespace(
        fetch_device_by_id_and_user_id=AsyncMock(return_value=SimpleNamespace()),
        soft_delete_one_by_id=AsyncMock(return_value=True),
    )
    monkeypatch.setattr(device_api, "DeviceRepository", lambda _db: repository)
    db = AsyncMock()

    response = await device_api.delete_device(
        user_id=user_id,
        device_id=target_device_id,
        request=DeviceDeleteRequest(requesting_device_id=current_device_id),
        db=db,
    )

    assert response.status_code == 204
    repository.soft_delete_one_by_id.assert_awaited_once_with(
        target_device_id, user_id
    )
    db.commit.assert_awaited_once()


async def test_delete_device_requires_active_requesting_device(monkeypatch) -> None:
    repository = SimpleNamespace(
        fetch_device_by_id_and_user_id=AsyncMock(return_value=None),
        soft_delete_one_by_id=AsyncMock(),
    )
    monkeypatch.setattr(device_api, "DeviceRepository", lambda _db: repository)

    with pytest.raises(HTTPException) as error:
        await device_api.delete_device(
            user_id=uuid4(),
            device_id=uuid4(),
            request=DeviceDeleteRequest(requesting_device_id=uuid4()),
            db=AsyncMock(),
        )

    assert error.value.status_code == 403
    repository.soft_delete_one_by_id.assert_not_awaited()
