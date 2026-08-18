"""Settings management — API keys and configuration stored in .app_settings.json.
Falls back to .env file at repo root for keys not set in the app settings."""
import json
import os
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SETTINGS_FILE = ROOT / ".app_settings.json"
ENV_FILE = ROOT / ".env"

DEFAULTS = {
    "llm_provider": "openai",
    "llm_api_key": "",
    "llm_model": "gpt-4o",
    "llm_base_url": "",
    "elevenlabs_api_key": "",
    "gemini_api_key": "",
    "default_voice": "onwK4e9ZLuTAKqWW03F9",
    "default_delivery_mode": "breaking-news",
    "default_goal": "followers",
}


def _load_env() -> dict:
    """Read keys from .env file (if it exists) as fallback."""
    env = {}
    if ENV_FILE.exists():
        for line in ENV_FILE.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if line.startswith("#") or "=" not in line:
                continue
            k, v = line.split("=", 1)
            k = k.strip()
            v = v.strip().strip('"').strip("'")
            if v:
                env[k.lower()] = v
    return env


def load() -> dict:
    env_fallback = _load_env()
    if SETTINGS_FILE.exists():
        s = json.loads(SETTINGS_FILE.read_text(encoding="utf-8"))
    else:
        s = {}
    merged = {**DEFAULTS, **env_fallback, **s}
    # app settings override .env; but if app setting is empty, fall back to .env
    for k in DEFAULTS:
        if k in env_fallback and not s.get(k):
            merged[k] = env_fallback[k]
    return merged


def save(data: dict) -> dict:
    current = load()
    current.update({k: v for k, v in data.items() if v is not None})
    SETTINGS_FILE.write_text(json.dumps(current, indent=2), encoding="utf-8")
    return current


def get_env_key(name: str) -> str:
    s = load()
    return s.get(name, "") or os.environ.get(name.upper(), "")
