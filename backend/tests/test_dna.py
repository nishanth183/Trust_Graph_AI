import unittest
from backend.services.dna_service import dna_service

class TestRecruitmentDNA(unittest.TestCase):
    def test_dna_generation_and_matching(self):
        genuine_evidence = {
            "organization": "Union Public Service Commission",
            "department": "DoPT",
            "notification_number": "05/2026-CSP",
            "domain": "upsc.gov.in",
            "website": "https://upsc.gov.in",
            "email": "notice@upsc.gov.in",
            "application_fee": 100,
            "upi_id": None,
            "qr_detected": False,
            "dates": {"deadline": "2026-03-05"}
        }

        submitted_dna = dna_service.generate_dna(genuine_evidence)
        self.assertIn("signatures", submitted_dna)
        self.assertEqual(len(submitted_dna["signatures"]), 9)

        result = dna_service.compare_dna(submitted_dna)
        self.assertGreaterEqual(result["similarity_score"], 80.0)
        self.assertTrue(any("Official Government Apex Domain" in f for f in result["matching_features"]))

    def test_scam_dna_divergence(self):
        scam_evidence = {
            "organization": "Railway Board",
            "domain": "rrb-recruitment.online",
            "email": "helpdesk@gmail.com",
            "upi_id": "scam@okaxis",
            "qr_detected": True,
            "dates": {"deadline": "immediate"}
        }
        submitted_dna = dna_service.generate_dna(scam_evidence)
        result = dna_service.compare_dna(submitted_dna)
        self.assertLess(result["similarity_score"], 40.0)
        self.assertTrue(len(result["mismatching_features"]) >= 3)

if __name__ == "__main__":
    unittest.main()
