from ai_client import get_ai_client
from database import get_supabase

PROPOSAL_PROMPT = """
You are writing a freelance proposal on behalf of {name}, a {experience} {niche} specialist.
Their skills: {skills}

They are responding to this opportunity:
Platform: {platform}
Post title: {title}
Post content: {body}

Extra context from the user (CRITICAL - YOU MUST INTEGRATE THIS INTO THE PROPOSAL IF IT EXISTS):
{extra_context}

Write a SHORT, genuine proposal (no "[Your Name]" placeholders — use their actual name).
If the extra context includes pricing or a recommended price, you MUST explicitly state that price and its justification in the proposal.
Tone: professional but human. Like a smart freelancer wrote it, not a bot.

Format:
Subject: <compelling subject line>

<opening hook — reference something specific from their post>
<2-3 sentences about relevant experience, be specific>
<what you would do for them — concrete, not vague>
<estimated pricing details — explicitly state the estimated rate and justification IF pricing is provided in the extra context>
<soft CTA — offer a quick call or ask a clarifying question>
<sign off with {name}>

Keep it under 200 words. No buzzwords.
"""


def draft_proposal(lead_id: str = None, client_id: str = None, extra_context: str = "", profile: dict = None) -> dict:
    db = get_supabase()
    if not profile:
        # Fallback — should not happen in normal flow
        result = db.table("profiles").select("*").limit(1).execute()
        if not result.data:
            return {"subject": "Proposal", "content": ""}
        profile = result.data[0]

    context = {}
    if lead_id:
        lead = db.table("leads").select("*").eq("id", lead_id).execute().data[0]
        context = {
            "platform": lead.get("platform", "reddit"),
            "title": lead.get("title", ""),
            "body": lead.get("body", "")[:800],
        }
    elif client_id:
        cl = db.table("clients").select("*").eq("id", client_id).execute().data[0]
        context = {
            "platform": "direct client",
            "title": f"Phase 2 proposal for {cl.get('project_name', 'project')}",
            "body": cl.get("notes") or f"Ongoing project: {cl.get('project_name', '')}",
        }
    else:
        context = {
            "platform": "direct",
            "title": extra_context or "New opportunity",
            "body": extra_context or "",
        }

    prompt = PROPOSAL_PROMPT.format(
        name=profile.get("name", ""),
        experience=profile.get("experience", "senior"),
        niche=profile.get("niche", ""),
        skills=", ".join(profile.get("skills", [])),
        extra_context=extra_context if extra_context else "None provided.",
        **context,
    )

    response = get_ai_client().chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
    )

    full_text = response.choices[0].message.content.strip()
    lines = full_text.split("\n")
    subject = lines[0].replace("Subject:", "").strip() if lines and lines[0].startswith("Subject:") else "Proposal"
    body_text = "\n".join(lines[2:]).strip() if len(lines) > 2 else full_text

    return {"subject": subject, "content": body_text}
