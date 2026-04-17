from fastapi import APIRouter
from models import ProfileCreate
from database import get_supabase

router = APIRouter()


@router.get("/")
def get_profile():
    db = get_supabase()
    result = db.table("profiles").select("*").limit(1).execute()
    return result.data[0] if result.data else {}


@router.post("/")
def create_profile(body: ProfileCreate):
    db = get_supabase()
    existing = db.table("profiles").select("id").limit(1).execute()
    if existing.data:
        result = db.table("profiles").update(body.model_dump()).eq("id", existing.data[0]["id"]).execute()
    else:
        result = db.table("profiles").insert(body.model_dump()).execute()
    return result.data[0]
