from datetime import datetime, timedelta, timezone
from types import SimpleNamespace
from unittest.mock import AsyncMock, call
from uuid import UUID, uuid4, uuid5

import pytest

from app.models.device import Device
from app.models.libraries import Library
from app.models.note import Note
from app.models.sync_change import SyncOperation
from app.schemas.sync_change_schema import SyncChangeWrite
from app.services.resolve.resolve_device import ResolveDevice
from app.services.resolve.resolve_library import ResolveLibrary
from app.services.resolve.resolve_media import ResolveMedia
from app.services.resolve.resolve_media_progress import ResolveMediaProgress
from app.services.resolve.resolve_note import ResolveNote


pytestmark = pytest.mark.anyio


@pytest.fixture
def anyio_backend() -> str:
    return "asyncio"


@pytest.fixture
def user_id() -> UUID:
    return uuid4()


@pytest.fixture
def device_id() -> UUID:
    return uuid4()


def make_change(
    *,
    device_id: UUID,
    entity_type: str,
    entity_id: UUID,
    operation: SyncOperation,
    payload: dict | None,
) -> SyncChangeWrite:
    return SyncChangeWrite(
        id=uuid4(),
        device_id=device_id,
        entity_type=entity_type,
        entity_id=entity_id,
        operation=operation,
        version=1,
        payload=payload,
    )


def device_payload(user_id: UUID, updated_at: datetime) -> dict:
    return {
        "user_id": str(user_id),
        "name": "Laptop",
        "last_seen": updated_at,
        "deleted_at": None,
        "updated_at": updated_at,
    }


def library_payload(updated_at: datetime) -> dict:
    return {
        "name": "Filmy",
        "description": "opis z klienta",
        "icon_url": None,
        "created_at": updated_at - timedelta(days=1),
        "updated_at": updated_at,
        "deleted_at": None,
    }


def media_payload(library_id: UUID, updated_at: datetime) -> dict:
    return {
        "library_id": str(library_id),
        "filename": "nowa-nazwa.mp4",
        "filepath": "/media/film.mp4",
        "file_size": 100,
        "duration": 60,
        "thumbnail_url": None,
        "media_type": "video",
        "rating": 5,
        "created_at": updated_at - timedelta(days=1),
        "updated_at": updated_at,
        "deleted_at": None,
    }


def progress_payload(media_id: UUID, device_id: UUID, last_watched: datetime) -> dict:
    return {
        "media_id": str(media_id),
        "current_position": 90,
        "last_watched": last_watched,
        "last_device_id": str(device_id),
    }


def note_payload(media_id: UUID, updated_at: datetime) -> dict:
    return {
        "media_id": str(media_id),
        "title": "Tytul",
        "content": "tresc z klienta",
        "timestamp": 30,
        "created_at": updated_at - timedelta(days=1),
        "updated_at": updated_at,
        "deleted_at": None,
    }


async def test_device_create_saves_deserialized_device(
    user_id: UUID, device_id: UUID
) -> None:
    entity_id = uuid4()
    now = datetime.now(timezone.utc)
    resolver = ResolveDevice(user_id, AsyncMock())
    resolver.repository = SimpleNamespace(save=AsyncMock())
    change = make_change(
        device_id=device_id,
        entity_type="device",
        entity_id=entity_id,
        operation=SyncOperation.CREATE,
        payload=device_payload(user_id, now),
    )

    resolved_id = await resolver.resolve(change)

    assert resolved_id == entity_id
    resolver.repository.save.assert_awaited_once()
    saved_device = resolver.repository.save.await_args.args[0]
    assert isinstance(saved_device, Device)
    assert saved_device.id == entity_id
    assert saved_device.user_id == user_id
    assert saved_device.name == "Laptop"


