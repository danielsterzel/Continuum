from io import BytesIO
from types import SimpleNamespace
from unittest.mock import AsyncMock
from uuid import uuid4

import pytest
from fastapi import HTTPException, UploadFile

from app.api import sync_api


pytestmark = pytest.mark.anyio


@pytest.fixture
def anyio_backend() -> str:
    return "asyncio"


def test_parse_storage_path_rejects_traversal() -> None:
    with pytest.raises(HTTPException) as error:
        sync_api._parse_storage_path("../outside/icon.png")

    assert error.value.status_code == 400


async def test_sync_icon_validates_metadata_and_replaces_file(
    tmp_path, monkeypatch
) -> None:
    user_id = uuid4()
    library_id = uuid4()
    relative_path = f"{library_id}/icon.png"
    repository = SimpleNamespace(
        fetch_single_by_user=AsyncMock(
            return_value=SimpleNamespace(icon_url=relative_path)
        )
    )
    monkeypatch.setattr(sync_api, "MEDIA_ROOT", tmp_path)
    monkeypatch.setattr(sync_api, "LibraryRepository", lambda _: repository)

    destination = tmp_path / str(user_id) / relative_path
    destination.parent.mkdir(parents=True)
    destination.write_bytes(b"old image")
    upload = UploadFile(file=BytesIO(b"new image"), filename="icon.png")

    result = await sync_api.sync_icon(
        user_id=user_id,
        path=relative_path,
        file=upload,
        db=AsyncMock(),
    )

    assert result == {"status": "ok"}
    assert destination.read_bytes() == b"new image"
    repository.fetch_single_by_user.assert_awaited_once_with(
        user_id=user_id, library_id=library_id
    )


async def test_sync_icon_rejects_path_not_present_in_metadata(
    tmp_path, monkeypatch
) -> None:
    user_id = uuid4()
    library_id = uuid4()
    repository = SimpleNamespace(
        fetch_single_by_user=AsyncMock(
            return_value=SimpleNamespace(icon_url=f"{library_id}/icon.webp")
        )
    )
    monkeypatch.setattr(sync_api, "MEDIA_ROOT", tmp_path)
    monkeypatch.setattr(sync_api, "LibraryRepository", lambda _: repository)

    with pytest.raises(HTTPException) as error:
        await sync_api.sync_icon(
            user_id=user_id,
            path=f"{library_id}/icon.png",
            file=UploadFile(file=BytesIO(b"image"), filename="icon.png"),
            db=AsyncMock(),
        )

    assert error.value.status_code == 409


async def test_sync_media_file_validates_owner_and_metadata(
    tmp_path, monkeypatch
) -> None:
    user_id = uuid4()
    library_id = uuid4()
    media_id = uuid4()
    relative_path = f"{library_id}/{media_id}.mp4"
    repository = SimpleNamespace(
        fetch_one_by_user=AsyncMock(
            return_value=SimpleNamespace(
                library_id=library_id,
                filepath=relative_path,
            )
        )
    )
    monkeypatch.setattr(sync_api, "MEDIA_ROOT", tmp_path)
    monkeypatch.setattr(sync_api, "MediaRepository", lambda _: repository)

    result = await sync_api.sync_file(
        user_id=user_id,
        library_id=library_id,
        path=relative_path,
        file=UploadFile(file=BytesIO(b"media data"), filename="video.mp4"),
        db=AsyncMock(),
    )

    assert result == {"status": "ok"}
    assert (tmp_path / str(user_id) / relative_path).read_bytes() == b"media data"
    repository.fetch_one_by_user.assert_awaited_once_with(
        media_id=media_id, user_id=user_id
    )


async def test_failed_upload_keeps_existing_file(tmp_path) -> None:
    destination = tmp_path / "icon.png"
    destination.write_bytes(b"old image")
    upload = AsyncMock()
    upload.read = AsyncMock(side_effect=[b"partial image", OSError("read failed")])

    with pytest.raises(OSError, match="read failed"):
        await sync_api._write_upload_atomically(upload, destination)

    assert destination.read_bytes() == b"old image"
    assert list(tmp_path.glob("*.tmp")) == []
