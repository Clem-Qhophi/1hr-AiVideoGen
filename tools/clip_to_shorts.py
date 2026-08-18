#!/usr/bin/env python3
"""
clip_to_shorts.py — turn a finished long-form video into rendered, packaged vertical Shorts.

MECHANICAL ONLY. Picking which moments to clip — the timestamps, titles, hook lines — is a
creative call made by whoever reads the video's transcript (an orchestrating Claude session, or
you by hand); that decision lives in `work/shorts-plan.json`, authored BEFORE this runs, not by
this tool. This tool takes that plan and turns each entry into a real vertical MP4 with burned
captions and a `packaging/publish.json` ready for `tools/yt_upload.py`.

Reframe (16:9 -> 9:16) is a blurred-fill, not a crop: this pipeline's long-form videos carry
on-screen cards/text that span the full width, so cropping the sides would cut them off. Instead
the source is scaled to fit 1080 width, centered, and the top/bottom bars are filled with a
blurred, scaled-up duplicate of the same frame — one ffmpeg filtergraph, no Chrome/Remotion
render (see CLAUDE.md's SPEED section: per-frame Chrome rendering is expensive, ffmpeg
filtergraphs are not).

Captions are re-sliced from the long-form's own `work/caption-plan.json` (or
`work/edited-transcript.json`) — same words, same emphasis — rebased to the clip's local 0:00,
then burned via the ASS `subtitles` filter (reuses gen_captions_ass.py's `build_ass`/
`load_phrases`/`best_h264`, not forked). Vertical styling is deliberately different from the
long-form default: bigger font, and anchored well clear of the bottom ~20% of the frame, which
YouTube's Shorts UI (like/comment/share rail, title/handle bar) covers on every device.

Caveat this tool does NOT handle: the "Related Video" link-back to the long-form. There is no
API for it — it's a manual step in YouTube Studio (Advanced Features) once BOTH videos are
public. See support.google.com/youtube/answer/14075157. `render` prints this every time so it
never gets silently skipped.

WHY THIS EXISTS BEYOND A BARE CUT — YouTube's Reused Content / Inauthentic Content monetization
policy (support.google.com/youtube/answer/1311392) requires "significant original commentary,
substantive modifications, or educational or entertainment value" — a viewer has to be able to
tell the Short is meaningfully different from just watching the source. A single contiguous
`start`/`end` window with captions is a reasonable edit but a thin one. Three features below exist
specifically to clear that bar, plus a length floor:

  * MULTI-SEGMENT STITCHING (`segments`) — join non-contiguous moments (a cold open + a payoff,
    skipping the middle) into one Short. This is not just a bigger cut; it is an edit decision a
    plain re-upload of the source cannot reproduce.
  * HOOK-TEXT CARD (`hook_text`) — burns an original framing line over the first ~1.5-2s that does
    NOT appear anywhere in the source video. This is the single clearest "substantive modification"
    of the three, and it doubles as the 3-second hook every Shorts guide calls mandatory.
  * LOOP-OUT (`loop`) — blends the clip's own tail back into its own opening frames so YouTube's
    auto-repeat reads as an intentional loop. Per the channel owner's own research, a rewatch
    within ~2s of a Short's end counts toward view/watch-time signals, which is a retention
    mechanic a straight cut does not get.
  * 60-SECOND FLOOR — clips should run >= 60s. This tool does not hard-enforce it (a legitimate
    test render should not be blocked), but `render` prints a warning below that line — the
    creative call of WHERE the 60s of substance comes from belongs to whoever authors the plan.

None of this is a substitute for picking a genuinely worthwhile moment — these are mechanical
assists. The creative judgment (which moments, what the hook line says, whether the ends of a clip
actually "rhyme" for a good loop) still belongs to whoever authors shorts-plan.json.

Usage:
  python tools/clip_to_shorts.py render money-archive-compound-interest
  python tools/clip_to_shorts.py render money-archive-compound-interest --clip 01
  python tools/clip_to_shorts.py list money-archive-compound-interest

Input contract — videos/<project>/work/shorts-plan.json:
{
  "source": "videos/<project>/output/<slug>-FINAL.mp4",   // optional, see below
  "clips": [
    {"id": "01", "start": 42.5, "end": 87.0,
     "title": "...", "description": "...\n\n#Shorts", "tags": ["shorts", "..."]},

    // multi-segment form: 2+ non-contiguous windows from the SAME source, concatenated in the
    // order given (replaces "start"/"end" on this clip; do not mix both forms on one clip).
    // Captions are re-sliced per window and rebased to land on the STITCHED timeline, not the
    // original source timeline, so segment 2's words pick up exactly where segment 1's footage
    // ends in the output, not where they were in the long-form.
    {"id": "02", "segments": [{"start": 30.0, "end": 45.0}, {"start": 490.0, "end": 530.0}],
     "title": "...", "description": "...", "tags": ["shorts", "..."],

     // optional, either clip form: crossfade this clip's tail back into its own opening frames
     // after the main render (see LOOP-OUT above). Off by default.
     "loop": true,

     // optional, either clip form: burn a bold white-on-dark-box framing line over the first
     // ~1.5-2s (see HOOK-TEXT CARD above). Keep it short — one line reads best; this is NOT a
     // multi-card title sequence.
     "hook_text": "The number nobody tells you about compound interest"}
  ]
}
`source` is optional — if omitted, it's read from the parent long-form's own
`packaging/publish.json` -> "video" (the finished, mastered file already used for the real
upload), so the plan doesn't have to repeat it.

Output per clip:
  videos/<project>/shorts/<id>/output/<project>-short-<id>.mp4   1080x1920, captions burned in
  videos/<project>/shorts/<id>/packaging/publish.json            yt_upload.py's exact schema
  videos/<project>/shorts/<id>/packaging/description.txt
  videos/<project>/shorts/<id>/work/stitched-source.mp4          multi-segment clips only (Stage A)
  videos/<project>/shorts/<id>/work/loop-bridge.mp4              loop:true clips only

LOOP-OUT MECHANICS AND ITS LIMITS — read this before trusting the feature for something delicate.
It extracts the ALREADY-reframed 1080x1920 clip's last LOOP_XFADE_SECONDS and its first
LOOP_XFADE_SECONDS, ffmpeg-`xfade`s (video) / `acrossfade`s (audio) them into one short bridge
clip, then concat-appends that bridge onto the main clip (stream-copy, same codec/params, so no
quality loss on the join). The result is LOOP_XFADE_SECONDS longer than the un-looped render and
literally repeats footage from both ends inside that bridge. This is a MECHANICAL crossfade
assist, not a true motion-matched loop — a content-aware seamless loop needs the creative layer to
choose already-rhyming start/end moments (matching pose, matching framing); this tool has no idea
whether the first and last frames of a clip look anything alike, it just blends whatever is there.
If the two ends look nothing alike, the crossfade will look like a crossfade, not a loop — that is
expected, not a bug to file against this tool.
"""
import argparse
import json
import os
import subprocess
import sys
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

