from fastapi import APIRouter
from services.brief_generator import generate_brief
from database import get_supabase
from datetime import date

router = APIRouter()


@router.get("/daily")
def daily_brief():
    db = get_supabase()
    today = str(date.today())
    cached = db.table("daily_briefs").select("*").gte("generated_at", today).limit(1).execute()
    if cached.data:
        return cached.data[0]["content"]
    items = generate_brief()
    profile = db.table("profiles").select("id").limit(1).execute()
    if profile.data:
        db.table("daily_briefs").insert({
            "profile_id": profile.data[0]["id"],
            "content": items
        }).execute()
    return items
