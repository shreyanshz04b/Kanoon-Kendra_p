from pathlib import Path

from docx import Document as DocxDocument
from pypdf import PdfReader

from ..extensions import db
from ..models import Document, DocumentChunk, Embedding
from .ollama_client import embed_texts


LEGAL_SIGNALS = {
    "act",
    "section",
    "rule",
    "article",
    "court",
    "judge",
    "judgment",
    "judgement",
    "order",
    "tribunal",
    "petition",
    "appeal",
    "ipc",
    "crpc",
    "cpc",
    "constitution",
    "legal",
    "law",
    "plaintiff",
    "defendant",
    "lease",
    "property",
    "land",
    "registration",
    "stamp duty",
    "revenue",
    "mutation",
}


def _extract_pdf_text(path: str) -> str:
    reader = PdfReader(path)
    pages = []
    for p in reader.pages:
        pages.append((p.extract_text() or "").strip())
    return "\n\n".join(x for x in pages if x)


def _extract_docx_text(path: str) -> str:
    doc = DocxDocument(path)
    lines = [(p.text or "").strip() for p in doc.paragraphs]
    return "\n".join(x for x in lines if x)


def extract_text_for_document(document: Document) -> str:
    p = Path(document.storage_path)
    ext = p.suffix.lower()
    if ext == ".pdf":
        return _extract_pdf_text(str(p))
    if ext == ".docx":
        return _extract_docx_text(str(p))
    return ""


def chunk_text(text: str, chunk_size=900, overlap=120) -> list[str]:
    cleaned = " ".join(text.split())
    if not cleaned:
        return []

    chunks = []
    i = 0
    n = len(cleaned)
    while i < n:
        end = min(i + chunk_size, n)
        chunks.append(cleaned[i:end])
        if end == n:
            break
        i = max(end - overlap, i + 1)
    return chunks


def is_likely_legal_document(text: str) -> bool:
    normalized = " ".join(text.lower().split())
    if len(normalized) < 200:
        return False

    hits = 0
    for signal in LEGAL_SIGNALS:
        if signal in normalized:
            hits += 1
    return hits >= 2


def index_document(document_id: int) -> dict:
    document = db.session.get(Document, document_id)
    if not document:
        return {"ok": False, "error": "Document not found"}

    text = extract_text_for_document(document)
    if not is_likely_legal_document(text):
        document.status = "rejected_non_legal"
        db.session.commit()
        return {
            "ok": False,
            "error": "Document rejected: content does not look legal-domain specific",
        }

    chunks = chunk_text(text)
    if not chunks:
        document.status = "failed"
        db.session.commit()
        return {"ok": False, "error": "No extractable text found"}

    vectors = embed_texts(chunks)
    if len(vectors) != len(chunks):
        document.status = "failed"
        db.session.commit()
        return {"ok": False, "error": "Embedding generation mismatch"}

    # Avoid duplicate index rows when re-indexing a document.
    existing_chunks = DocumentChunk.query.filter_by(document_id=document.id).all()
    if existing_chunks:
        existing_ids = [x.id for x in existing_chunks]
        Embedding.query.filter(Embedding.chunk_id.in_(existing_ids)).delete(synchronize_session=False)
        DocumentChunk.query.filter_by(document_id=document.id).delete(synchronize_session=False)
        db.session.flush()

    for idx, (chunk, vector) in enumerate(zip(chunks, vectors)):
        row = DocumentChunk(
            document_id=document.id,
            chunk_index=idx,
            chunk_text=chunk,
            chunk_metadata={
                "document_id": document.id,
                "filename": document.original_name,
                "source": "user_upload",
            },
        )
        db.session.add(row)
        db.session.flush()

        emb = Embedding(
            chunk_id=row.id,
            embedding_model="ollama",
            embedding=vector,
        )
        db.session.add(emb)

    document.status = "indexed"
    db.session.commit()
    return {"ok": True, "document_id": document.id, "chunks": len(chunks)}
