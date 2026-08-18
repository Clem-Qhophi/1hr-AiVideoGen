"""Brand configuration — lets users customize colors, fonts, and wordmark from the app."""
import json
import re
from pathlib import Path
from .settings import load, save

ROOT = Path(__file__).resolve().parent.parent
BRAND_TS_PATH = ROOT / "remotion" / "src" / "brand.ts"


def get_brand_config() -> dict:
    """Read the current brand configuration from brand.ts."""
    s = load()
    return {
        "wordmark": s.get("brand_wordmark", ['Reel', 'Forge', '']),
        "accent_color": s.get("brand_accent", "#6366F1"),
        "accent2_color": s.get("brand_accent2", "#9b7cc4"),
        "signal_color": s.get("brand_signal", "#4db8a8"),
        "warn_color": s.get("brand_warn", "#f5d76e"),
        "danger_color": s.get("brand_danger", "#e8879f"),
        "ink_color": s.get("brand_ink", "#1a1a2e"),
        "paper_color": s.get("brand_paper", "#fffef7"),
        "bg_style": s.get("brand_bg_style", "dark"),
    }


def update_brand_config(data: dict) -> dict:
    """Save brand config to settings and rewrite brand.ts."""
    # Save to settings
    brand_keys = {
        "brand_wordmark": data.get("wordmark"),
        "brand_accent": data.get("accent_color"),
        "brand_accent2": data.get("accent2_color"),
        "brand_signal": data.get("signal_color"),
        "brand_warn": data.get("warn_color"),
        "brand_danger": data.get("danger_color"),
        "brand_ink": data.get("ink_color"),
        "brand_paper": data.get("paper_color"),
        "brand_bg_style": data.get("bg_style"),
    }
    brand_keys = {k: v for k, v in brand_keys.items() if v is not None}
    save(brand_keys)

    # Rewrite brand.ts with the new colors
    wordmark = data.get("wordmark", ['Reel', 'Forge', ''])
    accent = data.get("accent_color", "#6366F1")
    accent2 = data.get("accent2_color", "#9b7cc4")
    signal = data.get("signal_color", "#4db8a8")
    warn = data.get("warn_color", "#f5d76e")
    danger = data.get("danger_color", "#e8879f")
    ink = data.get("ink_color", "#1a1a2e")
    paper = data.get("paper_color", "#fffef7")

    # Format wordmark as TS array
    if isinstance(wordmark, list):
        wm_ts = "[" + ", ".join(f"'{w}'" for w in wordmark) + "]"
    else:
        parts = wordmark.split()
        wm_ts = "[" + ", ".join(f"'{w}'" for w in parts) + "]"

    brand_ts = f"""// Framewright brand tokens. Import these in every shot so all videos stay
// consistent; change a value here and every shot updates.
//
// BRAND is YOUR identity — set your wordmark. COLORS / EASINGS / RADIUS are
// the default style; customize them to match your channel.
import {{ Easing }} from 'remotion';

export const BRAND = {{
  wordmark: {wm_ts} as readonly string[],
  signoff: 'See you in the next one',
}} as const;

export const COLORS = {{
  accent: '{accent}',
  accent2: '{accent2}',
  signal: '{signal}',
  signalAlt: '{signal}',
  warn: '{warn}',
  danger: '{danger}',
  ink: '{ink}',
  muted: '#6b6b7b',
  paper: '{paper}',
  cream: '#faf8f5',
  line: '#e7e3da',
  d900: '#0d1117',
  d800: '#161b22',
  d600: '#30363d',
  d400: '#8b949e',
  d300: '#c9d1d9',
}} as const;

export const GRADIENT = `linear-gradient(120deg, ${{COLORS.accent}}, ${{COLORS.accent2}}, ${{COLORS.signal}})`;

export const RADIUS = {{ card: 16, panel: 14, window: 10, pill: 999 }} as const;

export const SHADOW = {{
  soft: '0 8px 32px rgba(26,26,46,0.10)',
  card: '0 10px 40px rgba(26,26,46,0.08)',
}} as const;

export const EASINGS = {{
  easeOut: Easing.bezier(0.33, 1, 0.68, 1),
  easeIn: Easing.bezier(0.32, 0, 0.67, 0),
  easeInOut: Easing.bezier(0.37, 0, 0.63, 1),
  overshoot: Easing.bezier(0.34, 1.4, 0.64, 1),
}} as const;
"""
    BRAND_TS_PATH.write_text(brand_ts, encoding="utf-8")

    return get_brand_config()
