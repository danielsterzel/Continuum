
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, Response, status, UploadFile, File
from app.schemas.library_schema import LibraryCreate, LibraryRead
from app.models.libraries import Library
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.dependencies import get_db
from app.repositories.library_repository import LibraryRepository
from app.repositories.media_repository import MediaRepository
from app.models.media import Media, MEDIA_TYPE_MAP
from app.schemas.media_schema import MediaRead, MediaType


from pathlib import Path
from uuid import UUID, uuid4

MEDIA_ROOT = Path("media_storage")
CHUNK_SIZE = 1024 * 1024
router = APIRouter(prefix="/library")


def divulge_media_type(content_type: str) -> MediaType:

    for prefix, media_type in MEDIA_TYPE_MAP.items():
        if content_type.startswith(prefix):
            return  media_type
    return MediaType.UNKNOWN


@router.post("/create", response_model=LibraryRead)
async def create_library(
    library_create: LibraryCreate, db: Annotated[AsyncSession, Depends(get_db)]
) -> LibraryRead:

    lib = Library(
        user_id=library_create.user_id,
        name=library_create.name,
        description=library_create.description,
        icon_url=library_create.icon_url,
    )

    library_repository = LibraryRepository(db=db)
    await library_repository.save(lib)

    await db.commit()

    await db.refresh(lib, attribute_names=["media"])
    output_lib = LibraryRead.model_validate(lib)

    return output_lib

@router.get("/collection/{user_id}", response_model=list[LibraryRead])
async def get_libraries(user_id: UUID, db: Annotated[AsyncSession, Depends(get_db)]):

    library_repository = LibraryRepository(db=db)
    libraries = await library_repository.fetch_all_by_user(user_id=user_id)
    return libraries

@router.get("/collection/{user_id}/{library_id}", response_model=LibraryRead)
async def get_single_library(user_id : UUID, library_id: UUID, db: Annotated[AsyncSession, Depends(get_db)]):

    library_repository = LibraryRepository(db)

    library = await library_repository.fetch_single_by_user(user_id=user_id, library_id=library_id)

    if not library:
        raise HTTPException(status_code=404, detail="No such library")

    return library

@router.delete("/collection/{user_id}/{library_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_lib(user_id: UUID, library_id: UUID, db: Annotated[AsyncSession, Depends(get_db)]):

    library_repository = LibraryRepository(db)

    await library_repository.remove(library_id)

    return Response(status_code=status.HTTP_204_NO_CONTENT)

@router.get("/{library_id}/media", response_model=list[MediaRead])
async def get_media_files(
    library_id: UUID, db: Annotated[AsyncSession, Depends(get_db)]
):
    media_repository = MediaRepository(db=db)

    media_list = await media_repository.fetch_by_library(library_id=library_id)

    media_schemas = [
        MediaRead.model_validate(media_model) for media_model in media_list
    ]

    return media_schemas


@router.get("/{library_id}/media/{media_id}", response_model=MediaRead)
async def get_file(
    library_id: UUID, media_id: UUID, db: Annotated[AsyncSession, Depends(get_db)]
):
    media_repository = MediaRepository(db=db)

    media = await media_repository.fetch(media_id)

    if not media:
        raise HTTPException(status_code=404, detail="Media was not found")

    return media

@router.post("/{library_id}/media/upload", response_model=list[MediaRead])
async def upload_files(
    library_id: UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    files: Annotated[list[UploadFile], File()]
):

    library_repository = LibraryRepository(db=db)
    media_repository = MediaRepository(db=db)

    library = await library_repository.fetch(id=library_id)

    if library is None:
        raise HTTPException(status_code=404, detail="Library not found")

    media_files = []

    for file in files:
        media_id = uuid4()  # bo sciezka do pliku jest po uuid wiec musi byc przed
        # wrzuceniem do bazy i musi byc zgodne z baza

        safe_name = Path(file.filename or "unnamed").name
        folder = MEDIA_ROOT / str(media_id)
        folder.mkdir(parents=True, exist_ok=True)
        dest = folder / safe_name

        size = 0
        with open(dest, "wb") as out:
            while chunk := await file.read(CHUNK_SIZE):
                out.write(chunk)
                size += len(chunk)

        file_type = file.content_type or ""
        media_type = divulge_media_type(file_type)

        media: Media = Media(
            id=media_id,
            library_id=library_id,
            filename=safe_name,
            filepath=str(dest),
            file_size=size,
            media_type=media_type,
        )

        await media_repository.save(obj=media)
        media_files.append(media)

    await db.commit()

    return [MediaRead.model_validate(media) for media in media_files]
