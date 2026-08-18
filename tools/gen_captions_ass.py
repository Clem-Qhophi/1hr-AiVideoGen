#!/usr/bin/env python3
"""
gen_captions_ass.py — burned-in emphasis captions via ASS subtitles. THE LONG-FORM PATH.

Why this exists alongside gen_captions_emphasis.py (which renders a Remotion overlay):
an alpha overlay is ProRes 4444 and does not scale with length. Measured in this repo, a 148s
1080p caption track is **437 MB** and takes minutes; a 30-minute video would be **~5 GB** and an
enormous render, for text. ASS is a text file that ffmpeg burns in during a pass you are already
paying for: same word-level timing, same emphasis colours, ~0 render cost, no intermediate file.

  short-form  (<= ~3 min) -> gen_captions_emphasis.py  (Remotion: scale-pop, wiping highlighter)
  long-form   (> ~3 min)  -> THIS                      (ASS: colour + box, essentially free)

Reads the same `work/caption-plan.json` the Remotion generator writes, so the emphasis you tuned
carries over unchanged. Falls back to work/edited-transcript.json if there is no plan.

Usage:
  python tools/gen_captions_ass.py videos/video-1
  python tools/gen_captions_ass.py videos/video-1 --burn videos/video-1/output/x.mp4 --out out.mp4
  python tools/gen_captions_ass.py videos/video-1 --font "Arial" --size 64 --margin-v 260

Writes <project>/work/captions.ass. With --burn it also renders the burned file.
"""
import argparse
import json
import os
import re
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def best_h264():
    """Same probe-don't-assume rule as render_cuts/build_longform: the burn is a full-length
    encode, and QSV is ~4x libx264 on this machine — but only use an encoder that WORKS."""
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


def ass_colour(hex_rgb: str, alpha: int = 0) -> str:
    """#RRGGBB -> ASS &HAABBGGRR. ASS is BGR with a leading ALPHA byte, and its alpha is
    INVERTED (00 = opaque, FF = transparent) — getting either wrong silently yields the
    wrong colour rather than an error."""
    h = hex_rgb.lstrip("#")
    r, g, b = h[0:2], h[2:4], h[4:6]
    return f"&H{alpha:02X}{b}{g}{r}".upper()


