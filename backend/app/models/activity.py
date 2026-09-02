from sqlalchemy import Column, String, DateTime, ForeignKey, Text, func
from sqlalchemy.dialects.postgresql import UUID, JSONB
from app.database.connection import Base
import uuid


class ActivityEvent(Base):
    __tablename__ = "activity_events"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    actor_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    actor_username = Column(String(100), nullable=True)
    action = Column(String(100), nullable=False, index=True)
    object_type = Column(String(50), nullable=False)
    object_id = Column(String(100), nullable=True)
    object_label = Column(String(500), nullable=True)
    detail = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)


class SecurityEvent(Base):
    __tablename__ = "security_events"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    event_type = Column(String(50), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    username = Column(String(100), nullable=True)
    ip_address = Column(String(64), nullable=True)
    detail = Column(Text, nullable=False)
    severity = Column(String(20), nullable=False, default="info")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)
