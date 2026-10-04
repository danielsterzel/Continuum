from typing import Annotated

from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.settings import settings
from app.repositories.device_repository import DeviceRepository
from app.repositories.library_repository import LibraryRepository
from app.repositories.media_progress_repository import MediaProgressRepository
from app.repositories.media_repository import MediaRepository
from app.repositories.note_repository import NoteRepository
from app.schemas.device_schema import DeviceRead
from app.schemas.sync_change_schema import SyncChangeWrite, SyncStateRead
from fastapi import Form, HTTPException, UploadFile, File
from app.schemas.library_schema import LibraryRead
from app.schemas.media_schema import MediaRead
from app.schemas.media_progress_schema import MediaProgressRead
from app.schemas.note_schema import NoteRead
from pathlib import Path, PurePosixPath
from fastapi import APIRouter, Depends, Response
from app.services.SyncService import InactiveDeviceError, SyncService
from app.db.dependencies import get_db
from app.api.device_api import touch_device
from uuid import UUID, uuid4

router = APIRouter(prefix="/sync")

MEDIA_ROOT = Path(settings.media_storage_dir)
CHUNK_SIZE = 1024 * 1024


def _parse_storage_path(path: str) -> tuple[UUID, str]:
    relative_path = PurePosixPath(path)
    if (
        relative_path.is_absolute()
        or len(relative_path.parts) != 2
        or ".." in relative_path.parts
        or "\\" in path
    ):
        raise HTTPException(status_code=400, detail="Invalid storage path")

    try:
        entity_id = UUID(relative_path.parts[0])
    except ValueError as error:
        raise HTTPException(status_code=400, detail="Invalid entity path") from error

    return entity_id, relative_path.as_posix()


async def _write_upload_atomically(file: UploadFile, filepath: Path) -> None:
    filepath.parent.mkdir(parents=True, exist_ok=True)
    temporary_path = filepath.with_name(f".{filepath.name}.{uuid4().hex}.tmp")

    try:
        with temporary_path.open("wb") as output:
            while chunk := await file.read(CHUNK_SIZE):
                output.write(chunk)
        temporary_path.replace(filepath)
    finally:
        temporary_path.unlink(missing_ok=True)


# TODO: Later change to JWT Auth if time allows
@router.post("/initiate/{user_id}")
async def sync(
    changes: list[SyncChangeWrite],
    user_id: UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
):

    service = SyncService(db)

    try:
        await service.sync(changes=changes, user_id=user_id)
    except InactiveDeviceError as e:
        print("SYNC DEVICE ERROR:", repr(e))
        return Response(status_code=403)
    except (SQLAlchemyError, ValueError, TypeError, KeyError) as e:
        print("SYNC ERROR:", repr(e))
        response = Response(
            status_code=404,
        )
        return response

    return {"status": "ok"}


@router.get("/state/{user_id}", response_model=SyncStateRead)
async def get_sync_state(
    user_id: UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    device_id: UUID | None = None,
):
    if device_id is not None:
        await touch_device(user_id=user_id, device_id=device_id, db=db)
        await db.commit()

    library_repository = LibraryRepository(db)
    media_repository = MediaRepository(db)
    note_repository = NoteRepository(db)
    media_progress_repository = MediaProgressRepository(db)
    device_repository = DeviceRepository(db)

    libraries = await library_repository.fetch_all_by_user(user_id)
    media = await media_repository.fetch_all_by_user(user_id)
    notes = await note_repository.fetch_all_by_user(user_id)
    media_progress = await media_progress_repository.fetch_all_by_user(user_id)
    devices = await device_repository.all_devices(user_id)

    libraries_read = [LibraryRead.model_validate(library) for library in libraries]

    media_read = [MediaRead.model_validate(media_entity) for media_entity in media]

    notes_read = [NoteRead.model_validate(note) for note in notes]

    media_progress_read = [
        MediaProgressRead.model_validate(progress) for progress in media_progress
    ]

    devices_read = [DeviceRead.model_validate(device) for device in devices]

    return SyncStateRead(
        devices=devices_read,
        libraries=libraries_read,
        media=media_read,
        notes=notes_read,
        media_progress=media_progress_read,
    )


@router.post("/icon/{user_id}")
async def sync_icon(
    user_id: UUID,
    path: Annotated[str, Form()],
    file: Annotated[UploadFile, File()],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    library_id, normalized_path = _parse_storage_path(path)
    library = await LibraryRepository(db).fetch_single_by_user(
        user_id=user_id, library_id=library_id
    )

    if not library:
        raise HTTPException(status_code=404, detail="Library not found")

    if library.icon_url != normalized_path:
        raise HTTPException(
            status_code=409,
            detail="Icon path does not match the current library metadata",
        )

    filepath = MEDIA_ROOT / str(user_id) / normalized_path
    await _write_upload_atomically(file, filepath)

    return {"status": "ok"}


@router.post("/media/file/")
async def sync_file(
    user_id: Annotated[UUID, Form()],
    library_id: Annotated[UUID, Form()],
    path: Annotated[str, Form()],
    file: Annotated[UploadFile, File()],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    path_library_id, normalized_path = _parse_storage_path(path)
    if path_library_id != library_id:
        raise HTTPException(status_code=400, detail="Library path mismatch")

    filename = PurePosixPath(normalized_path).name
    media_id_text = filename.rsplit(".", maxsplit=1)[0]
    try:
        media_id = UUID(media_id_text)
    except ValueError as error:
        raise HTTPException(status_code=400, detail="Invalid media path") from error

    media = await MediaRepository(db).fetch_one_by_user(
        media_id=media_id, user_id=user_id
    )

    if not media or media.library_id != library_id:
        raise HTTPException(status_code=404, detail="Media not found")

    if media.filepath != normalized_path:
        raise HTTPException(
            status_code=409,
            detail="File path does not match the current media metadata",
        )

    filepath = MEDIA_ROOT / str(user_id) / normalized_path
    await _write_upload_atomically(file, filepath)

    return {"status": "ok"}
