
from app.repositories.base_repository import BaseRepository
from app.models.user import User
from uuid import UUID
from sqlalchemy import select

class UserRepository(BaseRepository):
    model = User

    async def validate_user_exists(self, user_id: UUID) -> bool:
        query = (
            select(user_id).where(User.id == user_id)
        )

        res = await self.db.execute(query)

        user = res.scalar_one_or_none()
        if not user:
            return False

        return True
