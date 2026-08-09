from fastapi import APIRouter, Depends, File, UploadFile, Form, HTTPException

from typing import Annotated

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.libraries import Library
from app.models.media import Media
from app.schemas.media_schema import MediaRead
from app.models.media import MediaType
from app.db.dependencies import get_db

from app.repositories.library_repository import LibraryRepository
from app.repositories.media_repository import MediaRepository

from pathlib import Path

from uuid import UUID, uuid4

API_BASE = ""


router = APIRouter(prefix=API_BASE)

