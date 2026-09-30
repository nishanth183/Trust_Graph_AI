import unittest
from backend.services.extraction_service import extraction_service

class TestEvidenceExtraction(unittest.TestCase):
    def test_extract_upsc_notice(self):
        text = """UNION PUBLIC SERVICE COMMISSION
EXAMINATION NOTICE NO. 05/2026-CSP
Civil Services (Preliminary) Examination 2026
Apply online: https://upsconline.nic.in
Fee: Rs. 100
Contact: facilitation@upsc.gov.in"""
        ev = extraction_service.extract_evidence(text)
        self.assertIn("UPSC", ev["organization"])
        self.assertEqual(ev["notification_number"], "05/2026-CSP")
        self.assertEqual(ev["email"], "facilitation@upsc.gov.in")
        self.assertEqual(ev["application_fee"], 100.0)
        self.assertEqual(ev["domain"], "upsconline.nic.in")

    def test_extract_scam_with_upi_and_phone(self):
        text = """Railway Urgent Recruitment 2026
Apply immediately. Registration fee Rs. 500.
Pay via UPI: recruitment.officer@okaxis
WhatsApp: +919876543210
Website: https://rrb-recruitment-gov.online"""
        ev = extraction_service.extract_evidence(text)
        self.assertEqual(ev["upi_id"], "recruitment.officer@okaxis")
        self.assertEqual(ev["phone"], "+919876543210")
        self.assertEqual(ev["application_fee"], 500.0)
        self.assertEqual(ev["domain"], "rrb-recruitment-gov.online")

if __name__ == "__main__":
    unittest.main()
