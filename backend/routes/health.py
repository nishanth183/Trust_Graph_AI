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

@router.get("/scam-intelligence")
async def get_scam_intelligence():
    """Retrieve global scam network indicators for security researchers and citizens."""
    return storage.get_scam_indicators()
