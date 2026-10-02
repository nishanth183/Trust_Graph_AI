from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

class ReasonItem(BaseModel):
    title: str
    description: str
    severity: str = "HIGH" # CRITICAL, HIGH, MEDIUM, LOW, POSITIVE
    icon: Optional[str] = None

class ContradictionItem(BaseModel):
    rule_id: str
    factor: str
    evidence: str
    severity: str # CRITICAL, HIGH, MEDIUM, LOW
    confidence: float
    explanation: str

class ScamNetworkLink(BaseModel):
    entity_type: str # phone, upi, domain, qr
    entity_value: str
    connected_case_id: str
    connection_strength: str # KNOWN, SUSPICIOUS, POSSIBLE
    reason: str

class EvidenceSummary(BaseModel):
    verified_count: int = 0
    suspicious_count: int = 0
    missing_count: int = 0
    conflicting_count: int = 0
    total_extracted: int = 0

class DNASignatureBreakdown(BaseModel):
    feature_name: str
    category: str
    submitted_val: Any
    trusted_val: Any
    status: str # MATCH, MISMATCH, MISSING, UNVERIFIED
    weight: float

class DNAResult(BaseModel):
    dna_id: str
    similarity_score: float # 0 - 100
    signatures: Dict[str, Any]
    trusted_benchmark: Optional[Dict[str, Any]] = None
    matching_features: List[str] = []
    mismatching_features: List[str] = []
    missing_features: List[str] = []
    comparison_breakdown: List[DNASignatureBreakdown] = []
    pattern_checklist: Optional[List[Dict[str, Any]]] = []

class GraphNode(BaseModel):
    id: str
    label: str
    type: str # Organization, Notification, Website, Domain, Email, Phone, QR, PaymentAccount, UPI, Person, Source
    status: str # VERIFIED, SUSPICIOUS, CONFLICT, UNKNOWN, DEMO_VERIFIED
    data: Optional[Dict[str, Any]] = None

class GraphEdge(BaseModel):
    id: str
    source: str
    target: str
    label: str # PUBLISHED_BY, USES_DOMAIN, USES_EMAIL, CONTACTED_BY, HAS_QR, REQUESTS_PAYMENT, CONNECTED_TO, etc.
    status: str # VERIFIED, SUSPICIOUS, CONFLICT, NEUTRAL

class GraphResult(BaseModel):
    nodes: List[Dict[str, Any]]
    edges: List[Dict[str, Any]]
    total_nodes: int = 0
    total_edges: int = 0
    suspicious_edges_count: int = 0
    degree_centrality: Optional[Dict[str, float]] = None

class ExplainabilityFactor(BaseModel):
    feature: str
    label: str
    contribution: float # Positive increases trust; negative increases scam probability
    direction: str # "SUPPORTING" or "RISK"
    explanation: str

class ExplainabilityResult(BaseModel):
    top_factors: List[ExplainabilityFactor]
    supporting_evidence: List[str]
    risk_evidence: List[str]
    model_type: str = "XGBoost + SHAP Explainability Engine (Demo-Calibrated)"

class CaseAnalysisResponse(BaseModel):
    case_id: str
    verdict: str = Field(..., description="GENUINE, SUSPICIOUS, SCAM, INCONCLUSIVE")
    trust_score: float = Field(..., description="0 to 100")
    risk_level: str = Field(..., description="LOW, MEDIUM, HIGH")
    scam_probability: float = Field(..., description="0 to 100 percent")
    genuine_probability: float = Field(..., description="0 to 100 percent")
    suspicious_probability: float = Field(..., description="0 to 100 percent")
    confidence: float = Field(..., description="0 to 100 percent")
    top_reasons: List[str]
    recommended_action: str
    evidence_summary: EvidenceSummary
    extracted_evidence: Dict[str, Any]
    recruitment_dna: DNAResult
    recruitment_pattern: Optional[List[Dict[str, Any]]] = None
    evidence_graph: GraphResult
    verification_details: Dict[str, Any]
    contradiction_findings: List[ContradictionItem]
    scam_network_findings: List[ScamNetworkLink]
    explainability: ExplainabilityResult
    input_metadata: Dict[str, Any]
    demo_mode: bool = True
    created_at: str
    user_id: Optional[str] = None
    username: Optional[str] = None
    analysis_id: Optional[str] = None
    input_type: Optional[str] = None
    organization: Optional[str] = None

class HealthResponse(BaseModel):
    status: str
    version: str
    demo_mode: bool
    ai_models_loaded: Dict[str, bool]
    timestamp: str
