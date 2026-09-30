from fastapi import APIRouter
from backend.schemas.requests import DNARequest
from backend.services.dna_service import dna_service

router = APIRouter(tags=["Recruitment DNA"])

@router.post("/dna")
async def generate_and_compare_dna(request: DNARequest):
    submitted_dna = dna_service.generate_dna(request.evidence)
    comparison = dna_service.compare_dna(submitted_dna)
    return {"recruitment_dna": comparison}
