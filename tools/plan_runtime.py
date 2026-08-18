#!/usr/bin/env python3
"""
plan_runtime.py — turn a target RUNTIME into a script word budget, and check what you wrote.

Why this exists: on video-2 a "5 minute video" shipped at 3:10. The cause was not a bad estimate,
it was no estimate — 560 words were written to no target at all, then described as five minutes.
Runtime is a hard requirement, so it gets computed, not felt. There is no one house runtime: each
niche carries its own `script.target_minutes`, set from live yt_research data (ai-news 3-10 through
entertainment 25-50). See the table in CLAUDE.md.

Rates are MEASURED per voice from real voiceovers, not taken from a textbook, and they get
RE-measured — the number in niches/voice-rates.json is the only one to trust. en-US-GuyNeural was
first measured at 162.3 wpm (video-2) and later re-measured at 177.3; anything quoting a rate from
memory or from this docstring is ~9% wrong, which silently under-writes a whole script.

  budget   target minutes            -> words to write, and per-section word counts from the niche
  check    a script (or a rendered VO) -> predicted/actual runtime vs target, PASS/WARN/FAIL
  measure  a finished VO              -> record that voice's true wpm for future budgets

Usage:
  python tools/plan_runtime.py budget 20 --niche home-hacks
  python tools/plan_runtime.py check videos/video-2 --target 20
  python tools/plan_runtime.py measure videos/video-2 --voice en-US-GuyNeural
"""
import argparse
import json
import os
import re
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RATES = os.path.join(ROOT, "niches", "voice-rates.json")
DEFAULT_WPM = 177.3          # fallback ONLY for a voice absent from voice-rates.json; that file wins.
                             # en-US-GuyNeural re-measured 2026 (was 162.3 from video-2's 560w/207.0s).
                             # An unmeasured voice should be measured (`plan_runtime.py measure`), not
                             # left on this constant — it is a guess borrowed from a different voice.
TOLERANCE = 0.08             # +/- 8% of target is close enough

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")


def load_rates():
    if os.path.exists(RATES):
        return json.load(open(RATES, encoding="utf-8"))
    return {"_note": "measured words-per-minute per TTS voice; written by `plan_runtime.py measure`",
            "en-US-GuyNeural": DEFAULT_WPM}


def wpm_for(voice):
    r = load_rates()
    return float(r.get(voice, r.get("en-US-GuyNeural", DEFAULT_WPM)))


def spoken_words(project):
    """Narration only: strip directives ([beat: ...], [CAPTURE ...], inline [HOOK ...] tags)
    and # comments. Directive lines are standalone; HOOK tags are inline prefixes on the
    narration paragraph they mark, so only the tag is removed, never the text."""
    p = os.path.join(project, "work", "script.md")
    if not os.path.exists(p):
        p = os.path.join(project, "work", "script_spoken.txt")
    if not os.path.exists(p):
        return None, None
    lines = []
    for line in open(p, encoding="utf-8"):
        s = line.strip()
        if s.startswith("#") or re.match(r"^\s*\[(?:beat:|CAPTURE\s*).*\]\s*$", line, re.I):
            continue
        s = re.sub(r"^\s*\[HOOK (?:LINE|PAYOFF)\]\s*", "", s, flags=re.I)
        if s.strip():
            lines.append(s)
    return len(" ".join(lines).split()), p


def probe(path):
    r = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                        "-of", "csv=p=0", path], capture_output=True, text=True)
    try:
        return float(r.stdout.strip())
    except ValueError:
        return None


def cmd_budget(a):
    wpm = wpm_for(a.voice)
    total = round(a.minutes * wpm)
    print(f"target {a.minutes} min at {wpm:.1f} wpm ({a.voice})")
    print(f"  WRITE {total} narration words  (+/-{round(total*TOLERANCE)} is in tolerance)")
    npath = os.path.join(ROOT, "niches", f"{a.niche}.json") if a.niche else None
    if npath and os.path.exists(npath):
        n = json.load(open(npath, encoding="utf-8"))
        print(f"\n  per section ({n['id']}):")
        for b in n["script"]["structure"]:
            w = round(total * b["share"])
            print(f"    {b['beat']:<18} {b['share']*100:4.0f}%  {w:5d} words  ~{w/wpm*60:5.0f}s")
        cad = n.get("pacing", {}).get("beat_seconds", 8)
        print(f"\n  ~{round(a.minutes*60/cad)} visual beats at {cad}s cadence "
              f"-> plan that many [beat:] directives")
    print(f"\n  a {a.minutes}-min video is a LOT of script. Do not stop short and call it done.")


