import re
import socket
import ssl
from urllib.parse import urlparse
from typing import Dict, Any, Optional

KNOWN_OFFICIAL_GOV_DOMAINS = [
    "upsc.gov.in", "upsconline.nic.in",
    "ssc.gov.in", "ssc.nic.in",
    "indianrailways.gov.in", "rrbcdg.gov.in", "rrbapply.gov.in",
    "indiapostgdsonline.gov.in", "indiapost.gov.in",
    "ibps.in", "tnpsc.gov.in", "bpsc.bih.nic.in", "drdo.gov.in"
]

SUSPICIOUS_TLDS = [".xyz", ".online", ".top", ".club", ".site", ".work", ".buzz", ".info", ".cc", ".tk", ".cf", ".gq"]

class URLAnalysisService:
    def analyze_url(self, raw_url: str, is_demo_mode: bool = True) -> Dict[str, Any]:
        if not raw_url:
            return {
                "url": None,
                "domain": None,
                "is_https": False,
                "is_official_gov_tld": False,
                "is_suspicious_tld": False,
                "typosquatting_detected": False,
                "ssl_status": "UNAVAILABLE",
                "domain_age_days": "UNAVAILABLE",
                "risk_score": 0.0,
                "notes": []
            }

        url = raw_url.strip()
        if not url.startswith(("http://", "https://")):
            url = "https://" + url

        parsed = urlparse(url)
        domain = parsed.netloc.lower()
        if ":" in domain:
            domain = domain.split(":")[0]

        is_https = parsed.scheme == "https"
        is_official_tld = domain.endswith(".gov.in") or domain.endswith(".nic.in")
        
        # Check suspicious TLD
        is_suspicious_tld = any(domain.endswith(tld) for tld in SUSPICIOUS_TLDS)

        # Typosquatting / deceptive keyword detection in non-gov domains
        typosquatting = False
        notes = []
        suspicious_keywords = ["upsc", "ssc", "rrb", "railway", "sarkari", "govt", "naukri", "recruitment", "indiapost"]
        
        if not is_official_tld:
            for kw in suspicious_keywords:
                if kw in domain:
                    typosquatting = True
                    notes.append(f"Domain '{domain}' embeds government recruitment keyword '{kw}' but does NOT possess a legitimate .gov.in or .nic.in apex domain.")
                    break

        # SSL status check
        ssl_status = "UNAVAILABLE"
        if not is_https:
            ssl_status = "INSECURE_HTTP"
            notes.append("Site uses unencrypted HTTP. Official government portals mandate HTTPS.")
        else:
            ssl_status = "HTTPS_ACTIVE"

        # Calculate domain risk score (0.0 to 1.0)
        risk = 0.0
        if is_official_tld:
            risk = 0.05 # Legitimate gov domain
        elif typosquatting or is_suspicious_tld:
            risk = 0.90 # Strong scam indicator
        else:
            risk = 0.50 # Unofficial private portal (e.g. general job board)

        return {
            "url": url,
            "domain": domain,
            "is_https": is_https,
            "is_official_gov_tld": is_official_tld,
            "is_suspicious_tld": is_suspicious_tld,
            "typosquatting_detected": typosquatting,
            "ssl_status": ssl_status,
            "domain_age": "UNAVAILABLE (WHOIS lookup not configured for local privacy)" if not is_demo_mode else ("DEMO: Registered 14 days ago" if (typosquatting or is_suspicious_tld) else "DEMO: Official Domain"),
            "risk_score": risk,
            "notes": notes
        }

url_service = URLAnalysisService()
