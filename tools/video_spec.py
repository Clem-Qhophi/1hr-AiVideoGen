#!/usr/bin/env python3
"""
video_spec.py — the SPEC is the contract for a video. One file, agreed up front, checked at the end.

Before this, "what is this video supposed to be" lived in whatever flags happened to get typed, and
the delivery gate was hardcoded to ONE shape (short-form talking head). A perfectly good long-form
video failed four checks for not having punch-ins and a caption overlay it was never meant to have.

Now: `work/spec.json` states the target, every tool reads it, and `check_deliverable.py` verifies
the finished file against THAT — so any format is supported by writing a spec, not by editing code.

Formats (presets, each just a starting spec you can edit):
  longform-images        stills + Ken Burns + burned captions      (faceless / avatar channels)
  longform-talking-head  real footage, cut, punch-ins, burned captions
  shortform-talking-head real footage, cut, punch-ins, overlay captions   (Shorts/Reels)
  shortform-images       stills + Ken Burns, vertical, overlay captions
  shortform-explainer    generated, custom Remotion cutaway shots (timeline.json, no talking
                          head, no stills/Ken-Burns), 16:9 landscape, overlay captions
                          (the /prompt-to-video + /make-tsx shape - e.g. ai-news)

Usage:
  python tools/video_spec.py new videos/video-3 --format longform-images --minutes 20 --niche home-hacks
  python tools/video_spec.py show videos/video-3
  python tools/video_spec.py validate videos/video-3
  python tools/video_spec.py set videos/video-3 --sfx off --music docu-pluck --minutes 18
"""
import argparse
import json
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEFAULT_WPM = 177.3  # keep in sync with tools/plan_runtime.py's DEFAULT_WPM — both are the same
                     # "unmeasured voice" fallback and drifting apart silently reintroduces the
                     # exact stale-constant bug fixed 2026-08-02 (see CLAUDE.md, EVOLUTION.md).

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")


def wpm_for(voice):
    """Measured rate for a voice from niches/voice-rates.json, same lookup as plan_runtime.py.
    Duplicated rather than imported since these are independent CLI tools, but the two files'
    constants and logic must stay in sync — see DEFAULT_WPM's comment."""
    p = os.path.join(ROOT, "niches", "voice-rates.json")
    rates = json.load(open(p, encoding="utf-8")) if os.path.exists(p) else {}
    return float(rates.get(voice, DEFAULT_WPM))


def niche_minutes_range(niche_id):
    """(lo, hi) from niches/<id>.json's script.target_minutes, or None if unavailable — callers
    fall back to a generic sanity ceiling rather than a specific channel's number when there is no
    niche to ask."""
    if not niche_id:
        return None
    p = os.path.join(ROOT, "niches", f"{niche_id}.json")
    if not os.path.exists(p):
        return None
    n = json.load(open(p, encoding="utf-8"))
    tm = n.get("script", {}).get("target_minutes")
    return tuple(tm) if tm and len(tm) == 2 else None

PRESETS = {
    "longform-images": {
        "source": "generated", "motion": "ken-burns", "captions_style": "burned",
        "aspect": "16:9", "minutes": 20.0,
    },
    "longform-talking-head": {
        "source": "footage", "motion": "punch-ins", "captions_style": "burned",
        "aspect": "16:9", "minutes": 15.0,
    },
    "shortform-talking-head": {
        "source": "footage", "motion": "punch-ins", "captions_style": "overlay",
        "aspect": "9:16", "minutes": 1.0,
    },
    "shortform-images": {
        "source": "generated", "motion": "ken-burns", "captions_style": "overlay",
        "aspect": "9:16", "minutes": 1.0,
    },
    "shortform-explainer": {
        "source": "generated", "motion": "shots", "captions_style": "overlay",
        "aspect": "16:9", "minutes": 2.5,
    },
}
DIMS = {"16:9": (1920, 1080), "9:16": (1080, 1920), "1:1": (1080, 1080)}


