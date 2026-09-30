import unittest
from backend.services.risk_service import risk_service

class TestRiskEngine(unittest.TestCase):
    def test_risk_prediction_safety_arbiter(self):
        # Even with zero ML inputs, if critical contradiction exists (personal UPI), arbiter mandates SCAM
        features = risk_service.extract_feature_vector(
            evidence={"upi_id": "scam@okaxis"},
            verification={"domain_status": "SUSPICIOUS_NON_GOV_DOMAIN"},
            nlp_data={"nlp_risk_score": 80.0},
            dna_result={"similarity_score": 20.0},
            graph_result={"total_edges": 5, "suspicious_edges_count": 3},
            scam_links=[],
            contradictions=[{"severity": "CRITICAL", "factor": "Personal UPI"}]
        )
        pred = risk_service.predict_risk(
            features=features,
            contradictions=[{"severity": "CRITICAL"}],
            verification={"domain_status": "SUSPICIOUS_NON_GOV_DOMAIN"},
            scam_links=[]
        )
        self.assertEqual(pred["verdict"], "SCAM")
        self.assertEqual(pred["risk_level"], "HIGH")
        self.assertGreaterEqual(pred["scam_probability"], 90.0)

if __name__ == "__main__":
    unittest.main()
