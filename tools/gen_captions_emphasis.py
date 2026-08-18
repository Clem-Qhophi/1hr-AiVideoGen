#!/usr/bin/env python3
"""
gen_captions_emphasis.py — word-synced captions that STRESS the words that carry the point.

Step-2 companion for the AI Video Editor. Reads a project's edited-transcript.json, groups the
words into short spoken phrases, decides which words to emphasize, and writes a self-contained
Remotion overlay shot. Replaces tools/generate_captions.py, which routed through the LEGACY
server/shot_templates.py (see CLAUDE.md: do not build new video features there).

Two artifacts, and the plan is the editable one:
  <project>/work/caption-plan.json                 phrases + per-word emphasis flags  <- HAND-EDIT THIS
  remotion/src/shots/<project>/<Id>.tsx            the overlay shot (regenerated from the plan)

So the loop is: generate -> read the plan -> flip the `m` flags you disagree with -> --from-plan.
The heuristics get you ~80% there; the taste is yours.

Usage:
  python tools/gen_captions_emphasis.py videos/video-1
  python tools/gen_captions_emphasis.py videos/video-1 --vertical --emphasize "free,zero,instantly"
  python tools/gen_captions_emphasis.py videos/video-1 --from-plan        # after editing the plan
  python tools/gen_captions_emphasis.py videos/video-1 --wire             # + add it to timeline.json

Then: node remotion/scripts/gen-registry.mjs
      cd remotion && node scripts/render-all.mjs --scale=1 <Id>      (transparent -> out/<Id>.mov)
      python tools/bake.py videos/video-1/work/timeline.json
"""
import argparse
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# ---------------------------------------------------------------- emphasis vocabulary

STOPWORDS = {
    "a", "an", "and", "are", "as", "at", "be", "been", "but", "by", "can", "did", "do", "does",
    "for", "from", "get", "got", "had", "has", "have", "he", "her", "here", "him", "his", "how",
    "i", "if", "in", "into", "is", "it", "its", "just", "like", "me", "my", "no", "not", "of",
    "on", "one", "or", "our", "out", "over", "put", "say", "see", "she", "so", "some", "than",
    "that", "the", "their", "them", "then", "there", "these", "they", "this", "those", "to",
    "up", "us", "very", "was", "we", "were", "what", "when", "where", "which", "who", "why",
    "will", "with", "would", "you", "your", "am", "any", "because", "been", "being", "could",
    "make", "made", "want", "went", "going", "go", "know", "think", "thing", "things", "way",
}

# words that ARE the point when a sentence lands on them
INTENSIFIERS = {
    "never", "always", "every", "everything", "everyone", "nobody", "nothing", "only", "free",
    "instantly", "instant", "zero", "none", "huge", "massive", "tiny", "best", "worst", "fastest",
    "slowest", "cheapest", "impossible", "actually", "literally", "completely", "entirely",
    "exactly", "insane", "crazy", "brutal", "perfect", "broken", "wrong", "right", "worse",
    "better", "double", "triple", "half", "twice", "again", "finally", "immediately", "forever",
    "guaranteed", "proven", "real", "fake", "secret", "biggest", "smallest", "hardest", "easiest",
    "first", "last", "worthless", "useless", "essential", "critical", "must", "stop", "start",
}

NUMBER_WORDS = {
    "zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten",
    "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen",
    "nineteen", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety",
    "hundred", "thousand", "million", "billion", "trillion", "percent", "dollars", "dollar",
    "minutes", "minute", "seconds", "second", "hours", "hour", "days", "day", "weeks", "week",
    "months", "month", "years", "year",
}

SENT_END = re.compile(r"[.!?]$")
CLAUSE_END = re.compile(r"[,;:]$")


def norm(word):
    """Bare comparable form of a token: lowercase, no surrounding punctuation."""
    return re.sub(r"^[^\w$%]+|[^\w$%]+$", "", word.lower())


# ---------------------------------------------------------------- transcript -> phrases

