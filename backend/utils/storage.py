import json
import logging
from pathlib import Path
from typing import Dict, Any, List, Optional
from datetime import datetime
from backend.config import DATA_DIR, DEMO_DATA_DIR

logger = logging.getLogger("trustgraph.storage")

CASES_FILE = DATA_DIR / "cases.json"
INDICATORS_FILE = DATA_DIR / "scam_indicators.json"
AUDIT_FILE = DATA_DIR / "audit_logs.json"

class StorageEngine:
    def __init__(self):
        self.cases: Dict[str, Dict[str, Any]] = {}
        self.scam_indicators: Dict[str, List[Dict[str, Any]]] = {
            "phones": [],
            "upi_ids": [],
            "domains": [],
            "qr_hashes": []
        }
        self.audit_logs: List[Dict[str, Any]] = []
        self._load()
        self._seed_default_demo_indicators()

    def _load(self):
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
        except Exception as e:
            logger.error(f"Error loading stored data: {e}")

    def _save(self):
        try:
            DATA_DIR.mkdir(parents=True, exist_ok=True)
            with open(CASES_FILE, "w", encoding="utf-8") as f:
                json.dump(self.cases, f, indent=2)
            with open(INDICATORS_FILE, "w", encoding="utf-8") as f:
                json.dump(self.scam_indicators, f, indent=2)
            with open(AUDIT_FILE, "w", encoding="utf-8") as f:
                json.dump(self.audit_logs, f, indent=2)
        except Exception as e:
            logger.error(f"Error saving data: {e}")

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

    def generate_case_id(self) -> str:
        count = len(self.cases) + 1
        year = datetime.now().year
        return f"TG-{year}-{count:06d}"

    def save_case(self, case_id: str, case_data: Dict[str, Any]):
        self.cases[case_id] = case_data
        self._record_audit("CASE_CREATED", {"case_id": case_id, "verdict": case_data.get("verdict")})
        
        # If scam or high risk, index indicators to scam intelligence
        if case_data.get("verdict") == "SCAM":
            self.register_scam_indicators(case_id, case_data.get("extracted_evidence", {}))
            
        self._save()

    def get_case(self, case_id: str) -> Optional[Dict[str, Any]]:
        return self.cases.get(case_id)

    def list_cases(self, limit: int = 50) -> List[Dict[str, Any]]:
        # Sort by timestamp desc
        items = list(self.cases.values())
        items.sort(key=lambda x: x.get("created_at", ""), reverse=True)
        return items[:limit]

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

    def get_scam_indicators(self) -> Dict[str, List[Dict[str, Any]]]:
        return self.scam_indicators

    def _record_audit(self, action: str, details: Dict[str, Any]):
        self.audit_logs.append({
            "action": action,
            "timestamp": datetime.now().isoformat(),
            "details": details
        })
        if len(self.audit_logs) > 500:
            self.audit_logs = self.audit_logs[-500:]

storage = StorageEngine()
