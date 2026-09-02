from sqlalchemy import Column, String, DateTime, Text, ForeignKey, func, Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID
from app.database.connection import Base
import uuid


class CommunityReport(Base):
    __tablename__ = "community_reports"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    reporter_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    reported_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    reported_document_id = Column(UUID(as_uuid=True), ForeignKey("documents.id", ondelete="SET NULL"), nullable=True)
    reason = Column(
        SAEnum("inappropriate", "copyright", "spam", "malware", "other", name="report_reason"),
        nullable=False,
    )
    details = Column(Text, nullable=True)
    status = Column(
        SAEnum("pending", "reviewed", "actioned", "dismissed", name="report_status"),
        nullable=False,
        default="pending",
        index=True,
    )
    resolution = Column(Text, nullable=True)
    reviewed_by = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    reviewed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)
