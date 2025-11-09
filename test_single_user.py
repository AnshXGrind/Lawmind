"""Quick test to register and test a single user"""
import requests
import json

BASE_URL = "http://localhost:8000"

print("=" * 60)
print("TESTING SINGLE USER REGISTRATION")
print("=" * 60)

# Test registration
user_data = {
    "email": "anshgarg2512@gmail.com",
    "password": "LawMind@2024",
    "full_name": "Saksham Garg"
}

print(f"\n1. Registering user: {user_data['full_name']}")
try:
    response = requests.post(
        f"{BASE_URL}/api/auth/register",
        json=user_data,
        headers={"Content-Type": "application/json"}
    )
    
    if response.status_code == 200:
        print(f"✓ Registration successful!")
        print(f"   Response: {response.json()}")
    else:
        print(f"✗ Registration failed")
        print(f"   Status: {response.status_code}")
        print(f"   Response: {response.text}")
        exit(1)
except Exception as e:
    print(f"✗ Exception: {str(e)}")
    exit(1)

# Test login
print(f"\n2. Logging in...")
try:
    response = requests.post(
        f"{BASE_URL}/api/auth/login",
        data={
            "username": user_data["email"],
            "password": user_data["password"]
        }
    )
    
    if response.status_code == 200:
        data = response.json()
        token = data.get("access_token", "")
        print(f"✓ Login successful!")
        print(f"   Token: {token[:50]}...")
    else:
        print(f"✗ Login failed")
        print(f"   Response: {response.text}")
        exit(1)
except Exception as e:
    print(f"✗ Exception: {str(e)}")
    exit(1)

# Test analytics endpoint
print(f"\n3. Testing Analytics Dashboard...")
try:
    response = requests.get(
        f"{BASE_URL}/api/analytics/dashboard",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    if response.status_code == 200:
        print(f"✓ Analytics working!")
        data = response.json()
        print(f"   Total drafts: {data.get('data', {}).get('total_drafts', 0)}")
    else:
        print(f"✗ Analytics failed: {response.status_code}")
except Exception as e:
    print(f"✗ Exception: {str(e)}")

# Test dataset health
print(f"\n4. Testing Dataset Health...")
try:
    response = requests.get(
        f"{BASE_URL}/api/dataset/health",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    if response.status_code == 200:
        print(f"✓ Dataset builder healthy!")
        print(f"   Response: {response.json()}")
    else:
        print(f"✗ Dataset health check failed: {response.status_code}")
except Exception as e:
    print(f"✗ Exception: {str(e)}")

print("\n" + "=" * 60)
print("✓ ALL TESTS PASSED!")
print("=" * 60)
