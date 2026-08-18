"""update media type enum

Revision ID: 4296339c6d0d
Revises: 2872d753adb7
Create Date: 2026-08-09 16:49:42.858633

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "4296339c6d0d"
down_revision: Union[str, Sequence[str], None] = "2872d753adb7"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("ALTER TYPE media_type RENAME VALUE 'VIDEO' TO 'video'")
    op.execute("ALTER TYPE media_type RENAME VALUE 'RECORDING' TO 'recording'")
    op.execute("ALTER TYPE media_type ADD VALUE 'image'")
    op.execute("ALTER TYPE media_type ADD VALUE 'unknown'")


def downgrade() -> None:
    op.execute("ALTER TYPE media_type RENAME VALUE 'video' TO 'VIDEO'")
    op.execute("ALTER TYPE media_type RENAME VALUE 'recording' TO 'RECORDING'")
