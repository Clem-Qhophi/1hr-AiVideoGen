"""Prompt improver — enhances a rough prompt into a detailed, production-ready one.

Takes the user's brief prompt, searches the web for current information, and
makes it specific, structured, and optimized for video generation.
"""
from . import settings
from . import web_search
import requests


SYSTEM_PROMPT = """You are a video script strategist. The user will give you a rough prompt
for a video they want to generate. Your job is to enhance it into a detailed,
production-ready prompt that will produce the best possible video.

An enhanced prompt should include:
1. **The angle** — what's the most interesting take on this topic?
2. **Key points to cover** — 3-5 specific things the video should talk about
3. **Tone** — how it should feel (urgent, analytical, opinionated, etc.)
4. **Structure** — hook, context, details, verdict
5. **What NOT to include** — common mistakes to avoid

Return ONLY the enhanced prompt text, nothing else. Keep it concise but specific."""


def improve_prompt(raw_prompt: str, delivery_mode: str = "breaking-news",
                   goal: str = "followers") -> str:
    """Enhance a rough prompt into a production-ready one."""
    s = settings.load()
    provider = s.get("llm_provider", "openai")
    key = s.get("llm_api_key", "")
    model = s.get("llm_model", "gpt-4o")
    base_url = s.get("llm_base_url", "")

    if not key:
        # no LLM key — return the raw prompt with basic enhancement hints
        return f"{raw_prompt}\n\n[Note: Add an LLM API key in Settings for better prompt enhancement.]"

    # Search the web for current information about the topic
    try:
        research = web_search.research_topic(raw_prompt, max_results=3)
        web_context = research.get("summary", "")[:2000]
    except Exception:
        web_context = ""

    context_block = ""
    if web_context:
        context_block = f"\n\n=== CURRENT WEB RESULTS ===\n{web_context}\n=== END ===\n\nUse the above search results to make the prompt specific and factual."

    user_prompt = f"""Rough prompt: {raw_prompt}
Delivery mode: {delivery_mode}
Goal: {goal}{context_block}

Enhance this prompt for a {delivery_mode} video aimed at {goal}. Make it specific with real facts from the search results."""

    if provider == "anthropic":
        return _call_anthropic(key, model, user_prompt)
    elif provider == "google":
        return _call_google(key, model, user_prompt)
    else:
        return _call_openai(key, model, user_prompt, base_url)


def _call_openai(key: str, model: str, user_prompt: str, base_url: str = "") -> str:
    url = (base_url or "https://api.openai.com/v1").rstrip("/") + "/chat/completions"
    r = requests.post(url, headers={"Authorization": f"Bearer {key}"}, json={
        "model": model,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ],
        "temperature": 0.7,
        "max_tokens": 800,
    }, timeout=60)
    r.raise_for_status()
    return r.json()["choices"][0]["message"]["content"].strip()


def _call_anthropic(key: str, model: str, user_prompt: str) -> str:
    r = requests.post("https://api.anthropic.com/v1/messages", headers={
        "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json",
    }, json={
        "model": model or "claude-sonnet-4-20250514",
        "max_tokens": 800,
        "system": SYSTEM_PROMPT,
        "messages": [{"role": "user", "content": user_prompt}],
    }, timeout=60)
    r.raise_for_status()
    return r.json()["content"][0]["text"].strip()


def _call_google(key: str, model: str, user_prompt: str) -> str:
    model = model or "gemini-2.0-flash"
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={key}"
    r = requests.post(url, json={
        "contents": [{"parts": [{"text": SYSTEM_PROMPT + "\n\n" + user_prompt}]}],
        "generationConfig": {"temperature": 0.7, "maxOutputTokens": 800},
    }, timeout=60)
    r.raise_for_status()
    return r.json()["candidates"][0]["content"]["parts"][0]["text"].strip()
