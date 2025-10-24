"""add_user_id_to_appointments

Revision ID: 003_add_user_id_to_appointments
Revises: 002_add_users_table
Create Date: 2025-10-04 01:06:07.267189

"""

from collections.abc import Sequence

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "003_add_user_id_to_appointments"
down_revision: str = "002_add_users_table"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    # Add user_id column to parsed_appointments table
    op.add_column("parsed_appointments", sa.Column("user_id", sa.UUID(), nullable=False))
    op.create_foreign_key(
        "fk_parsed_appointments_user_id",
        "parsed_appointments",
        "users",
        ["user_id"],
        ["id"],
        ondelete="CASCADE",
    )
    op.create_index(
        "idx_parsed_appointments_user", "parsed_appointments", ["user_id"], unique=False
    )


def downgrade() -> None:
    # Remove the foreign key constraint and index first
    op.drop_index("idx_parsed_appointments_user", table_name="parsed_appointments")
    op.drop_constraint("fk_parsed_appointments_user_id", "parsed_appointments", type_="foreignkey")
    # Remove the column
    op.drop_column("parsed_appointments", "user_id")
