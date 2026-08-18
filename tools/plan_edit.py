#!/usr/bin/env python3
"""
plan_edit.py — propose the EDIT for a talking-head cut: where to punch in, and where the
narration is asking for a supporting graphic.

The mechanism for both already exists (timeline.json `reframes` for punch-ins, `shots` for
cutaway graphics) but until now both had to be hand-authored span by span against a transcript.
This reads what the person actually said and proposes the plan, so the agent/editor starts from
a draft instead of a blank file.

It proposes. It does not decide. Output is a reviewable markdown plus a JSON whose `reframes`
array can be merged straight into timeline.json.

  <project>/work/edit-plan-auto.md      read this
  <project>/work/edit-plan-auto.json    reframes[] + graphics[]

Two signals drive it:
  * cuts.json (if /clean-cut ran) gives the CUT JOINS — the splices a viewer can feel. A hard
    punch landing on a join reads as a camera change instead of a jump cut. This is the single
    highest-value punch placement and it cannot be guessed from the transcript alone.
  * the transcript gives the CONTENT — sentences carrying numbers, comparisons, lists, or named
    products are the ones that want a graphic on screen rather than a face.

Usage:
  python tools/plan_edit.py videos/video-1
  python tools/plan_edit.py videos/video-1 --min-gap 8 --max-punch-per-min 4
  python tools/plan_edit.py videos/video-1 --no-graphics      # punches only

Then: merge `reframes` into work/timeline.json, build the graphics you agree with via /make-tsx,
and run tools/lint_pacing.py to check the result.
"""
import argparse
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

SENT_END = re.compile(r"[.!?]$")

# ---------------------------------------------------------------- what a sentence is asking for
#
# Ordered: the first rule that matches wins, most specific first. Each is (kind, why, regex).
GRAPHIC_RULES = [
    ("comparison", "a versus/against framing wants both sides on screen at once",
     re.compile(r"\b(versus|vs\.?|compared to|compare[sd]? with|instead of|rather than|"
                r"better than|worse than|faster than|cheaper than|the difference between)\b", re.I)),
    ("steps", "an ordered list is unreadable as speech alone",
     re.compile(r"\b(first(ly)?|second(ly)?|third(ly)?|step (one|two|three|\d)|"
                r"number (one|two|three)|then you|after that|finally)\b", re.I)),
    ("stat-card", "numbers do not survive as audio; put them on screen",
     re.compile(r"(\$\s?\d|\d+\s?%|\bpercent\b|\b\d[\d,.]*\s?(x|times|k|m|bn|billion|million|"
                r"thousand|hours?|minutes?|seconds?|days?|weeks?|months?|years?)\b|\b\d{2,}\b)", re.I)),
    ("evidence", "a claim about a real service needs the real page as proof",
     re.compile(r"\b(pricing|price is|costs?|free tier|limit(s|ed)? to|according to|"
                r"they claim|the docs? say|announced|released|study|research|report(s|ed)?)\b", re.I)),
    ("quote", "a direct claim lands harder as set type",
     re.compile(r"\b(they say|people say|everyone says|the truth is|here is the thing|"
                r"the problem is|the reality is)\b", re.I)),
]

# a sentence that names a tool/product usually wants that product's real UI (make-tsx P3/P4)
PRODUCT_HINT = re.compile(r"\b(dashboard|settings|the app|the site|the website|the page|"
                          r"the editor|the terminal|the console|screenshot)\b", re.I)

# Lines that stay ON THE FACE and are worth pushing into. Deliberately NOT the same signals as
# the graphic rules: a line that earns a graphic gets a cutaway, so punching it is wasted. The
# punch is for the moments the face IS the shot — direct address, a verdict, a turn.
FACE_LINE = re.compile(r"\b(you|your|honestly|look|listen|here is why|the point is|but|"
                       r"never|always|nobody|everyone|the truth|matters|serious(ly)?|"
                       r"trust me|believe me|think about)\b", re.I)


def load_words(project_dir):
    p = os.path.join(project_dir, "work", "edited-transcript.json")
    if not os.path.exists(p):
        raise SystemExit(f"no transcript: {p}\n(run /clean-cut step 11 first)")
    raw = json.load(open(p, encoding="utf-8")).get("words") or []
    out = []
    for w in raw:
        t = (w.get("text") if "text" in w else w.get("t")) or ""
        s, e = w.get("start", w.get("s")), w.get("end", w.get("e"))
        if t.strip() and s is not None and e is not None:
            out.append({"t": t.strip(), "s": int(s) / 1000.0, "e": int(e) / 1000.0})
    if not out:
        raise SystemExit(f"{p} has no usable words")
    out.sort(key=lambda w: w["s"])
    return out


