#!/usr/bin/env python3
"""
plan_beats.py — turn an annotated long-form script + its VO word timings into `work/beats.json`.

This is the connective piece between writing and rendering. The script carries inline visual
directives; this aligns each block of narration to the real word timings from the VO, splits any
block that runs longer than the niche's beat cadence, and emits the beat map `build_longform.py`
renders.

Script format (`work/script.md`) — a directive owns every line until the next directive:

    [beat: damp basement wall, water stain on plaster]
    Most people think a damp room needs a machine. It does not.

    [beat: mason jar of calcium chloride | white salt crystals close up]
    This is calcium chloride. Four dollars a tub at any hardware store.

`|` separates ALTERNATE image queries for the same block — when a block is long enough to need
several beats, they cycle, so a 40-second explanation is not one static picture.

Alignment is sequential, not fuzzy-global: the VO was generated FROM this script, so the words
arrive in order. Each block consumes the next run of transcript words that matches its tokens,
tolerating the small drift a TTS/ASR round trip introduces (dropped punctuation, "four" vs "4").

Usage:
  python tools/plan_beats.py videos/video-2 --niche home-hacks
  python tools/plan_beats.py videos/video-2 --niche ai-news --beat-seconds 6
  python tools/plan_beats.py videos/video-2 --niche home-hacks --print

Reads : <project>/work/script.md, <project>/work/edited-transcript.json
Writes: <project>/work/beats.json   (then: fetch_stock.py --from-beats, build_longform.py)
"""
import argparse
import json
import os
import re
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIRECTIVE = re.compile(r"^\s*\[beat:\s*(.+?)\s*\]\s*$", re.I)

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")


def norm(t):
    return re.sub(r"[^a-z0-9']", "", t.lower())


NUMWORD = {"0": "zero", "1": "one", "2": "two", "3": "three", "4": "four", "5": "five",
           "6": "six", "7": "seven", "8": "eight", "9": "nine", "10": "ten"}


def toks(text):
    out = []
    for w in re.findall(r"[\w']+", text.lower()):
        n = norm(w)
        if n:
            out.append(NUMWORD.get(n, n))
    return out


def parse_script(path):
    """-> [(queries[], text)] in order. Text before the first directive is kept with a None query
    so a cold open is never silently dropped."""
    blocks, cur_q, cur_t = [], None, []
    for line in open(path, encoding="utf-8"):
        m = DIRECTIVE.match(line)
        if m:
            if cur_t and "".join(cur_t).strip():
                blocks.append((cur_q, " ".join(cur_t).strip()))
            cur_q = [q.strip() for q in m.group(1).split("|") if q.strip()]
            cur_t = []
        elif not line.strip().startswith("#"):
            cur_t.append(line.strip())
    if cur_t and "".join(cur_t).strip():
        blocks.append((cur_q, " ".join(cur_t).strip()))
    return [(q, t) for q, t in blocks if t]


def align(blocks, words):
    """Sequentially consume transcript words per block. Returns (start_s, end_s, matched, total)."""
    wt = [norm(w["text"]) for w in words]
    wt = [NUMWORD.get(x, x) for x in wt]
    i, spans = 0, []
    for _, text in blocks:
        want = toks(text)
        if not want or i >= len(words):
            spans.append((None, None, 0, len(want)))
            continue
        start_i = i
        matched = 0
        j = i
        for w in want:
            # look ahead a little for this token; ASR drops or merges the odd word
            found = None
            for k in range(j, min(j + 6, len(wt))):
                if wt[k] == w:
                    found = k
                    break
            if found is not None:
                j = found + 1
                matched += 1
        end_i = max(start_i, j - 1)
        spans.append((words[start_i]["start"] / 1000.0, words[end_i]["end"] / 1000.0,
                      matched, len(want)))
        i = j
    return spans


