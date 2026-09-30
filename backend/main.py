import logging
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from backend.config import settings, UPLOAD_DIR
from backend.routes.analyze import router as analyze_router
from backend.routes.evidence import router as evidence_router
from backend.routes.verification import router as verification_router
from backend.routes.dna import router as dna_router
from backend.routes.graph import router as graph_router
from backend.routes.risk import router as risk_router
from backend.routes.reports import router as reports_router
from backend.routes.health import router as health_router

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("trustgraph.api")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="TrustGraph AI - AI-Based Fake Government Job & Recruitment Scam Detection System. 'We don't trust the message; we trust the evidence.'"
)

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled server error on {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal server error occurred in TrustGraph AI.", "error": str(exc)}
    )

# Include API Routers
app.include_router(analyze_router, prefix=settings.API_PREFIX)
app.include_router(evidence_router, prefix=settings.API_PREFIX)
app.include_router(verification_router, prefix=settings.API_PREFIX)
app.include_router(dna_router, prefix=settings.API_PREFIX)
app.include_router(graph_router, prefix=settings.API_PREFIX)
app.include_router(risk_router, prefix=settings.API_PREFIX)
app.include_router(reports_router, prefix=settings.API_PREFIX)
app.include_router(health_router, prefix=settings.API_PREFIX)

@app.get("/")
async def root():
    return {
        "system": settings.PROJECT_NAME,
        "tagline": "We don't trust the message; we trust the evidence.",
        "version": settings.VERSION,
        "documentation": "/docs",
        "demo_mode": settings.DEMO_MODE,
        "status": "OPERATIONAL"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=True)
