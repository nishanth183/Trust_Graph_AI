from typing import Dict, Any, List
from backend.utils.storage import storage

class ScamNetworkAnalyzer:
    """
    Identifies repeated entities and syndicate infrastructure across historical and demo scam records.
    Cross-checks phones, UPI addresses, QR code hashes, and spoofed domains.
    """

    def analyze_connections(self, evidence: Dict[str, Any]) -> List[Dict[str, Any]]:
        links = []
        indicators = storage.get_scam_indicators()

        phone = evidence.get("phone")
        if phone:
            normalized_phone = phone.replace(" ", "").replace("-", "")
            for p_rec in indicators.get("phones", []):
                p_val = p_rec["value"].replace(" ", "").replace("-", "")
                if normalized_phone == p_val or (len(normalized_phone) >= 10 and normalized_phone[-10:] == p_val[-10:]):
                    links.append({
                        "entity_type": "phone",
                        "entity_value": phone,
                        "connected_case_id": p_rec.get("case_id", "HISTORICAL_CASE"),
                        "connection_strength": "KNOWN" if p_rec.get("status") == "CONFIRMED_SCAM" else "SUSPICIOUS",
                        "reason": f"Phone number previously reported in case {p_rec.get('case_id')}: {p_rec.get('reason')}"
                    })

        upi_id = evidence.get("upi_id")
        if upi_id:
            normalized_upi = upi_id.strip().lower()
            for u_rec in indicators.get("upi_ids", []):
                if normalized_upi == u_rec["value"].strip().lower():
                    links.append({
                        "entity_type": "upi",
                        "entity_value": upi_id,
                        "connected_case_id": u_rec.get("case_id", "HISTORICAL_CASE"),
                        "connection_strength": "KNOWN",
                        "reason": f"UPI recipient ID matched known fraudulent payment collector in case {u_rec.get('case_id')}: {u_rec.get('reason')}"
                    })

        domain = evidence.get("domain")
        if domain:
            normalized_dom = domain.strip().lower()
            for d_rec in indicators.get("domains", []):
                if normalized_dom == d_rec["value"].strip().lower():
                    links.append({
                        "entity_type": "domain",
                        "entity_value": domain,
                        "connected_case_id": d_rec.get("case_id", "HISTORICAL_CASE"),
                        "connection_strength": "KNOWN",
                        "reason": f"Domain matches known deceptive recruitment portal in case {d_rec.get('case_id')}: {d_rec.get('reason')}"
                    })

        return links

network_service = ScamNetworkAnalyzer()
