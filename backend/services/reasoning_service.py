import re
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
        is_claimed_gov = bool(org and any(k in org.upper() for k in ["GOVERNMENT", "MINISTRY", "UPSC", "SSC", "RAILWAY", "RRB", "POST", "POLICE", "PSC", "DRDO", "ISRO", "COMMISSION", "BOARD", "DEPARTMENT"]))
        raw_text = (evidence.get("raw_text") or nlp_analysis.get("raw_text") or "").lower()

        email = evidence.get("email") or ""
        email_domain = email.split("@")[-1].lower() if "@" in email else ""
        domain = (evidence.get("domain") or "").lower()
        upi_id = evidence.get("upi_id") or ""
        qr_detected = evidence.get("qr_detected", False)
        notif_num = evidence.get("notification_number") or ""
        notif_status = verification_details.get("notification_status")
        org_matched = bool(verification_details.get("organization_matched"))
        org_name = verification_details.get("organization_name") or org

        # RULE 1: Unverified Government / Police Organization (Flag only when coupled with non-official attributes)
        has_fraud_signals = bool(upi_id or qr_detected or (domain and not domain.endswith(".gov.in") and not domain.endswith(".nic.in")) or nlp_analysis.get("guaranteed_job_claim"))
        if is_claimed_gov and not org_matched and has_fraud_signals:
            contradictions.append({
                "rule_id": "RULE_CONTRADICTION_00_UNVERIFIED_BODY",
                "factor": "Unverified Government / Police Recruitment Body",
                "evidence": f"Claimed entity: '{org}'",
                "severity": "HIGH",
                "confidence": 0.92,
                "explanation": f"The entity '{org}' is not listed as a verified statutory recruitment body in the official government directory. Fraudulent job posts frequently impersonate state police departments or recruitment boards."
            })

        # RULE 2: Claimed Government Body + Public / Unofficial Email Provider
        if is_claimed_gov and email:
            public_providers = ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "rediffmail.com", "yandex.com"]
            if email_domain in public_providers:
                contradictions.append({
                    "rule_id": "RULE_CONTRADICTION_01_EMAIL_MISMATCH",
                    "factor": "Government Institution vs Public Email Provider",
                    "evidence": f"Organization claimed: '{org}', Contact Email provided: '{email}'",
                    "severity": "HIGH",
                    "confidence": 0.95,
                    "explanation": f"All official recruitment communications from {org_name} must originate from official institutional email gateways (*.gov.in or *.nic.in). Free public mailboxes (@{email_domain}) are never authorized for official recruitment."
                })

        # RULE 3: Official Recruitment + Personal UPI / Direct QR Payment Request
        if (is_claimed_gov or evidence.get("payment_requested")) and (upi_id or qr_detected):
            payment_evidence = upi_id if upi_id else "Payment QR Code (UPI Protocol)"
            contradictions.append({
                "rule_id": "RULE_CONTRADICTION_02_PERSONAL_PAYMENT",
                "factor": "Recruitment Notice vs Personal UPI Payment Channel",
                "evidence": f"Fee collector: '{payment_evidence}'",
                "severity": "CRITICAL",
                "confidence": 0.99,
                "explanation": "Official recruitment boards collect exam fees strictly through authorized cyber treasuries or SBI online portals. Individual UPI IDs or direct UPI QR codes are universally indicative of fraud."
            })

        # RULE 4: Unauthorized Fee Solicitation / Security Deposit
        if evidence.get("is_unauthorized_payment") and not (upi_id or qr_detected):
            fee_val = evidence.get("application_fee")
            fee_str = f"₹{int(fee_val)}" if fee_val else "Registration / Security Fee"
            contradictions.append({
                "rule_id": "RULE_CONTRADICTION_03_FEE_WITHOUT_PORTAL",
                "factor": "Unauthorized Registration / Security Deposit Solicitation",
                "evidence": f"Payment requested: {fee_str} via unauthorized channel",
                "severity": "HIGH",
                "confidence": 0.91,
                "explanation": "Legitimate recruitment notices require payment exclusively through secured payment gateways on official government portals (.gov.in). Soliciting refundable deposits or registration charges directly is a primary fraud indicator."
            })

        # RULE 5: Informal Document Submission (Aadhaar / PAN over WhatsApp / Telegram)
        is_informal_doc_submission = bool(
            re.search(r'\b(?:send|forward|share|submit|upload)\b[^\n.]{0,80}\b(?:aadhaar|pan\s*card|voter\s*id|marksheet|passbook|certificate)\b[^\n.]{0,80}\b(?:whatsapp|telegram|\+?91[\-\s]?[6-9]\d{9})\b', raw_text, re.I) or
            re.search(r'\b(?:whatsapp|telegram)\s*(?:interview|appointment\s*letter|selection\s*guarantee)\b', raw_text, re.I) or
            ("screenshot" in raw_text and ("whatsapp" in raw_text or "telegram" in raw_text))
        )
        if is_informal_doc_submission:
            contradictions.append({
                "rule_id": "RULE_CONTRADICTION_04_INFORMAL_DOC_SUBMISSION",
                "factor": "Informal Channel Identity Document Submission Request",
                "evidence": "Requests candidates to send Aadhaar, PAN card, or payment screenshots via WhatsApp / Telegram",
                "severity": "HIGH",
                "confidence": 0.96,
                "explanation": "Official recruitment agencies never request candidates to submit sensitive personal identification documents (Aadhaar/PAN) or certificates through instant messaging applications."
            })

        # RULE 6: Claimed Government Institution + Suspicious / Commercial Domain TLD
        if is_claimed_gov and domain:
            is_gov_domain = domain.endswith(".gov.in") or domain.endswith(".nic.in")
            if not is_gov_domain:
                contradictions.append({
                    "rule_id": "RULE_CONTRADICTION_05_DOMAIN_DECEPTION",
                    "factor": "Government Body Identity vs Commercial/Unofficial Domain",
                    "evidence": f"Recruitment portal URL points to non-governmental domain: '{domain}'",
                    "severity": "HIGH",
                    "confidence": 0.94,
                    "explanation": f"Under Indian Central Government digital guidelines, all central and state recruitment portals must be hosted on *.gov.in or *.nic.in domains. The domain '{domain}' is hosted outside official government infrastructure."
                })
        elif is_claimed_gov and not domain:
            contradictions.append({
                "rule_id": "RULE_CONTRADICTION_06_MISSING_OFFICIAL_PORTAL",
                "factor": "Absence of Official Government Web Portal",
                "evidence": "No official website domain provided in recruitment notice",
                "severity": "MEDIUM",
                "confidence": 0.85,
                "explanation": "Legitimate government recruitment notifications direct candidates to official .gov.in web portals for online registration and verification."
            })

        # RULE 7: Official Gazette Reference Number Missing / Unverified
        if is_claimed_gov:
            if notif_status == "NOT_FOUND":
                contradictions.append({
                    "rule_id": "RULE_CONTRADICTION_07_UNVERIFIED_GAZETTE_NUMBER",
                    "factor": "Claimed Advertisement Number Absent from Official Registry",
                    "evidence": f"Advertised number '{notif_num}' could not be verified in the active gazette directory of {org_name}",
                    "severity": "HIGH",
                    "confidence": 0.90,
                    "explanation": "Every legitimate central or state recruitment circular possesses a traceable gazette advertisement index published on the official commission portal."
                })
            elif not notif_num:
                contradictions.append({
                    "rule_id": "RULE_CONTRADICTION_08_MISSING_ADVT_NUMBER",
                    "factor": "Absence of Formal Notification Reference Number",
                    "evidence": "No formal advertisement or notification number identified in message text",
                    "severity": "MEDIUM",
                    "confidence": 0.80,
                    "explanation": "Legitimate government recruitment notices always carry a specific notification/CEN reference code."
                })

        # RULE 8: Guaranteed Job / Direct Appointment Without Examination
        if nlp_analysis.get("guaranteed_job_claim"):
            contradictions.append({
                "rule_id": "RULE_CONTRADICTION_09_DIRECT_JOINING_CLAIM",
                "factor": "Guaranteed Employment / Bypass of Statutory Competitive Exam",
                "evidence": "Phrases promising 100% selection or direct appointment without examination",
                "severity": "CRITICAL",
                "confidence": 0.98,
                "explanation": "Articles 14 and 16 of the Constitution of India mandate transparent, merit-based selection processes for public employment. Claims of direct joining without competitive examination violate statutory recruitment policy."
            })

        # RULE 9: Reused Syndicate Infrastructure
        if scam_links:
            for link in scam_links:
                contradictions.append({
                    "rule_id": "RULE_CONTRADICTION_10_REPEATED_SCAM_INFRASTRUCTURE",
                    "factor": f"Reused Scam Infrastructure: {link.get('entity_type').upper()}",
                    "evidence": f"{link.get('entity_type').title()} '{link.get('entity_value')}' matches previously flagged scam case {link.get('connected_case_id')}",
                    "severity": "CRITICAL",
                    "confidence": 0.99,
                    "explanation": f"This entity was previously cataloged as active fraudulent infrastructure in case {link.get('connected_case_id')}: {link.get('reason')}."
                })

        return contradictions

reasoning_engine = RiskReasoningEngine()
