from fastapi import APIRouter, Header
from typing import Optional
from services.seed_demo import seed_demo_data
from database import get_supabase
from routers.profile import get_profile_for_user

router = APIRouter()


@router.post("/demo")
def seed_demo(x_user_id: Optional[str] = Header(None)):
    db = get_supabase()
    profile = get_profile_for_user(db, x_user_id)
    if not profile:
        return {"error": "No profile found. Complete onboarding first."}
    result = seed_demo_data(profile["id"])
    return {"seeded": True, **result}
