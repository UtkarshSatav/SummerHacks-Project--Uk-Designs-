import json
import httpx
from ai_client import get_ai_client
from database import get_supabase

SUBREDDITS = ["forhire", "entrepreneur", "startups", "freelance"]
HEADERS = {"User-Agent": "ghost-app/1.0 (hackathon project)"}

HIRE_KEYWORDS = [
    "hire", "hiring", "looking for", "need a", "need an", "seeking",
    "freelancer", "developer", "designer", "help with", "budget",
    "paid", "project", "contract", "remote", "work with",
]

BATCH_PROMPT = """
You are a lead qualification system for a freelancer.
Niche: {niche}
Target client: {target_client}
Skills: {skills}

Score each Reddit post 0-100 for hiring intent and return results.

Posts:
{posts_block}

Return a JSON array — one object per post, in the same order:
[
  {{
    "id": "<post_id>",
    "score": <0-100>,
    "urgency": "low|medium|high",
    "budget_signal": "mentioned|implied|none",
    "reason": "<one sentence why this is or isn't a good lead>",
    "hook": "<personalized outreach opening line, 1 sentence, human tone>"
  }}
]

Score guide:
- 0-40: No real hiring intent
- 41-60: Vague interest
- 61-80: Clear need, good fit
- 81-100: Urgent, strong budget signal
"""


def is_relevant(title: str, body: str) -> bool:
    text = (title + " " + body).lower()
    return any(kw in text for kw in HIRE_KEYWORDS)


def fetch_subreddit_posts(subreddit: str, limit: int = 15) -> list:
    url = f"https://www.reddit.com/r/{subreddit}/new.json?limit={limit}"
    try:
        resp = httpx.get(url, headers=HEADERS, timeout=10)
        resp.raise_for_status()
        return resp.json()["data"]["children"]
    except Exception as e:
        print(f"Failed to fetch r/{subreddit}: {e}")
        return []


def score_batch(posts: list, profile: dict) -> dict:
    """Score a batch of posts in a single AI call. Returns {post_id: result}."""
    if not posts:
        return {}

    posts_block = "\n\n".join(
        f"[{p['id']}]\nTitle: {p['title']}\nBody: {p['body'][:300]}"
        for p in posts
    )

    prompt = BATCH_PROMPT.format(
        niche=profile.get("niche", ""),
        target_client=profile.get("target_client", ""),
        skills=", ".join(profile.get("skills", [])),
        posts_block=posts_block,
    )

    try:
        response = get_ai_client().chat.completions.create(
            model="llama-3.3-70b-versatile",   # higher TPM limit than 8b-instant
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"},
        )
        raw = json.loads(response.choices[0].message.content)
        # Handle both array and wrapped responses
        items = raw if isinstance(raw, list) else raw.get("results", raw.get("posts", []))
        return {item["id"]: item for item in items if "id" in item}
    except Exception as e:
        print(f"Batch scoring failed: {e}")
        return {}


def scan_reddit(profile: dict) -> list:
    db = get_supabase()
    new_leads = []

    # Collect all unseen, relevant posts across subreddits first
    candidates = []
    for sub_name in SUBREDDITS:
        for item in fetch_subreddit_posts(sub_name):
            post = item["data"]
            post_id = post.get("id", "")
            title = post.get("title", "")
            body = (post.get("selftext") or "")[:400]

            if not is_relevant(title, body):
                continue
            existing = db.table("leads").select("id").eq("post_id", post_id).execute()
            if existing.data:
                continue

            candidates.append({
                "id": post_id,
                "title": title,
                "body": body,
                "author": post.get("author", "unknown"),
                "url": f"https://reddit.com{post.get('permalink', '')}",
                "subreddit": sub_name,
                "full_body": (post.get("selftext") or "")[:1000],
            })

    if not candidates:
        print("No new relevant posts found.")
        return []

    print(f"Scoring {len(candidates)} candidates in one batch call...")

    # Score all candidates in a single AI call
    scores = score_batch(candidates, profile)

    for post in candidates:
        result = scores.get(post["id"])
        if not result or result.get("score", 0) < 55:
            continue

        lead = {
            "profile_id": profile["id"],
            "platform": "reddit",
            "post_id": post["id"],
            "title": post["title"],
            "body": post["full_body"],
            "author": post["author"],
            "url": post["url"],
            "subreddit": post["subreddit"],
            "intent_score": result.get("score", 0),
            "urgency": result.get("urgency", "low"),
            "budget_signal": result.get("budget_signal", "none"),
            "reason": result.get("reason", ""),
            "hook": result.get("hook", ""),
            "status": "new",
        }
        db.table("leads").insert(lead).execute()
        new_leads.append(lead)

    print(f"Scan complete — {len(new_leads)} new leads saved.")
    return new_leads
