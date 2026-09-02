import os
import zipfile
from typing import Optional, Tuple


EXTENSION_TYPE_MAP = {
    "pdf": "pdf",
    "docx": "docx",
    "xlsx": "xlsx",
    "pptx": "pptx",
    "doc": "doc",
    "xls": "xls",
    "ppt": "ppt",
    "txt": "txt",
    "md": "md",
    "csv": "csv",
    "json": "json",
    "xml": "xml",
    "html": "html",
    "htm": "html",
    "rtf": "rtf",
    "odt": "odt",
    "ods": "ods",
    "odp": "odp",
    "png": "png",
    "jpg": "jpg",
    "jpeg": "jpg",
    "gif": "gif",
    "webp": "webp",
    "svg": "svg",
    "bmp": "bmp",
    "tiff": "tiff",
    "tif": "tiff",
    "ico": "ico",
    "mp3": "audio",
    "wav": "audio",
    "ogg": "audio",
    "m4a": "audio",
    "flac": "audio",
    "mp4": "video",
    "mov": "video",
    "avi": "video",
    "mkv": "video",
    "webm": "video",
    "zip": "archive",
    "rar": "archive",
    "7z": "archive",
    "tar": "archive",
    "gz": "archive",
    "js": "code",
    "ts": "code",
    "tsx": "code",
    "jsx": "code",
    "py": "code",
    "java": "code",
    "c": "code",
    "cpp": "code",
    "h": "code",
    "cs": "code",
    "go": "code",
    "rs": "code",
    "rb": "code",
    "php": "code",
    "sh": "code",
    "yaml": "code",
    "yml": "code",
    "toml": "code",
    "ini": "code",
    "env": "code",
    "sql": "code",
    "css": "code",
    "scss": "code",
    "less": "code",
    "html": "code",
    "vue": "code",
    "svelte": "code",
}


class FileDetector:
    def detect(self, file_path: str) -> Tuple[str, str]:
        mime_type, file_type = self._resolve_from_extension(file_path)
        return mime_type or "application/octet-stream", file_type

    def _resolve_from_extension(self, file_path: str) -> Tuple[Optional[str], str]:
        ext = os.path.splitext(file_path)[1].lower().lstrip(".")
        if not ext:
            return "application/octet-stream", "other"
        file_type = EXTENSION_TYPE_MAP.get(ext, "other")
        mime_type = self._guess_mime(ext)
        return mime_type, file_type

    def _guess_mime(self, ext: str) -> str:
        mime_guesses = {
            "pdf": "application/pdf",
            "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
            "doc": "application/msword",
            "xls": "application/vnd.ms-excel",
            "ppt": "application/vnd.ms-powerpoint",
            "txt": "text/plain",
            "md": "text/markdown",
            "csv": "text/csv",
            "json": "application/json",
            "xml": "application/xml",
            "html": "text/html",
            "htm": "text/html",
            "rtf": "application/rtf",
            "png": "image/png",
            "jpg": "image/jpeg",
            "jpeg": "image/jpeg",
            "gif": "image/gif",
            "webp": "image/webp",
            "svg": "image/svg+xml",
            "bmp": "image/bmp",
            "tiff": "image/tiff",
            "tif": "image/tiff",
            "ico": "image/x-icon",
            "mp3": "audio/mpeg",
            "wav": "audio/wav",
            "ogg": "audio/ogg",
            "m4a": "audio/mp4",
            "flac": "audio/flac",
            "mp4": "video/mp4",
            "mov": "video/quicktime",
            "avi": "video/x-msvideo",
            "mkv": "video/x-matroska",
            "webm": "video/webm",
            "zip": "application/zip",
            "rar": "application/vnd.rar",
            "7z": "application/x-7z-compressed",
            "tar": "application/x-tar",
            "gz": "application/gzip",
        }
        return mime_guesses.get(ext, "application/octet-stream")


file_detector = FileDetector()
