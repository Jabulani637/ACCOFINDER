from pydantic import BaseModel, EmailStr
from typing import Literal

class RequestOTP(BaseModel):
    email:   EmailStr
    channel: Literal["email", "sms"]

class VerifyOTP(BaseModel):
    email:   EmailStr
    code:    str
    channel: Literal["email", "sms"]

class ResetPassword(BaseModel):
    email:        EmailStr
    code:         str
    channel:      Literal["email", "sms"]
    new_password: str
