"""remove obsolete media types

Revision ID: 4f4255b5e65c
Revises: 4296339c6d0d
"""

from typing import Sequence, Union

from alembic import op


revision: str = "4f4255b5e65c"
down_revision: Union[str, Sequence[str], None] = "4296339c6d0d"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("ALTER TYPE media_type RENAME TO media_type_old")

    op.execute("""
        CREATE TYPE media_type AS ENUM (
            'video',
            'recording',
            'image',
            'unknown'
        )
    """)

    op.execute("""
        ALTER TABLE media
        ALTER COLUMN media_type TYPE media_type
        USING (
            CASE
                WHEN media_type::text IN ('AUDIOBOOK', 'PODCAST')
                    THEN 'unknown'
                ELSE media_type::text
            END
        )::media_type
    """)

    op.execute("DROP TYPE media_type_old")