async def test_library_update_forwards_payload(user_id: UUID, device_id: UUID) -> None:
    entity_id = uuid4()
    now = datetime.now(timezone.utc)
    resolver = ResolveLibrary(user_id, AsyncMock())
    resolver.repository = SimpleNamespace(
        allowed_updates={"name", "description", "icon_url"},
        update_library_validate=AsyncMock(return_value=True)
    )
    change = make_change(
        device_id=device_id,
        entity_type="library",
        entity_id=entity_id,
        operation=SyncOperation.UPDATE,
        payload={
            **library_payload(now),
            "name": "Nowa_nazwa",
            # A queued payload produced by an older client may still contain it.
            "user_id": str(uuid4()),
        },
    )

    resolved_id = await resolver.resolve(change)

    assert resolved_id == entity_id
    resolver.repository.update_library_validate.assert_awaited_once_with(
        entity_id=entity_id,
        user_id=user_id,
        name="Nowa_nazwa",
        description="opis z klienta",
        icon_url=None,
    )


async def test_library_create_takes_owner_from_resolver(
    user_id: UUID, device_id: UUID
) -> None:
    entity_id = uuid4()
    repository = SimpleNamespace(
        fetch_single_by_user=AsyncMock(return_value=None),
        save=AsyncMock(),
    )
    resolver = ResolveLibrary(user_id, AsyncMock())
    resolver.repository = repository
    change = make_change(
        device_id=device_id,
        entity_type="library",
        entity_id=entity_id,
        operation=SyncOperation.CREATE,
        payload=library_payload(datetime.now(timezone.utc)),
    )

    await resolver.resolve(change)

    repository.save.assert_awaited_once()
    saved_library = repository.save.await_args.args[0]
    assert isinstance(saved_library, Library)
    assert saved_library.user_id == user_id


async def test_media_delete_soft_deletes_entity(user_id: UUID, device_id: UUID) -> None:
    entity_id = uuid4()
    resolver = ResolveMedia(user_id, AsyncMock())
    resolver.repository = SimpleNamespace(
        soft_delete_one_by_id=AsyncMock(return_value=True)
    )
    change = make_change(
        device_id=device_id,
        entity_type="media",
        entity_id=entity_id,
        operation=SyncOperation.DELETE,
        payload=None,
    )

    resolved_id = await resolver.resolve(change)

    assert resolved_id == entity_id
    resolver.repository.soft_delete_one_by_id.assert_awaited_once_with(
        entity_id=entity_id,
        user_id=user_id,
    )


async def test_media_progress_update_uses_existing_progress_id(
    user_id: UUID, device_id: UUID
) -> None:
    requested_id = uuid4()
    existing_id = uuid4()
    media_id = uuid4()
    now = datetime.now(timezone.utc)
    repository = SimpleNamespace(
        fetch_media_progress_validate=AsyncMock(
            return_value=SimpleNamespace(id=existing_id)
        ),
        update_media_progress_validate=AsyncMock(return_value=True),
    )
    resolver = ResolveMediaProgress(user_id, AsyncMock())
    resolver.repository = repository
    change = make_change(
        device_id=device_id,
        entity_type="media_progress",
        entity_id=requested_id,
        operation=SyncOperation.UPDATE,
        payload=progress_payload(media_id, device_id, now),
    )

    resolved_id = await resolver.resolve(change)

    assert resolved_id == existing_id
    repository.fetch_media_progress_validate.assert_awaited_once_with(
        user_id=user_id,
        media_id=media_id,
    )
    repository.update_media_progress_validate.assert_awaited_once_with(
        entity_id=existing_id,
        user_id=user_id,
        media_id=media_id,
        current_position=timedelta(seconds=90),
        last_watched=now,
        last_device_id=device_id,
    )


async def test_note_create_checks_permission_and_saves(
    user_id: UUID, device_id: UUID
) -> None:
    entity_id = uuid4()
    media_id = uuid4()
    now = datetime.now(timezone.utc)
    repository = SimpleNamespace(
        is_media_owned_by_user=AsyncMock(return_value=True),
        save=AsyncMock(),
    )
    resolver = ResolveNote(user_id, AsyncMock())
    resolver.repository = repository
    change = make_change(
        device_id=device_id,
        entity_type="note",
        entity_id=entity_id,
        operation=SyncOperation.CREATE,
        payload=note_payload(media_id, now),
    )

    resolved_id = await resolver.resolve(change)

    assert resolved_id == entity_id
    repository.is_media_owned_by_user.assert_awaited_once_with(
        media_id=media_id,
        user_id=user_id,
    )
    repository.save.assert_awaited_once()
    saved_note = repository.save.await_args.args[0]
    assert isinstance(saved_note, Note)
    assert saved_note.id == entity_id
    assert saved_note.media_id == media_id


