import secrets
import string
from datetime import datetime

from flask import Blueprint, jsonify, session, request
from sqlalchemy import text

from ..extensions import db
from ..models import User, AccessRequest, AuthAuditLog

admin_bp = Blueprint("admin", __name__)


def _ensure_admin():
    return bool(session.get("user_id") and session.get("role") == "admin")


def _random_password(length=6):
    alphabet = string.ascii_letters + string.digits
    return "".join(secrets.choice(alphabet) for _ in range(length))


def _audit(event_type: str, user_id=None, payload=None):
    db.session.add(
        AuthAuditLog(
            user_id=user_id,
            event_type=event_type,
            ip_address=request.headers.get("X-Forwarded-For", request.remote_addr),
            user_agent=request.headers.get("User-Agent", ""),
            payload=payload or {},
        )
    )


@admin_bp.get("/metrics")
def metrics():
    if not _ensure_admin():
        return jsonify({"error": "Forbidden"}), 403

    rows = {
        "users": db.session.execute(text("select count(*) from app_core.users")).scalar(),
        "access_requests": db.session.execute(text("select count(*) from app_core.access_requests")).scalar(),
        "auth_audit_events": db.session.execute(text("select count(*) from app_core.auth_audit_logs")).scalar(),
        "documents": db.session.execute(text("select count(*) from app_core.documents")).scalar(),
        "chunks": db.session.execute(text("select count(*) from rag_core.document_chunks")).scalar(),
        "embeddings": db.session.execute(text("select count(*) from rag_core.embeddings")).scalar(),
    }
    return jsonify(rows)


@admin_bp.get("/users")
def list_users():
    if not _ensure_admin():
        return jsonify({"error": "Forbidden"}), 403

    users = User.query.order_by(User.created_at.desc()).all()
    rows = [
        {
            "id": u.id,
            "username": u.username,
            "role": u.role,
            "is_active": bool(u.is_active),
            "failed_login_count": int(u.failed_login_count or 0),
            "force_password_change": bool(u.force_password_change),
            "created_at": u.created_at.isoformat() if u.created_at else None,
        }
        for u in users
    ]
    return jsonify({"ok": True, "users": rows})


