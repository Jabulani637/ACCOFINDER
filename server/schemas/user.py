from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UserRegister(BaseModel):
    first_name: str
    last_name:  str
    email:      EmailStr
    password:   str
    phone:      Optional[str] = None
    role:       Optional[str] = "student"
    gender:     Optional[str] = "unspecified"
    city:       Optional[str] = None

class UserLogin(BaseModel):
    email:    EmailStr
    password: str

class UserOut(BaseModel):
    id:         int
    first_name: str
    last_name:  str
    email:      str
    phone:      Optional[str]
    role:       str
    gender:     str
    city:       Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

class TokenOut(BaseModel):
    access_token: str
    token_type:   str = "bearer"
    user:         UserOut