async def test_device_conflict_uses_lww_for_name_and_max_for_last_seen(
    user_id: UUID, device_id: UUID
) -> None:
    entity_id = uuid4()
    saved_at = datetime(2026, 1, 1, tzinfo=timezone.utc)
    incoming_at = saved_at + timedelta(hours=1)
    saved = SimpleNamespace(
        id=entity_id,
        name="Telefon",
        last_seen=incoming_at + timedelta(hours=1),
        updated_at=saved_at,
    )
    repository = SimpleNamespace(
        allowed_updates={"name", "last_seen"},
        fetch_device_by_id_and_user_id=AsyncMock(return_value=saved),
        update_device_validate=AsyncMock(return_value=True),
    )
    resolver = ResolveDevice(user_id, AsyncMock())
    resolver.repository = repository
    change = make_change(
        device_id=device_id,
        entity_type="device",
        entity_id=entity_id,
        operation=SyncOperation.UPDATE,
        payload=device_payload(user_id, incoming_at),
    )

    resolved_id = await resolver.resolve_conflict(change)

    assert resolved_id == entity_id
    assert repository.update_device_validate.await_args_list == [
        call(device_id=entity_id, user_id=user_id, name="Laptop"),
        call(
            device_id=entity_id,
            user_id=user_id,
            last_seen=saved.last_seen,
        ),
    ]


async def test_library_conflict_merges_different_descriptions(
    user_id: UUID, device_id: UUID
) -> None:
    entity_id = uuid4()
    now = datetime.now(timezone.utc)
    saved = SimpleNamespace(
        id=entity_id,
        name="Filmy",
        description="opis z serwera",
        updated_at=now,
    )
    repository = SimpleNamespace(
        allowed_updates={"name", "description"},
        fetch_single_by_user=AsyncMock(return_value=saved),
        update_library_validate=AsyncMock(return_value=True),
    )
    resolver = ResolveLibrary(user_id, AsyncMock())
    resolver.repository = repository
    change = make_change(
        device_id=device_id,
        entity_type="library",
        entity_id=entity_id,
        operation=SyncOperation.UPDATE,
        payload=library_payload(now - timedelta(hours=1)),
    )

    resolved_id = await resolver.resolve_conflict(change)

    assert resolved_id == entity_id
    repository.update_library_validate.assert_awaited_once_with(
        entity_id=entity_id,
        user_id=user_id,
        description=("opis z klienta\n\n======[CONFLICTED]======\n\nopis z serwera"),
    )


async def test_library_conflict_updates_icon_from_newer_payload(
    user_id: UUID, device_id: UUID
) -> None:
    entity_id = uuid4()
    saved_at = datetime(2026, 1, 1, tzinfo=timezone.utc)
    incoming_at = saved_at + timedelta(hours=1)
    saved = SimpleNamespace(
        id=entity_id,
        name="Filmy",
        description="opis z serwera",
        icon_url="old/icon.jpg",
        updated_at=saved_at,
    )
    repository = SimpleNamespace(
        allowed_updates={"name", "description", "icon_url"},
        fetch_single_by_user=AsyncMock(return_value=saved),
        update_library_validate=AsyncMock(return_value=True),
    )
    resolver = ResolveLibrary(user_id, AsyncMock())
    resolver.repository = repository
    payload = library_payload(incoming_at)
    payload["description"] = saved.description
    payload["icon_url"] = "new/icon.webp"
    change = make_change(
        device_id=device_id,
        entity_type="library",
        entity_id=entity_id,
        operation=SyncOperation.UPDATE,
        payload=payload,
    )

    resolved_id = await resolver.resolve_conflict(change)

    assert resolved_id == entity_id
    repository.update_library_validate.assert_awaited_once_with(
        entity_id=entity_id,
        user_id=user_id,
        icon_url="new/icon.webp",
    )


