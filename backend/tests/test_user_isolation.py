import unittest
from datetime import datetime
import requests
from backend.utils.auth import create_token
from backend.utils.storage import storage

BASE_URL = "http://127.0.0.1:8000"

class TestUserIsolationSecurity(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Create two distinct test users
        cls.user_a_id = "USR-SECURITY-TEST-A"
        cls.user_b_id = "USR-SECURITY-TEST-B"

        cls.user_a_token = create_token(cls.user_a_id, "user", "usera_test")
        cls.user_b_token = create_token(cls.user_b_id, "user", "userb_test")

        cls.headers_a = {"Authorization": f"Bearer {cls.user_a_token}"}
        cls.headers_b = {"Authorization": f"Bearer {cls.user_b_token}"}

        # Case IDs
        cls.case_a1_id = "TG-TEST-A1"
        cls.case_a2_id = "TG-TEST-A2"
        cls.case_b1_id = "TG-TEST-B1"
        cls.case_b2_id = "TG-TEST-B2"

        # Create Cases for User A with all 9 mandatory fields
        storage.save_case(cls.case_a1_id, {
            "case_id": cls.case_a1_id,
            "user_id": cls.user_a_id,
            "username": "usera_test",
            "created_at": datetime.now().isoformat(),
            "input_type": "TEXT",
            "organization": "UPSC India User A Notification 1",
            "verdict": "GENUINE",
            "trust_score": 92.0,
            "risk_level": "LOW",
            "analysis_id": f"ANL-{cls.case_a1_id}",
            "scam_probability": 3.0,
            "genuine_probability": 94.0,
            "suspicious_probability": 3.0,
            "confidence": 95.0,
            "top_reasons": ["Verified government notice"],
            "recommended_action": "Safe to apply",
            "evidence_summary": {"verified_count": 3, "suspicious_count": 0, "missing_count": 0, "conflicting_count": 0, "total_extracted": 5},
            "extracted_evidence": {"organization": "UPSC India User A Notification 1"},
            "recruitment_dna": {"dna_id": "DNA-A1", "similarity_score": 90.0, "signatures": {}},
            "evidence_graph": {"nodes": [], "edges": []},
            "verification_details": {},
            "contradiction_findings": [],
            "scam_network_findings": [],
            "explainability": {"top_factors": [], "supporting_evidence": [], "risk_evidence": []},
            "input_metadata": {"input_type": "TEXT", "raw_text_preview": "User A notice 1"}
        })

        storage.save_case(cls.case_a2_id, {
            "case_id": cls.case_a2_id,
            "user_id": cls.user_a_id,
            "username": "usera_test",
            "created_at": datetime.now().isoformat(),
            "input_type": "URL_ONLY",
            "organization": "SSC Portal User A Notification 2",
            "verdict": "GENUINE",
            "trust_score": 88.0,
            "risk_level": "LOW",
            "analysis_id": f"ANL-{cls.case_a2_id}",
            "scam_probability": 5.0,
            "genuine_probability": 90.0,
            "suspicious_probability": 5.0,
            "confidence": 90.0,
            "top_reasons": ["Verified portal"],
            "recommended_action": "Safe to proceed",
            "evidence_summary": {"verified_count": 2, "suspicious_count": 0, "missing_count": 0, "conflicting_count": 0, "total_extracted": 4},
            "extracted_evidence": {"organization": "SSC Portal User A Notification 2"},
            "recruitment_dna": {"dna_id": "DNA-A2", "similarity_score": 88.0, "signatures": {}},
            "evidence_graph": {"nodes": [], "edges": []},
            "verification_details": {},
            "contradiction_findings": [],
            "scam_network_findings": [],
            "explainability": {"top_factors": [], "supporting_evidence": [], "risk_evidence": []},
            "input_metadata": {"input_type": "URL_ONLY", "raw_text_preview": "User A notice 2"}
        })

        # Create Cases for User B with all 9 mandatory fields
        storage.save_case(cls.case_b1_id, {
            "case_id": cls.case_b1_id,
            "user_id": cls.user_b_id,
            "username": "userb_test",
            "created_at": datetime.now().isoformat(),
            "input_type": "FILE_IMAGE",
            "organization": "Railway Board User B Notification 1",
            "verdict": "SCAM",
            "trust_score": 15.0,
            "risk_level": "HIGH",
            "analysis_id": f"ANL-{cls.case_b1_id}",
            "scam_probability": 92.0,
            "genuine_probability": 4.0,
            "suspicious_probability": 4.0,
            "confidence": 92.0,
            "top_reasons": ["Fake payment requested via personal UPI"],
            "recommended_action": "Do not pay",
            "evidence_summary": {"verified_count": 0, "suspicious_count": 3, "missing_count": 1, "conflicting_count": 2, "total_extracted": 6},
            "extracted_evidence": {"organization": "Railway Board User B Notification 1", "upi_id": "fake.rrb@upi"},
            "recruitment_dna": {"dna_id": "DNA-B1", "similarity_score": 20.0, "signatures": {}},
            "evidence_graph": {"nodes": [], "edges": []},
            "verification_details": {},
            "contradiction_findings": [],
            "scam_network_findings": [],
            "explainability": {"top_factors": [], "supporting_evidence": [], "risk_evidence": []},
            "input_metadata": {"input_type": "FILE_IMAGE", "raw_text_preview": "User B notice 1"}
        })

        storage.save_case(cls.case_b2_id, {
            "case_id": cls.case_b2_id,
            "user_id": cls.user_b_id,
            "username": "userb_test",
            "created_at": datetime.now().isoformat(),
            "input_type": "TEXT",
            "organization": "Postal Dept User B Notification 2",
            "verdict": "SCAM",
            "trust_score": 12.0,
            "risk_level": "HIGH",
            "analysis_id": f"ANL-{cls.case_b2_id}",
            "scam_probability": 95.0,
            "genuine_probability": 2.0,
            "suspicious_probability": 3.0,
            "confidence": 95.0,
            "top_reasons": ["Unregistered domain"],
            "recommended_action": "Fraud alert",
            "evidence_summary": {"verified_count": 0, "suspicious_count": 2, "missing_count": 2, "conflicting_count": 1, "total_extracted": 5},
            "extracted_evidence": {"organization": "Postal Dept User B Notification 2"},
            "recruitment_dna": {"dna_id": "DNA-B2", "similarity_score": 15.0, "signatures": {}},
            "evidence_graph": {"nodes": [], "edges": []},
            "verification_details": {},
            "contradiction_findings": [],
            "scam_network_findings": [],
            "explainability": {"top_factors": [], "supporting_evidence": [], "risk_evidence": []},
            "input_metadata": {"input_type": "TEXT", "raw_text_preview": "User B notice 2"}
        })

    @classmethod
    def tearDownClass(cls):
        storage.delete_case(cls.case_a1_id)
        storage.delete_case(cls.case_a2_id)
        storage.delete_case(cls.case_b1_id)
        storage.delete_case(cls.case_b2_id)

    def test_01_database_mandatory_fields_present(self):
        """1. Every case must contain: case_id, user_id, created_at, input_type, organization, verdict, trust_score, risk_level, analysis_id."""
        required_fields = [
            "case_id", "user_id", "created_at", "input_type",
            "organization", "verdict", "trust_score", "risk_level", "analysis_id"
        ]
        for cid in [self.case_a1_id, self.case_a2_id, self.case_b1_id, self.case_b2_id]:
            case = storage.get_case(cid)
            self.assertIsNotNone(case, f"Case {cid} must exist")
            for field in required_fields:
                self.assertIn(field, case, f"Field '{field}' must exist in case {cid}")
                self.assertIsNotNone(case[field], f"Field '{field}' cannot be None in case {cid}")

    def test_02_user_a_history_isolation(self):
        """2. User A can see ONLY User A's checks (A1, A2) in /api/history and /api/cases."""
        res = requests.get(f"{BASE_URL}/api/history", headers=self.headers_a)
        self.assertEqual(res.status_code, 200)
        cases = res.json()
        case_ids = [c["case_id"] for c in cases]

        self.assertIn(self.case_a1_id, case_ids)
        self.assertIn(self.case_a2_id, case_ids)
        self.assertNotIn(self.case_b1_id, case_ids)
        self.assertNotIn(self.case_b2_id, case_ids)

        for c in cases:
            self.assertEqual(c["user_id"], self.user_a_id)
            self.assertNotIn("User B", c.get("organization", ""))

    def test_03_user_b_history_isolation(self):
        """2b. User B can see ONLY User B's checks (B1, B2) in /api/history and /api/cases."""
        res = requests.get(f"{BASE_URL}/api/history", headers=self.headers_b)
        self.assertEqual(res.status_code, 200)
        cases = res.json()
        case_ids = [c["case_id"] for c in cases]

        self.assertIn(self.case_b1_id, case_ids)
        self.assertIn(self.case_b2_id, case_ids)
        self.assertNotIn(self.case_a1_id, case_ids)
        self.assertNotIn(self.case_a2_id, case_ids)

        for c in cases:
            self.assertEqual(c["user_id"], self.user_b_id)
            self.assertNotIn("User A", c.get("organization", ""))

    def test_04_user_a_cannot_access_user_b_case(self):
        """3. GET /api/case/B1 by User A must return 403 Forbidden."""
        res = requests.get(f"{BASE_URL}/api/case/{self.case_b1_id}", headers=self.headers_a)
        self.assertEqual(res.status_code, 403)
        self.assertIn("forbidden", res.json().get("detail", "").lower())

    def test_05_user_b_can_access_own_case(self):
        """3b. User B can access their own case B1."""
        res = requests.get(f"{BASE_URL}/api/case/{self.case_b1_id}", headers=self.headers_b)
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.json()["case_id"], self.case_b1_id)

    def test_06_user_a_cannot_delete_user_b_case(self):
        """4. DELETE /api/case/B1 by User A must return 403 Forbidden."""
        res = requests.delete(f"{BASE_URL}/api/case/{self.case_b1_id}", headers=self.headers_a)
        self.assertEqual(res.status_code, 403)
        self.assertIn("forbidden", res.json().get("detail", "").lower())

        # Verify B1 was NOT deleted
        self.assertIsNotNone(storage.get_case(self.case_b1_id))

    def test_07_user_a_cannot_download_user_b_report(self):
        """5. GET /api/report/B1/download by User A must return 403 Forbidden."""
        res = requests.get(f"{BASE_URL}/api/report/{self.case_b1_id}/download", headers=self.headers_a)
        self.assertEqual(res.status_code, 403)
        self.assertIn("forbidden", res.json().get("detail", "").lower())

    def test_08_user_a_cannot_view_user_b_report(self):
        """5b. GET /api/report/B1/view by User A must return 403 Forbidden."""
        res = requests.get(f"{BASE_URL}/api/report/{self.case_b1_id}/view", headers=self.headers_a)
        self.assertEqual(res.status_code, 403)
        self.assertIn("forbidden", res.json().get("detail", "").lower())

    def test_09_unauthenticated_requests_rejected(self):
        """6. Unauthenticated requests to history, case, delete, report must be rejected (401)."""
        res_hist = requests.get(f"{BASE_URL}/api/history")
        self.assertEqual(res_hist.status_code, 401)

        res_case = requests.get(f"{BASE_URL}/api/case/{self.case_a1_id}")
        self.assertEqual(res_case.status_code, 401)

        res_del = requests.delete(f"{BASE_URL}/api/case/{self.case_a1_id}")
        self.assertEqual(res_del.status_code, 401)

        res_rep = requests.get(f"{BASE_URL}/api/report/{self.case_a1_id}/download")
        self.assertEqual(res_rep.status_code, 401)

    def test_10_user_can_delete_own_case(self):
        """7. User A can delete their own case A1, and it is removed from history."""
        res = requests.delete(f"{BASE_URL}/api/case/{self.case_a1_id}", headers=self.headers_a)
        self.assertEqual(res.status_code, 200)

        # Verify case cannot be accessed anymore (404 Not Found)
        res_get = requests.get(f"{BASE_URL}/api/case/{self.case_a1_id}", headers=self.headers_a)
        self.assertEqual(res_get.status_code, 404)

        # Verify case is gone from storage
        self.assertIsNone(storage.get_case(self.case_a1_id))

        # Verify User A's history now contains only A2
        res_hist = requests.get(f"{BASE_URL}/api/history", headers=self.headers_a)
        self.assertEqual(res_hist.status_code, 200)
        remaining_ids = [c["case_id"] for c in res_hist.json()]
        self.assertNotIn(self.case_a1_id, remaining_ids)
        self.assertIn(self.case_a2_id, remaining_ids)

if __name__ == "__main__":
    unittest.main()
