#!/usr/bin/env python3
"""
Comprehensive backend API test for HireMe Admin Companies endpoints.
Tests all CRUD operations, authentication, validation, and dashboard integration.
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
        
        user = data.get('user', {})
        log(f"Login successful. User: {user.get('name')}, Role: {user.get('role')}")
        return True
    except Exception as e:
        log(f"Login exception: {e}", "ERROR")
        return False

def get_headers():
    """Get headers with Bearer token"""
    return {"Authorization": f"Bearer {TOKEN}"}

def test_1_get_companies_list():
    """Test 1: GET /api/companies -> 200, returns an array"""
    log("\n" + "="*60)
    log("TEST 1: GET /api/companies - List companies")
    log("="*60)
    
    try:
        resp = requests.get(f"{BASE_URL}/companies", headers=get_headers(), timeout=10)
        if resp.status_code != 200:
            return False, f"GET /companies returned {resp.status_code}, expected 200. Response: {resp.text}"
        
        companies = resp.json()
        if not isinstance(companies, list):
            return False, f"GET /companies did not return array, got {type(companies)}"
        
        log(f"✓ GET /companies returned 200 with array of {len(companies)} companies")
        return True, None
    except Exception as e:
        return False, f"GET /companies exception: {e}"

def test_2_create_maxgen_company():
    """Test 2: POST /api/companies with full Maxgen Technologies data"""
    log("\n" + "="*60)
    log("TEST 2: POST /api/companies - Create Maxgen Technologies")
    log("="*60)
    
    payload = {
        "name": "Maxgen Technologies",
        "slug": "maxgen-technologies",
        "website": "https://maxgen.com",
        "foundedYear": "2015",
        "gst": "22AAAAA0000A1Z5",
        "about": "An IT company",
        "industry": "Software",
        "subIndustry": "Web Development",
        "companySize": "51-200",
        "logo": "",
        "banner": "",
        "status": "active",
        "trending": True
    }
    
    try:
        resp = requests.post(f"{BASE_URL}/companies", json=payload, headers=get_headers(), timeout=10)
        if resp.status_code not in [200, 201]:
            return False, f"POST /companies returned {resp.status_code}, expected 200/201. Response: {resp.text}"
        
        created = resp.json()
        
        # Check for id
        if not created.get("id"):
            return False, "POST /companies response missing 'id' field"
        
        company_id = created["id"]
        log(f"✓ Company created with id: {company_id}")
        
        # Verify ALL fields persisted
        required_fields = ["name", "slug", "website", "foundedYear", "gst", "about", 
                          "industry", "subIndustry", "companySize", "logo", "banner", 
                          "status", "trending"]
        
        for field in required_fields:
            if field not in created:
                return False, f"Response missing field '{field}'"
            if created[field] != payload[field]:
                return False, f"Field '{field}' mismatch: expected {payload[field]}, got {created[field]}"
        
        # Check updatedBy and updatedAt
        if not created.get("updatedBy"):
            return False, "Response missing 'updatedBy' field"
        if created["updatedBy"] != "Komal Saini":
            return False, f"updatedBy should be 'Komal Saini', got '{created['updatedBy']}'"
        
        if not created.get("updatedAt"):
            return False, "Response missing 'updatedAt' field"
        
        log(f"✓ All fields persisted correctly")
        log(f"✓ updatedBy: {created['updatedBy']}")
        log(f"✓ updatedAt: {created['updatedAt']}")
        log(f"✓ status: {created['status']}")
        log(f"✓ trending: {created['trending']}")
        
        return True, company_id
    except Exception as e:
        return False, f"POST /companies exception: {e}"

def test_3_get_company_by_id(company_id):
    """Test 3: GET /api/companies/{id} -> returns that company"""
    log("\n" + "="*60)
    log(f"TEST 3: GET /api/companies/{company_id} - Get company by ID")
    log("="*60)
    
    try:
        resp = requests.get(f"{BASE_URL}/companies/{company_id}", headers=get_headers(), timeout=10)
        if resp.status_code != 200:
            return False, f"GET /companies/{company_id} returned {resp.status_code}, expected 200. Response: {resp.text}"
        
        company = resp.json()
        
        if company.get("id") != company_id:
            return False, f"Company id mismatch: expected {company_id}, got {company.get('id')}"
        
        if company.get("name") != "Maxgen Technologies":
            return False, f"Company name mismatch: expected 'Maxgen Technologies', got '{company.get('name')}'"
        
        log(f"✓ GET /companies/{company_id} returned correct company")
        log(f"✓ Name: {company.get('name')}")
        log(f"✓ Status: {company.get('status')}")
        
        return True, None
    except Exception as e:
        return False, f"GET /companies/{company_id} exception: {e}"

def test_4_update_company(company_id):
    """Test 4: PUT /api/companies/{id} with status='blocked', trending=false"""
    log("\n" + "="*60)
    log(f"TEST 4: PUT /api/companies/{company_id} - Update status and trending")
    log("="*60)
    
    payload = {
        "status": "blocked",
        "trending": False
    }
    
    try:
        resp = requests.put(f"{BASE_URL}/companies/{company_id}", json=payload, headers=get_headers(), timeout=10)
        if resp.status_code != 200:
            return False, f"PUT /companies/{company_id} returned {resp.status_code}, expected 200. Response: {resp.text}"
        
        updated = resp.json()
        
        if updated.get("status") != "blocked":
            return False, f"Status not updated: expected 'blocked', got '{updated.get('status')}'"
        
        if updated.get("trending") != False:
            return False, f"Trending not updated: expected False, got {updated.get('trending')}"
        
        log(f"✓ PUT /companies/{company_id} updated successfully")
        log(f"✓ status: {updated.get('status')}")
        log(f"✓ trending: {updated.get('trending')}")
        
        return True, None
    except Exception as e:
        return False, f"PUT /companies/{company_id} exception: {e}"

def test_5_create_acme_company():
    """Test 5: POST another company with only name='Acme' -> should default status='pending' and trending=false"""
    log("\n" + "="*60)
    log("TEST 5: POST /api/companies - Create Acme with minimal data")
    log("="*60)
    
    payload = {
        "name": "Acme"
    }
    
    try:
        resp = requests.post(f"{BASE_URL}/companies", json=payload, headers=get_headers(), timeout=10)
        if resp.status_code not in [200, 201]:
            return False, f"POST /companies returned {resp.status_code}, expected 200/201. Response: {resp.text}"
        
        created = resp.json()
        
        if not created.get("id"):
            return False, "POST /companies response missing 'id' field"
        
        acme_id = created["id"]
        log(f"✓ Acme company created with id: {acme_id}")
        
        # Check defaults
        if created.get("status") != "pending":
            return False, f"Default status should be 'pending', got '{created.get('status')}'"
        
        if created.get("trending") != False:
            return False, f"Default trending should be False, got {created.get('trending')}"
        
        log(f"✓ Default status: {created.get('status')}")
        log(f"✓ Default trending: {created.get('trending')}")
        
        return True, acme_id
    except Exception as e:
        return False, f"POST /companies exception: {e}"

def test_6_get_companies_confirm_both(maxgen_id, acme_id):
    """Test 6: GET /api/companies -> confirm both companies present"""
    log("\n" + "="*60)
    log("TEST 6: GET /api/companies - Confirm both companies present")
    log("="*60)
    
    try:
        resp = requests.get(f"{BASE_URL}/companies", headers=get_headers(), timeout=10)
        if resp.status_code != 200:
            return False, f"GET /companies returned {resp.status_code}, expected 200"
        
        companies = resp.json()
        
        company_ids = [c.get("id") for c in companies]
        
        if maxgen_id not in company_ids:
            return False, f"Maxgen company (id: {maxgen_id}) not found in list"
        
        if acme_id not in company_ids:
            return False, f"Acme company (id: {acme_id}) not found in list"
        
        log(f"✓ Both companies present in list")
        log(f"✓ Total companies: {len(companies)}")
        
        return True, None
    except Exception as e:
        return False, f"GET /companies exception: {e}"

def test_7_delete_company(company_id):
    """Test 7: DELETE /api/companies/{id} -> {success:true}; GET confirms it's removed"""
    log("\n" + "="*60)
    log(f"TEST 7: DELETE /api/companies/{company_id}")
    log("="*60)
    
    try:
        # Delete
        resp = requests.delete(f"{BASE_URL}/companies/{company_id}", headers=get_headers(), timeout=10)
        if resp.status_code != 200:
            return False, f"DELETE /companies/{company_id} returned {resp.status_code}, expected 200. Response: {resp.text}"
        
        result = resp.json()
        if not result.get("success"):
            return False, f"DELETE response should have success:true, got {result}"
        
        log(f"✓ DELETE /companies/{company_id} returned success:true")
        
        # Verify deletion
        resp = requests.get(f"{BASE_URL}/companies", headers=get_headers(), timeout=10)
        companies = resp.json()
        company_ids = [c.get("id") for c in companies]
        
        if company_id in company_ids:
            return False, f"Company {company_id} still present after deletion"
        
        log(f"✓ Company {company_id} confirmed removed from list")
        
        return True, None
    except Exception as e:
        return False, f"DELETE /companies exception: {e}"