def sentences(words):
    """Group words into sentences. Long runs without punctuation are split on a real breath."""
    out, cur = [], []
    for i, w in enumerate(words):
        cur.append(w)
        nxt = words[i + 1] if i + 1 < len(words) else None
        gap = (nxt["s"] - w["e"]) if nxt else 99.0
        if nxt is None or SENT_END.search(w["t"]) or (gap >= 0.7 and len(cur) >= 6):
            out.append({"s": cur[0]["s"], "e": cur[-1]["e"],
                        "text": " ".join(x["t"] for x in cur)})
            cur = []
    if cur:
        out.append({"s": cur[0]["s"], "e": cur[-1]["e"], "text": " ".join(x["t"] for x in cur)})
    return out


def load_cut_joins(project_dir):
    """Master-timeline seconds where a cut removed something = where a jump cut can show.

    cuts.json times are per-clip RAW seconds, so a join's position in the finished master is the
    running total of kept time before it. Only meaningful if /clean-cut authored the file.
    """
    p = os.path.join(project_dir, "work", "analysis", "cuts.json")
    if not os.path.exists(p):
        return [], False
    try:
        data = json.load(open(p, encoding="utf-8"))
    except Exception:
        return [], False
    joins, t = [], 0.0
    for cid in data.get("clip_order", []) or [c["id"] for c in data.get("clips", [])]:
        clip = next((c for c in data.get("clips", []) if c.get("id") == cid), None)
        if not clip:
            continue
        keeps = sorted(clip.get("keeps", []), key=lambda k: float(k["s"]))
        for i, k in enumerate(keeps):
            t += float(k["e"]) - float(k["s"])
            # a gap to the next keep means material was removed here: that is the join
            if i + 1 < len(keeps) and float(keeps[i + 1]["s"]) - float(k["e"]) > 0.05:
                joins.append(round(t, 3))
    return joins, True


def classify(sent):
    for kind, why, rx in GRAPHIC_RULES:
        if rx.search(sent["text"]):
            return kind, why
    if PRODUCT_HINT.search(sent["text"]):
        return "product-ui", "a named surface should be shown, not described"
    return None, None


def plan_punches(sents, joins, end_s, min_gap, max_per_min, graphic_spans):
    """Punches, best-placement-first, then thinned to a rate that still feels deliberate.

    A punch under a planned graphic is wasted (the cutaway replaces the master), so those are
    dropped here rather than left for bake.py to warn about.
    """
    cands = []
    for j in joins:
        sent = next((s for s in sents if s["s"] - 0.6 <= j <= s["e"] + 0.6), None)
        end = min(sent["e"] + 0.3, j + 6.0) if sent else j + 3.0
        cands.append({"at": j, "until": end, "ease": "cut", "score": 100,
                      "why": "lands on a cut join, so the splice reads as a camera change"})
    # Lines that KEEP the face on screen and are worth pushing into. A line that earns a graphic
    # is cut away from, so it must not also be a punch candidate — an earlier version derived
    # both from the same rules and every content punch was then discarded as "hidden", which is
    # how this ended up proposing zero punches on a transcript full of good moments.
    covered = lambda s: any(a < s["e"] and s["s"] < b for a, b in graphic_spans)
    for s in sents:
        if covered(s):
            continue
        dur = s["e"] - s["s"]
        if FACE_LINE.search(s["text"]) and dur >= 1.0:
            cands.append({"at": s["s"], "until": min(s["e"] + 0.3, s["s"] + 6.0),
                          "ease": "push", "score": 45,
                          "why": "direct-address line that stays on the face; a push adds pressure"})
        elif 1.0 <= dur <= 3.0:
            cands.append({"at": s["s"], "until": s["e"] + 0.3, "ease": "cut", "score": 25,
                          "why": "short declarative beat; a hard punch gives it weight"})

    cands.sort(key=lambda c: (-c["score"], c["at"]))
    budget = max(1, int((end_s / 60.0) * max_per_min)) if end_s else len(cands)
    chosen = []
    for c in cands:
        if c["until"] - c["at"] < 0.8:
            continue
        if any(a < c["until"] and c["at"] < b for a, b in graphic_spans):
            continue                                   # would be hidden under a cutaway
        if any(abs(c["at"] - k["at"]) < min_gap or (k["at"] < c["until"] and c["at"] < k["until"])
               for k in chosen):
            continue                                   # too close to, or overlapping, one we kept
        chosen.append(c)
        if len(chosen) >= budget:
            break
    chosen.sort(key=lambda c: c["at"])

    # alternate the strength so a run of punches does not feel mechanical
    out = []
    for i, c in enumerate(chosen):
        scale = 1.14 if i % 2 == 0 else 1.22
        rf = {"in_s": round(c["at"], 2), "out_s": round(c["until"], 2),
              "scale": scale, "ease": c["ease"], "anchor": [0.5, 0.42], "_why": c["why"]}
        if c["ease"] == "push":
            rf["ramp_s"] = 0.8
        out.append(rf)
    return out


