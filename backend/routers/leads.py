from fastapi import APIRouter, BackgroundTasks, Header
from typing import Optional
from models import LeadStatusUpdate
from database import get_supabase
from routers.profile import get_profile_for_user

router = APIRouter()


def _get_profile_id(db, user_id: Optional[str]) -> Optional[str]:
    profile = get_profile_for_user(db, user_id)
    return profile["id"] if profile else None


@router.get("/")
def get_leads(x_user_id: Optional[str] = Header(None)):
    db = get_supabase()
    profile_id = _get_profile_id(db, x_user_id)
    if not profile_id:
        return []
    return (
        db.table("leads")
        .select("*")
        .eq("profile_id", profile_id)
        .neq("status", "archived")
        .neq("status", "sent")
        .order("intent_score", desc=True)
        .limit(50)
        .execute()
        .data
    )


def _run_scan(user_id: Optional[str] = None):
    from services.reddit_monitor import scan_reddit
    db = get_supabase()
    profile = get_profile_for_user(db, user_id)
    if profile:
        scan_reddit(profile)


@router.post("/scan")
def trigger_scan(background_tasks: BackgroundTasks, x_user_id: Optional[str] = Header(None)):
    db = get_supabase()
    profile = get_profile_for_user(db, x_user_id)
    if not profile:
        return {"error": "No profile set up. Complete onboarding first."}
    background_tasks.add_task(_run_scan, x_user_id)
    return {"scanning": True, "message": "Scan started in background"}


@router.get("/{lead_id}")
def get_lead(lead_id: str, x_user_id: Optional[str] = Header(None)):
    db = get_supabase()
    profile_id = _get_profile_id(db, x_user_id)
    query = db.table("leads").select("*").eq("id", lead_id)
    if profile_id:
        query = query.eq("profile_id", profile_id)
    result = query.execute()
    return result.data[0] if result.data else {}


@router.patch("/{lead_id}/status")
def update_lead_status(lead_id: str, body: LeadStatusUpdate, x_user_id: Optional[str] = Header(None)):
    db = get_supabase()
    profile_id = _get_profile_id(db, x_user_id)
    query = db.table("leads").update({"status": body.status}).eq("id", lead_id)
    if profile_id:
        query = query.eq("profile_id", profile_id)
    query.execute()
    return {"updated": True}
