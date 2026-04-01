import requests
import sys
from datetime import datetime
import json

class PlacementPlatformTester:
    def __init__(self, base_url="http://localhost:8001"):
        self.base_url = base_url
        self.tpo_token = None
        self.student_token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.session = requests.Session()

    def run_test(self, name, method, endpoint, expected_status, data=None, cookies=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        if headers:
            test_headers.update(headers)

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = self.session.get(url, headers=test_headers, cookies=cookies)
            elif method == 'POST':
                response = self.session.post(url, json=data, headers=test_headers, cookies=cookies)
            elif method == 'PATCH':
                response = self.session.patch(url, json=data, headers=test_headers, cookies=cookies)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    print(f"   Response: {json.dumps(response_data, indent=2)[:200]}...")
                except:
                    print(f"   Response: {response.text[:100]}...")
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text}")

            return success, response

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, None

    def test_tpo_login(self):
        """Test TPO login and store cookies"""
        success, response = self.run_test(
            "TPO Login",
            "POST",
            "api/auth/login",
            200,
            data={"email": "tpo@college.edu", "password": "tpo123"}
        )
        if success and response:
            # Store cookies for future requests
            self.tpo_cookies = response.cookies
            return True
        return False

    def test_student_login(self):
        """Test Student login and store cookies"""
        success, response = self.run_test(
            "Student Login",
            "POST",
            "api/auth/login",
            200,
            data={"email": "student@college.edu", "password": "student123"}
        )
        if success and response:
            # Store cookies for future requests
            self.student_cookies = response.cookies
            return True
        return False

    def test_tpo_dashboard_stats(self):
        """Test TPO dashboard stats endpoint"""
        return self.run_test(
            "TPO Dashboard Stats",
            "GET",
            "api/tpo/dashboard/stats",
            200,
            cookies=self.tpo_cookies
        )[0]

    def test_tpo_skill_gaps(self):
        """Test TPO skill gaps endpoint"""
        return self.run_test(
            "TPO Skill Gaps",
            "GET",
            "api/tpo/dashboard/skill-gaps",
            200,
            cookies=self.tpo_cookies
        )[0]

    def test_tpo_readiness(self):
        """Test TPO readiness distribution endpoint"""
        return self.run_test(
            "TPO Readiness Distribution",
            "GET",
            "api/tpo/dashboard/readiness",
            200,
            cookies=self.tpo_cookies
        )[0]

    def test_tpo_companies(self):
        """Test TPO companies list endpoint"""
        return self.run_test(
            "TPO Companies List",
            "GET",
            "api/tpo/companies",
            200,
            cookies=self.tpo_cookies
        )[0]

    def test_tpo_create_company(self):
        """Test TPO create company endpoint"""
        company_data = {
            "company_name": "Test Company",
            "role": "Software Engineer",
            "date": "2026-03-15",
            "eligibility": "CGPA >= 7.0",
            "status": "active",
            "package": "15 LPA"
        }
        return self.run_test(
            "TPO Create Company",
            "POST",
            "api/tpo/companies",
            200,
            data=company_data,
            cookies=self.tpo_cookies
        )[0]

    def test_tpo_students(self):
        """Test TPO students list endpoint"""
        return self.run_test(
            "TPO Students List",
            "GET",
            "api/tpo/students",
            200,
            cookies=self.tpo_cookies
        )[0]

    def test_student_dashboard_stats(self):
        """Test Student dashboard stats endpoint"""
        return self.run_test(
            "Student Dashboard Stats",
            "GET",
            "api/student/dashboard/stats",
            200,
            cookies=self.student_cookies
        )[0]

    def test_student_companies(self):
        """Test Student companies list endpoint"""
        return self.run_test(
            "Student Companies List",
            "GET",
            "api/student/companies",
            200,
            cookies=self.student_cookies
        )[0]

    def test_student_create_roadmap(self):
        """Test Student create roadmap endpoint"""
        roadmap_data = {
            "company_id": "comp1",
            "company_name": "Google",
            "role": "SDE"
        }
        return self.run_test(
            "Student Create Roadmap",
            "POST",
            "api/student/roadmaps",
            200,
            data=roadmap_data,
            cookies=self.student_cookies
        )[0]

    def test_student_roadmaps(self):
        """Test Student roadmaps list endpoint"""
        return self.run_test(
            "Student Roadmaps List",
            "GET",
            "api/student/roadmaps",
            200,
            cookies=self.student_cookies
        )[0]

    def test_student_progress(self):
        """Test Student progress endpoint"""
        return self.run_test(
            "Student Progress List",
            "GET",
            "api/student/progress",
            200,
            cookies=self.student_cookies
        )[0]

    def test_auth_me_tpo(self):
        """Test auth/me endpoint with TPO credentials"""
        return self.run_test(
            "Auth Me (TPO)",
            "GET",
            "api/auth/me",
            200,
            cookies=self.tpo_cookies
        )[0]

    def test_auth_me_student(self):
        """Test auth/me endpoint with Student credentials"""
        return self.run_test(
            "Auth Me (Student)",
            "GET",
            "api/auth/me",
            200,
            cookies=self.student_cookies
        )[0]

    def test_logout(self):
        """Test logout endpoint"""
        return self.run_test(
            "Logout",
            "POST",
            "api/auth/logout",
            200,
            cookies=self.tpo_cookies
        )[0]

    def test_role_based_access_control(self):
        """Test that students can't access TPO endpoints and vice versa"""
        print("\n🔒 Testing Role-Based Access Control...")
        
        # Student trying to access TPO endpoint
        student_access_tpo = self.run_test(
            "Student Access TPO Dashboard (Should Fail)",
            "GET",
            "api/tpo/dashboard/stats",
            403,
            cookies=self.student_cookies
        )[0]
        
        # TPO trying to access Student endpoint  
        tpo_access_student = self.run_test(
            "TPO Access Student Dashboard (Should Fail)",
            "GET",
            "api/student/dashboard/stats",
            403,
            cookies=self.tpo_cookies
        )[0]
        
        return student_access_tpo and tpo_access_student

