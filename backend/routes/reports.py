import os
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse, HTMLResponse
from backend.utils.storage import storage
from backend.utils.pdf_generator import report_generator
from backend.schemas.requests import ReportFeedbackRequest

router = APIRouter(tags=["Reports & Feedback"])

@router.post("/report")
async def submit_case_feedback(feedback: ReportFeedbackRequest):
    case = storage.get_case(feedback.case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Case ID not found.")

    storage._record_audit("USER_FEEDBACK_SUBMITTED", {
        "case_id": feedback.case_id,
        "user_verdict": feedback.user_verdict,
        "notes": feedback.feedback_notes
    })
    return {"status": "SUCCESS", "message": f"Feedback registered for case {feedback.case_id}."}

@router.get("/report/{case_id}/view", response_class=HTMLResponse)
async def view_report_online(case_id: str):
    case = storage.get_case(case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found.")
    report_file = report_generator.generate_html_report(case)
    with open(report_file, "r", encoding="utf-8") as f:
        return f.read()

@router.get("/report/{case_id}/download")
async def download_report_file(case_id: str):
    case = storage.get_case(case_id)
    if not case:
        raise HTTPException(status_code=404, detail="Case not found.")
    report_file = report_generator.generate_html_report(case)
    return FileResponse(
        report_file,
        media_type="text/html",
        filename=f"TrustGraph_Report_{case_id}.html"
    )
