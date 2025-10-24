"""Initial migration - Create appointment-related tables

Revision ID: 001_initial_migration
Revises:
Create Date: 2025-10-03 12:00:00.000000

"""

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision: str = "001_initial_migration"
down_revision: str = None
branch_labels: str = None
depends_on: str = None


def upgrade() -> None:
    # Enable UUID extension
    op.execute('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')

    # Create parsed_appointments table (main table for parsed PDF data)
    op.create_table(
        "parsed_appointments",
        sa.Column("id", sa.UUID(), server_default=sa.text("uuid_generate_v4()"), nullable=False),
        sa.Column("original_filename", sa.String(length=500), nullable=False),
        sa.Column("name", sa.String(length=500), nullable=False),
        sa.Column("date", sa.Date(), nullable=False),
        sa.Column("appointment_type", sa.String(length=50), nullable=False),
        sa.Column("summary", sa.Text(), nullable=True),
        sa.Column("doctor", sa.String(length=255), nullable=True),
        sa.Column("file_size", sa.BigInteger(), nullable=False),
        sa.Column("raw_file_data", sa.LargeBinary(), nullable=True),
        sa.Column("processing_status", sa.String(length=20), nullable=False),
        sa.Column("confidence_score", sa.Integer(), nullable=False),
        sa.Column(
            "created_at",
            sa.TIMESTAMP(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=True,
        ),
        sa.Column(
            "updated_at",
            sa.TIMESTAMP(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=True,
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.CheckConstraint(
            "appointment_type IN ('General Checkup', 'Dental', 'Vision', 'Specialist', 'Vaccination', 'Follow-up', 'Emergency', 'Lab Work', 'Physical Therapy', 'Mental Health', 'Veterinary', 'Other')",
            name="parsed_appointment_type_check",
        ),
        sa.CheckConstraint(
            "processing_status IN ('completed', 'failed', 'processing')",
            name="processing_status_check",
        ),
    )

    # Create indexes for performance
    op.create_index("idx_parsed_appointments_date", "parsed_appointments", ["date"], unique=False)
    op.create_index(
        "idx_parsed_appointments_type", "parsed_appointments", ["appointment_type"], unique=False
    )
    op.create_index(
        "idx_parsed_appointments_status", "parsed_appointments", ["processing_status"], unique=False
    )

    # Create update trigger function
    op.execute("""
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
    END;
    $$ language 'plpgsql';
    """)

    # Apply triggers
    op.execute(
        "CREATE TRIGGER update_parsed_appointments_updated_at BEFORE UPDATE ON parsed_appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();"
    )

    # Add comments
    op.execute(
        "COMMENT ON TABLE parsed_appointments IS 'Stores parsed appointment data extracted from uploaded PDF medical documents';"
    )


def downgrade() -> None:
    # Drop triggers
    op.execute(
        "DROP TRIGGER IF EXISTS update_parsed_appointments_updated_at ON parsed_appointments;"
    )
    op.execute("DROP FUNCTION IF EXISTS update_updated_at_column();")

    # Drop indexes
    op.drop_index("idx_parsed_appointments_status", table_name="parsed_appointments")
    op.drop_index("idx_parsed_appointments_type", table_name="parsed_appointments")
    op.drop_index("idx_parsed_appointments_date", table_name="parsed_appointments")

    # Drop table
    op.drop_table("parsed_appointments")

    # Drop extension
    op.execute('DROP EXTENSION IF EXISTS "uuid-ossp"')
