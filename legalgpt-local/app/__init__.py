import os
from flask import Flask, request
from dotenv import load_dotenv
from sqlalchemy import text

from .config import Config
from .extensions import db
from .routes.auth import auth_bp
from .routes.upload import upload_bp
from .routes.chat import chat_bp
from .routes.admin import admin_bp
from .routes.ingest import ingest_bp
from .routes.pages import pages_bp


def _ensure_auth_workflow_schema(app):
    # Keeps auth flow operational for existing databases without a manual migration step.
    stmts = [
        "create schema if not exists app_core",
        "alter table app_core.users add column if not exists failed_login_count integer not null default 0",
        "alter table app_core.users add column if not exists locked_until timestamptz",
        "alter table app_core.users add column if not exists force_password_change boolean not null default false",
        "alter table app_core.users add column if not exists last_login_at timestamptz",
        """
        create table if not exists app_core.access_requests (
          id bigserial primary key,
          full_name varchar(160) not null,
          email varchar(255) not null,
          organization varchar(255),
          use_case text,
          status varchar(20) not null default 'pending',
          reviewed_by_user_id bigint references app_core.users(id),
          reviewed_at timestamptz,
          decision_notes text,
          issued_username varchar(80),
          created_at timestamptz not null default now(),
          updated_at timestamptz not null default now()
        )
        """,
                """
                create table if not exists app_core.auth_audit_logs (
                    id bigserial primary key,
                    user_id bigint references app_core.users(id),
                    event_type varchar(60) not null,
                    ip_address varchar(64),
                    user_agent text,
                    payload jsonb,
                    created_at timestamptz not null default now()
                )
                """,
                """
                create table if not exists app_core.password_reset_tokens (
                    id bigserial primary key,
                    user_id bigint not null references app_core.users(id),
                    token_hash varchar(128) not null unique,
                    expires_at timestamptz not null,
                    used_at timestamptz,
                    created_at timestamptz not null default now()
                )
                """,
    ]

    with app.app_context():
        for stmt in stmts:
            try:
                db.session.execute(text(stmt))
            except Exception:
                db.session.rollback()
        db.session.commit()


def create_app():
    load_dotenv()
    app = Flask(__name__)
    app.config.from_object(Config)

    os.makedirs(app.config["UPLOAD_FOLDER"], exist_ok=True)

    db.init_app(app)

    app.register_blueprint(pages_bp)
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(upload_bp, url_prefix="/api")
    app.register_blueprint(ingest_bp, url_prefix="/api")
    app.register_blueprint(chat_bp, url_prefix="/api")
    app.register_blueprint(admin_bp, url_prefix="/api/admin")

    @app.after_request
    def add_no_cache_headers(response):
        if not request.path.startswith("/static/"):
            response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0"
            response.headers["Pragma"] = "no-cache"
            response.headers["Expires"] = "0"
        return response

    _ensure_auth_workflow_schema(app)

    return app
