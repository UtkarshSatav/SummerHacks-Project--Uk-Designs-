from fastapi import APIRouter, Header
from typing import Optional
from services.brief_generator import generate_brief
from database import get_supabase
from routers.profile import get_profile_for_user
from datetime import date

router = APIRouter()


def _get_or_generate(db, profile, bust_cache: bool = False) -> list:
    today = str(date.today())
    if not bust_cache:
        cached = (
            db.table("daily_briefs").select("*")
            .gte("generated_at", today)
            .eq("profile_id", profile["id"])
            .limit(1).execute()
        )
        if cached.data:
            return cached.data[0]["content"]
    else:
        # Delete today's cached brief so a fresh one is generated
        db.table("daily_briefs").delete() \
            .eq("profile_id", profile["id"]) \
            .gte("generated_at", today).execute()

    items = generate_brief(profile)
    db.table("daily_briefs").insert({
        "profile_id": profile["id"],
        "content": items
    }).execute()
    return items


@router.get("/daily")
def daily_brief(x_user_id: Optional[str] = Header(None)):
    db = get_supabase()
    profile = get_profile_for_user(db, x_user_id)
    if not profile:
        return []
    try:
        return _get_or_generate(db, profile)
    except Exception as e:
        print(f"[Brief route] {type(e).__name__}: {e}")
        return []


@router.post("/refresh")
def refresh_brief(x_user_id: Optional[str] = Header(None)):
    db = get_supabase()
    profile = get_profile_for_user(db, x_user_id)
    if not profile:
        return []
    try:
        return _get_or_generate(db, profile, bust_cache=True)
    except Exception as e:
        print(f"[Brief refresh] {type(e).__name__}: {e}")
        return []
