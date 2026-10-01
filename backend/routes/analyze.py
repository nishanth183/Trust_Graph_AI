import os
import json
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Header, Request, status
from fastapi.responses import JSONResponse
from backend.utils.auth import extract_user_from_header

from backend.config import settings, UPLOAD_DIR
from backend.schemas.requests import AnalyzeRequest
from backend.schemas.responses import CaseAnalysisResponse
from backend.utils.security import validate_uploaded_file, sanitize_url, mask_sensitive_info
from backend.utils.storage import storage
from backend.services.ocr_service import ocr_service
from backend.services.extraction_service import extraction_service
from backend.services.nlp_service import nlp_service
from backend.services.visual_service import visual_service
from backend.services.url_service import url_service
from backend.services.verification_service import verification_service
from backend.services.dna_service import dna_service
from backend.services.graph_service import graph_service
from backend.services.network_service import network_service
from backend.services.reasoning_service import reasoning_engine
from backend.services.risk_service import risk_service
from backend.services.explanation_service import explanation_service
from data.demo.demo_cases import DEMO_CASES

router = APIRouter(tags=["Analysis"])

@router.post("/analyze", response_model=CaseAnalysisResponse, status_code=status.HTTP_200_OK)
async def analyze_recruitment(
    request: Request = None,
    text: Optional[str] = Form(None),
    url: Optional[str] = Form(None),
    source_type: Optional[str] = Form("Other"),
    demo_case_id: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None)
):
    """
    Unified multi-stage recruitment analysis pipeline.
    Accepts text, image, PDF, URL, or demo preset.
    """
    case_id = storage.generate_case_id()
    created_at = datetime.now().isoformat()

    extracted_text = ""
    qr_detected = False
    qr_data = None
    input_type = "TEXT"
    file_metadata = {}

    # 1. Handle Demo Preset if specified
    if demo_case_id and demo_case_id in DEMO_CASES:
        demo = DEMO_CASES[demo_case_id]
        extracted_text = demo.get("text", "")
        url = demo.get("url", url)
        source_type = demo.get("source_type", source_type)
        input_type = "DEMO_CASE"
        if "recruitment.officer@okaxis" in extracted_text:
            qr_detected = True
            qr_data = "upi://pay?pa=recruitment.officer@okaxis&pn=RecruitmentOfficer"

    # 2. Handle File Upload (Image or PDF)
    elif file and file.filename:
        is_image = any(file.filename.lower().endswith(ext) for ext in [".png", ".jpg", ".jpeg"])
        input_type = "FILE_IMAGE" if is_image else "FILE_PDF"
        content_bytes = await file.read()
        validate_uploaded_file(file, content_bytes)

        # Run OCR / PDF Extractor
        ocr_result = ocr_service.process_file(content_bytes, file.filename)
        extracted_text = ocr_result.get("text", "").strip()
        qr_detected = ocr_result.get("qr_detected", False)
        qr_data = ocr_result.get("qr_data")
        file_metadata = {
            "filename": file.filename,
            "size_bytes": len(content_bytes),
            "ocr_confidence": ocr_result.get("confidence"),
            "ocr_source": ocr_result.get("source_type", "IMAGE")
        }

        # If OCR returned no text (e.g. Tesseract not installed, or blank image),
        # synthesize a placeholder so the pipeline can still run and give a result.
        if not extracted_text:
            if qr_data:
                extracted_text = f"Uploaded image contains a payment QR code pointing to: {qr_data}"
            elif is_image:
                extracted_text = f"Uploaded recruitment image file: {file.filename}. No readable text could be extracted from this image."
            else:
                extracted_text = f"Uploaded PDF recruitment document: {file.filename}. No text layer found."

    # 3. Handle Direct Text
    elif text:
        extracted_text = text.strip()
        input_type = "PASTED_TEXT"

    # 4. Handle Direct URL
    if url:
        sanitized_url = sanitize_url(url)
        url = sanitized_url
        if not extracted_text:
            input_type = "URL_ONLY"
            extracted_text = f"Official recruitment notification claim for website {url}"

    if not extracted_text and not url:
        raise HTTPException(
            status_code=400,
            detail="No input provided. Please provide text, upload an image/PDF, enter a URL, or choose a demo case."
        )

    # ---------------- ARCHITECTURAL PIPELINE ----------------

    # Step 1: Evidence Extraction
    evidence = extraction_service.extract_evidence(
        text=extracted_text,
        input_url=url,
        source_platform=source_type,
        qr_detected=qr_detected,
        qr_data=qr_data
    )

    # Step 2: AI Understanding (NLP & Visual)
    nlp_results = nlp_service.analyze_text(extracted_text)
    
    # Step 3: Recruitment DNA Generation
    submitted_dna = dna_service.generate_dna(evidence, nlp_results)
    dna_comparison = dna_service.compare_dna(submitted_dna)

    # Step 4: Official Recruitment Verification
    verification_details = verification_service.verify_recruitment(evidence, is_demo=settings.DEMO_MODE)

    # Step 5: Scam Network Analysis (Cross-Case Infrastructure Linkage)
    scam_links = network_service.analyze_connections(evidence)

    # Step 6: Evidence Graph Construction
    graph_result = graph_service.build_graph(
        case_id=case_id,
        evidence=evidence,
        verification_details=verification_details,
        scam_links=scam_links
    )

    # Step 7: Contradiction / Risk Reasoning
    contradictions = reasoning_engine.evaluate_contradictions(
        evidence=evidence,
        verification_details=verification_details,
        nlp_analysis=nlp_results,
        scam_links=scam_links,
        dna_result=dna_comparison
    )

    # Step 8: ML Feature Vector Extraction & Risk Prediction
    feature_vector = risk_service.extract_feature_vector(
        evidence=evidence,
        verification=verification_details,
        nlp_data=nlp_results,
        dna_result=dna_comparison,
        graph_result=graph_result,
        scam_links=scam_links,
        contradictions=contradictions
    )

    risk_prediction = risk_service.predict_risk(
        features=feature_vector,
        contradictions=contradictions,
        verification=verification_details,
        scam_links=scam_links
    )

    # Step 9: Explainable AI
    explanation = explanation_service.generate_explanation(
        evidence=evidence,
        verification=verification_details,
        contradictions=contradictions,
        scam_links=scam_links,
        dna_result=dna_comparison,
        risk_result=risk_prediction
    )

    # Step 10: Evidence Summary Metrics
    verified_count = sum(1 for k in ["organization_status", "domain_status", "notification_status", "email_status"] if verification_details.get(k) in ["VERIFIED", "DEMO VERIFIED"])
    suspicious_count = len(contradictions) + len(scam_links)
    missing_count = sum(1 for k in ["organization", "notification_number", "domain", "email"] if not evidence.get(k))
    conflicting_count = sum(1 for c in contradictions if c.get("severity") in ["CRITICAL", "HIGH"])

    evidence_summary = {
        "verified_count": verified_count,
        "suspicious_count": suspicious_count,
        "missing_count": missing_count,
        "conflicting_count": conflicting_count,
        "total_extracted": sum(1 for v in evidence.values() if v is not None and v != "" and v is not False and v != {})
    }

    response_payload = {
        "case_id": case_id,
        "verdict": risk_prediction["verdict"],
        "trust_score": risk_prediction["trust_score"],
        "risk_level": risk_prediction["risk_level"],
        "scam_probability": risk_prediction["scam_probability"],
        "genuine_probability": risk_prediction["genuine_probability"],
        "suspicious_probability": risk_prediction["suspicious_probability"],
        "confidence": risk_prediction["confidence"],
        "top_reasons": explanation["top_reasons"],
        "recommended_action": explanation["recommended_action"],
        "evidence_summary": evidence_summary,
        "extracted_evidence": evidence,
        "recruitment_dna": dna_comparison,
        "recruitment_pattern": dna_comparison.get("pattern_checklist") or dna_service.generate_recruitment_pattern(evidence, nlp_results, verification_details),
        "evidence_graph": graph_result,
        "verification_details": verification_details,
        "contradiction_findings": contradictions,
        "scam_network_findings": scam_links,
        "explainability": explanation["explainability"],
        "input_metadata": {
            "input_type": input_type,
            "raw_text_preview": mask_sensitive_info(extracted_text[:250]) if extracted_text else "",
            "file_info": file_metadata,
            "source_platform": source_type
        },
        "demo_mode": settings.DEMO_MODE,
        "created_at": created_at
    }

    # Associate case with logged-in user (if authenticated)
    auth_header = request.headers.get("authorization") if request else None
    user_info = extract_user_from_header(auth_header)
    if user_info:
        response_payload["user_id"] = user_info["user_id"]
        response_payload["username"] = user_info["username"]

    # Step 11: Save Case & Register Scam Indicators
    storage.save_case(case_id, response_payload)

    return response_payload

@router.get("/case/{case_id}", response_model=CaseAnalysisResponse)
async def get_case_details(case_id: str):
    case = storage.get_case(case_id)
    if not case:
        raise HTTPException(status_code=404, detail=f"Case with ID '{case_id}' not found.")
    return case

@router.get("/cases")
async def list_cases(request: Request = None, limit: int = 50, authorization: Optional[str] = Header(None)):
    """List cases. If authenticated, returns only the user's cases. Admins see all."""
    auth_header = authorization or (request.headers.get("authorization") if request else None)
    user_info = extract_user_from_header(auth_header)
    if user_info:
        if user_info.get("role") == "admin":
            return storage.list_cases(limit=limit)
        return storage.list_cases_by_user(user_info["user_id"], limit=limit)
    # Unauthenticated: return empty list (require login)
    return []

@router.get("/demo-cases")
async def list_demo_cases():
    return {
        key: {
            "key": key,
            "title": data["title"],
            "label": data["label"],
            "description": data["description"],
            "source_type": data["source_type"]
        }
        for key, data in DEMO_CASES.items()
    }