def test_8_auth_required():
    """Test 8: GET/POST/PUT/DELETE /api/companies without Bearer token -> 401/403"""
    log("\n" + "="*60)
    log("TEST 8: Authentication required for all endpoints")
    log("="*60)
    
    try:
        # GET without token
        resp = requests.get(f"{BASE_URL}/companies", timeout=10)
        if resp.status_code not in [401, 403]:
            return False, f"GET /companies without token returned {resp.status_code}, expected 401/403"
        log(f"✓ GET /companies without token: {resp.status_code}")
        
        # POST without token
        resp = requests.post(f"{BASE_URL}/companies", json={"name": "Test"}, timeout=10)
        if resp.status_code not in [401, 403]:
            return False, f"POST /companies without token returned {resp.status_code}, expected 401/403"
        log(f"✓ POST /companies without token: {resp.status_code}")
        
        # PUT without token
        resp = requests.put(f"{BASE_URL}/companies/fake-id", json={"name": "Test"}, timeout=10)
        if resp.status_code not in [401, 403]:
            return False, f"PUT /companies without token returned {resp.status_code}, expected 401/403"
        log(f"✓ PUT /companies without token: {resp.status_code}")
        
        # DELETE without token
        resp = requests.delete(f"{BASE_URL}/companies/fake-id", timeout=10)
        if resp.status_code not in [401, 403]:
            return False, f"DELETE /companies without token returned {resp.status_code}, expected 401/403"
        log(f"✓ DELETE /companies without token: {resp.status_code}")
        
        return True, None
    except Exception as e:
        return False, f"Auth test exception: {e}"

