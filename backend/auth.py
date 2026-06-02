import os
import asyncio
import logging
import secrets
import bcrypt
import jwt
import resend
from datetime import datetime, timezone, timedelta
from typing import Optional
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, EmailStr, Field
from bson import ObjectId

from database import db

logger = logging.getLogger(__name__)

resend.api_key = os.environ.get("RESEND_API_KEY")
RESET_SENDER = os.environ.get("SENDER_EMAIL", "onboarding@resend.dev")

JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_MINUTES = 60 * 12  # 12 hours


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
    except Exception:
        return False


def create_access_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_MINUTES),
        "type": "access",
    }
    return jwt.encode(payload, os.environ["JWT_SECRET"], algorithm=JWT_ALGORITHM)


async def get_current_user(request: Request) -> dict:
    auth_header = request.headers.get("Authorization", "")
    token = auth_header[7:] if auth_header.startswith("Bearer ") else None
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, os.environ["JWT_SECRET"], algorithms=[JWT_ALGORITHM])
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user = await db.users.find_one({"_id": ObjectId(payload["sub"])})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        user["_id"] = str(user["_id"])
        user.pop("password_hash", None)
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


router = APIRouter(prefix="/api/auth", tags=["auth"])


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


def _public_user(user: dict) -> dict:
    return {
        "id": str(user.get("_id")),
        "email": user.get("email"),
        "name": user.get("name"),
        "role": user.get("role"),
    }


@router.post("/login")
async def login(payload: LoginRequest):
    email = payload.email.lower().strip()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token(str(user["_id"]), email)
    return {"token": token, "user": _public_user(user)}


@router.get("/me")
async def me(request: Request):
    user = await get_current_user(request)
    return {"id": user["_id"], "email": user["email"], "name": user.get("name"), "role": user.get("role")}


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(min_length=8, max_length=128)


@router.post("/change-password")
async def change_password(payload: ChangePasswordRequest, request: Request):
    user = await get_current_user(request)
    db_user = await db.users.find_one({"_id": ObjectId(user["_id"])})
    if not db_user or not verify_password(payload.current_password, db_user["password_hash"]):
        raise HTTPException(status_code=400, detail="Current password is incorrect.")
    if payload.current_password == payload.new_password:
        raise HTTPException(status_code=400, detail="New password must be different from the current password.")
    await db.users.update_one(
        {"_id": db_user["_id"]},
        {"$set": {"password_hash": hash_password(payload.new_password), "password_changed": True}},
    )
    return {"status": "success", "message": "Password updated successfully."}


class ForgotPasswordRequest(BaseModel):
    email: EmailStr
    base_url: Optional[str] = None


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(min_length=8, max_length=128)


@router.post("/forgot-password")
async def forgot_password(payload: ForgotPasswordRequest):
    email = payload.email.lower().strip()
    generic = {"status": "success", "message": "If an account exists for that email, a reset link has been sent."}
    user = await db.users.find_one({"email": email})
    if not user:
        return generic

    token = secrets.token_urlsafe(32)
    await db.password_reset_tokens.insert_one({
        "token": token,
        "email": email,
        "used": False,
        "expires_at": datetime.now(timezone.utc) + timedelta(hours=1),
        "created_at": datetime.now(timezone.utc),
    })

    base = (payload.base_url or "").rstrip("/")
    if not base.startswith("http"):
        base = ""
    reset_link = f"{base}/reset-password?token={token}"
    logger.info(f"[password-reset] reset link for {email}: {reset_link}")

    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; background:#F9F8F6; color:#1A1A1A;">
      <h2 style="color:#2D4A32; margin:0 0 12px 0;">Reset your password</h2>
      <p style="font-size:14px; line-height:1.6;">We received a request to reset your Green-Haus dashboard password. This link expires in 1 hour.</p>
      <p style="margin:24px 0;"><a href="{reset_link}" style="background:#2D4A32; color:#fff; padding:12px 22px; text-decoration:none; font-size:14px;">Reset password</a></p>
      <p style="font-size:12px; color:#595959;">If you didn't request this, you can safely ignore this email. Or copy this link: {reset_link}</p>
    </div>
    """
    try:
        await asyncio.to_thread(resend.Emails.send, {
            "from": RESET_SENDER,
            "to": [email],
            "subject": "Reset your Green-Haus dashboard password",
            "html": html,
        })
    except Exception as e:
        logger.error(f"Password reset email failed: {e}")
    return generic


@router.post("/reset-password")
async def reset_password(payload: ResetPasswordRequest):
    doc = await db.password_reset_tokens.find_one({"token": payload.token})
    if not doc or doc.get("used"):
        raise HTTPException(status_code=400, detail="Invalid or already-used reset link.")
    expires = doc["expires_at"]
    if expires.tzinfo is None:
        expires = expires.replace(tzinfo=timezone.utc)
    if expires < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="This reset link has expired. Please request a new one.")
    await db.users.update_one(
        {"email": doc["email"]},
        {"$set": {"password_hash": hash_password(payload.new_password), "password_changed": True}},
    )
    await db.password_reset_tokens.update_one({"_id": doc["_id"]}, {"$set": {"used": True}})
    return {"status": "success", "message": "Password reset successfully. You can now sign in."}


async def seed_admin():
    email = os.environ.get("ADMIN_EMAIL", "").lower().strip()
    password = os.environ.get("ADMIN_PASSWORD", "")
    if not email or not password:
        return
    existing = await db.users.find_one({"email": email})
    if existing is None:
        await db.users.insert_one({
            "email": email,
            "password_hash": hash_password(password),
            "name": "Editor",
            "role": "editor",
            "created_at": datetime.now(timezone.utc).isoformat(),
        })
    elif not existing.get("password_changed") and not verify_password(password, existing["password_hash"]):
        # Only re-sync from env if the editor has NOT set their own password via the dashboard.
        await db.users.update_one({"email": email}, {"$set": {"password_hash": hash_password(password)}})
