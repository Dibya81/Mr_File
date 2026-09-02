import os
import uuid
from sqlalchemy.orm import Session
from app.models.folder import Folder
from app.core.exceptions import NotFoundError, ForbiddenError, ValidationError


class FolderService:
    def __init__(self, db: Session):
        self.db = db

    def create_folder(self, owner_id: str, name: str, parent_folder_id: str = None, visibility: str = "private") -> Folder:
        if parent_folder_id:
            parent = self.db.query(Folder).filter(
                Folder.id == parent_folder_id,
                Folder.owner_id == owner_id,
            ).first()
            if not parent:
                raise NotFoundError("Parent folder")

        folder = Folder(
            owner_id=owner_id,
            parent_folder_id=parent_folder_id,
            name=name.strip(),
            visibility=visibility,
        )
        self.db.add(folder)
        self.db.commit()
        self.db.refresh(folder)
        return folder

    def list_folders(self, owner_id: str, parent_folder_id: str = None) -> list:
        query = self.db.query(Folder).filter(Folder.owner_id == owner_id)

        if parent_folder_id:
            query = query.filter(Folder.parent_folder_id == parent_folder_id)
        elif parent_folder_id == "root":
            query = query.filter(Folder.parent_folder_id.is_(None))

        return query.order_by(Folder.name).all()

    def get_folder(self, folder_id: str, owner_id: str) -> Folder:
        folder = self.db.query(Folder).filter(
            Folder.id == folder_id,
            Folder.owner_id == owner_id,
        ).first()
        if not folder:
            raise NotFoundError("Folder")
        return folder

    def rename_folder(self, folder_id: str, owner_id: str, new_name: str) -> Folder:
        folder = self.get_folder(folder_id, owner_id)
        folder.name = new_name.strip()
        self.db.commit()
        self.db.refresh(folder)
        return folder

    def update_folder(self, folder_id: str, owner_id: str, name: str = None, visibility: str = None) -> Folder:
        folder = self.get_folder(folder_id, owner_id)
        if name is not None:
            folder.name = name.strip()
        if visibility is not None:
            folder.visibility = visibility
        self.db.commit()
        self.db.refresh(folder)
        return folder

    def delete_folder(self, folder_id: str, owner_id: str) -> Folder:
        folder = self.get_folder(folder_id, owner_id)

        from app.models.document import Document
        docs_in_folder = self.db.query(Document).filter(
            Document.folder_id == folder_id
        ).count()
        if docs_in_folder > 0:
            raise ValidationError("Cannot delete folder with documents. Move or delete documents first.")

        subfolders = self.db.query(Folder).filter(Folder.parent_folder_id == folder_id).count()
        if subfolders > 0:
            raise ValidationError("Cannot delete folder with subfolders.")

        self.db.delete(folder)
        self.db.commit()
        return folder

    def get_folder_path(self, folder_id: str, owner_id: str) -> list:
        path = []
        current_id = folder_id
        while current_id:
            folder = self.db.query(Folder).filter(
                Folder.id == current_id,
                Folder.owner_id == owner_id,
            ).first()
            if not folder:
                break
            path.insert(0, {"id": str(folder.id), "name": folder.name})
            current_id = str(folder.parent_folder_id) if folder.parent_folder_id else None
        return path
