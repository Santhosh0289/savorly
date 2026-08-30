import os

import requests


BREVO_API_KEY = os.getenv("BREVO_API_KEY")
BREVO_SENDER_EMAIL = os.getenv("BREVO_SENDER_EMAIL")
BREVO_URL = "https://api.brevo.com/v3/smtp/email"


def send_otp_email(to_email, code, purpose="verification"):
    if not BREVO_API_KEY or not BREVO_SENDER_EMAIL:
        raise RuntimeError("BREVO_API_KEY and BREVO_SENDER_EMAIL must be configured")

    body = f"""
    <div style="font-family: sans-serif; max-width: 400px;">
      <h2 style="color: #5e8c1f;">Savorly</h2>
      <p>Your {purpose} code is:</p>
      <h1 style="letter-spacing: 6px;">{code}</h1>
      <p style="color: #666; font-size: 13px;">This code expires in 10 minutes. If you didn't request this, ignore this email.</p>
    </div>
    """
    response = requests.post(
        BREVO_URL,
        json={
            "sender": {"name": "Savorly", "email": BREVO_SENDER_EMAIL},
            "to": [{"email": to_email}],
            "subject": f"Your Savorly {purpose} code",
            "htmlContent": body,
        },
        headers={"api-key": BREVO_API_KEY},
        timeout=15,
    )
    if response.status_code >= 300:
        raise RuntimeError(f"Brevo error {response.status_code}: {response.text}")
    return response.json()
