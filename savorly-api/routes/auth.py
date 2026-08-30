import os
import re

from flask import Blueprint, jsonify, request
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token as google_id_token

from extensions import db
from models import OtpCode, User
from utils.email_service import send_otp_email
from utils.sms_service import send_otp as send_phone_otp_delivery

auth_bp = Blueprint("auth", __name__)
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")


def issue_token(user):
    return create_access_token(identity=str(user.id), additional_claims={"role": user.role})


def auth_response(user, status=200):
    return jsonify({"token": issue_token(user), "user": user.to_dict()}), status


def normalized_email(value):
    return (value or "").strip().lower()


def normalized_indian_phone(value):
    """Return a 10-digit Indian mobile number, or None when invalid."""
    phone = re.sub(r"[\s().-]", "", str(value or ""))
    if phone.startswith("+91"):
        phone = phone[3:]
    elif phone.startswith("91") and len(phone) == 12:
        phone = phone[2:]
    return phone if re.fullmatch(r"[6-9]\d{9}", phone) else None


@auth_bp.route("/send-otp", methods=["POST"])
def send_otp():
    email = normalized_email((request.get_json(silent=True) or {}).get("email"))
    if not re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]+", email):
        return jsonify({"error": "Enter a valid email address"}), 400
    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email already registered"}), 409

    code = OtpCode.generate(email, purpose="register")
    try:
        send_otp_email(email, code)
    except Exception:
        db.session.rollback()
        return jsonify({"error": "Could not send verification email. Please try again."}), 502
    return jsonify({"message": "Verification code sent"})


@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json(silent=True) or {}
    name = (data.get("name") or "").strip()
    email = normalized_email(data.get("email"))
    password = data.get("password") or ""
    otp = (data.get("otp") or "").strip()
    phone = (data.get("phone") or "").strip() or None

    if not name or not email or len(password) < 8 or not re.fullmatch(r"\d{6}", otp):
        return jsonify({"error": "Name, valid email, 8-character password, and verification code are required"}), 400
    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email already registered"}), 409
    if phone and User.query.filter_by(phone=phone).first():
        return jsonify({"error": "Phone number already registered"}), 409
    if not OtpCode.verify(email, "register", otp):
        return jsonify({"error": "Invalid or expired verification code"}), 400

    user = User(name=name, email=email, phone=phone, auth_provider="password", is_verified=True)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()
    return auth_response(user, 201)


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json(silent=True) or {}
    user = User.query.filter_by(email=normalized_email(data.get("email"))).first()
    if not user or not user.check_password(data.get("password") or ""):
        return jsonify({"error": "Invalid credentials"}), 401
    return auth_response(user)


@auth_bp.route("/forgot-password", methods=["POST"])
def forgot_password():
    email = normalized_email((request.get_json(silent=True) or {}).get("email"))
    if not re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]+", email):
        return jsonify({"error": "Enter a valid email address"}), 400

    user = User.query.filter_by(email=email).first()
    # Keep this response identical when an account does not exist to avoid
    # exposing which email addresses are registered.
    if not user:
        return jsonify({"message": "If that email has an account, a reset code has been sent."})

    code = OtpCode.generate(email, purpose="password_reset")
    try:
        send_otp_email(email, code, purpose="password reset")
    except Exception:
        db.session.rollback()
        return jsonify({"error": "Could not send the reset code. Please try again."}), 502
    return jsonify({"message": "If that email has an account, a reset code has been sent."})


@auth_bp.route("/reset-password", methods=["POST"])
def reset_password():
    data = request.get_json(silent=True) or {}
    email = normalized_email(data.get("email"))
    otp = (data.get("otp") or "").strip()
    password = data.get("password") or ""

    if not re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]+", email) or len(password) < 8:
        return jsonify({"error": "Enter a valid email address and a password of at least 8 characters"}), 400
    if not re.fullmatch(r"\d{6}", otp):
        return jsonify({"error": "Enter the 6-digit reset code"}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not OtpCode.verify(email, "password_reset", otp):
        return jsonify({"error": "Invalid or expired reset code"}), 400

    user.set_password(password)
    db.session.commit()
    return jsonify({"message": "Password updated. You can now log in."})


@auth_bp.route("/google", methods=["POST"])
def google_login():
    credential = (request.get_json(silent=True) or {}).get("credential")
    if not GOOGLE_CLIENT_ID:
        return jsonify({"error": "Google sign-in is not configured"}), 503
    try:
        info = google_id_token.verify_oauth2_token(credential, google_requests.Request(), GOOGLE_CLIENT_ID)
    except (ValueError, TypeError):
        return jsonify({"error": "Invalid Google token"}), 401

    if not info.get("email_verified"):
        return jsonify({"error": "Google email is not verified"}), 401
    email = normalized_email(info.get("email"))
    user = User.query.filter_by(email=email).first()
    if not user:
        user = User(name=(info.get("name") or email.split("@")[0])[:120], email=email,
                    auth_provider="google", is_verified=True)
        db.session.add(user)
        db.session.commit()
    return auth_response(user)


@auth_bp.route("/send-phone-otp", methods=["POST"])
def send_phone_otp():
    data = request.get_json(silent=True) or {}
    phone = normalized_indian_phone(data.get("phone"))
    channel = data.get("channel", "sms")
    print(f"DEBUG - phone OTP request: channel={channel!r}, phone ending={phone[-4:] if phone else 'invalid'}")
    if not phone:
        return jsonify({"error": "Enter a valid 10-digit Indian mobile number"}), 400
    if channel not in ("sms", "voice"):
        return jsonify({"error": "Invalid OTP delivery method"}), 400

    code = OtpCode.generate(phone, purpose="phone_login")
    try:
        send_phone_otp_delivery(phone, code, channel=channel)
    except Exception as error:
        print(f"OTP SEND ERROR ({channel}): {error}")
        return jsonify({"error": f"Could not send OTP: {error}"}), 502
    return jsonify({"message": f"OTP sent via {channel}"})


@auth_bp.route("/verify-phone-otp", methods=["POST"])
def verify_phone_otp():
    data = request.get_json(silent=True) or {}
    phone = normalized_indian_phone(data.get("phone"))
    otp = (data.get("otp") or "").strip()
    if not phone:
        return jsonify({"error": "Enter a valid 10-digit Indian mobile number"}), 400
    if not re.fullmatch(r"\d{6}", otp) or not OtpCode.verify(phone, "phone_login", otp):
        return jsonify({"error": "Invalid or expired OTP"}), 400

    user = User.query.filter_by(phone=phone).first()
    if not user:
        user = User(name=f"Savorly user {phone[-4:]}", phone=phone,
                    auth_provider="phone", is_verified=True)
        db.session.add(user)
        db.session.commit()
    return auth_response(user)


@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def me():
    user = db.session.get(User, int(get_jwt_identity()))
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify(user.to_dict())
