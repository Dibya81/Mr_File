from sqlalchemy import Column, String, DateTime, Text, ForeignKey, func, Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID
from app.database.connection import Base
import uuid


class CommunityRequest(Base):
    __tablename__ = "community_requests"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    requester_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=True)
    document_type = Column(String(50), nullable=True)
    status = Column(
        SAEnum("open", "filled", "cancelled", name="community_request_status"),
        nullable=False,
        default="open",
        index=True,
    )
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
