#!/usr/bin/env python3
"""
build_longform.py — render a LONG-FORM video as a timed image sequence with Ken Burns motion.

The problem this solves: every visual beat in this repo is a hand-authored Remotion TSX file.
That is right for a 2-minute video with bespoke beats, and impossible for 30 minutes — at a
~5s cadence that is ~400 bespoke shots. The longest video this pipeline had ever produced before
this tool was **155 seconds**.

Long-form (documentary / "old ways" / listicle / explainer) does not need 400 bespoke shots. It
needs a stream of images with slow, varied motion, cut to the narration. That is a template, not
an authoring job, so it scales to any length.

  beat map (images + times)  ->  Ken Burns per image  ->  concat  ->  + VO  ->  burn captions

Ken Burns is done with `zoompan`, which is cheap on a STILL (one decoded frame drives every
output frame). Each image is first scaled to COVER the frame at `--headroom` so a zoom never
runs out of pixels and never letterboxes.

Beat map (`work/beats.json`):
{
  "output": { "w": 1920, "h": 1080, "fps": 30, "out": "videos/x/output/x-visuals.mp4" },
  "audio":  "videos/x/work/audio/voiceover.mp3",
  "grade":  { "vignette": 0.25, "grain": 4, "tint": "cool" },
  "beats": [
    { "image": "media/stock/barn.jpg", "start_s": 0.0,  "end_s": 8.5, "move": "in",
      "cue": "hook" },
    { "image": "media/stock/well.jpg", "start_s": 8.5, "end_s": 17.2, "move": "right" },
    { "image": "work/cards/intro.mp4", "start_s": 25.0, "end_s": 30.0, "move": "none" }
  ]
}
`move`: in | out | left | right | up | down | none | still | auto (auto cycles, so consecutive
       beats differ; still = static hold, for rendered cards that must not drift — gen_spec_cards
       sets none for the same reason).
`grade`: optional top-level object; vignette (float 0-1), grain (int 0-20), tint (warm|cool|green|none).
         Beat image can be .mp4 (video clip, trimmed to beat duration) or .jpg/.png (Ken Burns).

BEAT CACHE (added 2026-08-02, closes IMPROVEMENT-QUEUE R7a — same idea as bake.py's segment cache).
Each beat renders to `work/_lf/seg-<hash>.mp4`, content-addressed on the beat's OWN inputs: image
file hash, move, frame count, geometry, grade, encoder. A rerun reuses every segment whose inputs
did not change, so editing one image or one beat duration costs ONE re-encode plus the concat,
not a full re-render. Measured on a 6-beat synthetic: 6.4s cold -> 1.4s warm, and a single image
swap rendered exactly 1 of 6 beats. `--fresh` wipes the cache; `--keep` also keeps unused entries
(the default prunes them, since ~5 MB x 283 beats per stale generation adds up fast).

  Honest limitation: `move: auto` is resolved by INDEX (auto cycles so neighbours differ), so
  INSERTING or REORDERING beats changes the auto-move of everything downstream and invalidates
  those segments — measured 6 of 7 re-rendered on a front-insert. Edits in place (swap an image,
  retime a beat, change a card) are the cheap case. If you expect to insert a lot, set explicit
  `move` values in beats.json and insertion becomes cheap too.

Usage:
  python tools/build_longform.py videos/video-2                     # reads work/beats.json
  python tools/build_longform.py videos/video-2 --dissolve 0.5      # crossfade between beats
  python tools/build_longform.py videos/video-2 --plan-only         # print the shot list
  python tools/build_longform.py videos/video-2 --from-audio 8      # auto-slice beats every ~8s
  python tools/build_longform.py videos/video-2 --fresh             # ignore the beat cache

ffmpeg/ffprobe on PATH.
"""
import argparse
import hashlib
import json
import math
import os
import shutil
import subprocess
import sys
from concurrent.futures import ThreadPoolExecutor

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MOVES = ("in", "out", "left", "right", "up", "down", "none", "still")

TINT_MAP = {
    "warm":  "colorbalance=rs=0.04:gs=0.01:bs=-0.05",
    "cool":  "colorbalance=rs=-0.03:gs=0:bs=0.05",
    "green": "colorbalance=rs=-0.02:gs=0.04:bs=-0.02",
    "none":  None,
}


