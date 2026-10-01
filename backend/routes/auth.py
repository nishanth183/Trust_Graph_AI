"""
Authentication routes for TrustGraph AI.
Handles user registration, login, profile, and admin operations.
"""

import logging
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, HTTPException, Header, Request, status
from pydantic import BaseModel, Field

from backend.utils.auth import (
    hash_password,
    verify_password,
    create_token,
    extract_user_from_header
)
from backend.utils.storage import storage

logger = logging.getLogger("trustgraph.auth")

router = APIRouter(tags=["Authentication"])


# ─── Request / Response Models ────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=4, max_length=128)
    full_name: str = Field(..., min_length=1, max_length=100)
    email: Optional[str] = None
    role: str = Field(default="user", description="'user' or 'admin'")


class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    token: str
    user_id: str
    username: str
    full_name: str
    role: str


class UserProfile(BaseModel):
    user_id: str
    username: str
    full_name: str
    email: Optional[str]
    role: str
    created_at: str
    total_cases: int


# ─── Routes ───────────────────────────────────────────────────────────────────

@router.post("/auth/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(req: RegisterRequest):
    """Register a new user or admin account."""
    # Check if username already exists
    existing = storage.get_user_by_username(req.username)
    if existing:
        raise HTTPException(
            status_code=400,
            detail=f"Username '{req.username}' is already taken."
        )

    # Hash password
    pw_hash, salt = hash_password(req.password)

    # Create user record
    user_id = storage.generate_user_id()
    user_data = {
        "user_id": user_id,
        "username": req.username,
        "full_name": req.full_name,
        "email": req.email or "",
        "role": req.role,
        "password_hash": pw_hash,
        "salt": salt,
        "created_at": datetime.now().isoformat(),
        "is_active": True
    }

    storage.save_user(user_id, user_data)

    # Generate token
    token = create_token(user_id, req.role, req.username)

    logger.info(f"New user registered: {req.username} (role={req.role})")

    return TokenResponse(
        token=token,
        user_id=user_id,
        username=req.username,
        full_name=req.full_name,
        role=req.role
    )


@router.post("/auth/login", response_model=TokenResponse)
async def login(req: LoginRequest):
    """Authenticate user and return JWT token."""
    user = storage.get_user_by_username(req.username)
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid username or password."
        )

    if not verify_password(req.password, user["password_hash"], user["salt"]):
        raise HTTPException(
            status_code=401,
            detail="Invalid username or password."
        )

    if not user.get("is_active", True):
        raise HTTPException(
            status_code=403,
            detail="Account is deactivated."
        )

    token = create_token(user["user_id"], user["role"], user["username"])

    logger.info(f"User logged in: {req.username}")

    return TokenResponse(
        token=token,
        user_id=user["user_id"],
        username=user["username"],
        full_name=user["full_name"],
        role=user["role"]
    )


@router.get("/auth/profile", response_model=UserProfile)
async def get_profile(request: Request, authorization: Optional[str] = Header(None)):
    """Get the currently logged-in user's profile."""
    auth_header = authorization or request.headers.get("authorization")
    user_info = extract_user_from_header(auth_header)
    if not user_info:
        raise HTTPException(status_code=401, detail="Authentication required.")

    user = storage.get_user(user_info["user_id"])
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    # Count user's cases
    user_cases = storage.list_cases_by_user(user_info["user_id"])

    return UserProfile(
        user_id=user["user_id"],
        username=user["username"],
        full_name=user["full_name"],
        email=user.get("email", ""),
        role=user["role"],
        created_at=user["created_at"],
        total_cases=len(user_cases)
    )


# ─── Admin-Only Routes ───────────────────────────────────────────────────────

@router.get("/admin/users")
async def list_all_users(request: Request, authorization: Optional[str] = Header(None)):
    """Admin-only: List all registered users."""
    auth_header = authorization or request.headers.get("authorization")
    user_info = extract_user_from_header(auth_header)
    if not user_info or user_info.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required.")

    users = storage.list_users()
    # Remove sensitive fields
    safe_users = []
    for u in users:
        safe_users.append({
            "user_id": u["user_id"],
            "username": u["username"],
            "full_name": u["full_name"],
            "email": u.get("email", ""),
            "role": u["role"],
            "created_at": u["created_at"],
            "is_active": u.get("is_active", True),
            "total_cases": len(storage.list_cases_by_user(u["user_id"]))
        })

    return safe_users


@router.get("/admin/users/{user_id}/cases")
async def get_user_cases(user_id: str, request: Request, authorization: Optional[str] = Header(None)):
    """Admin-only: Get all cases for a specific user."""
    auth_header = authorization or request.headers.get("authorization")
    user_info = extract_user_from_header(auth_header)
    if not user_info or user_info.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required.")

    target_user = storage.get_user(user_id)
    if not target_user:
        raise HTTPException(status_code=404, detail=f"User '{user_id}' not found.")

    cases = storage.list_cases_by_user(user_id)
    return {
        "user": {
            "user_id": target_user["user_id"],
            "username": target_user["username"],
            "full_name": target_user["full_name"],
            "role": target_user["role"]
        },
        "cases": cases,
        "total": len(cases)
    }


@router.get("/admin/all-cases")
async def get_all_cases(request: Request, authorization: Optional[str] = Header(None), limit: int = 100):
    """Admin-only: Get all cases across all users."""
    auth_header = authorization or request.headers.get("authorization")
    user_info = extract_user_from_header(auth_header)
    if not user_info or user_info.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required.")

    cases = storage.list_cases(limit=limit)
    return cases
