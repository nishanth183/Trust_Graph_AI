import os
import json
from datetime import datetime
from typing import Optional, Any
import numpy as np
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Header, Request, status
from fastapi.responses import JSONResponse
from backend.utils.auth import extract_user_from_header, extract_user_from_request, decode_token

def sanitize_for_json(data: Any) -> Any:
    """Recursively converts all NumPy and custom scalar types to pure Python primitives."""
    if isinstance(data, dict):
        return {str(k): sanitize_for_json(v) for k, v in data.items()}
    elif isinstance(data, (list, tuple, set)):
        return [sanitize_for_json(item) for item in data]
    elif isinstance(data, (np.bool_, getattr(np, 'bool8', np.bool_))):
        return bool(data)
    elif isinstance(data, np.integer):
        return int(data)
    elif isinstance(data, np.floating):
        return float(data)
    elif isinstance(data, np.ndarray):
        return sanitize_for_json(data.tolist())
    elif hasattr(data, "item"):
        try:
            return sanitize_for_json(data.item())
        except Exception:
            pass
    return data

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
    token: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    authorization: Optional[str] = Header(None)
):
    """
    Unified multi-stage recruitment analysis pipeline.
    Accepts text, image, PDF, URL, or demo preset.
    """
    # Unpack Form defaults if called directly in Python tests
    if hasattr(source_type, "default"):
        source_type = source_type.default or "Other"
    if hasattr(demo_case_id, "default"):
        demo_case_id = demo_case_id.default or None
    if hasattr(text, "default"):
        text = text.default or None
    if hasattr(url, "default"):
        url = url.default or None
    if hasattr(token, "default"):
        token = token.default or None
    if hasattr(authorization, "default"):
        authorization = authorization.default or None

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
        is_image = any(file.filename.lower().endswith(ext) for ext in [".png", ".jpg", ".jpeg", ".webp", ".bmp"])
        input_type = "FILE_IMAGE" if is_image else "FILE_PDF"
        content_bytes = await file.read()
        validate_uploaded_file(file, content_bytes)

        # Run OCR / PDF Extractor (with RapidOCR)
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

        # Check visual indicators with visual_service
        try:
            visual_info = visual_service.analyze_document_visuals(content_bytes, file.filename)
            file_metadata["visual_analysis"] = visual_info
            if visual_info.get("qr_detected") and not qr_detected:
                qr_detected = True
        except Exception:
            pass

        # If OCR returned no text, synthesize informative note
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
        scam_links=scam_links,
        evidence=evidence
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

    analysis_id = f"ANL-{case_id}"
    extracted_org = evidence.get("organization") or "Unknown Organization"

    # Associate case with logged-in user (if authenticated)
    user_info = extract_user_from_request(request, authorization, token)
    user_id = user_info["user_id"] if user_info else "USR-ANONYMOUS"
    username = user_info["username"] if user_info else "anonymous"

    response_payload = {
        "case_id": case_id,
        "user_id": user_id,
        "username": username,
        "created_at": created_at,
        "input_type": input_type,
        "organization": extracted_org,
        "verdict": risk_prediction["verdict"],
        "trust_score": risk_prediction["trust_score"],
        "risk_level": risk_prediction["risk_level"],
        "analysis_id": analysis_id,
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
    }

    # Sanitize response payload to ensure all values are native JSON-serializable Python types
    response_payload = sanitize_for_json(response_payload)

    # Step 11: Save Case & Register Scam Indicators
    storage.save_case(case_id, response_payload)

    return response_payload

@router.get("/case/{case_id}", response_model=CaseAnalysisResponse)
async def get_case_details(
    case_id: str,
    request: Request = None,
    authorization: Optional[str] = Header(None)
):
    # 1. Check authentication
    user_info = extract_user_from_request(request, authorization)
    if not user_info:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required to view case details."
        )

    # 2. Find case
    case = storage.get_case(case_id)
    if not case:
        raise HTTPException(status_code=404, detail=f"Case with ID '{case_id}' not found.")

    # 3. Security check: User must own the case or be admin
    case_user_id = case.get("user_id")
    if user_info.get("role") != "admin" and case_user_id != user_info.get("user_id"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: You do not own this case."
        )

    # 4. Return case
    return case

@router.delete("/case/{case_id}")
async def delete_case(
    case_id: str,
    request: Request = None,
    authorization: Optional[str] = Header(None)
):
    # 1. Check authentication
    user_info = extract_user_from_request(request, authorization)
    if not user_info:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required to delete a case."
        )

    # 2. Find case
    case = storage.get_case(case_id)
    if not case:
        raise HTTPException(status_code=404, detail=f"Case with ID '{case_id}' not found.")

    # 3. Security check: User must own the case or be admin
    case_user_id = case.get("user_id")
    if user_info.get("role") != "admin" and case_user_id != user_info.get("user_id"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden: You cannot delete another user's case."
        )

    # 4. Delete case
    deleted = storage.delete_case(case_id)
    if not deleted:
        raise HTTPException(status_code=500, detail="Failed to delete case.")

    return {
        "status": "SUCCESS",
        "message": f"Case {case_id} deleted successfully."
    }

@router.get("/cases")
@router.get("/history")
async def list_cases(
    request: Request = None,
    limit: int = 50,
    all_cases: bool = False,
    authorization: Optional[str] = Header(None)
):
    """
    Returns only the authenticated user's verification history.
    Admin users can pass all_cases=True to view system-wide cases.
    """
    user_info = extract_user_from_request(request, authorization)
    if not user_info:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required to access case history."
        )

    if all_cases and user_info.get("role") == "admin":
        return storage.list_cases(limit=limit)

    return storage.list_cases_by_user(user_info["user_id"], limit=limit)

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
