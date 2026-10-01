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
        upi_id, payment_instructions, is_unauthorized_pay = self._extract_payment_info(text_clean, qr_data)

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
                upi_id = pa_match.group(1).lower()
                qr_detected = True
                is_unauthorized_pay = True

        # Compute boolean flags for payment
        has_fee = fee is not None and fee > 0
        has_upi = bool(upi_id)
        has_pay_instructions = bool(payment_instructions)
        has_qr = bool(qr_detected)
        
        # Payment requested is true if fee, upi, qr or payment instructions are present
        payment_requested = bool(has_upi or has_fee or has_pay_instructions or has_qr)
        
        # Determine payment pattern summary
        if has_upi:
            payment_pattern = f"Personal UPI fee collection ({upi_id})"
            is_unauthorized_pay = True
        elif has_qr:
            payment_pattern = "Direct QR code fee solicitation"
            is_unauthorized_pay = True
        elif is_unauthorized_pay:
            payment_pattern = payment_instructions or "Unauthorized fee or security deposit requested"
        elif has_fee:
            if domain and (domain.endswith(".gov.in") or domain.endswith(".nic.in")):
                payment_pattern = f"Official online gateway fee: ₹{int(fee) if fee == int(fee) else fee}"
            else:
                payment_pattern = f"Application fee: ₹{int(fee) if fee == int(fee) else fee}"
        else:
            payment_pattern = "No application fee or payment required"

        # Check for direct selection or guaranteed job claims
        has_direct_selection = bool(re.search(
            r'(?:direct\s*(?:selection|appointment|joining|posting)|without\s*(?:written\s*)?exam|no\s*exam|100%\s*(?:selection|job|guarantee)|appointment\s*letter\s*dispatch)',
            text_clean,
            re.IGNORECASE
        ))

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
            "payment_requested": payment_requested,
            "is_unauthorized_payment": is_unauthorized_pay,
            "payment_pattern": payment_pattern,
            "has_direct_selection": has_direct_selection,
            "bank_details": self._extract_bank_details(text_clean),
            "qr_detected": qr_detected or (qr_data is not None),
            "qr_data": qr_data,
            "social_media_handles": social_channels,
            "contact_person": contact_person,
            "source_platform": source_platform or "Direct"
        }

    def _extract_organization(self, text: str) -> tuple[Optional[str], Optional[str]]:
        # Central Commissions & Bodies
        if re.search(r'\b(?:UPSC|UNION PUBLIC SERVICE COMMISSION)\b', text, re.I):
            return "Union Public Service Commission (UPSC)", "Department of Personnel and Training"
        elif re.search(r'\b(?:SSC|STAFF SELECTION COMMISSION)\b', text, re.I):
            return "Staff Selection Commission (SSC)", "DoPT / Government of India"
        elif re.search(r'\b(?:RRB|RAILWAY RECRUITMENT|INDIAN RAILWAYS)\b', text, re.I):
            return "Railway Recruitment Boards (RRB)", "Ministry of Railways"
        elif re.search(r'\b(?:INDIA POST|POST OFFICE|DAK SEVAK|GDS|POSTAL DEPARTMENT)\b', text, re.I):
            return "Department of Posts (India Post)", "Ministry of Communications"
            
        # Police & Paramilitary
        elif re.search(r'\b(?:DELHI POLICE)\b', text, re.I):
            return "Delhi Police Recruitment Board", "Ministry of Home Affairs"
        elif re.search(r'\b(?:UP POLICE|UTTAR PRADESH POLICE)\b', text, re.I):
            return "Uttar Pradesh Police Recruitment & Promotion Board", "Government of Uttar Pradesh"
        elif re.search(r'\b(?:TAMIL NADU POLICE|TNUSRB)\b', text, re.I):
            return "Tamil Nadu Uniformed Services Recruitment Board (TNUSRB)", "Government of Tamil Nadu"
        elif re.search(r'\b(?:KARNATAKA POLICE|KSP)\b', text, re.I):
            return "Karnataka State Police (KSP)", "Government of Karnataka"
        elif re.search(r'\b(?:MAHARASHTRA POLICE)\b', text, re.I):
            return "Maharashtra Police Recruitment Board", "Government of Maharashtra"
        elif re.search(r'\b(?:CRPF)\b', text, re.I):
            return "Central Reserve Police Force (CRPF)", "Ministry of Home Affairs"
        elif re.search(r'\b(?:CISF)\b', text, re.I):
            return "Central Industrial Security Force (CISF)", "Ministry of Home Affairs"
        elif re.search(r'\b(?:BSF)\b', text, re.I):
            return "Border Security Force (BSF)", "Ministry of Home Affairs"
        elif re.search(r'\b(?:STATE POLICE RECRUITMENT|POLICE RECRUITMENT BOARD|POLICE DEPARTMENT)\b', text, re.I):
            return "State Police Recruitment Board", "Department of Home"
            
        # Defense & Scientific Research
        elif re.search(r'\b(?:INDIAN ARMY|JOIN INDIAN ARMY)\b', text, re.I):
            return "Indian Army (Ministry of Defence)", "Ministry of Defence"
        elif re.search(r'\b(?:INDIAN NAVY)\b', text, re.I):
            return "Indian Navy", "Ministry of Defence"
        elif re.search(r'\b(?:INDIAN AIR FORCE|IAF)\b', text, re.I):
            return "Indian Air Force (IAF)", "Ministry of Defence"
        elif re.search(r'\b(?:DRDO|DEFENCE RESEARCH)\b', text, re.I):
            return "Defence Research & Development Organisation (DRDO)", "Ministry of Defence"
        elif re.search(r'\b(?:ISRO|SPACE RESEARCH)\b', text, re.I):
            return "Indian Space Research Organisation (ISRO)", "Department of Space"

        # Banking & Insurance
        elif re.search(r'\b(?:SBI|STATE BANK OF INDIA)\b', text, re.I):
            return "State Bank of India (SBI)", "Department of Financial Services"
        elif re.search(r'\b(?:IBPS|INSTITUTE OF BANKING)\b', text, re.I):
            return "Institute of Banking Personnel Selection (IBPS)", "Ministry of Finance"
        elif re.search(r'\b(?:RBI|RESERVE BANK OF INDIA)\b', text, re.I):
            return "Reserve Bank of India (RBI)", "Government of India"
        elif re.search(r'\b(?:LIC|LIFE INSURANCE CORPORATION)\b', text, re.I):
            return "Life Insurance Corporation of India (LIC)", "Ministry of Finance"

        # State Public Service Commissions
        elif re.search(r'\b(?:TAMIL NADU PUBLIC SERVICE|TNPSC)\b', text, re.I):
            return "Tamil Nadu Public Service Commission (TNPSC)", "State Government of Tamil Nadu"
        elif re.search(r'\b(?:BIHAR PUBLIC SERVICE|BPSC)\b', text, re.I):
            return "Bihar Public Service Commission (BPSC)", "Government of Bihar"
        elif re.search(r'\b(?:UPPSC|UTTAR PRADESH PUBLIC SERVICE)\b', text, re.I):
            return "Uttar Pradesh Public Service Commission (UPPSC)", "Government of Uttar Pradesh"
        elif re.search(r'\b(?:MPSC|MAHARASHTRA PUBLIC SERVICE)\b', text, re.I):
            return "Maharashtra Public Service Commission (MPSC)", "Government of Maharashtra"
        elif re.search(r'\b(?:KPSC|KARNATAKA PUBLIC SERVICE)\b', text, re.I):
            return "Karnataka Public Service Commission (KPSC)", "Government of Karnataka"
        elif re.search(r'\b(?:RPSC|RAJASTHAN PUBLIC SERVICE)\b', text, re.I):
            return "Rajasthan Public Service Commission (RPSC)", "Government of Rajasthan"
        elif re.search(r'\b(?:APPSC|ANDHRA PRADESH PUBLIC SERVICE)\b', text, re.I):
            return "Andhra Pradesh Public Service Commission (APPSC)", "Government of Andhra Pradesh"
        elif re.search(r'\b(?:TSPSC|TELANGANA PUBLIC SERVICE)\b', text, re.I):
            return "Telangana State Public Service Commission (TSPSC)", "Government of Telangana"
        elif re.search(r'\b(?:WBPSC|WEST BENGAL PUBLIC SERVICE)\b', text, re.I):
            return "West Bengal Public Service Commission (WBPSC)", "Government of West Bengal"
        elif re.search(r'\b(?:KVS|KENDRIYA VIDYALAYA)\b', text, re.I):
            return "Kendriya Vidyalaya Sangathan (KVS)", "Ministry of Education"
        elif re.search(r'\b(?:NVS|NAVODAYA VIDYALAYA)\b', text, re.I):
            return "Navodaya Vidyalaya Samiti (NVS)", "Ministry of Education"
        elif re.search(r'\b(?:AIIMS)\b', text, re.I):
            return "All India Institute of Medical Sciences (AIIMS)", "Ministry of Health and Family Welfare"

        # Generic Government Patterns
        m_gov = re.search(r'(?:Ministry of [A-Za-z\s]+|Government of [A-Za-z\s]+|Department of [A-Za-z\s]+|[A-Za-z\s]+ Recruitment Board|[A-Za-z\s]+ Service Commission|[A-Za-z\s]+ Bank)', text, re.IGNORECASE)
        if m_gov:
            found_name = m_gov.group(0).strip()
            if len(found_name) > 6 and len(found_name) < 70 and not any(k in found_name.lower() for k in ["policy", "privacy", "terms"]):
                return found_name, "Government Administration"

        if re.search(r'\b(?:Sarkari\s*Naukri|Government\s*Recruitment|Govt\s*Job\s*Portal|Recruitment\s*Cell)\b', text, re.IGNORECASE):
            return "Government Recruitment Department", "Public Services"

        return None, None

    def _extract_notification_number(self, text: str) -> Optional[str]:
        # Strict patterns requiring digits to avoid false positives like online/apply, and/or
        patterns = [
            r'(?:Advt\.?\s*(?:No\.?)?|Notification\s*(?:No\.?)?|Notice\s*(?:No\.?)?|Ref\s*(?:No\.?)?|Circular\s*(?:No\.?)?)\s*[:\-]?\s*([A-Za-z0-9\/\-_.]*\d+[A-Za-z0-9\/\-_.]*)',
            r'\b(CEN\s*\d{2}/\d{4})\b',
            r'\b(SSC-[A-Z]+-\d{4})\b',
            r'\b(\d{2}/\d{4}-[A-Z0-9\-_]+)\b',
            r'\b(\d+-\d+/\d{4}-[A-Z0-9]+)\b',
            r'\b(EN\s*\d{2}/\d{2,4})\b',
            r'\b(F\.\s*No\.?\s*[\d\-A-Za-z/]+)\b',
            r'\b([A-Z]{2,6}/\d{2,4}/[A-Z0-9\-_]+)\b'
        ]
        excluded_words = ["online/apply", "apply/online", "and/or", "male/female", "gen/obc", "sc/st", "pass/fail", "http://", "https://"]
        for pat in patterns:
            match = re.search(pat, text, re.IGNORECASE)
            if match:
                val = match.group(1) if match.groups() and match.group(1) else match.group(0)
                cleaned = val.strip().rstrip(".,;")
                if len(cleaned) >= 4 and any(c.isdigit() for c in cleaned):
                    if not any(ex in cleaned.lower() for ex in excluded_words):
                        return cleaned
        return None

    def _extract_job_title(self, text: str) -> Optional[str]:
        patterns = [
            r'(?:Post(?:s)?(?:\s*Name)?|Position(?:s)?|Recruitment\s*(?:for|of))\s*[:\-]?\s*([A-Za-z0-9\s,\/\(\)]+?)(?=\.|\n|Advt|Salary|Fee|Eligibility|Pay|$)',
            r'\b(Assistant Loco Pilot|Civil Services|Station Master|Gramin Dak Sevak|Postal Assistant|Multi Tasking Staff|Inspector|Junior Engineer|Clerk|Sub-Inspector|Constable|Head Constable|Staff Nurse|Teacher|Officer)\b'
        ]
        for pat in patterns:
            m = re.search(pat, text, re.IGNORECASE)
            if m:
                title = m.group(1).strip()
                if len(title) > 3 and len(title) < 100:
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
        # Landline numbers e.g. 011-23098591
        m_landline = re.search(r'\b0\d{2,4}[\-\s]?\d{6,8}\b', text)
        if m_landline:
            return m_landline.group(0).strip()
        return None

    def _extract_payment_info(self, text: str, qr_data: Optional[str]) -> tuple[Optional[str], Optional[str], bool]:
        upi_id = None
        instructions = None
        is_unauthorized = False

        # Detect UPI ID: pattern e.g. name@okaxis, support@paytm, govt.help@upi, etc.
        m_upi = re.search(r'\b([a-zA-Z0-9.\-_]{2,256}@(okhdfcbank|okaxis|oksbi|okicici|paytm|ybl|apl|upi|axl|sbi|postbank|ibl|fbl|idfcbank|kotak|allbank))\b', text, re.IGNORECASE)
        if m_upi:
            upi_id = m_upi.group(1).lower()
            is_unauthorized = True

        if not upi_id and qr_data and "pa=" in qr_data:
            pa_match = re.search(r'pa=([a-zA-Z0-9.\-_@]+)', qr_data)
            if pa_match:
                upi_id = pa_match.group(1).lower()
                is_unauthorized = True

        # Payment instructions / phrases
        m_pay = re.search(
            r'(?:Pay(?:ment)?|Registration Fee|Deposit|Application Fee|Processing Fee|Training Fee|Security Deposit)\s*[:\-]?\s*([^\n\.\;]+)',
            text,
            re.IGNORECASE
        )
        if m_pay:
            instructions = m_pay.group(0).strip()
            
        # Check for illicit payment patterns
        illicit_match = re.search(
            r'(?:pay\s*(?:via|through|on)\s*(?:upi|gpay|google\s*pay|phonepe|paytm|scanner|qr)|refundable\s*(?:security\s*)?deposit|transfer\s*(?:fee|money|amount)|send\s*(?:payment\s*)?screenshot)',
            text,
            re.IGNORECASE
        )
        if illicit_match:
            is_unauthorized = True
            if not instructions:
                instructions = illicit_match.group(0).strip()

        if upi_id and not instructions:
            instructions = f"Direct transfer requested via UPI handle ({upi_id})"

        return upi_id, instructions, is_unauthorized

    def _extract_fee(self, text: str) -> tuple[Optional[float], str]:
        # Match explicit currency symbols: ₹ 500, Rs. 500, Rs 500, INR 500
        # Or explicit fee headers: Application Fee: 100, Exam Fee: 200, Registration Fee: Rs. 500
        m = re.search(r'(?:(?:₹|Rs\.?|INR)\s*(\d{2,6})|(?:Application\s*Fee|Exam\s*Fee|Registration\s*Fee|Processing\s*Fee|Fee|Deposit)\s*[:\-]\s*(?:₹|Rs\.?|INR)?\s*(\d{2,6}))', text, re.IGNORECASE)
        if m:
            try:
                fee_val = m.group(1) or m.group(2)
                if fee_val:
                    fee = float(fee_val)
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

        m_deadline = re.search(r'(?:Last\s*Date|Apply\s*(?:Before|By)|Closing\s*Date|Deadline)\s*[:\-]?\s*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}|\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2}|immediate\b|today\b|24\s*hours\b)', text, re.IGNORECASE)
        if m_deadline:
            dates["deadline"] = m_deadline.group(1).strip()

        m_start = re.search(r'(?:Start\s*Date|Opening\s*Date|Application\s*Begins)\s*[:\-]?\s*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})', text, re.IGNORECASE)
        if m_start:
            dates["start_date"] = m_start.group(1).strip()

        m_exam = re.search(r'(?:Exam(?:ination)?\s*Date)\s*[:\-]?\s*(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})', text, re.IGNORECASE)
        if m_exam:
            dates["exam_date"] = m_exam.group(1).strip()

        return dates

    def _extract_url_and_domain(self, text: str, input_url: Optional[str]) -> tuple[Optional[str], Optional[str]]:
        target_url = input_url
        if not target_url:
            m_url = re.search(r'https?://[^\s<>"]+|www\.[^\s<>"]+|[a-zA-Z0-9.-]+\.(?:gov\.in|nic\.in|in|com|org|online|xyz|net|site|info)', text)
            if m_url:
                target_url = m_url.group(0).rstrip(".,;)")
                if not target_url.startswith("http"):
                    target_url = "https://" + target_url

        if target_url:
            try:
                parsed = urlparse(target_url)
                domain = parsed.netloc or parsed.path.split('/')[0]
                domain = domain.lower()
                if domain.startswith("www."):
                    domain = domain[4:]
                return target_url, domain
            except Exception:
                pass
        return None, None

    def _extract_social_channels(self, text: str) -> List[str]:
        channels = []
        if re.search(r'\b(?:whatsapp|wa\.me)\b', text, re.IGNORECASE):
            channels.append("WhatsApp")
        if re.search(r'\b(?:telegram|t\.me)\b', text, re.IGNORECASE):
            channels.append("Telegram")
        if re.search(r'\b(?:youtube|youtu\.be)\b', text, re.IGNORECASE):
            channels.append("YouTube")
        if re.search(r'\b(?:facebook|fb\.com)\b', text, re.IGNORECASE):
            channels.append("Facebook")
        return channels

    def _extract_location(self, text: str) -> Optional[str]:
        m = re.search(r'\b(New Delhi|Delhi|Mumbai|Chennai|Kolkata|Bengaluru|Hyderabad|Lucknow|Patna|Bhopal|Jaipur|All India|Pan India)\b', text, re.IGNORECASE)
        if m:
            return m.group(0)
        return "All India"

    def _extract_contact_person(self, text: str) -> Optional[str]:
        m = re.search(r'(?:Contact Person|Recruitment Officer|Helpdesk Contact|Coordinator)\s*[:\-]?\s*([A-Za-z\s]+?)(?=\n|\.|$)', text, re.IGNORECASE)
        if m:
            name = m.group(1).strip()
            if len(name) > 3 and len(name) < 40:
                return name
        return None

    def _extract_bank_details(self, text: str) -> Dict[str, Optional[str]]:
        acc_match = re.search(r'(?:A/C|Account\s*(?:No\.?)?)\s*[:\-]?\s*(\d{9,18})', text, re.IGNORECASE)
        ifsc_match = re.search(r'\b([A-Z]{4}0[A-Z0-9]{6})\b', text)
        return {
            "account_number": acc_match.group(1) if acc_match else None,
            "ifsc_code": ifsc_match.group(1) if ifsc_match else None
        }

extraction_service = EvidenceExtractionService()