def main():
    print("🚀 Starting Placement Platform API Tests...")
    tester = PlacementPlatformTester()
    
    # Test authentication first
    print("\n" + "="*50)
    print("AUTHENTICATION TESTS")
    print("="*50)
    
    if not tester.test_tpo_login():
        print("❌ TPO login failed, stopping tests")
        return 1
    
    if not tester.test_student_login():
        print("❌ Student login failed, stopping tests")
        return 1

    # Test auth/me endpoints
    tester.test_auth_me_tpo()
    tester.test_auth_me_student()

    # Test TPO endpoints
    print("\n" + "="*50)
    print("TPO ENDPOINTS TESTS")
    print("="*50)
    
    tester.test_tpo_dashboard_stats()
    tester.test_tpo_skill_gaps()
    tester.test_tpo_readiness()
    tester.test_tpo_companies()
    tester.test_tpo_create_company()
    tester.test_tpo_students()

    # Test Student endpoints
    print("\n" + "="*50)
    print("STUDENT ENDPOINTS TESTS")
    print("="*50)
    
    tester.test_student_dashboard_stats()
    tester.test_student_companies()
    tester.test_student_create_roadmap()
    tester.test_student_roadmaps()
    tester.test_student_progress()

    # Test role-based access control
    print("\n" + "="*50)
    print("ROLE-BASED ACCESS CONTROL TESTS")
    print("="*50)
    
    tester.test_role_based_access_control()

    # Test logout
    print("\n" + "="*50)
    print("LOGOUT TESTS")
    print("="*50)
    
    tester.test_logout()

    # Print final results
    print("\n" + "="*50)
    print("FINAL RESULTS")
    print("="*50)
    print(f"📊 Tests passed: {tester.tests_passed}/{tester.tests_run}")
    success_rate = (tester.tests_passed / tester.tests_run) * 100 if tester.tests_run > 0 else 0
    print(f"📈 Success rate: {success_rate:.1f}%")
    
    if success_rate >= 90:
        print("🎉 Excellent! Backend APIs are working well.")
    elif success_rate >= 70:
        print("⚠️  Good, but some issues need attention.")
    else:
        print("❌ Multiple issues found. Backend needs fixes.")
    
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())