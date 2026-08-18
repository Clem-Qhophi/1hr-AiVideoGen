#!/usr/bin/env python3
"""
lint_pacing.py — catch boring/broken pacing BEFORE you render.

Rendering is the expensive step (minutes per shot, ~437MB for a full alpha overlay), so pacing problems
should be caught on the plan, not discovered in the baked preview. This reads what already exists —
timeline.json (shot spans), edited-transcript.json (word times), and the shot TSX files (reveal frames) —
and applies the pacing rules this repo already documents:

  * /review-site "anti-boring pass": something visibly changes every 2-4s; no static hold > ~5s
  * EVOLUTION.md delivery modes: breaking-news reveals every 2-3s, calm-explainer every 4-5s
  * EVOLUTION.md gemini-release lesson: the hook must reveal something within ~2s

Heuristic by design: reveal times are parsed from common patterns (rise(N,..), appearAt, startFrame,
at:/at={N}). A shot using an exotic animation may under-report reveals — treat WARN as "go look", not
gospel. FAIL means a rule this repo explicitly states was broken.

Usage:
  python tools/lint_pacing.py videos/<slug> [--json]

Exit code: 0 = clean or warnings only, 1 = at least one FAIL.
"""
from __future__ import annotations
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Per delivery mode: (target reveal cadence s, max tolerable static hold s)
CADENCE = {
    "breaking-news":   (3.0, 4.5),
    "sarcastic-review": (4.0, 5.5),
    "authoritative":   (4.5, 6.0),
    "calm-explainer":  (5.0, 6.5),
}
DEFAULT_CADENCE = (4.0, 5.5)

DEAD_AIR_WARN = 1.6    # s of silence between words
DEAD_AIR_FAIL = 2.5
HOOK_FIRST_REVEAL = 2.0  # s — first thing must appear this fast

# TALKING-HEAD edits (the user's own footage) are a different animal from generated videos.
# There, bare master IS the shot — the face is the content — so "no cutaway here" is not a
# failure. What IS a failure is sitting on one unbroken static framing for a long time: no
# cutaway, no punch-in, nothing. These are the thresholds for that stretch.
TH_HOLD_WARN = 18.0
TH_HOLD_FAIL = 32.0
# and the opposite failure mode: punching so often it reads as a nervous tic
PUNCH_PER_MIN_WARN = 6.0

REVEAL_PATTERNS = [
    re.compile(r"\brise\(\s*(\d+)"),            # useRise(at, dur)
    re.compile(r"appearAt\s*[:=]\s*\{?\s*(\d+)"),
    re.compile(r"startFrame\s*:\s*(\d+)"),
    re.compile(r"\bat\s*:\s*(\d+)"),            # {at: 8, ...} rows
    re.compile(r"\bat=\{\s*(\d+)\s*\}"),        # <Step at={37} />
]

# Continuous motion (ken-burns zoom, pan, scroll) keeps a frame alive without a discrete "reveal".
# interpolate(frame, [a, b], ...) spanning a stretch means that stretch is NOT static.
MOTION_PATTERN = re.compile(r"interpolate\(\s*frame\s*,\s*\[\s*(\d+)\s*,\s*(\d+)")
MIN_MOTION_S = 1.0


class Report:
    def __init__(self):
        self.items = []
        self.mode = "generated"   # or "talking-head" — which ruleset applied

    def add(self, sev, rule, at, msg):
        self.items.append({"severity": sev, "rule": rule, "at_s": at, "message": msg})

    @property
    def fails(self):
        return [i for i in self.items if i["severity"] == "FAIL"]

    @property
    def warns(self):
        return [i for i in self.items if i["severity"] == "WARN"]


def _shot_src(slug: str, shot_id: str) -> str:
    path = os.path.join(ROOT, "remotion", "src", "shots", slug, f"{shot_id}.tsx")
    return open(path, encoding="utf-8").read() if os.path.exists(path) else ""


def parse_reveals(slug: str, shot_id: str, fps: int) -> list[float]:
    """Local reveal times (seconds) parsed from a shot's TSX."""
    src = _shot_src(slug, shot_id)
    frames = set()
    for pat in REVEAL_PATTERNS:
        for m in pat.finditer(src):
            try:
                frames.add(int(m.group(1)))
            except ValueError:
                pass
    return sorted(f / fps for f in frames)


def parse_motion(slug: str, shot_id: str, fps: int) -> list[tuple[float, float]]:
    """Spans (local seconds) of continuous animation — a ken-burns zoom keeps the frame alive."""
    spans = []
    for m in MOTION_PATTERN.finditer(_shot_src(slug, shot_id)):
        a, b = int(m.group(1)) / fps, int(m.group(2)) / fps
        if b - a >= MIN_MOTION_S:
            spans.append((a, b))
    return spans


