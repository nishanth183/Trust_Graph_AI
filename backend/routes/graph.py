from fastapi import APIRouter
from backend.schemas.requests import GraphRequest
from backend.services.graph_service import graph_service
from backend.services.verification_service import verification_service
from backend.services.network_service import network_service

router = APIRouter(tags=["Evidence Graph"])

@router.post("/graph")
async def generate_evidence_graph(request: GraphRequest):
    case_id = request.case_id or "DEMO-CASE"
    verif = verification_service.verify_recruitment(request.evidence)
    scam_links = network_service.analyze_connections(request.evidence)
    graph_data = graph_service.build_graph(case_id, request.evidence, verif, scam_links)
    return {"evidence_graph": graph_data}
