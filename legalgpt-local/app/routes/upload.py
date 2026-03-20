import hashlib
import os
from flask import Blueprint, request, jsonify, current_app, session
from werkzeug.utils import secure_filename

from ..extensions import db
from ..models import Document, DocumentChunk, Embedding

upload_bp = Blueprint("upload", __name__)
ALLOWED = {"pdf", "docx"}


def allowed_file(filename):
    if "." not in filename:
        return False
    ext = filename.rsplit(".", 1)[1].lower()
    return ext in ALLOWED


def _can_access_document(doc: Document, user_id: int, role: str) -> bool:
    return role == "admin" or doc.user_id == user_id


@upload_bp.post("/upload")
def upload_file():
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    file = request.files.get("file")
    if not file or not file.filename:
        return jsonify({"error": "File missing"}), 400
    if not allowed_file(file.filename):
        return jsonify({"error": "Only PDF/DOCX allowed"}), 400

    file.seek(0, os.SEEK_END)
    size = file.tell()
    file.seek(0)
    max_bytes = current_app.config["MAX_UPLOAD_MB"] * 1024 * 1024
    if size > max_bytes:
        return jsonify({"error": "File too large"}), 400

    raw = file.read()
    sha = hashlib.sha256(raw).hexdigest()
    file.seek(0)

    existing = Document.query.filter_by(sha256=sha).first()
    if existing:
        if not _can_access_document(existing, user_id, session.get("role")):
            return jsonify({"error": "This file already exists under another account"}), 400
        return jsonify({"ok": True, "document_id": existing.id, "status": "duplicate"})

    safe_name = secure_filename(file.filename)
    storage = os.path.join(current_app.config["UPLOAD_FOLDER"], f"{sha}_{safe_name}")
    file.save(storage)

    doc = Document(
        user_id=user_id,
        original_name=file.filename,
        storage_path=storage,
        mime_type=file.mimetype or "application/octet-stream",
        file_size=size,
        sha256=sha,
        status="uploaded",
    )
    db.session.add(doc)
    db.session.commit()

    return jsonify(
        {
            "ok": True,
            "document_id": doc.id,
            "status": doc.status,
            "index_path": f"/api/index/{doc.id}",
        }
    )


@upload_bp.get("/documents")
def list_documents():
    user_id = session.get("user_id")
    role = session.get("role")
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    query = Document.query.order_by(Document.created_at.desc())
    if role != "admin":
        query = query.filter_by(user_id=user_id)

    docs = query.all()
    return jsonify(
        {
            "ok": True,
            "documents": [
                {
                    "id": d.id,
                    "name": d.original_name,
                    "status": d.status,
                    "size": d.file_size,
                    "created_at": d.created_at.isoformat() if d.created_at else None,
                }
                for d in docs
            ],
        }
    )


@upload_bp.delete("/documents/<int:document_id>")
def delete_document(document_id: int):
    user_id = session.get("user_id")
    role = session.get("role")
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    doc = db.session.get(Document, document_id)
    if not doc:
        return jsonify({"error": "Document not found"}), 404
    if not _can_access_document(doc, user_id, role):
        return jsonify({"error": "Forbidden"}), 403

    chunks = DocumentChunk.query.filter_by(document_id=doc.id).all()
    chunk_ids = [c.id for c in chunks]
    if chunk_ids:
        Embedding.query.filter(Embedding.chunk_id.in_(chunk_ids)).delete(synchronize_session=False)
    DocumentChunk.query.filter_by(document_id=doc.id).delete(synchronize_session=False)

    file_path = doc.storage_path
    db.session.delete(doc)
    db.session.commit()

    if file_path and os.path.exists(file_path):
        try:
            os.remove(file_path)
        except OSError:
            pass

    return jsonify({"ok": True, "deleted": document_id})
