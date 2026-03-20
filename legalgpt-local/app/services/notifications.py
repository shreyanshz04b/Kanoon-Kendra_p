import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart


def _smtp_configured(cfg) -> bool:
    return bool(cfg.get("SMTP_HOST") and cfg.get("SMTP_FROM_EMAIL"))


def _send_email(cfg, *, to_email: str, subject: str, body: str):
    msg = MIMEMultipart()
    msg["From"] = cfg.get("SMTP_FROM_EMAIL")
    msg["To"] = to_email
    msg["Subject"] = subject
    msg.attach(MIMEText(body, "plain", "utf-8"))

    with smtplib.SMTP(cfg.get("SMTP_HOST"), int(cfg.get("SMTP_PORT", 587)), timeout=15) as server:
        if cfg.get("SMTP_USE_TLS", True):
            server.starttls()
        if cfg.get("SMTP_USERNAME"):
            server.login(cfg.get("SMTP_USERNAME"), cfg.get("SMTP_PASSWORD") or "")
        server.sendmail(cfg.get("SMTP_FROM_EMAIL"), [to_email], msg.as_string())


def send_access_request_decision_email(app, *, to_email: str, full_name: str, status: str, username: str = "", temporary_password: str = "", notes: str = ""):
    cfg = app.config
    if not _smtp_configured(cfg):
        return {"sent": False, "reason": "smtp_not_configured"}

    login_url = f"{cfg.get('APP_BASE_URL', 'http://127.0.0.1:5001')}/login"
    subject = "LegalGPT Access Request Update"

    if status == "approved":
        body = (
            f"Hello {full_name},\n\n"
            "Your LegalGPT access request has been approved.\n\n"
            f"Username: {username}\n"
            f"Temporary Password: {temporary_password}\n"
            f"Login URL: {login_url}\n\n"
            "Please sign in and change your password immediately.\n"
        )
    else:
        body = (
            f"Hello {full_name},\n\n"
            "Your LegalGPT access request has been reviewed and is currently not approved.\n"
        )

    if notes:
        body += f"\nAdmin Notes: {notes}\n"

    body += "\nRegards,\nLegalGPT Team\n"

    try:
        _send_email(cfg, to_email=to_email, subject=subject, body=body)
        return {"sent": True}
    except Exception as exc:
        return {"sent": False, "reason": str(exc)}


def send_password_reset_email(app, *, to_email: str, full_name: str, reset_url: str):
    cfg = app.config
    if not _smtp_configured(cfg):
        return {"sent": False, "reason": "smtp_not_configured"}

    subject = "LegalGPT Password Reset"
    body = (
        f"Hello {full_name or 'User'},\n\n"
        "A password reset was requested for your LegalGPT account.\n"
        f"Reset link: {reset_url}\n\n"
        "If you did not request this, you can ignore this email.\n"
        "This link expires in 30 minutes.\n\n"
        "Regards,\nLegalGPT Team\n"
    )

    try:
        _send_email(cfg, to_email=to_email, subject=subject, body=body)
        return {"sent": True}
    except Exception as exc:
        return {"sent": False, "reason": str(exc)}
