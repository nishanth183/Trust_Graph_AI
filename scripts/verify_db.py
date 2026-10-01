"""
TrustGraph AI - Database Verification Utility
Checks local storage and live MongoDB Atlas connection and lists all stored users and cases.
"""

import sys
import json
from pathlib import Path

# Add project root to sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from backend.config import settings, DATA_DIR
from backend.utils.storage import storage

def verify_databases():
    print("=" * 65)
    print("  TRUSTGRAPH AI - DATABASE & USER VERIFICATION")
    print("=" * 65)

    # 1. Local Storage Check
    users_file = DATA_DIR / "users.json"
    cases_file = DATA_DIR / "cases.json"
    
    print("\n1. LOCAL STORAGE STATUS:")
    if users_file.exists():
        with open(users_file, "r", encoding="utf-8") as f:
            local_users = json.load(f)
        print(f"   [OK] Local users file: {users_file} ({len(local_users)} registered users)")
        for uid, udata in local_users.items():
            print(f"        • User ID: {uid:<10} | Username: {udata.get('username'):<15} | Role: {udata.get('role'):<8} | Full Name: {udata.get('full_name')}")
    else:
        print(f"   [!] No local users file found at {users_file}")

    if cases_file.exists():
        with open(cases_file, "r", encoding="utf-8") as f:
            local_cases = json.load(f)
        print(f"   [OK] Local cases file: {cases_file} ({len(local_cases)} stored cases)")

    # 2. Live MongoDB Atlas Check
    print("\n2. LIVE MONGODB ATLAS CLUSTER STATUS:")
    mongo_uri = settings.MONGODB_URI
    masked_uri = mongo_uri.split("@")[-1] if "@" in mongo_uri else mongo_uri
    print(f"   Target Cluster: ...@{masked_uri}")

    try:
        import pymongo
        import certifi
        import dns.resolver

        dns.resolver.default_resolver = dns.resolver.Resolver(configure=False)
        dns.resolver.default_resolver.nameservers = ['8.8.8.8', '1.1.1.1', '8.8.4.4']

        client = pymongo.MongoClient(
            mongo_uri,
            tlsCAFile=certifi.where(),
            serverSelectionTimeoutMS=5000,
            connectTimeoutMS=5000
        )
        
        # Ping
        client.admin.command("ping")
        db = client["trustgraph"]

        print("   [CONNECTED] Live connection to MongoDB Atlas SUCCESSFUL!")
        collections = db.list_collection_names()
        print(f"   Collections in 'trustgraph' DB: {collections}")

        # Query users in MongoDB
        mongo_users = list(db["users"].find({}, {"_id": 0, "password_hash": 0, "salt": 0}))
        print(f"\n   [MONGODB USERS COLLECTION] Found {len(mongo_users)} user(s) in Atlas:")
        for u in mongo_users:
            print(f"        • User ID: {u.get('user_id', 'N/A'):<10} | Username: {u.get('username', 'N/A'):<15} | Role: {u.get('role', 'user'):<8} | Created: {u.get('created_at', 'N/A')[:19]}")

        # Query cases in MongoDB
        cases_count = db["cases"].count_documents({})
        print(f"\n   [MONGODB CASES COLLECTION] Found {cases_count} case(s) in Atlas.")

    except Exception as e:
        print("   [OFFLINE / PENDING WHITELIST]")
        print(f"   MongoDB Atlas Notice: {e}")
        print("\n   ACTION REQUIRED TO UNBLOCK ATLAS FIREWALL:")
        print("   1. Open MongoDB Atlas (https://cloud.mongodb.com)")
        print("   2. Go to Security > Network Access")
        print("   3. Click '+ Add IP Address' -> Select 'Allow Access From Anywhere' (0.0.0.0/0) -> Confirm")
        print("   4. Re-run this script: python scripts/verify_db.py")

    print("\n" + "=" * 65)

if __name__ == "__main__":
    verify_databases()
