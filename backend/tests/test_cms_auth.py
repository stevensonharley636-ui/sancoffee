"""Backend tests for Green-Haus CMS + Auth: login, /me, content, products, admin CRUD."""
import os
import pytest
import requests
from pathlib import Path

# Determine BASE_URL from frontend/.env (matches what UI uses)
BASE_URL = None
fe_env = Path("/app/frontend/.env")
if fe_env.exists():
    for line in fe_env.read_text().splitlines():
        if line.startswith("REACT_APP_BACKEND_URL="):
            BASE_URL = line.split("=", 1)[1].strip().strip('"').rstrip("/")
            break
BASE_URL = BASE_URL or os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")

EDITOR_EMAIL = "nsabemungu@gmail.com"
EDITOR_PASSWORD = "ksDR1afJNKHSHI"


@pytest.fixture(scope="module")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    yield s
    s.close()


@pytest.fixture(scope="module")
def token(session):
    r = session.post(f"{BASE_URL}/api/auth/login",
                     json={"email": EDITOR_EMAIL, "password": EDITOR_PASSWORD})
    assert r.status_code == 200, f"Login failed: {r.status_code} {r.text}"
    data = r.json()
    assert "token" in data and isinstance(data["token"], str) and len(data["token"]) > 10
    assert data["user"]["email"] == EDITOR_EMAIL
    assert data["user"]["role"] == "editor"
    return data["token"]


@pytest.fixture(scope="module")
def auth_headers(token):
    return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}


# ---------- AUTH ----------
class TestAuth:
    def test_login_success(self, session):
        r = session.post(f"{BASE_URL}/api/auth/login",
                         json={"email": EDITOR_EMAIL, "password": EDITOR_PASSWORD})
        assert r.status_code == 200
        body = r.json()
        assert body["user"]["email"] == EDITOR_EMAIL
        assert body["user"]["role"] == "editor"
        assert "id" in body["user"]
        assert isinstance(body["token"], str)

    def test_login_wrong_password(self, session):
        r = session.post(f"{BASE_URL}/api/auth/login",
                         json={"email": EDITOR_EMAIL, "password": "wrong_password_xyz"})
        assert r.status_code == 401
        assert "detail" in r.json()

    def test_login_unknown_email(self, session):
        r = session.post(f"{BASE_URL}/api/auth/login",
                         json={"email": "noone@example.com", "password": "whatever"})
        assert r.status_code == 401

    def test_login_invalid_email_format(self, session):
        r = session.post(f"{BASE_URL}/api/auth/login",
                         json={"email": "not-an-email", "password": "x"})
        assert r.status_code == 422

    def test_me_with_token(self, session, auth_headers):
        r = session.get(f"{BASE_URL}/api/auth/me", headers=auth_headers)
        assert r.status_code == 200
        body = r.json()
        assert body["email"] == EDITOR_EMAIL
        assert body["role"] == "editor"
        assert "id" in body

    def test_me_without_token(self, session):
        r = requests.get(f"{BASE_URL}/api/auth/me")
        assert r.status_code == 401

    def test_me_with_bad_token(self, session):
        r = requests.get(f"{BASE_URL}/api/auth/me",
                         headers={"Authorization": "Bearer not.a.real.jwt"})
        assert r.status_code == 401


# ---------- PUBLIC CONTENT ----------
class TestPublicContent:
    def test_get_content_shape(self, session):
        r = session.get(f"{BASE_URL}/api/content")
        assert r.status_code == 200
        c = r.json()
        for key in ["settings", "navLinks", "categories", "hero", "about",
                    "products_section", "founder", "impact", "contact"]:
            assert key in c, f"missing {key}"
        assert isinstance(c["navLinks"], list) and len(c["navLinks"]) >= 1
        assert isinstance(c["categories"], list) and len(c["categories"]) >= 1
        assert c["contact"]["email"]
        assert c["settings"]["siteName"]

    def test_get_products_published_only(self, session):
        r = session.get(f"{BASE_URL}/api/products")
        assert r.status_code == 200
        items = r.json()
        assert isinstance(items, list)
        assert len(items) >= 1
        for p in items:
            assert "id" in p and "name" in p
            assert p.get("published", True) is True
            assert "_id" not in p


# ---------- ADMIN AUTH GUARDS ----------
class TestAdminAuthGuards:
    def test_admin_products_no_token(self, session):
        r = requests.get(f"{BASE_URL}/api/admin/products")
        assert r.status_code == 401

    def test_admin_content_no_token(self, session):
        r = requests.put(f"{BASE_URL}/api/admin/content", json={})
        assert r.status_code == 401

    def test_admin_products_with_token(self, session, auth_headers):
        r = session.get(f"{BASE_URL}/api/admin/products", headers=auth_headers)
        assert r.status_code == 200
        items = r.json()
        assert isinstance(items, list)
        # admin list returns all (>= public count)
        for p in items:
            assert "_id" not in p