REPO = Path(__file__).resolve().parent.parent

# gen_captions_ass.py is a plain script (no package), but its top level only defines functions —
# importing it runs no side effects. Reuse its ASS builder + encoder probe rather than forking.
sys.path.insert(0, str(Path(__file__).resolve().parent))
from gen_captions_ass import best_h264, build_ass, load_phrases  # noqa: E402

W, H = 1080, 1920

MIN_CLIP_SECONDS = 60.0     # channel-owner requirement: a Short should carry >= 60s of substance
                             # for the "substantive modification" reused-content bar. Warned, not
                             # hard-enforced (see module docstring).
HOOK_CARD_SECONDS = 1.8     # inside the ~3s window every Shorts hook guide calls mandatory, long
                             # enough to actually read on a phone at a glance
LOOP_XFADE_SECONDS = 0.75   # long enough that the blend reads as a deliberate loop rather than a
                             # flicker, short enough it doesn't meaningfully eat into a 60s-floor
                             # clip's content or outlast the ~2s algorithmic rewatch window


def rel(p: Path) -> str:
    try:
        return str(p.relative_to(REPO))
    except ValueError:
        return str(p)


def rp(p: str) -> Path:
    q = Path(p)
    return q if q.is_absolute() else REPO / q


def resolve_project(name: str) -> Path:
    name = name[len("videos/"):] if name.startswith("videos/") else name
    return REPO / "videos" / name.rstrip("/\\")


