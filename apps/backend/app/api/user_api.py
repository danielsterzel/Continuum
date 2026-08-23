


from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User
from app.db.dependencies import get_db
from app.schemas.user_schema import UserRead, UserWrite, UserLogin
import bcrypt
from app.repositories.user_repository import UserRepository

router = APIRouter(prefix="/user")

@router.post("/setup", response_model=UserRead)
async def setup_user(request: UserWrite, db: Annotated[AsyncSession, Depends(get_db)]):


    user_repository = UserRepository(db)

    is_saved_user = user_repository.fetch_by_email(email=request.email)
    if is_saved_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Couldn't process request")

    salt = bcrypt.gensalt()

    hashed_password = bcrypt.hashpw(
        request.password.encode("utf-8"),
        salt
    ).decode("utf-8")
    user = User(
        display_name=request.display_name,
        email=request.email,
        password_hash=hashed_password
    )
    await user_repository.save(user)
    await db.commit()

    return UserRead.model_validate(user)

@router.post("/login", response_model=UserRead)
async def login(request: UserLogin, db: Annotated[AsyncSession, Depends(get_db)]):

    user_repository = UserRepository(db)

    user = await user_repository.fetch_by_email(request.email)

    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Couldn't login")

    is_valid = bcrypt.checkpw(
        request.password.encode("utf-8"),
        user.password_hash.encode("utf-8"),)

    if not is_valid:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Couldn't login")

    return UserRead.model_validate(user)
