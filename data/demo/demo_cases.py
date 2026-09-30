from typing import Dict, Any

DEMO_CASES: Dict[str, Dict[str, Any]] = {
    "case_1_genuine": {
        "title": "CASE 1: Genuine UPSC Civil Services Examination (DEMO DATA)",
        "source_type": "Official Gazette / Web Portal",
        "label": "GENUINE BENCHMARK",
        "description": "Authentic civil services notification from Union Public Service Commission adhering strictly to statutory norms, official apex domain (.gov.in), and treasury banking.",
        "text": """UNION PUBLIC SERVICE COMMISSION
EXAMINATION NOTICE NO. 05/2026-CSP
DATE: 14/02/2026
CIVIL SERVICES (PRELIMINARY) EXAMINATION, 2026

Candidates to ensure their eligibility for the Examination:
All candidates (male/female/transgender) are requested to carefully read the Rules of Civil Services Examination notified by the Government (Department of Personnel and Training).

1. HOW TO APPLY:
Candidates are required to apply online by using the website https://upsconline.nic.in. Detailed instructions for filling up online applications are available on the above mentioned website.

2. LAST DATE FOR RECEIPT OF APPLICATIONS:
The online Applications can be filled up to 05th March, 2026 till 6:00 PM.

3. PENALTY FOR WRONG ANSWERS:
Candidates should note that there will be penalty (Negative Marking) for wrong answers marked by a candidate in the Objective Type Question Papers.

4. APPLICATION FEE:
Candidates (except Female/SC/ST/Persons with Benchmark Disability Candidates who are exempted from payment of fee) are required to pay a fee of Rs. 100/- (Rupees One Hundred only) either by remitting the money in any Branch of State Bank of India by cash or by using net banking facility of State Bank of India or by using Visa/Master/RuPay Credit/Debit Card/UPI through official SBI payment gateway.

Contact: facilitation@upsc.gov.in
Website: https://upsc.gov.in""",
        "url": "https://upsc.gov.in"
    },

    "case_2_suspicious_domain": {
        "title": "CASE 2: Fake Railway Recruitment with Suspicious Domain (DEMO DATA)",
        "source_type": "Social Media",
        "label": "SUSPICIOUS DOMAIN SCAM",
        "description": "Phishing campaign impersonating Railway Recruitment Boards (RRB) using typosquatted .online domain and urgent application deadlines.",
        "text": """RAILWAY RECRUITMENT BOARDS (RRB)
SPECIAL RECRUITMENT NOTIFICATION 2026
Centralized Employment Notice CEN 09/2026-RAIL

Urgent hiring for 12,500 Posts: Assistant Station Master, Ticket Collector, Junior Clerk.
Monthly Pay: ₹35,400 - ₹62,000/-

Hurry Up! Apply immediately. Last date is 24 hours only!
100% selection guarantee without written examination for sports and technical quotas.

Apply only on our portal: https://rrb-recruitment-gov.online
Registration Fee: Rs. 750 (Mandatory for slot confirmation)
Official Email: rrb.support.desk@gmail.com
Helpline: +918765432109""",
        "url": "https://rrb-recruitment-gov.online"
    },

    "case_3_personal_upi": {
        "title": "CASE 3: Fake India Post GDS with Personal UPI (DEMO DATA)",
        "source_type": "WhatsApp",
        "label": "PERSONAL UPI FRAUD",
        "description": "Viral WhatsApp scam message impersonating India Post Gramin Dak Sevaks with direct UPI ID transfer request and fake gmail helpdesk.",
        "text": """*INDIA POST RECRUITMENT CELL (GDS 2026)*
Ministry of Communications, Government of India

Direct Selection for 38,926 Gramin Dak Sevak (Branch Postmaster / Assistant Branch Postmaster) across all postal circles!
Direct appointment letter based on 10th marks. No exam!

Pay refundable security deposit of Rs. 500 immediately to confirm your appointment letter dispatch.
Payment through UPI ID: recruitment.officer@okaxis
Send payment screenshot to WhatsApp: +919876543210

Contact Person: Senior Recruitment Officer Sharma
Official Mail: indiapost.gds.helpline@gmail.com
Portal: https://indiapost-gds-apply.xyz""",
        "url": "https://indiapost-gds-apply.xyz"
    },

    "case_4_reused_infrastructure": {
        "title": "CASE 4: Scam Syndicate Reusing Reused Phone & UPI (DEMO DATA)",
        "source_type": "Telegram",
        "label": "SYNDICATE INFRASTRUCTURE REUSE",
        "description": "New fraudulent notification from a different claimed department reusing the exact phone number (+919876543210) and UPI handle (recruitment.officer@okaxis) flagged in Case 3.",
        "text": """DEFENCE HEADQUARTERS RECRUITMENT BOARD
Govt of India - Urgent Staff Recruitment 2026

Position: Multi-Tasking Staff (MTS) & Store Keeper (Grade III)
Total Vacancies: 4,200
Eligibility: 10th / 12th Pass

Notice: Admit card will be issued only after paying document verification fee of Rs. 650.
Pay fee to authorized account UPI: recruitment.officer@okaxis
Mandatory: Call helpline +919876543210 after payment for biometric slot allocation.

Recruitment Officer: Major V. K. Malhotra
Apply: https://example-recruitment-site.com
Official Mail: defencerecruitment.cell@yahoo.com""",
        "url": "https://example-recruitment-site.com"
    },

    "sample_prompt_scenario": {
        "title": "CASE 5: Master Prompt Sample Scam Scenario (DEMO DATA)",
        "source_type": "SMS",
        "label": "SPECIFICATION SAMPLE",
        "description": "The exact fake scenario described in Section 29 of the master prompt.",
        "text": """Government Recruitment 2026
Apply immediately.
Registration fee ₹500.
Contact recruitment@example.com
Payment through UPI: fakegovt@upi
Website: example-recruitment-site.com""",
        "url": "https://example-recruitment-site.com"
    }
}
