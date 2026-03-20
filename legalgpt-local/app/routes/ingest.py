from flask import Blueprint, jsonify, session

from ..extensions import db
from ..models import Document
from ..services.ingestion import index_document

ingest_bp = Blueprint("ingest", __name__)


@ingest_bp.post("/index/<int:document_id>")
def index_uploaded_document(document_id: int):
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    doc = db.session.get(Document, document_id)
    if not doc:
        return jsonify({"error": "Document not found"}), 404
    if doc.user_id != user_id and session.get("role") != "admin":
        return jsonify({"error": "Forbidden"}), 403

    result = index_document(document_id)
    if not result.get("ok"):
        return jsonify(result), 400
    return jsonify(result)
