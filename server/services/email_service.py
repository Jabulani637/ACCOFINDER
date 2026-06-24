import resend
import os
from dotenv import load_dotenv

load_dotenv()

resend.api_key = os.getenv("RESEND_API_KEY")
FROM_EMAIL     = os.getenv("FROM_EMAIL", "noreply@accofinder.com")

def send_otp_email(to_email: str, otp_code: str, first_name: str) -> bool:
    try:
        resend.Emails.send({
            "from": FROM_EMAIL,
            "to":   to_email,
            "subject": "Your ACCOFINDER verification code",
            "html": f"""
                <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;">
                    <h2 style="color:#1877f2;">ACCOFINDER</h2>
                    <p>Hi {first_name},</p>
                    <p>Here is your password reset verification code:</p>
                    <div style="
                        font-size:36px;font-weight:800;letter-spacing:12px;
                        color:#1877f2;background:#f0f2f5;border-radius:10px;
                        padding:20px;text-align:center;margin:24px 0;
                    ">{otp_code}</div>
                    <p style="color:#606770;font-size:13px;">
                        This code expires in <strong>10 minutes</strong>.<br>
                        If you did not request this, you can safely ignore this email.
                    </p>
                </div>
            """,
        })
        return True
    except Exception as e:
        print(f"[Email error] {e}")
        return False
