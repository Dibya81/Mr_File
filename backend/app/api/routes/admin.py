from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from sqlalchemy import func, text
from app.database.connection import get_db
from app.core.dependencies import require_admin
from app.models.user import User
from app.models.document import Document
from app.models.processing_job import ProcessingJob
from app.models.share import Share
from app.models.activity import ActivityEvent, SecurityEvent
from app.core.config import settings

router = APIRouter()


@router.get("/stats")
async def get_admin_stats(
    user: dict = Depends(require_admin),
    db: Session = Depends(get_db),
):
    total_users = db.query(func.count(User.id)).scalar() or 0
    total_documents = db.query(func.count(Document.id)).scalar() or 0
    total_storage = db.query(func.sum(Document.file_size)).scalar() or 0
    total_jobs = db.query(func.count(ProcessingJob.id)).scalar() or 0
    completed_jobs = db.query(func.count(ProcessingJob.id)).filter(
        ProcessingJob.status == "completed"
    ).scalar() or 0
    failed_jobs = db.query(func.count(ProcessingJob.id)).filter(
        ProcessingJob.status == "failed"
    ).scalar() or 0
    recent_uploads = db.query(func.count(Document.id)).filter(
        Document.created_at >= func.now() - text("INTERVAL '7 days'")
    ).scalar() or 0

    return {
        "success": True,
        "data": {
            "total_users": total_users,
            "total_documents": total_documents,
            "total_storage_bytes": total_storage,
            "total_processing_jobs": total_jobs,
            "completed_jobs": completed_jobs,
            "failed_jobs": failed_jobs,
            "recent_uploads": recent_uploads,
        },
    }


@router.get("/users")
async def list_users(
    page: int = 1,
    per_page: int = 20,
    user: dict = Depends(require_admin),
    db: Session = Depends(get_db),
):
    query = db.query(User)
    total = query.count()
    users = query.offset((page - 1) * per_page).limit(per_page).all()

    return {
        "success": True,
        "data": {
            "users": [
                {
                    "id": str(u.id),
                    "username": u.username,
                    "name": u.name,
                    "email": u.email,
                    "role": u.role,
                    "created_at": u.created_at.isoformat() if u.created_at else "",
                }
                for u in users
            ],
            "total": total,
            "page": page,
            "per_page": per_page,
        },
    }


@router.get("/documents")
async def list_all_documents(
    page: int = 1,
    per_page: int = 20,
    user: dict = Depends(require_admin),
    db: Session = Depends(get_db),
):
    query = db.query(Document)
    total = query.count()
    docs = query.order_by(Document.created_at.desc()).offset(
        (page - 1) * per_page
    ).limit(per_page).all()

    return {
        "success": True,
        "data": {
            "documents": [
                {
                    "id": str(d.id),
                    "owner_id": str(d.owner_id),
                    "original_filename": d.original_filename,
                    "file_size": d.file_size,
                    "detected_file_type": d.detected_file_type,
                    "detected_mime_type": d.detected_mime_type,
                    "category": d.category,
                    "processing_status": d.processing_status,
                    "is_locked": d.is_locked,
                    "created_at": d.created_at.isoformat() if d.created_at else "",
                }
                for d in docs
            ],
            "total": total,
            "page": page,
            "per_page": per_page,
        },
    }


@router.get("/processing")
async def list_all_processing_jobs(
    page: int = 1,
    per_page: int = 20,
    status: str = None,
    user: dict = Depends(require_admin),
    db: Session = Depends(get_db),
):
    query = db.query(ProcessingJob)
    if status:
        query = query.filter(ProcessingJob.status == status)
    total = query.count()
    jobs = query.order_by(ProcessingJob.created_at.desc()).offset(
        (page - 1) * per_page
    ).limit(per_page).all()

    return {
        "success": True,
        "data": {
            "jobs": [
                {
                    "id": str(j.id),
                    "document_id": str(j.document_id),
                    "user_id": str(j.user_id),
                    "job_type": j.job_type,
                    "status": j.status,
                    "detected_type": j.detected_type,
                    "category": j.category,
                    "error_message": j.error_message,
                    "started_at": j.started_at.isoformat() if j.started_at else None,
                    "completed_at": j.completed_at.isoformat() if j.completed_at else None,
                    "created_at": j.created_at.isoformat() if j.created_at else "",
                }
                for j in jobs
            ],
            "total": total,
            "page": page,
            "per_page": per_page,
        },
    }


