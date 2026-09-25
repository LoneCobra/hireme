#!/usr/bin/env python3
"""
Comprehensive backend API test for HireMe Admin NEW master endpoints.
Tests all CRUD operations + bulk endpoints for generic masters.
"""
import requests
import json
import sys

# Backend URL from frontend/.env
BASE_URL = "https://hire-admin.preview.emergentagent.com/api"

# Test credentials
ADMIN_EMAIL = "admin@hireme.in"
ADMIN_PASSWORD = "admin123"

# Global token storage
TOKEN = None

def log(msg, level="INFO"):
    """Print formatted log message"""
    print(f"[{level}] {msg}")

def login():
    """Login and get Bearer token"""
    global TOKEN
    log("Logging in as admin...")
    url = f"{BASE_URL}/auth/login"
    payload = {"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
    
    try:
        resp = requests.post(url, json=payload, timeout=10)
        if resp.status_code != 200:
            log(f"Login failed: {resp.status_code} - {resp.text}", "ERROR")
            return False
        
        data = resp.json()
        TOKEN = data.get("access_token")
        if not TOKEN:
            log("No access_token in login response", "ERROR")
            return False
        
        log(f"Login successful. User: {data.get('user', {}).get('name')}")
        return True
    except Exception as e:
        log(f"Login exception: {e}", "ERROR")
        return False

def get_headers():
    """Get headers with Bearer token"""
    return {"Authorization": f"Bearer {TOKEN}"}

def test_master_crud(path, create_payload, update_payload, name_field="name"):
    """
    Test full CRUD operations for a master endpoint.
    Returns (success, error_message)
    """
    log(f"\n{'='*60}")
    log(f"Testing: {path}")
    log(f"{'='*60}")
    
    # 1. GET list (should return 200 with array)
    log(f"1. GET /{path} - List")
    try:
        resp = requests.get(f"{BASE_URL}/{path}", headers=get_headers(), timeout=10)
        if resp.status_code != 200:
            return False, f"GET /{path} returned {resp.status_code}, expected 200"
        
        items = resp.json()
        if not isinstance(items, list):
            return False, f"GET /{path} did not return array, got {type(items)}"
        
        initial_count = len(items)
        log(f"   ✓ GET /{path} returned {initial_count} items")
    except Exception as e:
        return False, f"GET /{path} exception: {e}"
    
    # 2. POST create
    log(f"2. POST /{path} - Create")
    try:
        resp = requests.post(f"{BASE_URL}/{path}", json=create_payload, headers=get_headers(), timeout=10)
        if resp.status_code not in [200, 201]:
            return False, f"POST /{path} returned {resp.status_code}, expected 200/201. Response: {resp.text}"
        
        created = resp.json()
        if not created.get("id"):
            return False, f"POST /{path} response missing 'id' field"
        
        created_id = created["id"]
        log(f"   ✓ POST /{path} created item with id: {created_id}")
        
        # Verify all fields persisted
        for key, value in create_payload.items():
            if key not in created:
                return False, f"POST /{path} response missing field '{key}'"
            if created[key] != value:
                return False, f"POST /{path} field '{key}' mismatch: expected {value}, got {created[key]}"
        
        log(f"   ✓ All fields persisted correctly")
    except Exception as e:
        return False, f"POST /{path} exception: {e}"
    
    # 3. GET list again (should have +1 item)
    log(f"3. GET /{path} - Verify creation")
    try:
        resp = requests.get(f"{BASE_URL}/{path}", headers=get_headers(), timeout=10)
        items = resp.json()
        new_count = len(items)
        if new_count != initial_count + 1:
            return False, f"GET /{path} count mismatch: expected {initial_count + 1}, got {new_count}"
        
        log(f"   ✓ GET /{path} now has {new_count} items (+1)")
    except Exception as e:
        return False, f"GET /{path} verification exception: {e}"
    
    # 4. PUT update
    log(f"4. PUT /{path}/{created_id} - Update")
    try:
        resp = requests.put(f"{BASE_URL}/{path}/{created_id}", json=update_payload, headers=get_headers(), timeout=10)
        if resp.status_code != 200:
            return False, f"PUT /{path}/{created_id} returned {resp.status_code}, expected 200. Response: {resp.text}"
        
        updated = resp.json()
        for key, value in update_payload.items():
            if key not in updated:
                return False, f"PUT /{path} response missing field '{key}'"
            if updated[key] != value:
                return False, f"PUT /{path} field '{key}' not updated: expected {value}, got {updated[key]}"
        
        log(f"   ✓ PUT /{path}/{created_id} updated successfully")
    except Exception as e:
        return False, f"PUT /{path} exception: {e}"
    
    # 5. DELETE
    log(f"5. DELETE /{path}/{created_id}")
    try:
        resp = requests.delete(f"{BASE_URL}/{path}/{created_id}", headers=get_headers(), timeout=10)
        if resp.status_code != 200:
            return False, f"DELETE /{path}/{created_id} returned {resp.status_code}, expected 200"
        
        result = resp.json()
        if not result.get("success"):
            return False, f"DELETE /{path} did not return success:true"
        
        log(f"   ✓ DELETE /{path}/{created_id} successful")
    except Exception as e:
        return False, f"DELETE /{path} exception: {e}"
    
    # 6. Verify deletion
    log(f"6. GET /{path} - Verify deletion")
    try:
        resp = requests.get(f"{BASE_URL}/{path}", headers=get_headers(), timeout=10)
        items = resp.json()
        final_count = len(items)
        if final_count != initial_count:
            return False, f"GET /{path} count after delete: expected {initial_count}, got {final_count}"
        
        log(f"   ✓ GET /{path} back to {final_count} items (deletion verified)")
    except Exception as e:
        return False, f"GET /{path} deletion verification exception: {e}"
    
    log(f"✅ {path} - ALL CRUD TESTS PASSED")
    return True, None

def test_bulk_endpoint(path, bulk_items):
    """
    Test bulk creation endpoint.
    Returns (success, error_message)
    """
    log(f"\n{'='*60}")
    log(f"Testing BULK: {path}/bulk")
    log(f"{'='*60}")
    
    # Get initial count
    try:
        resp = requests.get(f"{BASE_URL}/{path}", headers=get_headers(), timeout=10)
        initial_count = len(resp.json())
        log(f"Initial count: {initial_count}")
    except Exception as e:
        return False, f"GET /{path} before bulk exception: {e}"
    
    # POST bulk
    log(f"POST /{path}/bulk with {len(bulk_items)} items")
    try:
        payload = {"items": bulk_items}
        resp = requests.post(f"{BASE_URL}/{path}/bulk", json=payload, headers=get_headers(), timeout=10)
        if resp.status_code not in [200, 201]:
            return False, f"POST /{path}/bulk returned {resp.status_code}, expected 200/201. Response: {resp.text}"
        
        result = resp.json()
        inserted = result.get("inserted")
        if inserted != len(bulk_items):
            return False, f"POST /{path}/bulk returned inserted:{inserted}, expected {len(bulk_items)}"
        
        log(f"   ✓ Bulk insert returned inserted:{inserted}")
    except Exception as e:
        return False, f"POST /{path}/bulk exception: {e}"
    
    # Verify count increased
    try:
        resp = requests.get(f"{BASE_URL}/{path}", headers=get_headers(), timeout=10)
        items = resp.json()
        new_count = len(items)
        expected_count = initial_count + len(bulk_items)
        if new_count != expected_count:
            return False, f"GET /{path} after bulk: expected {expected_count}, got {new_count}"
        
        log(f"   ✓ GET /{path} now has {new_count} items (+{len(bulk_items)})")
        
        # Clean up - delete the bulk inserted items
        log(f"Cleaning up {len(bulk_items)} bulk items...")
        for item in items[-len(bulk_items):]:
            requests.delete(f"{BASE_URL}/{path}/{item['id']}", headers=get_headers(), timeout=10)
        
        log(f"   ✓ Cleanup complete")
    except Exception as e:
        return False, f"GET /{path} after bulk exception: {e}"
    
    log(f"✅ {path}/bulk - BULK TEST PASSED")
    return True, None

def test_validation(path):
    """Test validation - empty name should return 400"""
    log(f"\n{'='*60}")
    log(f"Testing VALIDATION: {path}")
    log(f"{'='*60}")
    
    log(f"POST /{path} with empty name")
    try:
        resp = requests.post(f"{BASE_URL}/{path}", json={"name": ""}, headers=get_headers(), timeout=10)
        if resp.status_code != 400:
            return False, f"POST /{path} with empty name returned {resp.status_code}, expected 400"
        
        log(f"   ✓ Empty name correctly returns 400")
    except Exception as e:
        return False, f"Validation test exception: {e}"
    
    log(f"✅ {path} - VALIDATION TEST PASSED")
    return True, None

def test_auth_required(path):
    """Test that endpoint requires authentication"""
    log(f"\n{'='*60}")
    log(f"Testing AUTH REQUIRED: {path}")
    log(f"{'='*60}")
    
    log(f"GET /{path} without Bearer token")
    try:
        resp = requests.get(f"{BASE_URL}/{path}", timeout=10)
        if resp.status_code not in [401, 403]:
            return False, f"GET /{path} without token returned {resp.status_code}, expected 401/403"
        
        log(f"   ✓ No token correctly returns {resp.status_code}")
    except Exception as e:
        return False, f"Auth test exception: {e}"
    
    log(f"✅ {path} - AUTH TEST PASSED")
    return True, None

def main():
    """Main test runner"""
    log("="*60)
    log("HireMe Admin Backend - NEW Master Endpoints Test")
    log("="*60)
    
    # Login first
    if not login():
        log("Login failed, cannot proceed", "ERROR")
        sys.exit(1)
    
    results = []
    
    # Test 1: Languages
    success, error = test_master_crud(
        "languages",
        {"name": "English", "status": True},
        {"status": False}
    )
    results.append(("languages CRUD", success, error))
    
    # Test 2: Currencies (with code & symbol)
    success, error = test_master_crud(
        "currencies",
        {"name": "Indian Rupee", "code": "INR", "symbol": "₹", "status": True},
        {"status": False}
    )
    results.append(("currencies CRUD", success, error))
    
    # Test 3: Email Templates (with all fields)
    success, error = test_master_crud(
        "email-templates",
        {
            "name": "Welcome Email",
            "key": "welcome",
            "subject": "Welcome!",
            "recipient": "Candidate",
            "dispatch": True,
            "body": "<p>Hi</p>",
            "status": True
        },
        {"dispatch": False}
    )
    results.append(("email-templates CRUD", success, error))
    
    # Test 4: Company FAQs (with answer)
    success, error = test_master_crud(
        "company-faqs",
        {"name": "What is HireMe?", "answer": "A job portal", "status": True},
        {"status": False}
    )
    results.append(("company-faqs CRUD", success, error))
    
    # Test 5: Function Roles (with category)
    success, error = test_master_crud(
        "function-roles",
        {"name": "Backend Engineer", "category": "Software", "status": True},
        {"status": False}
    )
    results.append(("function-roles CRUD", success, error))
    
    # Test 6-17: Simple masters (name + status only)
    simple_masters = [
        "perk-benefits",
        "notice-periods",
        "company-types",
        "company-sizes",
        "company-subscriptions",
        "candidate-faqs",
        "job-types",
        "function-role-categories",
        "experience-levels",
        "workplace-types",
        "salary-options",
        "perk-benefit-categories"
    ]
    
    for master in simple_masters:
        # For perk-benefits and candidate-faqs, add required fields
        if master == "perk-benefits":
            create_payload = {"name": "Test Perk", "category": "Health", "status": True}
        elif master == "candidate-faqs":
            create_payload = {"name": "Test FAQ", "answer": "Test answer", "status": True}
        else:
            create_payload = {"name": "Test Item", "status": True}
        
        success, error = test_master_crud(
            master,
            create_payload,
            {"status": False}
        )
        results.append((f"{master} CRUD", success, error))
    
    # Test 18: Bulk endpoint on languages
    success, error = test_bulk_endpoint(
        "languages",
        [
            {"name": "Hindi"},
            {"name": "Tamil"},
            {"name": "Telugu"}
        ]
    )
    results.append(("languages bulk", success, error))
    
    # Test 19: Bulk endpoint on education-categories
    success, error = test_bulk_endpoint(
        "education-categories",
        [
            {"name": "MBA", "trending": True},
            {"name": "MCA"}
        ]
    )
    results.append(("education-categories bulk", success, error))
    
    # Test 20: Validation on currencies
    success, error = test_validation("currencies")
    results.append(("currencies validation", success, error))
    
    # Test 21: Auth required on languages
    success, error = test_auth_required("languages")
    results.append(("languages auth", success, error))
    
    # Print summary
    log("\n" + "="*60)
    log("TEST SUMMARY")
    log("="*60)
    
    passed = 0
    failed = 0
    
    for test_name, success, error in results:
        if success:
            log(f"✅ {test_name}", "PASS")
            passed += 1
        else:
            log(f"❌ {test_name}: {error}", "FAIL")
            failed += 1
    
    log("="*60)
    log(f"Total: {len(results)} | Passed: {passed} | Failed: {failed}")
    log("="*60)
    
    if failed > 0:
        sys.exit(1)
    else:
        log("ALL TESTS PASSED! 🎉", "SUCCESS")
        sys.exit(0)

if __name__ == "__main__":
    main()