@admin_bp.post("/users")
def create_user():
    if not _ensure_admin():
        return jsonify({"error": "Forbidden"}), 403

    data = request.get_json(force=True) or {}
    username = (data.get("username") or "").strip()
    password = data.get("password") or _random_password(6)
    role = (data.get("role") or "user").strip().lower()

    if not username:
        return jsonify({"error": "Username is required"}), 400

    if role not in {"user", "admin"}:
        return jsonify({"error": "Invalid role"}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({"error": "Username already exists"}), 409

    user = User(username=username, role=role, is_active=True)
    user.set_password(password)
    if role == "user":
        user.force_password_change = True
    db.session.add(user)
    db.session.flush()
    _audit("admin_user_created", user_id=session.get("user_id"), payload={"target_user_id": user.id, "role": role})
    db.session.commit()

    return jsonify({
        "ok": True,
        "user": {
            "id": user.id,
            "username": user.username,
            "role": user.role,
            "is_active": bool(user.is_active),
            "force_password_change": bool(user.force_password_change),
        },
        "credential": {
            "username": user.username,
            "temporary_password": password,
            "must_change_password": bool(user.force_password_change),
        },
    })


@admin_bp.post("/users/reset-password")
def reset_user_password():
    if not _ensure_admin():
        return jsonify({"error": "Forbidden"}), 403

    data = request.get_json(force=True) or {}
    username = (data.get("username") or "").strip()
    if not username:
        return jsonify({"error": "Username is required"}), 400

    user = User.query.filter_by(username=username, is_active=True).first()
    if not user:
        return jsonify({"error": "User not found"}), 404

    temp_password = _random_password(6)
    user.set_password(temp_password)
    user.force_password_change = True
    user.failed_login_count = 0
    user.locked_until = None

    _audit(
        "admin_user_password_reset",
        user_id=session.get("user_id"),
        payload={"target_user_id": user.id, "username": user.username},
    )
    db.session.commit()

    return jsonify({
        "ok": True,
        "credential": {
            "username": user.username,
            "temporary_password": temp_password,
            "must_change_password": True,
        },
    })


@admin_bp.get("/access-requests")
def access_requests():
    if not _ensure_admin():
        return jsonify({"error": "Forbidden"}), 403

    status = (request.args.get("status") or "pending").strip().lower()
    q = AccessRequest.query
    if status in {"pending", "approved", "rejected"}:
        q = q.filter_by(status=status)
    rows = q.order_by(AccessRequest.created_at.desc()).limit(200).all()

    return jsonify({"ok": True, "requests": [r.as_dict() for r in rows]})


@admin_bp.post("/access-requests/<int:request_id>/approve")
def approve_access_request(request_id: int):
    if not _ensure_admin():
        return jsonify({"error": "Forbidden"}), 403

    req = db.session.get(AccessRequest, request_id)
    if not req:
        return jsonify({"error": "Request not found"}), 404
    if req.status != "pending":
        return jsonify({"error": "Request already processed"}), 400

    data = request.get_json(force=True) or {}
    username = (data.get("username") or "").strip()
    role = (data.get("role") or "user").strip().lower()
    notes = (data.get("notes") or "").strip()
    temp_password = data.get("temp_password") or _random_password(6)

    if role not in {"user", "admin"}:
        return jsonify({"error": "Invalid role"}), 400

    if not username:
        email_head = (req.email.split("@")[0] if req.email else "user").lower()
        email_head = "".join(ch for ch in email_head if ch.isalnum() or ch in {"_", "."})[:20] or "user"
        candidate = email_head
        suffix = 1
        while User.query.filter_by(username=candidate).first():
            suffix += 1
            candidate = f"{email_head}{suffix}"
        username = candidate

    if User.query.filter_by(username=username).first():
        return jsonify({"error": "Username already exists"}), 409

    user = User(username=username, role=role, is_active=True)
    user.set_password(temp_password)
    user.force_password_change = True
    db.session.add(user)
    db.session.flush()

    req.status = "approved"
    req.reviewed_by_user_id = session.get("user_id")
    req.reviewed_at = datetime.utcnow()
    req.decision_notes = notes or None
    req.issued_username = username

    _audit(
        "access_request_approved",
        user_id=session.get("user_id"),
        payload={"request_id": req.id, "issued_username": username, "role": role},
    )

    db.session.commit()

    return jsonify({
        "ok": True,
        "credential": {
            "username": username,
            "temporary_password": temp_password,
            "must_change_password": True,
        },
    })


@admin_bp.post("/access-requests/<int:request_id>/reject")
def reject_access_request(request_id: int):
    if not _ensure_admin():
        return jsonify({"error": "Forbidden"}), 403

    req = db.session.get(AccessRequest, request_id)
    if not req:
        return jsonify({"error": "Request not found"}), 404
    if req.status != "pending":
        return jsonify({"error": "Request already processed"}), 400

    data = request.get_json(force=True) or {}
    notes = (data.get("notes") or "").strip()

    req.status = "rejected"
    req.reviewed_by_user_id = session.get("user_id")
    req.reviewed_at = datetime.utcnow()
    req.decision_notes = notes or None

    _audit(
        "access_request_rejected",
        user_id=session.get("user_id"),
        payload={"request_id": req.id, "notes": notes},
    )
    db.session.commit()

    return jsonify({"ok": True})


@admin_bp.get("/auth-audit")
def auth_audit_logs():
    if not _ensure_admin():
        return jsonify({"error": "Forbidden"}), 403

    rows = (
        AuthAuditLog.query.order_by(AuthAuditLog.created_at.desc())
        .limit(200)
        .all()
    )

    return jsonify({
        "ok": True,
        "events": [
            {
                "id": r.id,
                "user_id": r.user_id,
                "event_type": r.event_type,
                "ip_address": r.ip_address,
                "user_agent": r.user_agent,
                "payload": r.payload,
                "created_at": r.created_at.isoformat() if r.created_at else None,
            }
            for r in rows
        ],
    })