def load_words(project_dir):
    p = os.path.join(project_dir, "work", "edited-transcript.json")
    if not os.path.exists(p):
        raise SystemExit(f"no transcript: {p}\n(run /clean-cut step 11, or the director's word_timing stage)")
    data = json.load(open(p, encoding="utf-8"))
    raw = data.get("words") or []
    if not raw:
        raise SystemExit(f"{p} has no words[]")
    out = []
    for w in raw:
        text = (w.get("text") if "text" in w else w.get("t")) or ""
        s = w.get("start", w.get("s"))
        e = w.get("end", w.get("e"))
        if not text.strip() or s is None or e is None:
            continue
        out.append({"t": text.strip(), "s": int(s), "e": int(e)})
    out.sort(key=lambda w: w["s"])
    return out


def group_phrases(words, max_words, gap_ms):
    """Break the word stream into readable on-screen chunks.

    Breaks at sentence end, at a clause end that is already long enough, at a real pause,
    and at max_words. Chunking on PUNCTUATION AND PAUSES (not a fixed word count) is what
    makes the line on screen match the line being spoken.
    """
    phrases, cur = [], []
    for i, w in enumerate(words):
        cur.append(w)
        nxt = words[i + 1] if i + 1 < len(words) else None
        pause = (nxt["s"] - w["e"]) if nxt else 10 ** 9
        brk = (nxt is None
               or SENT_END.search(w["t"])
               or pause >= gap_ms
               or len(cur) >= max_words
               or (CLAUSE_END.search(w["t"]) and len(cur) >= max_words - 1))
        if brk:
            phrases.append({"s": cur[0]["s"], "e": cur[-1]["e"], "w": cur})
            cur = []
    if cur:
        phrases.append({"s": cur[0]["s"], "e": cur[-1]["e"], "w": cur})
    return phrases


# ---------------------------------------------------------------- emphasis selection

def score_word(w, nxt, is_phrase_last, forced, never, keyterms):
    """How much this word wants to be stressed. 0 = leave it alone."""
    n = norm(w["t"])
    if not n or n in never:
        return 0, ""
    if n in forced:
        return 100, "forced"
    if n in keyterms:
        return 60, "keyterm"
    # digits/currency/percent first: "$5", "3x", "60%" are the point even when short
    if re.search(r"\d", n) or n.startswith("$") or n.endswith("%"):
        return 50, "number"
    # ...but a spelled-out number only counts if it is not doing stopword duty ("one of the")
    if n in STOPWORDS or len(n) < 3:
        return 0, ""
    if n in NUMBER_WORDS:
        return 50, "number"
    if n in INTENSIFIERS:
        return 40, "intensifier"
    # a word the speaker leaves hanging before a real pause is a word they stressed
    if nxt is not None and (nxt["s"] - w["e"]) >= 350:
        return 30, "pre-pause"
    # only a real SENTENCE landing, not every 4-word chunk boundary, is worth stressing
    if is_phrase_last and SENT_END.search(w["t"]) and len(n) >= 4:
        return 20, "sentence-end"
    return 0, ""


def pick_emphasis(phrases, words, forced, never, keyterms, max_frac):
    """At most one stress per phrase (two only when both are strong and the phrase is long),
    then a global cap so the screen is not shouting the whole time."""
    idx = {id(w): i for i, w in enumerate(words)}
    picks = []
    for ph in phrases:
        scored = []
        for j, w in enumerate(ph["w"]):
            gi = idx[id(w)]
            nxt = words[gi + 1] if gi + 1 < len(words) else None
            sc, why = score_word(w, nxt, j == len(ph["w"]) - 1, forced, never, keyterms)
            if sc:
                scored.append((sc, gi, w, why))
        scored.sort(key=lambda x: (-x[0], x[1]))
        take = scored[:1]
        if len(ph["w"]) >= 5 and len(scored) >= 2 and scored[1][0] >= 50:
            take = scored[:2]
        picks.extend(take)

    cap = max(1, int(len(words) * max_frac))
    picks.sort(key=lambda x: (-x[0], x[1]))
    keep = {p[1] for p in picks[:cap]}
    for sc, gi, w, why in picks:
        w["m"] = 1 if gi in keep else 0
        if gi in keep:
            w["why"] = why
    for w in words:
        w.setdefault("m", 0)
    return sum(1 for w in words if w["m"])


