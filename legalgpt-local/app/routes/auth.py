from datetime import datetime, timedelta
import hashlib
import re
import secrets
import string

from flask import Blueprint, request, jsonify, session, current_app

from ..extensions import db
from ..models import User, AccessRequest, AuthAuditLog, PasswordResetToken

auth_bp = Blueprint("auth", __name__)

MAX_FAILED_LOGIN_ATTEMPTS = 5
LOCKOUT_MINUTES = 15
MIN_PASSWORD_LENGTH = 10
RESET_TOKEN_MINUTES = 30


def _random_password(length=10):
    alphabet = string.ascii_letters + string.digits
    return "".join(secrets.choice(alphabet) for _ in range(length))


def _invalid_login_response():
    # Generic error message avoids account-enumeration leaks.
    return jsonify({"error": "Invalid username or password"}), 401


def _is_valid_email(value: str) -> bool:
    return bool(re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", value))


def _record_failed_login(user: User):
    user.failed_login_count = int(user.failed_login_count or 0) + 1
    if user.failed_login_count >= MAX_FAILED_LOGIN_ATTEMPTS:
        user.locked_until = datetime.utcnow() + timedelta(minutes=LOCKOUT_MINUTES)
    db.session.commit()


def _audit(event_type: str, user_id=None, payload=None):
    row = AuthAuditLog(
        user_id=user_id,
        event_type=event_type,
        ip_address=request.headers.get("X-Forwarded-For", request.remote_addr),
        user_agent=request.headers.get("User-Agent", ""),
        payload=payload or {},
    )
    db.session.add(row)


@auth_bp.post("/login")
def login():
    data = request.get_json(force=True) or {}
    username = (data.get("username") or "").strip()
    password = data.get("password") or ""

    if not username or not password:
        db.session.rollback()
        _audit("login_failed", payload={"reason": "missing_fields", "username": username})
        db.session.commit()
        return _invalid_login_response()

    user = User.query.filter_by(username=username, is_active=True).first()
    if not user:
        db.session.rollback()
        _audit("login_failed", payload={"reason": "unknown_user", "username": username})
        db.session.commit()
        return _invalid_login_response()

    now = datetime.utcnow()
    if user.locked_until and user.locked_until > now:
        retry_after_seconds = int((user.locked_until - now).total_seconds())
        _audit("login_locked", user_id=user.id, payload={"retry_after": retry_after_seconds})
        db.session.commit()
        return jsonify({"error": "Too many failed login attempts. Try again later.", "retry_after": retry_after_seconds}), 429

    if not user.check_password(password):
        _record_failed_login(user)
        _audit("login_failed", user_id=user.id, payload={"reason": "invalid_password"})
        db.session.commit()
        return _invalid_login_response()

    user.failed_login_count = 0
    user.locked_until = None
    user.last_login_at = now
    _audit("login_success", user_id=user.id, payload={"role": user.role})
    db.session.commit()

    session["user_id"] = user.id
    session["role"] = user.role
    return jsonify({"ok": True, "role": user.role, "force_password_change": bool(user.force_password_change)})


@auth_bp.get("/session")
def session_status():
    uid = session.get("user_id")
    if not uid:
        return jsonify({"authenticated": False})
    user = db.session.get(User, uid)
    if not user or not user.is_active:
        session.clear()
        return jsonify({"authenticated": False})
    return jsonify({
        "authenticated": True,
        "user_id": user.id,
        "username": user.username,
        "role": user.role,
        "force_password_change": bool(user.force_password_change),
    })


@auth_bp.post("/logout")
def logout():
    uid = session.get("user_id")
    _audit("logout", user_id=uid)
    db.session.commit()
    session.clear()
    return jsonify({"ok": True})


@auth_bp.post("/bootstrap-admin")
def bootstrap_admin():
    data = request.get_json(force=True) or {}
    secret = (data.get("secret") or "").strip()
    if secret != "create-admin-once":
        return jsonify({"error": "Not allowed"}), 403

    if User.query.filter_by(role="admin").first():
        return jsonify({"error": "Admin already exists"}), 400

    user = User(username="admin", role="admin", is_active=True)
    user.set_password(data.get("password") or "admin123")
    user.force_password_change = True
    db.session.add(user)
    db.session.flush()
    _audit("bootstrap_admin", user_id=user.id)
    db.session.commit()
    return jsonify({"ok": True})


@auth_bp.post("/access-requests")
@auth_bp.post("/request-access")
def create_access_request():
    data = request.get_json(force=True) or {}
    full_name = (data.get("full_name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    organization = (data.get("organization") or "").strip()
    use_case = (data.get("use_case") or "").strip()

    if not full_name or not email:
        return jsonify({"error": "Full name and email are required"}), 400
    if not _is_valid_email(email):
        return jsonify({"error": "Please provide a valid email"}), 400

    duplicate = AccessRequest.query.filter_by(email=email, status="pending").first()
    if duplicate:
        return jsonify({"ok": True, "message": "Request already received. Admin review is in progress."})

    req = AccessRequest(
        full_name=full_name,
        email=email,
        organization=organization,
        use_case=use_case,
        status="pending",
    )

    try:
        db.session.add(req)
        db.session.flush()
        _audit("access_request_submitted", payload={"request_id": req.id, "email": req.email})
        db.session.commit()
    except Exception:
        db.session.rollback()
        return jsonify({"error": "Unable to submit request right now"}), 500

    return jsonify({"ok": True, "message": "Request submitted. Admin will share credentials after review."})


@auth_bp.post("/forgot-password")
def forgot_password():
    data = request.get_json(force=True) or {}
    username_or_email = (data.get("username_or_email") or "").strip().lower()

    if not username_or_email:
        return jsonify({"error": "Username is required"}), 400

    user = User.query.filter(
        User.is_active.is_(True),
        (User.username == username_or_email) | (User.username.ilike(username_or_email))
    ).first()

    # Fallback: try matching against access request email to map known username patterns.
    if not user and "@" in username_or_email:
        req = AccessRequest.query.filter_by(email=username_or_email, status="approved").order_by(AccessRequest.reviewed_at.desc()).first()
        if req and req.issued_username:
            user = User.query.filter_by(username=req.issued_username, is_active=True).first()

    if not user:
        _audit("forgot_password_requested", payload={"found": False})
        db.session.commit()
        return jsonify({"error": "User not found"}), 404

    temp_password = _random_password(10)
    user.set_password(temp_password)
    user.force_password_change = True
    user.failed_login_count = 0
    user.locked_until = None
    _audit("forgot_password_temp_issued", user_id=user.id, payload={"username": user.username})

    db.session.commit()
    return jsonify({
        "ok": True,
        "message": "Temporary password generated. Sign in and change it immediately.",
        "credential": {
            "username": user.username,
            "temporary_password": temp_password,
            "must_change_password": True,
        },
    })


@auth_bp.post("/reset-password")
def reset_password():
    data = request.get_json(force=True) or {}
    token = (data.get("token") or "").strip()
    new_password = data.get("new_password") or ""

    if not token:
        return jsonify({"error": "Reset token is required"}), 400
    if len(new_password) < MIN_PASSWORD_LENGTH:
        return jsonify({"error": f"New password must be at least {MIN_PASSWORD_LENGTH} characters"}), 400

    token_hash = hashlib.sha256(token.encode("utf-8")).hexdigest()
    prt = PasswordResetToken.query.filter_by(token_hash=token_hash).first()
    if not prt or prt.used_at is not None or prt.expires_at < datetime.utcnow():
        return jsonify({"error": "Invalid or expired reset token"}), 400

    user = db.session.get(User, prt.user_id)
    if not user or not user.is_active:
        return jsonify({"error": "Invalid reset request"}), 400

    user.set_password(new_password)
    user.force_password_change = False
    user.failed_login_count = 0
    user.locked_until = None
    prt.used_at = datetime.utcnow()
    _audit("password_reset_completed", user_id=user.id)
    db.session.commit()

    return jsonify({"ok": True})


@auth_bp.post("/change-password")
def change_password():
    user_id = session.get("user_id")
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.get_json(force=True) or {}
    current_password = data.get("current_password") or ""
    new_password = data.get("new_password") or ""

    if len(new_password) < MIN_PASSWORD_LENGTH:
        return jsonify({"error": f"New password must be at least {MIN_PASSWORD_LENGTH} characters"}), 400

    user = db.session.get(User, user_id)
    if not user or not user.check_password(current_password):
        _audit("password_change_failed", user_id=user_id, payload={"reason": "invalid_current_password"})
        db.session.commit()
        return jsonify({"error": "Current password is incorrect"}), 400

    user.set_password(new_password)
    user.force_password_change = False
    _audit("password_changed", user_id=user.id)
    db.session.commit()

    return jsonify({"ok": True})
