
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, Response, status
from app.schemas.library_schema import LibraryCreate, LibraryRead
from app.models.libraries import Library
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.dependencies import get_db
from app.repositories.library_repository import LibraryRepository

from uuid import UUID


router = APIRouter(prefix="/library")


@router.post("/create")
async def create_library(
    library_create: LibraryCreate, db: Annotated[AsyncSession, Depends(get_db)]
):

    print(repr(library_create))
    lib = Library(
        user_id=library_create.user_id,
        name=library_create.name,
        description=library_create.description,
        icon_url=library_create.icon_url,
    )

    library_repository = LibraryRepository(db=db)
    await library_repository.save(lib)

    return {"success": True}

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



