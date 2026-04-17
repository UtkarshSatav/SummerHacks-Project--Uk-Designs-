from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
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

class CatchAllMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        import traceback
        try:
            return await call_next(request)
        except Exception as e:
            print(f"[ERROR] {request.method} {request.url.path} → {type(e).__name__}: {e}")
            print(traceback.format_exc())
            return JSONResponse(status_code=500, content={"detail": str(e)})

# Order matters: CORSMiddleware added AFTER CatchAllMiddleware
# → CORSMiddleware becomes outermost, CatchAllMiddleware is inner
# → Exceptions caught by CatchAll return a JSONResponse that CORSMiddleware adds headers to
app.add_middleware(CatchAllMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
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


@app.get("/debug")
def debug():
    """Temporary debug endpoint — remove after fixing."""
    import traceback
    from database import get_supabase
    results = {}
    for table in ["profiles", "leads", "clients", "proposals", "daily_briefs"]:
        try:
            db = get_supabase()
            r = db.table(table).select("id").limit(1).execute()
            results[table] = f"ok ({len(r.data)} rows returned)"
        except Exception as e:
            results[table] = f"ERROR: {e}"
    return results
