from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from app.database.connection import get_db
from app.core.dependencies import get_current_user_id
from app.core.exceptions import ValidationError
from app.services.folder_service import FolderService

router = APIRouter()


@router.post("")
async def create_folder(
    request: Request,
    user: dict = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    body = await request.json()
    name = body.get("name", "").strip()
    parent_folder_id = body.get("parent_folder_id")
    visibility = body.get("visibility", "private")

    if not name:
        raise ValidationError("Folder name is required")
    if len(name) > 255:
        raise ValidationError("Folder name too long")
    if visibility not in ("private", "password", "public"):
        raise ValidationError("Invalid visibility")

    folder_service = FolderService(db)
    folder = folder_service.create_folder(user["sub"], name, parent_folder_id, visibility=visibility)

    return {
        "success": True,
        "data": {
            "id": str(folder.id),
            "name": folder.name,
            "parent_folder_id": str(folder.parent_folder_id) if folder.parent_folder_id else None,
            "visibility": folder.visibility,
            "created_at": folder.created_at.isoformat() if folder.created_at else "",
        },
        "message": "Folder created",
    }


@router.get("")
async def list_folders(
    parent_folder_id: str = None,
    user: dict = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    folder_service = FolderService(db)
    folders = folder_service.list_folders(user["sub"], parent_folder_id)

    return {
        "success": True,
        "data": {
            "folders": [
                {
                    "id": str(f.id),
                    "name": f.name,
                    "parent_folder_id": str(f.parent_folder_id) if f.parent_folder_id else None,
                    "visibility": f.visibility,
                    "created_at": f.created_at.isoformat() if f.created_at else "",
                    "updated_at": f.updated_at.isoformat() if f.updated_at else "",
                }
                for f in folders
            ],
            "total": len(folders),
        },
    }


@router.get("/{folder_id}")
async def get_folder(
    folder_id: str,
    user: dict = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    folder_service = FolderService(db)
    folder = folder_service.get_folder(folder_id, user["sub"])

    return {
        "success": True,
        "data": {
            "id": str(folder.id),
            "name": folder.name,
            "parent_folder_id": str(folder.parent_folder_id) if folder.parent_folder_id else None,
            "visibility": folder.visibility,
            "created_at": folder.created_at.isoformat() if folder.created_at else "",
            "updated_at": folder.updated_at.isoformat() if folder.updated_at else "",
        },
    }


@router.patch("/{folder_id}")
async def rename_folder(
    folder_id: str,
    request: Request,
    user: dict = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    body = await request.json()
    name = body.get("name", "").strip()
    visibility = body.get("visibility")

    if visibility is not None and visibility not in ("private", "password", "public"):
        raise ValidationError("Invalid visibility")

    folder_service = FolderService(db)
    folder = folder_service.update_folder(folder_id, user["sub"], name=name or None, visibility=visibility)

    return {
        "success": True,
        "data": {"id": str(folder.id), "name": folder.name, "visibility": folder.visibility},
        "message": "Folder updated",
    }


@router.delete("/{folder_id}")
async def delete_folder(
    folder_id: str,
    user: dict = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    folder_service = FolderService(db)
    folder_service.delete_folder(folder_id, user["sub"])

    return {"success": True, "message": "Folder deleted"}


@router.get("/public/list")
async def list_public_documents(
    db: Session = Depends(get_db),
):
    """List all public documents. No auth required."""
    from app.models.document import Document
    from app.models.folder import Folder

    docs = db.query(Document).filter(Document.visibility == "public").order_by(Document.created_at.desc()).limit(200).all()
    folders = db.query(Folder).filter(Folder.visibility == "public").order_by(Folder.created_at.desc()).limit(200).all()
    return {
        "success": True,
        "data": {
            "documents": [
                {
                    "id": str(d.id),
                    "original_filename": d.original_filename,
                    "public_title": d.public_title,
                    "file_size": d.file_size,
                    "detected_file_type": d.detected_file_type,
                    "has_public_password": bool(d.public_password_hash),
                    "created_at": d.created_at.isoformat() if d.created_at else "",
                }
                for d in docs
            ],
            "folders": [
                {
                    "id": str(f.id),
                    "name": f.name,
                    "owner_id": str(f.owner_id),
                    "created_at": f.created_at.isoformat() if f.created_at else "",
                }
                for f in folders
            ],
        },
    }
