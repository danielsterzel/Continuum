from collections.abc import AsyncGenerator
from typing import Annotated
from uuid import UUID

from fastapi import Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.settings import settings
from app.db.session import AsyncSessionLocal
from app.models.user import User


async def get_db() -> AsyncGenerator[AsyncSession, None]:

    async with AsyncSessionLocal() as session:
        yield session


async def get_owner_id(db: Annotated[AsyncSession, Depends(get_db)]) -> UUID:
    """Single-owner system: fetch (or lazily create on first run) the one
    user identified by settings.owner_email and return their id."""

    user = await db.scalar(select(User).where(User.email == settings.owner_email))

    if user is None:
        user = User(email=settings.owner_email, display_name="Owner")
        db.add(user)
        await db.commit()
        await db.refresh(user)

    return user.id


OwnerId = Annotated[UUID, Depends(get_owner_id)]