def load_keyterms(path):
    if not path or not os.path.exists(path):
        return set()
    terms = set()
    for line in open(path, encoding="utf-8"):
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        for tok in line.split():          # "Claude Code" -> both words stress-eligible
            n = norm(tok)
            if len(n) >= 3:
                terms.add(n)
    return terms


# ---------------------------------------------------------------- TSX emission

TSX = '''import React from 'react';
import {{ useCurrentFrame, interpolate, AbsoluteFill }} from 'remotion';
import {{ COLORS, RADIUS, EASINGS }} from '../../brand';
import {{ FONT_DISPLAY }} from '../../fonts';
import {{ CLAMP }} from '../../lib/kit';

// AUTO-GENERATED by tools/gen_captions_emphasis.py from {plan_rel}
// Re-run with --from-plan after editing the plan; hand edits to this file are overwritten.

export const compositionConfig = {{
  id: '{shot_id}',
  durationInSeconds: {duration},
  fps: {fps},
  width: {width},
  height: {height},
  transparent: true,
}};

// The colour the stressed word turns. Warm yellow reads over almost any footage; the brand
// indigo does not survive a dark background, which is where a talking head usually sits.
const EM_COLOR = COLORS.warn;
// How a stressed word is marked. Flip this here without regenerating:
//   'color'     colour + scale pop only (cleanest, safest over busy footage)
//   'box'       highlighter wipes in behind the word and the text flips to ink (loudest)
//   'underline' accent bar draws under the word (middle ground)
// typed as `string` on purpose: TS narrows a union-typed const to its literal
// initializer ('color'), which turns the style comparisons below into TS2367.
// The generator's --em-style choices already restrict the value.
const EM_STYLE: string = '{em_style}';
const FS = {font_size};
const PAD_BOTTOM = {pad_bottom};

// [{{ s, e, w: [{{ t: word, s: startMs, e: endMs, m: 1 if stressed }}] }}] — REAL times from edited-transcript.json
const PHRASES = {phrases};

const {comp_name}: React.FC = () => {{
  const frame = useCurrentFrame();
  const tMs = (frame / {fps}) * 1000;

  // current phrase = the last one that has started
  let pi = -1;
  for (let i = 0; i < PHRASES.length; i++) {{
    if (PHRASES[i].s <= tMs) pi = i;
    else break;
  }}
  if (pi < 0) return null;
  const ph = PHRASES[pi];

  // HOLD the line until the next one starts. Clearing at ph.e made captions blink out and
  // straight back in across every natural half-second pause; only a real gap (>1.2s) clears.
  const nextS = pi + 1 < PHRASES.length ? PHRASES[pi + 1].s : null;
  const clearAt = nextS === null ? ph.e + 600 : Math.min(nextS, ph.e + 1200);
  if (tMs > clearAt) return null;

  const inF = (ph.s / 1000) * {fps};
  const outF = (clearAt / 1000) * {fps};
  const fadeIn = interpolate(frame, [inF - 3, inF + 3], [0, 1], CLAMP);
  const fadeOut = interpolate(frame, [outF - 4, outF], [1, 0], CLAMP);
  const vis = Math.min(fadeIn, fadeOut);
  const rise = interpolate(frame, [inF - 3, inF + 4], [10, 0], {{ ...CLAMP, easing: EASINGS.easeOut }});

  // index of the word being spoken right now, for the live-read highlight
  let cur = -1;
  for (let i = 0; i < ph.w.length; i++) {{
    if (ph.w[i].s <= tMs) cur = i;
    else break;
  }}

  return (
    <AbsoluteFill style={{{{
      // AbsoluteFill is flexDirection:'column', so justifyContent is the VERTICAL axis and
      // alignItems is the HORIZONTAL one. flex-end + center == bottom-centre.
      justifyContent: 'flex-end', alignItems: 'center',
      paddingBottom: PAD_BOTTOM, pointerEvents: 'none',
      opacity: vis, transform: `translateY(${{rise}}px)`,
    }}}}>
      <div style={{{{
        display: 'flex', gap: FS * 0.34, flexWrap: 'wrap', justifyContent: 'center',
        alignItems: 'baseline', maxWidth: {max_width},{backdrop}
      }}}}>
        {{ph.w.map((w, i) => {{
          const startF = (w.s / 1000) * {fps};
          const spoken = interpolate(frame, [startF - 2, startF + 2], [0.38, 1], CLAMP);
          // stressed words pop on their own onset and settle a touch above the line
          const popF = frame - startF;
          const pop = w.m
            ? interpolate(popF, [0, 5, 12], [0, 1, 0.5], {{ ...CLAMP, easing: EASINGS.overshoot }})
            : 0;
          // the highlighter wipes across the word as it is said, left to right
          const boxed = w.m && EM_STYLE === 'box';
          const underlined = w.m && EM_STYLE === 'underline';
          const wipe = boxed || underlined
            ? interpolate(popF, [0, 7], [0, 1], {{ ...CLAMP, easing: EASINGS.easeOut }})
            : 0;
          // a boxed word flips to ink once the highlighter is actually behind it
          const inkOnBox = boxed && wipe > 0.55;
          const isCur = i === cur;
          return (
            <span key={{i}} style={{{{
              position: 'relative', display: 'inline-block',
              opacity: spoken,
              transform: `scale(${{1 + 0.16 * pop + (isCur && !w.m ? 0.03 : 0)}}) translateY(${{-FS * 0.06 * pop}}px)`,
              transformOrigin: 'center bottom',
            }}}}>
              {{boxed ? (
                <span style={{{{
                  position: 'absolute', left: -FS * 0.14, right: -FS * 0.14,
                  top: FS * 0.04, bottom: -FS * 0.02,
                  background: EM_COLOR, borderRadius: FS * 0.14,
                  transform: `scaleX(${{wipe}})`, transformOrigin: 'left center',
                }}}} />
              ) : null}}
              {{underlined ? (
                <span style={{{{
                  position: 'absolute', left: 0, right: 0, bottom: -FS * 0.14,
                  height: FS * 0.09, background: EM_COLOR, borderRadius: FS * 0.05,
                  transform: `scaleX(${{wipe}})`, transformOrigin: 'left center',
                }}}} />
              ) : null}}
              <span style={{{{
                position: 'relative',
                fontFamily: FONT_DISPLAY,
                fontWeight: w.m ? 700 : 600,
                fontSize: FS,
                lineHeight: 1.18,
                color: inkOnBox ? COLORS.d900 : (w.m ? EM_COLOR : '#ffffff'),
                textShadow: inkOnBox ? 'none' : '0 3px 14px rgba(0,0,0,0.85), 0 1px 3px rgba(0,0,0,0.9)',
                whiteSpace: 'pre',
              }}}}>
                {{w.t}}
              </span>
            </span>
          );
        }})}}
      </div>
    </AbsoluteFill>
  );
}};

export default {comp_name};
'''

