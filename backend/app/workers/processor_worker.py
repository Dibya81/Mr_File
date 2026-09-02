import logging
from sqlalchemy.orm import Session
from app.models.document import Document
from app.models.processing_job import ProcessingJob
from app.processors.detector import file_detector
from app.processors.extractors.pdf import pdf_extractor
from app.processors.extractors.word import word_extractor
from app.processors.extractors.excel import excel_extractor
from app.processors.extractors.powerpoint import powerpoint_extractor
from app.services.classification_service import classification_service
from app.services.processing_service import ProcessingService
from app.services.file_service import file_service
from datetime import datetime, timezone

logger = logging.getLogger(__name__)


def process_document(db: Session, document_id: str, user_id: str, file_path: str):
    proc_service = ProcessingService(db)

    job = proc_service.create_job(document_id, user_id)

    try:
        proc_service.start_job(job.id)

        doc = db.query(Document).filter(Document.id == document_id).first()
        if not doc:
            proc_service.fail_job(job.id, "Document not found")
            return

        doc.processing_status = "processing"
        db.commit()

        mime_type, file_type = file_detector.detect(file_path)

        doc.detected_mime_type = mime_type
        doc.detected_file_type = file_type

        if file_type == "unsupported":
            doc.processing_status = "failed"
            doc.processing_error = f"Unsupported file type: {mime_type}"
            proc_service.fail_job(job.id, f"Unsupported file type: {mime_type}")
            return

        metadata = extract_metadata(file_path, file_type)
        category = classification_service.classify(file_type, metadata, doc.original_filename)

        doc.file_metadata = metadata
        doc.category = category
        doc.title = metadata.get("title", "")
        doc.author = metadata.get("author", "")
        doc.processing_status = "completed"
        doc.processing_completed_at = datetime.now(timezone.utc)
        db.commit()

        proc_service.complete_job(
            job.id,
            detected_type=file_type,
            category=category,
            metadata=metadata,
        )

        logger.info(f"Document {document_id} processed successfully: {file_type}/{category}")

    except Exception as e:
        logger.error(f"Processing failed for {document_id}: {e}")
        doc = db.query(Document).filter(Document.id == document_id).first()
        if doc:
            doc.processing_status = "failed"
            doc.processing_error = str(e)
            db.commit()
        proc_service.fail_job(job.id, str(e))


def extract_metadata(file_path: str, file_type: str) -> dict:
    extractors = {
        "pdf": pdf_extractor,
        "docx": word_extractor,
        "xlsx": excel_extractor,
        "pptx": powerpoint_extractor,
    }

    extractor = extractors.get(file_type)
    if not extractor:
        return {}

    try:
        return extractor.extract(file_path)
    except Exception as e:
        logger.error(f"Metadata extraction failed for {file_type}: {e}")
        return {"error": str(e)}
