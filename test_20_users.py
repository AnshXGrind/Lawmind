"""
Test Script - Register and Test 20 Unique Users
Automated testing script to verify LawMind features with multiple user accounts
"""

import requests
import json
import time
from typing import Dict, List, Tuple
from datetime import datetime

# Configuration
BASE_URL = "http://localhost:8000"
FRONTEND_URL = "http://localhost:3000"

# Test user data - 20 unique credentials
TEST_USERS = [
    {"name": "Saksham Garg", "email": "anshgarg2512@gmail.com", "password": "LawMind@2024"},
    {"name": "Priya Sharma", "email": "priya.sharma@lawfirm.in", "password": "Advocate@123"},
    {"name": "Rahul Verma", "email": "rahul.verma@legal.com", "password": "Legal@456"},
    {"name": "Ananya Singh", "email": "ananya.singh@courts.in", "password": "Justice@789"},
    {"name": "Vikram Patel", "email": "vikram.patel@lawassociates.com", "password": "Court@2024"},
    {"name": "Neha Reddy", "email": "neha.reddy@judiciary.in", "password": "Law@Student1"},
    {"name": "Arjun Mehta", "email": "arjun.mehta@supremecourt.in", "password": "Supreme@123"},
    {"name": "Kavya Iyer", "email": "kavya.iyer@highcourt.com", "password": "HighCt@456"},
    {"name": "Rohan Joshi", "email": "rohan.joshi@legaltech.in", "password": "LegalTech@789"},
    {"name": "Divya Nair", "email": "divya.nair@advocates.com", "password": "Advocate@2024"},
    {"name": "Aditya Kumar", "email": "aditya.kumar@lawschool.edu", "password": "Student@123"},
    {"name": "Sneha Gupta", "email": "sneha.gupta@lawcollege.in", "password": "College@456"},
    {"name": "Karthik Rao", "email": "karthik.rao@corporate.com", "password": "Corporate@789"},
    {"name": "Pooja Malhotra", "email": "pooja.malhotra@criminallaw.in", "password": "Criminal@123"},
    {"name": "Siddharth Kapoor", "email": "siddharth.kapoor@civillaw.com", "password": "Civil@456"},
    {"name": "Meera Desai", "email": "meera.desai@familylaw.in", "password": "Family@789"},
    {"name": "Rajesh Pillai", "email": "rajesh.pillai@taxlaw.com", "password": "Tax@2024"},
    {"name": "Anjali Bose", "email": "anjali.bose@iprlaw.in", "password": "IPR@123"},
    {"name": "Nikhil Saxena", "email": "nikhil.saxena@constitutionallaw.com", "password": "Constitution@456"},
    {"name": "Riya Khanna", "email": "riya.khanna@laborlaw.in", "password": "Labor@789"}
]

class Colors:
    """ANSI color codes for terminal output"""
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    RESET = '\033[0m'
    BOLD = '\033[1m'