def load_shorts_plan(project_dir: Path) -> dict:
    p = project_dir / "work" / "shorts-plan.json"
    if not p.exists():
        raise SystemExit(f"no shorts plan: {rel(p)}\n"
                          f"  author it first (see tools/clip_to_shorts.py's module docstring "
                          f"for the schema) — this tool never invents clip timestamps.")
    return json.loads(p.read_text(encoding="utf-8"))


def resolve_source(plan: dict, project_dir: Path) -> Path:
    src = plan.get("source")
    if not src:
        pub = project_dir / "packaging" / "publish.json"
        if not pub.exists():
            raise SystemExit(f"plan has no 'source' and {rel(pub)} does not exist — "
                              f"add 'source' to shorts-plan.json")
        data = json.loads(pub.read_text(encoding="utf-8"))
        src = data.get("video")
        if not src:
            raise SystemExit(f"{rel(pub)} has no 'video' field")
    p = rp(src)
    if not p.exists():
        raise SystemExit(f"source video not found: {src}")
    return p


def parent_category_id(project_dir: Path) -> int:
    pub = project_dir / "packaging" / "publish.json"
    if pub.exists():
        try:
            cat = json.loads(pub.read_text(encoding="utf-8")).get("categoryId")
            if cat:
                return int(cat)
        except Exception:
            pass
    return 22  # People & Blogs — matches yt_upload.py's own fallback tone (see its DEFAULT_CATEGORY)


def source_caption_band_px(project_dir: Path, source_h: int) -> int:
    """Every long-form master in this pipeline already has ITS OWN captions burned into the
    pixels (spec.json: captions.style=burned) — so compositing the raw source and burning a
    second, bigger, vertical-tuned caption on top puts two caption layers on screen at once.
    Confirmed on weathernext-cyclones-short-01 (2026-08-06): the original small caption survives
    inside the reframed foreground, re-positioned mid-frame by the scale-to-fit-width step.

    Fix: crop the bottom band where the ORIGINAL caption lives before reframing, using that
    project's own work/captions.ass (its Style line has the real MarginV + Fontsize — this varies
    per project, e.g. 90px on weathernext-cyclones vs 220px on burnt-pan-truth, so it must be read,
    not assumed). Returns 0 (no crop) if captions.ass is missing or unparseable — safer to risk a
    surviving small caption than to blind-crop a source that might not have one."""
    ass_path = project_dir / "work" / "captions.ass"
    if not ass_path.exists():
        return 0
    try:
        text = ass_path.read_text(encoding="utf-8")
        style_line = next(l for l in text.splitlines() if l.startswith("Style:"))
        fields = [f.strip() for f in style_line[len("Style:"):].split(",")]
        # Format: Name,Fontname,Fontsize,PrimaryColour,SecondaryColour,OutlineColour,BackColour,
        #         Bold,Italic,Underline,StrikeOut,ScaleX,ScaleY,Spacing,Angle,BorderStyle,Outline,
        #         Shadow,Alignment,MarginL,MarginR,MarginV,Encoding
        #         index:  0    1        2         3            4              5            6
        #                 7    8      9          10        11     12    13      14    15         16
        #                 17    18        19      20      21     22
        fontsize, margin_v = float(fields[2]), float(fields[21])
    except (StopIteration, IndexError, ValueError):
        return 0
    # margin + line height (fontsize covers the glyphs; outline/shadow/leading need slack too) +
    # a flat buffer so a two-line wrap or slightly-off metrics still clears the band.
    band = margin_v + fontsize * 1.8 + 20
    return min(round(band), round(source_h * 0.35))   # cap so a bad parse can't eat the whole frame


