import sys
sys.path.insert(0, '.')
from app.core.database import engine
from sqlalchemy import text

conn = engine.connect()
total = conn.execute(text("SELECT COUNT(*) FROM users")).fetchone()[0]
testusers = conn.execute(text("SELECT COUNT(*) FROM users WHERE email LIKE 'testuser%'")).fetchone()[0]

print(f"\n=== DATABASE STATISTICS ===")
print(f"Total Users: {total}")
print(f"Testuser Accounts: {testusers}")
print(f"Other Accounts: {total - testusers}")
print(f"===========================\n")

# Show sample users
print("Sample registered users:")
result = conn.execute(text("SELECT id, email, organization FROM users ORDER BY id DESC LIMIT 10"))
for row in result:
    print(f"  ID {row[0]}: {row[1]} - {row[2]}")

conn.close()