def grade_vf(grade):
    """Build optional vignette + grain + tint filter chain from a grade dict.

    The grade is data-driven: beats.json carries a top-level ``grade`` object
    that the agent copies from the niche JSON's ``images.grade`` block.
    Fields: vignette (float 0-1 strength, default 0.25), grain (int noise strength,
    default 4), tint (warm|cool|green|none, default none).  A missing or empty
    grade object uses gentle defaults so long-form never looks flat.
    """
    if not grade:
        grade = {"vignette": 0.25, "grain": 4}
    parts = []
    vig = grade.get("vignette", 0.25)
    if vig:
        # ffmpeg's vignette filter has NO `strength` option (verified: angle/a, x0, y0, mode, eval,
        # dither, aspect). It previously emitted `vignette=angle=PI/6:strength=<v>`, which ffmpeg
        # rejects with "Option not found" — and since grade defaults to {"vignette": 0.25, ...} when
        # beats.json carries no grade block, that killed EVERY beat render on the default path.
        # Intensity is the lens ANGLE: 0 = none, PI/2 = maximum. Map the documented 0-1 scale onto it.
        parts.append(f"vignette=angle={max(0.0, min(1.0, float(vig))) * (math.pi / 2):.4f}")
    grain = grade.get("grain", 4)
    if grain:
        parts.append(f"noise=alls={grain}:allf=t")
    tint = TINT_MAP.get(grade.get("tint", "none"))
    if tint:
        parts.append(tint)
    return ("," + ",".join(parts)) if parts else ""

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")


def run(cmd, check=True, cwd=None):
    r = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8", errors="replace",
                       cwd=cwd)
    if check and r.returncode != 0:
        sys.stderr.write("\nFFMPEG FAILED:\n  " + " ".join(cmd) + "\n" + (r.stderr or "")[-3000:])
        raise SystemExit(1)
    return r


_SHA_MEMO = {}


def sha_file(p):
    """Content hash of an input image/clip, memoized on (path, mtime, size) within a run."""
    st = os.stat(p)
    ck = (p, st.st_mtime_ns, st.st_size)
    if ck not in _SHA_MEMO:
        h = hashlib.sha1()
        with open(p, "rb") as f:
            for chunk in iter(lambda: f.read(1 << 20), b""):
                h.update(chunk)
        _SHA_MEMO[ck] = h.hexdigest()
    return _SHA_MEMO[ck]


def beat_key(payload):
    """Content address for one rendered beat segment.

    Deliberately keyed on the beat's own inputs ONLY (image content + move + frame count + geometry
    + grade + encoder), never on its index. Index-keyed names would invalidate every downstream
    segment when a beat is inserted or reordered — the exact case this cache exists to make cheap.
    Identical beats collapse onto one file, which is correct: ffmpeg is happy to take the same
    input twice in both the concat and xfade paths.
    """
    return hashlib.sha1(json.dumps(payload, sort_keys=True).encode()).hexdigest()[:16]


def probe_dur(path):
    r = run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
             "-of", "default=nw=1:nk=1", path])
    try:
        return float(r.stdout.strip())
    except ValueError:
        return 0.0


def best_h264():
    """Same probe-don't-assume rule as render_cuts: a listed encoder may not work."""
    for name, opts in (("h264_nvenc", ["-preset", "p5", "-rc", "vbr", "-cq", "22", "-b:v", "0"]),
                       ("h264_qsv", ["-global_quality", "22", "-preset", "medium"]),
                       ("h264_amf", ["-quality", "quality", "-rc", "cqp", "-qp_i", "22", "-qp_p", "22"]),
                       ("h264_mf", ["-rate_control", "quality", "-quality", "70"])):
        r = run(["ffmpeg", "-v", "error", "-f", "lavfi", "-i", "nullsrc=s=256x256:d=1",
                 "-frames:v", "1", "-c:v", name, "-f", "null", "-"], check=False)
        if r.returncode == 0 and "Could not open encoder" not in (r.stderr or ""):
            return name, opts
    return "libx264", ["-preset", "veryfast", "-crf", "20"]


