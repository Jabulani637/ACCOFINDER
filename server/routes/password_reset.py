from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.user import User
from models.otp import OTPCode
from schemas.otp import RequestOTP, VerifyOTP, ResetPassword
from core.otp_utils import generate_otp, otp_expiry, is_otp_expired
from core.security import hash_password
from services.email_service import send_otp_email
from services.sms_service import send_otp_sms

router = APIRouter()

@router.post("/request-otp")
def request_otp(body: RequestOTP, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email).first()
    if not user:
        return {"message": "If an account exists, a code has been sent."}

    if body.channel == "sms" and not user.phone:
        raise HTTPException(400, "No phone number on this account. Please use email instead.")

    db.query(OTPCode).filter(
        OTPCode.user_id == user.id,
        OTPCode.channel == body.channel,
        OTPCode.used    == False,
    ).delete()
    db.commit()

    code = generate_otp()
    db.add(OTPCode(user_id=user.id, code=code, channel=body.channel, expires_at=otp_expiry()))
    db.commit()

    sent = send_otp_email(user.email, code, user.first_name) if body.channel == "email" \
           else send_otp_sms(user.phone, code)

    if not sent:
        raise HTTPException(500, f"Failed to send OTP via {body.channel}. Please try again.")

    return {"message": "If an account exists, a code has been sent."}

@router.post("/verify-otp")
def verify_otp(body: VerifyOTP, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email).first()
    if not user:
        raise HTTPException(400, "Invalid code.")

    otp = db.query(OTPCode).filter(
        OTPCode.user_id == user.id,
        OTPCode.code    == body.code,
        OTPCode.channel == body.channel,
        OTPCode.used    == False,
    ).first()

    if not otp:
        raise HTTPException(400, "Invalid or already used code.")
    if is_otp_expired(otp.expires_at):
        raise HTTPException(400, "Code has expired. Please request a new one.")

    return {"message": "Code verified.", "valid": True}

@router.post("/reset-password")
def reset_password(body: ResetPassword, db: Session = Depends(get_db)):
    if len(body.new_password) < 6:
        raise HTTPException(400, "Password must be at least 6 characters.")

    user = db.query(User).filter(User.email == body.email).first()
    if not user:
        raise HTTPException(400, "Invalid code.")

    otp = db.query(OTPCode).filter(
        OTPCode.user_id == user.id,
        OTPCode.code    == body.code,
        OTPCode.channel == body.channel,
        OTPCode.used    == False,
    ).first()

    if not otp:
        raise HTTPException(400, "Invalid or already used code.")
    if is_otp_expired(otp.expires_at):
        raise HTTPException(400, "Code has expired. Please request a new one.")

    otp.used             = True
    user.hashed_password = hash_password(body.new_password)
    db.commit()

    return {"message": "Password reset successfully. You can now log in."}
