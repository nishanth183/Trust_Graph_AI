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

# HMAC-SHA256 based JWT-like tokens (30 days validity)
TOKEN_EXPIRY_SECONDS = 86400 * 30  # 30 days


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

        # Check expiry (allow 30 days validity window for signed tokens)
        exp = payload.get("exp", 0)
        iat = payload.get("iat", 0)
        # If token was created more than 30 days ago, expire it
        if iat and (int(time.time()) - iat) > (86400 * 30):
            logger.info("Token expired beyond 30 days")
            return None
        elif not iat and exp and exp < int(time.time()):
            logger.info("Token expired")
            return None

        return payload

    except Exception as e:
        logger.error(f"Token decode error: {e}")
        return None


def extract_user_from_header(authorization: Optional[Any]) -> Optional[Dict[str, Any]]:
    """Extract user info from Authorization header (Bearer token or raw token)."""
    if not authorization:
        return None
    if hasattr(authorization, "default"):
        authorization = authorization.default
    if not isinstance(authorization, str):
        return None
    auth_str = authorization.strip()
    if auth_str.lower().startswith("bearer "):
        token = auth_str[7:].strip()
        return decode_token(token)
    return decode_token(auth_str)


def extract_user_from_request(
    request: Optional[Any] = None,
    authorization: Optional[Any] = None,
    token: Optional[Any] = None
) -> Optional[Dict[str, Any]]:
    """Extract and verify authenticated user from Authorization header, token param, or query param."""
    if hasattr(authorization, "default"):
        authorization = authorization.default
    if hasattr(token, "default"):
        token = token.default

    header = authorization
    if not header and request and hasattr(request, "headers"):
        header = request.headers.get("authorization")
    user = extract_user_from_header(header)
    if user:
        return user

    if token and isinstance(token, str):
        user = decode_token(token)
        if user:
            return user

    if request and hasattr(request, "query_params"):
        q_token = request.query_params.get("token")
        if q_token:
            return decode_token(q_token)

    return None