def main():
    ap = argparse.ArgumentParser(description="script + VO timings -> beats.json")
    ap.add_argument("project")
    ap.add_argument("--niche", default=None, help="niches/<id>.json (sets cadence + image style)")
    ap.add_argument("--beat-seconds", type=float, default=None, help="override the cadence")
    ap.add_argument("--w", type=int, default=1920)
    ap.add_argument("--h", type=int, default=1080)
    ap.add_argument("--fps", type=int, default=30)
    ap.add_argument("--audio", default=None, help="default work/audio/voiceover.mp3")
    ap.add_argument("--print", dest="show", action="store_true")
    a = ap.parse_args()

    proj = a.project if os.path.isabs(a.project) else os.path.abspath(a.project)
    work = os.path.join(proj, "work")
    niche = {}
    if a.niche:
        np_ = os.path.join(ROOT, "niches", f"{a.niche}.json")
        if not os.path.exists(np_):
            raise SystemExit(f"no niche profile: {np_}")
        niche = json.load(open(np_, encoding="utf-8"))
    beat_s = a.beat_seconds or niche.get("pacing", {}).get("beat_seconds", 7.0)
    hook_beat_s = niche.get("pacing", {}).get("hook_beat_seconds", beat_s * 0.6)
    hook_s = niche.get("pacing", {}).get("hook_seconds", 20)
    style = (niche.get("images", {}) or {}).get("style", "")

    sp = os.path.join(work, "script.md")
    tp = os.path.join(work, "edited-transcript.json")
    for p in (sp, tp):
        if not os.path.exists(p):
            raise SystemExit(f"missing {p}")
    blocks = parse_script(sp)
    words = json.load(open(tp, encoding="utf-8"))["words"]
    if not blocks:
        raise SystemExit("script.md has no narration")
    spans = align(blocks, words)

    beats, weak = [], 0
    for (queries, text), (s, e, matched, total) in zip(blocks, spans):
        if s is None or e is None or e <= s:
            continue
        if total and matched / total < 0.6:
            weak += 1
        qs = queries or [(style or "establishing shot")]
        dur = e - s
        target = hook_beat_s if s < hook_s else beat_s
        n = max(1, round(dur / target))
        step = dur / n
        for k in range(n):
            bs, be = s + k * step, s + (k + 1) * step
            q = qs[k % len(qs)]
            beats.append({
                "image": f"work/images/PENDING-{len(beats):03d}.jpg",
                # TWO fields on purpose. `image_query` is SHORT keywords for a stock search;
                # `image_prompt` is the full descriptive line for a generative model. Feeding the
                # styled prompt to a keyword search returns nothing at all — a stock index matches
                # words, it does not read art direction.
                "image_query": q[:80],
                "image_prompt": (f"{q}, {style}" if style else q)[:220],
                "start_s": round(bs, 2), "end_s": round(be, 2),
                "move": "auto",
                "cue": text[:110],
            })

    audio = a.audio or ("work/audio/voiceover.mp3"
                        if os.path.exists(os.path.join(work, "audio", "voiceover.mp3"))
                        else "work/audio/voiceover.wav")

    # BEATS MUST TILE THE WHOLE TIMELINE. Each block only spans the words it contains, so the
    # silences BETWEEN blocks fall through the gaps — 11 of them cost video-2 3.3s, and since
    # the render is muxed with `-shortest` that truncated the narration's last sentence.
    # Start at 0, butt every beat against the next, and run the last one to the end of the audio.
    apath = os.path.join(proj, audio)
    audio_s = None
    if os.path.exists(apath):
        r = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                            "-of", "csv=p=0", apath], capture_output=True, text=True)
        try:
            audio_s = float(r.stdout.strip())
        except ValueError:
            pass
    if beats:
        beats[0]["start_s"] = 0.0
        for i in range(len(beats) - 1):
            beats[i]["end_s"] = beats[i + 1]["start_s"]
        if audio_s:
            beats[-1]["end_s"] = round(max(beats[-1]["end_s"], audio_s + 0.3), 2)
        gaps = [round(beats[i + 1]["start_s"] - beats[i]["end_s"], 3)
                for i in range(len(beats) - 1)]
        assert not any(abs(g) > 1e-6 for g in gaps), "beats still have gaps"
    spec = {
        "niche": a.niche,
        "output": {"w": a.w, "h": a.h, "fps": a.fps,
                   "out": f"output/{os.path.basename(proj)}-visuals.mp4"},
        "audio": audio,
        "beats": beats,
    }
    out = os.path.join(work, "beats.json")
    with open(out, "w", encoding="utf-8") as f:
        json.dump(spec, f, indent=1, ensure_ascii=False)

    total_s = beats[-1]["end_s"] if beats else 0
    print(f"{len(blocks)} script blocks -> {len(beats)} beats over {total_s/60:.1f} min "
          f"(cadence {beat_s}s, hook {hook_beat_s}s)")
    if weak:
        print(f"  WARNING {weak} block(s) matched <60% of their words against the VO — "
              f"the script and the voiceover may have drifted apart")
    uniq = sorted({b["image_query"] for b in beats})
    print(f"  {len(uniq)} distinct image queries")
    if a.show:
        for i, b in enumerate(beats):
            print(f"  {i:3d} {b['start_s']:7.2f}-{b['end_s']:7.2f}  {b['image_query'][:70]}")
    print(f"  -> {os.path.relpath(out, ROOT)}")
    print(f"next: python tools/fetch_stock.py {a.project} --from-beats --per 1")


if __name__ == "__main__":
    main()
