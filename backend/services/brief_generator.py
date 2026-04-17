from ai_client import get_ai_client
from database import get_supabase
from services.health_scorer import calculate_health
import json

BRIEF_PROMPT = """
You are the Chief of Staff for a solo freelancer. Write their morning brief.
Be specific, direct, and prioritised. No fluff.

Current state:
{state_summary}

Output exactly 5 bullet points ranked by urgency.
Return JSON array only — no wrapper object:
[
  {{"priority": "URGENT|TODAY|THIS_WEEK", "action": "<specific thing to do>", "reason": "<one-line why>"}},
  ...
]
"""


def generate_brief() -> list:
    db = get_supabase()
    profile_result = db.table("profiles").select("*").limit(1).execute()
    if not profile_result.data:
        return []
    profile = profile_result.data[0]

    leads = db.table("leads").select("*").eq("status", "new") \
        .order("intent_score", desc=True).limit(5).execute().data
    clients = db.table("clients").select("*").execute().data
    proposals = db.table("proposals").select("*").eq("status", "sent").execute().data

    client_summaries = []
    for c in clients:
        h = calculate_health(c)
        if h["health_status"] != "healthy":
            client_summaries.append(
                f"{c.get('name')}: {h['health_status']} — {h['health_flags'][0] if h['health_flags'] else 'check in'}"
            )

    top_lead = f'"{leads[0]["title"][:80]}"' if leads else "none"
    state = f"""
New leads detected: {len(leads)} (top score: {leads[0]["intent_score"] if leads else "N/A"})
Top lead: {top_lead}
Client alerts: {"; ".join(client_summaries) if client_summaries else "All clients healthy"}
Proposals awaiting reply: {len(proposals)}
Freelancer niche: {profile.get("niche", "")}
"""

    response = get_ai_client().chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": BRIEF_PROMPT.format(state_summary=state)}],
        response_format={"type": "json_object"},
    )

    raw = json.loads(response.choices[0].message.content)
    # Handle both array and wrapped object responses
    if isinstance(raw, list):
        return raw
    return raw.get("items", raw.get("brief", []))
