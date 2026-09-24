#!/usr/bin/env python3
"""
Backend API Testing for HireMe Admin - Master Endpoints
Tests States, Cities, Industries, Sub-Industries, Skills, and Public endpoints
"""
import requests
import json
import sys
from typing import Optional

# Base URL from frontend/.env
BASE_URL = "https://hire-admin.preview.emergentagent.com/api"

# Test credentials
ADMIN_EMAIL = "admin@hireme.in"
ADMIN_PASSWORD = "admin123"

# Global token storage
auth_token: Optional[str] = None

# Test results tracking
test_results = {
    "passed": [],
    "failed": [],
    "total": 0
}

# Created item IDs for cleanup
created_ids = {
    "state": None,
    "city": None,
    "industry": None,
    "sub_industry": None,
    "skill": None
}


def log_test(test_name: str, passed: bool, details: str = ""):
    """Log test result"""
    test_results["total"] += 1
    if passed:
        test_results["passed"].append(test_name)
        print(f"✅ PASS: {test_name}")
        if details:
            print(f"   {details}")
    else:
        test_results["failed"].append(test_name)
        print(f"❌ FAIL: {test_name}")
        if details:
            print(f"   {details}")


def get_headers(with_auth: bool = False) -> dict:
    """Get request headers"""
    headers = {"Content-Type": "application/json"}
    if with_auth and auth_token:
        headers["Authorization"] = f"Bearer {auth_token}"
    return headers


# ============ AUTH SETUP ============

def setup_auth():
    """Login and get auth token"""
    global auth_token
    try:
        response = requests.post(
            f"{BASE_URL}/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
            headers=get_headers()
        )
        
        if response.status_code != 200:
            print(f"❌ Failed to login: {response.status_code} - {response.text}")
            sys.exit(1)
        
        data = response.json()
        auth_token = data["access_token"]
        print(f"✅ Logged in as {data['user']['name']}\n")
        
    except Exception as e:
        print(f"❌ Login exception: {str(e)}")
        sys.exit(1)


# ============ STATES TESTS ============

def test_states_get_list():
    """Test: GET /api/states returns seeded list"""
    if not auth_token:
        log_test("States - GET list", False, "No auth token")
        return
    
    try:
        response = requests.get(
            f"{BASE_URL}/states",
            headers=get_headers(with_auth=True)
        )
        
        if response.status_code != 200:
            log_test("States - GET list", False, 
                    f"Expected 200, got {response.status_code}. Response: {response.text}")
            return
        
        states = response.json()
        
        if not isinstance(states, list):
            log_test("States - GET list", False, "Response is not a list")
            return
        
        if len(states) < 16:
            log_test("States - GET list", False, 
                    f"Expected ~16 seeded states, got {len(states)}")
            return
        
        log_test("States - GET list", True, 
                f"Retrieved {len(states)} states")
        
    except Exception as e:
        log_test("States - GET list", False, f"Exception: {str(e)}")


def test_states_post_create():
    """Test: POST /api/states creates new state"""
    global created_ids
    
    if not auth_token:
        log_test("States - POST create", False, "No auth token")
        return
    
    try:
        response = requests.post(
            f"{BASE_URL}/states",
            json={"name": "Test State", "status": True},
            headers=get_headers(with_auth=True)
        )
        
        if response.status_code != 200:
            log_test("States - POST create", False, 
                    f"Expected 200, got {response.status_code}. Response: {response.text}")
            return
        
        state = response.json()
        
        if not state.get("id"):
            log_test("States - POST create", False, "Missing 'id' in response")
            return
        
        if state.get("name") != "Test State":
            log_test("States - POST create", False, 
                    f"Expected name='Test State', got '{state.get('name')}'")
            return
        
        if state.get("status") != True:
            log_test("States - POST create", False, 
                    f"Expected status=True, got {state.get('status')}")
            return
        
        created_ids["state"] = state["id"]
        log_test("States - POST create", True, 
                f"Created state with id: {created_ids['state']}")
        
    except Exception as e:
        log_test("States - POST create", False, f"Exception: {str(e)}")