def local_phrases_segments(project_dir: Path, segments: list) -> list:
    """Generalized local_phrases(): slices the long-form's global word timings down to EACH
    (start, end) window in `segments` (source-video time) and rebases every word onto the
    STITCHED output timeline — window 0 lands at output 0:00, window 1's words pick up exactly
    where window 0's footage ends in the output (not where they sat in the long-form), and so on.
    A single-element `segments` list rebases identically to the old local_phrases()."""
    phrases, _plan = load_phrases(str(project_dir), 4, 450)
    out = []
    offset_ms = 0.0
    for seg_start, seg_end in segments:
        start_ms, end_ms = seg_start * 1000, seg_end * 1000
        for ph in phrases:
            words = [dict(w) for w in ph["w"] if start_ms <= w["s"] < end_ms]
            if not words:
                continue
            for w in words:
                w["s"] = max(0, w["s"] - start_ms) + offset_ms
                w["e"] = max(0, w["e"] - start_ms) + offset_ms
            out.append({"s": words[0]["s"], "e": words[-1]["e"], "w": words})
        offset_ms += end_ms - start_ms
    return out


def local_phrases(project_dir: Path, start_s: float, end_s: float) -> list:
    """Original single-window entry point, kept for back-compat — delegates to
    local_phrases_segments() with a one-element list, which rebases identically."""
    return local_phrases_segments(project_dir, [(start_s, end_s)])


def get_segments(clip: dict) -> list:
    """Returns a clip's source windows as [(start, end), ...] float-second tuples, in concat
    order. Reads the new 'segments' field if present, else falls back to the original single-
    window 'start'/'end' fields — this fallback is what keeps a plain {"start":.., "end":..} clip
    rendering exactly as it did before this feature existed. Do not set both forms on one clip."""
    cid = clip.get("id", "?")
    raw = clip.get("segments")
    if raw:
        if len(raw) < 1:
            raise SystemExit(f"clip {cid}: 'segments' must have at least 1 window")
        segs = [(float(s["start"]), float(s["end"])) for s in raw]
    else:
        segs = [(float(clip["start"]), float(clip["end"]))]
    for i, (s, e) in enumerate(segs):
        if e <= s:
            raise SystemExit(f"clip {cid}: segment {i} end ({e}) must be after start ({s})")
    return segs


def clip_total_duration(clip: dict) -> float:
    return sum(e - s for s, e in get_segments(clip))


def ff_escape_path(p) -> str:
    """Any path used as a VALUE inside an ffmpeg filtergraph option string (subtitles=,
    fontfile=, textfile=, ...) hits the same problem: ffmpeg parses ':' as its own option
    separator, so a Windows drive letter breaks it. A CWD-relative forward-slash path sidesteps
    it entirely; only escape (one backslash before the colon) when a relative path isn't
    possible (e.g. a different drive, or a long '..' climb out of the repo)."""
    try:
        rp_ = os.path.relpath(p, Path.cwd()).replace("\\", "/")
        if rp_.startswith(".."):
            raise ValueError
    except ValueError:
        rp_ = str(p).replace("\\", "/").replace(":", "\\:")
    return rp_


def ass_filter_path(ass_path: Path) -> str:
    return ff_escape_path(ass_path)


def has_audio(path: Path) -> bool:
    r = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "a",
                        "-show_entries", "stream=index", "-of", "csv=p=0", str(path)],
                       capture_output=True, text=True)
    return bool(r.stdout.strip())


def probe_wh(path: Path) -> tuple:
    r = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0",
                        "-show_entries", "stream=width,height", "-of", "csv=p=0:s=x", str(path)],
                       capture_output=True, text=True)
    w, h = r.stdout.strip().split("x")[:2]
    return int(w), int(h)


def probe_dur(path: Path) -> float:
    r = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                        "-of", "default=nw=1:nk=1", str(path)], capture_output=True, text=True)
    return float(r.stdout.strip())


