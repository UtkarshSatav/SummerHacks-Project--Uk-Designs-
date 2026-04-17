from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from dotenv import load_dotenv

load_dotenv()

from routers import profile, leads, clients, proposals, pricing, brief, seed


# Background scheduler — scans Reddit every 30 minutes automatically
def _scheduled_scan():
    try:
        from services.reddit_monitor import scan_reddit
        from database import get_supabase
        db = get_supabase()
        profiles = db.table("profiles").select("*").limit(1).execute()
        if profiles.data:
            new_leads = scan_reddit(profiles.data[0])
            print(f"[Scheduler] Background scan complete: {len(new_leads)} new leads")
        else:
            print("[Scheduler] No profile found, skipping scan")
    except Exception as e:
        print(f"[Scheduler] Scan error: {e}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: launch background scheduler
    from apscheduler.schedulers.background import BackgroundScheduler
    scheduler = BackgroundScheduler()
    scheduler.add_job(_scheduled_scan, "interval", minutes=30, id="reddit_scan")
    scheduler.start()
    print("[Ghost] Background Reddit scanner started (every 30 min)")
    yield
    # Shutdown
    scheduler.shutdown()
    print("[Ghost] Scheduler stopped")


app = FastAPI(title="Ghost API", version="1.0.0", redirect_slashes=False, lifespan=lifespan)

import os

FRONTEND_URL = os.getenv("FRONTEND_URL", "")

allow_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://summer-hacks-project-uk-designs-zks.vercel.app",
]
if FRONTEND_URL and FRONTEND_URL not in allow_origins:
    allow_origins.append(FRONTEND_URL)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(profile.router, prefix="/profile", tags=["profile"])
app.include_router(leads.router, prefix="/leads", tags=["leads"])
app.include_router(clients.router, prefix="/clients", tags=["clients"])
app.include_router(proposals.router, prefix="/proposals", tags=["proposals"])
app.include_router(pricing.router, prefix="/pricing", tags=["pricing"])
app.include_router(brief.router, prefix="/brief", tags=["brief"])
app.include_router(seed.router, prefix="/seed", tags=["seed"])


@app.get("/health")
def health():
    return {"status": "ok", "service": "ghost-api"}