def kenburns_vf(move, n_frames, W, H, headroom, zoom):
    """Filter chain for one still. Motion is linear in `on` (the output frame counter) — the
    classic Ken Burns look; easing a slow pan just makes it look like it is stalling."""
    n = max(1, n_frames)
    p = f"(on/{n})"                      # 0 -> 1 across the beat

    # A RENDERED CARD must not be cover-cropped: its kicker and source footnote live in the
    # margins, and headroom-cover would slice them off. `still` fits the whole frame (pad, never
    # crop) and applies only a token centre zoom so it reads as alive without moving the text.
    if move in ("none", "still"):
        fit = (f"scale={W}:{H}:force_original_aspect_ratio=decrease,"
               f"pad={W}:{H}:(ow-iw)/2:(oh-ih)/2:color=0x0d1117,setsar=1")
        z = f"1+{0.012}*{p}"
        return (f"{fit},zoompan=z='{z}':x='(iw-iw/zoom)/2':y='(ih-ih/zoom)/2'"
                f":d=1:s={W}x{H}:fps={{fps}},format=yuv420p")

    cw, ch = int(W * headroom) // 2 * 2, int(H * headroom) // 2 * 2
    cover = (f"scale={cw}:{ch}:force_original_aspect_ratio=increase,"
             f"crop={cw}:{ch},setsar=1")
    if move == "in":
        z, x, y = f"1+{zoom}*{p}", "(iw-iw/zoom)/2", "(ih-ih/zoom)/2"
    elif move == "out":
        z, x, y = f"{1+zoom}-{zoom}*{p}", "(iw-iw/zoom)/2", "(ih-ih/zoom)/2"
    else:
        z = f"{1 + zoom * 0.6:.4f}"      # pans hold a constant, slightly-in zoom
        if move == "right":
            x, y = f"(iw-iw/zoom)*{p}", "(ih-ih/zoom)/2"
        elif move == "left":
            x, y = f"(iw-iw/zoom)*(1-{p})", "(ih-ih/zoom)/2"
        elif move == "down":
            x, y = "(iw-iw/zoom)/2", f"(ih-ih/zoom)*{p}"
        else:                            # up
            x, y = "(iw-iw/zoom)/2", f"(ih-ih/zoom)*(1-{p})"
    esc = lambda e: e.replace(",", "\\,")
    return (f"{cover},zoompan=z='{esc(z)}':x='{esc(x)}':y='{esc(y)}'"
            f":d=1:s={W}x{H}:fps={{fps}},format=yuv420p")


def load_beats(proj, auto_every):
    p = os.path.join(proj, "work", "beats.json")
    if os.path.exists(p):
        return json.load(open(p, encoding="utf-8"))
    if not auto_every:
        raise SystemExit(f"no {p} (and no --from-audio N to generate one)")
    # auto-slice: even beats across the VO, images taken from work/images in name order
    audio = None
    for c in ("work/audio/voiceover.mp3", "work/audio/voiceover.wav"):
        if os.path.exists(os.path.join(proj, c)):
            audio = c
            break
    if not audio:
        raise SystemExit("--from-audio needs work/audio/voiceover.mp3")
    dur = probe_dur(os.path.join(proj, audio))
    idir = os.path.join(proj, "work", "images")
    imgs = sorted(os.path.join("work", "images", f) for f in os.listdir(idir)
                  if f.lower().endswith((".jpg", ".jpeg", ".png", ".webp", ".mp4"))) if os.path.isdir(idir) else []
    if not imgs:
        raise SystemExit(f"--from-audio needs images in {idir}")
    n = max(1, math.ceil(dur / auto_every))
    step = dur / n
    beats = [{"image": imgs[i % len(imgs)], "start_s": round(i * step, 3),
              "end_s": round(min((i + 1) * step, dur), 3), "move": "auto"} for i in range(n)]
    return {"output": {"w": 1920, "h": 1080, "fps": 30,
                       "out": f"{os.path.basename(proj)}-visuals.mp4"},
            "audio": audio, "beats": beats}


