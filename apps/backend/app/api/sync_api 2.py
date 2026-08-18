from app.schemas.sync_change_schema import SyncChangeWrite

from fastapi import APIRouter, Depends


router = APIRouter(prefix="/sync")


@router.post("/initiate")
async def sync(changes: list[SyncChangeWrite]): ...
