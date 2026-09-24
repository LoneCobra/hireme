#!/usr/bin/env python3
"""
Backend API Testing for HireMe Admin
Tests all authentication, CRUD operations, and dashboard endpoints
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


# ============ AUTH TESTS ============

def test_1_login_success():
    """Test 1: POST /api/auth/login with correct credentials"""
    global auth_token
    try:
        response = requests.post(
            f"{BASE_URL}/auth/login",
            json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
            headers=get_headers()
        )
        
        if response.status_code != 200:
            log_test("Login with correct credentials", False, 
                    f"Expected 200, got {response.status_code}. Response: {response.text}")
            return
        
        data = response.json()
        
        # Check response structure
        if "access_token" not in data:
            log_test("Login with correct credentials", False, "Missing 'access_token' in response")
            return
        
        if data.get("token_type") != "bearer":
            log_test("Login with correct credentials", False, 
                    f"Expected token_type='bearer', got '{data.get('token_type')}'")
            return
        
        user = data.get("user", {})
        if not user.get("name") or not user.get("email") or user.get("role") != "Super Admin":
            log_test("Login with correct credentials", False, 
                    f"Invalid user data: {user}")
            return
        
        # Store token for subsequent tests
        auth_token = data["access_token"]
        
        log_test("Login with correct credentials", True, 
                f"Token received, user: {user['name']} ({user['role']})")
        
    except Exception as e:
        log_test("Login with correct credentials", False, f"Exception: {str(e)}")


def test_2_login_wrong_password():
    """Test 2: POST /api/auth/login with wrong password"""
    try:
        response = requests.post(
            f"{BASE_URL}/auth/login",
            json={"email": ADMIN_EMAIL, "password": "wrongpassword"},
            headers=get_headers()
        )
        
        if response.status_code == 401:
            log_test("Login with wrong password returns 401", True)
        else:
            log_test("Login with wrong password returns 401", False, 
                    f"Expected 401, got {response.status_code}")
    except Exception as e:
        log_test("Login with wrong password returns 401", False, f"Exception: {str(e)}")


def test_3_auth_me_with_token():
    """Test 3: GET /api/auth/me with Bearer token"""
    if not auth_token:
        log_test("GET /auth/me with token", False, "No auth token available")
        return
    
    try:
        response = requests.get(
            f"{BASE_URL}/auth/me",
            headers=get_headers(with_auth=True)
        )
        
        if response.status_code != 200:
            log_test("GET /auth/me with token", False, 
                    f"Expected 200, got {response.status_code}. Response: {response.text}")
            return
        
        user = response.json()
        if user.get("name") and user.get("email") and user.get("role"):
            log_test("GET /auth/me with token", True, 
                    f"User: {user['name']} ({user['role']})")
        else:
            log_test("GET /auth/me with token", False, f"Invalid user data: {user}")
            
    except Exception as e:
        log_test("GET /auth/me with token", False, f"Exception: {str(e)}")


def test_4_auth_me_without_token():
    """Test 4: GET /api/auth/me without token (should fail)"""
    try:
        response = requests.get(
            f"{BASE_URL}/auth/me",
            headers=get_headers(with_auth=False)
        )
        
        if response.status_code in [401, 403]:
            log_test("GET /auth/me without token returns 401/403", True)
        else:
            log_test("GET /auth/me without token returns 401/403", False, 
                    f"Expected 401/403, got {response.status_code}")
    except Exception as e:
        log_test("GET /auth/me without token returns 401/403", False, f"Exception: {str(e)}")


# ============ EDUCATION CATEGORIES TESTS ============

created_category_id: Optional[str] = None


def test_5_get_categories():
    """Test 5: GET /api/education-categories returns seeded list"""
    if not auth_token:
        log_test("GET /education-categories", False, "No auth token")
        return
    
    try:
        response = requests.get(
            f"{BASE_URL}/education-categories",
            headers=get_headers(with_auth=True)
        )
        
        if response.status_code != 200:
            log_test("GET /education-categories", False, 
                    f"Expected 200, got {response.status_code}. Response: {response.text}")
            return
        
        categories = response.json()
        
        if not isinstance(categories, list):
            log_test("GET /education-categories", False, "Response is not a list")
            return
        
        if len(categories) < 13:
            log_test("GET /education-categories", False, 
                    f"Expected ~13 seeded items, got {len(categories)}")
            return
        
        log_test("GET /education-categories", True, 
                f"Retrieved {len(categories)} categories")
        
    except Exception as e:
        log_test("GET /education-categories", False, f"Exception: {str(e)}")


def test_6_create_category():
    """Test 6: POST /api/education-categories creates new category"""
    global created_category_id
    
    if not auth_token:
        log_test("POST /education-categories", False, "No auth token")
        return
    
    try:
        response = requests.post(
            f"{BASE_URL}/education-categories",
            json={"name": "Test Category", "status": True, "trending": False},
            headers=get_headers(with_auth=True)
        )
        
        if response.status_code != 200:
            log_test("POST /education-categories", False, 
                    f"Expected 200, got {response.status_code}. Response: {response.text}")
            return
        
        category = response.json()
        
        # Validate response
        if not category.get("id"):
            log_test("POST /education-categories", False, "Missing 'id' in response")
            return
        
        if category.get("name") != "Test Category":
            log_test("POST /education-categories", False, 
                    f"Expected name='Test Category', got '{category.get('name')}'")
            return
        
        if category.get("updatedBy") != "Komal Saini":
            log_test("POST /education-categories", False, 
                    f"Expected updatedBy='Komal Saini', got '{category.get('updatedBy')}'")
            return
        
        if not category.get("updatedAt"):
            log_test("POST /education-categories", False, "Missing 'updatedAt'")
            return
        
        created_category_id = category["id"]
        log_test("POST /education-categories", True, 
                f"Created category with id: {created_category_id}")
        
    except Exception as e:
        log_test("POST /education-categories", False, f"Exception: {str(e)}")


def test_7_update_category_trending():
    """Test 7: PUT /api/education-categories/{id} toggle trending"""
    if not auth_token:
        log_test("PUT /education-categories (trending)", False, "No auth token")
        return
    
    if not created_category_id:
        log_test("PUT /education-categories (trending)", False, "No category id available")
        return
    
    try:
        response = requests.put(
            f"{BASE_URL}/education-categories/{created_category_id}",
            json={"trending": True},
            headers=get_headers(with_auth=True)
        )
        
        if response.status_code != 200:
            log_test("PUT /education-categories (trending)", False, 
                    f"Expected 200, got {response.status_code}. Response: {response.text}")
            return
        
        category = response.json()
        
        if category.get("trending") != True:
            log_test("PUT /education-categories (trending)", False, 
                    f"Expected trending=True, got {category.get('trending')}")
            return
        
        log_test("PUT /education-categories (trending)", True, "Trending toggled successfully")
        
    except Exception as e:
        log_test("PUT /education-categories (trending)", False, f"Exception: {str(e)}")


def test_8_update_category_status():
    """Test 8: PUT /api/education-categories/{id} toggle status"""
    if not auth_token:
        log_test("PUT /education-categories (status)", False, "No auth token")
        return
    
    if not created_category_id:
        log_test("PUT /education-categories (status)", False, "No category id available")
        return
    
    try:
        response = requests.put(
            f"{BASE_URL}/education-categories/{created_category_id}",
            json={"status": False},
            headers=get_headers(with_auth=True)
        )
        
        if response.status_code != 200:
            log_test("PUT /education-categories (status)", False, 
                    f"Expected 200, got {response.status_code}. Response: {response.text}")
            return
        
        category = response.json()
        
        if category.get("status") != False:
            log_test("PUT /education-categories (status)", False, 
                    f"Expected status=False, got {category.get('status')}")
            return
        
        log_test("PUT /education-categories (status)", True, "Status toggled successfully")
        
    except Exception as e:
        log_test("PUT /education-categories (status)", False, f"Exception: {str(e)}")


def test_9_update_nonexistent_category():
    """Test 9: PUT /api/education-categories/{id} with non-existent id returns 404"""
    if not auth_token:
        log_test("PUT /education-categories (non-existent)", False, "No auth token")
        return
    
    try:
        response = requests.put(
            f"{BASE_URL}/education-categories/nonexistent-id-12345",
            json={"status": True},
            headers=get_headers(with_auth=True)
        )
        
        if response.status_code == 404:
            log_test("PUT /education-categories (non-existent) returns 404", True)
        else:
            log_test("PUT /education-categories (non-existent) returns 404", False, 
                    f"Expected 404, got {response.status_code}")
    except Exception as e:
        log_test("PUT /education-categories (non-existent) returns 404", False, f"Exception: {str(e)}")


def test_10_delete_category():
    """Test 10: DELETE /api/education-categories/{id} removes category"""
    if not auth_token:
        log_test("DELETE /education-categories", False, "No auth token")
        return
    
    if not created_category_id:
        log_test("DELETE /education-categories", False, "No category id available")
        return
    
    try:
        # Delete the category
        response = requests.delete(
            f"{BASE_URL}/education-categories/{created_category_id}",
            headers=get_headers(with_auth=True)
        )
        
        if response.status_code != 200:
            log_test("DELETE /education-categories", False, 
                    f"Expected 200, got {response.status_code}. Response: {response.text}")
            return
        
        result = response.json()
        if result.get("success") != True:
            log_test("DELETE /education-categories", False, 
                    f"Expected success=True, got {result}")
            return
        
        # Verify it's deleted by trying to GET all categories
        get_response = requests.get(
            f"{BASE_URL}/education-categories",
            headers=get_headers(with_auth=True)
        )
        
        if get_response.status_code == 200:
            categories = get_response.json()
            if any(cat.get("id") == created_category_id for cat in categories):
                log_test("DELETE /education-categories", False, 
                        "Category still exists after deletion")
                return
        
        log_test("DELETE /education-categories", True, "Category deleted successfully")
        
    except Exception as e:
        log_test("DELETE /education-categories", False, f"Exception: {str(e)}")


def test_11_delete_nonexistent_category():
    """Test 11: DELETE /api/education-categories/{id} with non-existent id returns 404"""
    if not auth_token:
        log_test("DELETE /education-categories (non-existent)", False, "No auth token")
        return
    
    try:
        response = requests.delete(
            f"{BASE_URL}/education-categories/nonexistent-id-12345",
            headers=get_headers(with_auth=True)
        )
        
        if response.status_code == 404:
            log_test("DELETE /education-categories (non-existent) returns 404", True)
        else:
            log_test("DELETE /education-categories (non-existent) returns 404", False, 
                    f"Expected 404, got {response.status_code}")
    except Exception as e:
        log_test("DELETE /education-categories (non-existent) returns 404", False, f"Exception: {str(e)}")


# ============ EDUCATION SUB CATEGORIES TESTS ============

created_subcategory_id: Optional[str] = None


def test_12_get_subcategories():
    """Test 12: GET /api/education-sub-categories returns seeded list"""
    if not auth_token:
        log_test("GET /education-sub-categories", False, "No auth token")
        return
    
    try:
        response = requests.get(
            f"{BASE_URL}/education-sub-categories",
            headers=get_headers(with_auth=True)
        )
        
        if response.status_code != 200:
            log_test("GET /education-sub-categories", False, 
                    f"Expected 200, got {response.status_code}. Response: {response.text}")
            return
        
        subcategories = response.json()
        
        if not isinstance(subcategories, list):
            log_test("GET /education-sub-categories", False, "Response is not a list")
            return
        
        if len(subcategories) < 7:
            log_test("GET /education-sub-categories", False, 
                    f"Expected ~7 seeded items, got {len(subcategories)}")
            return
        
        # Check structure
        if subcategories:
            first = subcategories[0]
            if not all(k in first for k in ["name", "category", "status"]):
                log_test("GET /education-sub-categories", False, 
                        f"Missing required fields in response: {first}")
                return
        
        log_test("GET /education-sub-categories", True, 
                f"Retrieved {len(subcategories)} sub-categories")
        
    except Exception as e:
        log_test("GET /education-sub-categories", False, f"Exception: {str(e)}")


def test_13_create_subcategory():
    """Test 13: POST /api/education-sub-categories creates new sub-category"""
    global created_subcategory_id
    
    if not auth_token:
        log_test("POST /education-sub-categories", False, "No auth token")
        return
    
    try:
        response = requests.post(
            f"{BASE_URL}/education-sub-categories",
            json={"name": "Test Sub", "category": "Bachelor Of Engineering", "status": True},
            headers=get_headers(with_auth=True)
        )
        
        if response.status_code != 200:
            log_test("POST /education-sub-categories", False, 
                    f"Expected 200, got {response.status_code}. Response: {response.text}")
            return
        
        subcategory = response.json()
        
        # Validate response
        if not subcategory.get("id"):
            log_test("POST /education-sub-categories", False, "Missing 'id' in response")
            return
        
        if subcategory.get("name") != "Test Sub":
            log_test("POST /education-sub-categories", False, 
                    f"Expected name='Test Sub', got '{subcategory.get('name')}'")
            return
        
        if subcategory.get("category") != "Bachelor Of Engineering":
            log_test("POST /education-sub-categories", False, 
                    f"Expected category='Bachelor Of Engineering', got '{subcategory.get('category')}'")
            return
        
        created_subcategory_id = subcategory["id"]
        log_test("POST /education-sub-categories", True, 
                f"Created sub-category with id: {created_subcategory_id}")
        
    except Exception as e:
        log_test("POST /education-sub-categories", False, f"Exception: {str(e)}")


def test_14_update_subcategory_status():
    """Test 14: PUT /api/education-sub-categories/{id} toggle status"""
    if not auth_token:
        log_test("PUT /education-sub-categories (status)", False, "No auth token")
        return
    
    if not created_subcategory_id:
        log_test("PUT /education-sub-categories (status)", False, "No sub-category id available")
        return
    
    try:
        response = requests.put(
            f"{BASE_URL}/education-sub-categories/{created_subcategory_id}",
            json={"status": False},
            headers=get_headers(with_auth=True)
        )
        
        if response.status_code != 200:
            log_test("PUT /education-sub-categories (status)", False, 
                    f"Expected 200, got {response.status_code}. Response: {response.text}")
            return
        
        subcategory = response.json()
        
        if subcategory.get("status") != False:
            log_test("PUT /education-sub-categories (status)", False, 
                    f"Expected status=False, got {subcategory.get('status')}")
            return
        
        log_test("PUT /education-sub-categories (status)", True, "Status toggled successfully")
        
    except Exception as e:
        log_test("PUT /education-sub-categories (status)", False, f"Exception: {str(e)}")


def test_15_delete_subcategory():
    """Test 15: DELETE /api/education-sub-categories/{id} removes sub-category"""
    if not auth_token:
        log_test("DELETE /education-sub-categories", False, "No auth token")
        return
    
    if not created_subcategory_id:
        log_test("DELETE /education-sub-categories", False, "No sub-category id available")
        return
    
    try:
        response = requests.delete(
            f"{BASE_URL}/education-sub-categories/{created_subcategory_id}",
            headers=get_headers(with_auth=True)
        )
        
        if response.status_code != 200:
            log_test("DELETE /education-sub-categories", False, 
                    f"Expected 200, got {response.status_code}. Response: {response.text}")
            return
        
        result = response.json()
        if result.get("success") != True:
            log_test("DELETE /education-sub-categories", False, 
                    f"Expected success=True, got {result}")
            return
        
        log_test("DELETE /education-sub-categories", True, "Sub-category deleted successfully")
        
    except Exception as e:
        log_test("DELETE /education-sub-categories", False, f"Exception: {str(e)}")


# ============ DASHBOARD TESTS ============

def test_16_dashboard():
    """Test 16: GET /api/dashboard returns complete dashboard data"""
    if not auth_token:
        log_test("GET /dashboard", False, "No auth token")
        return
    
    try:
        response = requests.get(
            f"{BASE_URL}/dashboard",
            headers=get_headers(with_auth=True)
        )
        
        if response.status_code != 200:
            log_test("GET /dashboard", False, 
                    f"Expected 200, got {response.status_code}. Response: {response.text}")
            return
        
        dashboard = response.json()
        
        # Check required keys
        required_keys = [
            "stats", "jobsCreatedMonthly", "jobsByIndustry", 
            "candidatesMonthly", "recentCompanies", "recentJobs", "totalCategories"
        ]
        
        missing_keys = [k for k in required_keys if k not in dashboard]
        if missing_keys:
            log_test("GET /dashboard", False, 
                    f"Missing required keys: {missing_keys}")
            return
        
        # Validate stats array
        stats = dashboard.get("stats", [])
        if not isinstance(stats, list) or len(stats) != 4:
            log_test("GET /dashboard", False, 
                    f"Expected stats to be array of 4 items, got {len(stats)}")
            return
        
        log_test("GET /dashboard", True, 
                f"Dashboard data retrieved with all required keys")
        
    except Exception as e:
        log_test("GET /dashboard", False, f"Exception: {str(e)}")


# ============ MAIN TEST RUNNER ============

def run_all_tests():
    """Run all backend tests in sequence"""
    print("\n" + "="*70)
    print("HireMe Admin Backend API Tests")
    print("="*70 + "\n")
    
    print(f"Base URL: {BASE_URL}\n")
    
    # Auth tests
    print("\n--- AUTHENTICATION TESTS ---\n")
    test_1_login_success()
    test_2_login_wrong_password()
    test_3_auth_me_with_token()
    test_4_auth_me_without_token()
    
    # Education Categories tests
    print("\n--- EDUCATION CATEGORIES TESTS ---\n")
    test_5_get_categories()
    test_6_create_category()
    test_7_update_category_trending()
    test_8_update_category_status()
    test_9_update_nonexistent_category()
    test_10_delete_category()
    test_11_delete_nonexistent_category()
    
    # Education Sub Categories tests
    print("\n--- EDUCATION SUB CATEGORIES TESTS ---\n")
    test_12_get_subcategories()
    test_13_create_subcategory()
    test_14_update_subcategory_status()
    test_15_delete_subcategory()
    
    # Dashboard tests
    print("\n--- DASHBOARD TESTS ---\n")
    test_16_dashboard()
    
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
