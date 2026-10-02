import asyncio
import unittest
from backend.routes.analyze import analyze_recruitment, get_case_details, list_cases, list_demo_cases
from backend.routes.health import check_health
from backend.routes.verification import list_official_registry

class TestAPIEndpoints(unittest.TestCase):
    def test_health_check(self):
        res = asyncio.run(check_health())
        self.assertEqual(res["status"], "HEALTHY")
        self.assertTrue(res["ai_models_loaded"]["recruitment_dna_engine"])
        self.assertTrue(res["ai_models_loaded"]["evidence_graph_builder"])

    def test_official_registry(self):
        res = asyncio.run(list_official_registry())
        orgs = res["official_organizations"]
        self.assertTrue(any(o["key"] == "UPSC" for o in orgs))

    def test_demo_cases_list(self):
        res = asyncio.run(list_demo_cases())
        self.assertIn("case_1_genuine", res)
        self.assertIn("case_3_personal_upi", res)

    def test_analyze_demo_case_genuine(self):
        res = asyncio.run(analyze_recruitment(demo_case_id="case_1_genuine"))
        self.assertEqual(res["verdict"], "GENUINE")
        self.assertEqual(res["risk_level"], "LOW")
        self.assertGreaterEqual(res["trust_score"], 80.0)
        self.assertIn("recruitment_dna", res)
        self.assertIn("evidence_graph", res)
        self.assertGreaterEqual(res["recruitment_dna"]["similarity_score"], 80.0)

    def test_analyze_demo_case_scam(self):
        res = asyncio.run(analyze_recruitment(demo_case_id="case_3_personal_upi"))
        self.assertEqual(res["verdict"], "SCAM")
        self.assertEqual(res["risk_level"], "HIGH")
        self.assertLessEqual(res["trust_score"], 35.0)
        self.assertTrue(len(res["contradiction_findings"]) >= 1)
        self.assertTrue(any(c["severity"] == "CRITICAL" for c in res["contradiction_findings"]))

    def test_case_retrieval(self):
        from backend.utils.auth import create_token
        token = create_token("USR-ADMIN-001", "admin", "admin")
        analysis = asyncio.run(analyze_recruitment(demo_case_id="case_2_suspicious_domain"))
        case_id = analysis["case_id"]
        fetched = asyncio.run(get_case_details(case_id, authorization=f"Bearer {token}"))
        self.assertEqual(fetched["case_id"], case_id)
        self.assertEqual(fetched["verdict"], analysis["verdict"])

if __name__ == "__main__":
    unittest.main()
