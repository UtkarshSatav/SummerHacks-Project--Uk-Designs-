import os
from openai import OpenAI


def get_ai_client() -> OpenAI:
    """Returns an OpenAI-compatible client, configured for Gemini if OPENAI_BASE_URL is set."""
    api_key = os.getenv("OPENAI_API_KEY")
    base_url = os.getenv("OPENAI_BASE_URL")

    if base_url:
        # Gemini's OpenAI-compatible endpoint — pass key explicitly, no extra headers
        return OpenAI(
            api_key=api_key,
            base_url=base_url,
            default_headers={},  # clear any injected auth headers that cause double-auth
        )
    return OpenAI(api_key=api_key)
