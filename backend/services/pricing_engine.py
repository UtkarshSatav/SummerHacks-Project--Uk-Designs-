from ai_client import get_ai_client
import json

PRICING_PROMPT = """
You are a freelance pricing expert with deep knowledge of Indian and global market rates.

Project: {description}
Client type: {client_type}
Freelancer niche: {niche}
Experience level: {experience}

Return JSON only:
{{
  "range_low": <INR number>,
  "range_mid": <INR number>,
  "range_high": <INR number>,
  "recommended": <INR number>,
  "justification": "<2 sentences explaining the recommended price>",
  "framing": "<exact sentence to use when presenting this price to the client>",
  "upsell": "<one additional service that would justify 20% more>",
  "red_flag": "<one thing in this brief that suggests you should charge more>"
}}
"""


def analyse_pricing(description: str, client_type: str, profile: dict) -> dict:
    prompt = PRICING_PROMPT.format(
        description=description,
        client_type=client_type,
        niche=profile.get("niche", ""),
        experience=profile.get("experience", "mid"),
    )

    response = get_ai_client().chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
    )

    raw = response.choices[0].message.content.strip()
    if raw.startswith("```"):
        lines = raw.split("\n")
        raw = "\n".join(lines[1:-1]) if len(lines) > 2 else raw

    return json.loads(raw)
