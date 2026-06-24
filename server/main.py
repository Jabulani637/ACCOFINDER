from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import Base, engine
from routes.auth import router as auth_router
from routes.users import router as users_router
from routes.password_reset import router as reset_router
from models.user import User  # noqa: F401
from models.otp import OTPCode  # noqa: F401


Base.metadata.create_all(bind=engine)

app = FastAPI(title="ACCOFINDER API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://accofinder.vercel.app",
        "http://localhost:5500",
        "http://127.0.0.1:5500",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/auth", tags=["Auth"])
app.include_router(users_router, prefix="/users", tags=["Users"])
app.include_router(reset_router, prefix="/auth", tags=["Password Reset"])

@app.get("/")
def root():
    return {"message": "ACCOFINDER API is running"}