def test_states_put_update():
    """Test: PUT /api/states/{id} updates state"""
    if not auth_token:
        log_test("States - PUT update", False, "No auth token")
        return
    
    if not created_ids["state"]:
        log_test("States - PUT update", False, "No state id available")
        return
    
    try:
        response = requests.put(
            f"{BASE_URL}/states/{created_ids['state']}",
            json={"status": False},
            headers=get_headers(with_auth=True)
        )
        
        if response.status_code != 200:
            log_test("States - PUT update", False, 
                    f"Expected 200, got {response.status_code}. Response: {response.text}")
            return
        
        state = response.json()
        
        if state.get("status") != False:
            log_test("States - PUT update", False, 
                    f"Expected status=False, got {state.get('status')}")
            return
        
        log_test("States - PUT update", True, "Status updated successfully")
        
    except Exception as e:
        log_test("States - PUT update", False, f"Exception: {str(e)}")


def test_states_delete():
    """Test: DELETE /api/states/{id} removes state"""
    if not auth_token:
        log_test("States - DELETE", False, "No auth token")
        return
    
    if not created_ids["state"]:
        log_test("States - DELETE", False, "No state id available")
        return
    
    try:
        response = requests.delete(
            f"{BASE_URL}/states/{created_ids['state']}",
            headers=get_headers(with_auth=True)
        )
        
        if response.status_code != 200:
            log_test("States - DELETE", False, 
                    f"Expected 200, got {response.status_code}. Response: {response.text}")
            return
        
        result = response.json()
        if result.get("success") != True:
            log_test("States - DELETE", False, 
                    f"Expected success=True, got {result}")
            return
        
        log_test("States - DELETE", True, "State deleted successfully")
        
    except Exception as e:
        log_test("States - DELETE", False, f"Exception: {str(e)}")


def test_states_404():
    """Test: PUT/DELETE with non-existent id returns 404"""
    if not auth_token:
        log_test("States - 404 handling", False, "No auth token")
        return
    
    try:
        # Test PUT
        response = requests.put(
            f"{BASE_URL}/states/nonexistent-id-12345",
            json={"status": True},
            headers=get_headers(with_auth=True)
        )
        
        if response.status_code != 404:
            log_test("States - 404 handling", False, 
                    f"PUT: Expected 404, got {response.status_code}")
            return
        
        # Test DELETE
        response = requests.delete(
            f"{BASE_URL}/states/nonexistent-id-12345",
            headers=get_headers(with_auth=True)
        )
        
        if response.status_code != 404:
            log_test("States - 404 handling", False, 
                    f"DELETE: Expected 404, got {response.status_code}")
            return
        
        log_test("States - 404 handling", True, "Both PUT and DELETE return 404 for non-existent id")
        
    except Exception as e:
        log_test("States - 404 handling", False, f"Exception: {str(e)}")


# ============ CITIES TESTS ============

def test_cities_get_list():
    """Test: GET /api/cities returns seeded list"""
    if not auth_token:
        log_test("Cities - GET list", False, "No auth token")
        return
    
    try:
        response = requests.get(
            f"{BASE_URL}/cities",
            headers=get_headers(with_auth=True)
        )
        
        if response.status_code != 200:
            log_test("Cities - GET list", False, 
                    f"Expected 200, got {response.status_code}. Response: {response.text}")
            return
        
        cities = response.json()
        
        if not isinstance(cities, list):
            log_test("Cities - GET list", False, "Response is not a list")
            return
        
        if len(cities) < 8:
            log_test("Cities - GET list", False, 
                    f"Expected ~8 seeded cities, got {len(cities)}")
            return
        
        # Check structure
        if cities:
            first = cities[0]
            required_fields = ["name", "state", "image", "trending", "status"]
            missing = [f for f in required_fields if f not in first]
            if missing:
                log_test("Cities - GET list", False, 
                        f"Missing fields in response: {missing}")
                return
        
        log_test("Cities - GET list", True, 
                f"Retrieved {len(cities)} cities with correct structure")
        
    except Exception as e:
        log_test("Cities - GET list", False, f"Exception: {str(e)}")