def test_9_validation_empty_name():
    """Test 9: POST /api/companies with empty name -> 400"""
    log("\n" + "="*60)
    log("TEST 9: Validation - empty name should return 400")
    log("="*60)
    
    try:
        resp = requests.post(f"{BASE_URL}/companies", json={"name": ""}, headers=get_headers(), timeout=10)
        if resp.status_code != 400:
            return False, f"POST /companies with empty name returned {resp.status_code}, expected 400. Response: {resp.text}"
        
        log(f"✓ Empty name correctly returns 400")
        
        return True, None
    except Exception as e:
        return False, f"Validation test exception: {e}"

def test_10_404_handling():
    """Test 10: GET/PUT/DELETE /api/companies/{nonexistent-id} -> 404"""
    log("\n" + "="*60)
    log("TEST 10: 404 handling for non-existent company")
    log("="*60)
    
    fake_id = "nonexistent-company-id-12345"
    
    try:
        # GET non-existent
        resp = requests.get(f"{BASE_URL}/companies/{fake_id}", headers=get_headers(), timeout=10)
        if resp.status_code != 404:
            return False, f"GET /companies/{fake_id} returned {resp.status_code}, expected 404"
        log(f"✓ GET non-existent company: 404")
        
        # PUT non-existent
        resp = requests.put(f"{BASE_URL}/companies/{fake_id}", json={"name": "Test"}, headers=get_headers(), timeout=10)
        if resp.status_code != 404:
            return False, f"PUT /companies/{fake_id} returned {resp.status_code}, expected 404"
        log(f"✓ PUT non-existent company: 404")
        
        # DELETE non-existent
        resp = requests.delete(f"{BASE_URL}/companies/{fake_id}", headers=get_headers(), timeout=10)
        if resp.status_code != 404:
            return False, f"DELETE /companies/{fake_id} returned {resp.status_code}, expected 404"
        log(f"✓ DELETE non-existent company: 404")
        
        return True, None
    except Exception as e:
        return False, f"404 test exception: {e}"

