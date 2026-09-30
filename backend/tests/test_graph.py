import unittest
from backend.services.graph_service import graph_service

class TestEvidenceGraph(unittest.TestCase):
    def test_build_graph(self):
        evidence = {
            "organization": "Staff Selection Commission",
            "notification_number": "SSC-CGL-2026",
            "domain": "ssc.gov.in",
            "email": "ssc@nic.in",
            "phone": "+919876543210",
            "upi_id": "test@okaxis"
        }
        graph = graph_service.build_graph("TG-TEST-001", evidence)
        self.assertGreaterEqual(graph["total_nodes"], 5)
        self.assertGreaterEqual(graph["total_edges"], 4)
        node_types = [n["data"]["type"] for n in graph["nodes"]]
        self.assertIn("Organization", node_types)
        self.assertIn("Notification", node_types)
        self.assertIn("Domain", node_types)
        self.assertIn("UPI", node_types)

if __name__ == "__main__":
    unittest.main()
