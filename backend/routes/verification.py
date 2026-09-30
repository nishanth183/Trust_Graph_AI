from fastapi import APIRouter
from backend.schemas.requests import VerifyRequest
from backend.services.verification_service import verification_service, OFFICIAL_ORGANIZATIONS

router = APIRouter(tags=["Official Verification"])

@router.post("/verify")
async def verify_recruitment_credentials(request: VerifyRequest):
    evidence = {
        "organization": request.organization,
        "notification_number": request.notification_number,
        "domain": request.domain,
        "email": request.email,
        "upi_id": request.upi_id
    }
    results = verification_service.verify_recruitment(evidence)
    return {"verification": results}

@router.get("/official-registry")
async def list_official_registry():
    """Return the curated list of legitimate Indian government recruitment bodies and domains."""
    summary = []
    for key, data in OFFICIAL_ORGANIZATIONS.items():
        summary.append({
            "key": key,
            "organization": data["full_name"],
            "official_domains": data["official_domains"],
            "official_email_domains": data["official_email_domains"],
            "active_notifications_count": len(data["known_notifications"]),
            "sample_notifications": [n["notification_number"] for n in data["known_notifications"]]
        })
    return {"official_organizations": summary}