@router.get("/reports")
async def list_reports(
    status: str = None,
    page: int = 1,
    per_page: int = 20,
    user: dict = Depends(require_admin),
    db: Session = Depends(get_db),
):
    from app.services.report_service import ReportService
    service = ReportService(db)
    return {"success": True, "data": service.list_reports(status=status, page=page, per_page=per_page)}


@router.get("/reports/{report_id}")
async def get_report(
    report_id: str,
    user: dict = Depends(require_admin),
    db: Session = Depends(get_db),
):
    from app.services.report_service import ReportService
    service = ReportService(db)
    report = service.get_report(report_id)
    return {
        "success": True,
        "data": {
            "id": str(report.id),
            "reporter_id": str(report.reporter_id),
            "reported_user_id": str(report.reported_user_id) if report.reported_user_id else None,
            "reported_document_id": str(report.reported_document_id) if report.reported_document_id else None,
            "reason": report.reason,
            "details": report.details,
            "status": report.status,
            "resolution": report.resolution,
            "reviewed_by": str(report.reviewed_by) if report.reviewed_by else None,
            "reviewed_at": report.reviewed_at.isoformat() if report.reviewed_at else None,
            "created_at": report.created_at.isoformat() if report.created_at else "",
        },
    }


@router.patch("/reports/{report_id}")
async def review_report(
    report_id: str,
    request: Request,
    user: dict = Depends(require_admin),
    db: Session = Depends(get_db),
):
    from app.services.report_service import ReportService
    body = await request.json()
    service = ReportService(db)
    report = service.review_report(
        report_id=report_id,
        admin_id=user["sub"],
        status=body.get("status", "reviewed"),
        resolution=body.get("resolution"),
    )
    return {
        "success": True,
        "data": {
            "id": str(report.id),
            "status": report.status,
            "resolution": report.resolution,
            "reviewed_by": str(report.reviewed_by),
            "reviewed_at": report.reviewed_at.isoformat() if report.reviewed_at else None,
        },
        "message": "Report reviewed",
    }


@router.get("/sharing")
async def list_all_shares(
    page: int = 1,
    per_page: int = 20,
    search: str = None,
    status: str = None,
    user: dict = Depends(require_admin),
    db: Session = Depends(get_db),
):
    query = db.query(Share).join(Document, Share.document_id == Document.id)
    if search:
        like = f"%{search}%"
        query = query.filter(Document.original_filename.ilike(like))
    total = query.count()
    shares = query.order_by(Share.created_at.desc()).offset(
        (page - 1) * per_page
    ).limit(per_page).all()

    user_ids = {s.shared_by for s in shares} | {s.shared_with for s in shares}
    users = {u.id: u for u in db.query(User).filter(User.id.in_(user_ids)).all()} if user_ids else {}
    doc_ids = {s.document_id for s in shares}
    docs = {d.id: d for d in db.query(Document).filter(Document.id.in_(doc_ids)).all()} if doc_ids else {}

    items = []
    for s in shares:
        d = docs.get(s.document_id)
        items.append({
            "id": str(s.id),
            "document_id": str(s.document_id),
            "document_filename": d.original_filename if d else "(deleted)",
            "shared_by_id": str(s.shared_by),
            "shared_by_username": users[s.shared_by].username if s.shared_by in users else None,
            "shared_with_id": str(s.shared_with),
            "shared_with_username": users[s.shared_with].username if s.shared_with in users else None,
            "permission": s.permission,
            "status": "active",
            "created_at": s.created_at.isoformat() if s.created_at else "",
        })

    return {
        "success": True,
        "data": {
            "shares": items,
            "items": items,
            "total": total,
            "page": page,
            "per_page": per_page,
        },
    }


