
from sqlalchemy.ext.asyncio import AsyncSession

from sqlalchemy import select

from uuid import UUID



class BaseRepository[T]:

    model: type[T]

    def __init__(self, db: AsyncSession):
        self.db = db

    async def save(self, obj: T) -> None:

        self.db.add(obj)
        await self.db.commit()
        await self.db.refresh(obj)

    async def fetch(self, id: UUID) -> T | None:

        query = select(self.model).where(self.model.id == id)

        result = await self.db.execute(query)

    
        return result.scalar_one_or_none()
