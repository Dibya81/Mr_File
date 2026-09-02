from sqlalchemy import Column, String, DateTime, Text, ForeignKey, UniqueConstraint, func, Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID
from app.database.connection import Base
import uuid


class CommunityOffer(Base):
    __tablename__ = "community_offers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    request_id = Column(UUID(as_uuid=True), ForeignKey("community_requests.id", ondelete="CASCADE"), nullable=False, index=True)
    offerer_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    document_id = Column(UUID(as_uuid=True), ForeignKey("documents.id", ondelete="CASCADE"), nullable=False)
    message = Column(Text, nullable=True)
    status = Column(
        SAEnum("pending", "accepted", "declined", "withdrawn", name="community_offer_status"),
        nullable=False,
        default="pending",
    )
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    __table_args__ = (
        UniqueConstraint("request_id", "document_id", name="unique_request_document_offer"),
    )