BACKDROP = ("\n        background: 'rgba(13, 17, 23, 0.62)', borderRadius: RADIUS.card,"
            "\n        padding: `${FS * 0.34}px ${FS * 0.62}px`, backdropFilter: 'blur(8px)',")


def write_tsx(plan, project_name, out_dir, plan_rel):
    shot_id = plan["id"]
    # shot_id (e.g. "EmphasisCaptions-qt-funded-ad-v2") is a fine compositionConfig.id STRING but
    # not a valid JS identifier/export name -- hyphens break esbuild ("Expected ';' but found '-'").
    # comp_name is the sanitized PascalCase-ish form for the const/export; shot_id stays as-is for
    # the id field and the filename, since the registry keys on the id string, not the JS name.
    comp_name = re.sub(r"[^A-Za-z0-9]", "", shot_id) or "EmphasisCaptions"
    if comp_name[0].isdigit():
        comp_name = "C" + comp_name
    W, H, fps = plan["width"], plan["height"], plan["fps"]
    phrases = [{"s": p["s"], "e": p["e"],
                "w": [{"t": w["t"], "s": w["s"], "e": w["e"], "m": w.get("m", 0)} for w in p["w"]]}
               for p in plan["phrases"]]
    src = TSX.format(
        plan_rel=plan_rel.replace("\\", "/"),
        shot_id=shot_id,
        comp_name=comp_name,
        duration=round(plan["duration_s"], 2),
        fps=fps, width=W, height=H,
        em_style=plan.get("em_style", "color"),
        font_size=plan["font_size"],
        pad_bottom=plan["pad_bottom"],
        max_width=int(W * 0.84),
        backdrop="" if plan.get("clean") else BACKDROP,
        phrases=json.dumps(phrases, ensure_ascii=False),
    )
    os.makedirs(out_dir, exist_ok=True)
    path = os.path.join(out_dir, shot_id + ".tsx")
    with open(path, "w", encoding="utf-8") as f:
        f.write(src)
    return path


