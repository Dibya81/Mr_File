import fitz
from typing import Dict, Any
import re


class PDFExtractor:
    def extract(self, file_path: str) -> dict:
        try:
            doc = fitz.open(file_path)
            metadata = doc.metadata or {}
            page_count = len(doc)

            text = ""
            for page in doc:
                text += page.get_text()

            word_count = len(text.split()) if text.strip() else 0

            result = {
                "page_count": page_count,
                "title": metadata.get("title", ""),
                "author": metadata.get("author", ""),
                "subject": metadata.get("subject", ""),
                "creator": metadata.get("creator", ""),
                "producer": metadata.get("producer", ""),
                "creation_date": metadata.get("creationDate", ""),
                "modification_date": metadata.get("modDate", ""),
                "text_length": len(text),
                "word_count": word_count,
                "text_preview": text[:500] if text else "",
            }
            doc.close()
            return result
        except Exception as e:
            return {"error": str(e), "page_count": 0, "word_count": 0}


pdf_extractor = PDFExtractor()
