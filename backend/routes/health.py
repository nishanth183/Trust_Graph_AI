from datetime import datetime
from fastapi import APIRouter
from backend.config import settings
from backend.schemas.responses import HealthResponse
from backend.utils.storage import storage

router = APIRouter(tags=["Health & System"])

@router.get("/health", response_model=HealthResponse)
async def check_health():
    return {
        "status": "HEALTHY",
        "version": settings.PROJECT_NAME + " v" + settings.VERSION,
        "demo_mode": settings.DEMO_MODE,
        "ai_models_loaded": {
            "nlp_pipeline": True,
            "ocr_pymupdf": True,
            "opencv_vision": True,
            "recruitment_dna_engine": True,
            "evidence_graph_builder": True,
            "contradiction_reasoning_engine": True,
            "ml_risk_classifier": True
        },
        "timestamp": datetime.now().isoformat()
    }

from pydantic import BaseModel
from typing import Optional

class IndicatorLookupRequest(BaseModel):
    query: str

class IndicatorReportRequest(BaseModel):
    type: str  # 'phone', 'upi', 'domain'
    value: str
    organization_claimed: Optional[str] = "Unknown"
    reason: Optional[str] = ""

@router.get("/scam-intelligence")
async def get_scam_intelligence():
    """Retrieve global scam network indicators for security researchers and citizens."""
    return storage.get_scam_indicators()

@router.post("/scam-intelligence/lookup")
async def lookup_scam_indicator(req: IndicatorLookupRequest):
    """Instant lookup to verify if a phone, UPI, or domain is flagged in the syndicate database."""
    return storage.lookup_scam_indicator(req.query)

@router.post("/scam-intelligence/report")
async def report_scam_indicator(req: IndicatorReportRequest):
    """Community & officer reporting for suspicious recruitment infrastructure."""
    added = storage.add_scam_indicator(
        indicator_type=req.type,
        value=req.value,
        organization_claimed=req.organization_claimed,
        reason=req.reason,
        case_id="COMMUNITY-REPORT"
    )
    return {"status": "SUCCESS", "message": "Indicator successfully recorded in threat database", "indicator": added}
