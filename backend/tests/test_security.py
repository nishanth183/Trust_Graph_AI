import unittest
from backend.utils.security import sanitize_url, mask_sensitive_info
from fastapi import HTTPException

class TestSecurityUtils(unittest.TestCase):
    def test_sanitize_valid_url(self):
        url = sanitize_url("upsc.gov.in")
        self.assertEqual(url, "https://upsc.gov.in")

    def test_block_loopback_and_internal_ip(self):
        with self.assertRaises(HTTPException):
            sanitize_url("http://127.0.0.1:8000/internal")
        with self.assertRaises(HTTPException):
            sanitize_url("http://localhost:3000")

    def test_mask_sensitive_info(self):
        raw = "Contact recruitment officer at +919876543210 or email testuser@gmail.com"
        masked = mask_sensitive_info(raw)
        self.assertNotIn("+919876543210", masked)
        self.assertNotIn("testuser@gmail.com", masked)
        self.assertIn("@gmail.com", masked)

if __name__ == "__main__":
    unittest.main()
