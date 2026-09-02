from sqlalchemy import Column, String, DateTime, Boolean, BigInteger, Text, ForeignKey, JSON, func, Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID
from app.database.connection import Base
import uuid


class Document(Base):
    __tablename__ = "documents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    owner_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    folder_id = Column(UUID(as_uuid=True), ForeignKey("folders.id", ondelete="SET NULL"), nullable=True, index=True)
    original_filename = Column(String(500), nullable=False)
    storage_path = Column(String(1000), nullable=False)
    file_size = Column(BigInteger, nullable=False, default=0)
    file_hash = Column(String(64), nullable=False, index=True)
    detected_mime_type = Column(String(255), nullable=False)
    detected_file_type = Column(String(50), nullable=False, index=True)
    category = Column(String(100), nullable=True)
    title = Column(String(500), nullable=True)
    author = Column(String(255), nullable=True)
    file_metadata = Column("metadata", JSON, default=dict)
    is_locked = Column(Boolean, nullable=False, default=False)
    password_hash = Column(String(255), nullable=True)
    visibility = Column(
        SAEnum("private", "password", "public", name="document_visibility"),
        nullable=False,
        default="private",
        index=True,
    )
    public_password_hash = Column(String(255), nullable=True)
    public_title = Column(String(500), nullable=True)
    processing_status = Column(
        SAEnum("uploaded", "queued", "processing", "completed", "failed", name="processing_status"),
        nullable=False,
        default="uploaded",
        index=True,
    )
    processing_error = Column(Text, nullable=True)
    processing_completed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