@router.get("/storage")
async def get_storage_stats(
    user: dict = Depends(require_admin),
    db: Session = Depends(get_db),
):
    total_bytes = db.query(func.coalesce(func.sum(Document.file_size), 0)).scalar() or 0
    file_count = db.query(func.count(Document.id)).scalar() or 0
    avg_size = int(total_bytes / file_count) if file_count else 0

    # by_type
    by_type_rows = db.query(
        Document.detected_file_type,
        func.coalesce(func.sum(Document.file_size), 0),
        func.count(Document.id),
    ).group_by(Document.detected_file_type).all()
    by_type = [
        {"type": t or "unknown", "bytes": int(b), "count": c}
        for t, b, c in by_type_rows
    ]

    # by_user
    by_user_rows = db.query(
        User.id, User.username,
        func.coalesce(func.sum(Document.file_size), 0),
        func.count(Document.id),
    ).join(Document, Document.owner_id == User.id).group_by(User.id, User.username).order_by(
        func.sum(Document.file_size).desc()
    ).limit(10).all()
    by_user = [
        {"user_id": str(uid), "username": uname, "bytes": int(b), "count": c}
        for uid, uname, b, c in by_user_rows
    ]

    # largest files
    largest = db.query(Document).order_by(Document.file_size.desc()).limit(10).all()
    owner_ids = {d.owner_id for d in largest}
    owner_map = {u.id: u for u in db.query(User).filter(User.id.in_(owner_ids)).all()} if owner_ids else {}
    largest_files = [
        {
            "id": str(d.id),
            "original_filename": d.original_filename,
            "file_size": d.file_size,
            "detected_file_type": d.detected_file_type,
            "owner_username": owner_map[d.owner_id].username if d.owner_id in owner_map else None,
            "created_at": d.created_at.isoformat() if d.created_at else "",
        }
        for d in largest
    ]

    return {
        "success": True,
        "data": {
            "total_bytes": int(total_bytes),
            "used_bytes": int(total_bytes),
            "file_count": file_count,
            "average_file_size": avg_size,
            "by_type": by_type,
            "by_user": by_user,
            "largest_files": largest_files,
        },
    }


@router.get("/security")
async def list_security_events(
    page: int = 1,
    per_page: int = 20,
    user: dict = Depends(require_admin),
    db: Session = Depends(get_db),
):
    query = db.query(SecurityEvent)
    total = query.count()
    events = query.order_by(SecurityEvent.created_at.desc()).offset(
        (page - 1) * per_page
    ).limit(per_page).all()
    return {
        "success": True,
        "data": {
            "events": [
                {
                    "id": str(e.id),
                    "event_type": e.event_type,
                    "user_id": str(e.user_id) if e.user_id else None,
                    "username": e.username,
                    "ip_address": e.ip_address,
                    "detail": e.detail,
                    "severity": e.severity,
                    "created_at": e.created_at.isoformat() if e.created_at else "",
                }
                for e in events
            ],
            "items": [],
            "total": total,
            "page": page,
            "per_page": per_page,
        },
    }


@router.get("/activity")
async def list_activity(
    page: int = 1,
    per_page: int = 20,
    user: dict = Depends(require_admin),
    db: Session = Depends(get_db),
):
    query = db.query(ActivityEvent)
    total = query.count()
    events = query.order_by(ActivityEvent.created_at.desc()).offset(
        (page - 1) * per_page
    ).limit(per_page).all()
    return {
        "success": True,
        "data": {
            "activity": [
                {
                    "id": str(e.id),
                    "actor_id": str(e.actor_id) if e.actor_id else None,
                    "actor_username": e.actor_username,
                    "action": e.action,
                    "object_type": e.object_type,
                    "object_id": e.object_id,
                    "object_label": e.object_label,
                    "detail": e.detail,
                    "created_at": e.created_at.isoformat() if e.created_at else "",
                }
                for e in events
            ],
            "total": total,
            "page": page,
            "per_page": per_page,
        },
    }


@router.get("/system-health")
async def get_system_health(
    user: dict = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Lightweight health check across subsystems."""
    from app.core.config import settings as app_settings
    health = {
        "api": "operational",
        "database": "operational",
        "storage": "operational",
        "processing": "operational",
        "authentication": "operational",
    }
    # Database check
    try:
        db.execute(text("SELECT 1"))
    except Exception:
        health["database"] = "unavailable"
    # Storage check (Supabase)
    try:
        from app.services.file_service import file_service
        file_service.client.storage.from_(app_settings.STORAGE_BUCKET).get_bucket()
    except Exception:
        health["storage"] = "degraded"
    return {"success": True, "data": health}
