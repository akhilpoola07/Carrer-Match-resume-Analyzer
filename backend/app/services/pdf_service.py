"""PDF text extraction using pypdf."""

from io import BytesIO
from pypdf import PdfReader
from pypdf.errors import PdfReadError


class PDFExtractionError(Exception):
    pass


def extract_text_from_pdf(file_bytes: bytes) -> str:
    if not file_bytes:
        raise PDFExtractionError("Empty file uploaded.")

    try:
        reader = PdfReader(BytesIO(file_bytes))
    except PdfReadError as exc:
        raise PDFExtractionError("Corrupted or invalid PDF file.") from exc
    except Exception as exc:
        raise PDFExtractionError("Unable to read PDF file.") from exc

    if getattr(reader, "is_encrypted", False):
        try:
            reader.decrypt("")
        except Exception as exc:
            raise PDFExtractionError("Encrypted PDF is not supported.") from exc

    parts = []
    for page in reader.pages:
        try:
            page_text = page.extract_text() or ""
        except Exception:
            page_text = ""
        parts.append(page_text)

    text = "\n".join(parts).strip()
    if not text:
        raise PDFExtractionError(
            "Unable to extract text from this PDF. Please upload a text-based PDF."
        )
    return text
