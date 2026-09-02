from pydantic import BaseModel, Field
from typing import Optional, List


class DocumentResponse(BaseModel):
    id: str
    owner_id: str
    folder_id: Optional[str]
    original_filename: str
    file_size: int
    file_hash: str
    detected_mime_type: str
    detected_file_type: str
    category: Optional[str]
    title: Optional[str]
    author: Optional[str]
    metadata: dict
    is_locked: bool
    processing_status: str
    processing_error: Optional[str]
    created_at: str
    updated_at: str


class DocumentUpdate(BaseModel):
    original_filename: Optional[str] = Field(None, min_length=1, max_length=500)
    folder_id: Optional[str] = None


class DocumentListResponse(BaseModel):
    documents: List[DocumentResponse]
    total: int
    page: int
    per_page: int
    total_pages: int


class FileLockRequest(BaseModel):
    password: str = Field(..., min_length=6, max_length=128)


class FileUnlockRequest(BaseModel):
    password: str = Field(..., min_length=1)


class ProcessingHistoryResponse(BaseModel):
    jobs: list
    total: int
    page: int
    per_page: int
    total_pages: int
