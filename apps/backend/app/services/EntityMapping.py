from typing import Union
from app import models
from app.models.sync_change import EntityType

ENTITY_UNION = Union[
    models.Note,
    models.Library,
    models.Media,
    models.MediaProgress,
    models.Device,
    models.User,
]

ENTITY_MAPPING = {
    EntityType.Note: models.Note,
    EntityType.Library: models.Library,
    EntityType.Media: models.Media,
    EntityType.MediaProgress: models.MediaProgress,
    EntityType.Device: models.Device,
}