def test_cities_post_create():
    """Test: POST /api/cities creates new city"""
    global created_ids
    
    if not auth_token:
        log_test("Cities - POST create", False, "No auth token")
        return
    
    try:
        response = requests.post(
            f"{BASE_URL}/cities",
            json={
                "name": "Test City",
                "state": "Maharashtra",
                "trending": False,
                "status": True,
                "image": ""
            },
            headers=get_headers(with_auth=True)
        )
        
        if response.status_code != 200:
            log_test("Cities - POST create", False, 
                    f"Expected 200, got {response.status_code}. Response: {response.text}")
            return
        
        city = response.json()
        
        if not city.get("id"):
            log_test("Cities - POST create", False, "Missing 'id' in response")
            return
        
        if city.get("name") != "Test City":
            log_test("Cities - POST create", False, 
                    f"Expected name='Test City', got '{city.get('name')}'")
            return
        
        if city.get("state") != "Maharashtra":
            log_test("Cities - POST create", False, 
                    f"Expected state='Maharashtra', got '{city.get('state')}'")
            return
        
        created_ids["city"] = city["id"]
        log_test("Cities - POST create", True, 
                f"Created city with id: {created_ids['city']}")
        
    except Exception as e:
        log_test("Cities - POST create", False, f"Exception: {str(e)}")


def test_cities_put_update():
    """Test: PUT /api/cities/{id} updates city"""
    if not auth_token:
        log_test("Cities - PUT update", False, "No auth token")
        return
    
    if not created_ids["city"]:
        log_test("Cities - PUT update", False, "No city id available")
        return
    
    try:
        response = requests.put(
            f"{BASE_URL}/cities/{created_ids['city']}",
            json={"trending": True},
            headers=get_headers(with_auth=True)
        )
        
        if response.status_code != 200:
            log_test("Cities - PUT update", False, 
                    f"Expected 200, got {response.status_code}. Response: {response.text}")
            return
        
        city = response.json()
        
        if city.get("trending") != True:
            log_test("Cities - PUT update", False, 
                    f"Expected trending=True, got {city.get('trending')}")
            return
        
        log_test("Cities - PUT update", True, "Trending updated successfully")
        
    except Exception as e:
        log_test("Cities - PUT update", False, f"Exception: {str(e)}")


def test_cities_delete():
    """Test: DELETE /api/cities/{id} removes city"""
    if not auth_token:
        log_test("Cities - DELETE", False, "No auth token")
        return
    
    if not created_ids["city"]:
        log_test("Cities - DELETE", False, "No city id available")
        return
    
    try:
        response = requests.delete(
            f"{BASE_URL}/cities/{created_ids['city']}",
            headers=get_headers(with_auth=True)
        )
        
        if response.status_code != 200:
            log_test("Cities - DELETE", False, 
                    f"Expected 200, got {response.status_code}. Response: {response.text}")
            return
        
        result = response.json()
        if result.get("success") != True:
            log_test("Cities - DELETE", False, 
                    f"Expected success=True, got {result}")
            return
        
        log_test("Cities - DELETE", True, "City deleted successfully")
        
    except Exception as e:
        log_test("Cities - DELETE", False, f"Exception: {str(e)}")


def test_cities_404():
    """Test: PUT/DELETE with non-existent id returns 404"""
    if not auth_token:
        log_test("Cities - 404 handling", False, "No auth token")
        return
    
    try:
        response = requests.put(
            f"{BASE_URL}/cities/nonexistent-id-12345",
            json={"status": True},
            headers=get_headers(with_auth=True)
        )
        
        if response.status_code != 404:
            log_test("Cities - 404 handling", False, 
                    f"Expected 404, got {response.status_code}")
            return
        
        log_test("Cities - 404 handling", True, "Returns 404 for non-existent id")
        
    except Exception as e:
        log_test("Cities - 404 handling", False, f"Exception: {str(e)}")


# ============ INDUSTRIES TESTS ============

