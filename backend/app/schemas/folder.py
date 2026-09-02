from pydantic import BaseModel, Field
from typing import Optional, List


class FolderCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    parent_folder_id: Optional[str] = None


class FolderUpdate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)


class FolderResponse(BaseModel):
    id: str
    owner_id: str
    parent_folder_id: Optional[str]
    name: str
    created_at: str
    updated_at: str


class FolderListResponse(BaseModel):
    folders: List[FolderResponse]
    total: int