def stitch_segments(source: Path, clip_dir: Path, segments: list) -> Path:
    """Stage A of the multi-segment path (only called when len(segments) > 1). Cuts each RAW
    window straight from `source` — still 16:9, no reframe/captions/hook card yet, that's Stage B,
    done ONCE on the whole stitched result by the same code path a single-window clip already
    uses — and concatenates them in the order given via ffmpeg's trim/atrim+concat filters.
    Segments do not need to be contiguous or even in source order (a 0:30-0:45 cold open stitched
    straight to an 8:10-8:50 payoff, skipping everything between, is exactly the intended use)."""
    audio = has_audio(source)
    parts, joins = [], []
    for i, (s, e) in enumerate(segments):
        parts.append(f"[0:v]trim=start={s:.3f}:end={e:.3f},setpts=PTS-STARTPTS[v{i}]")
        if audio:
            parts.append(f"[0:a]atrim=start={s:.3f}:end={e:.3f},asetpts=PTS-STARTPTS[a{i}]")
            joins.append(f"[v{i}][a{i}]")
        else:
            joins.append(f"[v{i}]")
    n = len(segments)
    parts.append(f"{''.join(joins)}concat=n={n}:v=1:a={1 if audio else 0}"
                 + ("[vout][aout]" if audio else "[vout]"))
    filter_complex = ";".join(parts)

    out_path = clip_dir / "work" / "stitched-source.mp4"
    enc, enc_opts = best_h264()
    cmd = ["ffmpeg", "-y", "-v", "error", "-i", str(source),
           "-filter_complex", filter_complex,
           "-map", "[vout]"] + (["-map", "[aout]"] if audio else []) + [
           "-c:v", enc, *enc_opts, "-pix_fmt", "yuv420p"] + (
           ["-c:a", "aac", "-b:a", "192k"] if audio else []) + [str(out_path)]
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        sys.stderr.write((r.stderr or "")[-3000:] + "\n")
        raise SystemExit("segment stitch (Stage A) failed")
    return out_path


def wrap_hook_text(text: str, max_chars: int = 20) -> str:
    """drawtext does not auto-wrap — an un-wrapped hook line at a font size big enough to read on
    a phone runs off both edges of a 1080px-wide frame. Greedy word-wrap onto '\\n'-joined lines
    (drawtext draws literal '\\n' in a textfile= as a real line break, and the box= backdrop
    automatically sizes to the whole multi-line block)."""
    lines, cur = [], ""
    for w in text.split():
        trial = f"{cur} {w}".strip()
        if len(trial) > max_chars and cur:
            lines.append(cur)
            cur = w
        else:
            cur = trial
    if cur:
        lines.append(cur)
    return "\n".join(lines)


def hook_card_filter(clip_dir: Path, text: str) -> str:
    """Builds the chained `[capped]drawtext=...drawtext=...[vout]` stages that burn an original
    framing line — one that does NOT appear anywhere in the source long-form — over the clip's
    first HOOK_CARD_SECONDS. White text, thick black outline + a semi-transparent dark box behind
    it (this repo's established thick-outline-over-soft-drop-shadow convention, see
    .claude/skills/packaging/SKILL.md's Thumbnail Checklist item 3 — a soft shadow vanishes over
    busy footage at phone size, a hard outline survives). One drawtext PER wrapped line (not one
    multi-line drawtext) so each line gets centered on its own width — a single drawtext centers
    the whole block on its WIDEST line, leaving shorter lines looking left-shoved. Uses textfile=
    (not text=) so the raw hook string never has to survive ffmpeg's own ':'-as-option-separator
    filtergraph escaping — only the FILE PATH needs that, same fix as the ASS subtitles path. Keep
    hook_text SHORT (one short sentence, ~6-10 words) — wrap_hook_text() still breaks a longer one
    onto more lines, but that reads as a paragraph, not a bold glanceable hook."""
    lines = wrap_hook_text(text.strip()).split("\n")
    font_path = ff_escape_path(Path(os.environ.get("WINDIR", r"C:\Windows")) / "Fonts" / "impact.ttf")
    size = round(W * 0.062)
    line_h = round(size * 1.3)
    stages = []
    label_in = "capped"
    for i, line in enumerate(lines):
        txt_path = clip_dir / "work" / f"hook-line{i}.txt"
        txt_path.write_text(line, encoding="utf-8")
        label_out = "vout" if i == len(lines) - 1 else f"hook{i}"
        y_expr = f"(h*0.30)+{i * line_h}"
        stages.append(
            f"[{label_in}]drawtext=fontfile='{font_path}':textfile='{ff_escape_path(txt_path)}':"
            f"fontcolor=white:fontsize={size}:borderw=7:bordercolor=black:"
            f"box=1:boxcolor=black@0.55:boxborderw=18:"
            f"x=(w-text_w)/2:y={y_expr}:"
            f"enable='lt(t,{HOOK_CARD_SECONDS})'[{label_out}]"
        )
        label_in = label_out
    return ";".join(stages)


