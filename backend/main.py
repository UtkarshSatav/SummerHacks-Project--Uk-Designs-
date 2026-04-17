from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

from routers import profile, leads, clients, proposals, pricing, brief

app = FastAPI(title="Ghost API", version="1.0.0", redirect_slashes=False)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
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


@app.get("/health")
def health():
    return {"status": "ok", "service": "ghost-api"}