def test_11_dashboard_active_companies_count():
    """Test 11: GET /api/dashboard -> 'ACTIVE COMPANIES' stat reflects count of companies with status='active'"""
    log("\n" + "="*60)
    log("TEST 11: Dashboard - ACTIVE COMPANIES count")
    log("="*60)
    
    try:
        # First, count active companies directly
        resp = requests.get(f"{BASE_URL}/companies", headers=get_headers(), timeout=10)
        if resp.status_code != 200:
            return False, f"GET /companies returned {resp.status_code}"
        
        companies = resp.json()
        active_count = sum(1 for c in companies if c.get("status") == "active")
        log(f"✓ Direct count of active companies: {active_count}")
        
        # Now check dashboard
        resp = requests.get(f"{BASE_URL}/dashboard", headers=get_headers(), timeout=10)
        if resp.status_code != 200:
            return False, f"GET /dashboard returned {resp.status_code}, expected 200. Response: {resp.text}"
        
        dashboard = resp.json()
        
        if "stats" not in dashboard:
            return False, "Dashboard response missing 'stats' field"
        
        stats = dashboard["stats"]
        if not isinstance(stats, list):
            return False, f"Dashboard stats should be array, got {type(stats)}"
        
        # Find ACTIVE COMPANIES stat
        active_companies_stat = None
        for stat in stats:
            if stat.get("label") == "ACTIVE COMPANIES":
                active_companies_stat = stat
                break
        
        if not active_companies_stat:
            return False, "Dashboard stats missing 'ACTIVE COMPANIES' entry"
        
        dashboard_count = active_companies_stat.get("value")
        log(f"✓ Dashboard ACTIVE COMPANIES count: {dashboard_count}")
        
        if dashboard_count != active_count:
            return False, f"Dashboard count mismatch: expected {active_count}, got {dashboard_count}"
        
        log(f"✓ Dashboard ACTIVE COMPANIES count matches actual count: {active_count}")
        
        return True, None
    except Exception as e:
        return False, f"Dashboard test exception: {e}"

