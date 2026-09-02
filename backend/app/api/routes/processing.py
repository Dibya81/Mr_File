from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.core.dependencies import get_current_user_id
from app.services.processing_service import ProcessingService
from app.models.processing_job import ProcessingJob

router = APIRouter()


@router.get("/history")
async def get_processing_history(
    page: int = 1,
    per_page: int = 20,
    user: dict = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    proc_service = ProcessingService(db)
    result = proc_service.get_history(user["sub"], page, per_page)

    jobs = []
    for job in result["jobs"]:
        jobs.append({
            "id": str(job.id),
            "document_id": str(job.document_id),
            "user_id": str(job.user_id),
            "job_type": job.job_type,
            "status": job.status,
            "detected_type": job.detected_type,
            "category": job.category,
            "metadata": job.metadata or {},
            "error_message": job.error_message,
            "started_at": job.started_at.isoformat() if job.started_at else None,
            "completed_at": job.completed_at.isoformat() if job.completed_at else None,
            "created_at": job.created_at.isoformat() if job.created_at else "",
        })

    return {
        "success": True,
        "data": {
            "jobs": jobs,
            "total": result["total"],
            "page": result["page"],
            "per_page": result["per_page"],
            "total_pages": result["total_pages"],
        },
    }
