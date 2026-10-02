import json
import logging
from pathlib import Path
from typing import Dict, Any, List, Optional
from datetime import datetime
from backend.config import DATA_DIR, DEMO_DATA_DIR, settings

try:
    import pymongo
    import certifi
except ImportError:
    pymongo = None
    certifi = None

logger = logging.getLogger("trustgraph.storage")

CASES_FILE = DATA_DIR / "cases.json"
INDICATORS_FILE = DATA_DIR / "scam_indicators.json"
AUDIT_FILE = DATA_DIR / "audit_logs.json"
USERS_FILE = DATA_DIR / "users.json"

def sanitize_for_storage(data: Any) -> Any:
    """Recursively converts all NumPy and custom scalar types to pure Python primitives."""
    if isinstance(data, dict):
        return {str(k): sanitize_for_storage(v) for k, v in data.items()}
    elif isinstance(data, (list, tuple, set)):
        return [sanitize_for_storage(item) for item in data]
    type_str = str(type(data))
    if "bool" in type_str:
        return bool(data)
    elif "int" in type_str and not isinstance(data, int):
        return int(data)
    elif "float" in type_str and not isinstance(data, float):
        return float(data)
    elif hasattr(data, "tolist"):
        return sanitize_for_storage(data.tolist())
    elif hasattr(data, "item"):
        try:
            return sanitize_for_storage(data.item())
        except Exception:
            pass
    return data