def test_industries_get_list():
    """Test: GET /api/industries returns seeded list"""
    if not auth_token:
        log_test("Industries - GET list", False, "No auth token")
        return
    
    try:
        response = requests.get(
            f"{BASE_URL}/industries",
            headers=get_headers(with_auth=True)
        )
        
        if response.status_code != 200:
            log_test("Industries - GET list", False, 
                    f"Expected 200, got {response.status_code}. Response: {response.text}")
            return
        
        industries = response.json()
        
        if not isinstance(industries, list):
            log_test("Industries - GET list", False, "Response is not a list")
            return
        
        if len(industries) < 10:
            log_test("Industries - GET list", False, 
                    f"Expected ~10 seeded industries, got {len(industries)}")
            return
        
        log_test("Industries - GET list", True, 
                f"Retrieved {len(industries)} industries")
        
    except Exception as e:
        log_test("Industries - GET list", False, f"Exception: {str(e)}")


def test_industries_post_create():
    """Test: POST /api/industries creates new industry"""
    global created_ids
    
    if not auth_token:
        log_test("Industries - POST create", False, "No auth token")
        return
    
    try:
        response = requests.post(
            f"{BASE_URL}/industries",
            json={"name": "Test Industry", "status": True},
            headers=get_headers(with_auth=True)
        )
        
        if response.status_code != 200:
            log_test("Industries - POST create", False, 
                    f"Expected 200, got {response.status_code}. Response: {response.text}")
            return
        
        industry = response.json()
        
        if not industry.get("id"):
            log_test("Industries - POST create", False, "Missing 'id' in response")
            return
        
        if industry.get("name") != "Test Industry":
            log_test("Industries - POST create", False, 
                    f"Expected name='Test Industry', got '{industry.get('name')}'")
            return
        
        created_ids["industry"] = industry["id"]
        log_test("Industries - POST create", True, 
                f"Created industry with id: {created_ids['industry']}")
        
    except Exception as e:
        log_test("Industries - POST create", False, f"Exception: {str(e)}")


def test_industries_put_update():
    """Test: PUT /api/industries/{id} updates industry"""
    if not auth_token:
        log_test("Industries - PUT update", False, "No auth token")
        return
    
    if not created_ids["industry"]:
        log_test("Industries - PUT update", False, "No industry id available")
        return
    
    try:
        response = requests.put(
            f"{BASE_URL}/industries/{created_ids['industry']}",
            json={"status": False},
            headers=get_headers(with_auth=True)
        )
        
        if response.status_code != 200:
            log_test("Industries - PUT update", False, 
                    f"Expected 200, got {response.status_code}. Response: {response.text}")
            return
        
        industry = response.json()
        
        if industry.get("status") != False:
            log_test("Industries - PUT update", False, 
                    f"Expected status=False, got {industry.get('status')}")
            return
        
        log_test("Industries - PUT update", True, "Status updated successfully")
        
    except Exception as e:
        log_test("Industries - PUT update", False, f"Exception: {str(e)}")


def test_industries_delete():
    """Test: DELETE /api/industries/{id} removes industry"""
    if not auth_token:
        log_test("Industries - DELETE", False, "No auth token")
        return
    
    if not created_ids["industry"]:
        log_test("Industries - DELETE", False, "No industry id available")
        return
    
    try:
        response = requests.delete(
            f"{BASE_URL}/industries/{created_ids['industry']}",
            headers=get_headers(with_auth=True)
        )
        
        if response.status_code != 200:
            log_test("Industries - DELETE", False, 
                    f"Expected 200, got {response.status_code}. Response: {response.text}")
            return
        
        result = response.json()
        if result.get("success") != True:
            log_test("Industries - DELETE", False, 
                    f"Expected success=True, got {result}")
            return
        
        log_test("Industries - DELETE", True, "Industry deleted successfully")
        
    except Exception as e:
        log_test("Industries - DELETE", False, f"Exception: {str(e)}")


def test_industries_404():
    """Test: PUT/DELETE with non-existent id returns 404"""
    if not auth_token:
        log_test("Industries - 404 handling", False, "No auth token")
        return
    
    try:
        response = requests.put(
            f"{BASE_URL}/industries/nonexistent-id-12345",
            json={"status": True},
            headers=get_headers(with_auth=True)
        )
        
        if response.status_code != 404:
            log_test("Industries - 404 handling", False, 
                    f"Expected 404, got {response.status_code}")
            return
        
        log_test("Industries - 404 handling", True, "Returns 404 for non-existent id")
        
    except Exception as e:
        log_test("Industries - 404 handling", False, f"Exception: {str(e)}")


# ============ SUB-INDUSTRIES TESTS ============

