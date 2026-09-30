from typing import Dict, Any, List, Optional

class RiskReasoningEngine:
    """
    Contradiction and Evidence Reasoning Engine.
    Identifies deterministic institutional conflicts, protocol deviations,
    and multi-factor contradictions across extracted and verified evidence.
    """

    def evaluate_contradictions(
        self,
        evidence: Dict[str, Any],
        verification_details: Dict[str, Any],
        nlp_analysis: Dict[str, Any],
        scam_links: List[Dict[str, Any]],
        dna_result: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        contradictions = []

        org = evidence.get("organization") or ""
        dept = evidence.get("department") or ""
        is_claimed_gov = bool(org and any(k in org.upper() for k in ["GOVERNMENT", "MINISTRY", "UPSC", "SSC", "RAILWAY", "RRB", "POST", "POLICE", "PSC", "DRDO", "ISRO", "COMMISSION"]))

        email = evidence.get("email") or ""
        email_domain = email.split("@")[-1].lower() if "@" in email else ""
        domain = (evidence.get("domain") or "").lower()
        upi_id = evidence.get("upi_id") or ""
        qr_detected = evidence.get("qr_detected", False)
        notif_num = evidence.get("notification_number") or ""
        notif_status = verification_details.get("notification_status")

        # RULE 1: Claimed Government Body + Public / Unofficial Email Provider
        if is_claimed_gov and email:
            public_providers = ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "rediffmail.com", "yandex.com"]
            if email_domain in public_providers:
                contradictions.append({
                    "rule_id": "RULE_CONTRADICTION_01_EMAIL_MISMATCH",
                    "factor": "Claimed Government Institution vs Public Email Provider",
                    "evidence": f"Organization claimed: '{org}', Contact Email provided: '{email}'",
                    "severity": "HIGH",
                    "confidence": 0.95,
                    "explanation": f"All official recruitment communications from {org} must originate from official institutional email gateways (*.gov.in or *.nic.in). Free public mailboxes (@{email_domain}) are never authorized for official recruitment."
                })

        # RULE 2: Official Recruitment + Personal UPI / Direct QR Payment Request
        if is_claimed_gov and (upi_id or qr_detected):
            payment_evidence = upi_id if upi_id else "Payment QR Code (UPI Protocol)"
            contradictions.append({
                "rule_id": "RULE_CONTRADICTION_02_PERSONAL_PAYMENT",
                "factor": "Government Recruitment vs Personal UPI Payment Channel",
                "evidence": f"Fee collector: '{payment_evidence}'",
                "severity": "CRITICAL",
                "confidence": 0.99,
                "explanation": "Official recruitment boards collect exam fees strictly through authorized cyber treasuries or SBI online portals. Individual UPI IDs or direct UPI QR codes are universally indicative of fraud."
            })

        # RULE 3: Official Recruitment Claim + Notification Number Missing / Not in Official Gazette
        if is_claimed_gov and verification_details.get("organization_matched"):
            if notif_status == "NOT_FOUND":
                contradictions.append({
                    "rule_id": "RULE_CONTRADICTION_03_UNVERIFIED_GAZETTE_NUMBER",
                    "factor": "Claimed Advertisement Number Absent from Official Registry",
                    "evidence": f"Advertised number '{notif_num}' could not be verified in the active gazette directory of {verification_details.get('organization_name')}",
                    "severity": "HIGH",
                    "confidence": 0.90,
                    "explanation": "Every legitimate central or state recruitment circular possesses a traceable gazette advertisement index published on the official commission portal."
                })
            elif not notif_num:
                contradictions.append({
                    "rule_id": "RULE_CONTRADICTION_04_MISSING_ADVT_NUMBER",
                    "factor": "Absence of Formal Notification Reference Number",
                    "evidence": "No formal advertisement or notification number identified in message text",
                    "severity": "MEDIUM",
                    "confidence": 0.80,
                    "explanation": "Legitimate government recruitment notices always carry a specific notification/CEN reference code."
                })

        # RULE 4: Claimed Government Institution + Suspicious / Commercial Domain TLD
        if is_claimed_gov and domain:
            is_gov_domain = domain.endswith(".gov.in") or domain.endswith(".nic.in")
            if not is_gov_domain:
                contradictions.append({
                    "rule_id": "RULE_CONTRADICTION_05_DOMAIN_DECEPTION",
                    "factor": "Government Body Identity vs Commercial/Unofficial Domain",
                    "evidence": f"Recruitment portal URL points to non-governmental domain: '{domain}'",
                    "severity": "HIGH",
                    "confidence": 0.94,
                    "explanation": f"Under Indian Central Government digital guidelines, all central and state recruitment portals must be hosted on *.gov.in or *.nic.in domains. The domain '{domain}' is hosted outside official infrastructure."
                })

        # RULE 5: Guaranteed Job / Direct Appointment Without Examination
        if nlp_analysis.get("guaranteed_job_claim"):
            contradictions.append({
                "rule_id": "RULE_CONTRADICTION_06_DIRECT_JOINING_CLAIM",
                "factor": "Guaranteed Employment / Bypass of Statutory Competitive Exam",
                "evidence": "Phrases promising 100% selection or direct appointment without examination",
                "severity": "CRITICAL",
                "confidence": 0.98,
                "explanation": "Articles 14 and 16 of the Constitution of India mandate transparent, merit-based selection processes for public employment. Claims of direct joining without competitive examination violate statutory recruitment policy."
            })

        # RULE 6: Reused Syndicate Infrastructure
        if scam_links:
            for link in scam_links:
                contradictions.append({
                    "rule_id": "RULE_CONTRADICTION_07_REPEATED_SCAM_INFRASTRUCTURE",
                    "factor": f"Reused Scam Infrastructure: {link.get('entity_type').upper()}",
                    "evidence": f"{link.get('entity_type').title()} '{link.get('entity_value')}' matches previously flagged scam case {link.get('connected_case_id')}",
                    "severity": "CRITICAL",
                    "confidence": 0.99,
                    "explanation": f"This entity was previously cataloged as active fraudulent infrastructure in case {link.get('connected_case_id')}: {link.get('reason')}."
                })

        return contradictions

reasoning_engine = RiskReasoningEngine()