class StorageEngine:
    def __init__(self):
        self.cases: Dict[str, Dict[str, Any]] = {}
        self.users: Dict[str, Dict[str, Any]] = {}
        self.scam_indicators: Dict[str, List[Dict[str, Any]]] = {
            "phones": [],
            "upi_ids": [],
            "domains": [],
            "qr_hashes": []
        }
        self.audit_logs: List[Dict[str, Any]] = []
        self.mongo_client = None
        self.mongo_db = None
        self.is_mongo_connected = False

        self._init_mongo()
        self._load()
        self._seed_default_demo_indicators()
        self._seed_default_admin()

    def _init_mongo(self):
        """Initialize MongoDB client if URI configured and pymongo available."""
        if not pymongo or not getattr(settings, "MONGODB_URI", None):
            return

        uri = settings.MONGODB_URI.strip()
        if not uri or "localhost:27017" in uri and not getattr(settings, "USE_LOCAL_MONGO", False):
            if "localhost:27017" in uri:
                logger.info("MongoDB URI is default localhost. Using embedded persistent storage.")
                return

        try:
            # Configure public DNS resolver for SRV record reliability
            try:
                import dns.resolver
                dns.resolver.default_resolver = dns.resolver.Resolver(configure=False)
                dns.resolver.default_resolver.nameservers = ['8.8.8.8', '1.1.1.1', '8.8.4.4']
            except Exception:
                pass

            kwargs = {"serverSelectionTimeoutMS": 5000, "connectTimeoutMS": 5000}
            if certifi:
                kwargs["tlsCAFile"] = certifi.where()

            self.mongo_client = pymongo.MongoClient(uri, **kwargs)
            # Test connection
            self.mongo_client.admin.command("ping")
            
            # Extract db name or default to trustgraph
            parsed_db = None
            try:
                from urllib.parse import urlparse
                path = urlparse(uri).path.lstrip("/")
                if path and "?" in path:
                    path = path.split("?")[0]
                if path:
                    parsed_db = path
            except Exception:
                pass
            
            db_name = parsed_db or "trustgraph"
            self.mongo_db = self.mongo_client[db_name]
            self.is_mongo_connected = True
            logger.info(f"Connected to MongoDB Atlas: database '{db_name}'")
        except Exception as e:
            self.is_mongo_connected = False
            logger.warning(f"MongoDB connection notice ({e}). Operating with persistent local storage engine.")

    def _sync_local_to_mongo(self):
        """Push all local users, cases, and indicators to MongoDB."""
        if not self.is_mongo_connected or self.mongo_db is None:
            return
        try:
            # Sync users
            for uid, udata in self.users.items():
                self.mongo_db["users"].replace_one({"user_id": uid}, {"_id": uid, **udata}, upsert=True)
            # Sync cases
            for cid, cdata in self.cases.items():
                self.mongo_db["cases"].replace_one({"case_id": cid}, {"_id": cid, **cdata}, upsert=True)
            # Sync indicators
            self.mongo_db["scam_indicators"].replace_one(
                {"_id": "global_indicators"},
                {"_id": "global_indicators", **self.scam_indicators},
                upsert=True
            )
            logger.info(f"Pushed local dataset to MongoDB Atlas ({len(self.users)} users, {len(self.cases)} cases).")
        except Exception as e:
            logger.warning(f"Error syncing local data to MongoDB Atlas: {e}")

    def _load(self):
        # First load from local JSON
        try:
            if CASES_FILE.exists():
                with open(CASES_FILE, "r", encoding="utf-8") as f:
                    self.cases = json.load(f)
            if INDICATORS_FILE.exists():
                with open(INDICATORS_FILE, "r", encoding="utf-8") as f:
                    self.scam_indicators = json.load(f)
            if AUDIT_FILE.exists():
                with open(AUDIT_FILE, "r", encoding="utf-8") as f:
                    self.audit_logs = json.load(f)
            if USERS_FILE.exists():
                with open(USERS_FILE, "r", encoding="utf-8") as f:
                    self.users = json.load(f)
        except Exception as e:
            logger.error(f"Error loading local stored data: {e}")

        # If MongoDB is connected, merge/sync data from MongoDB
        if self.is_mongo_connected and self.mongo_db is not None:
            try:
                # Load cases
                for doc in self.mongo_db["cases"].find():
                    cid = doc.get("case_id")
                    if cid:
                        doc.pop("_id", None)
                        self.cases[cid] = doc
                
                # Load users
                for doc in self.mongo_db["users"].find():
                    uid = doc.get("user_id")
                    if uid:
                        doc.pop("_id", None)
                        self.users[uid] = doc

                # Load indicators
                indicators_doc = self.mongo_db["scam_indicators"].find_one({"_id": "global_indicators"})
                if indicators_doc:
                    indicators_doc.pop("_id", None)
                    for k in ["phones", "upi_ids", "domains", "qr_hashes"]:
                        if k in indicators_doc:
                            self.scam_indicators[k] = indicators_doc[k]

                logger.info(f"Synchronized with MongoDB: {len(self.cases)} cases, {len(self.users)} users loaded.")
                # Also push any local users or cases to MongoDB
                self._sync_local_to_mongo()
            except Exception as e:
                logger.warning(f"Failed to fetch initial state from MongoDB: {e}")

    def _save(self):
        try:
            DATA_DIR.mkdir(parents=True, exist_ok=True)
            with open(CASES_FILE, "w", encoding="utf-8") as f:
                json.dump(self.cases, f, indent=2)
            with open(INDICATORS_FILE, "w", encoding="utf-8") as f:
                json.dump(self.scam_indicators, f, indent=2)
            with open(AUDIT_FILE, "w", encoding="utf-8") as f:
                json.dump(self.audit_logs, f, indent=2)
            with open(USERS_FILE, "w", encoding="utf-8") as f:
                json.dump(self.users, f, indent=2)
        except Exception as e:
            logger.error(f"Error saving data: {e}")

        # Sync scam indicators to MongoDB
        if self.is_mongo_connected and self.mongo_db is not None:
            try:
                self.mongo_db["scam_indicators"].replace_one(
                    {"_id": "global_indicators"},
                    {"_id": "global_indicators", **self.scam_indicators},
                    upsert=True
                )
            except Exception as e:
                logger.warning(f"MongoDB indicator sync notice: {e}")

    def _seed_default_admin(self):
        """Seed a default admin account if no users exist."""
        if not self.users:
            from backend.utils.auth import hash_password
            pw_hash, salt = hash_password("admin123")
            admin_id = "USR-ADMIN-001"
            self.users[admin_id] = {
                "user_id": admin_id,
                "username": "admin",
                "full_name": "System Administrator",
                "email": "admin@trustgraph.ai",
                "role": "admin",
                "password_hash": pw_hash,
                "salt": salt,
                "created_at": datetime.now().isoformat(),
                "is_active": True
            }
            self._save()
            logger.info("Default admin user seeded: admin / admin123")

    def _seed_default_demo_indicators(self):
        # Demo scam infrastructure for testing repeated scam detection (Case 3 & Case 4 linkages)
        if not self.scam_indicators["phones"]:
            self.scam_indicators["phones"] = [
                {
                    "value": "+919876543210",
                    "case_id": "TG-2026-DEMO-003",
                    "organization_claimed": "India Post / Postal Department",
                    "report_date": "2026-02-14",
                    "status": "CONFIRMED_SCAM",
                    "reason": "Reused in fake GDS appointment scheme requesting ₹850 verification charge"
                },
                {
                    "value": "+918765432109",
                    "case_id": "TG-2026-DEMO-002",
                    "organization_claimed": "Railway Recruitment Board",
                    "report_date": "2026-01-20",
                    "status": "CONFIRMED_SCAM",
                    "reason": "Used in fake WhatsApp joining letter dispatch campaign"
                }
            ]

        if not self.scam_indicators["upi_ids"]:
            self.scam_indicators["upi_ids"] = [
                {
                    "value": "recruitment.officer@okaxis",
                    "case_id": "TG-2026-DEMO-003",
                    "organization_claimed": "India Post GDS",
                    "status": "CONFIRMED_SCAM",
                    "reason": "Personal UPI ID collecting fraudulent registration fees"
                },
                {
                    "value": "railway.cell.verify@paytm",
                    "case_id": "TG-2026-DEMO-002",
                    "organization_claimed": "RRB Group D",
                    "status": "CONFIRMED_SCAM",
                    "reason": "Fake processing fee collection"
                }
            ]

        if not self.scam_indicators["domains"]:
            self.scam_indicators["domains"] = [
                {
                    "value": "rrb-recruitment-gov.online",
                    "case_id": "TG-2026-DEMO-002",
                    "status": "CONFIRMED_SCAM",
                    "reason": "Typosquatting railway recruitment board domain with deceptive .online TLD"
                },
                {
                    "value": "indiapost-gds-apply.xyz",
                    "case_id": "TG-2026-DEMO-003",
                    "status": "CONFIRMED_SCAM",
                    "reason": "Cloned application portal targeting rural applicants"
                },
                {
                    "value": "example-recruitment-site.com",
                    "case_id": "TG-2026-DEMO-004",
                    "status": "CONFIRMED_SCAM",
                    "reason": "Generic scam landing page asking for UPI fee payment"
                }
            ]

        self._save()

    # ─── Case ID Generation ───────────────────────────────────────────────────

    def generate_case_id(self) -> str:
        count = len(self.cases) + 1
        year = datetime.now().year
        return f"TG-{year}-{count:06d}"

    # ─── User ID Generation ───────────────────────────────────────────────────

    def generate_user_id(self) -> str:
        count = len(self.users) + 1
        return f"USR-{count:04d}"

    # ─── Case CRUD ────────────────────────────────────────────────────────────

    def save_case(self, case_id: str, case_data: Dict[str, Any]):
        # Sanitize any NumPy types (e.g. np.bool_, np.int64) to native Python primitives
        case_data = sanitize_for_storage(case_data)

        # Ensure mandatory case fields are always present
        if "case_id" not in case_data:
            case_data["case_id"] = case_id
        if "analysis_id" not in case_data:
            case_data["analysis_id"] = f"ANL-{case_id}"
        if "input_type" not in case_data:
            case_data["input_type"] = case_data.get("input_metadata", {}).get("input_type", "TEXT")
        if "organization" not in case_data:
            case_data["organization"] = case_data.get("extracted_evidence", {}).get("organization") or "Unknown Organization"
        if "created_at" not in case_data:
            case_data["created_at"] = datetime.now().isoformat()
        if "user_id" not in case_data or not case_data["user_id"]:
            case_data["user_id"] = "USR-ANONYMOUS"
        if "username" not in case_data or not case_data["username"]:
            case_data["username"] = "anonymous"

        self.cases[case_id] = case_data
        self._record_audit("CASE_CREATED", {"case_id": case_id, "verdict": case_data.get("verdict"), "user_id": case_data.get("user_id")})
        
        # If scam or high risk, index indicators to scam intelligence
        if case_data.get("verdict") == "SCAM":
            self.register_scam_indicators(case_id, case_data.get("extracted_evidence", {}))
            
        self._save()

        if self.is_mongo_connected and self.mongo_db is not None:
            try:
                self.mongo_db["cases"].replace_one(
                    {"case_id": case_id},
                    {"_id": case_id, **case_data},
                    upsert=True
                )
            except Exception as e:
                logger.warning(f"Failed to upsert case to MongoDB: {e}")

    def get_case(self, case_id: str) -> Optional[Dict[str, Any]]:
        try:
            if CASES_FILE.exists():
                with open(CASES_FILE, "r", encoding="utf-8") as f:
                    self.cases = json.load(f)
        except Exception:
            pass
        return self.cases.get(case_id)

    def list_cases(self, limit: int = 50) -> List[Dict[str, Any]]:
        # Sync with disk if available
        try:
            if CASES_FILE.exists():
                with open(CASES_FILE, "r", encoding="utf-8") as f:
                    self.cases = json.load(f)
        except Exception:
            pass
        items = list(self.cases.values())
        items.sort(key=lambda x: x.get("created_at", ""), reverse=True)
        return items[:limit]

    def list_cases_by_user(self, user_id: str, limit: int = 50) -> List[Dict[str, Any]]:
        """Return only cases belonging to a specific user."""
        try:
            if CASES_FILE.exists():
                with open(CASES_FILE, "r", encoding="utf-8") as f:
                    self.cases = json.load(f)
        except Exception:
            pass
        items = [
            c for c in self.cases.values()
            if c.get("user_id") == user_id
        ]
        items.sort(key=lambda x: x.get("created_at", ""), reverse=True)
        return items[:limit]

    def delete_case(self, case_id: str) -> bool:
        """Permanently delete a case from memory, local storage, and MongoDB Atlas."""
        # Ensure latest state loaded
        try:
            if CASES_FILE.exists():
                with open(CASES_FILE, "r", encoding="utf-8") as f:
                    self.cases = json.load(f)
        except Exception:
            pass

        if case_id not in self.cases:
            return False
        del self.cases[case_id]
        self._record_audit("CASE_DELETED", {"case_id": case_id})
        self._save()

        if self.is_mongo_connected and self.mongo_db is not None:
            try:
                self.mongo_db["cases"].delete_one({"case_id": case_id})
                self.mongo_db["cases"].delete_one({"_id": case_id})
            except Exception as e:
                logger.warning(f"Failed to delete case {case_id} from MongoDB: {e}")
        return True

    # ─── User CRUD ────────────────────────────────────────────────────────────

    def save_user(self, user_id: str, user_data: Dict[str, Any]):
        self.users[user_id] = user_data
        self._record_audit("USER_CREATED", {"user_id": user_id, "username": user_data.get("username")})
        self._save()

        if self.is_mongo_connected and self.mongo_db is not None:
            try:
                self.mongo_db["users"].replace_one(
                    {"user_id": user_id},
                    {"_id": user_id, **user_data},
                    upsert=True
                )
            except Exception as e:
                logger.warning(f"Failed to upsert user to MongoDB: {e}")

    def get_user(self, user_id: str) -> Optional[Dict[str, Any]]:
        return self.users.get(user_id)

    def get_user_by_username(self, username: str) -> Optional[Dict[str, Any]]:
        for u in self.users.values():
            if u.get("username", "").lower() == username.lower():
                return u
        return None

    def list_users(self) -> List[Dict[str, Any]]:
        users = list(self.users.values())
        users.sort(key=lambda x: x.get("created_at", ""), reverse=True)
        return users

    # ─── Scam Indicators ──────────────────────────────────────────────────────

    def register_scam_indicators(self, case_id: str, evidence: Dict[str, Any]):
        phone = evidence.get("phone")
        if phone and not any(p["value"] == phone for p in self.scam_indicators["phones"]):
            self.scam_indicators["phones"].append({
                "value": phone,
                "case_id": case_id,
                "organization_claimed": evidence.get("organization", "Unknown"),
                "report_date": datetime.now().strftime("%Y-%m-%d"),
                "status": "FLAGGED",
                "reason": f"Associated with scam case {case_id}"
            })

        upi_id = evidence.get("upi_id")
        if upi_id and not any(u["value"].lower() == upi_id.lower() for u in self.scam_indicators["upi_ids"]):
            self.scam_indicators["upi_ids"].append({
                "value": upi_id,
                "case_id": case_id,
                "organization_claimed": evidence.get("organization", "Unknown"),
                "status": "FLAGGED",
                "reason": f"Payment recipient flagged in case {case_id}"
            })

        domain = evidence.get("domain")
        if domain and not any(d["value"].lower() == domain.lower() for d in self.scam_indicators["domains"]):
            # Only add if not official .gov.in
            if not domain.endswith(".gov.in") and not domain.endswith(".nic.in"):
                self.scam_indicators["domains"].append({
                    "value": domain,
                    "case_id": case_id,
                    "status": "FLAGGED",
                    "reason": f"Fake recruitment portal flagged in case {case_id}"
                })

    def add_scam_indicator(self, indicator_type: str, value: str, organization_claimed: str = "Unknown", reason: str = "", case_id: str = "USER-REPORTED") -> Dict[str, Any]:
        """Manually report or add a new scam indicator."""
        value = value.strip()
        category = "phones" if indicator_type == "phone" else ("upi_ids" if indicator_type == "upi" else "domains")
        
        # Check if already exists
        for item in self.scam_indicators.get(category, []):
            if item.get("value", "").lower() == value.lower():
                return item

        new_entry = {
            "value": value,
            "case_id": case_id,
            "organization_claimed": organization_claimed or "Unknown Syndicate Target",
            "report_date": datetime.now().strftime("%Y-%m-%d"),
            "status": "CONFIRMED_SCAM" if case_id != "USER-REPORTED" else "COMMUNITY_FLAGGED",
            "reason": reason or f"Reported fraudulent recruitment infrastructure ({indicator_type})"
        }
        self.scam_indicators[category].append(new_entry)
        self._record_audit("SCAM_INDICATOR_REPORTED", {"type": indicator_type, "value": value})
        self._save()
        return new_entry

    def get_scam_indicators(self) -> Dict[str, Any]:
        """Return enriched scam indicators with cross-case links and syndicate statistics."""
        # Cross-reference cases for each indicator
        phones_enriched = []
        for p in self.scam_indicators.get("phones", []):
            val = p.get("value", "")
            connected_cases = [
                c.get("case_id") for c in self.cases.values()
                if c.get("extracted_evidence", {}).get("phone") == val
            ]
            if p.get("case_id") and p.get("case_id") not in connected_cases:
                connected_cases.insert(0, p.get("case_id"))
            phones_enriched.append({
                **p,
                "cases": connected_cases,
                "case_count": max(len(connected_cases), 1)
            })

        upis_enriched = []
        for u in self.scam_indicators.get("upi_ids", []):
            val = u.get("value", "")
            connected_cases = [
                c.get("case_id") for c in self.cases.values()
                if (c.get("extracted_evidence", {}).get("upi_id") or "").lower() == val.lower()
            ]
            if u.get("case_id") and u.get("case_id") not in connected_cases:
                connected_cases.insert(0, u.get("case_id"))
            upis_enriched.append({
                **u,
                "cases": connected_cases,
                "case_count": max(len(connected_cases), 1)
            })

        domains_enriched = []
        for d in self.scam_indicators.get("domains", []):
            val = d.get("value", "")
            connected_cases = [
                c.get("case_id") for c in self.cases.values()
                if (c.get("extracted_evidence", {}).get("domain") or "").lower() == val.lower()
            ]
            if d.get("case_id") and d.get("case_id") not in connected_cases:
                connected_cases.insert(0, d.get("case_id"))
            
            # Extract tld
            tld = "." + val.split(".")[-1] if "." in val else ""
            domains_enriched.append({
                **d,
                "cases": connected_cases,
                "case_count": max(len(connected_cases), 1),
                "tld": tld
            })

        # Calculate impersonation frequency
        agency_counts: Dict[str, int] = {}
        for item in phones_enriched + upis_enriched + domains_enriched:
            org = item.get("organization_claimed", "Unknown")
            if org and org != "Unknown":
                agency_counts[org] = agency_counts.get(org, 0) + 1

        top_agencies = sorted(
            [{"agency": k, "count": v} for k, v in agency_counts.items()],
            key=lambda x: x["count"],
            reverse=True
        )[:5]

        # Total distinct scam cases linked
        all_linked_cases = set()
        for item in phones_enriched + upis_enriched + domains_enriched:
            for cid in item.get("cases", []):
                all_linked_cases.add(cid)

        return {
            "phones": phones_enriched,
            "upi_ids": upis_enriched,
            "domains": domains_enriched,
            "stats": {
                "total_indicators": len(phones_enriched) + len(upis_enriched) + len(domains_enriched),
                "reused_phones_count": len(phones_enriched),
                "fraudulent_upis_count": len(upis_enriched),
                "spoofed_domains_count": len(domains_enriched),
                "total_scam_cases_linked": len(all_linked_cases),
                "top_agencies": top_agencies
            }
        }

    def lookup_scam_indicator(self, query: str) -> Dict[str, Any]:
        """Instant lookup for any indicator query across phones, UPIs and domains."""
        q = (query or "").strip().lower()
        if not q:
            return {"match_found": False, "query": query, "results": []}

        data = self.get_scam_indicators()
        matched = []

        for p in data["phones"]:
            if q in p.get("value", "").lower() or q in p.get("organization_claimed", "").lower():
                matched.append({**p, "type": "phone"})

        for u in data["upi_ids"]:
            if q in u.get("value", "").lower() or q in u.get("organization_claimed", "").lower():
                matched.append({**u, "type": "upi"})

        for d in data["domains"]:
            if q in d.get("value", "").lower() or q in d.get("reason", "").lower():
                matched.append({**d, "type": "domain"})

        return {
            "match_found": len(matched) > 0,
            "query": query,
            "total_matches": len(matched),
            "results": matched
        }

    def _record_audit(self, action: str, details: Dict[str, Any]):
        self.audit_logs.append({
            "action": action,
            "timestamp": datetime.now().isoformat(),
            "details": details
        })
        if len(self.audit_logs) > 500:
            self.audit_logs = self.audit_logs[-500:]

storage = StorageEngine()
