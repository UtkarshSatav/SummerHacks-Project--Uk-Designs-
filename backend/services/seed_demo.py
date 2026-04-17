"""Insert realistic demo data so the app looks alive on first load."""
from database import get_supabase
from datetime import date, timedelta


DEMO_LEADS = [
    {
        "platform": "reddit",
        "post_id": "demo_lead_001",
        "title": "[HIRING] Looking for a React + Tailwind developer for our SaaS dashboard — $3,000–5,000 budget",
        "body": "We're a funded B2B startup building a project management tool. Need someone to build out our analytics dashboard in React (we use Tailwind + shadcn). Timeline is 4–6 weeks. Serious applicants only — please share your portfolio.",
        "author": "techfounder_jay",
        "url": "https://reddit.com/r/forhire/comments/demo1",
        "subreddit": "forhire",
        "intent_score": 91,
        "urgency": "high",
        "budget_signal": "mentioned",
        "reason": "Explicit budget ($3–5k), funded startup, clear stack and timeline — strong match.",
        "hook": "I noticed you're using shadcn + Tailwind — I've shipped three SaaS dashboards with that exact stack, including one for a YC company.",
        "status": "new",
    },
    {
        "platform": "reddit",
        "post_id": "demo_lead_002",
        "title": "Need a freelance UI/UX designer for our mobile app redesign — long-term potential",
        "body": "Early-stage health tech startup, we have our MVP but the UX is rough. Looking for a designer who understands B2C mobile apps. Budget is flexible for the right person. We'd want to start with a discovery session.",
        "author": "healthapp_founder",
        "url": "https://reddit.com/r/forhire/comments/demo2",
        "subreddit": "forhire",
        "intent_score": 78,
        "urgency": "medium",
        "budget_signal": "implied",
        "reason": "Startup with real need, open budget, long-term relationship signal — worth pursuing.",
        "hook": "Health tech UX is a specialty of mine — I redesigned the onboarding flow for a wellness app that saw a 40% lift in day-7 retention.",
        "status": "new",
    },
    {
        "platform": "reddit",
        "post_id": "demo_lead_003",
        "title": "Seeking: Full-stack developer to help launch our e-commerce platform — urgent",
        "body": "We're launching in 6 weeks and our developer just backed out. Need someone who can jump in on a Next.js + Supabase stack. This is paid work, $80–100/hr. Please DM with availability.",
        "author": "ecom_urgent",
        "url": "https://reddit.com/r/webdev/comments/demo3",
        "subreddit": "webdev",
        "intent_score": 95,
        "urgency": "high",
        "budget_signal": "mentioned",
        "reason": "Urgent hire (dev backed out), explicit rate ($80–100/hr), Next.js + Supabase stack — perfect fit.",
        "hook": "I work in Next.js + Supabase daily — can jump in immediately and have worked on three e-commerce launches under tight deadlines.",
        "status": "new",
    },
    {
        "platform": "reddit",
        "post_id": "demo_lead_004",
        "title": "Looking for someone to help automate our reporting workflow — open to ideas",
        "body": "Small marketing agency, we spend 8+ hours a week manually pulling data from Google Ads, Facebook, and GA4 into spreadsheets. Would love to automate this. Not sure if this is a dev job or a no-code job. Budget TBD.",
        "author": "agency_owner_mk",
        "url": "https://reddit.com/r/entrepreneur/comments/demo4",
        "subreddit": "entrepreneur",
        "intent_score": 66,
        "urgency": "medium",
        "budget_signal": "none",
        "reason": "Clear pain point with a measurable problem — good lead for someone who does automation or data work.",
        "hook": "8 hours of manual reporting is exactly the kind of thing I've automated for agencies — usually saves the equivalent of a part-time hire.",
        "status": "new",
    },
    {
        "platform": "reddit",
        "post_id": "demo_lead_005",
        "title": "Need a WordPress developer to migrate our site and fix some performance issues",
        "body": "Our site is slow (4s load time on mobile) and we need to migrate from shared hosting to a VPS. Also want to modernize the design a bit. Not a huge project but looking for someone reliable.",
        "author": "smallbiz_wp",
        "url": "https://reddit.com/r/forhire/comments/demo5",
        "subreddit": "forhire",
        "intent_score": 60,
        "urgency": "low",
        "budget_signal": "none",
        "reason": "Specific, scoped work — smaller project but clear deliverables and a reliable client signal.",
        "hook": "4s mobile load time is usually fixable in a day — I've done 20+ WordPress performance audits and know exactly where to look first.",
        "status": "new",
    },
]


DEMO_CLIENTS = [
    {
        "name": "Priya Mehta",
        "company": "Finly Technologies",
        "project_name": "Dashboard Redesign",
        "project_status": "active",
        "project_completion_pct": 65,
        "payment_status": "current",
        "total_value": 280000,
        "last_contact_date": str(date.today() - timedelta(days=3)),
        "notes": "Phase 1 (data tables + charts) complete. Phase 2 is filters and export. She's responsive over Slack. Timeline end of month.",
    },
    {
        "name": "Rahul Bose",
        "company": "GrowthPilot",
        "project_name": "Mobile App MVP",
        "project_status": "stalled",
        "project_completion_pct": 40,
        "payment_status": "overdue",
        "total_value": 150000,
        "last_contact_date": str(date.today() - timedelta(days=18)),
        "notes": "Last spoke on a call 18 days ago. He went quiet after asking for a scope change. Invoice ₹50k overdue since last week. Need to follow up before it becomes a problem.",
    },
    {
        "name": "Sarah Chen",
        "company": "Nova Labs",
        "project_name": "Brand Identity & Website",
        "project_status": "completed",
        "project_completion_pct": 100,
        "payment_status": "current",
        "total_value": 120000,
        "last_contact_date": str(date.today() - timedelta(days=5)),
        "notes": "Project wrapped up last week. She was very happy with the results. Good candidate for a testimonial or referral. Also mentioned they'll need social media templates next quarter.",
    },
]


def seed_demo_data(profile_id: str) -> dict:
    db = get_supabase()
    leads_added = 0
    clients_added = 0

    for lead in DEMO_LEADS:
        # Don't duplicate
        exists = db.table("leads").select("id").eq("post_id", lead["post_id"]).execute()
        if not exists.data:
            db.table("leads").insert({**lead, "profile_id": profile_id}).execute()
            leads_added += 1

    for client in DEMO_CLIENTS:
        # Check by name + project (simple dedup)
        exists = db.table("clients").select("id") \
            .eq("name", client["name"]) \
            .eq("profile_id", profile_id).execute()
        if not exists.data:
            db.table("clients").insert({**client, "profile_id": profile_id}).execute()
            clients_added += 1

    return {"leads_added": leads_added, "clients_added": clients_added}
