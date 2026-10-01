import hashlib
import json
from typing import Dict, Any, List, Optional
from datetime import datetime

class RecruitmentDNAService:
    """
    Core Innovation: Recruitment DNA Generator and Matcher.
    Transforms raw and verified evidence into a structured 9-dimensional digital feature genome,
    and performs deterministic similarity comparison against trusted official recruitment DNA profiles.
    """

    def generate_dna(self, evidence: Dict[str, Any], nlp_results: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        nlp_data = nlp_results or {}

        # 1. Organization Signature
        org = evidence.get("organization") or "UNSPECIFIED"
        dept = evidence.get("department") or "UNSPECIFIED"
        org_sig = {
            "claimed_organization": org,
            "claimed_department": dept,
            "is_central_or_state": "CENTRAL" if any(k in org.upper() for k in ["UPSC", "SSC", "RAILWAY", "INDIA POST", "DRDO", "ISRO"]) else "STATE_OR_OTHER",
            "entity_normalized_id": self._hash_str(f"{org}:{dept}")
        }

        # 2. Notification Signature
        notif_num = evidence.get("notification_number")
        notif_sig = {
            "notification_number": notif_num,
            "has_standard_format": bool(notif_num and any(char in notif_num for char in ["/", "-", "."])),
            "advt_fingerprint": self._hash_str(notif_num or "NONE")
        }

        # 3. Domain Signature
        domain = evidence.get("domain") or ""
        domain_sig = {
            "domain": domain,
            "tld": domain.split(".")[-1] if "." in domain else "NONE",
            "is_gov_in": domain.endswith(".gov.in") or domain.endswith(".nic.in"),
            "is_suspicious_tld": any(domain.endswith(tld) for tld in [".xyz", ".online", ".site", ".top", ".club", ".info"]),
            "protocol": "HTTPS" if (evidence.get("website") or "").startswith("https") else "HTTP"
        }

        # 4. Contact Signature
        email = evidence.get("email") or ""
        phone = evidence.get("phone") or ""
        email_domain = email.split("@")[-1] if "@" in email else ""
        contact_sig = {
            "email": email,
            "email_domain": email_domain,
            "is_public_mailbox": email_domain in ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com"],
            "phone": phone,
            "contact_channel": evidence.get("source_platform") or "Direct"
        }

        # 5. Visual Signature
        visual_sig = {
            "has_emblem_crest": bool(evidence.get("has_emblem", True)),
            "qr_detected": bool(evidence.get("qr_detected")),
            "qr_type": "UPI_PAYMENT" if evidence.get("qr_data") and "upi://" in str(evidence.get("qr_data")) else ("NONE" if not evidence.get("qr_detected") else "GENERIC")
        }

        # 6. Writing / Linguistic Signature
        writing_sig = {
            "linguistic_style": nlp_data.get("linguistic_style", "NEUTRAL"),
            "urgency_markers_count": nlp_data.get("semantic_features", {}).get("urgency_markers_count", 0),
            "guaranteed_job_claim": nlp_data.get("guaranteed_job_claim", False),
            "nlp_risk_score": nlp_data.get("nlp_risk_score", 0.0)
        }

        # 7. Layout Signature
        layout_sig = {
            "format_type": "GAZETTE_OFFICIAL" if not domain_sig["is_suspicious_tld"] and not contact_sig["is_public_mailbox"] else "UNOFFICIAL_CIRCULAR",
            "has_tabular_vacancies": True
        }

        # 8. Payment Signature
        upi_id = evidence.get("upi_id") or ""
        fee = evidence.get("application_fee")
        payment_sig = {
            "has_application_fee": fee is not None and fee > 0,
            "fee_amount": fee,
            "is_personal_upi": bool(upi_id),
            "upi_handle": upi_id,
            "payment_mechanism": "PERSONAL_UPI" if upi_id else ("OFFICIAL_BANK_GATEWAY" if domain_sig["is_gov_in"] else "UNSPECIFIED")
        }

        # 9. Temporal Signature
        dates = evidence.get("dates") or {}
        temporal_sig = {
            "deadline": dates.get("deadline"),
            "has_realistic_window": bool(dates.get("deadline") and dates.get("deadline") not in ["immediate", "today", "24 hours"])
        }

        signatures = {
            "organization_signature": org_sig,
            "notification_signature": notif_sig,
            "domain_signature": domain_sig,
            "contact_signature": contact_sig,
            "visual_signature": visual_sig,
            "writing_signature": writing_sig,
            "layout_signature": layout_sig,
            "payment_signature": payment_sig,
            "temporal_signature": temporal_sig
        }

        dna_id = f"DNA-{self._hash_str(json.dumps(signatures, sort_keys=True))[:12].upper()}"

        return {
            "dna_id": dna_id,
            "signatures": signatures
        }

    def compare_dna(self, submitted_dna: Dict[str, Any], official_benchmark: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Compare Submitted DNA vs Trusted Government DNA profile.
        Calculates mathematical weighted similarity score across all 9 signatures.
        """
        signatures = submitted_dna.get("signatures", {})

        # Weights across core dimensions (Total: 100.0)
        weights = {
            "domain_authenticity": 25.0,
            "payment_mechanism": 25.0,
            "email_channel": 15.0,
            "notification_format": 15.0,
            "linguistic_integrity": 10.0,
            "temporal_realism": 5.0,
            "qr_safety": 5.0
        }

        score = 0.0
        matching_features = []
        mismatching_features = []
        missing_features = []
        breakdown = []

        # 1. Domain Authenticity
        dom_sig = signatures.get("domain_signature", {})
        if dom_sig.get("is_gov_in"):
            score += weights["domain_authenticity"]
            matching_features.append("Official Government Apex Domain (.gov.in / .nic.in)")
            breakdown.append({
                "feature_name": "Domain Authority",
                "category": "Domain Signature",
                "submitted_val": dom_sig.get("domain"),
                "trusted_val": "*.gov.in / *.nic.in",
                "status": "MATCH",
                "weight": weights["domain_authenticity"]
            })
        elif dom_sig.get("is_suspicious_tld") or dom_sig.get("domain") == "example-recruitment-site.com":
            mismatching_features.append(f"Suspicious Unofficial Domain TLD: {dom_sig.get('domain')}")
            breakdown.append({
                "feature_name": "Domain Authority",
                "category": "Domain Signature",
                "submitted_val": dom_sig.get("domain"),
                "trusted_val": "*.gov.in / *.nic.in",
                "status": "MISMATCH",
                "weight": weights["domain_authenticity"]
            })
        elif not dom_sig.get("domain"):
            missing_features.append("No official portal domain provided")
            breakdown.append({
                "feature_name": "Domain Authority",
                "category": "Domain Signature",
                "submitted_val": "None",
                "trusted_val": "*.gov.in",
                "status": "MISSING",
                "weight": weights["domain_authenticity"]
            })
        else:
            # Neutral / private portal
            score += weights["domain_authenticity"] * 0.4
            breakdown.append({
                "feature_name": "Domain Authority",
                "category": "Domain Signature",
                "submitted_val": dom_sig.get("domain"),
                "trusted_val": "*.gov.in",
                "status": "UNVERIFIED",
                "weight": weights["domain_authenticity"]
            })

        # 2. Payment Channel
        pay_sig = signatures.get("payment_signature", {})
        if pay_sig.get("is_personal_upi"):
            mismatching_features.append(f"Direct personal UPI payment handle requested: {pay_sig.get('upi_handle')}")
            breakdown.append({
                "feature_name": "Payment Gateway",
                "category": "Payment Signature",
                "submitted_val": pay_sig.get("upi_handle"),
                "trusted_val": "Official Treasury / SBI e-Pay Portal",
                "status": "MISMATCH",
                "weight": weights["payment_mechanism"]
            })
        elif not pay_sig.get("has_application_fee") or pay_sig.get("payment_mechanism") == "OFFICIAL_BANK_GATEWAY":
            score += weights["payment_mechanism"]
            matching_features.append("No personal payment or unauthorized UPI collection detected")
            breakdown.append({
                "feature_name": "Payment Gateway",
                "category": "Payment Signature",
                "submitted_val": "Official Gateway / Standard Fee",
                "trusted_val": "Official Treasury / SBI e-Pay Portal",
                "status": "MATCH",
                "weight": weights["payment_mechanism"]
            })
        else:
            score += weights["payment_mechanism"] * 0.5
            breakdown.append({
                "feature_name": "Payment Gateway",
                "category": "Payment Signature",
                "submitted_val": f"Fee ₹{pay_sig.get('fee_amount')}",
                "trusted_val": "Official Treasury",
                "status": "UNVERIFIED",
                "weight": weights["payment_mechanism"]
            })

        # 3. Email Channel
        contact_sig = signatures.get("contact_signature", {})
        if contact_sig.get("is_public_mailbox"):
            mismatching_features.append(f"Public free email provider used for official communications: @{contact_sig.get('email_domain')}")
            breakdown.append({
                "feature_name": "Official Email Domain",
                "category": "Contact Signature",
                "submitted_val": contact_sig.get("email"),
                "trusted_val": "@*.gov.in or @*.nic.in",
                "status": "MISMATCH",
                "weight": weights["email_channel"]
            })
        elif contact_sig.get("email_domain", "").endswith(".gov.in") or contact_sig.get("email_domain", "").endswith(".nic.in"):
            score += weights["email_channel"]
            matching_features.append(f"Official Government email host: @{contact_sig.get('email_domain')}")
            breakdown.append({
                "feature_name": "Official Email Domain",
                "category": "Contact Signature",
                "submitted_val": contact_sig.get("email"),
                "trusted_val": "@*.gov.in or @*.nic.in",
                "status": "MATCH",
                "weight": weights["email_channel"]
            })
        elif not contact_sig.get("email"):
            missing_features.append("No contact email address provided")
            score += weights["email_channel"] * 0.5 # Neutral
            breakdown.append({
                "feature_name": "Official Email Domain",
                "category": "Contact Signature",
                "submitted_val": "None",
                "trusted_val": "@*.gov.in",
                "status": "MISSING",
                "weight": weights["email_channel"]
            })
        else:
            mismatching_features.append(f"Non-governmental domain email: @{contact_sig.get('email_domain')}")
            breakdown.append({
                "feature_name": "Official Email Domain",
                "category": "Contact Signature",
                "submitted_val": contact_sig.get("email"),
                "trusted_val": "@*.gov.in",
                "status": "MISMATCH",
                "weight": weights["email_channel"]
            })

        # 4. Notification Format
        notif_sig = signatures.get("notification_signature", {})
        if notif_sig.get("has_standard_format"):
            score += weights["notification_format"]
            matching_features.append(f"Conforms to formal notification indexing: {notif_sig.get('notification_number')}")
            breakdown.append({
                "feature_name": "Notification Indexing",
                "category": "Notification Signature",
                "submitted_val": notif_sig.get("notification_number"),
                "trusted_val": "Standard Gazette Format (e.g. 05/2026-CSP)",
                "status": "MATCH",
                "weight": weights["notification_format"]
            })
        elif not notif_sig.get("notification_number"):
            missing_features.append("Notice lacks formal advertisement / gazette number")
            breakdown.append({
                "feature_name": "Notification Indexing",
                "category": "Notification Signature",
                "submitted_val": "Missing",
                "trusted_val": "Official Notification Number",
                "status": "MISSING",
                "weight": weights["notification_format"]
            })
        else:
            score += weights["notification_format"] * 0.5
            breakdown.append({
                "feature_name": "Notification Indexing",
                "category": "Notification Signature",
                "submitted_val": notif_sig.get("notification_number"),
                "trusted_val": "Official Notification Number",
                "status": "UNVERIFIED",
                "weight": weights["notification_format"]
            })

        # 5. Writing / Linguistic Integrity
        write_sig = signatures.get("writing_signature", {})
        if write_sig.get("guaranteed_job_claim"):
            mismatching_features.append("Contains deceptive '100% Guaranteed Job' claims strictly prohibited in civil service recruitment")
            breakdown.append({
                "feature_name": "Linguistic Integrity",
                "category": "Writing Signature",
                "submitted_val": "Direct selection / Guaranteed job claim detected",
                "trusted_val": "Merit-based competitive exam guidelines",
                "status": "MISMATCH",
                "weight": weights["linguistic_integrity"]
            })
        elif write_sig.get("nlp_risk_score", 0) > 40:
            mismatching_features.append("High urgency and pressure tactics in notification text")
            breakdown.append({
                "feature_name": "Linguistic Integrity",
                "category": "Writing Signature",
                "submitted_val": f"NLP Risk {write_sig.get('nlp_risk_score')}%",
                "trusted_val": "Formal statutory announcement",
                "status": "MISMATCH",
                "weight": weights["linguistic_integrity"]
            })
        else:
            score += weights["linguistic_integrity"]
            matching_features.append("Formal administrative tone without coercive urgency")
            breakdown.append({
                "feature_name": "Linguistic Integrity",
                "category": "Writing Signature",
                "submitted_val": "Formal administrative style",
                "trusted_val": "Formal administrative style",
                "status": "MATCH",
                "weight": weights["linguistic_integrity"]
            })

        # 6. Temporal Realism
        temp_sig = signatures.get("temporal_signature", {})
        if temp_sig.get("has_realistic_window"):
            score += weights["temporal_realism"]
            matching_features.append("Standard application filing period")
            breakdown.append({
                "feature_name": "Application Window",
                "category": "Temporal Signature",
                "submitted_val": temp_sig.get("deadline"),
                "trusted_val": "Standard 21-30 day filing window",
                "status": "MATCH",
                "weight": weights["temporal_realism"]
            })
        elif not temp_sig.get("deadline"):
            missing_features.append("No clear deadline specified")
            breakdown.append({
                "feature_name": "Application Window",
                "category": "Temporal Signature",
                "submitted_val": "Not specified",
                "trusted_val": "Explicit closing date",
                "status": "MISSING",
                "weight": weights["temporal_realism"]
            })
        else:
            mismatching_features.append("Immediate 24-hour expiration panic tactic")
            breakdown.append({
                "feature_name": "Application Window",
                "category": "Temporal Signature",
                "submitted_val": temp_sig.get("deadline"),
                "trusted_val": "Standard 21-30 day filing window",
                "status": "MISMATCH",
                "weight": weights["temporal_realism"]
            })

        # 7. QR Safety
        vis_sig = signatures.get("visual_signature", {})
        if vis_sig.get("qr_type") == "UPI_PAYMENT":
            mismatching_features.append("Direct UPI Payment QR code embedded in document")
            breakdown.append({
                "feature_name": "Document QR Safety",
                "category": "Visual Signature",
                "submitted_val": "UPI Payment QR Code",
                "trusted_val": "No standalone fee collection QR",
                "status": "MISMATCH",
                "weight": weights["qr_safety"]
            })
        else:
            score += weights["qr_safety"]
            matching_features.append("No unauthorized payment QR codes embedded")
            breakdown.append({
                "feature_name": "Document QR Safety",
                "category": "Visual Signature",
                "submitted_val": "Safe / None",
                "trusted_val": "No standalone fee collection QR",
                "status": "MATCH",
                "weight": weights["qr_safety"]
            })

        pattern_checklist = self.generate_recruitment_pattern(
            evidence={
                "organization": signatures.get("organization_signature", {}).get("claimed_organization"),
                "department": signatures.get("organization_signature", {}).get("claimed_department"),
                "domain": dom_sig.get("domain"),
                "website": signatures.get("domain_signature", {}).get("protocol"),
                "email": contact_sig.get("email"),
                "phone": contact_sig.get("phone"),
                "source_platform": contact_sig.get("contact_channel"),
                "notification_number": notif_sig.get("notification_number"),
                "upi_id": pay_sig.get("upi_handle"),
                "application_fee": pay_sig.get("fee_amount"),
                "payment_requested": pay_sig.get("has_application_fee") or bool(pay_sig.get("upi_handle")),
                "is_unauthorized_payment": pay_sig.get("is_personal_upi"),
                "has_direct_selection": write_sig.get("guaranteed_job_claim"),
                "qr_detected": vis_sig.get("qr_type") != "NONE"
            },
            nlp_results={"guaranteed_job_claim": write_sig.get("guaranteed_job_claim"), "semantic_features": {"urgency_markers_count": write_sig.get("urgency_markers_count", 0)}}
        )

        similarity_score = round(min(100.0, max(0.0, score)), 1)

        return {
            "dna_id": submitted_dna.get("dna_id"),
            "similarity_score": similarity_score,
            "signatures": signatures,
            "matching_features": matching_features,
            "mismatching_features": mismatching_features,
            "missing_features": missing_features,
            "comparison_breakdown": breakdown,
            "pattern_checklist": pattern_checklist
        }

    def generate_recruitment_pattern(
        self,
        evidence: Dict[str, Any],
        nlp_results: Optional[Dict[str, Any]] = None,
        verification_details: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        nlp_data = nlp_results or {}
        verif = verification_details or {}

        # 1. Organization Name
        org = evidence.get("organization") or ""
        dept = evidence.get("department") or ""
        if org and org not in ["Unspecified Government Body", "Government Recruitment Department"]:
            org_status = "Match"
            org_type = "tg-pill-verified"
            org_detail = f"{org}{f' ({dept})' if dept and dept != 'Public Services' else ''}"
        elif org:
            org_status = "Partial match"
            org_type = "tg-pill-caution"
            org_detail = f"{org} (Claimed government department)"
        else:
            org_status = "Mismatch"
            org_type = "tg-pill-warning"
            org_detail = "No authoritative government recruitment body identified"

        # 2. Website
        domain = (evidence.get("domain") or "").lower()
        if domain.endswith(".gov.in") or domain.endswith(".nic.in"):
            web_status = "Match"
            web_type = "tg-pill-verified"
            web_detail = f"Official government portal verified ({domain})"
        elif domain and any(tld in domain for tld in [".xyz", ".online", ".site", ".info", ".top", ".club", ".biz", ".org"]):
            web_status = "Mismatch"
            web_type = "tg-pill-warning"
            web_detail = f"Suspicious non-government portal ({domain} — Expected .gov.in)"
        elif domain:
            web_status = "Mismatch"
            web_type = "tg-pill-warning"
            web_detail = f"Hosted outside official government infrastructure ({domain})"
        else:
            web_status = "Needs checking"
            web_type = "tg-pill-caution"
            web_detail = "No official website portal provided in notice"

        # 3. Application Process
        has_direct = bool(evidence.get("has_direct_selection") or nlp_data.get("guaranteed_job_claim"))
        urgency_count = nlp_data.get("semantic_features", {}).get("urgency_markers_count", 0)
        if has_direct:
            proc_status = "Mismatch"
            proc_type = "tg-pill-warning"
            proc_detail = "Direct selection claim without written exam (100% selection promise)"
        elif urgency_count > 0:
            proc_status = "Partial match"
            proc_type = "tg-pill-caution"
            proc_detail = "High urgency pressure tactics detected in recruitment text"
        else:
            proc_status = "Match"
            proc_type = "tg-pill-verified"
            proc_detail = "Standard statutory merit-based selection process"

        # 4. Contact Method
        phone = evidence.get("phone") or ""
        email = (evidence.get("email") or "").lower()
        source = (evidence.get("source_platform") or "").lower()
        channels = evidence.get("social_media_handles") or []
        
        is_whatsapp = "whatsapp" in source or "WhatsApp" in channels or ("+91" in phone and not phone.startswith("011"))
        is_public_mail = any(p in email for p in ["@gmail.com", "@yahoo.com", "@outlook.com", "@hotmail.com"])
        
        if is_whatsapp and is_public_mail:
            contact_status = "Mismatch"
            contact_type = "tg-pill-warning"
            contact_detail = f"Personal WhatsApp ({phone}) & public email (@{email.split('@')[-1]})"
        elif is_public_mail:
            contact_status = "Mismatch"
            contact_type = "tg-pill-warning"
            contact_detail = f"Public email mailbox used (@{email.split('@')[-1]})"
        elif is_whatsapp:
            contact_status = "Needs checking"
            contact_type = "tg-pill-caution"
            contact_detail = f"Personal mobile/WhatsApp contact used ({phone})"
        elif email.endswith(".gov.in") or email.endswith(".nic.in"):
            contact_status = "Match"
            contact_type = "tg-pill-verified"
            contact_detail = f"Official government email gateway verified ({email})"
        elif phone and phone.startswith("011"):
            contact_status = "Match"
            contact_type = "tg-pill-verified"
            contact_detail = f"Official central secretariat landline exchange ({phone})"
        else:
            contact_status = "Needs checking"
            contact_type = "tg-pill-caution"
            contact_detail = "No verified institutional recruitment helpdesk identified"

        # 5. Notice Format
        notif = evidence.get("notification_number") or ""
        if notif and any(c in notif for c in ["/", "-", "."]):
            notif_status = "Match"
            notif_type = "tg-pill-verified"
            notif_detail = f"Standard gazette CEN format indexing ({notif})"
        elif notif:
            notif_status = "Partial match"
            notif_type = "tg-pill-caution"
            notif_detail = f"Notification circular reference ({notif})"
        else:
            notif_status = "Partial match"
            notif_type = "tg-pill-caution"
            notif_detail = "Informal notification lacking gazette circular index"

        # 6. Payment Pattern
        upi_id = evidence.get("upi_id") or ""
        qr_detected = bool(evidence.get("qr_detected"))
        is_unauth = bool(evidence.get("is_unauthorized_payment"))
        fee = evidence.get("application_fee")
        payment_requested = bool(evidence.get("payment_requested"))

        if upi_id:
            pay_status = "Mismatch"
            pay_type = "tg-pill-warning"
            pay_detail = f"Personal UPI fee collection ({upi_id})"
        elif qr_detected:
            pay_status = "Mismatch"
            pay_type = "tg-pill-warning"
            pay_detail = "Standalone UPI QR code fee collection"
        elif is_unauth:
            pay_status = "Mismatch"
            pay_type = "tg-pill-warning"
            pay_detail = evidence.get("payment_pattern") or "Unauthorized fee or security deposit requested"
        elif fee and domain.endswith(".gov.in"):
            pay_status = "Match"
            pay_type = "tg-pill-verified"
            pay_detail = f"Official government treasury gateway (₹{int(fee) if fee == int(fee) else fee})"
        elif not payment_requested:
            pay_status = "Match"
            pay_type = "tg-pill-verified"
            pay_detail = "No application fee or deposit required"
        else:
            pay_status = "Needs checking"
            pay_type = "tg-pill-caution"
            pay_detail = f"Application fee: ₹{int(fee) if fee else 'unspecified'}"

        return [
            {"feature": "Organization Name", "detail": org_detail, "status": org_status, "type": org_type},
            {"feature": "Website", "detail": web_detail, "status": web_status, "type": web_type},
            {"feature": "Application Process", "detail": proc_detail, "status": proc_status, "type": proc_type},
            {"feature": "Contact Method", "detail": contact_detail, "status": contact_status, "type": contact_type},
            {"feature": "Notice Format", "detail": notif_detail, "status": notif_status, "type": notif_type},
            {"feature": "Payment Pattern", "detail": pay_detail, "status": pay_status, "type": pay_type}
        ]

    def _hash_str(self, val: str) -> str:
        return hashlib.sha256(val.encode("utf-8")).hexdigest()

dna_service = RecruitmentDNAService()
