"""Change to 1 naming convention. Removed deleted_at for media progress. Fix on last_seen for device

Revision ID: ed03a37def66
Revises: 4ff54c45ef28
Create Date: 2026-08-28 23:14:53.289395

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "ed03a37def66"
down_revision: Union[str, Sequence[str], None] = "4ff54c45ef28"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Rename instead of recreating tables so existing data, foreign keys and
    # PostgreSQL enum types remain intact.
    op.rename_table("device", "devices")
    op.rename_table("note", "notes")
    op.rename_table("media_progress", "media_progresses")
    op.rename_table("sync_change", "sync_changes")

    # Keep explicitly named indexes and constraints consistent with the new
    # plural table names.
    op.execute("ALTER INDEX idx_device_user RENAME TO ix_devices_user_id")
    op.execute(
        "ALTER INDEX ix_sync_change_device_id RENAME TO ix_sync_changes_device_id"
    )
    op.execute("ALTER INDEX ix_sync_change_entity RENAME TO ix_sync_changes_entity")

    op.execute("ALTER TABLE devices RENAME CONSTRAINT device_pkey TO devices_pkey")
    op.execute(
        "ALTER TABLE devices RENAME CONSTRAINT device_user_id_fkey "
        "TO devices_user_id_fkey"
    )
    op.execute("ALTER TABLE notes RENAME CONSTRAINT note_pkey TO notes_pkey")
    op.execute(
        "ALTER TABLE notes RENAME CONSTRAINT note_media_id_fkey TO notes_media_id_fkey"
    )
    op.execute(
        "ALTER TABLE media_progresses RENAME CONSTRAINT media_progress_pkey "
        "TO media_progresses_pkey"
    )
    op.execute(
        "ALTER TABLE media_progresses "
        "RENAME CONSTRAINT media_progress_media_id_fkey "
        "TO media_progresses_media_id_fkey"
    )
    op.execute(
        "ALTER TABLE media_progresses "
        "RENAME CONSTRAINT media_progress_last_device_id_fkey "
        "TO media_progresses_last_device_id_fkey"
    )
    op.execute(
        "ALTER TABLE media_progresses "
        "RENAME CONSTRAINT unique_media_for_progress "
        "TO uq_media_progresses_media_id"
    )
    op.execute(
        "ALTER TABLE sync_changes "
        "RENAME CONSTRAINT sync_change_pkey TO sync_changes_pkey"
    )
    op.execute(
        "ALTER TABLE sync_changes "
        "RENAME CONSTRAINT sync_change_device_id_fkey "
        "TO sync_changes_device_id_fkey"
    )

    op.add_column(
        "devices",
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.drop_column("media_progresses", "deleted_at")

    # The old column was TIMESTAMP WITHOUT TIME ZONE. Existing naive values
    # are interpreted as UTC while converting them to TIMESTAMPTZ.
    op.alter_column(
        "sync_changes",
        "created_at",
        existing_type=sa.DateTime(timezone=False),
        type_=sa.DateTime(timezone=True),
        existing_nullable=False,
        postgresql_using="created_at AT TIME ZONE 'UTC'",
    )

    for table_name in (
        "devices",
        "libraries",
        "media",
        "media_progresses",
        "notes",
    ):
        op.alter_column(
            table_name,
            "version",
            existing_type=sa.Integer(),
            server_default=sa.text("0"),
            existing_nullable=False,
        )

    op.execute(
        "ALTER TABLE media RENAME CONSTRAINT rating_betwen_1_and_5 "
        "TO rating_between_1_and_5"
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.execute(
        "ALTER TABLE media RENAME CONSTRAINT rating_between_1_and_5 "
        "TO rating_betwen_1_and_5"
    )

    for table_name in (
        "devices",
        "libraries",
        "media",
        "media_progresses",
        "notes",
    ):
        op.alter_column(
            table_name,
            "version",
            existing_type=sa.Integer(),
            server_default=sa.text("1"),
            existing_nullable=False,
        )

    op.alter_column(
        "sync_changes",
        "created_at",
        existing_type=sa.DateTime(timezone=True),
        type_=sa.DateTime(timezone=False),
        existing_nullable=False,
        postgresql_using="created_at AT TIME ZONE 'UTC'",
    )

    op.add_column(
        "media_progresses",
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.drop_column("devices", "deleted_at")

    op.execute(
        "ALTER TABLE sync_changes "
        "RENAME CONSTRAINT sync_changes_device_id_fkey "
        "TO sync_change_device_id_fkey"
    )
    op.execute(
        "ALTER TABLE sync_changes "
        "RENAME CONSTRAINT sync_changes_pkey TO sync_change_pkey"
    )
    op.execute(
        "ALTER TABLE media_progresses "
        "RENAME CONSTRAINT uq_media_progresses_media_id "
        "TO unique_media_for_progress"
    )
    op.execute(
        "ALTER TABLE media_progresses "
        "RENAME CONSTRAINT media_progresses_last_device_id_fkey "
        "TO media_progress_last_device_id_fkey"
    )
    op.execute(
        "ALTER TABLE media_progresses "
        "RENAME CONSTRAINT media_progresses_media_id_fkey "
        "TO media_progress_media_id_fkey"
    )
    op.execute(
        "ALTER TABLE media_progresses RENAME CONSTRAINT media_progresses_pkey "
        "TO media_progress_pkey"
    )
    op.execute(
        "ALTER TABLE notes RENAME CONSTRAINT notes_media_id_fkey TO note_media_id_fkey"
    )
    op.execute("ALTER TABLE notes RENAME CONSTRAINT notes_pkey TO note_pkey")
    op.execute(
        "ALTER TABLE devices RENAME CONSTRAINT devices_user_id_fkey "
        "TO device_user_id_fkey"
    )
    op.execute("ALTER TABLE devices RENAME CONSTRAINT devices_pkey TO device_pkey")

    op.execute("ALTER INDEX ix_sync_changes_entity RENAME TO ix_sync_change_entity")
    op.execute(
        "ALTER INDEX ix_sync_changes_device_id RENAME TO ix_sync_change_device_id"
    )
    op.execute("ALTER INDEX ix_devices_user_id RENAME TO idx_device_user")

    op.rename_table("sync_changes", "sync_change")
    op.rename_table("media_progresses", "media_progress")
    op.rename_table("notes", "note")
    op.rename_table("devices", "device")
