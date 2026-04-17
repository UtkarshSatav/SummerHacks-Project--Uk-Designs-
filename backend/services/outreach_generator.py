from ai_client import get_ai_client
from database import get_supabase

FOLLOWUP_PROMPT = """
You are writing a follow-up message on behalf of {name}, a {niche} freelancer.

They previously sent this proposal to a Reddit post:
Subject: {original_subject}
---
{original_content}
---

It has been {days_since} days with no reply.

Write a SHORT follow-up message (under 80 words). Rules:
- Do NOT repeat the full pitch — they've already read it
- Reference ONE specific thing from the original proposal naturally
- Be human and slightly casual, not desperate
- End with a single soft question or CTA
- Sign off with {name}

Format:
Subject: Re: {original_subject}

<body>
"""

OUTREACH_PROMPT = """
You are writing a client re-engagement message on behalf of {name}, a {niche} freelancer.

Client: {client_name} ({company})
Project: {project_name} — {completion}% complete, status: {project_status}
Last contact: {days_since} days ago
Health flags: {flags}
Ghost's suggested action: {suggested_action}

Write a SHORT, genuine check-in message (under 100 words). Rules:
- Sound like a real person, not a CRM email
- Acknowledge the silence naturally (don't make it awkward)
- Reference the specific project by name
- Offer one concrete next step or ask one direct question
- Sign off with {name}

Format:
Subject: <subject line>

<body>
"""


def generate_followup(proposal_id: str, profile: dict) -> dict:
    db = get_supabase()
    proposal = db.table("proposals").select("*").eq("id", proposal_id).execute()
    if not proposal.data:
        return {"subject": "", "content": "Proposal not found."}
    p = proposal.data[0]

    from datetime import datetime
    created = datetime.fromisoformat(p["created_at"].replace("Z", "+00:00"))
    days_since = max(1, (datetime.now(created.tzinfo) - created).days)

    prompt = FOLLOWUP_PROMPT.format(
        name=profile.get("name", ""),
        niche=profile.get("niche", "freelancer"),
        original_subject=p.get("subject", ""),
        original_content=p.get("content", "")[:600],
        days_since=days_since,
    )

    response = get_ai_client().chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
    )
    full_text = response.choices[0].message.content.strip()
    lines = full_text.split("\n")
    subject = lines[0].replace("Subject:", "").strip() if lines[0].startswith("Subject:") else f"Re: {p.get('subject', '')}"
    body = "\n".join(lines[2:]).strip() if len(lines) > 2 else full_text
    return {"subject": subject, "content": body}


def generate_client_outreach(client: dict, profile: dict) -> dict:
    from datetime import date
    last_contact = client.get("last_contact_date", "")
    try:
        days_since = (date.today() - date.fromisoformat(str(last_contact)[:10])).days
    except Exception:
        days_since = 0

    flags = client.get("health_flags") or []
    prompt = OUTREACH_PROMPT.format(
        name=profile.get("name", ""),
        niche=profile.get("niche", "freelancer"),
        client_name=client.get("name", ""),
        company=client.get("company") or "their company",
        project_name=client.get("project_name", "the project"),
        completion=client.get("project_completion_pct", 0),
        project_status=client.get("project_status", "active"),
        days_since=days_since,
        flags=", ".join(flags) if flags else "none",
        suggested_action=client.get("suggested_action", ""),
    )

    response = get_ai_client().chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
    )
    full_text = response.choices[0].message.content.strip()
    lines = full_text.split("\n")
    subject = lines[0].replace("Subject:", "").strip() if lines[0].startswith("Subject:") else "Checking in"
    body = "\n".join(lines[2:]).strip() if len(lines) > 2 else full_text
    return {"subject": subject, "content": body}