async def test_media_conflict_updates_only_allowed_fields_from_newer_payload(
    user_id: UUID, device_id: UUID
) -> None:
    entity_id = uuid4()
    library_id = uuid4()
    saved_at = datetime(2026, 1, 1, tzinfo=timezone.utc)
    incoming_at = saved_at + timedelta(hours=1)
    saved = SimpleNamespace(id=entity_id, updated_at=saved_at)
    repository = SimpleNamespace(
        allowed_updates={"filename", "rating"},
        fetch_one_by_user=AsyncMock(return_value=saved),
        update_media_validate=AsyncMock(return_value=True),
    )
    resolver = ResolveMedia(user_id, AsyncMock())
    resolver.repository = repository
    change = make_change(
        device_id=device_id,
        entity_type="media",
        entity_id=entity_id,
        operation=SyncOperation.UPDATE,
        payload=media_payload(library_id, incoming_at),
    )

    resolved_id = await resolver.resolve_conflict(change)

    assert resolved_id == entity_id
    repository.update_media_validate.assert_awaited_once_with(
        entity_id=entity_id,
        user_id=user_id,
        filename="nowa-nazwa.mp4",
        rating=5,
    )


async def test_media_progress_conflict_keeps_newer_watch_state(
    user_id: UUID, device_id: UUID
) -> None:
    entity_id = uuid4()
    media_id = uuid4()
    saved_at = datetime(2026, 1, 1, tzinfo=timezone.utc)
    incoming_at = saved_at + timedelta(hours=1)
    saved = SimpleNamespace(id=entity_id, last_watched=saved_at)
    repository = SimpleNamespace(
        allowed_updates={"current_position", "last_watched", "last_device_id"},
        fetch_by_id_and_user=AsyncMock(return_value=saved),
        update_media_progress_validate=AsyncMock(return_value=True),
    )
    resolver = ResolveMediaProgress(user_id, AsyncMock())
    resolver.repository = repository
    change = make_change(
        device_id=device_id,
        entity_type="media_progress",
        entity_id=entity_id,
        operation=SyncOperation.UPDATE,
        payload=progress_payload(media_id, device_id, incoming_at),
    )

    resolved_id = await resolver.resolve_conflict(change)

    assert resolved_id == entity_id
    repository.update_media_progress_validate.assert_awaited_once_with(
        entity_id=entity_id,
        user_id=user_id,
        current_position=timedelta(seconds=90),
        last_watched=incoming_at,
        last_device_id=device_id,
    )


async def test_note_content_conflict_marks_original_and_saves_copy(
    user_id: UUID, device_id: UUID
) -> None:
    entity_id = uuid4()
    now = datetime.now(timezone.utc)
    saved = SimpleNamespace(
        id=entity_id,
        title="Tytul",
        content="tresc z serwera",
        timestamp=timedelta(seconds=30),
        updated_at=now,
    )
    repository = SimpleNamespace(
        allowed_updates={"title", "content", "timestamp"},
        fetch_by_user=AsyncMock(return_value=saved),
        update_note_validate=AsyncMock(return_value=True),
        save=AsyncMock(),
    )
    resolver = ResolveNote(user_id, AsyncMock())
    resolver.repository = repository
    change = make_change(
        device_id=device_id,
        entity_type="note",
        entity_id=entity_id,
        operation=SyncOperation.UPDATE,
        payload=note_payload(uuid4(), now - timedelta(hours=1)),
    )

    resolved_id = await resolver.resolve_conflict(change)

    assert resolved_id == entity_id
    repository.update_note_validate.assert_awaited_once_with(
        entity_id=entity_id,
        user_id=user_id,
        title="[CONFLICTED] Tytul",
    )
    repository.save.assert_awaited_once()
    conflict_copy = repository.save.await_args.args[0]
    assert conflict_copy.id == uuid5(entity_id, str(change.id))
    assert conflict_copy.content == "tresc z klienta"
