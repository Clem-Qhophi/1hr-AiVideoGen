#!/usr/bin/env python3
"""
clip_shorts.py — turn a finished long-form MASTER into a YouTube Short (9:16, <= 3 min).

The shorts pipeline, wired to the existing repo conventions:

  1. `propose <source>`  — recommend clip windows ("the interesting segments") by scoring the
     long-form's own word-timed narration (work/caption-plan.json, else edited-transcript.json).
     Words are weighted by emphasis/stress + number mentions + sentence beats; windows snap to
     phrase/sentence boundaries and the closing CTA region is excluded — so a clip ends on a
     payoff that pulls to the long-form ("watch the full video" loop), never mid-word.
     THE LOOP STRATEGY (on by default): a Short that ends right before its own payoff — or on
     an open question — turns the "Full video" description link from an afterthought into the
     reason the swipe stopped. `propose --loop` marks such windows ("cut BEFORE payoff: …");
     `clip --loop` performs the cut: it withholds the window's strongest sentence and records
     it, and `package` dangles the withheld payoff under the link in the description.
  2. `clip <source>`     — trim the MASTER to the window, recompose to 9:16 1080x1920 (center
     crop of the 16:9 frame + lanczos upscale), re-encode audio (the master is already a -14
     LUFS mix — the clip inherits it). If the master has NO burned captions (spec says overlay),
     `--captions burn` rebuilds ASS captions for the window only, time-shifted to the clip, at a
     Short-sized font. Extracts a mid clip frame for the mandatory eyeball before upload.
  3. `verify <slug>`     — the shorts deliverable gate: vertical, <= 180 s, has audio.
  4. `package <slug>`    — writes shorts/<slug>/packaging/publish.json + description.txt for
     tools/yt_upload.py. The description's FIRST LINE is the redirect link to the long-form
     (the Short converts to the long-form). Enforces (warns) the cadence rule: max one public
     flip per channel per day.

A Short lives or dies in the first 1.5 s; `propose` biases towards the strongest spoken beats
without fabricating a hook — the clip is the long-form's own words, so the source niche's
honesty_guard carries over untouched.

The LOOP is always on (opt out with --no-loop): a Short that ends right before its payoff — or
exactly on its final word, never on dead air — reads as a continuation when it restarts, and the
"Full video" link in the description is the close. A 5-pick batch is de-duplicated by hook words,
loop endings and video section, so the clips never feel like five versions of the same moment.

Usage:
  python tools/clip_shorts.py propose videos/ai-kill-switch --clips 4 --duration 30
  python tools/clip_shorts.py clip videos/ai-kill-switch --start 20 --end 65 --name kill-switch-bill
  python tools/clip_shorts.py batch videos/ai-kill-switch --clips 5 --duration 30
  python tools/clip_shorts.py verify shorts/kill-switch-bill
  python tools/clip_shorts.py package shorts/kill-switch-bill --title "..."
  python tools/yt_upload.py upload shorts/kill-switch-bill/packaging/publish.json --channel ai-news
"""
import argparse
import json
import os
import re
import subprocess
import sys
import time
import datetime as dt
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

ROOT = Path(__file__).resolve().parent.parent
VIDEOS = ROOT / "videos"
SHORTS = ROOT / "shorts"

MAX_SHORT_S = 180  # YouTube Shorts: vertical, <= 3 min
VW, VH = 1080, 1920  # target 9:16

ENT_END = re.compile(r"[.!?]$")         # sentence-final punctuation (same rule as gen_captions_ass.py)
NUMBER_RX = re.compile(r"\d")
CTA_RX = re.compile(r"\b(subscrib(?:e|ing|ed)|follow(?:ing)?|like|share|comment|watch the full|next video)\b", re.I)
# words that open a clip mid-story: "And then…" / "So basically…" read as continuation, not a
# hook. A standalone Short should open like a fresh video, not like you walked in mid-sentence.
CONT_START = {"so", "but", "and", "now", "then", "also", "well", "okay", "ok", "anyway",
              "because", "though", "actually", "basically", "meanwhile", "anyway"}

DEFAULT_TAGS = ["shorts", "youtubeshorts"]


def slugify(s: str) -> str:
    return re.sub(r"[^a-z0-9-]+", "-", s.lower()).strip("-")


# ---------------------------------------------------------------- ffmpeg plumbing

def best_h264():
    """Same probe-don't-assume rule as gen_captions_ass.py/build_longform.py: QSV is ~4x
    libx264 on this machine, but only use an encoder that actually works."""
    for name, opts in (("h264_nvenc", ["-preset", "p5", "-rc", "vbr", "-cq", "22", "-b:v", "0"]),
                       ("h264_qsv", ["-global_quality", "22", "-preset", "medium"]),
                       ("h264_amf", ["-quality", "quality", "-rc", "cqp", "-qp_i", "22", "-qp_p", "22"]),
                       ("h264_mf", ["-rate_control", "quality", "-quality", "70"])):
        r = subprocess.run(["ffmpeg", "-v", "error", "-f", "lavfi", "-i", "nullsrc=s=256x256:d=1",
                            "-frames:v", "1", "-c:v", name, "-f", "null", "-"],
                           capture_output=True, text=True)
        if r.returncode == 0 and "Could not open encoder" not in (r.stderr or ""):
            return name, opts
    return "libx264", ["-preset", "veryfast", "-crf", "20"]


def parse_time(s: str) -> float:
    """'65' | '1:05' | '0:01:05.5' -> seconds."""
    parts = [float(x) for x in s.strip().split(":")]
    if len(parts) == 1:
        return parts[0]
    if len(parts) == 2:
        return parts[0] * 60 + parts[1]
    return parts[0] * 3600 + parts[1] * 60 + parts[2]


