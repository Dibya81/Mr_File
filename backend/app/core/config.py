import os
from typing import List
from pydantic_settings import BaseSettings
from pydantic import ConfigDict


class Settings(BaseSettings):
    model_config = ConfigDict(env_file=".env", extra="allow")

    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_ANON_KEY: str = os.getenv("SUPABASE_ANON_KEY", "")
    SUPABASE_SERVICE_ROLE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
    DATABASE_URL: str = os.getenv("DATABASE_URL", "")
    JWT_SECRET: str = os.getenv("JWT_SECRET", "change-me-in-production")
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_MINUTES: int = 1440  # 24 hours
    STORAGE_BUCKET: str = "documents"
    MAX_FILE_SIZE: int = 50 * 1024 * 1024  # 50MB
    MAX_TOTAL_STORAGE: int = 1 * 1024 * 1024 * 1024  # 1GB
    CORS_ORIGINS: List[str] = []

    @property
    def parsed_cors_origins(self) -> List[str]:
        import json
        raw = os.getenv("CORS_ORIGINS", "")
        if raw:
            try:
                return json.loads(raw)
            except Exception:
                return [o.strip() for o in raw.split(",") if o.strip()]
        return self.CORS_ORIGINS

    ALLOWED_MIME_TYPES: list = []  # Allow all MIME types — extension check is the gate

    ALLOWED_EXTENSIONS: list = []  # Empty = allow all extensions. Detector classifies by extension only.


settings = Settings()
