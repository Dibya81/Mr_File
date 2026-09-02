from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.models.report import CommunityReport
from app.core.exceptions import NotFoundError, ForbiddenError, ValidationError


class ReportService:
    def __init__(self, db: Session):
        self.db = db

    def create_report(
        self,
        reporter_id: str,
        reason: str,
        details: str = None,
        reported_user_id: str = None,
        reported_document_id: str = None,
    ) -> CommunityReport:
        if reason not in ("inappropriate", "copyright", "spam", "malware", "other"):
            raise ValidationError("Invalid reason")
        if not reported_user_id and not reported_document_id:
            raise ValidationError("Must report a user or a document")

        report = CommunityReport(
            reporter_id=reporter_id,
            reported_user_id=reported_user_id,
            reported_document_id=reported_document_id,
            reason=reason,
            details=(details or "").strip() or None,
            status="pending",
        )
        self.db.add(report)
        self.db.commit()
        self.db.refresh(report)
        return report

    def list_reports(self, status: str = None, page: int = 1, per_page: int = 20) -> dict:
        query = self.db.query(CommunityReport)
        if status:
            query = query.filter(CommunityReport.status == status)
        total = query.count()
        reports = query.order_by(CommunityReport.created_at.desc()).offset((page - 1) * per_page).limit(per_page).all()
        return {
            "reports": [
                {
                    "id": str(r.id),
                    "reporter_id": str(r.reporter_id),
                    "reported_user_id": str(r.reported_user_id) if r.reported_user_id else None,
                    "reported_document_id": str(r.reported_document_id) if r.reported_document_id else None,
                    "reason": r.reason,
                    "details": r.details,
                    "status": r.status,
                    "resolution": r.resolution,
                    "reviewed_by": str(r.reviewed_by) if r.reviewed_by else None,
                    "reviewed_at": r.reviewed_at.isoformat() if r.reviewed_at else None,
                    "created_at": r.created_at.isoformat() if r.created_at else "",
                }
                for r in reports
            ],
            "total": total,
            "page": page,
            "per_page": per_page,
        }

    def get_report(self, report_id: str) -> CommunityReport:
        report = self.db.query(CommunityReport).filter(CommunityReport.id == report_id).first()
        if not report:
            raise NotFoundError("Report")
        return report

    def review_report(self, report_id: str, admin_id: str, status: str, resolution: str = None) -> CommunityReport:
        if status not in ("reviewed", "actioned", "dismissed"):
            raise ValidationError("Invalid status")
        report = self.get_report(report_id)
        report.status = status
        report.resolution = (resolution or "").strip() or None
        report.reviewed_by = admin_id
        report.reviewed_at = datetime.now(timezone.utc)
        self.db.commit()
        self.db.refresh(report)
        return report
