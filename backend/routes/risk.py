from fastapi import APIRouter
from backend.schemas.requests import RiskRequest
from backend.services.risk_service import risk_service
from backend.services.nlp_service import nlp_service
from backend.services.verification_service import verification_service
from backend.services.dna_service import dna_service
from backend.services.graph_service import graph_service
from backend.services.network_service import network_service
from backend.services.reasoning_service import reasoning_engine

router = APIRouter(tags=["Risk Reasoning & Prediction"])

@router.post("/risk")
async def calculate_risk_profile(request: RiskRequest):
    evidence = request.evidence
    nlp_data = nlp_service.analyze_text(evidence.get("text", ""))
    verif = request.verification or verification_service.verify_recruitment(evidence)
    submitted_dna = dna_service.generate_dna(evidence, nlp_data)
    dna_comparison = dna_service.compare_dna(submitted_dna)
    scam_links = network_service.analyze_connections(evidence)
    graph_res = graph_service.build_graph("API-RISK", evidence, verif, scam_links)
    contradictions = request.contradictions or reasoning_engine.evaluate_contradictions(
        evidence, verif, nlp_data, scam_links, dna_comparison
    )

    feat_vector = risk_service.extract_feature_vector(
        evidence, verif, nlp_data, dna_comparison, graph_res, scam_links, contradictions
    )
    prediction = risk_service.predict_risk(feat_vector, contradictions, verif, scam_links)
    return {"risk_assessment": prediction, "contradictions": contradictions}