def apply_loop(out_path: Path, clip_dir: Path, enc: str, enc_opts: list) -> Path:
    """Appends a short crossfade BRIDGE that blends this clip's own tail into its own opening
    frames, so YouTube's Shorts auto-repeat reads as an intentional loop rather than a hard jump
    back to frame 0 (per the channel owner's research, a rewatch within ~2s of the end counts
    toward view/retention signals). See the module docstring's "LOOP-OUT MECHANICS" section for
    exactly what this does and does not guarantee — it is a mechanical crossfade assist, not a
    true motion-matched loop.

    Technique: extract the last LOOP_XFADE_SECONDS and the first LOOP_XFADE_SECONDS of the
    ALREADY-reframed 1080x1920 clip, `xfade` (video) + `acrossfade` (audio) them into one bridge
    clip of the same duration, then concat-append (stream-copy — same codec/params, so no
    re-encode/quality loss on the join) that bridge onto the main clip. Net effect: output runs
    LOOP_XFADE_SECONDS longer than the un-looped render."""
    dur = probe_dur(out_path)
    if dur <= LOOP_XFADE_SECONDS * 2:
        print(f"    ! loop skipped: clip ({dur:.1f}s) too short for a {LOOP_XFADE_SECONDS}s bridge")
        return out_path

    audio = has_audio(out_path)
    bridge_path = clip_dir / "work" / "loop-bridge.mp4"
    filter_complex = (
        f"[0:v][1:v]xfade=transition=fade:duration={LOOP_XFADE_SECONDS}:offset=0[vout]"
    )
    maps = ["-map", "[vout]"]
    if audio:
        filter_complex += f";[0:a][1:a]acrossfade=d={LOOP_XFADE_SECONDS}[aout]"
        maps += ["-map", "[aout]"]
    cmd = ["ffmpeg", "-y", "-v", "error",
           "-ss", f"{dur - LOOP_XFADE_SECONDS:.3f}", "-t", f"{LOOP_XFADE_SECONDS:.3f}",
           "-i", str(out_path),
           "-ss", "0", "-t", f"{LOOP_XFADE_SECONDS:.3f}", "-i", str(out_path),
           "-filter_complex", filter_complex, *maps,
           "-c:v", enc, *enc_opts, "-pix_fmt", "yuv420p"] + (
           ["-c:a", "aac", "-b:a", "192k"] if audio else []) + [str(bridge_path)]
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        sys.stderr.write((r.stderr or "")[-3000:] + "\n")
        raise SystemExit("loop bridge render failed")

    concat_list = clip_dir / "work" / "loop-concat.txt"
    concat_list.write_text(
        f"file '{str(out_path).replace(chr(92), '/')}'\n"
        f"file '{str(bridge_path).replace(chr(92), '/')}'\n",
        encoding="utf-8")
    looped_path = clip_dir / "work" / "looped.mp4"
    r2 = subprocess.run(["ffmpeg", "-y", "-v", "error", "-f", "concat", "-safe", "0",
                        "-i", str(concat_list), "-c", "copy", str(looped_path)],
                       capture_output=True, text=True)
    if r2.returncode != 0:
        sys.stderr.write((r2.stderr or "")[-3000:] + "\n")
        raise SystemExit("loop concat failed")

    looped_path.replace(out_path)
    return out_path


