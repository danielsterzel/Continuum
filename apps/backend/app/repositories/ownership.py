from sqlalchemy.ext.asyncio import AsyncSession

from uuid import UUID
from sqlalchemy import select
from app.models.media import Media
from app.models.libraries import Library

async def is_media_owned_by_user(db: AsyncSession, media_id: UUID, user_id: UUID) -> bool:
    query = (
        select(Media.id)
        .join(Library, Library.id == Media.library_id)
        .where(Media.id == media_id, Library.user_id == user_id)
    )

    res = await db.execute(query)
    return res.scalar_one_or_none() is not None