def ts(ms: int) -> str:
    """ASS timestamp: H:MM:SS.cc (centiseconds, single-digit hour)."""
    ms = max(0, int(ms))
    cs = (ms % 1000) // 10
    s = (ms // 1000) % 60
    m = (ms // 60000) % 60
    h = ms // 3600000
    return f"{h:d}:{m:02d}:{s:02d}.{cs:02d}"


def esc(t: str) -> str:
    return t.replace("\\", "\\\\").replace("{", "\\{").replace("}", "\\}")


def load_phrases(project_dir, group, gap_ms):
    """Prefer the tuned caption-plan (so hand-edited emphasis carries over); else build from
    the transcript with the same chunking rule as the Remotion generator."""
    plan_p = os.path.join(project_dir, "work", "caption-plan.json")
    if os.path.exists(plan_p):
        plan = json.load(open(plan_p, encoding="utf-8"))
        return plan["phrases"], plan
    tp = os.path.join(project_dir, "work", "edited-transcript.json")
    if not os.path.exists(tp):
        raise SystemExit(f"need {plan_p} or {tp}")
    words = json.load(open(tp, encoding="utf-8"))["words"]
    phrases, cur = [], []
    end_rx = re.compile(r"[.!?]$")
    for i, w in enumerate(words):
        cur.append({"t": w["text"], "s": int(w["start"]), "e": int(w["end"]), "m": 0})
        nxt = words[i + 1] if i + 1 < len(words) else None
        pause = (nxt["start"] - w["end"]) if nxt else 10 ** 9
        if nxt is None or end_rx.search(w["text"]) or pause >= gap_ms or len(cur) >= group:
            phrases.append({"s": cur[0]["s"], "e": cur[-1]["e"], "w": cur})
            cur = []
    if cur:
        phrases.append({"s": cur[0]["s"], "e": cur[-1]["e"], "w": cur})
    return phrases, None


def build_ass(phrases, W, H, font, size, margin_v, em_hex, box):
    """One Dialogue event per word ONSET: the whole phrase is redrawn with each word's colour
    reflecting its state. Exact, and cheap enough that a 30-min video is a few MB of text."""
    white, dim = ass_colour("FFFFFF"), ass_colour("FFFFFF", 0x8C)
    em = ass_colour(em_hex)
    border = 3 if box else 1          # 3 = opaque box behind the text, 1 = outline + shadow
    back = "&H99000000" if box else "&H00000000"
    head = [
        "[Script Info]", "ScriptType: v4.00+", f"PlayResX: {W}", f"PlayResY: {H}",
        "WrapStyle: 0", "ScaledBorderAndShadow: yes", "",
        "[V4+ Styles]",
        "Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, "
        "BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, "
        "BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding",
        f"Style: Cap,{font},{size},{white},{white},&H00000000,{back},-1,0,0,0,100,100,0,0,"
        f"{border},{max(2, size // 20)},{0 if box else 2},2,60,60,{margin_v},1",
        "", "[Events]",
        "Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text",
    ]
    lines = []
    for ph in phrases:
        ws = ph["w"]
        for i, cur in enumerate(ws):
            start = cur["s"]
            # hold each state until the next word starts; the last state holds to the phrase end
            end = ws[i + 1]["s"] if i + 1 < len(ws) else max(ph["e"], start + 200)
            if end <= start:
                continue
            parts = []
            for j, w in enumerate(ws):
                spoken = j <= i
                col = em if (w.get("m") and spoken) else (white if spoken else dim)
                parts.append(f"{{\\c{col}}}{esc(w['t'])}")
            lines.append(f"Dialogue: 0,{ts(start)},{ts(end)},Cap,,0,0,0,,{' '.join(parts)}")
    return "\n".join(head + lines) + "\n"


def main():
    ap = argparse.ArgumentParser(description="burned emphasis captions (ASS) for long-form")
    ap.add_argument("project")
    ap.add_argument("--font", default="Arial Black")
    ap.add_argument("--size", type=int, default=None, help="px (default: scales with height)")
    ap.add_argument("--margin-v", type=int, default=None, help="px from the bottom")
    ap.add_argument("--em-color", default="F5D76E", help="emphasis colour, RRGGBB")
    ap.add_argument("--no-box", action="store_true", help="outline instead of a solid backdrop")
    ap.add_argument("--group", type=int, default=4)
    ap.add_argument("--gap", type=float, default=0.45)
    ap.add_argument("--size-wh", default=None, help="WxH override (default from the plan)")
    ap.add_argument("--burn", default=None, help="video to burn the captions into")
    ap.add_argument("--out", default=None)
    a = ap.parse_args()

    proj = a.project if os.path.isabs(a.project) else os.path.abspath(a.project)
    phrases, plan = load_phrases(proj, a.group, int(a.gap * 1000))
    if a.size_wh:
        W, H = (int(x) for x in a.size_wh.lower().split("x"))
    elif plan:
        W, H = plan["width"], plan["height"]
    else:
        W, H = 1920, 1080
    size = a.size or max(28, round(H * 0.036))
    margin_v = a.margin_v if a.margin_v is not None else (round(H * 0.16) if H > W else 90)

    ass = build_ass(phrases, W, H, a.font, size, margin_v, a.em_color, not a.no_box)
    out_ass = os.path.join(proj, "work", "captions.ass")
    with open(out_ass, "w", encoding="utf-8") as f:
        f.write(ass)
    n_ev = ass.count("\nDialogue:")
    n_em = sum(1 for ph in phrases for w in ph["w"] if w.get("m"))
    print(f"{len(phrases)} phrases -> {n_ev} events, {n_em} stressed   {W}x{H} font {size}px")
    print(f"  -> {os.path.relpath(out_ass, ROOT)}  ({os.path.getsize(out_ass)/1024:.0f} KB)")

    if a.burn:
        src = a.burn if os.path.isabs(a.burn) else os.path.abspath(a.burn)
        out = a.out or os.path.splitext(src)[0] + "-cap.mp4"
        out = out if os.path.isabs(out) else os.path.abspath(out)
        # subtitles= parses ':' as its own option separator, so a Windows drive letter breaks it.
        # A CWD-relative forward-slash path sidesteps the whole problem; only fall back to
        # escaping (ONE backslash before the colon) when the file is on another drive.
        try:
            p = os.path.relpath(out_ass).replace("\\", "/")
            if p.startswith(".."):
                raise ValueError
        except ValueError:
            p = out_ass.replace("\\", "/").replace(":", "\\:")
        print(f"  burning -> {os.path.relpath(out, ROOT)}")
        enc, enc_opts = best_h264()
        r = subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", src,
                            "-vf", f"subtitles='{p}'", "-c:a", "copy",
                            "-c:v", enc] + enc_opts + [
                            "-pix_fmt", "yuv420p", "-movflags", "+faststart", out],
                           capture_output=True, text=True)
        if r.returncode != 0:
            sys.stderr.write((r.stderr or "")[-3000:] + "\n")
            raise SystemExit("burn failed")
        print(f"done -> {os.path.relpath(out, ROOT)}")


if __name__ == "__main__":
    main()
