from sqlalchemy import Column, String, DateTime, ForeignKey, Enum as SAEnum, func, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from app.database.connection import Base
import uuid


class Share(Base):
    __tablename__ = "shares"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    document_id = Column(UUID(as_uuid=True), ForeignKey("documents.id", ondelete="CASCADE"), nullable=False, index=True)
    shared_by = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    shared_with = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    permission = Column(SAEnum("view", "download", name="share_permission"), nullable=False, default="view")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    __table_args__ = (
        UniqueConstraint("document_id", "shared_with", name="unique_active_share"),
    )
