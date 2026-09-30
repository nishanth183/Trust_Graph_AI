import re
from typing import Dict, Any, List

class NLPService:
    def __init__(self):
        # Specific suspicious phrases indicative of Indian recruitment scams
        self.guaranteed_job_patterns = [
            r'100%\s*(?:job|selection|guarantee)',
            r'direct\s*(?:joining|selection|appointment)',
            r'without\s*(?:any\s*)?exam',
            r'no\s*exam\s*direct\s*(?:interview|joining)',
            r'confirmed\s*government\s*job',
            r'direct\s*posting',
            r'guaranteed\s*appointment\s*letter'
        ]

        self.urgency_patterns = [
            r'apply\s*(?:immediately|urgent|today|within\s*24\s*hours)',
            r'only\s*\d+\s*(?:seats|vacancies|slots)\s*left',
            r'last\s*chance',
            r'offer\s*expires\s*tonight',
            r'hurry\s*up'
        ]

        self.suspicious_payment_patterns = [
            r'refundable\s*(?:security\s*)?deposit',
            r'medical\s*(?:checkup\s*)?fee\s*(?:before|first)',
            r'training\s*(?:fee|charge)',
            r'uniform\s*fee',
            r'send\s*screenshot\s*(?:on|to)\s*whatsapp',
            r'pay\s*(?:through|via)\s*upi',
            r'processing\s*fee\s*mandatory',
            r'paytm\s*or\s*google\s*pay'
        ]

        self.coercion_threat_patterns = [
            r'admit\s*card\s*will\s*be\s*cancelled',
            r'legal\s*action',
            r'blacklist(?:ed)?',
            r'permanent\s*rejection'
        ]

    def analyze_text(self, text: str) -> Dict[str, Any]:
        if not text:
            return {
                "recruitment_intent": False,
                "nlp_risk_score": 0.0,
                "urgency_score": 0.0,
                "guaranteed_job_claim": False,
                "suspicious_phrases": [],
                "semantic_features": {},
                "linguistic_style": "NEUTRAL"
            }

        text_lower = text.lower()

        # 1. Recruitment intent detection
        intent_keywords = ["recruitment", "vacancy", "vacancies", "notification", "post", "salary", "pay scale", "apply", "candidate", "eligibility", "qualification", "exam", "admit card"]
        matched_intent = [kw for kw in intent_keywords if kw in text_lower]
        recruitment_intent = len(matched_intent) >= 2

        # 2. Pattern Matching
        found_guaranteed = self._find_matches(self.guaranteed_job_patterns, text)
        found_urgency = self._find_matches(self.urgency_patterns, text)
        found_payments = self._find_matches(self.suspicious_payment_patterns, text)
        found_coercion = self._find_matches(self.coercion_threat_patterns, text)

        all_suspicious_phrases = []
        for p in found_guaranteed:
            all_suspicious_phrases.append({"category": "GUARANTEED_JOB_PROMISE", "text": p, "severity": "HIGH"})
        for p in found_urgency:
            all_suspicious_phrases.append({"category": "PRESSURE_URGENCY", "text": p, "severity": "MEDIUM"})
        for p in found_payments:
            all_suspicious_phrases.append({"category": "SUSPICIOUS_PAYMENT_LANGUAGE", "text": p, "severity": "CRITICAL"})
        for p in found_coercion:
            all_suspicious_phrases.append({"category": "COERCION_THREAT", "text": p, "severity": "HIGH"})

        # 3. Compute NLP Risk Score (0.0 to 100.0)
        risk_score = 0.0
        if found_guaranteed:
            risk_score += 40.0
        if found_payments:
            risk_score += 35.0
        if found_urgency:
            risk_score += 15.0
        if found_coercion:
            risk_score += 20.0

        # Excessive exclamation marks or ALL CAPS text
        caps_ratio = sum(1 for c in text if c.isupper()) / max(len(text), 1)
        if caps_ratio > 0.35 and len(text) > 40:
            risk_score += 10.0
            all_suspicious_phrases.append({
                "category": "UNPROFESSIONAL_FORMATTING",
                "text": "Excessive ALL CAPS text detected (uncommon in official gazette notifications)",
                "severity": "LOW"
            })

        risk_score = min(100.0, max(0.0, risk_score))

        urgency_score = min(100.0, len(found_urgency) * 35.0)

        # Style classification
        if risk_score > 60:
            style = "COERCIVE_SCAM_STYLE"
        elif risk_score > 25:
            style = "SUSPICIOUS_INFORMAL"
        elif recruitment_intent:
            style = "FORMAL_RECRUITMENT"
        else:
            style = "INFORMATIONAL"

        return {
            "recruitment_intent": recruitment_intent,
            "nlp_risk_score": round(risk_score, 1),
            "urgency_score": round(urgency_score, 1),
            "guaranteed_job_claim": len(found_guaranteed) > 0,
            "suspicious_phrases": all_suspicious_phrases,
            "semantic_features": {
                "guaranteed_claims_count": len(found_guaranteed),
                "urgency_markers_count": len(found_urgency),
                "suspicious_payment_claims_count": len(found_payments),
                "caps_ratio": round(caps_ratio, 2)
            },
            "linguistic_style": style
        }

    def _find_matches(self, patterns: List[str], text: str) -> List[str]:
        matched = []
        for pat in patterns:
            found = re.findall(pat, text, re.IGNORECASE)
            for m in found:
                if isinstance(m, str):
                    matched.append(m.strip())
                elif isinstance(m, tuple):
                    matched.append(m[0].strip())
        return list(set(matched))

nlp_service = NLPService()
