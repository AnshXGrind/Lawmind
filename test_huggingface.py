#!/usr/bin/env python3
"""
Test LawMind deployed on Hugging Face Spaces.
Usage:
    python test_huggingface.py                         # uses default HF URL
    python test_huggingface.py https://MY-URL.hf.space # custom URL
"""

import requests
import sys
import time

BASE_URL = sys.argv[1] if len(sys.argv) > 1 else "https://velarixx-lawmind-backend.hf.space"
BASE_URL = BASE_URL.rstrip("/")

PASS = "✅"
FAIL = "❌"
WARN = "⚠️"


def test_ping():
    print("🏓 Testing /ping ...")
    try:
        r = requests.get(f"{BASE_URL}/ping", timeout=15)
        if r.status_code == 200:
            print(f"  {PASS} /ping → {r.text.strip()}")
            return True
        print(f"  {FAIL} /ping → HTTP {r.status_code}")
        return False
    except Exception as e:
        print(f"  {FAIL} /ping → {e}")
        return False


def test_health():
    print("\n🩺 Testing /health ...")
    try:
        r = requests.get(f"{BASE_URL}/health", timeout=15)
        if r.status_code == 200:
            data = r.json()
            gemini_status = data.get("gemini", "unknown")
            print(f"  {PASS} /health → status={data.get('status')}, gemini={gemini_status}")
            if "missing" in gemini_status:
                print(f"  {WARN} Gemini key not set — add GEMINI_API_KEY in HF Space Secrets")
            return True
        print(f"  {FAIL} /health → HTTP {r.status_code}")
        return False
    except Exception as e:
        print(f"  {FAIL} /health → {e}")
        return False


def test_root():
    print("\n🌐 Testing / ...")
    try:
        r = requests.get(f"{BASE_URL}/", timeout=15)
        if r.status_code == 200:
            print(f"  {PASS} / → {r.json()}")
            return True
        print(f"  {FAIL} / → HTTP {r.status_code}")
        return False
    except Exception as e:
        print(f"  {FAIL} / → {e}")
        return False


def test_docs():
    print("\n📚 Testing /docs (Swagger UI) ...")
    try:
        r = requests.get(f"{BASE_URL}/docs", timeout=15)
        if r.status_code == 200 and "swagger" in r.text.lower():
            print(f"  {PASS} /docs → Swagger UI available")
            return True
        print(f"  {FAIL} /docs → HTTP {r.status_code}")
        return False
    except Exception as e:
        print(f"  {FAIL} /docs → {e}")
        return False


def test_register_and_login():
    print("\n🔐 Testing /api/auth/register + /api/auth/login ...")
    test_email = f"test_{int(time.time())}@lawmind.test"
    test_pass = "TestPass123!"

    # Register
    try:
        r = requests.post(
            f"{BASE_URL}/api/auth/register",
            json={"email": test_email, "password": test_pass, "full_name": "Test User"},
            timeout=15,
        )
        if r.status_code in [200, 201]:
            print(f"  {PASS} /api/auth/register → user created")
        else:
            print(f"  {WARN} /api/auth/register → HTTP {r.status_code}: {r.text[:100]}")
            return False
    except Exception as e:
        print(f"  {FAIL} /api/auth/register → {e}")
        return False

    # Login
    try:
        r = requests.post(
            f"{BASE_URL}/api/auth/login",
            data={"username": test_email, "password": test_pass},
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            timeout=15,
        )
        if r.status_code == 200 and "access_token" in r.json():
            token = r.json()["access_token"]
            print(f"  {PASS} /api/auth/login → JWT received")
            return token
        print(f"  {FAIL} /api/auth/login → HTTP {r.status_code}: {r.text[:100]}")
        return False
    except Exception as e:
        print(f"  {FAIL} /api/auth/login → {e}")
        return False


def test_draft_generation(token: str):
    print("\n🤖 Testing /api/drafts/generate (Gemini AI) ...")
    try:
        r = requests.post(
            f"{BASE_URL}/api/drafts/generate",
            json={
                "title": "Test Bail Application",
                "description": "File anticipatory bail under Section 438 CrPC for accused in fraud case",
                "case_type": "criminal",
                "court": "high_court",
                "document_type": "bail_application",
                "facts": "The accused is falsely implicated in a fraud case. No prior criminal record.",
                "relief_sought": "Grant anticipatory bail",
            },
            headers={"Authorization": f"Bearer {token}"},
            timeout=60,
        )
        if r.status_code in [200, 201]:
            data = r.json()
            content = data.get("content", "")
            print(f"  {PASS} Draft generated ({len(content)} chars)")
            if len(content) > 200:
                print(f"  Preview: {content[:150].strip()}...")
            return True
        print(f"  {FAIL} /api/drafts/generate → HTTP {r.status_code}: {r.text[:200]}")
        return False
    except requests.exceptions.Timeout:
        print(f"  {WARN} Timeout — HF might be cold starting or Gemini is slow. Try again.")
        return False
    except Exception as e:
        print(f"  {FAIL} /api/drafts/generate → {e}")
        return False


if __name__ == "__main__":
    print(f"🚀 LawMind Hugging Face Deployment Test")
    print(f"   Target: {BASE_URL}")
    print("=" * 55)

    results = []
    results.append(test_ping())
    results.append(test_health())
    results.append(test_root())
    results.append(test_docs())

    token = test_register_and_login()
    results.append(bool(token))

    if token:
        results.append(test_draft_generation(token))

    print("\n" + "=" * 55)
    passed = sum(results)
    total = len(results)
    if passed == total:
        print(f"✅ ALL {total} TESTS PASSED — HF deployment is healthy!")
    else:
        print(f"{WARN} {passed}/{total} tests passed. Check errors above.")
        sys.exit(1)
