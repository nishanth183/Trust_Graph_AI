import re
import os
from urllib.parse import urlparse
from fastapi import HTTPException, UploadFile
from backend.config import settings

def validate_uploaded_file(file: UploadFile, content_bytes: bytes):
    # Check file size
    max_bytes = settings.MAX_FILE_SIZE_MB * 1024 * 1024
    if len(content_bytes) > max_bytes:
        raise HTTPException(
            status_code=400,
            detail=f"File exceeds maximum allowed size of {settings.MAX_FILE_SIZE_MB}MB."
        )

    # Check extension
    filename = file.filename or ""
    ext = os.path.splitext(filename)[1].lower()
    if ext not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file format '{ext}'. Allowed extensions: {', '.join(settings.ALLOWED_EXTENSIONS)}"
        )

    # Magic byte checks for security
    if ext in [".png"] and not content_bytes.startswith(b"\x89PNG\r\n\x1a\n"):
        raise HTTPException(status_code=400, detail="Corrupted or invalid PNG file.")
    elif ext in [".jpg", ".jpeg"] and not (content_bytes.startswith(b"\xff\xd8") and content_bytes.rstrip().endswith(b"\xff\xd9")):
        # relaxed JPEG check (some cameras append metadata after end of image)
        if not content_bytes.startswith(b"\xff\xd8"):
            raise HTTPException(status_code=400, detail="Corrupted or invalid JPEG file.")
    elif ext in [".pdf"] and not content_bytes.startswith(b"%PDF-"):
        raise HTTPException(status_code=400, detail="Corrupted or invalid PDF file.")

def sanitize_url(raw_url: str) -> str:
    url = raw_url.strip()
    if not url.startswith(("http://", "https://")):
        url = "https://" + url

    parsed = urlparse(url)
    if not parsed.netloc:
        raise HTTPException(status_code=400, detail="Invalid URL format.")
    
    # Block internal IP addresses and loopback schemes
    netloc_lower = parsed.netloc.lower()
    if netloc_lower.startswith(("localhost", "127.", "192.168.", "10.", "172.16.")):
        raise HTTPException(status_code=400, detail="Access to private or local loopback IP ranges is disallowed.")

    return url

def mask_sensitive_info(text: str) -> str:
    """Mask phone numbers and email usernames partially for user privacy."""
    # Mask phone: +91 9876543210 -> +91 98765***10
    def mask_phone_match(match):
        p = match.group(0)
        if len(p) >= 10:
            return p[:4] + "***" + p[-3:]
        return p

    text = re.sub(r'(\+?91[\-\s]?)?[6-9]\d{9}', mask_phone_match, text)

    # Mask email: someone@gmail.com -> s***e@gmail.com
    def mask_email_match(match):
        user, domain = match.group(1), match.group(2)
        if len(user) > 2:
            return user[0] + "***" + user[-1] + "@" + domain
        return user[0] + "***@" + domain

    text = re.sub(r'([a-zA-Z0-9_.+-]+)@([a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+)', mask_email_match, text)
    return text