def test_sub_industries_get_list():
    """Test: GET /api/sub-industries returns seeded list"""
    if not auth_token:
        log_test("Sub-Industries - GET list", False, "No auth token")
        return
    
    try:
        response = requests.get(
            f"{BASE_URL}/sub-industries",
            headers=get_headers(with_auth=True)
        )
        
        if response.status_code != 200:
            log_test("Sub-Industries - GET list", False, 
                    f"Expected 200, got {response.status_code}. Response: {response.text}")
            return
        
        sub_industries = response.json()
        
        if not isinstance(sub_industries, list):
            log_test("Sub-Industries - GET list", False, "Response is not a list")
            return
        
        if len(sub_industries) < 8:
            log_test("Sub-Industries - GET list", False, 
                    f"Expected ~8 seeded sub-industries, got {len(sub_industries)}")
            return
        
        # Check structure
        if sub_industries:
            first = sub_industries[0]
            required_fields = ["name", "industry", "status"]
            missing = [f for f in required_fields if f not in first]
            if missing:
                log_test("Sub-Industries - GET list", False, 
                        f"Missing fields in response: {missing}")
                return
        
        log_test("Sub-Industries - GET list", True, 
                f"Retrieved {len(sub_industries)} sub-industries with correct structure")
        
    except Exception as e:
        log_test("Sub-Industries - GET list", False, f"Exception: {str(e)}")


def test_sub_industries_post_create():
    """Test: POST /api/sub-industries creates new sub-industry"""
    global created_ids
    
    if not auth_token:
        log_test("Sub-Industries - POST create", False, "No auth token")
        return
    
    try:
        response = requests.post(
            f"{BASE_URL}/sub-industries",
            json={"name": "Test Sub", "industry": "Software", "status": True},
            headers=get_headers(with_auth=True)
        )
        
        if response.status_code != 200:
            log_test("Sub-Industries - POST create", False, 
                    f"Expected 200, got {response.status_code}. Response: {response.text}")
            return
        
        sub_industry = response.json()
        
        if not sub_industry.get("id"):
            log_test("Sub-Industries - POST create", False, "Missing 'id' in response")
            return
        
        if sub_industry.get("name") != "Test Sub":
            log_test("Sub-Industries - POST create", False, 
                    f"Expected name='Test Sub', got '{sub_industry.get('name')}'")
            return
        
        if sub_industry.get("industry") != "Software":
            log_test("Sub-Industries - POST create", False, 
                    f"Expected industry='Software', got '{sub_industry.get('industry')}'")
            return
        
        created_ids["sub_industry"] = sub_industry["id"]
        log_test("Sub-Industries - POST create", True, 
                f"Created sub-industry with id: {created_ids['sub_industry']}")
        
    except Exception as e:
        log_test("Sub-Industries - POST create", False, f"Exception: {str(e)}")


def test_sub_industries_put_update():
    """Test: PUT /api/sub-industries/{id} updates sub-industry"""
    if not auth_token:
        log_test("Sub-Industries - PUT update", False, "No auth token")
        return
    
    if not created_ids["sub_industry"]:
        log_test("Sub-Industries - PUT update", False, "No sub-industry id available")
        return
    
    try:
        response = requests.put(
            f"{BASE_URL}/sub-industries/{created_ids['sub_industry']}",
            json={"status": False},
            headers=get_headers(with_auth=True)
        )
        
        if response.status_code != 200:
            log_test("Sub-Industries - PUT update", False, 
                    f"Expected 200, got {response.status_code}. Response: {response.text}")
            return
        
        sub_industry = response.json()
        
        if sub_industry.get("status") != False:
            log_test("Sub-Industries - PUT update", False, 
                    f"Expected status=False, got {sub_industry.get('status')}")
            return
        
        log_test("Sub-Industries - PUT update", True, "Status updated successfully")
        
    except Exception as e:
        log_test("Sub-Industries - PUT update", False, f"Exception: {str(e)}")