def main():
    """Main test runner"""
    log("="*60)
    log("HireMe Admin Backend - Companies Endpoints Test")
    log("="*60)
    
    # Login first
    if not login():
        log("Login failed, cannot proceed", "ERROR")
        sys.exit(1)
    
    results = []
    maxgen_id = None
    acme_id = None
    
    # Test 1: GET companies list
    success, error = test_1_get_companies_list()
    results.append(("1. GET /companies list", success, error))
    if not success:
        log(f"Test 1 failed: {error}", "ERROR")
    
    # Test 2: Create Maxgen Technologies
    success, result = test_2_create_maxgen_company()
    if success:
        maxgen_id = result
        results.append(("2. POST /companies (Maxgen)", True, None))
    else:
        results.append(("2. POST /companies (Maxgen)", False, result))
        log(f"Test 2 failed: {result}", "ERROR")
    
    # Test 3: Get company by ID
    if maxgen_id:
        success, error = test_3_get_company_by_id(maxgen_id)
        results.append(("3. GET /companies/{id}", success, error))
        if not success:
            log(f"Test 3 failed: {error}", "ERROR")
    else:
        results.append(("3. GET /companies/{id}", False, "Skipped - no company ID"))
    
    # Test 4: Update company
    if maxgen_id:
        success, error = test_4_update_company(maxgen_id)
        results.append(("4. PUT /companies/{id}", success, error))
        if not success:
            log(f"Test 4 failed: {error}", "ERROR")
    else:
        results.append(("4. PUT /companies/{id}", False, "Skipped - no company ID"))
    
    # Test 5: Create Acme company
    success, result = test_5_create_acme_company()
    if success:
        acme_id = result
        results.append(("5. POST /companies (Acme, defaults)", True, None))
    else:
        results.append(("5. POST /companies (Acme, defaults)", False, result))
        log(f"Test 5 failed: {result}", "ERROR")
    
    # Test 6: Confirm both companies
    if maxgen_id and acme_id:
        success, error = test_6_get_companies_confirm_both(maxgen_id, acme_id)
        results.append(("6. GET /companies (both present)", success, error))
        if not success:
            log(f"Test 6 failed: {error}", "ERROR")
    else:
        results.append(("6. GET /companies (both present)", False, "Skipped - missing company IDs"))
    
    # Test 7: Delete company
    if acme_id:
        success, error = test_7_delete_company(acme_id)
        results.append(("7. DELETE /companies/{id}", success, error))
        if not success:
            log(f"Test 7 failed: {error}", "ERROR")
    else:
        results.append(("7. DELETE /companies/{id}", False, "Skipped - no company ID"))
    
    # Test 8: Auth required
    success, error = test_8_auth_required()
    results.append(("8. Auth required (401/403)", success, error))
    if not success:
        log(f"Test 8 failed: {error}", "ERROR")
    
    # Test 9: Validation
    success, error = test_9_validation_empty_name()
    results.append(("9. Validation (empty name -> 400)", success, error))
    if not success:
        log(f"Test 9 failed: {error}", "ERROR")
    
    # Test 10: 404 handling
    success, error = test_10_404_handling()
    results.append(("10. 404 handling", success, error))
    if not success:
        log(f"Test 10 failed: {error}", "ERROR")
    
    # Test 11: Dashboard active companies count
    success, error = test_11_dashboard_active_companies_count()
    results.append(("11. Dashboard ACTIVE COMPANIES", success, error))
    if not success:
        log(f"Test 11 failed: {error}", "ERROR")
    
    # Cleanup: Delete Maxgen if it still exists
    if maxgen_id:
        log("\n" + "="*60)
        log("CLEANUP: Deleting Maxgen company")
        log("="*60)
        try:
            resp = requests.delete(f"{BASE_URL}/companies/{maxgen_id}", headers=get_headers(), timeout=10)
            if resp.status_code == 200:
                log(f"✓ Maxgen company deleted")
            else:
                log(f"⚠ Could not delete Maxgen company: {resp.status_code}", "WARN")
        except Exception as e:
            log(f"⚠ Cleanup exception: {e}", "WARN")
    
    # Print summary
    log("\n" + "="*60)
    log("TEST SUMMARY")
    log("="*60)
    
    passed = 0
    failed = 0
    
    for test_name, success, error in results:
        if success:
            log(f"✅ PASS: {test_name}")
            passed += 1
        else:
            log(f"❌ FAIL: {test_name} - {error}")
            failed += 1
    
    log("="*60)
    log(f"Total: {len(results)} | Passed: {passed} | Failed: {failed}")
    log("="*60)
    
    if failed > 0:
        log("SOME TESTS FAILED", "ERROR")
        sys.exit(1)
    else:
        log("ALL TESTS PASSED! 🎉", "SUCCESS")
        sys.exit(0)

if __name__ == "__main__":
    main()
