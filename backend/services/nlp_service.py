import re
from typing import Dict, Any, List

class NLPService:
    def __init__(self):
        # Specific suspicious phrases indicative of Indian recruitment scams
        self.guaranteed_job_patterns = [
            r'100%\s*(?:job|selection|guarantee|confirm)',
            r'direct\s*(?:joining|selection|appointment|posting|interview)',
            r'without\s*(?:any\s*)?(?:written\s*)?exam(?:ination)?',
            r'no\s*exam\s*(?:direct|required)',
            r'confirmed\s*government\s*job',
            r'guaranteed\s*appointment\s*letter',
            r'appointment\s*letter\s*(?:will\s*be\s*)?(?:given|issued|dispatch)',
            r'join\s*within\s*\d+\s*days',
            r'selected\s*candidates?\s*(?:only|will)',
            r'direct\s*bharti',
            r'bina\s*(?:pareeksha|exam)',
            r'seedha\s*(?:naukri|bharti|joining)',
        ]

        self.urgency_patterns = [
            r'apply\s*(?:immediately|urgent|today|now|fast)',
            r'within\s*(?:24|48|72)\s*hours?',
            r'only\s*\d+\s*(?:seats?|vacancies?|slots?|posts?)\s*(?:left|remaining|available)',
            r'last\s*(?:chance|date|few)',
            r'offer\s*expires?\s*(?:tonight|soon|today)',
            r'hurry\s*up',
            r'limited\s*seats?',
            r'closing\s*(?:soon|today)',
            r'(?:seats?|vacancies?)\s*filling\s*fast',
            r'dont?\s*miss\s*this',
            r'respond\s*(?:urgently|immediately|asap)',
        ]

        self.suspicious_payment_patterns = [
            r'refundable\s*(?:security\s*)?deposit',
            r'medical\s*(?:checkup\s*)?fee\s*(?:before|first|advance)',
            r'training\s*(?:fee|charge|cost)',
            r'uniform\s*fee',
            r'send\s*(?:money|payment|amount|screenshot)\s*(?:on|to|via)?\s*(?:whatsapp|upi|gpay|phonepe|paytm)',
            r'pay\s*(?:through|via|on|to)\s*(?:upi|gpay|google\s*pay|phonepe|paytm|neft|imps)',
            r'processing\s*fee\s*(?:mandatory|required|compulsory)',
            r'paytm\s*or\s*google\s*pay',
            r'security\s*deposit\s*(?:refundable|required)',
            r'registration\s*(?:charges?|fee)',
            r'advance\s*(?:fee|payment|deposit)',
            r'(?:courier|stamp|document|verification)\s*charge',
            r'kyc\s*fee',
            r'background\s*(?:check|verification)\s*fee',
            r'id\s*card\s*fee',
            r'pay\s*(?:₹|rs\.?|inr)?\s*\d+',
            r'transfer\s*(?:the\s*)?(?:amount|money|fee)',
            r'(?:neft|imps|rtgs)\s*(?:transfer|payment)',
        ]

        self.coercion_threat_patterns = [
            r'admit\s*card\s*will\s*be\s*cancelled',
            r'legal\s*action',
            r'blacklist(?:ed)?',
            r'permanent\s*rejection',
            r'your\s*offer\s*(?:will\s*be\s*)?cancelled',
            r'police\s*case',
            r'court\s*notice',
            r'arrest\s*warrant',
        ]

        # Additional: WhatsApp/Telegram recruitment scam distribution channels
        self.informal_channel_patterns = [
            r'share\s*(?:this\s*)?(?:message|post|notification)\s*(?:to|with)',
            r'forward\s*(?:this\s*)?(?:to|in)\s*(?:all|your|every)',
            r'join\s*(?:our\s*)?(?:telegram|whatsapp)\s*(?:group|channel)',
            r'apply\s*on\s*whatsapp',
            r'send\s*cv\s*on\s*whatsapp',
            r'whatsapp\s*(?:number|no\.?|interview)',
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

        # 1. Recruitment intent detection (lowered threshold to 1 keyword)
        intent_keywords = [
            "recruitment", "vacancy", "vacancies", "notification", "post", "salary",
            "pay scale", "apply", "candidate", "eligibility", "qualification",
            "exam", "admit card", "naukri", "bharti", "job", "joining", "posting",
            "interview", "selection", "appointment"
        ]
        matched_intent = [kw for kw in intent_keywords if kw in text_lower]
        recruitment_intent = len(matched_intent) >= 1

        # 2. Pattern Matching
        found_guaranteed = self._find_matches(self.guaranteed_job_patterns, text)
        found_urgency    = self._find_matches(self.urgency_patterns, text)
        found_payments   = self._find_matches(self.suspicious_payment_patterns, text)
        found_coercion   = self._find_matches(self.coercion_threat_patterns, text)
        found_informal   = self._find_matches(self.informal_channel_patterns, text)

        all_suspicious_phrases = []
        for p in found_guaranteed:
            all_suspicious_phrases.append({"category": "GUARANTEED_JOB_PROMISE",      "text": p, "severity": "HIGH"})
        for p in found_urgency:
            all_suspicious_phrases.append({"category": "PRESSURE_URGENCY",            "text": p, "severity": "MEDIUM"})
        for p in found_payments:
            all_suspicious_phrases.append({"category": "SUSPICIOUS_PAYMENT_LANGUAGE", "text": p, "severity": "CRITICAL"})
        for p in found_coercion:
            all_suspicious_phrases.append({"category": "COERCION_THREAT",             "text": p, "severity": "HIGH"})
        for p in found_informal:
            all_suspicious_phrases.append({"category": "INFORMAL_DISTRIBUTION",       "text": p, "severity": "MEDIUM"})

        # 3. Compute NLP Risk Score (0.0 to 100.0)
        risk_score = 0.0
        if found_guaranteed: risk_score += 40.0
        if found_payments:   risk_score += 35.0
        if found_coercion:   risk_score += 20.0
        if found_urgency:    risk_score += 15.0
        if found_informal:   risk_score += 10.0

        # Extra weight for multiple payment matches
        risk_score += min(15.0, len(found_payments) * 5.0)

        # Excessive exclamation marks or ALL CAPS text
        caps_ratio = sum(1 for c in text if c.isupper()) / max(len(text), 1)
        exclaim_count = text.count('!')
        if caps_ratio > 0.35 and len(text) > 40:
            risk_score += 10.0
            all_suspicious_phrases.append({
                "category": "UNPROFESSIONAL_FORMATTING",
                "text": "Excessive ALL CAPS text detected (uncommon in official gazette notifications)",
                "severity": "LOW"
            })
        if exclaim_count >= 3:
            risk_score += min(8.0, exclaim_count * 1.5)
            all_suspicious_phrases.append({
                "category": "UNPROFESSIONAL_FORMATTING",
                "text": f"Multiple exclamation marks ({exclaim_count}) — atypical for official government communications",
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
