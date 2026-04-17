from fastapi import APIRouter, Header
from typing import Optional
from models import PricingRequest
from services.pricing_engine import analyse_pricing
from database import get_supabase
from routers.profile import get_profile_for_user

router = APIRouter()


@router.post("/analyse")
def get_pricing(body: PricingRequest, x_user_id: Optional[str] = Header(None)):
    db = get_supabase()
    profile = get_profile_for_user(db, x_user_id)
    if not profile:
        return {"error": "No profile found"}
    return analyse_pricing(body.project_description, body.client_type, profile)