def build(fmt, minutes, niche, aspect=None, voice="en-US-GuyNeural"):
    p = PRESETS[fmt]
    aspect = aspect or p["aspect"]
    w, h = DIMS[aspect]
    nprof = {}
    npath = os.path.join(ROOT, "niches", f"{niche}.json") if niche else None
    if npath and os.path.exists(npath):
        nprof = json.load(open(npath, encoding="utf-8"))
    snd = nprof.get("sound", {})
    return {
        "format": fmt,
        "niche": niche,
        "runtime": {"target_min": float(minutes), "tolerance": 0.08},
        "video": {"aspect": aspect, "width": w, "height": h, "fps": 30},
        "source": p["source"],
        "voice": {"engine": "edge-tts", "name": voice},
        "captions": {"enabled": True, "style": p["captions_style"], "emphasis": True,
                     "font_px": None},
        "motion": {"kind": p["motion"],
                   "beat_seconds": nprof.get("pacing", {}).get("beat_seconds", 8.0)},
        "sfx": {"enabled": True, "density": snd.get("sfx_density", "low")},
        "music": {"enabled": True, "bed": snd.get("music_bed", "docu-pluck"),
                  "gain_db": snd.get("bed_gain_db", -16)},
        "evidence": {"required": True, "min_on_screen": 2},
        "master": {"lufs": -14.0, "true_peak": -1.0},
    }


def path_for(proj):
    return os.path.join(proj, "work", "spec.json")


def load(proj):
    p = path_for(proj)
    if not os.path.exists(p):
        raise SystemExit(f"no spec: {p}   (create it: video_spec.py new {proj} --format ...)")
    return json.load(open(p, encoding="utf-8"))


def save(proj, spec):
    p = path_for(proj)
    os.makedirs(os.path.dirname(p), exist_ok=True)
    with open(p, "w", encoding="utf-8") as f:
        json.dump(spec, f, indent=2, ensure_ascii=False)
    return p


def validate(spec):
    """-> list of problems. Catches specs that cannot physically be produced."""
    bad = []
    if spec.get("format") not in PRESETS:
        bad.append(f"unknown format {spec.get('format')!r} (one of {', '.join(PRESETS)})")
    m = spec.get("runtime", {}).get("target_min", 0)
    if not m or m <= 0:
        bad.append("runtime.target_min must be > 0")
    rng = niche_minutes_range(spec.get("niche"))
    if rng:
        lo, hi = rng
        if not (lo <= m <= hi):
            bad.append(f"runtime.target_min {m} is outside niches/{spec.get('niche')}.json's "
                       f"script.target_minutes range [{lo}, {hi}]")
    elif m > 30:
        # No niche on the spec (or its file is missing) means there is no channel-specific range to
        # check against — this generic ceiling exists only to catch an obvious typo (e.g. 330 instead
        # of 33), not to assert a house-wide maximum. A real channel maximum belongs in its niche
        # file's script.target_minutes, not here — see EVOLUTION.md 2026-08-02 for why a hardcoded
        # 25-min constant here silently contradicted real-estate/entertainment's widened ranges.
        bad.append(f"runtime.target_min {m} has no --niche to validate against and looks unusually "
                   f"long (>30 min) — pass --niche or confirm this is intentional")
    v = spec.get("video", {})
    if v.get("width", 0) % 2 or v.get("height", 0) % 2:
        bad.append("video dimensions must be even (h264 requirement)")
    if spec.get("source") == "footage" and spec.get("motion", {}).get("kind") == "ken-burns":
        bad.append("motion 'ken-burns' is for stills; footage uses 'punch-ins'")
    if spec.get("source") == "generated" and spec.get("motion", {}).get("kind") == "punch-ins":
        bad.append("motion 'punch-ins' reframes real footage; stills use 'ken-burns'")
    if spec.get("captions", {}).get("style") == "overlay" and m > 3:
        bad.append(f"caption style 'overlay' on a {m}-min video: the alpha .mov is ~437MB per "
                   f"148s. Use 'burned' above ~3 min.")
    if spec.get("music", {}).get("enabled") and not spec.get("music", {}).get("bed"):
        bad.append("music.enabled but no bed chosen")
    return bad


