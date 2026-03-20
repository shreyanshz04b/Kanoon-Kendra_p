from flask import Blueprint, render_template, session, redirect, url_for

from ..extensions import db
from ..models import User

pages_bp = Blueprint("pages", __name__)


def _session_user():
    user_id = session.get("user_id")
    if not user_id:
        return None
    user = db.session.get(User, user_id)
    if not user or not user.is_active:
        session.clear()
        return None
    return user


def _require_user_or_redirect():
    user = _session_user()
    if not user:
        return None, redirect(url_for("pages.home_page"))
    return user, None


@pages_bp.get("/")
def home_page():
    user = _session_user()
    if user:
        return redirect(url_for("pages.dashboard_page"))
    return render_template("landing.html")


@pages_bp.get("/login")
def login_page():
    user = _session_user()
    if user:
        return redirect(url_for("pages.dashboard_page"))
    return render_template("login.html")


@pages_bp.get("/forgot-password")
def forgot_password_page():
    return render_template("forgot_password.html")


@pages_bp.get("/reset-password")
def reset_password_page():
    return render_template("reset_password.html")


@pages_bp.get("/contact")
def contact_page():
    user = _session_user()
    if user:
        return redirect(url_for("pages.dashboard_page"))
    return render_template("contact.html")


@pages_bp.get("/password-change")
def password_change_page():
    _, redirect_resp = _require_user_or_redirect()
    if redirect_resp:
        return redirect_resp
    return render_template("password_change.html")


@pages_bp.get("/dashboard")
def dashboard_page():
    _, redirect_resp = _require_user_or_redirect()
    if redirect_resp:
        return redirect_resp
    return render_template("dashboard.html")


@pages_bp.get("/upload")
def upload_page():
    _, redirect_resp = _require_user_or_redirect()
    if redirect_resp:
        return redirect_resp
    return render_template("upload.html")


@pages_bp.get("/chat")
def chat_page():
    _, redirect_resp = _require_user_or_redirect()
    if redirect_resp:
        return redirect_resp
    return render_template("chat.html")


@pages_bp.get("/admin")
def admin_page():
    user, redirect_resp = _require_user_or_redirect()
    if redirect_resp:
        return redirect_resp
    if user.role != "admin":
        return redirect(url_for("pages.dashboard_page"))
    return render_template("admin.html")


@pages_bp.get("/landing")
def landing_page():
    user = _session_user()
    if user:
        return redirect(url_for("pages.dashboard_page"))
    return render_template("landing.html")
