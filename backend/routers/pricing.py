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
    try:
        return analyse_pricing(body.project_description, body.client_type, profile)
    except Exception as e:
        print(f"[Pricing route] Returning fallback: {type(e).__name__}: {e}")
        # Return realistic fallback so the UI shows something instead of crashing
        niche = profile.get("niche", "freelance")
        exp = profile.get("experience", "mid")
        base = {"junior": 30000, "mid": 55000, "senior": 85000, "expert": 120000}.get(exp, 55000)
        client_mult = {"startup": 1.0, "smb": 1.1, "enterprise": 1.4, "individual": 0.8}.get(
            body.client_type, 1.0
        )
        mid = int(base * client_mult)
        return {
            "range_low": int(mid * 0.7),
            "range_mid": mid,
            "range_high": int(mid * 1.5),
            "recommended": mid,
            "justification": (
                f"Estimated based on {exp}-level {niche} rates for a {body.client_type} client. "
                "AI pricing is temporarily unavailable — these are indicative market rates."
            ),
            "framing": f"For this project I'd typically charge around ₹{mid:,}, which reflects the scope and my experience level.",
            "upsell": "Consider offering a 3-month support retainer to add 20–30% to the total value.",
            "red_flag": "AI service temporarily unavailable — verify OPENAI_API_KEY and OPENAI_BASE_URL on Render.",
        }
