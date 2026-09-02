from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.core.dependencies import get_current_user_id
from app.core.exceptions import ValidationError
from app.services.community_service import CommunityService
from app.services.report_service import ReportService

router = APIRouter()


@router.get("/requests")
async def list_requests(
    status: str = "open",
    page: int = 1,
    per_page: int = 20,
    db: Session = Depends(get_db),
):
    service = CommunityService(db)
    return {
        "success": True,
        "data": service.list_requests(status=status, page=page, per_page=per_page),
    }


@router.post("/requests")
async def create_request(
    request: Request,
    user: dict = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    body = await request.json()
    service = CommunityService(db)
    req = service.create_request(
        requester_id=user["sub"],
        title=body.get("title", ""),
        description=body.get("description"),
        document_type=body.get("document_type"),
    )
    return {
        "success": True,
        "data": service.get_request(str(req.id)),
        "message": "Request created",
    }


@router.get("/requests/{request_id}")
async def get_request(
    request_id: str,
    db: Session = Depends(get_db),
):
    service = CommunityService(db)
    data = service.get_request(request_id)
    offers = service.list_offers_for_request(request_id)
    return {"success": True, "data": {**data, "offers": offers}}


@router.delete("/requests/{request_id}")
async def cancel_request(
    request_id: str,
    user: dict = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    service = CommunityService(db)
    req = service.cancel_request(request_id, user["sub"])
    return {
        "success": True,
        "data": {"id": str(req.id), "status": req.status},
        "message": "Request cancelled",
    }


@router.get("/my/requests")
async def my_requests(
    status: str = None,
    page: int = 1,
    per_page: int = 20,
    user: dict = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    service = CommunityService(db)
    return {
        "success": True,
        "data": service.list_requests(status=status, page=page, per_page=per_page, requester_id=user["sub"]),
    }


@router.post("/requests/{request_id}/offers")
async def create_offer(
    request_id: str,
    request: Request,
    user: dict = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    body = await request.json()
    document_id = body.get("document_id")
    if not document_id:
        raise ValidationError("document_id is required")
    service = CommunityService(db)
    offer = service.create_offer(
        request_id=request_id,
        offerer_id=user["sub"],
        document_id=document_id,
        message=body.get("message"),
    )
    return {
        "success": True,
        "data": {
            "id": str(offer.id),
            "request_id": str(offer.request_id),
            "document_id": str(offer.document_id),
            "status": offer.status,
        },
        "message": "Offer created",
    }


@router.get("/requests/{request_id}/offers")
async def list_offers_for_request(
    request_id: str,
    db: Session = Depends(get_db),
):
    service = CommunityService(db)
    return {"success": True, "data": {"offers": service.list_offers_for_request(request_id)}}


@router.get("/my/offers")
async def my_offers(
    user: dict = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    service = CommunityService(db)
    return {"success": True, "data": {"offers": service.list_offers_for_user(user["sub"])}}


@router.post("/offers/{offer_id}/accept")
async def accept_offer(
    offer_id: str,
    user: dict = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    service = CommunityService(db)
    transfer = service.accept_offer(offer_id, user["sub"])
    return {
        "success": True,
        "data": {
            "id": str(transfer.id),
            "offer_id": str(transfer.offer_id),
            "status": transfer.status,
        },
        "message": "Offer accepted",
    }


@router.post("/offers/{offer_id}/decline")
async def decline_offer(
    offer_id: str,
    user: dict = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    service = CommunityService(db)
    offer = service.decline_offer(offer_id, user["sub"])
    return {
        "success": True,
        "data": {"id": str(offer.id), "status": offer.status},
        "message": "Offer declined",
    }


@router.delete("/offers/{offer_id}")
async def withdraw_offer(
    offer_id: str,
    user: dict = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    service = CommunityService(db)
    offer = service.withdraw_offer(offer_id, user["sub"])
    return {
        "success": True,
        "data": {"id": str(offer.id), "status": offer.status},
        "message": "Offer withdrawn",
    }


@router.get("/transfers")
async def list_transfers(
    page: int = 1,
    per_page: int = 20,
    user: dict = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    service = CommunityService(db)
    return {
        "success": True,
        "data": service.list_transfers(user["sub"], page=page, per_page=per_page),
    }


@router.post("/transfers/{transfer_id}/receive")
async def receive_transfer(
    transfer_id: str,
    user: dict = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    service = CommunityService(db)
    new_doc = service.mark_received(transfer_id, user["sub"])
    return {
        "success": True,
        "data": {
            "id": str(new_doc.id),
            "original_filename": new_doc.original_filename,
            "folder_id": str(new_doc.folder_id) if new_doc.folder_id else None,
        },
        "message": "Document saved to your Community Received folder",
    }


@router.post("/transfers/{transfer_id}/decline")
async def decline_transfer(
    transfer_id: str,
    user: dict = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    service = CommunityService(db)
    transfer = service.decline_transfer(transfer_id, user["sub"])
    return {
        "success": True,
        "data": {"id": str(transfer.id), "status": transfer.status},
        "message": "Transfer declined",
    }


@router.post("/save-to-workspace/{document_id}")
async def save_public_to_workspace(
    document_id: str,
    user: dict = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Copy a public document directly into the user's Community Received folder."""
    service = CommunityService(db)
    new_doc = service.save_to_workspace(document_id, user["sub"])
    return {
        "success": True,
        "data": {
            "id": str(new_doc.id),
            "original_filename": new_doc.original_filename,
            "folder_id": str(new_doc.folder_id) if new_doc.folder_id else None,
        },
        "message": "Document saved to Community Received folder",
    }


@router.post("/reports")
async def create_report(
    request: Request,
    user: dict = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    body = await request.json()
    service = ReportService(db)
    report = service.create_report(
        reporter_id=user["sub"],
        reason=body.get("reason", "other"),
        details=body.get("details"),
        reported_user_id=body.get("reported_user_id"),
        reported_document_id=body.get("reported_document_id"),
    )
    return {
        "success": True,
        "data": {"id": str(report.id), "status": report.status},
        "message": "Report submitted",
    }
