import pytest
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.processors.detector import file_detector
from app.services.classification_service import classification_service


class TestFileDetector:
    def test_detect_pdf(self):
        mime, ftype = file_detector.detect("test.pdf")
        assert mime == "application/pdf"
        assert ftype == "pdf"

    def test_detect_docx(self):
        mime, ftype = file_detector.detect("report.docx")
        assert "wordprocessingml" in mime
        assert ftype == "docx"

    def test_detect_xlsx(self):
        mime, ftype = file_detector.detect("data.xlsx")
        assert "spreadsheetml" in mime
        assert ftype == "xlsx"

    def test_detect_pptx(self):
        mime, ftype = file_detector.detect("deck.pptx")
        assert "presentationml" in mime
        assert ftype == "pptx"

    def test_detect_unknown_returns_other(self):
        mime, ftype = file_detector.detect("file.unknownext")
        assert ftype == "other"


class TestClassificationService:
    def test_classify_pdf_with_invoice_keywords(self):
        metadata = {"text_preview": "Invoice #1234 Amount Due: $500 Payment Terms"}
        result = classification_service.classify("pdf", metadata, "invoice.pdf")
        assert result == "invoice"

    def test_classify_pdf_with_resume_keywords(self):
        metadata = {"text_preview": "Resume John Doe Work Experience Education Skills"}
        result = classification_service.classify("pdf", metadata, "resume.pdf")
        assert result == "resume"

    def test_classify_pptx_as_presentation(self):
        metadata = {"text_preview": "Slides Overview Agenda"}
        result = classification_service.classify("pptx", metadata, "deck.pptx")
        assert result == "presentation"

    def test_classify_xlsx_as_spreadsheet(self):
        metadata = {"text_preview": "Data Column Row Sum Average"}
        result = classification_service.classify("xlsx", metadata, "data.xlsx")
        assert result == "spreadsheet"

    def test_fallback_to_type(self):
        metadata = {"text_preview": "random text with no keywords"}
        result = classification_service.classify("pdf", metadata, "doc.pdf")
        assert result == "document"
