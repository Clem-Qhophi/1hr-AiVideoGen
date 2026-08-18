"""Multi-provider LLM interface — supports OpenAI, Anthropic, Google, and any OpenAI-compatible API."""
import json
import requests
from .settings import load

SYSTEM_PROMPT = """You are a professional YouTube script writer for a news/review channel. Write narration scripts that are:

RESEARCH-BASED: You will be given web search results with CURRENT information. USE THEM.
Base your script on the facts, numbers, quotes, and events from the search results.
Do NOT make up facts, dates, or quotes. If the search results mention specific numbers, use them.
If the search results mention a specific person's quote, attribute it correctly.

CONVERSATIONAL: Write for the EAR, not the page. Short sentences. Natural flow.
No em-dashes (use periods or commas instead).

STRUCTURED: Include section markers as ## Section Name comments (not spoken).
Each section should be 10-20 seconds of narration (25-50 words).

VISUAL HINTS: After each section, add a comment line starting with > showing what visual
should appear. Examples:
> VISUAL: screenshot of [website name] homepage
> VISUAL: text card with key statistic
> VISUAL: comparison of [A] vs [B]
> VISUAL: zoom into [specific detail]

These visual hints tell the system what screenshots/animations to create.

Return the script in this format:
## Section Name
[spoken narration text]
> VISUAL: [what should appear on screen]

## Next Section
[more spoken narration]
> VISUAL: [what should appear]

Only include the ## headers, spoken text, and > VISUAL lines. Nothing else."""

DELIVERY_MODES = {
    "breaking-news": "Write with URGENCY. Short punchy sentences. Cliffhangers. Bold claims backed by the search results. This is breaking news. Target 160 words/minute. Every sentence should make the viewer want to keep watching.",
    "calm-explainer": "Write measured, clear, educational content. Walk the viewer through step by step. Cite sources. Target 140 words/minute.",
    "sarcastic-review": "Write dry, opinionated, with heat. Quote claims then dismantle them. Be witty but credible. Use the search results to find things to critique. Target 150 words/minute.",
    "authoritative": "Write confident, declarative, no hedging. State facts as facts. Cite sources from the search results. Target 145 words/minute.",
}

GOAL_PROMPTS = {
    "followers": "The goal is to gain followers. Include a 'follow for more' CTA around 30% through and at the end. Make the hook irresistible — the first 5 seconds must grab attention.",
    "watch-time": "The goal is watch time. Open a loop at the start, tease the payoff, deliver it at the end. No CTA until the end.",
    "authority": "The goal is authority and trust. Cite sources by name, show evidence, be measured. 'Subscribe for deep dives' at the end only.",
    "views": "The goal is views and CTR. Bold claims, controversy, a question in the title. Tease the thumbnail moment in the first 10 seconds.",
}


def generate_script(prompt: str, delivery_mode: str = "breaking-news",
                    goal: str = "followers", duration_minutes: int = 3,
                    web_context: str = "") -> str:
    s = load()
    provider = s.get("llm_provider", "openai")
    key = s.get("llm_api_key", "")
    model = s.get("llm_model", "gpt-4o")
    base_url = s.get("llm_base_url", "")

    if not key:
        return _fallback_script(prompt, delivery_mode, goal, duration_minutes, web_context)

    mode_instruction = DELIVERY_MODES.get(delivery_mode, DELIVERY_MODES["breaking-news"])
    goal_instruction = GOAL_PROMPTS.get(goal, GOAL_PROMPTS["followers"])
    word_target = duration_minutes * 150

    # Include web search context if available
    context_block = ""
    if web_context:
        context_block = f"""

=== CURRENT WEB SEARCH RESULTS (use these facts, not your training data) ===
{web_context}
=== END SEARCH RESULTS ===

Base your script on the ABOVE search results. Use real facts, real numbers, real quotes.
Do NOT invent information. If the search results have specific data, use it."""

    user_prompt = f"""Topic: {prompt}
Delivery mode: {delivery_mode}
Goal: {goal}
Target length: {duration_minutes} minutes (~{word_target} words)

{mode_instruction}
{goal_instruction}{context_block}

Write the full narration script now. Include > VISUAL hints after each section."""

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
        "max_tokens": 2000,
    }, timeout=120)
    r.raise_for_status()
    return r.json()["choices"][0]["message"]["content"]


def _call_anthropic(key: str, model: str, user_prompt: str) -> str:
    r = requests.post("https://api.anthropic.com/v1/messages", headers={
        "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json",
    }, json={
        "model": model or "claude-sonnet-4-20250514",
        "max_tokens": 2000,
        "system": SYSTEM_PROMPT,
        "messages": [{"role": "user", "content": user_prompt}],
    }, timeout=120)
    r.raise_for_status()
    return r.json()["content"][0]["text"]


def _call_google(key: str, model: str, user_prompt: str) -> str:
    model = model or "gemini-2.0-flash"
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={key}"
    r = requests.post(url, json={
        "contents": [{"parts": [{"text": SYSTEM_PROMPT + "\n\n" + user_prompt}]}],
        "generationConfig": {"temperature": 0.7, "maxOutputTokens": 2000},
    }, timeout=120)
    r.raise_for_status()
    return r.json()["candidates"][0]["content"]["parts"][0]["text"]


def _fallback_script(prompt: str, mode: str, goal: str, duration: int) -> str:
    """When no LLM key is set, return a simple template the user can edit."""
    return f"""## Hook
{prompt} — here's what you need to know.

## Context
This is a developing story. Let me break down what happened and why it matters.

## The details
[No LLM API key configured. Go to Settings to add one, or edit this script manually.]

## What it means
This changes things. Here's how.

## Outro
Follow for more updates.
"""
