import re
from urllib.parse import urlparse
from typing import Dict, Any, List, Optional
from backend.services.url_service import url_service

class EvidenceExtractionService:
    def extract_evidence(
        self,
        text: str,
        input_url: Optional[str] = None,
        source_platform: Optional[str] = "Other",
        qr_detected: bool = False,
        qr_data: Optional[str] = None
    ) -> Dict[str, Any]:
        text_clean = text or ""

        # 1. Organization & Department Extraction
        org, dept = self._extract_organization(text_clean)

        # 2. Notification / Advertisement Number
        notif_num = self._extract_notification_number(text_clean)

        # 3. Job Title
        job_title = self._extract_job_title(text_clean)

        # 4. Email Extraction
        email = self._extract_email(text_clean)

        # 5. Phone Extraction
        phone = self._extract_phone(text_clean)

        # 6. UPI ID & Payment Instructions
        upi_id, payment_instructions = self._extract_payment_info(text_clean, qr_data)

        # 7. Application Fee & Currency
        fee, currency = self._extract_fee(text_clean)

        # 8. Dates & Deadlines
        dates = self._extract_dates(text_clean)

        # 9. Website & Domain
        website, domain = self._extract_url_and_domain(text_clean, input_url)

        # 10. Social Media & Channels
        social_channels = self._extract_social_channels(text_clean)

        # 11. Location
        location = self._extract_location(text_clean)

        # 12. Contact Person
        contact_person = self._extract_contact_person(text_clean)

        # Check if QR code reveals a UPI handle: e.g. upi://pay?pa=recruitment@okaxis
        if qr_data and "pa=" in qr_data:
            pa_match = re.search(r'pa=([a-zA-Z0-9.\-_@]+)', qr_data)
            if pa_match:
                upi_id = pa_match.group(1)
                qr_detected = True

        return {
            "organization": org,
            "department": dept,
            "notification_number": notif_num,
            "job_title": job_title,
            "website": website,
            "domain": domain,
            "email": email,
            "phone": phone,
            "application_fee": fee,
            "currency": currency,
            "dates": dates,
            "location": location,
            "payment_instructions": payment_instructions,
            "upi_id": upi_id,
            "bank_details": self._extract_bank_details(text_clean),
            "qr_detected": qr_detected or (qr_data is not None),
            "qr_data": qr_data,
            "social_media_handles": social_channels,
            "contact_person": contact_person,
            "source_platform": source_platform or "Direct"
        }

    def _extract_organization(self, text: str) -> tuple[Optional[str], Optional[str]]:
        t_upper = text.upper()
        if "UNION PUBLIC SERVICE COMMISSION" in t_upper or "UPSC" in t_upper:
            return "Union Public Service Commission (UPSC)", "Department of Personnel and Training"
        elif "STAFF SELECTION COMMISSION" in t_upper or "SSC" in t_upper:
            return "Staff Selection Commission (SSC)", "DoPT / Government of India"
        elif "RAILWAY RECRUITMENT" in t_upper or "RRB" in t_upper or "INDIAN RAILWAYS" in t_upper:
            return "Railway Recruitment Boards (RRB)", "Ministry of Railways"
        elif "INDIA POST" in t_upper or "POST OFFICE" in t_upper or "DAK SEVAK" in t_upper or "GDS" in t_upper:
            return "Department of Posts (India Post)", "Ministry of Communications"
        elif "TAMIL NADU PUBLIC SERVICE" in t_upper or "TNPSC" in t_upper:
            return "Tamil Nadu Public Service Commission (TNPSC)", "State Government of Tamil Nadu"
        elif "BIHAR PUBLIC SERVICE" in t_upper or "BPSC" in t_upper:
            return "Bihar Public Service Commission (BPSC)", "Government of Bihar"
        elif "DEFENCE RESEARCH" in t_upper or "DRDO" in t_upper:
            return "Defence Research & Development Organisation (DRDO)", "Ministry of Defence"
        elif "ISRO" in t_upper or "SPACE RESEARCH" in t_upper:
            return "Indian Space Research Organisation (ISRO)", "Department of Space"

        # Regex fallback for generic "Government of ... / Ministry of ..."
        m_gov = re.search(r'(?:Ministry of [A-Za-z\s]+|Government of [A-Za-z\s]+|Department of [A-Za-z\s]+)', text, re.IGNORECASE)
        if m_gov:
            return m_gov.group(0).strip(), None

        # Generic recruitment notice without explicit org
        if re.search(r'(?:Sarkari|Government|Govt\b|Recruitment)', text, re.IGNORECASE):
            return "Unspecified Government Body", None

        return None, None

    def _extract_notification_number(self, text: str) -> Optional[str]:
        # Examples: Advt No. 05/2026-CSP, Notification No: CEN 01/2026, SSC-CGL-2026, 17-21/2026-GDS
        patterns = [
            r'(?:Advt\.?\s*No\.?|Notification\s*No\.?|Notice\s*No\.?|Ref\s*No\.?)\s*[:\-]?\s*([A-Za-z0-9\/\-_.]+)',
            r'(?:CEN\s*\d{2}/\d{4})',
            r'(?:SSC-[A-Z]+-\d{4})',
            r'\b(\d{2}/\d{4}-[A-Z0-9\-_]+)\b',
            r'\b(\d+-\d+/\d{4}-[A-Z]+)\b'
        ]
        for pat in patterns:
            match = re.search(pat, text, re.IGNORECASE)
            if match:
                val = match.group(1) if match.groups() else match.group(0)
                return val.strip()
        return None

    def _extract_job_title(self, text: str) -> Optional[str]:
        patterns = [
            r'(?:Post(?:s)?(?:\s*Name)?|Position(?:s)?|Recruitment\s*(?:for|of))\s*[:\-]?\s*([A-Za-z0-9\s,\/\(\)]+?)(?=\.|\n|Advt|Salary|Fee|Eligibility|$)',
            r'\b(Assistant Loco Pilot|Civil Services|Station Master|Gramin Dak Sevak|Postal Assistant|Multi Tasking Staff|Inspector|Junior Engineer|Clerk|Sub-Inspector)\b'
        ]
        for pat in patterns:
            m = re.search(pat, text, re.IGNORECASE)
            if m:
                title = m.group(1).strip()
                if len(title) > 3 and len(title) < 120:
                    return title
        return None

    def _extract_email(self, text: str) -> Optional[str]:
        m = re.search(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', text)
        if m:
            return m.group(0).lower()
        return None

    def _extract_phone(self, text: str) -> Optional[str]:
        # Indian phone numbers: +91 9876543210, 09876543210, 9876543210
        m = re.search(r'(?:\+?91[\-\s]?)?[6-9]\d{9}\b', text)
        if m:
            raw = re.sub(r'[\-\s]', '', m.group(0))
            if not raw.startswith("+91") and len(raw) == 10:
                raw = "+91" + raw
            return raw
        return None

    def _extract_payment_info(self, text: str, qr_data: Optional[str]) -> tuple[Optional[str], Optional[str]]:
        upi_id = None
        instructions = None

        # Detect UPI ID: pattern e.g. name@okaxis, support@paytm, govt.help@upi, etc.
        m_upi = re.search(r'\b([a-zA-Z0-9.\-_]{2,256}@(okhdfcbank|okaxis|oksbi|okicici|paytm|ybl|apl|upi|axl|sbi|postbank|ibl))\b', text, re.IGNORECASE)
        if m_upi:
            upi_id = m_upi.group(1).lower()

        if not upi_id and qr_data and "pa=" in qr_data:
            pa_match = re.search(r'pa=([a-zA-Z0-9.\-_@]+)', qr_data)
            if pa_match:
                upi_id = pa_match.group(1).lower()

        # Payment instructions
        m_pay = re.search(r'(?:Pay(?:ment)?|Registration Fee|Deposit)\s*[:\-]?\s*([^\n\.\;]+)', text, re.IGNORECASE)
        if m_pay:
            instructions = m_pay.group(0).strip()
        elif upi_id:
            instructions = f"Direct transfer requested via UPI ({upi_id})"

        return upi_id, instructions

    def _extract_fee(self, text: str) -> tuple[Optional[float], str]:
        # Match ₹ 500, Rs. 500, INR 500, Fee: 500
        m = re.search(r'(?:₹|Rs\.?|INR|Fee\s*[:\-]?)\s*(\d{2,6})', text, re.IGNORECASE)
        if m:
            try:
                fee = float(m.group(1))
                return fee, "INR"
            except ValueError:
                pass
        return None, "INR"

    def _extract_dates(self, text: str) -> Dict[str, Optional[str]]:
        dates = {
            "start_date": None,
            "deadline": None,
            "exam_date": None
        }

        # Deadline pattern: Last date: 15/03/2026, Apply before 2026-04-10
        m_deadline = re.search(r'(?:Last\s*Date|Apply\s*(?:Before|By)|Closing\s*Date|Deadline)\s*[:\-]?\s*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}|\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2}|immediate\b|today\b|24\s*hours\b)', text, re.IGNORECASE)
        if m_deadline:
            dates["deadline"] = m_deadline.group(1).strip()

        # Start date
        m_start = re.search(r'(?:Start\s*Date|Opening\s*Date|Application\s*Begins)\s*[:\-]?\s*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})', text, re.IGNORECASE)
        if m_start:
            dates["start_date"] = m_start.group(1).strip()

        # Exam date
        m_exam = re.search(r'(?:Exam(?:ination)?\s*Date)\s*[:\-]?\s*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})', text, re.IGNORECASE)
        if m_exam:
            dates["exam_date"] = m_exam.group(1).strip()

        return dates

    def _extract_url_and_domain(self, text: str, input_url: Optional[str]) -> tuple[Optional[str], Optional[str]]:
        target_url = input_url
        if not target_url:
            m_url = re.search(r'https?://[^\s<>"]+|www\.[^\s<>"]+|[a-zA-Z0-9.-]+\.(?:gov\.in|nic\.in|in|com|org|online|xyz|net|site)', text)
            if m_url:
                target_url = m_url.group(0).rstrip('.,;:')

        if not target_url:
            return None, None

        if not target_url.startswith(("http://", "https://")):
            target_url = "https://" + target_url

        try:
            parsed = urlparse(target_url)
            domain = parsed.netloc.lower()
            if ":" in domain:
                domain = domain.split(":")[0]
            return target_url, domain
        except Exception:
            return target_url, None

    def _extract_social_channels(self, text: str) -> List[str]:
        channels = []
        # Telegram links / usernames
        m_tele = re.findall(r'(?:t\.me\/[a-zA-Z0-9_+]+|@([a-zA-Z0-9_]{5,32}))', text)
        for t in m_tele:
            val = t if isinstance(t, str) else t[0]
            if val and not val.endswith(".gov.in"):
                channels.append(f"Telegram: {val}")

        # WhatsApp group links
        m_wa = re.findall(r'chat\.whatsapp\.com\/[a-zA-Z0-9]+', text)
        for w in m_wa:
            channels.append(f"WhatsApp Group: {w}")

        return list(set(channels))

    def _extract_location(self, text: str) -> Optional[str]:
        locations = ["New Delhi", "All India", "Tamil Nadu", "Bihar", "Uttar Pradesh", "Maharashtra", "Karnataka", "West Bengal", "Mumbai", "Chennai", "Kolkata"]
        for loc in locations:
            if re.search(r'\b' + re.escape(loc) + r'\b', text, re.IGNORECASE):
                return loc
        return "All India / Specified Locations"

    def _extract_contact_person(self, text: str) -> Optional[str]:
        m = re.search(r'(?:Contact\s*Person|Recruitment\s*Officer|Manager)\s*[:\-]?\s*([A-Za-z\s.]+?)(?=\n|\.|\,|$)', text, re.IGNORECASE)
        if m:
            val = m.group(1).strip()
            if len(val) > 2 and len(val) < 50:
                return val
        return None

    def _extract_bank_details(self, text: str) -> Optional[str]:
        m_ifsc = re.search(r'\b[A-Z]{4}0[A-Z0-9]{6}\b', text)
        m_acct = re.search(r'(?:A\/C|Account\s*(?:No)?)\s*[:\-]?\s*(\d{9,18})', text, re.IGNORECASE)
        if m_ifsc or m_acct:
            parts = []
            if m_acct:
                parts.append(f"Acc: {m_acct.group(1)}")
            if m_ifsc:
                parts.append(f"IFSC: {m_ifsc.group(0)}")
            return " | ".join(parts)
        return None

extraction_service = EvidenceExtractionService()
