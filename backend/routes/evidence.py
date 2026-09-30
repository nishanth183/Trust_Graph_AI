from fastapi import APIRouter
from backend.schemas.requests import ExtractRequest
from backend.services.extraction_service import extraction_service

router = APIRouter(tags=["Evidence Extraction"])

@router.post("/extract")
async def extract_recruitment_evidence(request: ExtractRequest):
    evidence = extraction_service.extract_evidence(
        text=request.text or "",
        input_url=request.url,
        source_platform=request.source_type
    )
    return {"evidence": evidence}