# ---------- ADMIN PRODUCTS CRUD ----------
class TestAdminProductsCrud:
    created_id = None

    def test_create_product(self, session, auth_headers):
        payload = {
            "name": "TEST_Product Alpha",
            "origin": "Rwanda",
            "roast": "Light",
            "category": "Whole Bean",
            "notes": ["floral", "citrus"],
            "price": 17.5,
            "description": "TEST_test product description",
            "image": "https://example.com/img.jpg",
            "published": True,
        }
        r = session.post(f"{BASE_URL}/api/admin/products", json=payload, headers=auth_headers)
        assert r.status_code == 200, r.text
        body = r.json()
        assert body["name"] == "TEST_Product Alpha"
        assert body["price"] == 17.5
        assert body["published"] is True
        assert "id" in body
        assert "_id" not in body
        TestAdminProductsCrud.created_id = body["id"]

        # Verify appears in admin list
        lst = session.get(f"{BASE_URL}/api/admin/products", headers=auth_headers).json()
        assert any(p["id"] == body["id"] for p in lst)

        # Verify appears in public list (published=True)
        pub = session.get(f"{BASE_URL}/api/products").json()
        assert any(p["id"] == body["id"] for p in pub)

    def test_update_product(self, session, auth_headers):
        pid = TestAdminProductsCrud.created_id
        assert pid, "create test must run first"
        payload = {
            "name": "TEST_Product Alpha Updated",
            "origin": "Burundi",
            "roast": "Medium",
            "category": "Single Origin",
            "notes": ["chocolate"],
            "price": 21.0,
            "description": "TEST_updated",
            "image": "https://example.com/img.jpg",
            "published": True,
        }
        r = session.put(f"{BASE_URL}/api/admin/products/{pid}", json=payload, headers=auth_headers)
        assert r.status_code == 200, r.text
        body = r.json()
        assert body["name"] == "TEST_Product Alpha Updated"
        assert body["price"] == 21.0
        assert body["origin"] == "Burundi"

    def test_toggle_publish_hides_from_public(self, session, auth_headers):
        pid = TestAdminProductsCrud.created_id
        r = session.patch(f"{BASE_URL}/api/admin/products/{pid}/publish", headers=auth_headers)
        assert r.status_code == 200
        assert r.json()["published"] is False
        pub = session.get(f"{BASE_URL}/api/products").json()
        assert not any(p["id"] == pid for p in pub), "Unpublished product still in public list"
        # Toggle back to published
        r2 = session.patch(f"{BASE_URL}/api/admin/products/{pid}/publish", headers=auth_headers)
        assert r2.json()["published"] is True
        pub2 = session.get(f"{BASE_URL}/api/products").json()
        assert any(p["id"] == pid for p in pub2)

    def test_delete_product(self, session, auth_headers):
        pid = TestAdminProductsCrud.created_id
        r = session.delete(f"{BASE_URL}/api/admin/products/{pid}", headers=auth_headers)
        assert r.status_code == 200
        # Verify gone
        lst = session.get(f"{BASE_URL}/api/admin/products", headers=auth_headers).json()
        assert not any(p["id"] == pid for p in lst)
        # 2nd delete -> 404
        r2 = session.delete(f"{BASE_URL}/api/admin/products/{pid}", headers=auth_headers)
        assert r2.status_code == 404

    def test_update_nonexistent_product_404(self, session, auth_headers):
        r = session.put(f"{BASE_URL}/api/admin/products/nope-{os.getpid()}",
                        json={"name": "x"}, headers=auth_headers)
        assert r.status_code == 404


# ---------- ADMIN CONTENT SAVE ----------
class TestAdminContent:
    def test_update_content_and_persist(self, session, auth_headers):
        # Get current content
        current = session.get(f"{BASE_URL}/api/content").json()
        original_headline = current["hero"]["headline"]
        new_headline = "TEST_Headline " + str(os.getpid())
        current["hero"]["headline"] = new_headline

        r = session.put(f"{BASE_URL}/api/admin/content", json=current, headers=auth_headers)
        assert r.status_code == 200, r.text
        assert r.json().get("status") == "success"

        # Verify reflected in public GET
        updated = session.get(f"{BASE_URL}/api/content").json()
        assert updated["hero"]["headline"] == new_headline

        # Restore
        current["hero"]["headline"] = original_headline
        r2 = session.put(f"{BASE_URL}/api/admin/content", json=current, headers=auth_headers)
        assert r2.status_code == 200
        restored = session.get(f"{BASE_URL}/api/content").json()
        assert restored["hero"]["headline"] == original_headline


# ---------- REGRESSION (contact + quote) ----------
class TestRegression:
    def test_contact_still_works(self, session):
        r = session.post(f"{BASE_URL}/api/contact", json={
            "name": "TEST_Reg", "email": "regr@example.com",
            "message": "TEST_regression message"
        })
        assert r.status_code == 200
        assert r.json().get("status") in ("success", "received")

    def test_quote_still_works(self, session):
        r = session.post(f"{BASE_URL}/api/quote", json={
            "name": "TEST_Reg", "email": "regr@example.com",
            "product_name": "TEST_Product"
        })
        assert r.status_code == 200
        assert r.json().get("status") in ("success", "received")
