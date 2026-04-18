from ai_client import get_ai_client
from database import get_supabase
from services.health_scorer import calculate_health
import json
import re

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


def generate_brief(profile: dict) -> list:
    db = get_supabase()
    profile_id = profile["id"]

    leads = db.table("leads").select("*").eq("profile_id", profile_id).eq("status", "new") \
        .order("intent_score", desc=True).limit(5).execute().data
    clients = db.table("clients").select("*").eq("profile_id", profile_id).execute().data
    proposals = db.table("proposals").select("*").eq("profile_id", profile_id).eq("status", "sent").execute().data

    client_summaries = []
    for c in clients:
        h = calculate_health(c)
        if h["health_status"] != "healthy":
            client_summaries.append(
                f"{c.get('name')}: {h['health_status']} — {h['health_flags'][0] if h['health_flags'] else 'check in'}"
            )

    lead_lines = "\n".join(
        f'  - Score {l["intent_score"]}: "{l["title"][:80]}" (r/{l.get("subreddit","?")})'
        for l in leads
    ) or "  - none"

    proposal_lines = "\n".join(
        f'  - "{p.get("subject","(no subject)")[:80]}"'
        for p in proposals[:5]
    ) or "  - none"

    state = f"""
Freelancer niche: {profile.get("niche", "general freelancer")}
Freelancer name: {profile.get("name", "User")}

New leads (sorted by intent score):
{lead_lines}

Client health alerts:
  {"; ".join(client_summaries) if client_summaries else "All clients healthy"}

Proposals awaiting reply ({len(proposals)} total):
{proposal_lines}
"""

    try:
        response = get_ai_client().chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": BRIEF_PROMPT.format(state_summary=state)}],
        )

        raw_text = response.choices[0].message.content.strip()
        if raw_text.startswith("```"):
            split = raw_text.split("\n")
            raw_text = "\n".join(split[1:-1]) if len(split) > 2 else raw_text

        try:
            raw = json.loads(raw_text)
        except json.JSONDecodeError:
            m = re.search(r"\[.*\]", raw_text, re.DOTALL)
            raw = json.loads(m.group()) if m else []

        if isinstance(raw, list):
            return raw
        for key in ["items", "brief", "tasks", "actions", "data", "results"]:
            if key in raw and isinstance(raw[key], list):
                return raw[key]
        for v in raw.values():
            if isinstance(v, list):
                return v
        return []

    except Exception as e:
        print(f"[Brief] AI call failed: {type(e).__name__}: {e}")
        # Build a contextual fallback from real DB data so the dashboard still shows something useful
        items = []
        if leads:
            top = leads[0]
            items.append({
                "priority": "URGENT",
                "action": f"Respond to \"{top['title'][:55]}\" on r/{top.get('subreddit', 'reddit')}",
                "reason": f"Score {top.get('intent_score', 0)} — high hiring intent, reply fast"
            })
        if len(leads) > 1:
            items.append({
                "priority": "TODAY",
                "action": f"Draft proposals for {len(leads)} new leads in your feed",
                "reason": "Early responses win more projects"
            })
        if proposals:
            items.append({
                "priority": "TODAY",
                "action": f"Follow up on {len(proposals)} sent proposal(s) with no reply yet",
                "reason": "A timely follow-up can double your response rate"
            })
        if client_summaries:
            items.append({
                "priority": "TODAY",
                "action": f"Address flagged client: {client_summaries[0][:70]}",
                "reason": "Proactive outreach prevents churn"
            })
        items.append({
            "priority": "THIS_WEEK",
            "action": "Run a Reddit scan for fresh opportunities in your niche",
            "reason": "Consistent prospecting prevents feast-or-famine cycles"
        })
        return items[:5]
