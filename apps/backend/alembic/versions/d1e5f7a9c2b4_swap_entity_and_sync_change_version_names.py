"""swap entity and sync change version names

Revision ID: d1e5f7a9c2b4
Revises: c74b6c5d76d0
Create Date: 2026-09-25

"""

from typing import Sequence, Union

from alembic import op


revision: str = "d1e5f7a9c2b4"
down_revision: Union[str, Sequence[str], None] = "c74b6c5d76d0"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


ENTITY_TABLES = (
    "devices",
    "libraries",
    "media",
    "media_progresses",
    "notes",
)


def upgrade() -> None:
    for table_name in ENTITY_TABLES:
        op.alter_column(table_name, "version", new_column_name="expected_version")

    op.alter_column("sync_changes", "expected_version", new_column_name="version")


def downgrade() -> None:
    op.alter_column("sync_changes", "version", new_column_name="expected_version")

    for table_name in ENTITY_TABLES:
        op.alter_column(table_name, "expected_version", new_column_name="version")
