from supabase import create_client, Client
import os


def get_supabase() -> Client:
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_SERVICE_KEY")
    if not url or not key:
        raise RuntimeError("SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in .env")
    try:
        return create_client(url, key)
    except Exception as e:
        print(f"[DB ERROR] create_client failed: {type(e).__name__}: {e}")
        raise
