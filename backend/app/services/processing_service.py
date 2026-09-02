from datetime import datetime, timezone
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.processing_job import ProcessingJob
from app.models.document import Document
from app.core.exceptions import NotFoundError


class ProcessingService:
    def __init__(self, db: Session):
        self.db = db

    def create_job(self, document_id: str, user_id: str, job_type: str = "extract") -> ProcessingJob:
        job = ProcessingJob(
            document_id=document_id,
            user_id=user_id,
            job_type=job_type,
            status="queued",
        )
        self.db.add(job)
        self.db.commit()
        self.db.refresh(job)
        return job

    def start_job(self, job_id: str) -> ProcessingJob:
        job = self.db.query(ProcessingJob).filter(ProcessingJob.id == job_id).first()
        if not job:
            raise NotFoundError("Processing job")
        job.status = "processing"
        job.started_at = datetime.now(timezone.utc)
        self.db.commit()
        self.db.refresh(job)
        return job

    def complete_job(
        self,
        job_id: str,
        detected_type: str = None,
        category: str = None,
        metadata: dict = None,
    ) -> ProcessingJob:
        job = self.db.query(ProcessingJob).filter(ProcessingJob.id == job_id).first()
        if not job:
            raise NotFoundError("Processing job")
        job.status = "completed"
        job.detected_type = detected_type
        job.category = category
        job.metadata = metadata or {}
        job.completed_at = datetime.now(timezone.utc)
        self.db.commit()
        self.db.refresh(job)
        return job

    def fail_job(self, job_id: str, error_message: str) -> ProcessingJob:
        job = self.db.query(ProcessingJob).filter(ProcessingJob.id == job_id).first()
        if not job:
            raise NotFoundError("Processing job")
        job.status = "failed"
        job.error_message = error_message
        job.completed_at = datetime.now(timezone.utc)
        self.db.commit()
        self.db.refresh(job)
        return job

    def get_history(self, user_id: str, page: int = 1, per_page: int = 20) -> dict:
        query = self.db.query(ProcessingJob).filter(ProcessingJob.user_id == user_id)
        total = query.count()
        jobs = query.order_by(ProcessingJob.created_at.desc()).offset(
            (page - 1) * per_page
        ).limit(per_page).all()

        return {
            "jobs": jobs,
            "total": total,
            "page": page,
            "per_page": per_page,
            "total_pages": max(1, (total + per_page - 1) // per_page),
        }

    def get_stats(self) -> dict:
        total = self.db.query(func.count(ProcessingJob.id)).scalar() or 0
        completed = self.db.query(func.count(ProcessingJob.id)).filter(
            ProcessingJob.status == "completed"
        ).scalar() or 0
        failed = self.db.query(func.count(ProcessingJob.id)).filter(
            ProcessingJob.status == "failed"
        ).scalar() or 0
        return {"total": total, "completed": completed, "failed": failed}