def show(spec):
    r, v = spec["runtime"], spec["video"]
    tol = r["tolerance"]
    lo, hi = r["target_min"] * (1 - tol), r["target_min"] * (1 + tol)
    print(f"format   {spec['format']}   niche={spec.get('niche')}   source={spec['source']}")
    print(f"runtime  {r['target_min']} min  (accept {lo:.1f}-{hi:.1f})")
    print(f"video    {v['width']}x{v['height']} @{v['fps']}  ({v['aspect']})")
    print(f"voice    {spec['voice']['name']} ({spec['voice']['engine']})")
    c = spec["captions"]
    print(f"captions {'on' if c['enabled'] else 'OFF'}  style={c['style']}  "
          f"emphasis={'yes' if c['emphasis'] else 'no'}")
    print(f"motion   {spec['motion']['kind']}  beat={spec['motion']['beat_seconds']}s")
    print(f"sfx      {'on' if spec['sfx']['enabled'] else 'OFF'}  density={spec['sfx']['density']}")
    mu = spec["music"]
    print(f"music    {'on' if mu['enabled'] else 'OFF'}  bed={mu['bed']} @{mu['gain_db']}dB")
    print(f"master   {spec['master']['lufs']} LUFS / {spec['master']['true_peak']} dBTP")


def main():
    ap = argparse.ArgumentParser(description="the per-video spec contract")
    sub = ap.add_subparsers(dest="cmd", required=True)

    n = sub.add_parser("new"); n.add_argument("project")
    n.add_argument("--format", required=True, choices=list(PRESETS))
    n.add_argument("--minutes", type=float, default=None)
    n.add_argument("--niche", default=None)
    n.add_argument("--aspect", default=None, choices=list(DIMS))
    n.add_argument("--voice", default="en-US-GuyNeural")

    for c in ("show", "validate"):
        s = sub.add_parser(c); s.add_argument("project")

    st = sub.add_parser("set"); st.add_argument("project")
    st.add_argument("--minutes", type=float); st.add_argument("--sfx", choices=["on", "off"])
    st.add_argument("--music"); st.add_argument("--captions", choices=["on", "off"])
    st.add_argument("--caption-style", choices=["burned", "overlay"])
    st.add_argument("--voice"); st.add_argument("--beat-seconds", type=float)

    a = ap.parse_args()
    proj = a.project if os.path.isabs(a.project) else os.path.abspath(a.project)

    if a.cmd == "new":
        pre = PRESETS[a.format]
        spec = build(a.format, a.minutes if a.minutes is not None else pre["minutes"],
                     a.niche, a.aspect, a.voice)
        bad = validate(spec)
        p = save(proj, spec)
        show(spec)
        for b in bad:
            print(f"  WARNING {b}")
        print(f"\n  -> {os.path.relpath(p, ROOT)}")
        wpm_note = round(spec["runtime"]["target_min"] * wpm_for(a.voice))
        print(f"next: python tools/plan_runtime.py budget {spec['runtime']['target_min']} "
              f"--niche {a.niche or '<niche>'}   (~{wpm_note} words)")
        return

    if a.cmd == "show":
        show(load(proj)); return

    if a.cmd == "validate":
        spec = load(proj)
        bad = validate(spec)
        show(spec)
        print()
        for b in bad:
            print(f"  FAIL {b}")
        print("  spec is producible" if not bad else f"  {len(bad)} problem(s)")
        sys.exit(1 if bad else 0)

    spec = load(proj)
    if a.minutes is not None:
        spec["runtime"]["target_min"] = a.minutes
    if a.sfx:
        spec["sfx"]["enabled"] = a.sfx == "on"
    if a.captions:
        spec["captions"]["enabled"] = a.captions == "on"
    if a.caption_style:
        spec["captions"]["style"] = a.caption_style
    if a.music:
        spec["music"]["enabled"] = a.music.lower() not in ("off", "none")
        if spec["music"]["enabled"]:
            spec["music"]["bed"] = a.music
    if a.voice:
        spec["voice"]["name"] = a.voice
    if a.beat_seconds:
        spec["motion"]["beat_seconds"] = a.beat_seconds
    save(proj, spec)
    show(spec)
    for b in validate(spec):
        print(f"  WARNING {b}")


if __name__ == "__main__":
    main()