def fmt_ts(sec: float) -> str:
    sec = max(0, int(round(sec)))
    h, rem = divmod(sec, 3600)
    m, s = divmod(rem, 60)
    return f"{h}:{m:02d}:{s:02d}" if h else f"{m}:{s:02d}"


def ffprobe(path: Path) -> dict:
    """-> dict(w, h, dur_s, audio). Raises SystemExit with a message on failure."""
    r = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v", "-show_entries",
                        "stream=width,height:format=duration", "-of", "json", str(path)],
                       capture_output=True, text=True)
    if r.returncode != 0 or not r.stdout.strip():
        raise SystemExit(f"ffprobe failed on {path}: {(r.stderr or '')[-800:]}")
    d = json.loads(r.stdout)
    st = d.get("streams", [{}])[0]
    ra = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "a", "-show_entries",
                         "stream=codec_name", "-of", "json", str(path)],
                        capture_output=True, text=True)
    has_audio = False
    try:
        has_audio = bool(json.loads(ra.stdout).get("streams"))
    except (json.JSONDecodeError, KeyError):
        pass
    return {"w": st.get("width"), "h": st.get("height"),
            "dur_s": float(d.get("format", {}).get("duration", 0) or 0),
            "audio": has_audio}


# ---------------------------------------------------------------- source discovery

def norm_source(source: str) -> str:
    """Accept 'ai-kill-switch' or 'videos/ai-kill-switch'; the repo convention is the bare slug
    (yt_upload.py uses videos/<slug>)."""
    return re.sub(r"^videos[/\\]", "", source.strip())


def find_master(source: str) -> Path:
    """The MASTER is what ships: SFX/music copied video through, so it carries the burned
    captions and the -14 LUFS mix. Prefer the publishing plan's path, then output/*-MASTER.mp4,
    then any output/*.mp4 (newest)."""
    source = norm_source(source)
    project = VIDEOS / source
    if not project.is_dir():
        raise SystemExit(f"no such project: videos/{source}")
    plan_path = project / "packaging" / "publish.json"
    if plan_path.exists():
        try:
            plan = json.loads(plan_path.read_text(encoding="utf-8"))
            v = plan.get("video")
            if v and Path(v).exists():
                return Path(v)
        except (json.JSONDecodeError, OSError):
            pass
    candidates = []
    out = project / "output"
    if out.is_dir():
        for pat in (f"{source}-MASTER.mp4", f"{source}-captioned.mp4", f"{source}-music.mp4",
                    f"{source}-sfx.mp4", f"{source}-preview.mp4"):
            p = out / pat
            if p.exists():
                candidates.append((p.stat().st_mtime, p))
        candidates.sort(reverse=True)
    if candidates:
        return candidates[0][1]
    raise SystemExit(f"no mastered video for videos/{source} — tried packaging/publish.json "
                     f"and output/*.mp4")


def load_words(source: str) -> list[dict]:
    """Word tokens [{t, s_ms, e_ms, m}] from the tuned caption-plan (hand-tuned emphasis carries
    over), else from the edited transcript. Times in milliseconds, matching caption-plan.json."""
    source = norm_source(source)
    p1 = VIDEOS / source / "work" / "caption-plan.json"
    p2 = VIDEOS / source / "work" / "edited-transcript.json"
    if p1.exists():
        try:
            plan = json.loads(p1.read_text(encoding="utf-8"))
            words = []
            for ph in plan.get("phrases", []):
                for w in ph.get("w", []):
                    words.append({"t": w.get("t", ""), "s": int(w.get("s", 0)),
                                  "e": int(w.get("e", 0)), "m": int(w.get("m", 0) or 0)})
            if words:
                return words
        except (json.JSONDecodeError, OSError):
            pass
    if p2.exists():
        try:
            return [{"t": w.get("text", ""), "s": int(w.get("start", 0)),
                     "e": int(w.get("end", 0)), "m": 0}
                    for w in json.loads(p2.read_text(encoding="utf-8")).get("words", [])]
        except (json.JSONDecodeError, KeyError, OSError):
            pass
    raise SystemExit(f"need work/caption-plan.json or work/edited-transcript.json in videos/"
                     f"{source} — the source video has no word timing to clip against")


def niche_of(source: str):
    source = norm_source(source)
    sp = VIDEOS / source / "work" / "spec.json"
    if sp.exists():
        try:
            return json.loads(sp.read_text(encoding="utf-8")).get("niche")
        except json.JSONDecodeError:
            pass
    return None


def longform_watch_url(source: str) -> str | None:
    source = norm_source(source)
    pub = VIDEOS / source / "packaging" / "published.json"
    if pub.exists():
        try:
            d = json.loads(pub.read_text(encoding="utf-8"))
            return d.get("watch_url")
        except (json.JSONDecodeError, OSError):
            pass
    return None


# ---------------------------------------------------------------- propose (window picker)

def word_weight(w: dict) -> int:
    """Emphasis (m=1) and numbers carry the point; sentence-final words land the beat. This is
    the honest proxy for 'interesting', and it is a heuristic — the picks are proposals."""
    k = 0
    if w["m"]:
        k += 3
    if NUMBER_RX.search(w["t"]):
        k += 2
    if len(w["t"]) >= 7:
        k += 1
    if ENT_END.search(w["t"]):
        k += 2
    return k


