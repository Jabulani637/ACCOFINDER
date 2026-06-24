# verification.py
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import secrets
import os
from dotenv import load_dotenv

load_dotenv()  # load environment variables from .env


# 1️⃣ Generate a verification token
def generate_verification_token():
    return secrets.token_urlsafe(32)




def send_password_reset_email(to_email, reset_link):
    sender_email = "shopingresidence@gmail.com"
    sender_password = os.getenv("EMAIL_APP_PASSWORD")

    msg = MIMEMultipart("alternative")
    msg["From"] = sender_email
    msg["To"] = to_email
    msg["Subject"] = "Reset your Shopping Residence password"

    html_body = f"""
    <html>
      <body style="font-family: Arial, sans-serif; background-color:#f9fafb; padding:20px;">
        <div style="max-width:600px; margin:auto; background:white; padding:20px; border-radius:8px;">

          <h2 style="color:#dc2626;">Password Reset Request 🔐</h2>

          <p>
            We received a request to reset your password.
            This link will expire in <strong>30 minutes</strong>.
          </p>

          <p style="text-align:center; margin:30px 0;">
            <a href="{reset_link}"
               style="display:inline-block;
                      padding:12px 24px;
                      background-color:#dc2626;
                      color:white;
                      text-decoration:none;
                      border-radius:6px;
                      font-weight:bold;">
              Reset Password
            </a>
          </p>

          <p>If the button does not work, use the link below:</p>

          <p style="word-break:break-all; color:#2563eb;">
            {reset_link}
          </p>

          <hr>

          <p style="font-size:14px; color:#555;">
            If you did not request this, you can safely ignore this email.<br><br>
            <strong>Shopping Residence Team</strong>
          </p>

        </div>
      </body>
    </html>
    """

    msg.attach(MIMEText(html_body, "html"))

    try:
        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.starttls()
        server.login(sender_email, sender_password)
        server.send_message(msg)
        server.quit()
        print("✅ Password reset email sent successfully")
    except Exception as e:
        print("❌ Email error:", e)