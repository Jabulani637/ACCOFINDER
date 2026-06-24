from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models.user import User
from schemas.user import UserRegister, UserLogin, TokenOut, UserOut
from core.security import hash_password, verify_password, create_access_token

router = APIRouter()

@router.post("/register", response_model=TokenOut, status_code=201)
def register(body: UserRegister, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == body.email).first():
        raise HTTPException(400, "An account with this email already exists.")

    if body.role not in {"student", "owner", "admin"}:
        raise HTTPException(400, "Invalid role.")

    user = User(
        first_name      = body.first_name,
        last_name       = body.last_name,
        email           = body.email,
        phone           = body.phone,
        hashed_password = hash_password(body.password),
        role            = body.role,
        gender          = body.gender,
        city            = body.city,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": user.id, "role": user.role})
    return TokenOut(access_token=token, user=UserOut.from_orm(user))

@router.post("/login", response_model=TokenOut)
def login(body: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == body.email).first()
    if not user or not verify_password(body.password, user.hashed_password):
        raise HTTPException(401, "Incorrect email or password.")

    token = create_access_token({"sub": user.id, "role": user.role})
    return TokenOut(access_token=token, user=UserOut.from_orm(user))