def main():
    ap = argparse.ArgumentParser(description="propose punch-ins and supporting graphics from the cut")
    ap.add_argument("project")
    ap.add_argument("--min-gap", type=float, default=7.0, help="min seconds between punches (default 7)")
    ap.add_argument("--max-punch-per-min", type=float, default=4.0,
                    help="punch budget per minute (default 4; lint warns above 6)")
    ap.add_argument("--min-graphic-gap", type=float, default=12.0,
                    help="min seconds between supporting graphics (default 12)")
    ap.add_argument("--no-graphics", action="store_true")
    ap.add_argument("--no-punches", action="store_true")
    a = ap.parse_args()

    project_dir = a.project if os.path.isabs(a.project) else os.path.abspath(a.project)
    if not os.path.isdir(project_dir):
        raise SystemExit(f"no such project dir: {project_dir}")
    work = os.path.join(project_dir, "work")

    words = load_words(project_dir)
    sents = sentences(words)
    end_s = words[-1]["e"]
    joins, had_cuts = load_cut_joins(project_dir)

    # ---- supporting graphics
    graphics = []
    if not a.no_graphics:
        last = -1e9
        for s in sents:
            kind, why = classify(s)
            if not kind or s["s"] - last < a.min_graphic_gap:
                continue
            graphics.append({
                "at_s": round(s["s"], 2),
                "until_s": round(min(s["e"] + 0.4, s["s"] + 9.0), 2),
                "kind": kind, "why": why,
                "line": s["text"][:160],
            })
            last = s["s"]
    gspans = [(g["at_s"], g["until_s"]) for g in graphics]

    reframes = [] if a.no_punches else plan_punches(
        sents, joins, end_s, a.min_gap, a.max_punch_per_min, gspans)

    out = {
        "project": os.path.basename(project_dir.rstrip("/\\")),
        "source": {"words": len(words), "sentences": len(sents), "length_s": round(end_s, 1),
                   "cut_joins": len(joins), "had_cuts_json": had_cuts},
        "reframes": [{k: v for k, v in r.items() if k != "_why"} for r in reframes],
        "graphics": graphics,
    }
    jpath = os.path.join(work, "edit-plan-auto.json")
    os.makedirs(work, exist_ok=True)
    with open(jpath, "w", encoding="utf-8") as f:
        json.dump(out, f, indent=2, ensure_ascii=False)

    # ---- the human-readable half
    lines = [f"# Auto edit plan: {out['project']}", "",
             f"{len(words)} words / {len(sents)} sentences over {end_s/60:.1f} min. ",
             ("Cut joins from cuts.json: **%d**." % len(joins)) if had_cuts else
             "**No cuts.json** — punches are placed from content only. Run /clean-cut first and "
             "re-run this to get the join-aligned punches, which are the valuable ones.",
             "", "PROPOSALS, not decisions. Delete what you disagree with.", "",
             "## Punch-ins", ""]
    if reframes:
        lines += ["| at | until | scale | ease | why |", "|---|---|---|---|---|"]
        for r in reframes:
            lines.append(f"| {r['in_s']:.2f}s | {r['out_s']:.2f}s | {r['scale']:.2f}x | "
                         f"{r['ease']} | {r['_why']} |")
        lines += ["", f"Density: {len(reframes)} over {end_s/60:.1f} min "
                      f"({len(reframes)/max(end_s/60,0.01):.1f}/min). Merge the `reframes` array "
                      f"from edit-plan-auto.json into work/timeline.json.", ""]
    else:
        lines += ["_none proposed_", ""]

    lines += ["## Supporting graphics", ""]
    if graphics:
        for g in graphics:
            lines += [f"### {g['at_s']:.2f}s -> {g['until_s']:.2f}s  ({g['kind']})",
                      f"> {g['line']}", "", f"Why: {g['why']}", ""]
        lines += [f"{len(graphics)} proposed. Build the ones you agree with as `cutaway` shots "
                  f"via /make-tsx, then re-run tools/lint_pacing.py.", ""]
    else:
        lines += ["_none proposed_", ""]

    mpath = os.path.join(work, "edit-plan-auto.md")
    with open(mpath, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))

    print(f"{len(words)} words / {len(sents)} sentences / {end_s/60:.1f} min")
    print(f"  cut joins : {len(joins)}" + ("" if had_cuts else "   (no cuts.json: content-only placement)"))
    print(f"  punches   : {len(reframes)}"
          + (f"  ({len(reframes)/max(end_s/60,0.01):.1f}/min)" if reframes else ""))
    kinds = {}
    for g in graphics:
        kinds[g["kind"]] = kinds.get(g["kind"], 0) + 1
    print(f"  graphics  : {len(graphics)}" + (f"  ({', '.join(f'{k} x{v}' for k, v in sorted(kinds.items()))})" if kinds else ""))
    print(f"  -> {os.path.relpath(mpath, ROOT)}")
    print(f"  -> {os.path.relpath(jpath, ROOT)}")


if __name__ == "__main__":
    main()
