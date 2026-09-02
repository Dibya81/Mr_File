import os
import uuid
import logging
import tempfile
from sqlalchemy import func
from fastapi import APIRouter, UploadFile, File, Depends, BackgroundTasks, Request
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.core.dependencies import get_current_user_id
from app.core.security import hash_password, verify_password
from app.core.exceptions import ValidationError, NotFoundError, ForbiddenError
from app.services.document_service import DocumentService
from app.services.file_service import file_service
from app.services.processing_service import ProcessingService
from app.workers.processor_worker import process_document
from app.processors.detector import file_detector
from app.core.config import settings

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/upload")
async def upload_document(
    request: Request,
    file: UploadFile = File(...),
    folder_id: str = None,
    background_tasks: BackgroundTasks = None,
    user: dict = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    if not file or not file.filename:
        raise ValidationError("No file provided")

    content = await file.read()
    if len(content) == 0:
        raise ValidationError("Empty file")
    if len(content) > settings.MAX_FILE_SIZE:
        raise ValidationError(f"File too large. Maximum size: {settings.MAX_FILE_SIZE // (1024*1024)}MB")

    # Per-user total storage cap (1GB)
    from app.models.document import Document as DocumentModel
    used = db.query(func.coalesce(func.sum(DocumentModel.file_size), 0)).filter(
        DocumentModel.owner_id == user["sub"]
    ).scalar() or 0
    if int(used) + len(content) > settings.MAX_TOTAL_STORAGE:
        free = settings.MAX_TOTAL_STORAGE - int(used)
        raise ValidationError(
            f"Storage limit reached. You have {free // (1024*1024)}MB remaining out of {settings.MAX_TOTAL_STORAGE // (1024*1024*1024)}GB total."
        )

    ext = os.path.splitext(file.filename)[1].lower()
    if settings.ALLOWED_EXTENSIONS and ext not in settings.ALLOWED_EXTENSIONS:
        raise ValidationError(f"File type '{ext}' not supported")

    doc_service = DocumentService(db)
    file_hash = doc_service.calculate_file_hash(content)

    existing = db.query(Document).filter(
        Document.owner_id == user["sub"],
        Document.file_hash == file_hash,
    ).first()
    if existing:
        raise ValidationError("File already uploaded")

    document_id = str(uuid.uuid4())
    safe_filename = os.path.basename(file.filename).replace("/", "_").replace("\\", "_")
    temp_path = os.path.join(tempfile.gettempdir(), f"{document_id}_{safe_filename}")
    try:
        with open(temp_path, "wb") as f:
            f.write(content)

        mime_type, file_type = file_detector.detect(temp_path)

        if file_type == "unsupported":
            raise ValidationError(f"Unsupported file type detected: {mime_type}")

        storage_path = file_service.upload_file(
            user_id=user["sub"],
            document_id=document_id,
            file_content=content,
            filename=file.filename,
        )

        doc = doc_service.create_document(
            owner_id=user["sub"],
            filename=file.filename,
            storage_path=storage_path,
            file_size=len(content),
            file_hash=file_hash,
            detected_mime_type=mime_type,
            detected_file_type=file_type,
            folder_id=folder_id,
        )

        if background_tasks:
            background_tasks.add_task(process_document, db, str(doc.id), user["sub"], temp_path)

        return {
            "success": True,
            "data": {
                "id": str(doc.id),
                "filename": doc.original_filename,
                "file_size": doc.file_size,
                "detected_type": doc.detected_file_type,
                "mime_type": doc.detected_mime_type,
                "processing_status": doc.processing_status,
            },
            "message": "Document uploaded successfully",
        }

    finally:
        if os.path.exists(temp_path):
            os.unlink(temp_path)


from app.models.document import Document


@router.get("")
async def list_documents(
    folder_id: str = None,
    search: str = None,
    file_type: str = None,
    category: str = None,
    status: str = None,
    is_locked: bool = None,
    is_starred: bool = None,
    visibility: str = None,
    sort_by: str = "created_at",
    sort_order: str = "desc",
    page: int = 1,
    per_page: int = 20,
    user: dict = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    doc_service = DocumentService(db)

    if is_starred:
        sort_by = "updated_at"

    result = doc_service.list_documents(
        owner_id=user["sub"],
        folder_id=folder_id,
        search=search,
        file_type=file_type,
        category=category,
        status=status,
        is_locked=is_locked,
        sort_by=sort_by,
        sort_order=sort_order,
        page=page,
        per_page=per_page,
    )

    docs = []
    for doc in result["documents"]:
        meta = doc.file_metadata or {}
        is_doc_starred = bool(meta.get("is_starred"))
        if is_starred and not is_doc_starred:
            continue
        if visibility and doc.visibility != visibility:
            continue
        docs.append({
            "id": str(doc.id),
            "owner_id": str(doc.owner_id),
            "folder_id": str(doc.folder_id) if doc.folder_id else None,
            "original_filename": doc.original_filename,
            "file_size": doc.file_size,
            "file_hash": doc.file_hash,
            "detected_mime_type": doc.detected_mime_type,
            "detected_file_type": doc.detected_file_type,
            "category": doc.category,
            "title": doc.title,
            "author": doc.author,
            "metadata": meta,
            "is_locked": doc.is_locked,
            "is_starred": is_doc_starred,
            "starred_at": meta.get("starred_at"),
            "visibility": doc.visibility,
            "public_title": doc.public_title,
            "has_public_password": bool(doc.public_password_hash),
            "processing_status": doc.processing_status,
            "processing_error": doc.processing_error,
            "created_at": doc.created_at.isoformat() if doc.created_at else "",
            "updated_at": doc.updated_at.isoformat() if doc.updated_at else "",
        })

    return {
        "success": True,
        "data": {
            "documents": docs,
            "total": result["total"],
            "page": result["page"],
            "per_page": result["per_page"],
            "total_pages": result["total_pages"],
        },
    }


@router.get("/stats/summary")
async def get_documents_stats(
    user: dict = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    from sqlalchemy import func, case

    base = db.query(Document).filter(Document.owner_id == user["sub"])

    total_count = base.with_entities(func.count(Document.id)).scalar() or 0
    total_size = base.with_entities(func.coalesce(func.sum(Document.file_size), 0)).scalar() or 0

    processing_count = base.with_entities(
        func.count(case((Document.processing_status.in_(["processing", "queued"]), 1)))
    ).scalar() or 0
    completed_count = base.with_entities(
        func.count(case((Document.processing_status == "completed", 1)))
    ).scalar() or 0

    starred_count = (
        db.query(Document)
        .filter(Document.owner_id == user["sub"])
        .filter(Document.file_metadata["is_starred"].as_string() == "true")
        .count()
    )

    return {
        "success": True,
        "data": {
            "total_count": total_count,
            "total_size": int(total_size),
            "processing_count": int(processing_count),
            "completed_count": int(completed_count),
            "starred_count": starred_count,
        },
    }


@router.get("/{document_id}")
async def get_document(
    document_id: str,
    user: dict = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    doc_service = DocumentService(db)
    doc = doc_service.get_document(document_id, user["sub"], user.get("role", "user"))

    return {
        "success": True,
        "data": {
            "id": str(doc.id),
            "owner_id": str(doc.owner_id),
            "folder_id": str(doc.folder_id) if doc.folder_id else None,
            "original_filename": doc.original_filename,
            "file_size": doc.file_size,
            "file_hash": doc.file_hash,
            "detected_mime_type": doc.detected_mime_type,
            "detected_file_type": doc.detected_file_type,
            "category": doc.category,
            "title": doc.title,
            "author": doc.author,
            "metadata": doc.file_metadata or {},
            "is_locked": doc.is_locked,
            "visibility": doc.visibility,
            "public_title": doc.public_title,
            "has_public_password": bool(doc.public_password_hash),
            "processing_status": doc.processing_status,
            "processing_error": doc.processing_error,
            "processing_completed_at": doc.processing_completed_at.isoformat() if doc.processing_completed_at else None,
            "created_at": doc.created_at.isoformat() if doc.created_at else "",
            "updated_at": doc.updated_at.isoformat() if doc.updated_at else "",
        },
    }


@router.post("/public/{document_id}")
async def download_public_document(
    document_id: str,
    request: Request,
    db: Session = Depends(get_db),
):
    """Download a public document. No auth required, but server-side enforced."""
    from fastapi.responses import RedirectResponse
    from app.models.document import Document

    doc = db.query(Document).filter(
        Document.id == document_id,
        Document.visibility == "public",
    ).first()
    if not doc:
        raise NotFoundError("Public document")

    if doc.public_password_hash:
        try:
            body = await request.json()
        except Exception:
            body = {}
        password = body.get("password", "")
        if not verify_password(str(password), doc.public_password_hash):
            raise ForbiddenError("Incorrect public password")

    signed_url = file_service.get_signed_url(doc.storage_path, expires_in=900)
    if not signed_url:
        raise ValidationError("Could not generate download link")
    return RedirectResponse(url=signed_url)


@router.get("/public/{document_id}")
async def get_public_document(
    document_id: str,
    db: Session = Depends(get_db),
):
    """Get public metadata of a public document. No auth required."""
    doc = db.query(Document).filter(
        Document.id == document_id,
        Document.visibility == "public",
    ).first()
    if not doc:
        raise NotFoundError("Public document")

    return {
        "success": True,
        "data": {
            "id": str(doc.id),
            "original_filename": doc.original_filename,
            "public_title": doc.public_title,
            "file_size": doc.file_size,
            "detected_file_type": doc.detected_file_type,
            "has_public_password": bool(doc.public_password_hash),
            "created_at": doc.created_at.isoformat() if doc.created_at else "",
        },
    }


@router.patch("/{document_id}")
async def update_document(
    document_id: str,
    request: Request,
    user: dict = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    body = await request.json()
    allowed_fields = {"original_filename", "folder_id", "visibility", "public_title"}
    visibility = body.get("visibility")

    if visibility is not None and visibility not in ("private", "password", "public"):
        raise ValidationError("Invalid visibility")
    if visibility == "private":
        body["public_password_hash"] = None

    plain_password = body.pop("public_password", None)
    updates = {k: v for k, v in body.items() if k in allowed_fields and v is not None}

    if not updates and plain_password is None:
        raise ValidationError("No valid fields to update")

    if plain_password is not None and visibility == "password":
        if len(str(plain_password)) < 6:
            raise ValidationError("Public password must be at least 6 characters")
        updates["public_password_hash"] = hash_password(str(plain_password))
        updates["visibility"] = "password"

    doc_service = DocumentService(db)
    doc = doc_service.update_document(document_id, user["sub"], updates)

    return {
        "success": True,
        "data": {
            "id": str(doc.id),
            "original_filename": doc.original_filename,
            "folder_id": str(doc.folder_id) if doc.folder_id else None,
            "visibility": doc.visibility,
            "public_title": doc.public_title,
            "has_public_password": bool(doc.public_password_hash),
        },
        "message": "Document updated",
    }


@router.patch("/{document_id}/metadata")
async def update_document_metadata(
    document_id: str,
    request: Request,
    user: dict = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    body = await request.json()
    if not isinstance(body, dict):
        raise ValidationError("Body must be a JSON object")

    doc_service = DocumentService(db)
    doc = doc_service.get_document(document_id, user["sub"])
    if not doc:
        raise NotFoundError("Document not found")

    merged = dict(doc.file_metadata or {})
    for k, v in body.items():
        if k.startswith("_"):
            continue
        if v is None:
            merged.pop(k, None)
        else:
            merged[k] = v
    doc.file_metadata = merged
    db.commit()
    db.refresh(doc)

    return {
        "success": True,
        "data": {
            "id": str(doc.id),
            "metadata": doc.file_metadata,
        },
        "message": "Metadata updated",
    }


@router.delete("/{document_id}")
async def delete_document(
    document_id: str,
    user: dict = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    doc_service = DocumentService(db)
    doc = doc_service.get_document(document_id, user["sub"])

    file_service.delete_file(doc.storage_path)
    doc_service.delete_document(doc.id, user["sub"])

    return {"success": True, "message": "Document deleted"}


@router.post("/{document_id}/download")
async def download_document(
    document_id: str,
    request: Request,
    user: dict = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    from fastapi.responses import RedirectResponse
    from app.models.document import Document
    from app.models.share import Share

    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise NotFoundError("Document")

    has_access = (
        str(doc.owner_id) == user["sub"]
        or user.get("role") == "admin"
        or db.query(Share).filter(
            Share.document_id == document_id,
            Share.shared_with == user["sub"],
        ).first() is not None
    )

    if not has_access:
        raise ForbiddenError("Access denied")

    if doc.is_locked:
        if not doc.password_hash:
            raise ValidationError("File is locked but no password is set. Owner must re-lock the file.")
        body = await request.json()
        password = body.get("password")
        if not password:
            raise ValidationError("Password required for locked file")
        if not verify_password(str(password), doc.password_hash):
            raise ForbiddenError("Incorrect file password")

    if doc.visibility == "public":
        signed_url = file_service.get_signed_url(doc.storage_path, expires_in=900)
        if not signed_url:
            raise ValidationError("Could not generate download link")
        return {
            "success": True,
            "data": {"url": signed_url, "filename": doc.original_filename},
            "message": "Download link generated",
        }

    if not file_service.file_exists(doc.storage_path):
        raise NotFoundError("File not found in storage")

    signed_url = file_service.get_signed_url(doc.storage_path, expires_in=900)
    if not signed_url:
        raise ValidationError("Could not generate download link")
    return {
        "success": True,
        "data": {"url": signed_url, "filename": doc.original_filename},
        "message": "Download link generated",
    }


@router.post("/{document_id}/lock")
async def lock_document(
    document_id: str,
    request: Request,
    user: dict = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    from app.models.document import Document

    body = await request.json()
    password = body.get("password")
    if not password or len(str(password)) < 6:
        raise ValidationError("Password must be at least 6 characters")

    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise NotFoundError("Document")
    if str(doc.owner_id) != user["sub"]:
        raise ForbiddenError("Only owner can lock")

    doc.is_locked = True
    doc.password_hash = hash_password(str(password))
    db.commit()

    return {"success": True, "message": "File locked"}


@router.post("/{document_id}/unlock")
async def unlock_document(
    document_id: str,
    request: Request,
    user: dict = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    from app.models.document import Document

    body = await request.json()
    password = body.get("password")
    if not password:
        raise ValidationError("Password required")

    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise NotFoundError("Document")
    if str(doc.owner_id) != user["sub"]:
        raise ForbiddenError("Only owner can unlock")

    if not verify_password(str(password), doc.password_hash):
        raise ForbiddenError("Incorrect password")

    doc.is_locked = False
    # Keep password_hash so owner can re-lock later with the same password.
    db.commit()

    return {"success": True, "message": "File unlocked"}
