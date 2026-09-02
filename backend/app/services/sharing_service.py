from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.share import Share
from app.models.document import Document
from app.models.user import User
from app.core.exceptions import NotFoundError, ForbiddenError, ConflictError


class SharingService:
    def __init__(self, db: Session):
        self.db = db

    def share_document(self, document_id: str, shared_by_id: str, username: str, permission: str = "view") -> Share:
        doc = self.db.query(Document).filter(Document.id == document_id).first()
        if not doc:
            raise NotFoundError("Document")
        if str(doc.owner_id) != shared_by_id:
            raise ForbiddenError("Only document owner can share")

        target_user = self.db.query(User).filter(
            func.lower(User.username) == username.lower()
        ).first()
        if not target_user:
            raise NotFoundError("User")
        if str(target_user.id) == shared_by_id:
            raise ForbiddenError("Cannot share with yourself")

        existing = self.db.query(Share).filter(
            Share.document_id == document_id,
            Share.shared_with == str(target_user.id),
        ).first()
        if existing:
            raise ConflictError("Already shared with this user")

        share = Share(
            document_id=document_id,
            shared_by=shared_by_id,
            shared_with=str(target_user.id),
            permission=permission,
        )
        self.db.add(share)
        self.db.commit()
        self.db.refresh(share)
        return share

    def get_shared_with_me(self, user_id: str, page: int = 1, per_page: int = 20) -> dict:
        query = self.db.query(Share).filter(Share.shared_with == user_id)
        total = query.count()
        shares = query.offset((page - 1) * per_page).limit(per_page).all()

        result = []
        for share in shares:
            doc = self.db.query(Document).filter(Document.id == share.document_id).first()
            shared_by_user = self.db.query(User).filter(User.id == share.shared_by).first()
            shared_with_user = self.db.query(User).filter(User.id == share.shared_with).first()
            result.append({
                "share": share,
                "document": doc,
                "shared_by_username": shared_by_user.username if shared_by_user else "unknown",
                "shared_with_username": shared_with_user.username if shared_with_user else "unknown",
            })

        return {
            "shares": result,
            "total": total,
            "page": page,
            "per_page": per_page,
        }

    def get_shares_for_document(self, document_id: str, user_id: str) -> list:
        doc = self.db.query(Document).filter(Document.id == document_id).first()
        if not doc:
            raise NotFoundError("Document")
        if str(doc.owner_id) != user_id:
            raise ForbiddenError("Only document owner can view shares")

        shares = self.db.query(Share).filter(Share.document_id == document_id).all()
        result = []
        for share in shares:
            shared_with_user = self.db.query(User).filter(User.id == share.shared_with).first()
            result.append({
                "id": str(share.id),
                "shared_with_username": shared_with_user.username if shared_with_user else "unknown",
                "permission": share.permission,
                "created_at": share.created_at.isoformat() if share.created_at else None,
            })
        return result

    def revoke_share(self, document_id: str, share_id: str, user_id: str) -> bool:
        doc = self.db.query(Document).filter(Document.id == document_id).first()
        if not doc:
            raise NotFoundError("Document")
        if str(doc.owner_id) != user_id:
            raise ForbiddenError("Only document owner can revoke shares")

        share = self.db.query(Share).filter(
            Share.id == share_id,
            Share.document_id == document_id,
        ).first()
        if not share:
            raise NotFoundError("Share")

        self.db.delete(share)
        self.db.commit()
        return True