def _covered(gap0: float, gap1: float, spans: list[tuple[float, float]]) -> bool:
    """Is this quiet stretch actually carried by continuous motion?"""
    return any(s <= gap0 + 0.15 and e >= gap1 - 0.15 for s, e in spans)


def lint(project: str) -> Report:
    rep = Report()
    work = os.path.join(ROOT, project, "work")
    slug = os.path.basename(project.rstrip("/\\"))

    tl = json.load(open(os.path.join(work, "timeline.json"), encoding="utf-8"))
    fps = int(tl.get("master_fps", 30))
    end_s = float(tl.get("preview", {}).get("end_s", 0))
    shots = tl.get("shots", [])

    # delivery mode drives the cadence expectation
    mode = None
    plan_p = os.path.join(work, "plan.json")
    if os.path.exists(plan_p):
        try:
            mode = (json.load(open(plan_p, encoding="utf-8")).get("persona") or {}).get("delivery_mode")
        except Exception:
            pass
    cadence, max_hold = CADENCE.get(mode, DEFAULT_CADENCE)

    cutaways = sorted([s for s in shots if s.get("type") != "overlay"],
                      key=lambda s: float(s["master_in_s"]))
    reframes = sorted([r for r in tl.get("reframes", [])], key=lambda r: float(r["in_s"]))

    # Is this a TALKING-HEAD edit (real footage is the spine) or a GENERATED video (all cutaways)?
    # Generated videos must cover every second; a talking-head edit is *supposed* to show the face.
    covered = sum(max(0.0, float(s["master_out_s"]) - float(s["master_in_s"])) for s in cutaways)
    talking_head = bool(reframes) or (end_s > 0 and covered / end_s < 0.6)

    if talking_head:
        # ---- 1t. visual monotony: how long do we sit on ONE unbroken framing?
        # Anything that changes the frame counts as relief: a cutaway, or a punch in/out.
        marks = {0.0, end_s} if end_s else {0.0}
        for s in cutaways:
            marks.add(float(s["master_in_s"]))
            marks.add(float(s["master_out_s"]))
        for r in reframes:
            marks.add(float(r["in_s"]))
            marks.add(float(r["out_s"]))
        pts = sorted(m for m in marks if m >= 0)
        for i in range(1, len(pts)):
            gap = pts[i] - pts[i - 1]
            if gap >= TH_HOLD_FAIL:
                rep.add("FAIL", "monotony", round(pts[i - 1], 2),
                        f"{gap:.0f}s on one unbroken framing ({pts[i-1]:.0f}s -> {pts[i]:.0f}s) — "
                        f"no cutaway, no punch, nothing changes")
            elif gap >= TH_HOLD_WARN:
                rep.add("WARN", "monotony", round(pts[i - 1], 2),
                        f"{gap:.0f}s with no cutaway or punch ({pts[i-1]:.0f}s -> {pts[i]:.0f}s) — "
                        f"consider a punch-in or a supporting graphic")
        # ---- 1t-b. the opposite: punching constantly is its own kind of noise
        if end_s > 30 and reframes:
            per_min = len(reframes) / (end_s / 60.0)
            if per_min > PUNCH_PER_MIN_WARN:
                rep.add("WARN", "punch-density", 0.0,
                        f"{len(reframes)} punches over {end_s/60:.1f} min ({per_min:.1f}/min) — "
                        f"the move works because it is occasional")
        # ---- 1t-c. a punch under a cutaway does nothing (bake warns too; cheaper to catch here)
        for r in reframes:
            hit = [s["id"] for s in cutaways
                   if float(s["master_in_s"]) < float(r["out_s"]) - 1e-6
                   and float(r["in_s"]) < float(s["master_out_s"]) - 1e-6]
            if hit:
                rep.add("WARN", "punch-hidden", round(float(r["in_s"]), 2),
                        f"punch at {r['in_s']:.1f}s sits under cutaway {', '.join(hit)} — it will not be seen")
    else:
        # ---- 1. coverage: no un-planned gaps (falls back to a bare master = dead screen)
        cursor = 0.0
        for s in cutaways:
            a = float(s["master_in_s"])
            if a - cursor > 0.15:
                rep.add("FAIL", "coverage", round(cursor, 2),
                        f"{a - cursor:.1f}s with no shot planned ({cursor:.1f}s -> {a:.1f}s) — bare master on screen")
            cursor = max(cursor, float(s["master_out_s"]))
        if end_s and end_s - cursor > 0.15:
            rep.add("FAIL", "coverage", round(cursor, 2),
                    f"last {end_s - cursor:.1f}s uncovered ({cursor:.1f}s -> {end_s:.1f}s)")

    # ---- 2. overlaps / ordering
    for i in range(1, len(cutaways)):
        prev, cur = cutaways[i - 1], cutaways[i]
        if float(cur["master_in_s"]) < float(prev["master_out_s"]) - 0.01:
            rep.add("FAIL", "overlap", float(cur["master_in_s"]),
                    f"'{cur['id']}' starts before '{prev['id']}' ends")

    # ---- 3. static holds inside each shot (the anti-boring rule)
    for s in cutaways:
        a, b = float(s["master_in_s"]), float(s["master_out_s"])
        span = b - a
        reveals = [r for r in parse_reveals(slug, s["id"], fps) if 0 <= r <= span]
        motion = parse_motion(slug, s["id"], fps)
        marks = [0.0] + reveals + [span]          # shot start counts as a change (the cut itself)
        worst, worst_at = 0.0, a
        for i in range(1, len(marks)):
            if _covered(marks[i - 1], marks[i], motion):
                continue                          # a zoom/pan is carrying this stretch
            gap = marks[i] - marks[i - 1]
            if gap > worst:
                worst, worst_at = gap, a + marks[i - 1]
        if not reveals and not motion and span > max_hold:
            rep.add("FAIL", "static-hold", round(a, 2),
                    f"'{s['id']}' holds {span:.1f}s with no detected reveal or motion (max {max_hold:.1f}s for {mode or 'default'})")
        elif worst > max_hold:
            rep.add("WARN", "static-hold", round(worst_at, 2),
                    f"'{s['id']}' has a {worst:.1f}s stretch with nothing changing (target ~{cadence:.0f}s)")

    # ---- 4. hook: something must appear fast.
    # Only meaningful when a shot actually OPENS the video — in a talking-head edit the video
    # opens on the face, and the hook lives in what is said, not in a graphic.
    if cutaways and float(cutaways[0]["master_in_s"]) <= 0.5:
        first = cutaways[0]
        fr = parse_reveals(slug, first["id"], fps)
        first_reveal = fr[0] if fr else None
        if first_reveal is None:
            rep.add("WARN", "hook", 0.0, f"no reveal detected in opening shot '{first['id']}'")
        elif first_reveal > HOOK_FIRST_REVEAL:
            rep.add("FAIL", "hook", round(first_reveal, 2),
                    f"first reveal at {first_reveal:.1f}s — the hook must show something within {HOOK_FIRST_REVEAL:.0f}s")

    # ---- 5. dead air in the narration
    tpath = os.path.join(work, "edited-transcript.json")
    if os.path.exists(tpath):
        words = json.load(open(tpath, encoding="utf-8")).get("words", [])
        for i in range(1, len(words)):
            gap = (words[i]["start"] - words[i - 1]["end"]) / 1000.0
            if gap >= DEAD_AIR_FAIL:
                rep.add("FAIL", "dead-air", round(words[i - 1]["end"] / 1000.0, 2),
                        f"{gap:.1f}s of silence after \"{words[i-1]['text']}\"")
            elif gap >= DEAD_AIR_WARN:
                rep.add("WARN", "dead-air", round(words[i - 1]["end"] / 1000.0, 2),
                        f"{gap:.1f}s pause after \"{words[i-1]['text']}\"")
        if words:
            tail = end_s - words[-1]["end"] / 1000.0
            if tail > DEAD_AIR_FAIL:
                rep.add("WARN", "dead-air", round(words[-1]["end"] / 1000.0, 2),
                        f"{tail:.1f}s of silence after the last word (trailing dead air)")

    rep.mode = "talking-head" if talking_head else "generated"
    return rep


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    as_json = "--json" in sys.argv
    if not args:
        sys.exit("usage: lint_pacing.py videos/<slug> [--json]")
    project = args[0]
    rep = lint(project)

    if as_json:
        print(json.dumps({"mode": rep.mode, "fails": len(rep.fails), "warns": len(rep.warns),
                          "items": rep.items}, indent=2))
    else:
        try:
            sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        except Exception:
            pass
        print(f"pacing lint: {project}   [{rep.mode} ruleset]")
        print("-" * 72)
        if not rep.items:
            print("  clean — no pacing issues found.")
        for it in sorted(rep.items, key=lambda x: (x["severity"] != "FAIL", x["at_s"])):
            tag = "FAIL" if it["severity"] == "FAIL" else "warn"
            print(f"  [{tag}] {it['at_s']:7.2f}s  {it['rule']:<12} {it['message']}")
        print("-" * 72)
        print(f"  {len(rep.fails)} fail, {len(rep.warns)} warn")
    sys.exit(1 if rep.fails else 0)


if __name__ == "__main__":
    main()
