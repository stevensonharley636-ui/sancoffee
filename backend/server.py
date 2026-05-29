from fastapi import FastAPI, APIRouter, HTTPException
from starlette.middleware.cors import CORSMiddleware
import os
import asyncio
import logging
import resend
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import Optional
import uuid
from datetime import datetime, timezone

from database import db, client
import auth
import cms

# Resend setup
resend.api_key = os.environ.get('RESEND_API_KEY')
SENDER_EMAIL = os.environ.get('SENDER_EMAIL', 'onboarding@resend.dev')
RECIPIENT_EMAIL = os.environ.get('RECIPIENT_EMAIL', 'nsabemungu@gmail.com')

# Create the main app
app = FastAPI(title="Green-Haus API")
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


# ------------------- Models -------------------
class ContactRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")
    name: str = Field(min_length=1, max_length=120)
    email: EmailStr
    message: str = Field(min_length=1, max_length=4000)


class QuoteRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")
    name: str = Field(min_length=1, max_length=120)
    email: EmailStr
    product_name: str = Field(min_length=1, max_length=200)
    quantity: Optional[str] = Field(default=None, max_length=120)
    message: Optional[str] = Field(default=None, max_length=4000)


# ------------------- Helpers -------------------
async def send_resend_email(subject: str, html: str, reply_to: Optional[str] = None) -> dict:
    params = {
        "from": SENDER_EMAIL,
        "to": [RECIPIENT_EMAIL],
        "subject": subject,
        "html": html,
    }
    if reply_to:
        params["reply_to"] = reply_to
    try:
        email = await asyncio.to_thread(resend.Emails.send, params)
        return email if isinstance(email, dict) else {"id": getattr(email, "id", None)}
    except Exception as e:
        logger.error(f"Resend send failed: {e}")
        raise


def _escape(text: str) -> str:
    return (
        (text or "")
        .replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace("\n", "<br/>")
    )


# ------------------- Routes -------------------
@api_router.get("/")
async def root():
    return {"message": "Green-Haus API is running"}


@api_router.get("/health")
async def health():
    return {"status": "ok", "time": datetime.now(timezone.utc).isoformat()}


@api_router.post("/contact")
async def submit_contact(payload: ContactRequest):
    record = {
        "id": str(uuid.uuid4()),
        "type": "contact",
        "name": payload.name,
        "email": payload.email,
        "message": payload.message,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.inquiries.insert_one(record)

    subject = f"[Green-Haus] New contact message from {payload.name}"
    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background:#F9F8F6; color:#1A1A1A;">
      <h2 style="color:#2D4A32; margin:0 0 16px 0;">New Contact Inquiry</h2>
      <table cellpadding="6" cellspacing="0" style="border-collapse:collapse; width:100%; font-size:14px;">
        <tr><td style="font-weight:bold; width:120px;">Name</td><td>{_escape(payload.name)}</td></tr>
        <tr><td style="font-weight:bold;">Email</td><td>{_escape(payload.email)}</td></tr>
      </table>
      <h3 style="color:#2D4A32; margin:24px 0 8px 0;">Message</h3>
      <div style="background:#FFFFFF; border:1px solid #E5E1DA; padding:16px; font-size:14px; line-height:1.6;">
        {_escape(payload.message)}
      </div>
      <p style="margin-top:24px; font-size:12px; color:#595959;">Sent via Green-Haus landing page.</p>
    </div>
    """
    try:
        result = await send_resend_email(subject, html, reply_to=payload.email)
        await db.inquiries.update_one({"id": record["id"]}, {"$set": {"email_id": result.get("id"), "email_status": "sent"}})
        return {"status": "success", "message": "Your message has been sent. We'll be in touch soon."}
    except Exception as e:
        await db.inquiries.update_one({"id": record["id"]}, {"$set": {"email_status": "failed", "email_error": str(e)}})
        # Inquiry is safely stored in DB even if email delivery fails — don't block the user.
        return {"status": "received", "message": "Thanks — your message has been received. We'll be in touch soon."}


@api_router.post("/quote")
async def submit_quote(payload: QuoteRequest):
    record = {
        "id": str(uuid.uuid4()),
        "type": "quote",
        "name": payload.name,
        "email": payload.email,
        "product_name": payload.product_name,
        "quantity": payload.quantity,
        "message": payload.message,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.inquiries.insert_one(record)

    subject = f"[Green-Haus] Quote request: {payload.product_name}"
    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background:#F9F8F6; color:#1A1A1A;">
      <h2 style="color:#2D4A32; margin:0 0 16px 0;">New Quote Request</h2>
      <table cellpadding="6" cellspacing="0" style="border-collapse:collapse; width:100%; font-size:14px;">
        <tr><td style="font-weight:bold; width:140px;">Product</td><td>{_escape(payload.product_name)}</td></tr>
        <tr><td style="font-weight:bold;">Name</td><td>{_escape(payload.name)}</td></tr>
        <tr><td style="font-weight:bold;">Email</td><td>{_escape(payload.email)}</td></tr>
        <tr><td style="font-weight:bold;">Quantity</td><td>{_escape(payload.quantity or '—')}</td></tr>
      </table>
      <h3 style="color:#2D4A32; margin:24px 0 8px 0;">Notes</h3>
      <div style="background:#FFFFFF; border:1px solid #E5E1DA; padding:16px; font-size:14px; line-height:1.6;">
        {_escape(payload.message or '—')}
      </div>
      <p style="margin-top:24px; font-size:12px; color:#595959;">Sent via Green-Haus landing page.</p>
    </div>
    """
    try:
        result = await send_resend_email(subject, html, reply_to=payload.email)
        await db.inquiries.update_one({"id": record["id"]}, {"$set": {"email_id": result.get("id"), "email_status": "sent"}})
        return {"status": "success", "message": "Your quote request has been received. We'll respond within 1–2 business days."}
    except Exception as e:
        await db.inquiries.update_one({"id": record["id"]}, {"$set": {"email_status": "failed", "email_error": str(e)}})
        return {"status": "received", "message": "Thanks — your quote request has been received. We'll respond within 1–2 business days."}


# Include the routers
app.include_router(api_router)
app.include_router(auth.router)
app.include_router(cms.public_router)
app.include_router(cms.admin_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    await db.users.create_index("email", unique=True)
    await auth.seed_admin()
    await cms.seed_content_and_products()
    logger.info("Startup seeding complete.")


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
