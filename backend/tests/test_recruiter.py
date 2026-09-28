"""Recruiter auth + public feeds tests"""
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://hire-admin.preview.emergentagent.com').rstrip('/')
API = f"{BASE_URL}/api"


@pytest.fixture(scope='module')
def admin_token():
    r = requests.post(f"{API}/auth/login", json={"email": "admin@hireme.in", "password": "admin123"})
    assert r.status_code == 200, r.text
    return r.json()["access_token"]


@pytest.fixture(scope='module')
def unique_email():
    return f"TEST_rec_{uuid.uuid4().hex[:10]}@example.com"


# ---------------- Public feeds (no auth) ----------------
class TestPublicFeeds:
    def test_industries(self):
        r = requests.get(f"{API}/public/industries")
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_states(self):
        r = requests.get(f"{API}/public/states")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        # note if empty
        if not data:
            pytest.skip("states master empty")

    def test_cities_filtered_gujarat(self):
        r = requests.get(f"{API}/public/cities", params={"state": "Gujarat"})
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        # verify filtering: every returned city has state=Gujarat
        for c in data:
            assert c.get("state") == "Gujarat"

    def test_sub_industries_has_industry_field(self):
        r = requests.get(f"{API}/public/sub-industries")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        for item in data:
            assert "industry" in item


# ---------------- Recruiter signup / login / me ----------------
class TestRecruiterAuth:
    def test_signup_creates_company_pending(self, unique_email):
        payload = {
            "accountType": "company",
            "companyName": "TEST Acme Co",
            "fullName": "Test User",
            "email": unique_email,
            "password": "pass1234",
            "mobile": "9999999999",
            "designation": "HR",
            "industry": "IT",
            "state": "Gujarat",
            "city": "Ahmedabad",
            "zipCode": "380001",
        }
        r = requests.post(f"{API}/recruiter/signup", json=payload)
        assert r.status_code == 200, r.text
        data = r.json()
        assert "access_token" in data
        assert isinstance(data["access_token"], str) and len(data["access_token"]) > 10
        company = data["company"]
        assert company["email"] == unique_email.lower()
        assert company["status"] == "pending"
        assert "password" not in company
        # store token via attr for later tests
        pytest.recruiter_token = data["access_token"]
        pytest.recruiter_company_id = company["id"]

    def test_signup_duplicate_email_409(self, unique_email):
        payload = {
            "accountType": "company",
            "companyName": "TEST Dup",
            "fullName": "Dup",
            "email": unique_email,
            "password": "pass1234",
            "mobile": "9999999999",
            "designation": "HR",
        }
        r = requests.post(f"{API}/recruiter/signup", json=payload)
        assert r.status_code == 409

    def test_login_success(self, unique_email):
        r = requests.post(f"{API}/recruiter/login", json={"email": unique_email, "password": "pass1234"})
        assert r.status_code == 200, r.text
        data = r.json()
        assert "access_token" in data
        assert "password" not in data["company"]

    def test_login_wrong_password_401(self, unique_email):
        r = requests.post(f"{API}/recruiter/login", json={"email": unique_email, "password": "WRONG"})
        assert r.status_code == 401

    def test_demo_recruiter_login(self):
        r = requests.post(f"{API}/recruiter/login", json={"email": "recruiter@acme.com", "password": "pass1234"})
        assert r.status_code == 200, r.text
        assert "access_token" in r.json()

    def test_me_returns_profile_no_password(self):
        token = getattr(pytest, "recruiter_token", None)
        assert token
        r = requests.get(f"{API}/recruiter/me", headers={"Authorization": f"Bearer {token}"})
        assert r.status_code == 200, r.text
        data = r.json()
        assert "password" not in data
        assert data["id"] == pytest.recruiter_company_id

    def test_me_rejects_admin_token(self, admin_token):
        r = requests.get(f"{API}/recruiter/me", headers={"Authorization": f"Bearer {admin_token}"})
        assert r.status_code == 401

    def test_me_no_token(self):
        r = requests.get(f"{API}/recruiter/me")
        assert r.status_code in (401, 403)


# ---------------- Regression: admin login ----------------
class TestAdminRegression:
    def test_admin_login(self):
        r = requests.post(f"{API}/auth/login", json={"email": "admin@hireme.in", "password": "admin123"})
        assert r.status_code == 200
        assert "access_token" in r.json()
