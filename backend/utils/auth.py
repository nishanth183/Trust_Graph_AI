"""
Authentication utilities for TrustGraph AI.
Provides JWT token creation/validation and password hashing.
"""

import hashlib
import hmac
import secrets
import time
import json
import base64
import logging
from typing import Optional, Dict, Any

from backend.config import settings

logger = logging.getLogger("trustgraph.auth")

# Simple HMAC-SHA256 based JWT-like tokens (no external dependency needed)
TOKEN_EXPIRY_SECONDS = 86400  # 24 hours


def hash_password(password: str, salt: Optional[str] = None) -> tuple:
    """Hash a password with PBKDF2-HMAC-SHA256."""
    if salt is None:
        salt = secrets.token_hex(16)
    dk = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt.encode('utf-8'), 100000)
    return dk.hex(), salt


def verify_password(password: str, stored_hash: str, salt: str) -> bool:
    """Verify a password against stored hash."""
    computed_hash, _ = hash_password(password, salt)
    return hmac.compare_digest(computed_hash, stored_hash)


def create_token(user_id: str, role: str, username: str) -> str:
    """Create a signed token containing user info."""
    payload = {
        "user_id": user_id,
        "role": role,
        "username": username,
        "iat": int(time.time()),
        "exp": int(time.time()) + TOKEN_EXPIRY_SECONDS
    }
    payload_json = json.dumps(payload, separators=(',', ':'))
    payload_b64 = base64.urlsafe_b64encode(payload_json.encode()).decode()

    signature = hmac.new(
        settings.SECRET_KEY.encode('utf-8'),
        payload_b64.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()

    return f"{payload_b64}.{signature}"


def decode_token(token: str) -> Optional[Dict[str, Any]]:
    """Decode and verify a token. Returns payload dict or None if invalid."""
    try:
        parts = token.split(".")
        if len(parts) != 2:
            return None

        payload_b64, signature = parts

        expected_sig = hmac.new(
            settings.SECRET_KEY.encode('utf-8'),
            payload_b64.encode('utf-8'),
            hashlib.sha256
        ).hexdigest()

        if not hmac.compare_digest(signature, expected_sig):
            logger.warning("Token signature mismatch")
            return None

        payload_json = base64.urlsafe_b64decode(payload_b64).decode()
        payload = json.loads(payload_json)

        # Check expiry
        if payload.get("exp", 0) < int(time.time()):
            logger.info("Token expired")
            return None

        return payload

    except Exception as e:
        logger.error(f"Token decode error: {e}")
        return None


def extract_user_from_header(authorization: Optional[str]) -> Optional[Dict[str, Any]]:
    """Extract user info from Authorization header (Bearer token)."""
    if not authorization:
        return None
    if not authorization.startswith("Bearer "):
        return None
    token = authorization[7:]
    return decode_token(token)
