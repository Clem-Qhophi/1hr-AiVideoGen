"""
director.providers — the tiered capability layer.

Every capability (voiceover, word-timing, thumbnails, sfx, and the agent 'brain') has a
PRO implementation (paid, best quality) and, where possible, a FREE fallback. Each provider
health-checks itself; the layer auto-selects the best AVAILABLE tier and records the tradeoff
+ estimated cost. This formalizes what /make-video did by hand on 2026-07-23 (ElevenLabs ->
edge-tts, AssemblyAI -> proportional alignment, Gemini -> skip).

Design decision (locked): tiered providers = free floor + paid pro. See docs/STAGE-1-DESIGN.md.

`python -m director providers` prints the live health table.
"""
from __future__ import annotations
import os
import json
from dataclasses import dataclass, field, asdict
from typing import Optional

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def load_env() -> dict:
    env = {}
    p = os.path.join(ROOT, ".env")
    if os.path.exists(p):
        for line in open(p, encoding="utf-8"):
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            k, v = line.split("=", 1)
            env[k.strip()] = v.strip().strip('"').strip("'")
    return {**env, **os.environ}


@dataclass
class Health:
    capability: str
    impl: str
    tier: str                 # "pro" | "free"
    available: bool
    detail: str = ""
    est_cost_note: str = ""


def _http_ok(fn):
    """Guard a network health probe so `providers` works offline (degrades to key-presence)."""
    try:
        return fn()
    except Exception as e:  # noqa: BLE001 - health must never crash the layer
        return None, f"probe skipped ({type(e).__name__})"


# ---- per-capability health -------------------------------------------------

def _eleven(env) -> Health:
    key = env.get("ELEVENLABS_API_KEY", "")
    if not key:
        return Health("voiceover", "elevenlabs", "pro", False, "no ELEVENLABS_API_KEY", "~$0.20/min")

    def probe():
        import requests
        r = requests.get("https://api.elevenlabs.io/v1/user/subscription",
                         headers={"xi-api-key": key}, timeout=8)
        d = r.json()
        remaining = int(d.get("character_limit", 0)) - int(d.get("character_count", 0))
        return remaining, f"{remaining} credits left"
    res, detail = _http_ok(probe) if callable(probe) else (None, "")
    if isinstance(res, tuple):
        remaining, detail = res
        # a typical VO is ~2000+ chars; call it available only if it can plausibly run
        return Health("voiceover", "elevenlabs", "pro", remaining >= 500, detail, "~$0.20/min")
    # probe failed -> key present but unverified
    return Health("voiceover", "elevenlabs", "pro", False, detail or "unverified", "~$0.20/min")


def _edge(env) -> Health:
    try:
        import edge_tts  # noqa: F401
        return Health("voiceover", "edge-tts", "free", True, "installed", "$0")
    except Exception:
        return Health("voiceover", "edge-tts", "free", False, "edge-tts not installed", "$0")


def _assemblyai(env) -> Health:
    key = env.get("ASSEMBLYAI_API_KEY", "")
    ok = bool(key)
    return Health("word_timing", "assemblyai", "pro", ok,
                  "key set" if ok else "ASSEMBLYAI_API_KEY empty", "~$0.01/min")


def _proportional(env) -> Health:
    # always available: deterministic alignment from script text + audio duration
    return Health("word_timing", "proportional", "free", True,
                  "deterministic (sentence-accurate, sub-word approximate)", "$0")


def _gemini(env) -> Health:
    key = env.get("GEMINI_API_KEY", "")
    if not key:
        return Health("thumbnails", "gemini", "pro", False, "no GEMINI_API_KEY", "~$0.04/img")
    # We know from 2026-07-23 that free tier returns limit:0 (billing off). Flag, don't hard-probe.
    return Health("thumbnails", "gemini", "pro", False,
                  "key set but image gen likely blocked (needs billing; see memory)", "~$0.04/img")


def _thumb_none(env) -> Health:
    return Health("thumbnails", "concepts-only", "free", True,
                  "title + prompts + description only, no rendered image", "$0")


def _anthropic(env) -> Health:
    key = env.get("ANTHROPIC_API_KEY", "")
    try:
        import claude_agent_sdk  # noqa: F401
        sdk = True
    except Exception:
        sdk = False
    ok = bool(key) and sdk
    if not sdk:
        detail = "claude-agent-sdk not installed"
    elif not key:
        detail = "SDK installed; ANTHROPIC_API_KEY empty (the app's paid brain)"
    else:
        detail = "SDK + key ready"
    return Health("agent", "claude-agent-sdk", "pro", ok, detail, "~$ per run")


def _sfx_eleven(env) -> Health:
    key = env.get("ELEVENLABS_API_KEY", "")
    return Health("sfx", "elevenlabs-sfx", "pro", bool(key),
                  "shares ElevenLabs quota" if key else "no key", "~$0.1-0.5/video")


def _sfx_library(env) -> Health:
    return Health("sfx", "library-only", "free", True, "reuse media/library/sfx (no new gen)", "$0")


CAPABILITIES = {
    "voiceover":   [_eleven, _edge],
    "word_timing": [_assemblyai, _proportional],
    "thumbnails":  [_gemini, _thumb_none],
    "sfx":         [_sfx_eleven, _sfx_library],
    "agent":       [_anthropic],
}


def health_all() -> list[Health]:
    env = load_env()
    out = []
    for _, impls in CAPABILITIES.items():
        for fn in impls:
            out.append(fn(env))
    return out


def pick(capability: str) -> Health:
    """Return the best AVAILABLE provider for a capability (pro preferred, else free fallback)."""
    env = load_env()
    impls = CAPABILITIES.get(capability, [])
    healths = [fn(env) for fn in impls]
    for h in healths:                      # impls are ordered pro-first
        if h.available:
            return h
    # nothing available: return the last (free) one flagged unavailable so caller can report
    return healths[-1] if healths else Health(capability, "none", "free", False, "no impl")


# ---- cost meter ------------------------------------------------------------

@dataclass
class CostMeter:
    entries: list = field(default_factory=list)

    def add(self, capability: str, impl: str, usd: float, note: str = ""):
        self.entries.append({"capability": capability, "impl": impl, "usd": round(usd, 4), "note": note})

    @property
    def total(self) -> float:
        return round(sum(e["usd"] for e in self.entries), 4)

    def to_dict(self):
        return {"entries": self.entries, "total_usd": self.total}


if __name__ == "__main__":  # `python -m director.providers`
    for h in health_all():
        mark = "OK " if h.available else "-- "
        print(f"{mark}{h.capability:12} {h.tier:4} {h.impl:16} {h.detail}  [{h.est_cost_note}]")
