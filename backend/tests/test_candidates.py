"""Backend API tests for HireMe candidates CRUD + auth + companies smoke."""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://backend.hiremejobs.co.in").rstrip("/")
ADMIN_EMAIL = "admin@hireme.in"
ADMIN_PASSWORD = "admin123"


@pytest.fixture(scope="session")
def token():
    r = requests.post(f"{BASE_URL}/api/auth/login",
                      json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=15)
    assert r.status_code == 200, f"Login failed: {r.status_code} {r.text}"
    data = r.json()
    assert "access_token" in data
    return data["access_token"]


@pytest.fixture(scope="session")
def auth_headers(token):
    return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}


# ---------- Auth ----------
class TestAuth:
    def test_login_ok(self, token):
        assert isinstance(token, str) and len(token) > 20

    def test_login_bad(self):
        r = requests.post(f"{BASE_URL}/api/auth/login",
                          json={"email": ADMIN_EMAIL, "password": "wrong"}, timeout=15)
        assert r.status_code == 401

    def test_me(self, auth_headers):
        r = requests.get(f"{BASE_URL}/api/auth/me", headers=auth_headers, timeout=15)
        assert r.status_code == 200
        assert r.json()["email"] == ADMIN_EMAIL


# ---------- Candidates CRUD ----------
class TestCandidates:
    created_id = None

    def test_list_requires_auth(self):
        r = requests.get(f"{BASE_URL}/api/candidates", timeout=15)
        assert r.status_code in (401, 403)

    def test_list_ok(self, auth_headers):
        r = requests.get(f"{BASE_URL}/api/candidates", headers=auth_headers, timeout=15)
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_create_missing_name(self, auth_headers):
        r = requests.post(f"{BASE_URL}/api/candidates",
                          headers=auth_headers, json={"email": "x@y.com"}, timeout=15)
        assert r.status_code == 400

    def test_create_full(self, auth_headers):
        payload = {
            "name": "TEST_Rahul Sharma",
            "email": "test_rahul@example.com",
            "phone": "9876543210",
            "experienceLevel": "Mid Level",
            "skills": ["Python", "React"],
            "languages": ["English", "Hindi"],
            "about": "<p>Senior engineer</p>",
            "status": "active",
            "featured": True,
        }
        r = requests.post(f"{BASE_URL}/api/candidates",
                          headers=auth_headers, json=payload, timeout=15)
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["name"] == "TEST_Rahul Sharma"
        assert d["email"] == "test_rahul@example.com"
        assert d["skills"] == ["Python", "React"]
        assert d["languages"] == ["English", "Hindi"]
        assert d["featured"] is True
        assert d["status"] == "active"
        assert "_id" not in d
        assert "id" in d
        TestCandidates.created_id = d["id"]

    def test_get_by_id(self, auth_headers):
        cid = TestCandidates.created_id
        assert cid
        r = requests.get(f"{BASE_URL}/api/candidates/{cid}", headers=auth_headers, timeout=15)
        assert r.status_code == 200
        d = r.json()
        assert d["id"] == cid
        assert d["skills"] == ["Python", "React"]
        assert "_id" not in d

    def test_update_persists(self, auth_headers):
        cid = TestCandidates.created_id
        r = requests.put(f"{BASE_URL}/api/candidates/{cid}",
                         headers=auth_headers,
                         json={"status": "pending", "featured": False,
                               "skills": ["Go"], "languages": ["English"]},
                         timeout=15)
        assert r.status_code == 200
        d = r.json()
        assert d["status"] == "pending"
        assert d["featured"] is False
        assert d["skills"] == ["Go"]
        # verify persistence via GET
        r2 = requests.get(f"{BASE_URL}/api/candidates/{cid}", headers=auth_headers, timeout=15)
        d2 = r2.json()
        assert d2["status"] == "pending"
        assert d2["skills"] == ["Go"]

    def test_delete_and_404(self, auth_headers):
        cid = TestCandidates.created_id
        r = requests.delete(f"{BASE_URL}/api/candidates/{cid}", headers=auth_headers, timeout=15)
        assert r.status_code == 200
        r2 = requests.get(f"{BASE_URL}/api/candidates/{cid}", headers=auth_headers, timeout=15)
        assert r2.status_code == 404

    def test_delete_nonexistent(self, auth_headers):
        r = requests.delete(f"{BASE_URL}/api/candidates/does-not-exist",
                            headers=auth_headers, timeout=15)
        assert r.status_code == 404


# ---------- Masters feeding candidate dropdowns ----------
class TestMastersForCandidateDropdowns:
    @pytest.mark.parametrize("path", [
        "experience-levels", "skills", "languages",
        "notice-periods", "education-categories", "states",
    ])
    def test_master_endpoint(self, auth_headers, path):
        r = requests.get(f"{BASE_URL}/api/{path}", headers=auth_headers, timeout=15)
        assert r.status_code == 200
        assert isinstance(r.json(), list)
