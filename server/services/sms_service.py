from twilio.rest import Client
import os
from dotenv import load_dotenv

load_dotenv()

TWILIO_SID   = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_FROM  = os.getenv("TWILIO_PHONE_NUMBER")

def send_otp_sms(to_phone: str, otp_code: str) -> bool:
    if not all([TWILIO_SID, TWILIO_TOKEN, TWILIO_FROM]):
        print("[SMS error] Twilio credentials not configured.")
        return False

    phone = to_phone if to_phone.startswith("+") else f"+{to_phone}"

    try:
        client = Client(TWILIO_SID, TWILIO_TOKEN)
        client.messages.create(
            to    = phone,
            from_ = TWILIO_FROM,
            body  = f"Your ACCOFINDER verification code is: {otp_code}\nExpires in 10 minutes. Do not share this code.",
        )
        return True
    except Exception as e:
        print(f"[SMS error] {e}")
        return False
