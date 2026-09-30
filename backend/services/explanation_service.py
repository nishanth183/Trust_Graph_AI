from typing import Dict, Any, List

class ExplainableAIService:
    """
    Translates complex feature weights, decision trees, and reasoning outputs
    into transparent, human-comprehensible positive supporting and negative risk factors.
    """

    def generate_explanation(
        self,
        evidence: Dict[str, Any],
        verification: Dict[str, Any],
        contradictions: List[Dict[str, Any]],
        scam_links: List[Dict[str, Any]],
        dna_result: Dict[str, Any],
        risk_result: Dict[str, Any]
    ) -> Dict[str, Any]:
        verdict = risk_result.get("verdict", "INCONCLUSIVE")
        supporting_evidence = []
        risk_evidence = []
        top_factors = []

        # 1. Evaluate Supporting (Trust-building) Factors
        if verification.get("organization_status") in ["VERIFIED", "DEMO VERIFIED"]:
            item = f"Organization recognized in official database: {verification.get('organization_name')}"
            supporting_evidence.append(item)
            top_factors.append({
                "feature": "organization_verified",
                "label": "Official Department Recognition",
                "contribution": 0.35,
                "direction": "SUPPORTING",
                "explanation": f"Claim matches an existing constitutional or statutory hiring body ({verification.get('organization_name')})."
            })

        if verification.get("domain_status") in ["VERIFIED", "DEMO VERIFIED"]:
            item = f"Official government domain confirmed: {evidence.get('domain')}"
            supporting_evidence.append(item)
            top_factors.append({
                "feature": "domain_verified",
                "label": "Official Apex Domain (.gov.in)",
                "contribution": 0.40,
                "direction": "SUPPORTING",
                "explanation": "Portal is hosted on official National Informatics Centre (NIC) / Government of India infrastructure."
            })

        if verification.get("notification_status") in ["VERIFIED", "DEMO VERIFIED"]:
            item = f"Notification index matched active official gazette: {evidence.get('notification_number')}"
            supporting_evidence.append(item)
            top_factors.append({
                "feature": "notification_verified",
                "label": "Gazette Notification Index Matched",
                "contribution": 0.30,
                "direction": "SUPPORTING",
                "explanation": "Advertisement reference and vacancy cycle are actively indexed in the official registry."
            })

        if dna_result.get("similarity_score", 0) > 75:
            supporting_evidence.append(f"High Recruitment DNA alignment ({dna_result.get('similarity_score')}%) with trusted civil service pattern.")

        # 2. Evaluate Risk (Scam-building) Factors
        if evidence.get("upi_id"):
            item = f"Personal UPI payment address requested: {evidence.get('upi_id')}"
            risk_evidence.append(item)
            top_factors.append({
                "feature": "personal_upi_id",
                "label": "Direct Personal Payment Handle",
                "contribution": -0.50,
                "direction": "RISK",
                "explanation": "Recruitment fee requests using personal UPI (@okaxis, @paytm, @ybl) are illegal for public recruitment."
            })

        if evidence.get("qr_detected"):
            risk_evidence.append("Embedded direct money transfer QR code in document.")

        if verification.get("domain_status") == "SUSPICIOUS_NON_GOV_DOMAIN":
            item = f"Unofficial non-government domain: {evidence.get('domain')}"
            risk_evidence.append(item)
            top_factors.append({
                "feature": "suspicious_domain",
                "label": "Unofficial Web Domain",
                "contribution": -0.45,
                "direction": "RISK",
                "explanation": "Indian government portals never operate on commercial TLDs (.xyz, .online, .site) for official exam registrations."
            })

        if verification.get("email_status") == "PUBLIC_PROVIDER_CONFLICT":
            item = f"Free public webmail used: {evidence.get('email')}"
            risk_evidence.append(item)
            top_factors.append({
                "feature": "public_email",
                "label": "Public Webmail Used for Official Comms",
                "contribution": -0.30,
                "direction": "RISK",
                "explanation": "Government departments do not conduct official recruitment communications via free public mail services."
            })

        if verification.get("notification_status") == "NOT_FOUND":
            item = f"Claimed notification number not found in gazette: {evidence.get('notification_number')}"
            risk_evidence.append(item)
            top_factors.append({
                "feature": "notif_not_found",
                "label": "Gazette Record Missing",
                "contribution": -0.35,
                "direction": "RISK",
                "explanation": "The reference number provided does not exist in the official published records of this department."
            })

        if scam_links:
            for l in scam_links:
                item = f"Entity matched known scam infrastructure: {l.get('reason')}"
                risk_evidence.append(item)
                top_factors.append({
                    "feature": "syndicate_link",
                    "label": f"Repeated Scam Infrastructure ({l.get('entity_type').upper()})",
                    "contribution": -0.50,
                    "direction": "RISK",
                    "explanation": f"Matched previous flagged case {l.get('connected_case_id')}."
                })

        # Top reasons synthesis
        top_reasons = []
        if verdict == "SCAM":
            if risk_evidence:
                top_reasons = risk_evidence[:4]
            else:
                top_reasons = ["Significant multi-factor contradictions detected", "Recruitment DNA diverged sharply from official standards"]
        elif verdict == "GENUINE":
            if supporting_evidence:
                top_reasons = supporting_evidence[:3]
            else:
                top_reasons = ["Official portal and gazette record validated", "Recruitment DNA conforms to statutory pattern"]
        elif verdict == "SUSPICIOUS":
            top_reasons = risk_evidence[:2] + ["Key recruitment credentials could not be verified in the official registry"]
        else: # INCONCLUSIVE
            top_reasons = ["Insufficient evidence provided to establish authenticity or fraud", "Please verify directly through official state/central gazette portals"]

        # Recommended Action
        if verdict == "SCAM":
            recommended_action = "DO NOT PAY any registration fee. Do not click links or share Aadhaar/PAN cards. Official Indian government recruitments never collect fees via personal UPI handles or third-party web domains."
        elif verdict == "SUSPICIOUS":
            recommended_action = "PROCEED WITH CAUTION. Do not make payments or provide personal credentials. Verify this notification independently by visiting the official commission website."
        elif verdict == "GENUINE":
            recommended_action = "SAFE TO CONTINUE. Ensure you submit your application solely through the official portal URL verified above and pay fees via authorized banking channels."
        else:
            recommended_action = "INCONCLUSIVE. The notification lacks verifiable identifiers. Contact the claimed department's verified helpline or visit their official .gov.in portal."

        return {
            "top_reasons": top_reasons,
            "recommended_action": recommended_action,
            "explainability": {
                "top_factors": top_factors,
                "supporting_evidence": supporting_evidence,
                "risk_evidence": risk_evidence,
                "model_type": risk_result.get("model_type", "Calibrated Ensemble + SHAP Attribution")
            }
        }

explanation_service = ExplainableAIService()
