from pydantic import BaseModel
from typing import Optional, List


class ProcessingJobResponse(BaseModel):
    id: str
    document_id: str
    user_id: str
    job_type: str
    status: str
    detected_type: Optional[str]
    category: Optional[str]
    metadata: dict
    error_message: Optional[str]
    started_at: Optional[str]
    completed_at: Optional[str]
    created_at: str


class AdminStats(BaseModel):
    total_users: int
    total_documents: int
    total_storage_bytes: int
    total_processing_jobs: int
    completed_jobs: int
    failed_jobs: int
    recent_uploads: int
