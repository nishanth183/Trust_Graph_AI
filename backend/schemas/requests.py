from typing import Optional
from pydantic import BaseModel, Field

class AnalyzeRequest(BaseModel):
    text: Optional[str] = Field(None, description="Pasted text or message content")
    url: Optional[str] = Field(None, description="Recruitment portal or website URL")
    source_type: Optional[str] = Field("Other", description="WhatsApp, Telegram, SMS, Email, Social Media, Other")
    demo_case_id: Optional[str] = Field(None, description="Optional preloaded demo case key (e.g., case_1_genuine, case_2_suspicious_domain, etc.)")

class ExtractRequest(BaseModel):
    text: Optional[str] = None
    url: Optional[str] = None
    source_type: Optional[str] = "Other"

class VerifyRequest(BaseModel):
    organization: Optional[str] = None
    notification_number: Optional[str] = None
    domain: Optional[str] = None
    email: Optional[str] = None
    upi_id: Optional[str] = None

class DNARequest(BaseModel):
    evidence: dict = Field(..., description="Extracted recruitment evidence dictionary")

class GraphRequest(BaseModel):
    evidence: dict = Field(..., description="Extracted recruitment evidence dictionary")
    case_id: Optional[str] = None

class RiskRequest(BaseModel):
    evidence: dict
    dna_similarity: Optional[float] = None
    verification: Optional[dict] = None
    nlp_risk: Optional[float] = None
    contradictions: Optional[list] = None

class ReportFeedbackRequest(BaseModel):
    case_id: str
    user_verdict: str = Field(..., description="GENUINE, SUSPICIOUS, or SCAM")
    feedback_notes: Optional[str] = None
    reporter_contact: Optional[str] = None
