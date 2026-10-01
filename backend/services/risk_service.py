import numpy as np
from typing import Dict, Any, List, Tuple
from sklearn.ensemble import GradientBoostingClassifier

class MLRiskService:
    """
    ML Risk Prediction & Feature Pipeline.
    Combines structured feature vectors from NLP, DNA, Verification, Graph, and Contradictions.
    Includes deterministic arbitration so critical verification evidence is never silently overridden.
    """

    FEATURE_NAMES = [
        "nlp_risk_score",
        "domain_risk_score",
        "email_risk_score",
        "payment_risk_score",
        "qr_detected_flag",
        "official_notif_match",
        "official_domain_match",
        "official_email_match",
        "dna_similarity_score",
        "suspicious_edges_ratio",
        "scam_network_link_count",
        "contradiction_critical_count",
        "contradiction_high_count",
        "urgency_score",
        "guaranteed_job_claim_flag"
    ]

    def __init__(self):
        self.model = None
        self._init_demo_model()

    def _init_demo_model(self):
        """
        Train a calibrated baseline ensemble model on representative recruitment feature vectors.
        Clearly labeled as Demo-Calibrated Ensemble in the explainability pipeline.
        """
        # Feature columns:
        # [nlp_risk, domain_risk, email_risk, payment_risk, qr, notif_match, dom_match, email_match, dna_sim, susp_edges, scam_links, crit_contra, high_contra, urgency, guaranteed]
        # Labels: 0 = GENUINE, 1 = SUSPICIOUS, 2 = SCAM

        X_train = np.array([
            # Genuine UPSC / SSC Cases
            [10.0, 0.05, 0.05, 0.0, 0.0, 1.0, 1.0, 1.0, 95.0, 0.0, 0.0, 0.0, 0.0, 10.0, 0.0],
            [15.0, 0.05, 0.10, 0.0, 0.0, 1.0, 1.0, 0.8, 92.0, 0.0, 0.0, 0.0, 0.0, 15.0, 0.0],
            [5.0,  0.05, 0.05, 0.0, 0.0, 1.0, 1.0, 1.0, 98.0, 0.0, 0.0, 0.0, 0.0, 5.0,  0.0],
            [20.0, 0.10, 0.10, 0.0, 0.0, 0.7, 1.0, 1.0, 88.0, 0.0, 0.0, 0.0, 0.0, 20.0, 0.0],

            # Suspicious Cases (Unofficial portals, aggregators, missing notif numbers)
            [35.0, 0.40, 0.50, 0.2, 0.0, 0.0, 0.0, 0.0, 55.0, 0.3, 0.0, 0.0, 1.0, 45.0, 0.0],
            [40.0, 0.50, 0.40, 0.1, 0.0, 0.0, 0.0, 0.0, 50.0, 0.35, 0.0, 0.0, 1.0, 50.0, 0.0],
            [30.0, 0.35, 0.45, 0.3, 0.0, 0.0, 0.0, 0.0, 60.0, 0.25, 0.0, 0.0, 1.0, 40.0, 0.0],

            # Blatant Scam Cases (Personal UPI, fake domains, syndicate links)
            [85.0, 0.90, 0.90, 1.0, 1.0, 0.0, 0.0, 0.0, 18.0, 0.8, 1.0, 2.0, 2.0, 90.0, 1.0],
            [90.0, 0.95, 0.95, 1.0, 1.0, 0.0, 0.0, 0.0, 12.0, 0.9, 2.0, 3.0, 1.0, 85.0, 1.0],
            [75.0, 0.85, 0.90, 1.0, 0.0, 0.0, 0.0, 0.0, 22.0, 0.7, 0.0, 1.0, 2.0, 80.0, 1.0],
            [80.0, 0.90, 0.90, 1.0, 1.0, 0.0, 0.0, 0.0, 25.0, 0.75, 1.0, 2.0, 1.0, 75.0, 0.0],
        ])
        y_train = np.array([0, 0, 0, 0, 1, 1, 1, 2, 2, 2, 2])

        # Check if xgboost is available, otherwise train GradientBoostingClassifier
        try:
            import xgboost as xgb
            self.model = xgb.XGBClassifier(n_estimators=50, max_depth=3, learning_rate=0.1, random_state=42)
            self.model.fit(X_train, y_train)
            self.model_type = "XGBoost Classifier (Demo Calibrated)"
        except Exception:
            self.model = GradientBoostingClassifier(n_estimators=50, max_depth=3, learning_rate=0.1, random_state=42)
            self.model.fit(X_train, y_train)
            self.model_type = "Gradient Boosting Ensemble (Demo Calibrated)"

    def extract_feature_vector(
        self,
        evidence: Dict[str, Any],
        verification: Dict[str, Any],
        nlp_data: Dict[str, Any],
        dna_result: Dict[str, Any],
        graph_result: Dict[str, Any],
        scam_links: List[Dict[str, Any]],
        contradictions: List[Dict[str, Any]]
    ) -> np.ndarray:
        nlp_risk = float(nlp_data.get("nlp_risk_score", 0.0))
        urgency = float(nlp_data.get("urgency_score", 0.0))
        guaranteed = 1.0 if nlp_data.get("guaranteed_job_claim") else 0.0

        # Domain risk
        dom_status = verification.get("domain_status", "")
        if dom_status in ["VERIFIED", "DEMO VERIFIED"]:
            dom_risk = 0.05
            dom_match = 1.0
        elif dom_status == "DIFFERENT_GOV_DOMAIN":
            dom_risk = 0.40
            dom_match = 0.5
        elif dom_status == "SUSPICIOUS_NON_GOV_DOMAIN":
            dom_risk = 0.95
            dom_match = 0.0
        else:
            dom_risk = 0.50
            dom_match = 0.0

        # Email risk
        email_status = verification.get("email_status", "")
        if email_status in ["VERIFIED", "DEMO VERIFIED"]:
            email_risk = 0.05
            email_match = 1.0
        elif email_status == "PUBLIC_PROVIDER_CONFLICT":
            email_risk = 0.90
            email_match = 0.0
        else:
            email_risk = 0.50
            email_match = 0.0

        # Payment risk
        upi_id = evidence.get("upi_id")
        qr_detected = 1.0 if evidence.get("qr_detected") else 0.0
        if upi_id:
            payment_risk = 1.0
        elif qr_detected:
            payment_risk = 0.8
        elif evidence.get("application_fee") is not None:
            payment_risk = 0.1
        else:
            payment_risk = 0.0

        # Notification match
        notif_status = verification.get("notification_status", "")
        if notif_status in ["VERIFIED", "DEMO VERIFIED"]:
            notif_match = 1.0
        elif notif_status == "VALID_FORMAT_NOT_IN_REGISTRY":
            notif_match = 0.5
        else:
            notif_match = 0.0

        # DNA Similarity
        dna_sim = float(dna_result.get("similarity_score", 50.0))

        # Graph suspicious ratio
        total_edges = max(graph_result.get("total_edges", 1), 1)
        susp_edges = graph_result.get("suspicious_edges_count", 0)
        susp_edges_ratio = susp_edges / total_edges

        # Scam links
        scam_link_count = float(len(scam_links))

        # Contradictions
        crit_contra = float(sum(1 for c in contradictions if c.get("severity") == "CRITICAL"))
        high_contra = float(sum(1 for c in contradictions if c.get("severity") == "HIGH"))

        features = [
            nlp_risk,
            dom_risk,
            email_risk,
            payment_risk,
            qr_detected,
            notif_match,
            dom_match,
            email_match,
            dna_sim,
            susp_edges_ratio,
            scam_link_count,
            crit_contra,
            high_contra,
            urgency,
            guaranteed
        ]
        return np.array(features).reshape(1, -1)

    def predict_risk(
        self,
        features: np.ndarray,
        contradictions: List[Dict[str, Any]],
        verification: Dict[str, Any],
        scam_links: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Predict risk using ML + deterministic overrides + pattern-based fallback.
        INCONCLUSIVE is only returned when absolutely no signals exist.
        """
        probs = self.model.predict_proba(features)[0]
        if len(probs) == 3:
            p_gen, p_susp, p_scam = float(probs[0]), float(probs[1]), float(probs[2])
        elif len(probs) == 2:
            p_gen, p_susp, p_scam = float(probs[0]), 0.1, float(probs[1])
        else:
            p_gen, p_susp, p_scam = 0.1, 0.2, 0.7

        # ── SIGNAL EXTRACTION ──────────────────────────────────────────────────
        critical_count   = sum(1 for c in contradictions if c.get("severity") == "CRITICAL")
        high_count       = sum(1 for c in contradictions if c.get("severity") == "HIGH")
        medium_count     = sum(1 for c in contradictions if c.get("severity") == "MEDIUM")
        has_scam_links   = len(scam_links) > 0
        org_matched      = bool(verification.get("organization_matched"))
        domain_status    = verification.get("domain_status", "")
        email_status     = verification.get("email_status", "")
        notif_status     = verification.get("notification_status", "")
        payment_status   = verification.get("payment_channel_status", "")

        has_suspicious_domain     = domain_status == "SUSPICIOUS_NON_GOV_DOMAIN"
        has_public_email          = email_status == "PUBLIC_PROVIDER_CONFLICT"
        has_personal_upi_payment  = payment_status in ["CRITICAL_CONFLICT_PERSONAL_UPI", "CRITICAL_CONFLICT_QR_CODE"]
        all_verified              = (
            verification.get("organization_status") in ["VERIFIED", "DEMO VERIFIED"] and
            domain_status in ["VERIFIED", "DEMO VERIFIED"] and
            notif_status in ["VERIFIED", "DEMO VERIFIED"] and
            len(contradictions) == 0
        )

        # Raw feature values for pattern fallback
        f = features[0]
        nlp_risk     = float(f[0])   # nlp_risk_score
        payment_risk = float(f[3])   # payment_risk_score
        qr_flag      = float(f[4])   # qr_detected_flag
        dna_sim      = float(f[8])   # dna_similarity_score
        urgency      = float(f[13])  # urgency_score
        guaranteed   = float(f[14])  # guaranteed_job_claim_flag

        # ── TIER 1: ABSOLUTE OVERRIDES (deterministic) ─────────────────────────
        # Critical UPI/QR/scam infrastructure → always SCAM
        if critical_count >= 1 or has_scam_links or has_personal_upi_payment:
            p_scam = max(p_scam, 0.92)
            p_gen  = min(p_gen,  0.04)
            p_susp = max(0.0, 1.0 - p_scam - p_gen)
            verdict    = "SCAM"
            risk_level = "HIGH"
            trust_score = round((1.0 - p_scam) * 20.0, 1)

        # Suspicious domain or ≥2 HIGH contradictions or public email fraud
        elif has_suspicious_domain or high_count >= 2 or (has_public_email and org_matched):
            p_scam = max(p_scam, 0.78)
            p_gen  = min(p_gen,  0.10)
            p_susp = max(0.0, 1.0 - p_scam - p_gen)
            verdict    = "SCAM"
            risk_level = "HIGH"
            trust_score = round((1.0 - p_scam) * 32.0, 1)

        # ── TIER 2: VERIFIED GENUINE ────────────────────────────────────────────
        elif all_verified:
            p_gen  = max(p_gen,  0.94)
            p_scam = min(p_scam, 0.03)
            p_susp = max(0.0, 1.0 - p_gen - p_scam)
            verdict    = "GENUINE"
            risk_level = "LOW"
            trust_score = round(85.0 + (p_gen * 14.0), 1)

        # ── TIER 3: PATTERN-BASED SCORING (when org not in registry) ───────────
        # Compute a weighted risk score purely from available signals
        else:
            pattern_score = 0.0

            # NLP risk is the strongest independent signal
            if nlp_risk >= 70:
                pattern_score += 50.0
            elif nlp_risk >= 40:
                pattern_score += 30.0
            elif nlp_risk >= 15:
                pattern_score += 12.0

            # Payment fraud indicators
            if payment_risk >= 1.0:   pattern_score += 35.0
            elif payment_risk >= 0.8: pattern_score += 25.0
            elif payment_risk >= 0.1: pattern_score += 8.0

            # QR code in message
            if qr_flag >= 1.0: pattern_score += 20.0

            # Guaranteed job promise (constitutional violation)
            if guaranteed >= 1.0: pattern_score += 25.0

            # Urgency signals
            if urgency >= 70:  pattern_score += 15.0
            elif urgency >= 35: pattern_score += 8.0

            # Single HIGH contradiction (e.g. missing advt number)
            if high_count >= 1:  pattern_score += 15.0
            if medium_count >= 1: pattern_score += 5.0

            # Domain/email partial conflicts
            if has_public_email:          pattern_score += 18.0
            if domain_status == "MISSING" and org_matched: pattern_score += 8.0

            # DNA similarity — low score means poor match to real patterns
            if dna_sim < 30:   pattern_score += 15.0
            elif dna_sim < 50: pattern_score += 5.0
            elif dna_sim > 80 and nlp_risk < 15: pattern_score -= 10.0

            # Org recognized but unverifiable details
            if org_matched and notif_status in ["NOT_FOUND", "VALID_FORMAT_NOT_IN_REGISTRY"]:
                pattern_score += 12.0

            # If org not recognized at all and no positive signals → likely spam/scam
            if not org_matched and nlp_risk < 10 and payment_risk < 0.1 and urgency < 10:
                # Truly empty — insufficient to classify
                pattern_score = -1.0

            # ── Map pattern score → verdict ─────────────────────────────────
            if pattern_score < 0:
                # Genuinely no data to classify
                verdict    = "INCONCLUSIVE"
                risk_level = "MEDIUM"
                trust_score = 50.0
                p_scam = 0.30; p_gen = 0.30; p_susp = 0.40

            elif pattern_score >= 55:
                verdict    = "SCAM"
                risk_level = "HIGH"
                p_scam = min(0.95, 0.60 + pattern_score / 200.0)
                p_gen  = max(0.02, 0.20 - pattern_score / 200.0)
                p_susp = max(0.0, 1.0 - p_scam - p_gen)
                trust_score = round(max(1.0, 30.0 - pattern_score * 0.3), 1)

            elif pattern_score >= 25:
                verdict    = "SUSPICIOUS"
                risk_level = "MEDIUM"
                p_scam = min(0.75, 0.40 + pattern_score / 200.0)
                p_gen  = max(0.05, 0.40 - pattern_score / 150.0)
                p_susp = max(0.0, 1.0 - p_scam - p_gen)
                trust_score = round(max(20.0, 60.0 - pattern_score * 0.8), 1)

            elif pattern_score >= 5:
                # Low but non-zero risk signals — lean SUSPICIOUS not INCONCLUSIVE
                verdict    = "SUSPICIOUS"
                risk_level = "LOW"
                p_scam = 0.35; p_gen = 0.40; p_susp = 0.25
                trust_score = round(55.0 - pattern_score * 0.5, 1)

            else:
                # Genuinely clean signal with no flags — treat as plausible
                verdict    = "GENUINE"
                risk_level = "LOW"
                p_gen = max(p_gen, 0.70)
                p_scam = min(p_scam, 0.15)
                p_susp = max(0.0, 1.0 - p_gen - p_scam)
                trust_score = round(60.0 + p_gen * 25.0, 1)

        confidence  = round(max(p_gen, p_susp, p_scam) * 100.0, 1)
        trust_score = max(1.0, min(99.0, trust_score))

        return {
            "verdict": verdict,
            "trust_score": trust_score,
            "risk_level": risk_level,
            "scam_probability":     round(p_scam * 100.0, 1),
            "genuine_probability":  round(p_gen  * 100.0, 1),
            "suspicious_probability": round(p_susp * 100.0, 1),
            "confidence": confidence,
            "model_type": self.model_type
        }

risk_service = MLRiskService()
