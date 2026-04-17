from fastapi import APIRouter, Header
from typing import Optional
from models import ClientCreate
from services.health_scorer import calculate_health
from services.outreach_generator import generate_client_outreach
from database import get_supabase
from routers.profile import get_profile_for_user

router = APIRouter()


@router.get("/")
def get_clients(x_user_id: Optional[str] = Header(None)):
    db = get_supabase()
    profile = get_profile_for_user(db, x_user_id)
    if not profile:
        return []
    clients = db.table("clients").select("*").eq("profile_id", profile["id"]).execute().data
    for c in clients:
        health = calculate_health(c)
        c.update(health)
    return sorted(clients, key=lambda x: x.get("health_score", 100))


@router.post("/")
def add_client(body: ClientCreate, x_user_id: Optional[str] = Header(None)):
    db = get_supabase()
    profile = get_profile_for_user(db, x_user_id)
    if not profile:
        return {"error": "No profile found"}
    client_data = body.model_dump()
    client_data["profile_id"] = profile["id"]
    client_data["last_contact_date"] = str(client_data["last_contact_date"])
    health = calculate_health(client_data)
    client_data.update(health)
    result = db.table("clients").insert(client_data).execute()
    return result.data[0]


@router.post("/{client_id}/outreach")
def draft_outreach(client_id: str, x_user_id: Optional[str] = Header(None)):
    db = get_supabase()
    profile = get_profile_for_user(db, x_user_id)
    if not profile:
        return {"error": "No profile found"}
    result = db.table("clients").select("*").eq("id", client_id).eq("profile_id", profile["id"]).execute()
    if not result.data:
        return {"error": "Client not found"}
    client = result.data[0]
    health = calculate_health(client)
    client.update(health)
    return generate_client_outreach(client, profile)


@router.put("/{client_id}")
def update_client(client_id: str, body: dict):
    db = get_supabase()
    db.table("clients").update(body).eq("id", client_id).execute()
    updated = db.table("clients").select("*").eq("id", client_id).execute()
    if not updated.data:
        return {"error": "Not found"}
    client = updated.data[0]
    health = calculate_health(client)
    client.update(health)
    return client