def render_clip(source: Path, project_dir: Path, clip: dict) -> Path:
    cid = str(clip["id"])
    segments = get_segments(clip)
    total_dur = sum(e - s for s, e in segments)
    if total_dur < MIN_CLIP_SECONDS:
        print(f"    ! clip {cid}: {total_dur:.1f}s is under the {MIN_CLIP_SECONDS:.0f}s floor — "
              f"see the module docstring's 60-SECOND FLOOR note")

    clip_dir = project_dir / "shorts" / cid
    (clip_dir / "work").mkdir(parents=True, exist_ok=True)
    (clip_dir / "output").mkdir(parents=True, exist_ok=True)
    (clip_dir / "packaging").mkdir(parents=True, exist_ok=True)

    if len(segments) > 1:
        working_source = stitch_segments(source, clip_dir, segments)
        work_start = 0.0
    else:
        working_source = source
        work_start = segments[0][0]
    work_dur = total_dur   # for a single segment this equals (end - start); NOT segments[0][1]
                            # (that's the segment's END timestamp, not its duration)

    # captions — sliced + rebased to the STITCHED clip's local time, styled bigger and clear of
    # the bottom ~20% (Shorts UI rail/handle bar), unlike the long-form's bottom-anchored default.
    phrases = local_phrases_segments(project_dir, segments)
    font_size = round(H * 0.038)
    margin_v = round(H * 0.20)   # Safely positioned in lower safe-zone above YouTube UI rail
    ass_text = build_ass(phrases, W, H, "Arial Black", font_size, margin_v, "F5D76E", True)
    ass_path = clip_dir / "work" / "captions.ass"
    ass_path.write_text(ass_text, encoding="utf-8")

    enc, enc_opts = best_h264()
    hook_text = clip.get("hook_text")
    src_w, src_h = probe_wh(working_source)
    band = source_caption_band_px(project_dir, src_h)
    crop_h = (src_h - band) // 2 * 2   # even height — odd dims break yuv420p downstream
    pre = f"[0:v]crop={src_w}:{crop_h}:0:0[decapped];" if band > 0 else ""
    split_in = "[decapped]" if band > 0 else "[0:v]"
    filter_complex = (
        f"{pre}"
        f"{split_in}split=2[bg0][fg0];"
        f"[bg0]scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},gblur=sigma=20[bg];"
        f"[fg0]scale={W}:-2[fg];"
        "[bg][fg]overlay=(W-w)/2:(H-h)/2[reframed];"
        f"[reframed]subtitles='{ass_filter_path(ass_path)}'[{'vout' if not hook_text else 'capped'}]"
    )
    if hook_text:
        filter_complex += ";" + hook_card_filter(clip_dir, hook_text)

    out_path = clip_dir / "output" / f"{project_dir.name}-short-{cid}.mp4"
    cmd = ["ffmpeg", "-y", "-v", "error",
           "-ss", f"{work_start:.3f}", "-t", f"{work_dur:.3f}", "-i", str(working_source),
           "-filter_complex", filter_complex,
           "-map", "[vout]", "-map", "0:a?",
           "-c:v", enc, *enc_opts,
           "-pix_fmt", "yuv420p",
           "-c:a", "aac", "-b:a", "192k",
           "-movflags", "+faststart",
           str(out_path)]
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        sys.stderr.write((r.stderr or "")[-3000:] + "\n")
        raise SystemExit(f"clip {cid}: ffmpeg render failed")

    if clip.get("loop"):
        out_path = apply_loop(out_path, clip_dir, enc, enc_opts)

    # package for tools/yt_upload.py — exact schema, paths relative to REPO
    desc = clip.get("description", "")
    desc_path = clip_dir / "packaging" / "description.txt"
    desc_path.write_text(desc.strip() + "\n", encoding="utf-8")

    publish = {
        "video": out_path.relative_to(REPO).as_posix(),
        "title": clip["title"],
        "description_file": desc_path.relative_to(REPO).as_posix(),
        "tags": clip.get("tags", []),
        "categoryId": parent_category_id(project_dir),
        "privacy": "private",
        "madeForKids": False,
    }
    pub_path = clip_dir / "packaging" / "publish.json"
    pub_path.write_text(json.dumps(publish, indent=2), encoding="utf-8")

    expected_dur = total_dur + (LOOP_XFADE_SECONDS if clip.get("loop") else 0)
    actual_w, actual_h = probe_wh(out_path)
    actual_dur = probe_dur(out_path)
    print(f"[{cid}] '{clip['title']}'")
    print(f"    duration   : {actual_dur:.1f}s (requested {total_dur:.1f}s"
          f"{f' + {LOOP_XFADE_SECONDS:.2f}s loop bridge' if clip.get('loop') else ''})")
    print(f"    resolution : {actual_w}x{actual_h}")
    if len(segments) > 1:
        print(f"    segments   : {len(segments)} windows stitched")
    print(f"    output     : {rel(out_path)}")
    print(f"    packaging  : {rel(pub_path)}")
    if abs(actual_dur - expected_dur) > 0.5:
        print(f"    ! duration drift {actual_dur - expected_dur:+.2f}s vs the requested window")
    return out_path


