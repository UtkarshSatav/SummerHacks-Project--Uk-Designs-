import os
from dotenv import load_dotenv
from database import get_supabase
from datetime import datetime, timedelta

load_dotenv()

def seed_demo_data():
    db = get_supabase()
    
    print("Clearing existing data...")
    # Get existing profile
    profiles = db.table("profiles").select("id").execute().data
    if profiles:
        profile_id = profiles[0]["id"]
        # Clear existing
        db.table("daily_briefs").delete().eq("profile_id", profile_id).execute()
        db.table("proposals").delete().eq("profile_id", profile_id).execute()
        db.table("clients").delete().eq("profile_id", profile_id).execute()
        db.table("leads").delete().eq("profile_id", profile_id).execute()
    else:
        print("No profile found. Running bare minimum profile creation.")
        # Create a demo profile
        res = db.table("profiles").insert({
            "name": "Arjun",
            "niche": "UI/UX Design for SaaS",
            "skills": ["Figma", "React", "User Research", "Wireframing"],
            "target_client": "funded startups (Series A+)",
            "experience": "senior"
        }).execute()
        profile_id = res.data[0]["id"]

    print("Generating seed data...")
    
    # 1. Three demo clients
    now = datetime.now()
    clients = [
        {
            "profile_id": profile_id,
            "name": "Sarah Jenkins",
            "company": "GrowthPad",
            "project_name": "Web App Redesign",
            "project_status": "active",
            "project_completion_pct": 85,
            "payment_status": "current",
            "total_value": 250000,
            "last_contact_date": (now - timedelta(days=2)).date().isoformat(),
            "notes": "Loves dark mode, needs weekly updates."
        },
        {
            "profile_id": profile_id,
            "name": "David Chen",
            "company": "Fintech UI",
            "project_name": "Mobile Wallet App",
            "project_status": "active",
            "project_completion_pct": 30,
            "payment_status": "current",
            "total_value": 320000,
            "last_contact_date": (now - timedelta(days=8)).date().isoformat(),
            "notes": "Very busy, prefers async communication (Loom)."
        },
        {
            "profile_id": profile_id,
            "name": "Rahul Sharma",
            "company": "E-comm Builders",
            "project_name": "Checkout Flow Optimization",
            "project_status": "stalled",
            "project_completion_pct": 60,
            "payment_status": "overdue",
            "total_value": 150000,
            "last_contact_date": (now - timedelta(days=18)).date().isoformat(),
            "notes": "Waiting on content from their marketing team."
        }
    ]
    
    for c in clients:
        db.table("clients").insert(c).execute()
        
    # 2. Three mock leads (if scan isn't working fast enough)
    leads = [
        {
            "profile_id": profile_id,
            "platform": "reddit",
            "post_id": "seed1",
            "title": "Looking for a seasoned UI/UX designer for our B2B SaaS dashboard",
            "body": "We are a Series A startup needing a complete overhaul of our data analytics dashboard. Figma expertise required.",
            "author": "saas_founder_42",
            "url": "https://reddit.com/r/forhire",
            "subreddit": "forhire",
            "urgency": "high",
            "budget_signal": "implied",
            "reason": "Direct hiring request for B2B SaaS dashboard.",
            "hook": "Hey there, I specialize in B2B SaaS dashboards and would love to help overhaul yours.",
            "intent_score": 92
        },
        {
            "profile_id": profile_id,
            "platform": "reddit",
            "post_id": "seed2",
            "title": "How much should I pay for a landing page design?",
            "body": "Bootstrapping a new AI tool. Wondering what reasonable rates are for a high-converting landing page.",
            "author": "ai_builder",
            "url": "https://reddit.com/r/startups",
            "subreddit": "startups",
            "urgency": "medium",
            "budget_signal": "none",
            "reason": "Inquiry about pricing, potential for a gig.",
            "hook": "I've helped several AI tools bootstrap their landing pages, happy to share some pricing benchmarks.",
            "intent_score": 65
        },
        {
            "profile_id": profile_id,
            "platform": "reddit",
            "post_id": "seed3",
            "title": "Need someone to fix our onboarding flow, users are dropping off",
            "body": "Our conversion rate from signup to active user is terrible. Need a UX person to look at this ASAP.",
            "author": "desperate_pm",
            "url": "https://reddit.com/r/SaaS",
            "subreddit": "SaaS",
            "urgency": "high",
            "budget_signal": "none",
            "reason": "Urgent need to fix a specific UX problem.",
            "hook": "Onboarding drop-offs are painful, I recently fixed a similar issue for another SaaS.",
            "intent_score": 88
        }
    ]
    
    for l in leads:
        # Check if already exists to avoid duplicates
        existing = db.table("leads").select("id").eq("post_id", l["post_id"]).execute()
        if not existing.data:
            db.table("leads").insert(l).execute()

    print("Seed data successfully injected!")

if __name__ == "__main__":
    seed_demo_data()