def voice_for_project(proj, explicit):
    """The project's OWN voice from work/spec.json, unless --voice was passed explicitly.

    `check` used to always fall back to en-US-GuyNeural's rate. On a project voiced by Jenny
    (150.3 wpm vs Guy's 177.3) that made a LONG script report as "short by ~217 words" — a wrong
    number pointing the wrong direction, which is worse than no number at all. Measured on
    re-closing-costs 2026-08-03.
    """
    if explicit:
        return explicit
    sp = os.path.join(proj, "work", "spec.json")
    if os.path.exists(sp):
        try:
            v = json.load(open(sp, encoding="utf-8")).get("voice", {}).get("name")
            if v:
                return v
        except (OSError, json.JSONDecodeError):
            pass
    return "en-US-GuyNeural"


def cmd_check(a):
    proj = a.project if os.path.isabs(a.project) else os.path.abspath(a.project)
    voice = voice_for_project(proj, a.voice)
    wpm = wpm_for(voice)
    print(f"voice {voice} @ {wpm:.1f} wpm")
    target_s = a.target * 60
    words, src = spoken_words(proj)
    print(f"target {a.target} min ({target_s:.0f}s), tolerance +/-{TOLERANCE*100:.0f}%")
    ok = True
    if words:
        pred = words / wpm * 60
        off = (pred - target_s) / target_s
        tag = "PASS" if abs(off) <= TOLERANCE else ("WARN" if abs(off) <= 0.2 else "FAIL")
        ok &= tag == "PASS"
        print(f"  [{tag}] script: {words} words -> ~{pred:.0f}s ({pred/60:.1f} min), {off*100:+.0f}%")
        if off < -TOLERANCE:
            print(f"         short by ~{round(abs(pred-target_s)/60*wpm)} words")
    else:
        print("  [FAIL] no script.md / script_spoken.txt")
        ok = False
    for rel in ("work/audio/voiceover.mp3", "work/audio/voiceover.wav"):
        p = os.path.join(proj, rel)
        if os.path.exists(p):
            d = probe(p)
            off = (d - target_s) / target_s
            tag = "PASS" if abs(off) <= TOLERANCE else ("WARN" if abs(off) <= 0.2 else "FAIL")
            ok &= tag == "PASS"
            print(f"  [{tag}] voiceover: {d:.0f}s ({d/60:.1f} min), {off*100:+.0f}%")
            break
    sys.exit(0 if ok else 1)


def cmd_measure(a):
    proj = a.project if os.path.isabs(a.project) else os.path.abspath(a.project)
    words, _ = spoken_words(proj)
    d = None
    for rel in ("work/audio/voiceover.mp3", "work/audio/voiceover.wav"):
        p = os.path.join(proj, rel)
        if os.path.exists(p):
            d = probe(p)
            break
    if not words or not d:
        raise SystemExit("need both a script and a rendered voiceover")
    wpm = words / (d / 60)
    rates = load_rates()
    prev = rates.get(a.voice)
    rates[a.voice] = round(wpm, 1)
    os.makedirs(os.path.dirname(RATES), exist_ok=True)
    with open(RATES, "w", encoding="utf-8") as f:
        json.dump(rates, f, indent=2)
    print(f"{a.voice}: {words} words / {d:.1f}s = {wpm:.1f} wpm"
          + (f"  (was {prev})" if prev else ""))
    print(f"  -> {os.path.relpath(RATES, ROOT)}")


def main():
    ap = argparse.ArgumentParser(description="runtime budgeting for long-form scripts")
    sub = ap.add_subparsers(dest="cmd", required=True)
    b = sub.add_parser("budget"); b.add_argument("minutes", type=float)
    b.add_argument("--niche"); b.add_argument("--voice", default="en-US-GuyNeural")
    b.set_defaults(fn=cmd_budget)
    c = sub.add_parser("check"); c.add_argument("project")
    c.add_argument("--target", type=float, required=True)
    c.add_argument("--voice", default=None, help="default: the voice in work/spec.json")
    c.set_defaults(fn=cmd_check)
    m = sub.add_parser("measure"); m.add_argument("project")
    m.add_argument("--voice", default="en-US-GuyNeural"); m.set_defaults(fn=cmd_measure)
    a = ap.parse_args()
    a.fn(a)


if __name__ == "__main__":
    main()
