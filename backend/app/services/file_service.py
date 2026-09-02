import os
from supabase import create_client
from app.core.config import settings


class FileService:
    def __init__(self):
        self.client = create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_SERVICE_ROLE_KEY,
        )
        self.bucket = settings.STORAGE_BUCKET

    def upload_file(self, user_id: str, document_id: str, file_content: bytes, filename: str) -> str:
        safe_filename = filename.replace("/", "_").replace("\\", "_")
        storage_path = f"{user_id}/files/{document_id}/{safe_filename}"

        self.client.storage.from_(self.bucket).upload(
            path=storage_path,
            file=file_content,
            file_options={"content-type": "application/octet-stream", "upsert": "false"},
        )

        return storage_path

    def download_file(self, storage_path: str) -> bytes:
        data = self.client.storage.from_(self.bucket).download(storage_path)
        return data

    def delete_file(self, storage_path: str) -> bool:
        try:
            self.client.storage.from_(self.bucket).remove([storage_path])
            return True
        except Exception:
            return False

    def get_signed_url(self, storage_path: str, expires_in: int = 3600) -> str:
        signed_url = self.client.storage.from_(self.bucket).create_signed_url(
            path=storage_path,
            expires_in=expires_in,
        )
        return signed_url.get("signedURL", "")

    def file_exists(self, storage_path: str) -> bool:
        try:
            self.client.storage.from_(self.bucket).get_bucket()
            files = self.client.storage.from_(self.bucket).list(path=os.path.dirname(storage_path))
            filename = os.path.basename(storage_path)
            return any(f["name"] == filename for f in files)
        except Exception:
            return False


file_service = FileService()
