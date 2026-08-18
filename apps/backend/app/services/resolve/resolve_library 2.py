from app.repositories.library_repository import LibraryRepository
from app.schemas.sync_change_schema import SyncChangeWrite
from app.services.resolve.resolve_base import ResolveBase


class ResolveLibrary(ResolveBase[LibraryRepository]):
    async def resolve(self, change: SyncChangeWrite) -> None: ...
