from datetime import datetime
from sqlalchemy import text
from werkzeug.security import generate_password_hash, check_password_hash

from .extensions import db


class User(db.Model):
    __tablename__ = "users"
    __table_args__ = {"schema": "app_core"}

    id = db.Column(db.BigInteger, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False, default="user")
    is_active = db.Column(db.Boolean, nullable=False, default=True)
    failed_login_count = db.Column(db.Integer, nullable=False, default=0)
    locked_until = db.Column(db.DateTime, nullable=True)
    force_password_change = db.Column(db.Boolean, nullable=False, default=False)
    last_login_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    def set_password(self, raw_password: str):
        self.password_hash = generate_password_hash(raw_password)

    def check_password(self, raw_password: str) -> bool:
        return check_password_hash(self.password_hash, raw_password)


class AccessRequest(db.Model):
    __tablename__ = "access_requests"
    __table_args__ = {"schema": "app_core"}

    id = db.Column(db.BigInteger, primary_key=True)
    full_name = db.Column(db.String(160), nullable=False)
    email = db.Column(db.String(255), nullable=False)
    organization = db.Column(db.String(255), nullable=True)
    use_case = db.Column(db.Text, nullable=True)
    status = db.Column(db.String(20), nullable=False, default="pending")
    reviewed_by_user_id = db.Column(db.BigInteger, nullable=True)
    reviewed_at = db.Column(db.DateTime, nullable=True)
    decision_notes = db.Column(db.Text, nullable=True)
    issued_username = db.Column(db.String(80), nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    def as_dict(self):
        return {
            "id": self.id,
            "full_name": self.full_name,
            "email": self.email,
            "organization": self.organization,
            "use_case": self.use_case,
            "status": self.status,
            "reviewed_by_user_id": self.reviewed_by_user_id,
            "reviewed_at": self.reviewed_at.isoformat() if self.reviewed_at else None,
            "decision_notes": self.decision_notes,
            "issued_username": self.issued_username,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


class AuthAuditLog(db.Model):
    __tablename__ = "auth_audit_logs"
    __table_args__ = {"schema": "app_core"}

    id = db.Column(db.BigInteger, primary_key=True)
    user_id = db.Column(db.BigInteger, nullable=True)
    event_type = db.Column(db.String(60), nullable=False)
    ip_address = db.Column(db.String(64), nullable=True)
    user_agent = db.Column(db.Text, nullable=True)
    payload = db.Column(db.JSON, nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)


class PasswordResetToken(db.Model):
    __tablename__ = "password_reset_tokens"
    __table_args__ = {"schema": "app_core"}

    id = db.Column(db.BigInteger, primary_key=True)
    user_id = db.Column(db.BigInteger, nullable=False)
    token_hash = db.Column(db.String(128), nullable=False, unique=True)
    expires_at = db.Column(db.DateTime, nullable=False)
    used_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)


class Document(db.Model):
    __tablename__ = "documents"
    __table_args__ = {"schema": "app_core"}

    id = db.Column(db.BigInteger, primary_key=True)
    user_id = db.Column(db.BigInteger, nullable=False)
    original_name = db.Column(db.String(255), nullable=False)
    storage_path = db.Column(db.Text, nullable=False)
    mime_type = db.Column(db.String(120), nullable=False)
    file_size = db.Column(db.BigInteger, nullable=False)
    sha256 = db.Column(db.String(64), nullable=False, unique=True)
    status = db.Column(db.String(20), nullable=False, default="uploaded")
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)


class DocumentChunk(db.Model):
    __tablename__ = "document_chunks"
    __table_args__ = {"schema": "rag_core"}

    id = db.Column(db.BigInteger, primary_key=True)
    document_id = db.Column(db.BigInteger, nullable=False)
    chunk_index = db.Column(db.Integer, nullable=False)
    chunk_text = db.Column(db.Text, nullable=False)
    chunk_metadata = db.Column("metadata", db.JSON, nullable=False, default=dict)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)


class Embedding(db.Model):
    __tablename__ = "embeddings"
    __table_args__ = {"schema": "rag_core"}

    id = db.Column(db.BigInteger, primary_key=True)
    chunk_id = db.Column(db.BigInteger, nullable=False)
    embedding_model = db.Column(db.String(120), nullable=False)
    embedding = db.Column(db.ARRAY(db.Float), nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)


def vector_search(query_vector, limit=4):
    sql = text(
        """
        select c.chunk_text, c.metadata, e.embedding
        from rag_core.embeddings e
        join rag_core.document_chunks c on c.id = e.chunk_id
        """
    )
    rows = db.session.execute(sql).fetchall()

    def cosine(a, b):
        dot = 0.0
        na = 0.0
        nb = 0.0
        for x, y in zip(a, b):
            dot += x * y
            na += x * x
            nb += y * y
        if na <= 0.0 or nb <= 0.0:
            return -1.0
        return dot / ((na ** 0.5) * (nb ** 0.5))

    scored = []
    for r in rows:
        emb = r[2] or []
        if not emb:
            continue
        scored.append((cosine(query_vector, emb), r[0], r[1]))

    scored.sort(key=lambda x: x[0], reverse=True)
    top = scored[:limit]
    return [(x[1], x[2]) for x in top]