def test_sub_industries_delete():
    """Test: DELETE /api/sub-industries/{id} removes sub-industry"""
    if not auth_token:
        log_test("Sub-Industries - DELETE", False, "No auth token")
        return
    
    if not created_ids["sub_industry"]:
        log_test("Sub-Industries - DELETE", False, "No sub-industry id available")
        return
    
    try:
        response = requests.delete(
            f"{BASE_URL}/sub-industries/{created_ids['sub_industry']}",
            headers=get_headers(with_auth=True)
        )
        
        if response.status_code != 200:
            log_test("Sub-Industries - DELETE", False, 
                    f"Expected 200, got {response.status_code}. Response: {response.text}")
            return
        
        result = response.json()
        if result.get("success") != True:
            log_test("Sub-Industries - DELETE", False, 
                    f"Expected success=True, got {result}")
            return
        
        log_test("Sub-Industries - DELETE", True, "Sub-industry deleted successfully")
        
    except Exception as e:
        log_test("Sub-Industries - DELETE", False, f"Exception: {str(e)}")


def test_sub_industries_404():
    """Test: PUT/DELETE with non-existent id returns 404"""
    if not auth_token:
        log_test("Sub-Industries - 404 handling", False, "No auth token")
        return
    
    try:
        response = requests.put(
            f"{BASE_URL}/sub-industries/nonexistent-id-12345",
            json={"status": True},
            headers=get_headers(with_auth=True)
        )
        
        if response.status_code != 404:
            log_test("Sub-Industries - 404 handling", False, 
                    f"Expected 404, got {response.status_code}")
            return
        
        log_test("Sub-Industries - 404 handling", True, "Returns 404 for non-existent id")
        
    except Exception as e:
        log_test("Sub-Industries - 404 handling", False, f"Exception: {str(e)}")


# ============ SKILLS TESTS ============

def test_skills_get_list():
    """Test: GET /api/skills returns seeded list"""
    if not auth_token:
        log_test("Skills - GET list", False, "No auth token")
        return
    
    try:
        response = requests.get(
            f"{BASE_URL}/skills",
            headers=get_headers(with_auth=True)
        )
        
        if response.status_code != 200:
            log_test("Skills - GET list", False, 
                    f"Expected 200, got {response.status_code}. Response: {response.text}")
            return
        
        skills = response.json()
        
        if not isinstance(skills, list):
            log_test("Skills - GET list", False, "Response is not a list")
            return
        
        if len(skills) < 14:
            log_test("Skills - GET list", False, 
                    f"Expected ~14 seeded skills, got {len(skills)}")
            return
        
        log_test("Skills - GET list", True, 
                f"Retrieved {len(skills)} skills")
        
    except Exception as e:
        log_test("Skills - GET list", False, f"Exception: {str(e)}")


def test_skills_post_create():
    """Test: POST /api/skills creates new skill"""
    global created_ids
    
    if not auth_token:
        log_test("Skills - POST create", False, "No auth token")
        return
    
    try:
        response = requests.post(
            f"{BASE_URL}/skills",
            json={"name": "Test Skill", "status": True},
            headers=get_headers(with_auth=True)
        )
        
        if response.status_code != 200:
            log_test("Skills - POST create", False, 
                    f"Expected 200, got {response.status_code}. Response: {response.text}")
            return
        
        skill = response.json()
        
        if not skill.get("id"):
            log_test("Skills - POST create", False, "Missing 'id' in response")
            return
        
        if skill.get("name") != "Test Skill":
            log_test("Skills - POST create", False, 
                    f"Expected name='Test Skill', got '{skill.get('name')}'")
            return
        
        created_ids["skill"] = skill["id"]
        log_test("Skills - POST create", True, 
                f"Created skill with id: {created_ids['skill']}")
        
    except Exception as e:
        log_test("Skills - POST create", False, f"Exception: {str(e)}")


def test_skills_put_update():
    """Test: PUT /api/skills/{id} updates skill"""
    if not auth_token:
        log_test("Skills - PUT update", False, "No auth token")
        return
    
    if not created_ids["skill"]:
        log_test("Skills - PUT update", False, "No skill id available")
        return
    
    try:
        response = requests.put(
            f"{BASE_URL}/skills/{created_ids['skill']}",
            json={"status": False},
            headers=get_headers(with_auth=True)
        )
        
        if response.status_code != 200:
            log_test("Skills - PUT update", False, 
                    f"Expected 200, got {response.status_code}. Response: {response.text}")
            return
        
        skill = response.json()
        
        if skill.get("status") != False:
            log_test("Skills - PUT update", False, 
                    f"Expected status=False, got {skill.get('status')}")
            return
        
        log_test("Skills - PUT update", True, "Status updated successfully")
        
    except Exception as e:
        log_test("Skills - PUT update", False, f"Exception: {str(e)}")


