import random
import string
from datetime import datetime, timedelta, timezone

OTP_EXPIRY_MINUTES = 10

def generate_otp() -> str:
    return "".join(random.choices(string.digits, k=6))

def otp_expiry() -> datetime:
    return datetime.now(timezone.utc) + timedelta(minutes=OTP_EXPIRY_MINUTES)

def is_otp_expired(expires_at: datetime) -> bool:
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    return datetime.now(timezone.utc) > expires_at
