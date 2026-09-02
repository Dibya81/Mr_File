from sqlalchemy import Column, String, DateTime, ForeignKey, JSON, Text, Enum as SAEnum, func
from sqlalchemy.dialects.postgresql import UUID
from app.database.connection import Base
import uuid


class ProcessingJob(Base):
    __tablename__ = "processing_jobs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    document_id = Column(UUID(as_uuid=True), ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    job_type = Column(String(50), nullable=False, default="extract")
    status = Column(
        SAEnum("uploaded", "queued", "processing", "completed", "failed", name="processing_status"),
        nullable=False,
        default="queued",
        index=True,
    )
    detected_type = Column(String(50), nullable=True)
    category = Column(String(100), nullable=True)
    file_metadata = Column("metadata", JSON, default=dict)
    error_message = Column(Text, nullable=True)
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)
