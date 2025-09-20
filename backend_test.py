import requests
import sys
import json
from datetime import datetime

class CloudCareerCoachAPITester:
    def __init__(self, base_url="https://skillboost-17.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test results"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
        
        self.test_results.append({
            "name": name,
            "success": success,
            "details": details
        })

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        
        if headers:
            test_headers.update(headers)

        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=30)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=30)

            success = response.status_code == expected_status
            
            if success:
                self.log_test(name, True)
                try:
                    return response.json() if response.content else {}
                except:
                    return {}
            else:
                error_detail = f"Expected {expected_status}, got {response.status_code}"
                try:
                    error_response = response.json()
                    error_detail += f" - {error_response.get('detail', 'No error details')}"
                except:
                    error_detail += f" - Response: {response.text[:200]}"
                
                self.log_test(name, False, error_detail)
                return {}

        except requests.exceptions.Timeout:
            self.log_test(name, False, "Request timeout (30s)")
            return {}
        except Exception as e:
            self.log_test(name, False, f"Request error: {str(e)}")
            return {}

    def test_health_check(self):
        """Test basic health endpoints"""
        print("\n🔍 Testing Health Endpoints...")
        
        # Test root endpoint
        self.run_test("Root Endpoint", "GET", "", 200)
        
        # Test health endpoint
        self.run_test("Health Check", "GET", "health", 200)

    def test_authentication(self):
        """Test authentication endpoints"""
        print("\n🔍 Testing Authentication...")
        
        # Test user registration
        timestamp = datetime.now().strftime('%H%M%S')
        test_user_data = {
            "email": f"test{timestamp}@example.com",
            "full_name": "John Doe Test",
            "password": "password123"
        }
        
        register_response = self.run_test(
            "User Registration",
            "POST",
            "auth/register",
            200,
            data=test_user_data
        )
        
        if register_response and 'access_token' in register_response:
            self.token = register_response['access_token']
            print(f"   📝 Token obtained: {self.token[:20]}...")
        
        # Test user login with same credentials
        login_data = {
            "email": test_user_data["email"],
            "password": test_user_data["password"]
        }
        
        login_response = self.run_test(
            "User Login",
            "POST",
            "auth/login",
            200,
            data=login_data
        )
        
        # Test get current user
        if self.token:
            user_response = self.run_test(
                "Get Current User",
                "GET",
                "auth/me",
                200
            )
            
            if user_response and 'id' in user_response:
                self.user_id = user_response['id']
                print(f"   👤 User ID: {self.user_id}")
        
        # Test invalid login
        invalid_login = {
            "email": "invalid@example.com",
            "password": "wrongpassword"
        }
        
        self.run_test(
            "Invalid Login (Should Fail)",
            "POST",
            "auth/login",
            401,
            data=invalid_login
        )

    def test_assessment(self):
        """Test career assessment endpoints"""
        print("\n🔍 Testing Career Assessment...")
        
        if not self.token:
            print("   ⚠️ Skipping assessment tests - no authentication token")
            return
        
        # Test getting assessment (should be empty initially)
        self.run_test(
            "Get Assessment (Empty)",
            "GET",
            "assessment",
            200
        )
        
        # Test creating assessment
        assessment_data = {
            "current_role": "Cloud Engineer",
            "experience_level": "Intermediate (2-5 years)",
            "skills": ["AWS", "Docker", "Python", "Kubernetes"],
            "career_goals": "I want to become a Senior Cloud Architect and specialize in multi-cloud solutions."
        }
        
        print("   🤖 Testing AI-powered assessment generation (may take 10-15 seconds)...")
        assessment_response = self.run_test(
            "Create AI Assessment",
            "POST",
            "assessment",
            200,
            data=assessment_data
        )
        
        if assessment_response:
            # Verify assessment structure
            required_fields = ['career_roadmap', 'next_steps', 'current_role', 'skills']
            missing_fields = [field for field in required_fields if field not in assessment_response]
            
            if not missing_fields:
                self.log_test("Assessment Structure Validation", True)
                print(f"   📋 Career roadmap length: {len(assessment_response.get('career_roadmap', ''))}")
                print(f"   📝 Next steps count: {len(assessment_response.get('next_steps', []))}")
            else:
                self.log_test("Assessment Structure Validation", False, f"Missing fields: {missing_fields}")
        
        # Test getting assessment after creation
        self.run_test(
            "Get Assessment (After Creation)",
            "GET",
            "assessment",
            200
        )

    def test_motivation(self):
        """Test daily motivation endpoint"""
        print("\n🔍 Testing Daily Motivation...")
        
        print("   🤖 Testing AI-powered motivation generation (may take 10-15 seconds)...")
        motivation_response = self.run_test(
            "Get Daily Motivation",
            "GET",
            "motivation/daily",
            200
        )
        
        if motivation_response:
            # Verify motivation structure
            required_fields = ['quote', 'tip', 'category']
            missing_fields = [field for field in required_fields if field not in motivation_response]
            
            if not missing_fields:
                self.log_test("Motivation Structure Validation", True)
                print(f"   💬 Quote length: {len(motivation_response.get('quote', ''))}")
                print(f"   💡 Tip length: {len(motivation_response.get('tip', ''))}")
            else:
                self.log_test("Motivation Structure Validation", False, f"Missing fields: {missing_fields}")

    def test_premium_features(self):
        """Test premium study plans endpoints"""
        print("\n🔍 Testing Premium Features...")
        
        if not self.token:
            print("   ⚠️ Skipping premium tests - no authentication token")
            return
        
        # Test study plans access (should fail for free user)
        self.run_test(
            "Get Study Plans (Free User - Should Fail)",
            "GET",
            "study-plans",
            403
        )
        
        # Test generate study plan (should fail for free user)
        self.run_test(
            "Generate Study Plan (Free User - Should Fail)",
            "POST",
            "study-plans/generate?week_number=1",
            403
        )

    def test_payment_endpoints(self):
        """Test payment-related endpoints"""
        print("\n🔍 Testing Payment Endpoints...")
        
        if not self.token:
            print("   ⚠️ Skipping payment tests - no authentication token")
            return
        
        # Test checkout session creation (this will create a test session)
        print("   💳 Testing Stripe checkout session creation...")
        checkout_response = self.run_test(
            "Create Checkout Session (Monthly)",
            "POST",
            "payments/checkout?package_id=monthly",
            200,
            headers={'Origin': 'https://skillboost-17.preview.emergentagent.com'}
        )
        
        if checkout_response and 'session_id' in checkout_response:
            session_id = checkout_response['session_id']
            print(f"   🎫 Session ID: {session_id}")
            
            # Test payment status check
            self.run_test(
                "Check Payment Status",
                "GET",
                f"payments/status/{session_id}",
                200
            )

    def test_error_handling(self):
        """Test error handling scenarios"""
        print("\n🔍 Testing Error Handling...")
        
        # Test invalid endpoints
        self.run_test(
            "Invalid Endpoint",
            "GET",
            "nonexistent",
            404
        )
        
        # Test unauthorized access
        old_token = self.token
        self.token = "invalid_token"
        
        self.run_test(
            "Unauthorized Access",
            "GET",
            "auth/me",
            401
        )
        
        self.token = old_token

    def run_all_tests(self):
        """Run all test suites"""
        print("🚀 Starting Cloud Career Coach API Tests")
        print(f"📍 Testing against: {self.base_url}")
        print("=" * 60)
        
        # Run test suites
        self.test_health_check()
        self.test_authentication()
        self.test_assessment()
        self.test_motivation()
        self.test_premium_features()
        self.test_payment_endpoints()
        self.test_error_handling()
        
        # Print summary
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        print(f"Total Tests: {self.tests_run}")
        print(f"Passed: {self.tests_passed}")
        print(f"Failed: {self.tests_run - self.tests_passed}")
        print(f"Success Rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
        
        # Print failed tests
        failed_tests = [test for test in self.test_results if not test['success']]
        if failed_tests:
            print("\n❌ FAILED TESTS:")
            for test in failed_tests:
                print(f"   • {test['name']}: {test['details']}")
        
        print("\n" + "=" * 60)
        
        return 0 if self.tests_passed == self.tests_run else 1

def main():
    tester = CloudCareerCoachAPITester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())