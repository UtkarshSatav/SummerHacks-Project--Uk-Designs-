from pydantic import BaseModel
from typing import Optional, List
from datetime import date


class ProfileCreate(BaseModel):
    name: str
    skills: List[str]
    niche: str
    target_client: str
    location: Optional[str] = "India"
    experience: str  # "junior" | "mid" | "senior" | "expert"
    user_id: Optional[str] = None


class ClientCreate(BaseModel):
    name: str
    company: Optional[str] = None
    project_name: str
    project_status: str = "active"  # "active" | "stalled" | "completed"
    project_completion_pct: int = 0
    payment_status: str = "current"  # "current" | "overdue" | "at_risk"
    total_value: Optional[int] = None
    last_contact_date: date
    notes: Optional[str] = None


class LeadStatusUpdate(BaseModel):
    status: str  # "viewed" | "drafted" | "sent" | "archived"


class ProposalDraftRequest(BaseModel):
    lead_id: Optional[str] = None
    client_id: Optional[str] = None
    context: Optional[str] = None


class PricingRequest(BaseModel):
    project_description: str
    client_type: str  # "startup" | "smb" | "enterprise" | "individual"
