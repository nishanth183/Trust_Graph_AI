import os
from pathlib import Path
from pydantic import BaseModel

BASE_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BASE_DIR.parent
DATA_DIR = PROJECT_ROOT / "data"
DEMO_DATA_DIR = DATA_DIR / "demo"
UPLOAD_DIR = BASE_DIR / "uploads"
REPORT_DIR = BASE_DIR / "reports"

UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
REPORT_DIR.mkdir(parents=True, exist_ok=True)
DEMO_DATA_DIR.mkdir(parents=True, exist_ok=True)

class Settings(BaseModel):
    PROJECT_NAME: str = "TRUSTGRAPH AI"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    DEMO_MODE: bool = os.getenv("DEMO_MODE", "true").lower() in ("true", "1", "yes")
    MONGODB_URI: str = os.getenv("MONGODB_URI", "mongodb://localhost:27017/trustgraph")
    NEO4J_URI: str = os.getenv("NEO4J_URI", "bolt://localhost:7687")
    NEO4J_USER: str = os.getenv("NEO4J_USER", "neo4j")
    NEO4J_PASSWORD: str = os.getenv("NEO4J_PASSWORD", "password")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "trustgraph-super-secret-key-2026")
    MAX_FILE_SIZE_MB: int = int(os.getenv("MAX_FILE_SIZE_MB", "15"))
    ALLOWED_EXTENSIONS: list[str] = [".png", ".jpg", ".jpeg", ".pdf", ".txt"]
    ALLOWED_IMAGE_TYPES: list[str] = ["image/png", "image/jpeg", "image/jpg"]
    ALLOWED_DOC_TYPES: list[str] = ["application/pdf", "text/plain"]
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "*"
    ]

settings = Settings()