def split_sentences(words: list[dict]) -> list[dict]:
    """Words (ms) -> sentences [{start_s, end_s, q, energy, text}]. Bounded by sentence-final
    punctuation, with a safety cap so a run-on can't become one giant sentence."""
    sents, cur = [], []
    for wi in words:
        cur.append(wi)
        if ENT_END.search(wi["t"]) or len(cur) >= 40:
            sents.append(cur)
            cur = []
    if cur:
        sents.append(cur)
    out = []
    for s in sents:
        out.append({"words": s, "start": s[0]["s"] / 1000.0, "end": s[-1]["e"] / 1000.0,
                    "q": any("?" in w["t"] for w in s), "energy": sum(word_weight(w) for w in s),
                    "text": " ".join(w["t"] for w in s)})
    return out


def loop_adjust(sentences: list[dict], s0: float, e1: float, min_dur: float):
    """The loop strategy: a Short ends on an OPEN loop and the 'Full video' link is the close.
    Two genuine loop endings, in order of preference:
      * cut-before-payoff — the window's strongest sentence (energy >= 5, not the first one) is
        WITHHELD, and the clip ends just before it. The withheld sentence is the reason to click.
      * ends-on-question  — the window's last sentence is a question; the loop is the answer.
    Returns (new_end, payoff_text_or_None, loop_kind_or_None). Falls back to the window as-is."""
    inside = [s for s in sentences if s["end"] >= s0 and s["start"] <= e1]
    if not inside:
        return e1, None, None
    rest = [s for s in inside[1:] if s["start"] - s0 >= 2.0]
    payoff = max(rest, key=lambda s: s["energy"], default=None)
    if payoff and payoff["energy"] >= 5 and payoff["start"] - 0.05 - s0 >= min_dur:
        return payoff["start"] - 0.05, payoff["text"][:90], "cut-before-payoff"
    if inside[-1]["q"] and inside[-1]["end"] - s0 >= min_dur:
        return e1, None, "ends-on-question"
    return e1, None, None


def build_windows(source: str, target_dur: float, min_dur: float, count: int,
                  loop: bool = True) -> list[dict]:
    """Sliding window over the narration; snap start to a word onset and end to a sentence-final
    word; skip windows inside the last 60s (closing CTA region). With loop=True, prefer windows
    whose payoff can be withheld (see loop_adjust). A batch of picks must NOT feel repetitive:
    overlap, repeated hooks, repeated loop endings and windows from the same section of the video
    are rejected before the count is filled (then the rules relax so thin videos still fill).
    Times in seconds."""
    words = load_words(source)
    if not words:
        raise SystemExit("no words in transcript")
    total = max(w["e"] for w in words) / 1000.0
    # exclude the closing CTA region (last 60s) only when there IS one — a source shorter than
    # ~90s has no dedicated CTA tail worth excluding, and cut_off=0 would zero every window.
    cut_off = max(0.0, total - 60) if total > 90 else total + 1
    sentences = split_sentences(words) if loop else []
    sent_starts = {s["start"] for s in sentences}  # clean openings: sentence beginnings

    tokens = [{"t": w["t"], "s": w["s"] / 1000.0, "e": w["e"] / 1000.0, "w": word_weight(w)}
              for w in words]
    starts = sorted({t["s"] for t in tokens})  # candidate window starts (word onsets)

    out = []
    hard_open = len(starts) >= count * 8   # plenty of candidates -> demand clean sentence opens
    for s0 in starts:
        if s0 >= cut_off or s0 + min_dur > total:
            continue
        if hard_open and s0 not in sent_starts:
            continue                       # a Short that opens mid-sentence loses the first second
        end_target = s0 + target_dur
        box = [t for t in tokens if s0 - 0.5 <= t["s"] and t["e"] <= end_target + 2.0]
        if not box:
            continue
        e0 = max(t["e"] for t in box)
        score = sum(t["w"] for t in box)
        n_em = sum(1 for t in box if t["w"] >= 3)
        dur = e0 - s0
        if dur < min_dur:
            continue

        kind, payoff, bonus = None, None, 0
        if loop:
            e_new, payoff, kind = loop_adjust(sentences, s0, e0, min_dur)
            if kind == "cut-before-payoff":
                e0, bonus = e_new, 5     # a withheld payoff is worth more than the words it cuts
            elif kind == "ends-on-question":
                bonus = 2
            dur = e0 - s0
            if dur < min_dur:
                continue

        box = [t for t in tokens if s0 - 0.5 <= t["s"] and t["e"] <= e0]
        # preview words must be HONEST about the open: show what the clip actually starts on
        # (the scoring box above includes a 0.5s lookback word that the encode does NOT use)
        first = " ".join(t["t"] for t in box if t["s"] >= s0)[:60]
        last = " ".join(t["t"] for t in box[-6:])
        # viral-factor penalties (soft — thin videos still get picks):
        #   - opening mid-sentence: a Short that starts on "…so we did" loses viewers in the
        #     first second; a sentence-beginning opening hooks from frame one.
        #   - continuation cues ("and", "but", "so", "now") as the FIRST word read as
        #     "you walked in mid-story" — self-contained beats beat mid-story fragments.
        #   - a CTA ("subscribe", "like", "follow") inside the opening words is the kiss of
        #     death for a standalone Short — the content must open, not the ask.
        if s0 not in sent_starts:
            score -= 3
        head = [w["t"].lower() for w in box[:4]]
        if head and head[0] in CONT_START:
            score -= 3
        if any(CTA_RX.search(w) for w in head):
            score -= 6
        out.append({"start": s0, "end": e0, "dur_s": round(dur, 1),
                    "score": score + bonus, "n_em": n_em,
                    "first": first, "last": last, "loop": kind, "payoff": payoff})

    # greedy distinct picks: best score first; reject what makes a batch feel repetitive.
    out.sort(key=lambda w: -w["score"])
    picked = []
    for relax in (0, 1, 2):   # 0 strict, then relax section/style rules until the count fills
        for w in out:
            if len(picked) >= count:
                return picked
            if any(w["start"] < p["end"] - 1 and w["end"] > p["start"] + 1 for p in picked):
                continue
            if any(" ".join(w["first"].split()[:4])
                   == " ".join(p["first"].split()[:4]) for p in picked):
                continue                       # same hook words twice = same video twice
            if relax < 2 and len(picked) >= 2 and w["loop"] is not None:
                if sum(1 for p in picked if p["loop"] == w["loop"]) >= 2:
                    continue                   # three identical loop endings is repetitive
            if relax < 1 and len(picked) >= 2:
                third = max(int(total / 3), 1)
                if any(abs(p["start"] - w["start"]) < third for p in picked):
                    continue                   # spread picks across the video, don't cluster
            picked.append(w)
    return picked