def main():
    ap = argparse.ArgumentParser(description="render a long-form Ken Burns image sequence")
    ap.add_argument("project")
    ap.add_argument("--dissolve", type=float, default=0.0, help="crossfade seconds between beats")
    ap.add_argument("--headroom", type=float, default=1.35, help="oversample so zooms keep detail")
    ap.add_argument("--zoom", type=float, default=0.12, help="how far a zoom travels (0.12 = 12%%)")
    ap.add_argument("--plan-only", action="store_true")
    ap.add_argument("--from-audio", type=float, default=0, help="auto-slice beats every N seconds")
    ap.add_argument("--keep", action="store_true",
                    help="keep intermediates AND cache entries this run didn't use "
                         "(default prunes unused segments to bound disk)")
    ap.add_argument("--fresh", action="store_true",
                    help="wipe the beat cache and re-render every segment from scratch")
    ap.add_argument("--no-grade", action="store_true", help="disable vignette/grain/tint filters")
    a = ap.parse_args()

    proj = a.project if os.path.isabs(a.project) else os.path.abspath(a.project)
    spec = load_beats(proj, a.from_audio)
    o = spec["output"]
    W, H, FPS = int(o["w"]), int(o["h"]), int(o.get("fps", 30))
    rel = lambda p: p if os.path.isabs(p) else os.path.join(proj, p)
    out_path = rel(o["out"])
    beats = spec["beats"]
    grade = None if a.no_grade else spec.get("grade", {})

    # resolve moves (auto cycles so two neighbours never share a direction)
    cyc = ["in", "right", "out", "left", "in", "down", "out", "up"]
    for i, b in enumerate(beats):
        m = b.get("move", "auto")
        b["_move"] = m if m in MOVES else cyc[i % len(cyc)]
        b["_n"] = max(1, round((float(b["end_s"]) - float(b["start_s"])) * FPS))

    # SAFETY NET against a gappy beat map: the concat builds a video exactly as long as
    # sum(beat durations), and -shortest then CUTS the narration to match. Any planner that
    # leaves pauses between beats (visual_director used to) silently loses the outro — measured
    # 22.8s truncated on re-agent-commission. If the audio is longer than the video, freeze the
    # final beat on its last frame for the remainder (still beats and video-clip beats both
    # tolerate extra frames; the cache re-keys on n, so only that beat re-renders).
    audio = rel(spec.get("audio")) if spec.get("audio") else None
    if audio and os.path.exists(audio) and beats:
        a_dur = probe_dur(audio)
        v_frames = sum(b["_n"] for b in beats)
        if a_dur > v_frames / FPS:
            extra = round((a_dur - v_frames / FPS) * FPS)
            if extra > 0:
                beats[-1]["_n"] += extra
                print(f"  final beat extended by {extra} frames ({extra/FPS:.2f}s) to cover the "
                      f"full {a_dur:.1f}s of narration")

    total = sum(b["_n"] for b in beats) / FPS
    print(f"{len(beats)} beats -> {total/60:.1f} min at {W}x{H}@{FPS}")
    if a.plan_only:
        for i, b in enumerate(beats):
            print(f"  {i:3d} {float(b['start_s']):7.2f}-{float(b['end_s']):7.2f} "
                  f"{b['_move']:<5} {b['image']}")
        return

    missing = [b["image"] for b in beats if not os.path.exists(rel(b["image"]))]
    if missing:
        raise SystemExit(f"{len(missing)} image(s) missing, first: {missing[0]}")

    # Disk preflight: fail fast with a fix, not a crash 20 minutes into the encode. The scratch
    # cache (work/_lf, see below) plus the final output roughly track output duration; ~1.5MB/s
    # covers both with margin (measured: 1304s render used ~5.1GB peak scratch+output).
    need = int(total * 1.5 * 1024 * 1024) + 1_500_000_000
    free = shutil.disk_usage(proj).free
    if free < need:
        other_lf = []
        videos_root = os.path.dirname(proj)
        if os.path.isdir(videos_root):
            for name in sorted(os.listdir(videos_root)):
                lf = os.path.join(videos_root, name, "work", "_lf")
                if os.path.isabs(proj) and os.path.join(videos_root, name) == proj:
                    continue
                if os.path.isdir(lf):
                    other_lf.append(lf)
        msg = [f"only {free/1e9:.1f}GB free, this render needs ~{need/1e9:.1f}GB (est. from {total/60:.1f} min)."]
        if other_lf:
            msg.append(f"{len(other_lf)} other project(s) still have a work/_lf cache "
                        f"(regenerable render scratch, safe to delete once THAT video has shipped):")
            msg.extend(f"    rm -rf {p}" for p in other_lf[:8])
        raise SystemExit("\n".join(msg))

    enc_name, enc_opts = best_h264()
    print(f"  encoder: {enc_name}")
    scratch = os.path.join(proj, "work", "_lf")
    # The segment cache lives HERE and must survive between runs — this used to rmtree on entry and
    # again on exit, so every run re-rendered every beat even when one image changed. On a 33-min
    # real-estate cut (~283 beats) that is the difference between one re-encode and 283.
    if a.fresh and os.path.exists(scratch):
        shutil.rmtree(scratch)
    os.makedirs(scratch, exist_ok=True)

    # With crossfades, every clip except the last must carry `dissolve` EXTRA frames of overlap
    # material, or each transition eats that time out of the timeline. On video-2 that silently
    # shortened a 207s video to 190s and `-shortest` then truncated the narration — the entire
    # closing beat (43 words, including the CTA) never made it in.
    extra = round(a.dissolve * FPS) if a.dissolve > 0 else 0

    hits = []

    def render(i_b):
        i, b = i_b
        n_out = b["_n"] + extra
        img = rel(b["image"])
        is_vid = img.lower().endswith(".mp4")
        # Video beats must not silently SHORTEN the timeline: a clip shorter than its beat used to
        # end the segment at EOF, so the concat came out short and -shortest then truncated the
        # narration tail (5.6s of the closing line on burnt-pan-truth, 2026-08-06). The clip is
        # freeze-padded to fill the beat, and "vfv" versions the cache key so a stale short
        # segment is never reused after this filter chain changes.
        key = beat_key({
            "img": sha_file(img), "move": b["_move"], "n": n_out, "w": W, "h": H, "fps": FPS,
            "headroom": a.headroom, "zoom": a.zoom, "grade": grade, "vid": is_vid,
            "vfv": 2 if is_vid else 1, "enc": enc_name, "opts": list(enc_opts),
        })
        seg = os.path.join(scratch, f"seg-{key}.mp4")
        # A cached segment only ever gets its final name via os.replace below, so an existing
        # non-trivial file is complete by construction — no probe subprocess per beat needed.
        if os.path.exists(seg) and os.path.getsize(seg) > 1024:
            hits.append(i)
            return seg
        tmp = os.path.join(scratch, f"seg-{key}.{os.getpid()}.{i}.part")
        if is_vid:
            vf = (f"scale={W}:{H}:force_original_aspect_ratio=decrease,"
                  f"pad={W}:{H}:(ow-iw)/2:(oh-ih)/2:color=0x0d1117,setsar=1,"
                  f"fps={FPS},tpad=stop_mode=clone:stop_duration=600,"
                  f"format=yuv420p")
            run(["ffmpeg", "-y", "-v", "error", "-i", img,
                 "-vf", vf, "-frames:v", str(n_out), "-an",
                 "-c:v", enc_name, *enc_opts, "-r", str(FPS), "-f", "mp4", tmp])
        else:
            vf = kenburns_vf(b["_move"], n_out, W, H, a.headroom, a.zoom).format(fps=FPS)
            vf += grade_vf(grade)
            run(["ffmpeg", "-y", "-v", "error", "-loop", "1", "-i", img,
                 "-frames:v", str(n_out), "-vf", vf, "-an",
                 "-c:v", enc_name, *enc_opts, "-r", str(FPS), "-f", "mp4", tmp])
        os.replace(tmp, seg)   # atomic: a killed render never leaves a poisoned cache entry
        return seg

    with ThreadPoolExecutor(max_workers=max(2, (os.cpu_count() or 4) // 2)) as pool:
        segs = list(pool.map(render, enumerate(beats)))
    n_new = len(segs) - len(hits)
    print(f"  {len(segs)} beat clips ready  ({len(hits)} cached, {n_new} rendered)")

    # Prune cache entries this run didn't use, or a long project's scratch grows without bound
    # (283 beats x ~5 MB = ~1.4 GB per stale generation). --keep opts out, e.g. while A/B-ing a
    # grade change back and forth and you want both generations to stay warm.
    if not a.keep:
        live = {os.path.basename(s) for s in segs}
        for f in os.listdir(scratch):
            if f.startswith("seg-") and f.endswith(".mp4") and f not in live:
                try:
                    os.remove(os.path.join(scratch, f))
                except OSError:
                    pass

    silent = os.path.join(scratch, "visuals.mp4")
    if a.dissolve > 0 and len(segs) > 1:
        # xfade chain: each transition eats `d` seconds of overlap, so offsets accumulate on the
        # SHORTENED timeline, not the raw one.
        # xfade output length = offset + len(next clip). With each clip carrying `d` of extra
        # overlap, stepping the offset by the PLANNED beat duration makes the total come out at
        # exactly sum(planned) — i.e. the audio length. Subtracting d here is what lost 17s.
        d = a.dissolve
        inputs, parts, prev = [], [], "0:v"
        # Inputs go in as BARE FILENAMES with cwd=scratch. Absolute paths are ~120 chars each here,
        # which put a 226-beat command line at 30.6k against a ~32k cap — it passed, but a 30-min
        # video (~400 beats, the length this tool exists for) would have blown it again. Basenames
        # are ~10 chars, so the command line stops scaling with project path depth entirely.
        for s in segs:
            inputs += ["-i", os.path.basename(s)]
        off = beats[0]["_n"] / FPS
        for i in range(1, len(segs)):
            lbl = f"x{i}"
            parts.append(f"[{prev}][{i}:v]xfade=transition=fade:duration={d}"
                         f":offset={max(0.0, off - d):.3f}[{lbl}]")
            prev = lbl
            off += beats[i]["_n"] / FPS
        # WINDOWS COMMAND-LINE LIMIT (WinError 206, hit at 226 beats / 17.5 min):
        # 226 `-i` inputs plus a 225-link xfade graph is ~40k chars and CreateProcess caps at
        # ~32k. The graph is the big half, so it goes to a file via -filter_complex_script.
        graph = os.path.join(scratch, "xfade.txt")
        with open(graph, "w", encoding="utf-8") as f:
            f.write(";".join(parts))
        run(["ffmpeg", "-y", "-v", "error", *inputs, "-filter_complex_script", "xfade.txt",
             "-map", f"[{prev}]", "-c:v", enc_name, *enc_opts, "-r", str(FPS),
             os.path.basename(silent)], cwd=scratch)
    else:
        lst = os.path.join(scratch, "list.txt")
        with open(lst, "w", encoding="utf-8") as f:
            for s in segs:
                f.write(f"file '{s.replace(os.sep, '/')}'\n")
        run(["ffmpeg", "-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", lst,
             "-c", "copy", silent])

    os.makedirs(os.path.dirname(out_path) or ".", exist_ok=True)
    audio = spec.get("audio")
    if audio and os.path.exists(rel(audio)):
        run(["ffmpeg", "-y", "-v", "error", "-i", silent, "-i", rel(audio),
             "-map", "0:v:0", "-map", "1:a:0", "-c:v", "copy",
             "-c:a", "aac", "-b:a", "192k", "-shortest",
             "-movflags", "+faststart", out_path])
    else:
        shutil.copy2(silent, out_path)
        print("  (no audio in the beat map - video only)")

    # NOTE: deliberately does NOT rmtree(scratch) — the seg-*.mp4 cache is the whole point and this
    # line used to delete it on every successful run. Only the cheap intermediates go.
    if not a.keep:
        for f in ("visuals.mp4", "xfade.txt", "list.txt"):
            try:
                os.remove(os.path.join(scratch, f))
            except OSError:
                pass
    d = probe_dur(out_path)
    print(f"done -> {os.path.relpath(out_path, ROOT)}  ({d:.1f}s / {d/60:.1f} min)")


if __name__ == "__main__":
    main()
