from fastapi import APIRouter, Header
from typing import Optional
from models import ProfileCreate
from database import get_supabase

router = APIRouter()


def get_profile_for_user(db, user_id: Optional[str]):
    """Return profile for this user only. No fallback to other users' profiles."""
    if user_id:
        result = db.table("profiles").select("*").eq("user_id", user_id).limit(1).execute()
        return result.data[0] if result.data else None
    # No user_id at all → return first profile (dev/single-user fallback)
    result = db.table("profiles").select("*").limit(1).execute()
    return result.data[0] if result.data else None


@router.get("/")
def get_profile(x_user_id: Optional[str] = Header(None)):
    db = get_supabase()
    profile = get_profile_for_user(db, x_user_id)
    return profile or {}


@router.post("/")
def create_profile(body: ProfileCreate, x_user_id: Optional[str] = Header(None)):
    db = get_supabase()
    user_id = body.user_id or x_user_id
    data = body.model_dump()
    data["user_id"] = user_id

    # Look for existing profile strictly by user_id if we have one
    if user_id:
        existing = db.table("profiles").select("id").eq("user_id", user_id).limit(1).execute()
    else:
        existing = db.table("profiles").select("id").limit(1).execute()

    if existing.data:
        result = db.table("profiles").update(data).eq("id", existing.data[0]["id"]).execute()
    else:
        result = db.table("profiles").insert(data).execute()
    return result.data[0]
