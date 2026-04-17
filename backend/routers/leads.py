from fastapi import APIRouter, BackgroundTasks
from models import LeadStatusUpdate
from database import get_supabase

router = APIRouter()


@router.get("/")
def get_leads():
    db = get_supabase()
    result = db.table("leads").select("*") \
        .neq("status", "archived") \
        .order("intent_score", desc=True) \
        .limit(50) \
        .execute()
    return result.data


def _run_scan():
    from services.reddit_monitor import scan_reddit
    db = get_supabase()
    profiles = db.table("profiles").select("*").limit(1).execute()
    if profiles.data:
        scan_reddit(profiles.data[0])


@router.post("/scan")
def trigger_scan(background_tasks: BackgroundTasks):
    db = get_supabase()
    profiles = db.table("profiles").select("id").limit(1).execute()
    if not profiles.data:
        return {"error": "No profile set up. Complete onboarding first."}
    background_tasks.add_task(_run_scan)
    return {"scanning": True, "message": "Scan started in background"}


@router.get("/{lead_id}")
def get_lead(lead_id: str):
    db = get_supabase()
    result = db.table("leads").select("*").eq("id", lead_id).execute()
    return result.data[0] if result.data else {}


@router.patch("/{lead_id}/status")
def update_lead_status(lead_id: str, body: LeadStatusUpdate):
    db = get_supabase()
    db.table("leads").update({"status": body.status}).eq("id", lead_id).execute()
    return {"updated": True}
