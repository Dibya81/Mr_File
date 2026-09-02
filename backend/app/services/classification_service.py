import re


CLASSIFICATION_KEYWORDS = {
    "resume": ["resume", "curriculum vitae", "cv", "work experience", "education", "skills", "employment"],
    "invoice": ["invoice", "bill", "amount due", "payment", "total", "tax", "billing"],
    "financial_report": ["financial", "revenue", "profit", "loss", "balance sheet", "income statement", "cash flow"],
    "presentation": ["presentation", "slides", "deck", "overview", "summary", "agenda"],
    "report": ["report", "analysis", "findings", "conclusion", "summary", "overview"],
    "contract": ["contract", "agreement", "terms", "conditions", "party", "signature", "hereby"],
    "letter": ["dear", "sincerely", "regards", "respectfully", "letter"],
    "academic": ["abstract", "introduction", "methodology", "results", "conclusion", "references", "citation"],
    "spreadsheet": ["data", "table", "column", "row", "sum", "average", "formula"],
    "document": [],
}


class ClassificationService:
    def classify(self, detected_type: str, metadata: dict, filename: str = "") -> str:
        text_content = self._extract_text_for_classification(metadata)
        filename_lower = filename.lower()

        for category, keywords in CLASSIFICATION_KEYWORDS.items():
            if not keywords:
                continue

            text_matches = sum(1 for kw in keywords if kw.lower() in text_content.lower())
            filename_matches = sum(1 for kw in keywords if kw.lower() in filename_lower)

            if text_matches >= 2 or filename_matches >= 1:
                return category

        type_mapping = {
            "pdf": "document",
            "docx": "document",
            "xlsx": "spreadsheet",
            "pptx": "presentation",
        }
        return type_mapping.get(detected_type, "document")

    def _extract_text_for_classification(self, metadata: dict) -> str:
        parts = []
        if metadata.get("title"):
            parts.append(metadata["title"])
        if metadata.get("text_preview"):
            parts.append(metadata["text_preview"][:500])
        if metadata.get("author"):
            parts.append(metadata["author"])
        if metadata.get("subject"):
            parts.append(metadata["subject"])
        return " ".join(parts)


classification_service = ClassificationService()