def cmd_render(project_dir: Path, only_clip: str | None) -> None:
    if not project_dir.exists():
        raise SystemExit(f"project not found: {rel(project_dir)}")
    plan = load_shorts_plan(project_dir)
    source = resolve_source(plan, project_dir)
    clips = plan.get("clips", [])
    if only_clip:
        clips = [c for c in clips if str(c["id"]) == str(only_clip)]
        if not clips:
            raise SystemExit(f"no clip with id '{only_clip}' in the plan")

    print(f"source: {rel(source)}  ({probe_dur(source):.1f}s)")
    for clip in clips:
        render_clip(source, project_dir, clip)

    print("\n! Related-Video link-back to the long-form is NOT handled here — there is no API for")
    print("  it. Add it manually in YouTube Studio (Advanced Features) once BOTH the Short and the")
    print("  long-form are public. https://support.google.com/youtube/answer/14075157")


def cmd_list(project_dir: Path) -> None:
    if not project_dir.exists():
        raise SystemExit(f"project not found: {rel(project_dir)}")
    plan_path = project_dir / "work" / "shorts-plan.json"
    if not plan_path.exists():
        print(f"! no shorts plan: {rel(plan_path)}")
        return
    plan = json.loads(plan_path.read_text(encoding="utf-8"))
    for clip in plan.get("clips", []):
        cid = str(clip["id"])
        dur = clip_total_duration(clip)
        flags = "".join(f
                        for f, on in ((" [stitched]", len(clip.get("segments", [])) > 1),
                                      (" [loop]", clip.get("loop")),
                                      (" [hook]", clip.get("hook_text")))
                        if on)
        clip_dir = project_dir / "shorts" / cid
        rendered = any((clip_dir / "output").glob("*.mp4")) if (clip_dir / "output").exists() else False
        uploaded = (clip_dir / "packaging" / "published.json").exists()
        r = "✓ rendered" if rendered else "  not rendered"
        u = "✓ uploaded" if uploaded else "  not uploaded"
        print(f"[{cid}] {dur:6.1f}s  {clip.get('title', '(untitled)'):<50}  {r}  {u}{flags}")


def main() -> None:
    ap = argparse.ArgumentParser(description="render a project's shorts-plan.json into packaged vertical Shorts")
    sub = ap.add_subparsers(dest="cmd", required=True)

    r = sub.add_parser("render", help="render clip(s) and write yt_upload.py packaging")
    r.add_argument("project", help="e.g. money-archive-compound-interest")
    r.add_argument("--clip", default=None, help="only render this clip id (default: all)")

    lst = sub.add_parser("list", help="list plan clips + render/upload status (no ffmpeg cost)")
    lst.add_argument("project")

    args = ap.parse_args()
    project_dir = resolve_project(args.project)

    if args.cmd == "render":
        cmd_render(project_dir, args.clip)
    elif args.cmd == "list":
        cmd_list(project_dir)


if __name__ == "__main__":
    main()