def cmd_propose(a: argparse.Namespace) -> None:
    wins = build_windows(a.source, a.duration, a.min_duration, a.clips, loop=a.loop)
    if not wins:
        raise SystemExit(f"no clip windows found for videos/{a.source} (is the transcript non-empty?)")
    if a.json:
        print(json.dumps(wins, indent=2))
        return
    print(f"proposed clip windows for videos/{a.source}  "
          f"(target {a.duration:.0f}s, {a.clips} picks, loop={'on' if a.loop else 'off'})")
    print(f"  {'#':<3} {'window':<21} {'dur':>5}  loop")
    for i, w in enumerate(wins, 1):
        tag = ""
        if w["loop"] == "cut-before-payoff":
            tag = f"cut BEFORE payoff: “{w['payoff']}…”"
        elif w["loop"] == "ends-on-question":
            tag = "ends on an open question"
        else:
            tag = "—"
        print(f"  {i:<3} {fmt_ts(w['start'])}–{fmt_ts(w['end']):<15} {w['dur_s']:>4.0f}s  {tag}")
        print(f"        “{w['first']} … {w['last']}”")
    print("\n  pick one (loop picks are marked) and run:")
    print(f"    python tools/clip_shorts.py clip videos/{a.source} "
          f"--start {fmt_ts(wins[0]['start'])} --end {fmt_ts(wins[0]['end'])} --name <slug>")


# ---------------------------------------------------------------- ASS (windowed captions)

def ass_colour(hex_rgb: str, alpha: int = 0) -> str:
    """#RRGGBB -> ASS &HAABBGGRR — BGR with an INVERTED alpha byte (00 = opaque)."""
    h = hex_rgb.lstrip("#")
    r, g, b = h[0:2], h[2:4], h[4:6]
    return f"&H{alpha:02X}{b}{g}{r}".upper()


