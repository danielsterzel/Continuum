"""add device entity type

Revision ID: 11dee49f0224
Revises: ea5195ec8073
Create Date: 2026-08-23 01:08:10.882920

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "11dee49f0224"
down_revision: Union[str, Sequence[str], None] = "ea5195ec8073"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.execute("ALTER TYPE entity_type ADD VALUE IF NOT EXISTS 'device'")


def downgrade() -> None:
    """Downgrade schema."""
    pass
