import hashlib
import os
import uuid
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.models.document import Document
from app.core.exceptions import NotFoundError, ForbiddenError, ConflictError


class DocumentService:
    def __init__(self, db: Session):
        self.db = db

    def calculate_file_hash(self, file_content: bytes) -> str:
        return hashlib.sha256(file_content).hexdigest()

    def create_document(
        self,
        owner_id: str,
        filename: str,
        storage_path: str,
        file_size: int,
        file_hash: str,
        detected_mime_type: str,
        detected_file_type: str,
        folder_id: str = None,
    ) -> Document:
        doc = Document(
            owner_id=owner_id,
            folder_id=folder_id,
            original_filename=filename,
            storage_path=storage_path,
            file_size=file_size,
            file_hash=file_hash,
            detected_mime_type=detected_mime_type,
            detected_file_type=detected_file_type,
            processing_status="uploaded",
        )
        self.db.add(doc)
        self.db.commit()
        self.db.refresh(doc)
        return doc

    def get_document(self, document_id: str, user_id: str, user_role: str = "user") -> Document:
        doc = self.db.query(Document).filter(Document.id == document_id).first()
        if not doc:
            raise NotFoundError("Document")

        if str(doc.owner_id) != user_id and user_role != "admin":
            from app.models.share import Share
            share = self.db.query(Share).filter(
                Share.document_id == document_id,
                Share.shared_with == user_id,
            ).first()
            if not share:
                raise ForbiddenError("Access denied")

        return doc

    def list_documents(
        self,
        owner_id: str,
        folder_id: str = None,
        search: str = None,
        file_type: str = None,
        category: str = None,
        status: str = None,
        is_locked: bool = None,
        sort_by: str = "created_at",
        sort_order: str = "desc",
        page: int = 1,
        per_page: int = 20,
    ) -> dict:
        query = self.db.query(Document).filter(Document.owner_id == owner_id)

        if folder_id:
            query = query.filter(Document.folder_id == folder_id)
        elif folder_id == "root":
            query = query.filter(Document.folder_id.is_(None))

        if search:
            query = query.filter(Document.original_filename.ilike(f"%{search}%"))
        if file_type:
            query = query.filter(Document.detected_file_type == file_type)
        if category:
            query = query.filter(Document.category == category)
        if status:
            query = query.filter(Document.processing_status == status)
        if is_locked is not None:
            query = query.filter(Document.is_locked == is_locked)

        total = query.count()

        sort_column = getattr(Document, sort_by, Document.created_at)
        if sort_order == "desc":
            query = query.order_by(sort_column.desc())
        else:
            query = query.order_by(sort_column.asc())

        documents = query.offset((page - 1) * per_page).limit(per_page).all()

        return {
            "documents": documents,
            "total": total,
            "page": page,
            "per_page": per_page,
            "total_pages": max(1, (total + per_page - 1) // per_page),
        }

    def update_document(self, document_id: str, user_id: str, updates: dict) -> Document:
        doc = self.get_document(document_id, user_id)
        if str(doc.owner_id) != user_id:
            raise ForbiddenError("Only owner can modify document")

        for key, value in updates.items():
            if value is not None and hasattr(doc, key):
                setattr(doc, key, value)

        self.db.commit()
        self.db.refresh(doc)
        return doc

    def delete_document(self, document_id: str, user_id: str, user_role: str = "user") -> Document:
        doc = self.get_document(document_id, user_id, user_role)
        if str(doc.owner_id) != user_id and user_role != "admin":
            raise ForbiddenError("Only owner or admin can delete")

        self.db.delete(doc)
        self.db.commit()
        return doc

    def get_storage_usage(self, user_id: str) -> int:
        result = self.db.query(func.sum(Document.file_size)).filter(
            Document.owner_id == user_id
        ).scalar()
        return result or 0
