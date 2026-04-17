from fastapi import APIRouter
from models import ClientCreate
from services.health_scorer import calculate_health
from database import get_supabase

router = APIRouter()


@router.get("/")
def get_clients():
    db = get_supabase()
    clients = db.table("clients").select("*").execute().data
    for c in clients:
        health = calculate_health(c)
        c.update(health)
    return sorted(clients, key=lambda x: x.get("health_score", 100))


@router.post("/")
def add_client(body: ClientCreate):
    db = get_supabase()
    profile = db.table("profiles").select("id").limit(1).execute()
    if not profile.data:
        return {"error": "No profile found"}
    client_data = body.model_dump()
    client_data["profile_id"] = profile.data[0]["id"]
    client_data["last_contact_date"] = str(client_data["last_contact_date"])
    health = calculate_health(client_data)
    client_data.update(health)
    result = db.table("clients").insert(client_data).execute()
    return result.data[0]


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