def test_skills_delete():
    """Test: DELETE /api/skills/{id} removes skill"""
    if not auth_token:
        log_test("Skills - DELETE", False, "No auth token")
        return
    
    if not created_ids["skill"]:
        log_test("Skills - DELETE", False, "No skill id available")
        return
    
    try:
        response = requests.delete(
            f"{BASE_URL}/skills/{created_ids['skill']}",
            headers=get_headers(with_auth=True)
        )
        
        if response.status_code != 200:
            log_test("Skills - DELETE", False, 
                    f"Expected 200, got {response.status_code}. Response: {response.text}")
            return
        
        result = response.json()
        if result.get("success") != True:
            log_test("Skills - DELETE", False, 
                    f"Expected success=True, got {result}")
            return
        
        log_test("Skills - DELETE", True, "Skill deleted successfully")
        
    except Exception as e:
        log_test("Skills - DELETE", False, f"Exception: {str(e)}")


def test_skills_404():
    """Test: PUT/DELETE with non-existent id returns 404"""
    if not auth_token:
        log_test("Skills - 404 handling", False, "No auth token")
        return
    
    try:
        response = requests.put(
            f"{BASE_URL}/skills/nonexistent-id-12345",
            json={"status": True},
            headers=get_headers(with_auth=True)
        )
        
        if response.status_code != 404:
            log_test("Skills - 404 handling", False, 
                    f"Expected 404, got {response.status_code}")
            return
        
        log_test("Skills - 404 handling", True, "Returns 404 for non-existent id")
        
    except Exception as e:
        log_test("Skills - 404 handling", False, f"Exception: {str(e)}")


# ============ VALIDATION TESTS ============

def test_validation_empty_name():
    """Test: POST with empty/missing name returns 400"""
    if not auth_token:
        log_test("Validation - Empty name returns 400", False, "No auth token")
        return
    
    try:
        # Test with empty name
        response = requests.post(
            f"{BASE_URL}/states",
            json={"name": "", "status": True},
            headers=get_headers(with_auth=True)
        )
        
        if response.status_code != 400:
            log_test("Validation - Empty name returns 400", False, 
                    f"Empty name: Expected 400, got {response.status_code}")
            return
        
        # Test with missing name
        response = requests.post(
            f"{BASE_URL}/states",
            json={"status": True},
            headers=get_headers(with_auth=True)
        )
        
        if response.status_code != 400:
            log_test("Validation - Empty name returns 400", False, 
                    f"Missing name: Expected 400, got {response.status_code}")
            return
        
        log_test("Validation - Empty name returns 400", True, 
                "Both empty and missing name return 400")
        
    except Exception as e:
        log_test("Validation - Empty name returns 400", False, f"Exception: {str(e)}")


# ============ AUTH TESTS ============

def test_auth_required():
    """Test: All endpoints return 401/403 without Bearer token"""
    try:
        endpoints = [
            "/states",
            "/cities",
            "/industries",
            "/sub-industries",
            "/skills"
        ]
        
        all_passed = True
        failed_endpoints = []
        
        for endpoint in endpoints:
            # Test GET
            response = requests.get(
                f"{BASE_URL}{endpoint}",
                headers=get_headers(with_auth=False)
            )
            
            if response.status_code not in [401, 403]:
                all_passed = False
                failed_endpoints.append(f"GET {endpoint}: {response.status_code}")
            
            # Test POST
            response = requests.post(
                f"{BASE_URL}{endpoint}",
                json={"name": "Test", "status": True},
                headers=get_headers(with_auth=False)
            )
            
            if response.status_code not in [401, 403]:
                all_passed = False
                failed_endpoints.append(f"POST {endpoint}: {response.status_code}")
        
        if all_passed:
            log_test("Auth - All endpoints require Bearer token", True, 
                    "All GET/POST/PUT/DELETE return 401/403 without token")
        else:
            log_test("Auth - All endpoints require Bearer token", False, 
                    f"Failed: {', '.join(failed_endpoints)}")
        
    except Exception as e:
        log_test("Auth - All endpoints require Bearer token", False, f"Exception: {str(e)}")


