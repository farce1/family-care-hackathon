import uuid

from sqlalchemy import BIGINT, TIMESTAMP, UUID, Column, Date, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import BYTEA
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

Base = declarative_base()


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False)
    first_name = Column(String(255), nullable=False)
    last_name = Column(String(255), nullable=False)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())
    last_login = Column(TIMESTAMP(timezone=True), nullable=True)


class ParsedAppointment(Base):
    __tablename__ = "parsed_appointments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    original_filename = Column(String(500), nullable=False)
    name = Column(String(500), nullable=False)
    date = Column(Date, nullable=False)
    appointment_type = Column(String(50), nullable=False)
    summary = Column(Text, nullable=True)
    doctor = Column(String(255), nullable=True)
    file_size = Column(BIGINT, nullable=False)
    raw_file_data = Column(BYTEA, nullable=True)
    processing_status = Column(String(20), nullable=False, default="completed")
    confidence_score = Column(Integer, nullable=False, default=0)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    user = relationship("User")
