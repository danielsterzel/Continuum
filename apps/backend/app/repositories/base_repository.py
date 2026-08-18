from sqlalchemy.ext.asyncio import AsyncSession

from sqlalchemy import select, delete

from uuid import UUID


class BaseRepository[T]:
    model: type[T]

    def __init__(self, db: AsyncSession):
        self.db = db

    async def save(self, obj: T) -> None:

        self.db.add(obj)
        await self.db.commit()
        await self.db.flush(obj)

    async def fetch(self, id: UUID) -> T | None:

        query = select(self.model).where(self.model.id == id)

        result = await self.db.execute(query)

        return result.scalar_one_or_none()

    async def remove(self, id: UUID) -> None:

        query = delete(self.model).where(self.model.id == id)

        await self.db.execute(query)
        await self.db.flush()

