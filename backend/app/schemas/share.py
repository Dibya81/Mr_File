from pydantic import BaseModel, Field
from typing import Optional, List


class ShareCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=30)
    permission: str = Field(default="view", pattern="^(view|download)$")


class ShareResponse(BaseModel):
    id: str
    document_id: str
    shared_by: str
    shared_by_username: str
    shared_with: str
    shared_with_username: str
    permission: str
    created_at: str


class SharedWithMeResponse(BaseModel):
    shares: List[ShareResponse]
    total: int
    page: int
    per_page: int
