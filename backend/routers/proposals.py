from fastapi import APIRouter
from models import ProposalDraftRequest
from services.proposal_drafter import draft_proposal
from database import get_supabase

router = APIRouter()


@router.post("/draft")
def create_draft(body: ProposalDraftRequest):
    result = draft_proposal(
        lead_id=body.lead_id,
        client_id=body.client_id,
        extra_context=body.context or ""
    )
    db = get_supabase()
    profile = db.table("profiles").select("id").limit(1).execute()
    if profile.data:
        db.table("proposals").insert({
            "profile_id": profile.data[0]["id"],
            "lead_id": body.lead_id,
            "client_id": body.client_id,
            "subject": result["subject"],
            "content": result["content"],
            "status": "draft"
        }).execute()
    return result
