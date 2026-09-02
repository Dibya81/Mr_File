from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.core.dependencies import get_current_user_id
from app.services.sharing_service import SharingService

router = APIRouter()


@router.post("/documents/{document_id}/shares")
async def share_document(
    document_id: str,
    request: Request,
    user: dict = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    body = await request.json()
    username = body.get("username", "").strip()
    permission = body.get("permission", "view")

    if not username:
        from app.core.exceptions import ValidationError
        raise ValidationError("Username is required")

    if permission not in ("view", "download"):
        from app.core.exceptions import ValidationError
        raise ValidationError("Permission must be 'view' or 'download'")

    sharing_service = SharingService(db)
    share = sharing_service.share_document(document_id, user["sub"], username, permission)

    return {
        "success": True,
        "data": {
            "id": str(share.id),
            "document_id": str(share.document_id),
            "shared_with": str(share.shared_with),
            "permission": share.permission,
        },
        "message": f"File shared with {username}",
    }


@router.get("/shared-with-me")
async def shared_with_me(
    page: int = 1,
    per_page: int = 20,
    user: dict = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    sharing_service = SharingService(db)
    result = sharing_service.get_shared_with_me(user["sub"], page, per_page)

    shares = []
    for item in result["shares"]:
        share = item["share"]
        doc = item["document"]
        shares.append({
            "share_id": str(share.id),
            "permission": share.permission,
            "shared_by_username": item["shared_by_username"],
            "shared_with_username": item["shared_with_username"],
            "created_at": share.created_at.isoformat() if share.created_at else "",
            "document": {
                "id": str(doc.id) if doc else None,
                "original_filename": doc.original_filename if doc else "Deleted",
                "detected_file_type": doc.detected_file_type if doc else "",
                "file_size": doc.file_size if doc else 0,
                "is_locked": doc.is_locked if doc else False,
            } if doc else None,
        })

    return {
        "success": True,
        "data": {
            "shares": shares,
            "total": result["total"],
            "page": result["page"],
            "per_page": result["per_page"],
        },
    }


@router.get("/documents/{document_id}/shares")
async def get_document_shares(
    document_id: str,
    user: dict = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    sharing_service = SharingService(db)
    shares = sharing_service.get_shares_for_document(document_id, user["sub"])

    return {
        "success": True,
        "data": {"shares": shares},
    }


@router.delete("/documents/{document_id}/shares/{share_id}")
async def revoke_share(
    document_id: str,
    share_id: str,
    user: dict = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    sharing_service = SharingService(db)
    sharing_service.revoke_share(document_id, share_id, user["sub"])

    return {"success": True, "message": "Share revoked"}