class LawMindTester:
    """Automated testing class for LawMind platform"""
    
    def __init__(self):
        self.base_url = BASE_URL
        self.registered_users: List[Dict] = []
        self.test_results: Dict[str, List] = {
            "passed": [],
            "failed": [],
            "skipped": []
        }
    
    def print_header(self, text: str):
        """Print formatted header"""
        print(f"\n{Colors.BOLD}{Colors.CYAN}{'='*70}")
        print(f"{text.center(70)}")
        print(f"{'='*70}{Colors.RESET}\n")
    
    def print_success(self, text: str):
        """Print success message"""
        print(f"{Colors.GREEN}✓ {text}{Colors.RESET}")
    
    def print_error(self, text: str):
        """Print error message"""
        print(f"{Colors.RED}✗ {text}{Colors.RESET}")
    
    def print_info(self, text: str):
        """Print info message"""
        print(f"{Colors.BLUE}ℹ {text}{Colors.RESET}")
    
    def register_user(self, user_data: Dict) -> Tuple[bool, Dict]:
        """
        Register a new user
        
        Returns:
            Tuple of (success: bool, response_data: dict)
        """
        try:
            # Convert 'name' to 'full_name' for API compatibility
            request_data = {
                "email": user_data["email"],
                "password": user_data["password"],
                "full_name": user_data["name"]
            }
            response = requests.post(
                f"{self.base_url}/api/auth/register",
                json=request_data,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                data = response.json()
                self.print_success(f"Registered: {user_data['name']} ({user_data['email']})")
                return True, data
            else:
                self.print_error(f"Registration failed for {user_data['email']}: {response.text}")
                return False, {}
        
        except Exception as e:
            self.print_error(f"Exception during registration of {user_data['email']}: {str(e)}")
            return False, {}
    
    def login_user(self, email: str, password: str) -> Tuple[bool, str]:
        """
        Login a user and get access token
        
        Returns:
            Tuple of (success: bool, access_token: str)
        """
        try:
            response = requests.post(
                f"{self.base_url}/api/auth/login",
                data={
                    "username": email,
                    "password": password
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                token = data.get("access_token", "")
                self.print_success(f"Login successful for {email}")
                return True, token
            else:
                self.print_error(f"Login failed for {email}: {response.text}")
                return False, ""
        
        except Exception as e:
            self.print_error(f"Exception during login of {email}: {str(e)}")
            return False, ""
    
    def test_draft_creation(self, token: str, user_email: str) -> bool:
        """Test creating a legal draft"""
        try:
            draft_data = {
                "draft_type": "Bail Application",
                "content": f"Test bail application created by {user_email} at {datetime.now()}"
            }
            
            response = requests.post(
                f"{self.base_url}/api/drafts/create",
                json=draft_data,
                headers={
                    "Authorization": f"Bearer {token}",
                    "Content-Type": "application/json"
                }
            )
            
            if response.status_code == 200:
                self.print_success(f"Created draft for {user_email}")
                return True
            else:
                self.print_error(f"Draft creation failed for {user_email}")
                return False
        
        except Exception as e:
            self.print_error(f"Exception during draft creation: {str(e)}")
            return False
    
    def test_analytics_endpoint(self, token: str, user_email: str) -> bool:
        """Test analytics dashboard endpoint"""
        try:
            response = requests.get(
                f"{self.base_url}/api/analytics/dashboard",
                headers={"Authorization": f"Bearer {token}"}
            )
            
            if response.status_code == 200:
                self.print_success(f"Analytics dashboard working for {user_email}")
                return True
            else:
                self.print_error(f"Analytics failed for {user_email}")
                return False
        
        except Exception as e:
            self.print_error(f"Exception during analytics test: {str(e)}")
            return False
    
    def test_dataset_health(self, token: str) -> bool:
        """Test dataset builder health check"""
        try:
            response = requests.get(
                f"{self.base_url}/api/dataset/health",
                headers={"Authorization": f"Bearer {token}"}
            )
            
            if response.status_code == 200:
                self.print_success("Dataset builder health check passed")
                return True
            else:
                self.print_error("Dataset builder health check failed")
                return False
        
        except Exception as e:
            self.print_error(f"Exception during dataset health check: {str(e)}")
            return False
    
    def run_full_test_suite(self):
        """Run complete test suite with all 20 users"""
        
        self.print_header("LAWMIND AUTOMATED TESTING SUITE")
        self.print_info(f"Testing with {len(TEST_USERS)} unique user accounts")
        self.print_info(f"Backend URL: {self.base_url}")
        self.print_info(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        # Phase 1: Register all users
        self.print_header("PHASE 1: USER REGISTRATION")
        
        for user in TEST_USERS:
            success, data = self.register_user(user)
            if success:
                self.registered_users.append({**user, **data})
                self.test_results["passed"].append(f"Registration: {user['email']}")
                time.sleep(0.5)  # Rate limiting
            else:
                self.test_results["failed"].append(f"Registration: {user['email']}")
        
        print(f"\n{Colors.BOLD}Registration Summary:{Colors.RESET}")
        print(f"  Successful: {len(self.registered_users)}/{len(TEST_USERS)}")
        print(f"  Failed: {len(TEST_USERS) - len(self.registered_users)}")
        
        # Phase 2: Login and test features for each user
        self.print_header("PHASE 2: LOGIN & FEATURE TESTING")
        
        for i, user in enumerate(self.registered_users, 1):
            print(f"\n{Colors.YELLOW}Testing User {i}/{len(self.registered_users)}: {user['name']}{Colors.RESET}")
            
            # Login
            success, token = self.login_user(user['email'], user['password'])
            if not success:
                self.test_results["failed"].append(f"Login: {user['email']}")
                continue
            
            self.test_results["passed"].append(f"Login: {user['email']}")
            
            # Test draft creation
            if self.test_draft_creation(token, user['email']):
                self.test_results["passed"].append(f"Draft Creation: {user['email']}")
            else:
                self.test_results["failed"].append(f"Draft Creation: {user['email']}")
            
            # Test analytics (only for first user to avoid spam)
            if i == 1:
                if self.test_analytics_endpoint(token, user['email']):
                    self.test_results["passed"].append(f"Analytics: {user['email']}")
                else:
                    self.test_results["failed"].append(f"Analytics: {user['email']}")
                
                # Test dataset health
                if self.test_dataset_health(token):
                    self.test_results["passed"].append("Dataset Health Check")
                else:
                    self.test_results["failed"].append("Dataset Health Check")
            
            time.sleep(0.3)  # Rate limiting
        
        # Print final report
        self.print_final_report()
    
    def print_final_report(self):
        """Print comprehensive test report"""
        
        self.print_header("FINAL TEST REPORT")
        
        total_tests = len(self.test_results["passed"]) + len(self.test_results["failed"])
        pass_rate = (len(self.test_results["passed"]) / total_tests * 100) if total_tests > 0 else 0
        
        print(f"{Colors.BOLD}Overall Statistics:{Colors.RESET}")
        print(f"  Total Tests: {total_tests}")
        print(f"  {Colors.GREEN}Passed: {len(self.test_results['passed'])}{Colors.RESET}")
        print(f"  {Colors.RED}Failed: {len(self.test_results['failed'])}{Colors.RESET}")
        print(f"  {Colors.CYAN}Pass Rate: {pass_rate:.1f}%{Colors.RESET}")
        
        if self.test_results["failed"]:
            print(f"\n{Colors.BOLD}{Colors.RED}Failed Tests:{Colors.RESET}")
            for test in self.test_results["failed"]:
                print(f"  ✗ {test}")
        
        print(f"\n{Colors.BOLD}Test completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}{Colors.RESET}")
        
        if pass_rate >= 90:
            print(f"\n{Colors.GREEN}{Colors.BOLD}🎉 EXCELLENT! System is production-ready!{Colors.RESET}")
        elif pass_rate >= 75:
            print(f"\n{Colors.YELLOW}{Colors.BOLD}⚠ GOOD, but some issues need attention{Colors.RESET}")
        else:
            print(f"\n{Colors.RED}{Colors.BOLD}❌ CRITICAL: Multiple failures detected{Colors.RESET}")

def main():
    """Main test execution"""
    print(f"{Colors.BOLD}{Colors.CYAN}")
    print(r"""
    ╔═══════════════════════════════════════════════════════════════╗
    ║                                                               ║
    ║              LAWMIND AUTOMATED TEST SUITE                     ║
    ║                  Testing 20 Unique Users                      ║
    ║                                                               ║
    ╚═══════════════════════════════════════════════════════════════╝
    """)
    print(Colors.RESET)
    
    # Check if backend is running
    try:
        response = requests.get(f"{BASE_URL}/", timeout=5)
        print(f"{Colors.GREEN}✓ Backend is running at {BASE_URL}{Colors.RESET}")
    except Exception as e:
        print(f"{Colors.RED}✗ Backend is not accessible at {BASE_URL}")
        print(f"  Error: {str(e)}")
        print(f"  Please start the backend server first.{Colors.RESET}")
        return
    
    # Run tests
    tester = LawMindTester()
    tester.run_full_test_suite()

if __name__ == "__main__":
    main()
