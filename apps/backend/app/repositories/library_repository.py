
from app.models.libraries import Library
from app.repositories.base_repository import BaseRepository
from sqlalchemy import select, and_, delete, update, func
from app.models.media import Media
from uuid import UUID

from sqlalchemy.orm import selectinload

class LibraryRepository(BaseRepository):
    model = Library

    async def fetch_all_by_user(self, user_id: UUID) -> list[Library]:
        libraries = await self.db.execute(
            select(Library)
            .where(Library.user_id == user_id)
            .options(selectinload(Library.media))
        )
        return libraries.scalars().all()

    async def fetch_single_by_user(self, user_id: UUID, library_id: UUID) -> Library | None:
        library = await self.db.execute(
            select(Library)
            .where(and_(Library.user_id == user_id, Library.id == library_id))
            .options(selectinload(Library.media))
        )
        return library.scalar_one_or_none()

    async def touch(self, library_id: UUID) -> None:
        await self.db.execute(
            update(Library)
            .where(Library.id == library_id)
            .values(updated_at=func.now())
        )

    async def remove_media(self, user_id, library_id, media_id) -> bool:
        result = await self.db.execute(
            delete(Media).where(
                Media.id == media_id,
                Media.library_id == library_id,
                Media.library_id.in_(
                    select(Library.id).where(
                        Library.id == library_id,
                        Library.user_id == user_id,
                    )
                ),
            )
        )

        return result.rowcount == 1