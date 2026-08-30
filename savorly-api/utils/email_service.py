import os
import smtplib
from email.mime.text import MIMEText


def send_otp_email(to_email, code):
    sender = os.getenv("SMTP_USER")
    password = os.getenv("SMTP_PASSWORD")
    if not sender or not password:
        raise RuntimeError("Email OTP is not configured")

    message = MIMEText(f"""
      <div style=\"font-family:Arial,sans-serif;max-width:400px\">
        <h2 style=\"color:#5e8c1f\">Savorly</h2>
        <p>Your verification code is:</p>
        <h1 style=\"letter-spacing:6px\">{code}</h1>
        <p style=\"color:#666;font-size:13px\">It expires in 10 minutes. If you did not request it, you can ignore this email.</p>
      </div>
    """, "html")
    message["Subject"] = "Your Savorly verification code"
    message["From"] = sender
    message["To"] = to_email

    with smtplib.SMTP(os.getenv("SMTP_HOST", "smtp.gmail.com"), int(os.getenv("SMTP_PORT", "587"))) as server:
        server.starttls()
        server.login(sender, password)
        server.sendmail(sender, [to_email], message.as_string())