def ass_ts(ms: int) -> str:
    ms = max(0, int(ms))
    cs = (ms % 1000) // 10
    s = (ms // 1000) % 60
    m = (ms // 60000) % 60
    h = ms // 3600000
    return f"{h:d}:{m:02d}:{s:02d}.{cs:02d}"


def ass_esc(t: str) -> str:
    return t.replace("\\", "\\\\").replace("{", "\\{").replace("}", "\\}")


def build_windowed_ass(source: str, t0_s: float, t1_s: float, slug: str) -> Path:
    """Reuse the caption-plan's tuned emphasis inside [t0, t1] only, time-shifted to the clip,
    at a Short-sized font (bigger than a 16:9 burn). Same rendering style as gen_captions_ass.py:
    one Dialogue event per word ONSET that redraws the WHOLE phrase — spoken words white,
    upcoming words dim, stressed (m=1) words amber. Redrawing the phrase per onset is what keeps
    events from visually stacking when words overlap in time. Returns the .ass path."""
    source = norm_source(source)
    plan_p = VIDEOS / source / "work" / "caption-plan.json"
    if not plan_p.exists():
        # load_words() tolerates transcript-only sources; the ASS burn needs the plan's tuned
        # emphasis, so fail with the same clean message instead of a raw FileNotFoundError.
        raise SystemExit(f"burning captions needs work/caption-plan.json in videos/{source} "
                         f"(only edited-transcript.json present) — run gen_captions_emphasis.py first")
    plan = json.loads(plan_p.read_text(encoding="utf-8"))
    t0, t1 = t0_s * 1000.0, t1_s * 1000.0
    phrases = []
    for ph in plan.get("phrases", []):
        ws = ph.get("w", [])
        if not ws:
            continue
        if ws[-1]["e"] < t0 - 50 or ws[0]["s"] > t1 + 50:
            continue
        phrases.append({"w": ws, "pe": max(w["e"] for w in ws)})

    font_size = 76            # Shorts-sized; the 16:9 burn was ~54 on 1080 height
    margin_v = 260
    white, dim = ass_colour("FFFFFF"), ass_colour("FFFFFF", 0x8C)
    em = ass_colour(plan.get("em_hex", "F5D76E"))
    head = [
        "[Script Info]", "ScriptType: v4.00+", "PlayResX: 1080", "PlayResY: 1920",
        "WrapStyle: 2", "ScaledBorderAndShadow: yes", "",
        "[V4+ Styles]",
        "Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, "
        "BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, "
        "BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding",
        f"Style: Cap,Arial Black,{font_size},{white},{white},&H00000000,&H99000000,-1,0,0,0,"
        f"100,100,0,0,3,{font_size // 20},0,2,60,60,{margin_v},1",
        "", "[Events]",
        "Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text",
    ]
    lines = []
    for ph in phrases:
        ws = [w for w in ph["w"] if w["e"] >= t0 and w["s"] <= t1]
        if not ws:
            continue
        # hold each spoken-state until the next word's onset; the last state holds to the
        # phrase end (bounded by the clip window, since a window may split a phrase)
        for i, cur in enumerate(ws):
            start = max(cur["s"] - t0, 0)
            end = (ws[i + 1]["s"] if i + 1 < len(ws) else min(ph["pe"], t1)) - t0
            end = max(end, start + 1)
            if end <= start:
                continue
            parts = []
            for j, w in enumerate(ws):
                spoken = j <= i
                col = em if (w.get("m") and spoken) else (white if spoken else dim)
                parts.append(f"{{\\c{col}}}{ass_esc(w['t'])}")
            lines.append(f"Dialogue: 0,{ass_ts(start)},{ass_ts(end)},Cap,,0,0,0,,{' '.join(parts)}")
    if not lines:
        raise SystemExit("window contains no caption-plan words — cannot burn captions for it "
                         "(pass --captions off to skip)")
    out = SHORTS / slug / f"{slug}.ass"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text("\n".join(head + lines) + "\n", encoding="utf-8")
    return out


# ---------------------------------------------------------------- clip (the producer)

def crop_vf(w: int, h: int, custom: str | None) -> str:
    """16:9 (or wider) -> 9:16: center-crop a 9:16 slice of the source width, upscale to 1080x1920.
    Alternative crops via --crop 'WxH+X+Y'. A source that is already vertical is just scaled."""
    if custom:
        m = re.match(r"^(\d+)x(\d+)([+-]\d+)?([+-]\d+)?$", custom.replace(" ", ""))
        if not m:
            raise SystemExit(f"bad --crop {custom!r} — want WxH+X+Y or WxH")
        cw, ch = int(m.group(1)), int(m.group(2))
        x = int(m.group(3) or 0)
        y = int(m.group(4) or 0)
        return f"crop={cw}:{ch}:{x}:{y},scale={VW}:{VH}:flags=lanczos,setsar=1"
    if h >= w:  # already portrait-ish
        return f"scale={VW}:{VH}:flags=lanczos,setsar=1"
    cw = int(round(h * 9 / 16)) // 2 * 2   # 9:16 slice of the source's height, even for h264
    if cw < 2 or cw > w:
        cw = max(2, min(cw, w - (w % 2)))
    x = (w - cw) // 2
    return f"crop={cw}:{h}:{x}:0,scale={VW}:{VH}:flags=lanczos,setsar=1"


def cmd_batch(a: argparse.Namespace) -> None:
    """Propose N windows, then clip every pick in one run — the weekly Shorts batch flow.
    Each window goes through the same pipeline as `clip` (loop withholding, captions,
    contact frame, manifest)."""
    a.source = norm_source(a.source)
    wins = build_windows(a.source, a.duration, a.min_duration, a.clips, loop=a.loop)
    if not wins:
        raise SystemExit("no clip windows found — nothing to batch")
    print(f"batch: {len(wins)} windows for videos/{a.source}, clipping each")
    for i, w in enumerate(wins, 1):
        print(f"\n=== {i}/{len(wins)}  {fmt_ts(w['start'])}–{fmt_ts(w['end'])}  "
              f"({w['dur_s']:.0f}s)  loop={w['loop'] or '—'}")
        if w["payoff"]:
            print(f"    payoff withheld: “{w['payoff']}…”")
        clip_one(a, w["start"], w["end"], None)
    print("\nbatch done — verify/package each shorts/<slug> as needed")


def cmd_clip(a: argparse.Namespace) -> None:
    a.source = norm_source(a.source)
    master = find_master(a.source)
    info = ffprobe(master)
    if not info["w"] or not info["h"]:
        raise SystemExit(f"no video stream in {master}")
    if info["dur_s"] <= 2:
        raise SystemExit(f"{master.name} is only {info['dur_s']:.1f}s — nothing to clip")

    t0, t1 = a.start, a.end
    if t1 <= t0:
        t1 = t0 + 1
    if t1 > info["dur_s"] + 0.5:
        raise SystemExit(f"clip ends at {fmt_ts(t1)} but the master is {fmt_ts(info['dur_s'])}")

    manifest = clip_one(a, t0, t1, a.slug)
    print(f"  -> shorts/{a.slug or manifest['slug']}/  manifest written")


def clip_one(a: argparse.Namespace, t0: float, t1: float, slug: str | None) -> dict:
    """The actual producer: sentence-snap the window, recompose to 9:16, burn windowed captions
    if the master lacks them, extract the contact frame, write shorts/<slug>/clip.json.
    Returns the manifest. Shared by `clip` (one window) and `batch` (all proposed windows)."""
    master = find_master(a.source)
    info = ffprobe(master)

    # sentence snap: start at the first word onset at/after t0-0.75s; end at the last word end
    # at/before t1+0.5s, with a short tail so the final word fully lands (only when the loop
    # strategy does not take over the end — a looped clip must NOT dead-air before it restarts).
    try:
        words = load_words(a.source)
    except SystemExit:
        words = []
    if words:
        best_start = next((w["s"] / 1000.0 for w in words if w["s"] / 1000.0 >= t0 - 0.75), None)
        in_box = [w["e"] / 1000.0 for w in words if w["e"] / 1000.0 <= t1 + 0.5]
        best_end = max(in_box) if in_box else None
        t0 = best_start if best_start is not None else t0
        if best_end is not None:
            t1 = best_end + (0.0 if a.loop else 0.45)
    dur = t1 - t0
    if dur > MAX_SHORT_S:
        t1 = t0 + MAX_SHORT_S
        dur = MAX_SHORT_S
    if dur <= 0:
        raise SystemExit(f"empty clip window ({fmt_ts(t0)}–{fmt_ts(t1)})")

    caps_mode = a.captions
    if caps_mode == "auto":
        # burned captions survive a horizontal crop; overlay captions do NOT — reburn those.
        caps_mode = "off"
        spec_p = VIDEOS / a.source / "work" / "spec.json"
        if spec_p.exists():
            try:
                spec = json.loads(spec_p.read_text(encoding="utf-8"))
                if spec.get("captions", {}).get("style") != "burned":
                    caps_mode = "burn"
            except json.JSONDecodeError:
                pass
        if caps_mode == "off" and not (VIDEOS / a.source / "work" / "captions.ass").exists():
            caps_mode = "burn"

    # the loop strategy: with --loop, withhold the window's strongest sentence so the clip ends
    # right before the payoff — the "Full video" link in the description is how the loop closes.
    loop_kind, loop_payoff = None, None
    if a.loop:
        try:
            sentences = split_sentences(load_words(a.source))
        except SystemExit:
            sentences = []
        if sentences:
            t1, loop_payoff, loop_kind = loop_adjust(sentences, t0, t1, a.min_duration)
            if loop_kind == "cut-before-payoff":
                print(f"  loop      cutting BEFORE payoff: “{loop_payoff}…”")
            elif loop_kind == "ends-on-question":
                print("  loop      clip ends on an open question")
            else:
                print("  loop      no payoff to withhold in this window — clip unchanged")
            t1 = min(t1, t0 + MAX_SHORT_S)
        dur = t1 - t0
        if dur <= 0:
            raise SystemExit("empty loop window — pick a wider range")

    slug = slug or slugify(f"{a.source}-{fmt_ts(int(t0)).replace(':', '')}-{fmt_ts(int(t1)).replace(':', '')}")
    out_dir = SHORTS / slug
    out_dir.mkdir(parents=True, exist_ok=True)
    base_name = f"{slug}-cap.mp4" if caps_mode == "burn" else f"{slug}.mp4"

    print(f"clipping {master.relative_to(ROOT) if str(master).startswith(str(ROOT)) else master}")
    print(f"  window   {fmt_ts(t0)} – {fmt_ts(t1)}  ({dur:.1f}s)   captions: {caps_mode}")

    vf = crop_vf(info["w"], info["h"], a.crop)

    if caps_mode == "burn":
        ass = build_windowed_ass(a.source, t0, t1, slug)
        # Windows drive-letter safe path trick from gen_captions_ass.py
        try:
            p = os.path.relpath(ass, os.getcwd()).replace("\\", "/")
            if p.startswith(".."):
                raise ValueError
        except ValueError:
            p = str(ass).replace("\\", "/").replace(":", "\\:")
        vf += f",subtitles='{p}'"

    tmp = out_dir / f"_{slug}-tmp.mp4"
    enc, enc_opts = best_h264()
    cmd = ["ffmpeg", "-y", "-v", "error", "-ss", f"{t0:.3f}", "-t", f"{dur:.3f}", "-i", str(master),
           "-map", "0:v:0", "-map", "0:a:0", "-vf", vf, "-c:v", enc] + enc_opts + \
          ["-c:a", "aac", "-b:a", "192k", "-pix_fmt", "yuv420p", "-movflags", "+faststart", str(tmp)]
    t_start = time.time()
    r = subprocess.run(cmd, capture_output=True, text=True)
    enc_s = time.time() - t_start
    if r.returncode != 0:
        sys.stderr.write((r.stderr or "")[-3000:] + "\n")
        try:
            tmp.unlink()
        except OSError:
            pass
        raise SystemExit("clip encode failed")
    final = out_dir / base_name
    tmp.replace(final)
    print(f"  encoded  {enc} in {enc_s:.1f}s — a 5-clip batch is minutes, not hours: only the "
          f"window is decoded+re-encoded (the 16:9->9:16 crop forces it), never the whole master")

    if a.frame:
        mid = t0 + dur / 2
        fr = out_dir / f"{slug}-frame.jpg"
        r = subprocess.run(["ffmpeg", "-y", "-v", "error", "-ss", f"{mid:.2f}", "-i", str(final),
                            "-frames:v", "1", "-q:v", "3", str(fr)], capture_output=True, text=True)
        print(f"  contact frame -> shorts/{slug}/{fr.name}" + ("" if r.returncode == 0 else " (failed)"))

    manifest = {
        "slug": slug, "source": a.source, "source_master": str(master),
        "start_s": round(t0, 2), "end_s": round(t1, 2), "dur_s": round(dur, 2),
        "crop": a.crop, "captions_mode": caps_mode, "niche": niche_of(a.source),
        "loop": loop_kind, "loop_payoff": loop_payoff,
        "created_at": dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds"),
        "video": str(final), "status": "clipped",
    }
    (out_dir / "clip.json").write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    print(f"  -> shorts/{slug}/{base_name}  ({final.stat().st_size / 1e6:.1f} MB)")
    print(f"  manifest -> shorts/{slug}/clip.json")
    return manifest


# ---------------------------------------------------------------- verify (deliverable gate)

def cmd_verify(a: argparse.Namespace) -> None:
    d = SHORTS / a.slug
    if not d.is_dir():
        raise SystemExit(f"no such shorts project: shorts/{a.slug}")
    video = d / f"{a.slug}.mp4"
    if not video.exists():
        video = d / f"{a.slug}-cap.mp4"
    if not video.exists():
        raise SystemExit(f"no shorts/{a.slug}/{a.slug}(-cap).mp4 — run clip first")
    info = ffprobe(video)
    errs = []
    print(f"  file     : shorts/{a.slug}/{video.name}  ({video.stat().st_size / 1e6:.1f} MB)")
    print(f"  size     : {info['w']}x{info['h']}")
    print(f"  duration : {info['dur_s']:.1f}s")
    print(f"  audio    : {'yes' if info['audio'] else 'MISSING'}")
    if not (info["h"] and info["w"]):
        errs.append("no video stream")
    elif info["h"] <= info["w"]:
        errs.append(f"not vertical ({info['w']}x{info['h']}) — YouTube will not classify it as a Short")
    elif info["w"] != VW or info["h"] != VH:
        errs.append(f"size {info['w']}x{info['h']} != 1080x1920 (re-encode or rescale before upload)")
    if info["dur_s"] > MAX_SHORT_S:
        errs.append(f"{info['dur_s']:.0f}s > {MAX_SHORT_S}s — over the Shorts limit")
    if not info["audio"]:
        errs.append("no audio track — a silent Short is a dead Short")
    for e in errs:
        print(f"  FAIL {e}")
    if errs:
        raise SystemExit(f"{len(errs)} problem(s) — shorts/{a.slug} is NOT shippable")
    print("  OK — shippable. Bring it up in the viewer before upload: open the contact frame.")
    if (SHORTS / a.slug / "packaging" / "publish.json").exists():
        print("  publish plan exists — next: python tools/yt_upload.py upload "
              f"shorts/{a.slug}/packaging/publish.json --channel {manifest_channel(a.slug) or '<niche>'}")


def manifest_channel(slug: str) -> str | None:
    m = SHORTS / slug / "clip.json"
    if m.exists():
        try:
            return json.loads(m.read_text(encoding="utf-8")).get("niche")
        except (json.JSONDecodeError, OSError):
            pass
    return None


# ---------------------------------------------------------------- package (publish plan)

def cmd_package(a: argparse.Namespace) -> None:
    d = SHORTS / a.slug
    manifest_p = d / "clip.json"
    if not manifest_p.exists():
        raise SystemExit(f"no manifest shorts/{a.slug}/clip.json — run clip first")
    manifest = json.loads(manifest_p.read_text(encoding="utf-8"))
    video = Path(manifest["video"])
    if not video.exists():
        raise SystemExit(f"manifest video missing: {video}")
    source = manifest["source"]

    link = a.watch_url or longform_watch_url(source)
    if not link:
        raise SystemExit(
            f"no long-form link: videos/{source}/packaging/published.json has no watch_url.\n"
            f"  The redirect link is the whole point of a Short — upload the long-form first, "
            f"or pass --watch-url https://youtu.be/<id>.")

    title = a.title or manifest.get("title_hint")
    if title and len(title) > 100:
        raise SystemExit(f"title is {len(title)} chars (max 100): {title}")
    if not title:
        raise SystemExit("no title — pass --title \"...\" (hook text, <= 100 chars)")

    tags = DEFAULT_TAGS + (a.tags or [])
    tags = list(dict.fromkeys(tags))[:10]

    pack = d / "packaging"
    pack.mkdir(parents=True, exist_ok=True)
    # the redirect link sits FIRST so it survives the collapsed Shorts description; the loop
    # strategy then earns the click: the withheld payoff is dangled right under it.
    payoff = manifest.get("loop_payoff")
    body = title
    if payoff and manifest.get("loop") == "cut-before-payoff":
        body = f"{title} — the payoff: {payoff}…"
    elif manifest.get("loop") == "ends-on-question":
        body = f"{title} — the answer is in the full video."
    desc = (f"Full video: {link}\n\n"
            f"{body}\n"
            f"{' '.join('#' + t.replace(' ', '') for t in tags)}")
    (pack / "description.txt").write_text(desc, encoding="utf-8")
    plan = {
        "_note": "Shorts plan for tools/yt_upload.py. Paths are ABSOLUTE (rp() resolves relative "
                 "paths one level too high, see yt_upload.py). Lands PRIVATE — flip public in "
                 "Studio (one click), cadence: max ONE public flip per channel per day.",
        "video": str(video),
        "title": title,
        "description_file": str(pack / "description.txt"),
        "tags": tags,
        "categoryId": 28,
        "privacy": "private",
        "madeForKids": False,
        "short_of": source,
        "full_video_url": link,
    }
    (pack / "publish.json").write_text(json.dumps(plan, indent=2, ensure_ascii=False), encoding="utf-8")

    print(f"✓ shorts/{a.slug}/packaging/publish.json")
    print(f"    title      : {title}")
    print(f"    description: first line -> {link}")
    print(f"    tags       : {', '.join(tags)}")

    if not a.no_cadence_check:
        warn_cadence()

    print("\n  next steps:")
    print(f"    1. python tools/yt_upload.py upload shorts/{a.slug}/packaging/publish.json"
          f"{' --channel ' + (manifest.get('niche') or '<niche>')}")
    print("    2. watch shorts/<slug>/<slug>-frame.jpg on screen; set the cover in the YouTube "
          "MOBILE app (API can't set Shorts covers)")
    print("    3. in Studio flip Private -> Public (once per channel per day)")
    print("    4. python tools/yt_comment.py post --slug <slug> --channel <niche>  (posts the "
          "redirect comment; pin it in the app/Studio — there is no API for pinning)")
    print("    5. python tools/track_performance.py tag <slug> --niche <niche> --hook-type ... "
          "--evidence-type screenshots --title-lever ...  and --cross-linked-from <source>")


def warn_cadence() -> None:
    """GROWTH RULES cadence: at most one video public per channel per day. Uploads land private,
    so this guards against flipping two of today's uploads public on the same channel."""
    today = dt.datetime.now(dt.timezone.utc).date().isoformat()
    hits = []
    for base in (SHORTS, VIDEOS):
        for pub in base.glob("*/packaging/published.json"):
            try:
                d = json.loads(pub.read_text(encoding="utf-8"))
                when = (d.get("uploaded_at") or "")[:10]
                if when == today and d.get("privacy") != "public":
                    hits.append(f"{pub.parent.parent.name} (uploaded {today})")
            except (json.JSONDecodeError, OSError):
                continue
    if hits:
        print("  CADENCE WARNING: today already has uploads:")
        for h in hits:
            print(f"    · {h}")
        print("    Flip at most ONE of today's uploads public per channel — flooding a feed "
              "cannibalizes watch time signal.")


# ---------------------------------------------------------------- main

def main() -> None:
    ap = argparse.ArgumentParser(description="clip a long-form MASTER into a vertical 9:16 Short")
    sub = ap.add_subparsers(dest="cmd", required=True)

    pr = sub.add_parser("propose", help="rank clip windows by spoken emphasis")
    pr.add_argument("source", help="videos/<slug> to mine")
    pr.add_argument("--clips", type=int, default=5)
    pr.add_argument("--duration", type=float, default=30.0,
                    help="target clip length, s — 30 is the Shorts sweet spot for completion "
                         "rate; longer is possible but completion drops (default 30)")
    pr.add_argument("--min-duration", type=float, default=12.0)
    pr.add_argument("--json", action="store_true", help="machine-readable window list")
    pr.add_argument("--loop", dest="loop", action="store_true", default=True,
                    help="prefer loop windows (end before the payoff / on a question) — ON by "
                         "default, the strategy of the whole tool")
    pr.add_argument("--no-loop", dest="loop", action="store_false",
                    help="plain windows, payoff included")
    pr.set_defaults(func=cmd_propose)

    cl = sub.add_parser("clip", help="produce the 9:16 Short file")
    cl.add_argument("source", help="videos/<slug> to mine the master from")
    cl.add_argument("--start", required=True, type=parse_time, help="clip start: seconds or MM:SS(.f)")
    cl.add_argument("--end", required=True, type=parse_time, help="clip end (sentence-snapped)")
    cl.add_argument("--loop", dest="loop", action="store_true", default=True,
                    help="loop ON by default: end the clip on the withheld payoff / right at the "
                         "final word, never on dead air, so the Short's end flows into its start "
                         "(the 'Full video' link is the close). --no-loop to disable")
    cl.add_argument("--no-loop", dest="loop", action="store_false",
                    help="disable loop ending (adds a natural 0.45s tail instead)")
    cl.add_argument("--min-duration", type=float, default=12.0,
                    help="minimum retained clip length after loop withholding (s)")
    cl.add_argument("--name", dest="slug", default=None, help="shorts/<slug> name (default auto)")
    cl.add_argument("--crop", default=None, help="custom 16:9->9:16 crop WxH+X+Y (default center)")
    cl.add_argument("--captions", default="auto", choices=["auto", "burn", "off"],
                    help="auto: reburn only when the master has no burned captions")
    cl.add_argument("--frame", dest="frame", action="store_true", default=True,
                    help="contact frame for eyeballing (default on)")
    cl.add_argument("--no-frame", dest="frame", action="store_false")
    cl.set_defaults(func=cmd_clip)

    ba = sub.add_parser("batch", help="propose + clip N windows in one run (weekly batch flow)")
    ba.add_argument("source", help="videos/<slug> to mine the master from")
    ba.add_argument("--clips", type=int, default=5, help="how many windows to produce+clip")
    ba.add_argument("--duration", type=float, default=30.0,
                    help="target clip length, s (default 30 — Shorts completion sweet spot)")
    ba.add_argument("--min-duration", type=float, default=12.0)
    ba.add_argument("--loop", dest="loop", action="store_true", default=True,
                    help="withhold each window's payoff (ON by default)")
    ba.add_argument("--no-loop", dest="loop", action="store_false")
    ba.add_argument("--crop", default=None, help="custom 16:9->9:16 crop WxH+X+Y")
    ba.add_argument("--captions", default="auto", choices=["auto", "burn", "off"])
    ba.add_argument("--frame", dest="frame", action="store_true", default=True)
    ba.add_argument("--no-frame", dest="frame", action="store_false")
    ba.set_defaults(func=cmd_batch)

    ve = sub.add_parser("verify", help="deliverable gate: 9:16, <=180 s, has audio")
    ve.add_argument("slug", help="shorts/<slug>")
    ve.set_defaults(func=cmd_verify)

    pa = sub.add_parser("package", help="write publish.json + description with the redirect link")
    pa.add_argument("slug", help="shorts/<slug> with a valid clip.json")
    pa.add_argument("--title", default=None, help="Short title (hook text, <= 100 chars)")
    pa.add_argument("--tags", default=None, nargs="+", help="extra tags besides shorts/youtubeshorts")
    pa.add_argument("--watch-url", default=None,
                    help="override the long-form link (default: the source's published.json)")
    pa.add_argument("--no-cadence-check", action="store_true", help="skip the one-public-per-day guard")
    pa.set_defaults(func=cmd_package)

    a = ap.parse_args()
    try:
        a.func(a)
    except SystemExit:
        raise
    except Exception as e:  # noqa: BLE001 - surface, never mask
        raise SystemExit(f"✗ {type(e).__name__}: {e}")


if __name__ == "__main__":
    main()