

from app.repositories.base_repository import BaseRepository
from app.models.media import Media

class MediaRepository(BaseRepository):
    model = Media
