
from typing import Annotated

from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession

from app.schemas.sync_change_schema import SyncChangeWrite

from fastapi import APIRouter, Depends, Response
from app.services.SyncService import SyncService
from app.db.dependencies import OwnerId, get_db
router = APIRouter(prefix="/sync")


@router.post("/initiate")
async def sync(changes: list[SyncChangeWrite], user_id: OwnerId, db: Annotated[AsyncSession, Depends(get_db)]):

    service = SyncService(db)

    try:
        await service.sync(
            changes=changes,
            user_id=user_id
        )
    except (SQLAlchemyError, ValueError, TypeError, KeyError) as e:
        print("SYNC ERROR:", repr(e))
        response = Response(
            status_code=404,
        )
        return response

    return {"status": "ok"}
