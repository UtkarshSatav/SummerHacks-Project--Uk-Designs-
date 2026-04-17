from fastapi import APIRouter
from models import PricingRequest
from services.pricing_engine import analyse_pricing
from database import get_supabase

router = APIRouter()


@router.post("/analyse")
def get_pricing(body: PricingRequest):
    db = get_supabase()
    profile = db.table("profiles").select("*").limit(1).execute()
    if not profile.data:
        return {"error": "No profile found"}
    return analyse_pricing(body.project_description, body.client_type, profile.data[0])
