from fastapi import APIRouter, Header
from typing import Optional
from models import ProposalDraftRequest
from services.proposal_drafter import draft_proposal
from services.outreach_generator import generate_followup
from database import get_supabase
from routers.profile import get_profile_for_user
from pydantic import BaseModel

router = APIRouter()

class StatusUpdate(BaseModel):
    status: str

@router.post("/draft")
def create_draft(body: ProposalDraftRequest, x_user_id: Optional[str] = Header(None)):
    db = get_supabase()
    profile = get_profile_for_user(db, x_user_id)
    if not profile:
        return {"error": "No profile found. Complete onboarding first."}
    result = draft_proposal(
        lead_id=body.lead_id,
        client_id=body.client_id,
        extra_context=body.context or "",
        profile=profile,
    )
    if profile:
        # We need to return the draft ID to easily mark it as sent
        res = db.table("proposals").insert({
            "profile_id": profile["id"],
            "lead_id": body.lead_id,
            "client_id": body.client_id,
            "subject": result["subject"],
            "content": result["content"],
            "status": "draft"
        }).execute()
        if res.data:
            result["id"] = res.data[0]["id"]
    return result

@router.get("/sent")
def get_sent_proposals(x_user_id: Optional[str] = Header(None)):
    db = get_supabase()
    profile = get_profile_for_user(db, x_user_id)
    if not profile:
        return []
    proposals = (
        db.table("proposals")
        .select("id, subject, created_at, lead_id, leads(title, author, subreddit, intent_score, url)")
        .eq("profile_id", profile["id"])
        .eq("status", "sent")
        .order("created_at", desc=True)
        .limit(20)
        .execute()
        .data
    )
    return proposals


@router.post("/{proposal_id}/followup")
def draft_followup(proposal_id: str, x_user_id: Optional[str] = Header(None)):
    db = get_supabase()
    profile = get_profile_for_user(db, x_user_id)
    if not profile:
        return {"error": "No profile found"}
    return generate_followup(proposal_id, profile)


@router.patch("/{proposal_id}/status")
def update_status(proposal_id: str, body: StatusUpdate, x_user_id: Optional[str] = Header(None)):
    db = get_supabase()
    profile = get_profile_for_user(db, x_user_id)
    query = db.table("proposals").update({"status": body.status}).eq("id", proposal_id)
    if profile:
        query = query.eq("profile_id", profile["id"])
    query.execute()
    return {"updated": True}