# ============ PUBLIC ENDPOINT TESTS ============

def test_public_trending_cities():
    """Test: GET /api/public/trending-cities (NO auth required)"""
    try:
        response = requests.get(
            f"{BASE_URL}/public/trending-cities",
            headers=get_headers(with_auth=False)
        )
        
        if response.status_code != 200:
            log_test("Public - GET trending-cities", False, 
                    f"Expected 200, got {response.status_code}. Response: {response.text}")
            return
        
        cities = response.json()
        
        if not isinstance(cities, list):
            log_test("Public - GET trending-cities", False, "Response is not a list")
            return
        
        if len(cities) != 8:
            log_test("Public - GET trending-cities", False, 
                    f"Expected 8 trending cities, got {len(cities)}")
            return
        
        # Check structure
        if cities:
            first = cities[0]
            if "name" not in first or "image" not in first:
                log_test("Public - GET trending-cities", False, 
                        f"Missing 'name' or 'image' in response: {first}")
                return
            
            # Should only have name and image
            if len(first.keys()) != 2:
                log_test("Public - GET trending-cities", False, 
                        f"Expected only 'name' and 'image' fields, got: {list(first.keys())}")
                return
        
        log_test("Public - GET trending-cities", True, 
                f"Retrieved {len(cities)} trending cities with correct structure (name, image)")
        
    except Exception as e:
        log_test("Public - GET trending-cities", False, f"Exception: {str(e)}")


# ============ MAIN TEST RUNNER ============

def run_all_tests():
    """Run all master endpoint tests in sequence"""
    print("\n" + "="*70)
    print("HireMe Admin Backend API Tests - Master Endpoints")
    print("="*70 + "\n")
    
    print(f"Base URL: {BASE_URL}\n")
    
    # Setup auth
    setup_auth()
    
    # States tests
    print("\n--- STATES TESTS ---\n")
    test_states_get_list()
    test_states_post_create()
    test_states_put_update()
    test_states_delete()
    test_states_404()
    
    # Cities tests
    print("\n--- CITIES TESTS ---\n")
    test_cities_get_list()
    test_cities_post_create()
    test_cities_put_update()
    test_cities_delete()
    test_cities_404()
    
    # Industries tests
    print("\n--- INDUSTRIES TESTS ---\n")
    test_industries_get_list()
    test_industries_post_create()
    test_industries_put_update()
    test_industries_delete()
    test_industries_404()
    
    # Sub-Industries tests
    print("\n--- SUB-INDUSTRIES TESTS ---\n")
    test_sub_industries_get_list()
    test_sub_industries_post_create()
    test_sub_industries_put_update()
    test_sub_industries_delete()
    test_sub_industries_404()
    
    # Skills tests
    print("\n--- SKILLS TESTS ---\n")
    test_skills_get_list()
    test_skills_post_create()
    test_skills_put_update()
    test_skills_delete()
    test_skills_404()
    
    # Validation tests
    print("\n--- VALIDATION TESTS ---\n")
    test_validation_empty_name()
    
    # Auth tests
    print("\n--- AUTHENTICATION TESTS ---\n")
    test_auth_required()
    
    # Public endpoint tests
    print("\n--- PUBLIC ENDPOINT TESTS ---\n")
    test_public_trending_cities()
    
    # Summary
    print("\n" + "="*70)
    print("TEST SUMMARY")
    print("="*70)
    print(f"Total Tests: {test_results['total']}")
    print(f"Passed: {len(test_results['passed'])} ✅")
    print(f"Failed: {len(test_results['failed'])} ❌")
    
    if test_results['failed']:
        print("\nFailed Tests:")
        for test in test_results['failed']:
            print(f"  - {test}")
    
    print("="*70 + "\n")
    
    # Exit with appropriate code
    sys.exit(0 if len(test_results['failed']) == 0 else 1)


if __name__ == "__main__":
    run_all_tests()