def wire_timeline(project_dir, shot_id, duration_s):
    """Add (or refresh) the captions overlay in timeline.json, spanning the whole video."""
    tl_path = os.path.join(project_dir, "work", "timeline.json")
    if not os.path.exists(tl_path):
        print(f"  --wire: no {tl_path} yet; add the overlay by hand when you make one")
        return
    tl = json.load(open(tl_path, encoding="utf-8"))
    end = float(tl.get("preview", {}).get("end_s", duration_s))
    tl["shots"] = [s for s in tl.get("shots", []) if s.get("id") != shot_id]
    tl["shots"].append({"id": shot_id, "type": "overlay", "master_in_s": 0.0,
                        "master_out_s": round(end, 2), "cue": "emphasis captions (whole video)"})
    with open(tl_path, "w", encoding="utf-8") as f:
        json.dump(tl, f, indent=2)
    print(f"  wired into {os.path.relpath(tl_path, ROOT)} as overlay 0..{end:.2f}s")


# ---------------------------------------------------------------- main

def main():
    ap = argparse.ArgumentParser(description="word-synced captions with emphasis, for Remotion")
    ap.add_argument("project", help="project dir, e.g. videos/video-1")
    ap.add_argument("--id", default=None,
                    help="shot id + filename (default: EmphasisCaptions-<project>, e.g. "
                         "EmphasisCaptions-qt-funded-ad-v2). The registry is GLOBAL across every "
                         "project's shots (remotion/src/shots/**), keyed by compositionConfig.id — "
                         "the plain 'EmphasisCaptions' every project used to default to collides "
                         "the moment two projects both use this tool, and gen-registry.mjs silently "
                         "drops the second one (alphabetically-later project folder loses) rather "
                         "than erroring. Caught on qt-funded-ad-v2 (2026-08-09): its overlay was "
                         "silently dropped in favor of grok-imagine-image-2's same-named shot, so "
                         "the baked master shipped a DIFFERENT PROJECT's captions -- a 45-minute "
                         "wrong render that passed check_deliverable.py's caption checks anyway, "
                         "because they check presence/coverage, not content. Only pass --id "
                         "explicitly if you specifically want to reuse another project's overlay.")
    ap.add_argument("--fps", type=int, default=30)
    ap.add_argument("--size", default="1920x1080", help="WxH (default 1920x1080)")
    ap.add_argument("--vertical", action="store_true", help="shorthand for --size 1080x1920")
    ap.add_argument("--group", type=int, default=4, help="max words per on-screen phrase (default 4)")
    ap.add_argument("--gap", type=float, default=0.45, help="pause that breaks a phrase, seconds (default 0.45)")
    ap.add_argument("--emphasize", default="", help="comma list: always stress these")
    ap.add_argument("--never", default="", help="comma list: never stress these")
    ap.add_argument("--max-em", type=float, default=0.16, help="cap on fraction of words stressed (default 0.16)")
    ap.add_argument("--keyterms", default=None, help="keyterms file (default <project>/work/keyterms.txt)")
    ap.add_argument("--clean", action="store_true", help="no backdrop panel, text + shadow only")
    ap.add_argument("--em-style", default="color", choices=["color", "box", "underline"],
                    help="how a stressed word is marked (default color); also editable in the TSX")
    ap.add_argument("--plan-only", action="store_true",
                    help="write caption-plan.json and stop — for the LONG-FORM path, where "
                         "gen_captions_ass.py consumes the plan and no Remotion shot is wanted")
    ap.add_argument("--from-plan", action="store_true", help="rebuild the TSX from an edited caption-plan.json")
    ap.add_argument("--wire", action="store_true", help="also add the overlay to timeline.json")
    a = ap.parse_args()

    project_dir = a.project if os.path.isabs(a.project) else os.path.abspath(a.project)
    if not os.path.isdir(project_dir):
        raise SystemExit(f"no such project dir: {project_dir}")
    project_name = os.path.basename(project_dir.rstrip("/\\"))
    if a.id is None:
        a.id = f"EmphasisCaptions-{project_name}"
    work = os.path.join(project_dir, "work")
    os.makedirs(work, exist_ok=True)
    plan_path = os.path.join(work, "caption-plan.json")
    shots_dir = os.path.join(ROOT, "remotion", "src", "shots", project_name)

    if a.from_plan:
        if not os.path.exists(plan_path):
            raise SystemExit(f"--from-plan but no {plan_path}")
        plan = json.load(open(plan_path, encoding="utf-8"))
        path = write_tsx(plan, project_name, shots_dir, os.path.relpath(plan_path, ROOT))
        em = sum(w.get("m", 0) for p in plan["phrases"] for w in p["w"])
        print(f"rebuilt from plan: {len(plan['phrases'])} phrases, {em} stressed")
        print(f"  -> {os.path.relpath(path, ROOT)}")
        if a.wire:
            wire_timeline(project_dir, plan["id"], plan["duration_s"])
        return

    W, H = (1080, 1920) if a.vertical else tuple(int(x) for x in a.size.lower().split("x"))

    words = load_words(project_dir)
    phrases = group_phrases(words, a.group, int(a.gap * 1000))
    forced = {norm(x) for x in a.emphasize.split(",") if x.strip()}
    never = {norm(x) for x in a.never.split(",") if x.strip()}
    kt_path = a.keyterms or os.path.join(work, "keyterms.txt")
    keyterms = load_keyterms(kt_path)
    n_em = pick_emphasis(phrases, words, forced, never, keyterms, a.max_em)

    plan = {
        "id": a.id,
        "project": project_name,
        "fps": a.fps, "width": W, "height": H,
        "duration_s": round(words[-1]["e"] / 1000 + 0.5, 2),
        # a 16:9 caption sits just above the lower edge; a 9:16 one sits clear of the phone UI
        "font_size": 54 if W >= H else 62,
        "pad_bottom": 96 if W >= H else int(H * 0.20),
        "clean": bool(a.clean),
        "em_style": a.em_style,
        "phrases": phrases,
    }
    with open(plan_path, "w", encoding="utf-8") as f:
        json.dump(plan, f, indent=2, ensure_ascii=False)
    path = None if a.plan_only else write_tsx(plan, project_name, shots_dir,
                                              os.path.relpath(plan_path, ROOT))

    print(f"{len(words)} words -> {len(phrases)} phrases over {plan['duration_s']:.1f}s  "
          f"({W}x{H}@{a.fps})")
    print(f"stressed {n_em} words ({n_em / len(words) * 100:.1f}%)"
          + (f", keyterms from {os.path.relpath(kt_path, ROOT)}" if keyterms else ", no keyterms file"))
    shown = [(w["t"], w.get("why", "")) for w in words if w.get("m")][:24]
    print("  " + ", ".join(f"{t}[{why}]" for t, why in shown) + (" ..." if n_em > 24 else ""))
    print(f"  plan -> {os.path.relpath(plan_path, ROOT)}   (edit `m` flags, then --from-plan)")
    if path:
        print(f"  shot -> {os.path.relpath(path, ROOT)}")
    if a.wire:
        wire_timeline(project_dir, a.id, plan["duration_s"])
    print("next: node remotion/scripts/gen-registry.mjs && "
          f"cd remotion && node scripts/render-all.mjs --scale=1 {a.id}")


if __name__ == "__main__":
    main()
