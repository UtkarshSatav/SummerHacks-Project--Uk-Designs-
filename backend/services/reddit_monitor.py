import json
import httpx
from ai_client import get_ai_client
from database import get_supabase

HEADERS = {"User-Agent": "ghost-app/1.0 (hackathon project)"}

# Base subreddits always included
BASE_SUBREDDITS = ["forhire", "freelance"]

# Niche keyword → extra subreddits to scan
NICHE_SUBREDDIT_MAP = {
    "web":        ["webdev", "reactjs", "javascript", "node", "vuejs", "nextjs"],
    "frontend":   ["webdev", "reactjs", "javascript", "css", "nextjs"],
    "backend":    ["webdev", "node", "django", "flask", "golang", "rust"],
    "fullstack":  ["webdev", "reactjs", "node", "javascript"],
    "design":     ["graphic_design", "UI_Design", "web_design", "logodesign", "branding"],
    "ux":         ["UI_Design", "UXDesign", "web_design", "userexperience"],
    "ui":         ["UI_Design", "web_design", "webdev"],
    "mobile":     ["iOSProgramming", "androiddev", "reactnative", "FlutterDev", "swift"],
    "ios":        ["iOSProgramming", "swift", "xcode"],
    "android":    ["androiddev", "kotlin", "java"],
    "flutter":    ["FlutterDev", "dartlang"],
    "data":       ["datascience", "MachineLearning", "learnpython", "statistics", "analytics"],
    "ml":         ["MachineLearning", "deeplearning", "datascience", "learnpython"],
    "ai":         ["MachineLearning", "artificial", "datascience", "ChatGPT"],
    "marketing":  ["marketing", "SEO", "PPC", "entrepreneur", "digital_marketing"],
    "seo":        ["SEO", "marketing", "bigseo"],
    "content":    ["freelanceWriters", "copywriting", "content_marketing", "writing"],
    "writing":    ["freelanceWriters", "copywriting", "writing", "blogs"],
    "video":      ["editors", "VideoEditing", "videography", "youtube"],
    "devops":     ["devops", "sysadmin", "aws", "docker", "kubernetes"],
    "cloud":      ["aws", "googlecloud", "azure", "devops", "sysadmin"],
    "saas":       ["SaaS", "entrepreneur", "startups", "indiehackers"],
    "startup":    ["startups", "entrepreneur", "indiehackers", "SaaS"],
    "ecommerce":  ["ecommerce", "shopify", "woocommerce", "Entrepreneur"],
    "wordpress":  ["Wordpress", "webdev", "PHP"],
    "shopify":    ["shopify", "ecommerce"],
    "default":    ["entrepreneur", "startups"],
}

# Keywords that indicate the POST AUTHOR is seeking to hire someone
HIRE_KEYWORDS = [
    "hiring", "looking for", "need a", "need an", "seeking",
    "help with", "budget", "paid", "project", "contract", "work with",
    "want to hire", "want someone", "looking to hire", "need help",
    "anyone available", "can someone", "who can", "looking for a",
]

# Title prefixes that mean the poster is OFFERING services (skip these)
OFFERING_PREFIXES = [
    "[for hire]", "[forhire]", "[h]", "[offer]", "[offering]",
    "for hire", "i offer", "i provide", "i build", "i create",
    "i develop", "i design", "i do ", "available for", "open for",
    "taking on", "taking clients", "freelance services",
]

BATCH_PROMPT = """
You are a lead qualification system for a freelancer.
Niche: {niche}
Target client: {target_client}
Skills: {skills}

Your job is to find posts where someone NEEDS TO HIRE a freelancer — NOT posts where someone is offering their own services.

IMMEDIATELY give score 0 to any post where:
- The author is offering/selling their own services (e.g. "[for hire]", "I build", "I offer", "taking clients")
- It is a self-promotion or portfolio post
- There is no actual hiring need expressed

Score 61-100 only when a client/company is clearly looking to pay someone to do work for them.

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
- 0: Poster is offering services (not a lead at all)
- 1-40: No real hiring intent
- 41-60: Vague interest / asking for advice
- 61-80: Clear need, good fit, looking to hire
- 81-100: Urgent, strong budget signal, ready to pay now
"""


def get_subreddits_for_profile(profile: dict) -> list:
    """Pick subreddits based on profile niche + skills."""
    niche = (profile.get("niche") or "").lower()
    skills = [s.lower() for s in (profile.get("skills") or [])]
    combined = niche + " " + " ".join(skills)

    extra = set()
    for keyword, subs in NICHE_SUBREDDIT_MAP.items():
        if keyword in combined:
            extra.update(subs)

    if not extra:
        extra.update(NICHE_SUBREDDIT_MAP["default"])

    # Combine base + niche-specific, deduplicate, limit to 6 total
    all_subs = list(dict.fromkeys(BASE_SUBREDDITS + list(extra)))
    return all_subs[:6]


def is_offering(title: str) -> bool:
    """Return True if the post author is offering their own services (not a lead)."""
    t = title.lower().strip()
    return any(t.startswith(prefix) or f" {prefix}" in t for prefix in OFFERING_PREFIXES)


def is_relevant(title: str, body: str) -> bool:
    """Return True if the post looks like someone seeking to hire."""
    if is_offering(title):
        return False
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
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
        )
        raw_text = response.choices[0].message.content.strip()
        # Strip markdown code fences if present
        if raw_text.startswith("```"):
            lines = raw_text.split("\n")
            raw_text = "\n".join(lines[1:-1]) if len(lines) > 2 else raw_text
        # Try to extract JSON array or object
        try:
            raw = json.loads(raw_text)
        except json.JSONDecodeError:
            import re
            match = re.search(r"\[.*\]", raw_text, re.DOTALL)
            if match:
                raw = json.loads(match.group())
            else:
                raise
        items = raw if isinstance(raw, list) else raw.get("results", raw.get("posts", []))
        return {item["id"]: item for item in items if "id" in item}
    except Exception as e:
        print(f"Batch scoring failed: {e}")
        return {}


def scan_reddit(profile: dict) -> list:
    db = get_supabase()
    new_leads = []

    subreddits = get_subreddits_for_profile(profile)
    print(f"Scanning subreddits for niche '{profile.get('niche', '')}': {subreddits}")

    candidates = []
    for sub_name in subreddits:
        for item in fetch_subreddit_posts(sub_name):
            post = item["data"]
            post_id = post.get("id", "")
            title = post.get("title", "")
            body = (post.get("selftext") or "")[:400]

            if not is_relevant(title, body):
                continue
            existing = db.table("leads").select("id").eq("post_id", post_id).eq("profile_id", profile["id"]).execute()
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
