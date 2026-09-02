import uuid
from datetime import datetime, timezone
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.models.community_request import CommunityRequest
from app.models.community_offer import CommunityOffer
from app.models.community_transfer import CommunityTransfer
from app.models.document import Document
from app.models.folder import Folder
from app.models.user import User
from app.services.file_service import file_service
from app.core.exceptions import NotFoundError, ForbiddenError, ValidationError, ConflictError


class CommunityService:
    def __init__(self, db: Session):
        self.db = db

    def create_request(self, requester_id: str, title: str, description: str = None, document_type: str = None) -> CommunityRequest:
        title = (title or "").strip()
        if not title:
            raise ValidationError("Title is required")
        if len(title) > 500:
            raise ValidationError("Title too long")

        request = CommunityRequest(
            requester_id=requester_id,
            title=title,
            description=(description or "").strip() or None,
            document_type=(document_type or "").strip() or None,
            status="open",
        )
        self.db.add(request)
        self.db.commit()
        self.db.refresh(request)
        return request

    def list_requests(self, status: str = "open", page: int = 1, per_page: int = 20, requester_id: str = None) -> dict:
        query = self.db.query(CommunityRequest)
        if status:
            query = query.filter(CommunityRequest.status == status)
        if requester_id:
            query = query.filter(CommunityRequest.requester_id == requester_id)

        total = query.count()
        requests = query.order_by(CommunityRequest.created_at.desc()).offset((page - 1) * per_page).limit(per_page).all()
        requester_ids = list({str(r.requester_id) for r in requests})
        users = {}
        if requester_ids:
            for u in self.db.query(User).filter(User.id.in_(requester_ids)).all():
                users[str(u.id)] = u

        return {
            "requests": [
                {
                    "id": str(r.id),
                    "requester_id": str(r.requester_id),
                    "requester_username": users[str(r.requester_id)].username if str(r.requester_id) in users else "unknown",
                    "requester_name": users[str(r.requester_id)].name if str(r.requester_id) in users else "",
                    "title": r.title,
                    "description": r.description,
                    "document_type": r.document_type,
                    "status": r.status,
                    "offer_count": self.db.query(func.count(CommunityOffer.id)).filter(
                        CommunityOffer.request_id == r.id,
                    ).scalar() or 0,
                    "created_at": r.created_at.isoformat() if r.created_at else "",
                }
                for r in requests
            ],
            "total": total,
            "page": page,
            "per_page": per_page,
        }

    def get_request(self, request_id: str) -> dict:
        req = self.db.query(CommunityRequest).filter(CommunityRequest.id == request_id).first()
        if not req:
            raise NotFoundError("Request")
        requester = self.db.query(User).filter(User.id == req.requester_id).first()
        return {
            "id": str(req.id),
            "requester_id": str(req.requester_id),
            "requester_username": requester.username if requester else "unknown",
            "title": req.title,
            "description": req.description,
            "document_type": req.document_type,
            "status": req.status,
            "created_at": req.created_at.isoformat() if req.created_at else "",
        }

    def cancel_request(self, request_id: str, user_id: str) -> CommunityRequest:
        req = self.db.query(CommunityRequest).filter(CommunityRequest.id == request_id).first()
        if not req:
            raise NotFoundError("Request")
        if str(req.requester_id) != user_id:
            raise ForbiddenError("Only requester can cancel")
        if req.status != "open":
            raise ValidationError("Only open requests can be cancelled")
        req.status = "cancelled"
        self.db.commit()
        self.db.refresh(req)
        return req

    def create_offer(self, request_id: str, offerer_id: str, document_id: str, message: str = None) -> CommunityOffer:
        req = self.db.query(CommunityRequest).filter(CommunityRequest.id == request_id).first()
        if not req:
            raise NotFoundError("Request")
        if req.status != "open":
            raise ValidationError("Request is no longer open")

        doc = self.db.query(Document).filter(Document.id == document_id).first()
        if not doc:
            raise NotFoundError("Document")
        if str(doc.owner_id) != offerer_id:
            raise ForbiddenError("You do not own this document")
        if doc.visibility != "public":
            raise ValidationError("Document must be public to be offered")

        existing = self.db.query(CommunityOffer).filter(
            CommunityOffer.request_id == request_id,
            CommunityOffer.document_id == document_id,
        ).first()
        if existing:
            raise ConflictError("You have already offered this document for this request")

        offer = CommunityOffer(
            request_id=request_id,
            offerer_id=offerer_id,
            document_id=document_id,
            message=(message or "").strip() or None,
            status="pending",
        )
        self.db.add(offer)
        self.db.commit()
        self.db.refresh(offer)
        return offer

    def list_offers_for_request(self, request_id: str) -> list:
        req = self.db.query(CommunityRequest).filter(CommunityRequest.id == request_id).first()
        if not req:
            raise NotFoundError("Request")
        offers = self.db.query(CommunityOffer).filter(
            CommunityOffer.request_id == request_id,
        ).order_by(CommunityOffer.created_at.desc()).all()
        offerer_ids = list({str(o.offerer_id) for o in offers})
        users = {}
        if offerer_ids:
            for u in self.db.query(User).filter(User.id.in_(offerer_ids)).all():
                users[str(u.id)] = u
        return [
            {
                "id": str(o.id),
                "request_id": str(o.request_id),
                "offerer_id": str(o.offerer_id),
                "offerer_username": users[str(o.offerer_id)].username if str(o.offerer_id) in users else "unknown",
                "document_id": str(o.document_id),
                "document_filename": self.db.query(Document.original_filename).filter(Document.id == o.document_id).scalar() or "",
                "message": o.message,
                "status": o.status,
                "created_at": o.created_at.isoformat() if o.created_at else "",
            }
            for o in offers
        ]

    def list_offers_for_user(self, user_id: str) -> list:
        offers = self.db.query(CommunityOffer).filter(
            CommunityOffer.offerer_id == user_id,
        ).order_by(CommunityOffer.created_at.desc()).all()
        return [
            {
                "id": str(o.id),
                "request_id": str(o.request_id),
                "request_title": self.db.query(CommunityRequest.title).filter(CommunityRequest.id == o.request_id).scalar() or "",
                "document_id": str(o.document_id),
                "document_filename": self.db.query(Document.original_filename).filter(Document.id == o.document_id).scalar() or "",
                "message": o.message,
                "status": o.status,
                "created_at": o.created_at.isoformat() if o.created_at else "",
            }
            for o in offers
        ]

    def accept_offer(self, offer_id: str, acceptor_id: str) -> CommunityTransfer:
        offer = self.db.query(CommunityOffer).filter(CommunityOffer.id == offer_id).first()
        if not offer:
            raise NotFoundError("Offer")
        req = self.db.query(CommunityRequest).filter(CommunityRequest.id == offer.request_id).first()
        if not req:
            raise NotFoundError("Request")
        if str(req.requester_id) != acceptor_id:
            raise ForbiddenError("Only requester can accept offers")
        if offer.status != "pending":
            raise ValidationError("Offer is no longer pending")

        offer.status = "accepted"
        transfer = CommunityTransfer(
            offer_id=offer.id,
            original_document_id=offer.document_id,
            requester_id=req.requester_id,
            offerer_id=offer.offerer_id,
            status="pending",
        )
        self.db.add(transfer)
        self.db.commit()
        self.db.refresh(transfer)
        return transfer

    def decline_offer(self, offer_id: str, user_id: str) -> CommunityOffer:
        offer = self.db.query(CommunityOffer).filter(CommunityOffer.id == offer_id).first()
        if not offer:
            raise NotFoundError("Offer")
        req = self.db.query(CommunityRequest).filter(CommunityRequest.id == offer.request_id).first()
        if not req:
            raise NotFoundError("Request")
        if str(req.requester_id) != user_id and str(offer.offerer_id) != user_id:
            raise ForbiddenError("Only requester or offerer can decline")
        if offer.status != "pending":
            raise ValidationError("Offer is no longer pending")
        offer.status = "declined"
        self.db.commit()
        self.db.refresh(offer)
        return offer

    def withdraw_offer(self, offer_id: str, offerer_id: str) -> CommunityOffer:
        offer = self.db.query(CommunityOffer).filter(CommunityOffer.id == offer_id).first()
        if not offer:
            raise NotFoundError("Offer")
        if str(offer.offerer_id) != offerer_id:
            raise ForbiddenError("Only offerer can withdraw")
        if offer.status != "pending":
            raise ValidationError("Offer is no longer pending")
        offer.status = "withdrawn"
        self.db.commit()
        self.db.refresh(offer)
        return offer

    def list_transfers(self, user_id: str, page: int = 1, per_page: int = 20) -> dict:
        query = self.db.query(CommunityTransfer).filter(
            (CommunityTransfer.requester_id == user_id) | (CommunityTransfer.offerer_id == user_id)
        )
        total = query.count()
        transfers = query.order_by(CommunityTransfer.created_at.desc()).offset((page - 1) * per_page).limit(per_page).all()
        return {
            "transfers": [
                {
                    "id": str(t.id),
                    "offer_id": str(t.offer_id),
                    "original_document_id": str(t.original_document_id) if t.original_document_id else None,
                    "transferred_document_id": str(t.transferred_document_id) if t.transferred_document_id else None,
                    "requester_id": str(t.requester_id),
                    "offerer_id": str(t.offerer_id),
                    "status": t.status,
                    "created_at": t.created_at.isoformat() if t.created_at else "",
                }
                for t in transfers
            ],
            "total": total,
            "page": page,
            "per_page": per_page,
        }

    def get_transfer(self, transfer_id: str, user_id: str) -> CommunityTransfer:
        transfer = self.db.query(CommunityTransfer).filter(CommunityTransfer.id == transfer_id).first()
        if not transfer:
            raise NotFoundError("Transfer")
        if str(transfer.requester_id) != user_id and str(transfer.offerer_id) != user_id:
            raise ForbiddenError("Not your transfer")
        return transfer

    def mark_received(self, transfer_id: str, user_id: str) -> Document:
        transfer = self.get_transfer(transfer_id, user_id)
        if str(transfer.requester_id) != user_id:
            raise ForbiddenError("Only requester can mark received")
        if transfer.status != "pending":
            raise ValidationError("Transfer is no longer pending")
        if not transfer.original_document_id:
            raise ValidationError("Original document not found")

        new_doc = self._copy_document(str(transfer.original_document_id), user_id)
        transfer.transferred_document_id = new_doc.id
        transfer.status = "received"

        req = self.db.query(CommunityRequest).filter(CommunityRequest.id == transfer.offer_id).first()
        if not req:
            raise NotFoundError("Request")
        offers_count_pending = self.db.query(CommunityOffer).filter(
            CommunityOffer.request_id == req.id,
            CommunityOffer.status == "pending",
        ).count()
        if offers_count_pending == 0:
            req.status = "filled"

        self.db.commit()
        self.db.refresh(new_doc)
        return new_doc

    def decline_transfer(self, transfer_id: str, user_id: str) -> CommunityTransfer:
        transfer = self.get_transfer(transfer_id, user_id)
        if str(transfer.requester_id) != user_id:
            raise ForbiddenError("Only requester can decline")
        if transfer.status != "pending":
            raise ValidationError("Transfer is no longer pending")
        transfer.status = "declined"
        self.db.commit()
        self.db.refresh(transfer)
        return transfer

    def save_to_workspace(self, document_id: str, user_id: str) -> Document:
        doc = self.db.query(Document).filter(
            Document.id == document_id,
            Document.visibility == "public",
        ).first()
        if not doc:
            raise NotFoundError("Public document")
        if str(doc.owner_id) == user_id:
            raise ValidationError("You already own this document")

        new_doc = self._copy_document(document_id, user_id)
        self.db.commit()
        self.db.refresh(new_doc)
        return new_doc

    def _copy_document(self, source_id: str, new_owner_id: str) -> Document:
        source = self.db.query(Document).filter(Document.id == source_id).first()
        if not source:
            raise NotFoundError("Source document")

        target_folder = self._get_or_create_community_folder(new_owner_id)
        new_id = str(uuid.uuid4())
        try:
            file_content = file_service.download_file(source.storage_path)
        except Exception as e:
            raise ValidationError(f"Could not read source file: {e}")

        new_storage_path = file_service.upload_file(
            user_id=new_owner_id,
            document_id=new_id,
            file_content=file_content,
            filename=source.original_filename,
        )

        new_doc = Document(
            id=new_id,
            owner_id=new_owner_id,
            folder_id=target_folder.id if target_folder else None,
            original_filename=source.original_filename,
            storage_path=new_storage_path,
            file_size=source.file_size,
            file_hash=source.file_hash,
            detected_mime_type=source.detected_mime_type,
            detected_file_type=source.detected_file_type,
            category=source.category,
            title=source.title,
            author=source.author,
            file_metadata={
                **(source.file_metadata or {}),
                "source": "community",
                "original_document_id": str(source.id),
            },
            is_locked=False,
            password_hash=None,
            visibility="private",
            processing_status="uploaded",
        )
        self.db.add(new_doc)
        return new_doc

    def _get_or_create_community_folder(self, user_id: str) -> Folder:
        folder = self.db.query(Folder).filter(
            Folder.owner_id == user_id,
            Folder.parent_folder_id.is_(None),
            Folder.name == "Community Received",
        ).first()
        if folder:
            return folder
        folder = Folder(
            owner_id=user_id,
            parent_folder_id=None,
            name="Community Received",
        )
        self.db.add(folder)
        self.db.flush()
        return folder
