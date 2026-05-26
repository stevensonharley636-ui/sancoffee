"""Backend tests for Green-Haus API: health, contact, and quote endpoints."""
import os
import pytest
import requests
from pymongo import MongoClient
from dotenv import load_dotenv
from pathlib import Path

# Load backend .env for DB access
load_dotenv(Path(__file__).resolve().parents[1] / ".env")

BASE_URL = os.environ["REACT_APP_BACKEND_URL"].rstrip("/") if os.environ.get("REACT_APP_BACKEND_URL") else None
if not BASE_URL:
    # Fallback to frontend .env
    fe_env = Path("/app/frontend/.env")
    if fe_env.exists():
        for line in fe_env.read_text().splitlines():
            if line.startswith("REACT_APP_BACKEND_URL="):
                BASE_URL = line.split("=", 1)[1].strip().rstrip("/")
                break

MONGO_URL = os.environ["MONGO_URL"]
DB_NAME = os.environ["DB_NAME"]


@pytest.fixture(scope="module")
def db():
    client = MongoClient(MONGO_URL)
    yield client[DB_NAME]
    client.close()


@pytest.fixture(scope="module")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    yield s
    s.close()


# ---------- health & root ----------
class TestHealth:
    def test_root(self, session):
        r = session.get(f"{BASE_URL}/api/")
        assert r.status_code == 200
        body = r.json()
        assert "message" in body
        assert "Green-Haus" in body["message"]

    def test_health(self, session):
        r = session.get(f"{BASE_URL}/api/health")
        assert r.status_code == 200
        body = r.json()
        assert body.get("status") == "ok"
        assert "time" in body


# ---------- contact ----------
class TestContact:
    def test_contact_valid(self, session, db):
        payload = {
            "name": "TEST_Contact User",
            "email": "test_contact@example.com",
            "message": "TEST_Hello Green-Haus, this is an automated test inquiry.",
        }
        r = session.post(f"{BASE_URL}/api/contact", json=payload)
        assert r.status_code == 200, r.text
        body = r.json()
        assert body.get("status") in ("success", "received")
        assert "message" in body

        # Verify persisted in MongoDB
        doc = db.inquiries.find_one({"email": payload["email"], "type": "contact"}, sort=[("created_at", -1)])
        assert doc is not None, "Contact inquiry was not persisted in db.inquiries"
        assert doc["name"] == payload["name"]
        assert doc["message"] == payload["message"]
        assert doc["type"] == "contact"
        assert "id" in doc

        # cleanup
        db.inquiries.delete_one({"_id": doc["_id"]})

    def test_contact_missing_fields(self, session):
        r = session.post(f"{BASE_URL}/api/contact", json={"name": "Only Name"})
        assert r.status_code == 422

    def test_contact_invalid_email(self, session):
        r = session.post(f"{BASE_URL}/api/contact", json={
            "name": "TEST_User",
            "email": "not-an-email",
            "message": "hello",
        })
        assert r.status_code == 422

    def test_contact_empty_message(self, session):
        r = session.post(f"{BASE_URL}/api/contact", json={
            "name": "TEST_User",
            "email": "a@b.com",
            "message": "",
        })
        assert r.status_code == 422


# ---------- quote ----------
class TestQuote:
    def test_quote_valid_full(self, session, db):
        payload = {
            "name": "TEST_Quote User",
            "email": "test_quote@example.com",
            "product_name": "Rwanda Women's Cooperative Arabica",
            "quantity": "10 kg",
            "message": "TEST_We'd like wholesale pricing.",
        }
        r = session.post(f"{BASE_URL}/api/quote", json=payload)
        assert r.status_code == 200, r.text
        body = r.json()
        assert body.get("status") in ("success", "received")
        assert "message" in body

        doc = db.inquiries.find_one({"email": payload["email"], "type": "quote"}, sort=[("created_at", -1)])
        assert doc is not None
        assert doc["product_name"] == payload["product_name"]
        assert doc["quantity"] == "10 kg"
        assert doc["type"] == "quote"
        db.inquiries.delete_one({"_id": doc["_id"]})

    def test_quote_minimal(self, session, db):
        payload = {
            "name": "TEST_Quote Min",
            "email": "test_quote_min@example.com",
            "product_name": "Burundi Kayanza Arabica",
        }
        r = session.post(f"{BASE_URL}/api/quote", json=payload)
        assert r.status_code == 200
        doc = db.inquiries.find_one({"email": payload["email"], "type": "quote"}, sort=[("created_at", -1)])
        assert doc is not None
        assert doc["product_name"] == payload["product_name"]
        assert doc.get("quantity") is None
        db.inquiries.delete_one({"_id": doc["_id"]})

    def test_quote_missing_required(self, session):
        r = session.post(f"{BASE_URL}/api/quote", json={
            "name": "TEST_Q",
            "email": "a@b.com",
        })
        assert r.status_code == 422

    def test_quote_invalid_email(self, session):
        r = session.post(f"{BASE_URL}/api/quote", json={
            "name": "TEST_Q",
            "email": "bad-email",
            "product_name": "X",
        })
        assert r.status_code == 422
