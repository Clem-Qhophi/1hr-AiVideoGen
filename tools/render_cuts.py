"""Render the cleaned edit from cuts.json.

Usage:
  python tools/render_cuts.py video-1 --style tight --mode preview
  python tools/render_cuts.py video-1 --style tight --mode final

preview: 720p h264_nvenc, fast.  final: 4K60 10-bit hevc_nvenc, high quality.

Segments come from cutlib.plan_clip: keeps are split into speech runs at pauses
>= internal_gap, each run's tail is snapped to the audio floor (words finish
cleanly, no clipped releases), and pauses are compressed per style.

A/V SYNC (bug found on ch-3, 2026-07-10): segments must be cut VIDEO-ONLY and the
audio assembled separately. When each segment MP4 carries its own AAC, video rounds
to whole frames while audio rounds to 1024-sample AAC frames — the rounding differs,
so `concat -c copy` accumulates ~15-20 ms of lip-sync drift PER CUT (~1s over 34
segments). Fix: concat the video segments, probe each segment's ACTUAL frame count,
then cut the raw audio to those exact sample lengths (atrim=end_sample), concat the
PCM gaplessly, and encode/mux the audio ONCE. Bounded per-segment jitter, zero
accumulation.
"""

import argparse
import json
import os
import subprocess
from concurrent.futures import ThreadPoolExecutor
from fractions import Fraction
from pathlib import Path

from cutlib import AudioProbe, active_keeps, load_words, plan_clip

SR = 48000  # audio build sample rate

PREVIEW_LONG_SIDE = 1280


def preview_scale(src: Path, src_filter: str = "") -> str:
    """Fit the LONG side to 1280, never upscale, keep both sides even.

    A flat `scale=1280:-2` assumes landscape: on a 1080x1920 vertical (Shorts/Reels) master it
    produced 1280x2276 — upscaling the *preview* above its own source. Probed here rather than
    written as an ffmpeg expression because scale rejects a negative auto-dimension coming out
    of an if() expression.

    When the clip has a `source_filter`, the LOOK sets the output size (a crop + upscale), so the
    raw file's dimensions are the wrong thing to measure — probing the source gave a 352x640
    preview of a 1080x1920 edit. Push one frame through the filter and measure what comes out.
    """
    w = h = None
    try:
        if src_filter:
            tmp = Path(os.environ.get("TEMP", ".")) / "_rc_probe.png"
            subprocess.run(["ffmpeg", "-y", "-v", "error", "-i", str(src),
                            "-filter_complex", f"[0:v]{src_filter}[v]", "-map", "[v]",
                            "-frames:v", "1", str(tmp)], check=True, capture_output=True)
            out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "stream=width,height",
                                  "-of", "csv=p=0:s=x", str(tmp)],
                                 capture_output=True, text=True, check=True).stdout.strip()
        else:
            out = subprocess.run(
                ["ffprobe", "-v", "error", "-select_streams", "v:0",
                 "-show_entries", "stream=width,height", "-of", "csv=p=0:s=x", str(src)],
                capture_output=True, text=True, check=True).stdout.strip()
        w, h = (int(x) for x in out.splitlines()[0].split("x")[:2])
    except Exception:
        return "scale=-2:720"                       # safe fallback, orientation-agnostic
    f = min(1.0, PREVIEW_LONG_SIDE / max(w, h))
    return f"scale={max(2, int(w * f) // 2 * 2)}:{max(2, int(h * f) // 2 * 2)}"


ENC = {
    "preview": ["-vf", "scale=1280:-2,format=yuv420p", "-c:v", "h264_nvenc", "-preset", "p4",
                "-rc", "vbr", "-cq", "30", "-b:v", "0"],
    "final": ["-c:v", "hevc_nvenc", "-preset", "p5", "-profile:v", "main10",
              "-pix_fmt", "p010le", "-rc", "vbr", "-cq", "19", "-b:v", "0"],
}
# CPU equivalents, used when there is no working NVIDIA encoder. Slower, same result.
ENC_CPU = {
    "preview": ["-vf", "scale=1280:-2,format=yuv420p", "-c:v", "libx264", "-preset", "veryfast",
                "-crf", "23", "-pix_fmt", "yuv420p"],
    "final": ["-c:v", "libx265", "-preset", "medium", "-crf", "20",
              "-pix_fmt", "yuv420p10le", "-tag:v", "hvc1"],
}
AUDIO_BITRATE = {"preview": "160k", "final": "256k", "deliver": "256k"}

_HW_CACHE = {}

# H.264 hardware encoders in preference order, with their quality knob. NVIDIA is NOT the only
# option and assuming it was cost this repo a 4x speedup: the dev box had no NVIDIA GPU but did
# have working Intel QuickSync and MediaFoundation. Measured on 10s of 1080x1920:
#   libx264 10955ms | h264_qsv 2833ms | h264_mf 2447ms | h264_amf unavailable
HW_H264 = [
    ("h264_nvenc", ["-preset", "p5", "-rc", "vbr", "-cq", "23", "-b:v", "0"]),
    ("h264_qsv",   ["-global_quality", "23", "-preset", "medium"]),
    ("h264_amf",   ["-quality", "quality", "-rc", "cqp", "-qp_i", "23", "-qp_p", "23"]),
    ("h264_mf",    ["-rate_control", "quality", "-quality", "70"]),
]


def _encoder_works(name: str) -> bool:
    """Probe by actually encoding a frame. `ffmpeg -encoders` lists everything the BUILD
    supports regardless of the hardware present, so the list proves nothing."""
    if name not in _HW_CACHE:
        r = subprocess.run(
            ["ffmpeg", "-v", "error", "-f", "lavfi", "-i", "nullsrc=s=256x256:d=1",
             "-frames:v", "1", "-c:v", name, "-f", "null", "-"],
            capture_output=True, text=True)
        _HW_CACHE[name] = r.returncode == 0 and "Could not open encoder" not in (r.stderr or "")
    return _HW_CACHE[name]


def best_h264() -> tuple[str, list[str]]:
    """Fastest WORKING h264 encoder, falling back to libx264."""
    for name, opts in HW_H264:
        if _encoder_works(name):
            return name, opts
    return "libx264", ["-preset", "medium", "-crf", "19"]


def have_nvenc() -> bool:
    return _encoder_works("h264_nvenc")


def render_segment(src: Path, seg: tuple[float, float], out: Path, enc: list[str],
                   vf: str = "", hwaccel: str = "") -> None:
    start, end = seg
    dur = end - start
    cmd = ["ffmpeg", "-y", "-loglevel", "error"]
    if hwaccel:
        cmd += ["-hwaccel", hwaccel]
    cmd += ["-ss", f"{start:.3f}", "-t", f"{dur:.3f}", "-i", str(src), "-an"]
    # exactly ONE video map: the filtered output if there is a filtergraph, else the raw stream.
    # Passing both -map 0:0 and -map [v] silently ships the UNFILTERED stream as v:0 — the look
    # vanishes and the only symptom is the output's dimensions.
    if vf:
        cmd += ["-filter_complex", f"[0:v]{vf}[v]", "-map", "[v]"]
    else:
        cmd += ["-map", "0:0"]
    cmd += [*enc, str(out)]
    subprocess.run(cmd, check=True)


def video_duration(path: Path) -> float:
    """Actual encoded duration from frame count (exact), falling back to container."""
    r = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0",
                        "-show_entries", "stream=nb_frames,avg_frame_rate,duration",
                        "-of", "json", str(path)], capture_output=True, text=True, check=True)
    st = json.loads(r.stdout)["streams"][0]
    try:
        return int(st["nb_frames"]) / float(Fraction(st["avg_frame_rate"]))
    except (KeyError, ValueError, ZeroDivisionError):
        return float(st["duration"])


def render_audio_segment(src: Path, start: float, dur: float, out: Path) -> None:
    """Raw audio cut to a SAMPLE-EXACT length matching the segment's video.

    `aresample` MUST come first. `atrim=end_sample` counts samples at the rate reaching the
    filter, and `-ar` is an OUTPUT option applied after filtering — so on a source that is not
    already 48 kHz, n (computed for 48 kHz) trimmed at the source rate and every segment came
    out SR/src_rate too long. A 44.1 kHz phone recording ran 8.84% long, capped by the +0.2s
    decode margin: +3.6s of audio against the video over 25 segments (video-1, 2026-07-25).
    Camera sources are usually already 48 kHz, which is why this hid for so long.
    """
    n = round(dur * SR)
    fades = (f"aresample={SR},atrim=end_sample={n},"
             f"afade=t=in:d=0.01,afade=t=out:st={max(n / SR - 0.01, 0):.4f}:d=0.01")
    cmd = ["ffmpeg", "-y", "-loglevel", "error",
           "-ss", f"{start:.3f}", "-t", f"{dur + 0.2:.3f}", "-i", str(src),
           "-vn", "-ar", str(SR), "-ac", "1", "-af", fades,
           "-c:a", "pcm_s16le", str(out)]
    subprocess.run(cmd, check=True)


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("project")
    ap.add_argument("--style", required=True)
    ap.add_argument("--mode", choices=["preview", "final", "deliver"], default="preview")
    args = ap.parse_args()

    project = Path(__file__).resolve().parent.parent / args.project
    data = json.loads((project / "work" / "analysis" / "cuts.json").read_text(encoding="utf-8"))
    style = data["styles"][args.style]
    probe = AudioProbe(project)

    jobs = []  # (source file, (start, end))
    by_id = {c["id"]: c for c in data["clips"]}
    for cid in data["clip_order"]:
        clip = by_id[cid]
        words = load_words(project, cid)
        for seg in plan_clip(cid, active_keeps(clip), words, style, probe):
            jobs.append((project / clip["file"], seg))

    total = sum(e - s for _, (s, e) in jobs)
    print(f"{args.style}/{args.mode}: {len(jobs)} segments, output ~ {total / 60:.1f} min")

    seg_dir = project / "work" / "render" / f"{args.style}-{args.mode}"
    seg_dir.mkdir(parents=True, exist_ok=True)
    outs = [seg_dir / f"seg_{i:03d}.mp4" for i in range(len(jobs))]

    # The LOOK (flip / crop / blur / grade) lives in cuts.json and is applied HERE, straight off
    # the original, so there is no pre-rendered "clean source" generation. One encode instead of
    # three: measured 3.8x faster AND higher quality (SSIM 0.9964 vs 0.9869) because each extra
    # re-encode discards detail permanently.
    src_filter = (by_id[data["clip_order"][0]].get("source_filter") or "").strip().rstrip(",")

    if args.mode in ("deliver", "preview"):
        name, opts = best_h264()
        if args.mode == "preview":       # previews are for judging the CUT, not the grade
            opts = {"h264_nvenc": ["-preset", "p4", "-rc", "vbr", "-cq", "30", "-b:v", "0"],
                    "h264_qsv": ["-global_quality", "28", "-preset", "veryfast"],
                    "h264_amf": ["-quality", "speed", "-rc", "cqp", "-qp_i", "28", "-qp_p", "28"],
                    "h264_mf": ["-rate_control", "quality", "-quality", "55"],
                    "libx264": ["-preset", "veryfast", "-crf", "26"]}[name]
        enc = ["-c:v", name, *opts, "-pix_fmt", "yuv420p"]
        hwaccel = "cuda" if name == "h264_nvenc" else ""
        label = name
    else:
        hw = have_nvenc()
        enc = list((ENC if hw else ENC_CPU)[args.mode])
        if "-vf" in enc:                       # legacy scale lives in the vf we now build below
            i = enc.index("-vf")
            del enc[i:i + 2]
        hwaccel = "cuda" if hw else ""
        label = "NVENC (gpu)" if hw else "libx264/libx265 (cpu)"

    vf_parts = ([src_filter] if src_filter else [])
    if args.mode == "preview" and jobs:
        vf_parts.append(preview_scale(jobs[0][0], src_filter))
    vf_parts.append("format=yuv420p10le" if (args.mode == "final" and not src_filter) else "format=yuv420p")
    vf = ",".join(p for p in vf_parts if p)
    print(f"  encoder: {label}" + (f"   look: {src_filter[:60]}..." if src_filter else ""))

    workers = 3 if hwaccel else max(2, (os.cpu_count() or 4) // 2)
    with ThreadPoolExecutor(max_workers=workers) as pool:
        futs = [pool.submit(render_segment, src, seg, out, enc, vf, hwaccel)
                for (src, seg), out in zip(jobs, outs)]
        for i, f in enumerate(futs):
            f.result()
            if (i + 1) % 20 == 0:
                print(f"  {i + 1}/{len(jobs)} segments encoded")

    # concat the video-only segments via an MPEG-TS intermediate. An mp4 segment's
    # container tacks an extra frame-duration of padding onto its last sample when the
    # `-t` cut lands mid-frame; `concat -c copy` of mp4s then ACCUMULATES that padding
    # into the video (~10-16ms per cut => ~0.8s over ~100 cuts on 59.94fps footage),
    # while the sample-exact audio has none -> progressive lip-sync drift. TS carries no
    # per-file trailing gap, so the concat stays frame-exact (bounded, non-accumulating).
    bsf = "hevc_mp4toannexb" if args.mode == "final" else "h264_mp4toannexb"
    # deliver == h264, same as preview
    ts_files = []
    for o in outs:
        ts = o.with_suffix(".ts")
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(o),
                        "-c", "copy", "-bsf:v", bsf, "-f", "mpegts", str(ts)], check=True)
        ts_files.append(ts)
    list_file = seg_dir / "list.txt"
    list_file.write_text("\n".join(f"file '{t.as_posix()}'" for t in ts_files), encoding="utf-8")
    video_concat = seg_dir / "video.mp4"
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-f", "concat", "-safe", "0",
                    "-i", str(list_file), "-c", "copy", "-fflags", "+genpts",
                    str(video_concat)], check=True)

    # build the audio to the segments' ACTUAL video lengths (sample-exact, no drift)
    print("building drift-free audio track...")
    wavs = []
    for (src, (start, _end)), out in zip(jobs, outs):
        dur = video_duration(out)
        wav = out.with_suffix(".wav")
        render_audio_segment(src, start, dur, wav)
        wavs.append(wav)
    alist = seg_dir / "alist.txt"
    alist.write_text("\n".join(f"file '{w.as_posix()}'" for w in wavs), encoding="utf-8")
    audio_concat = seg_dir / "audio.wav"
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-f", "concat", "-safe", "0",
                    "-i", str(alist), "-c", "copy", str(audio_concat)], check=True)

    # NB (2026-07-11): the HEVC final still stamps its frame PTS ~0.1% fast on 59.94fps
    # footage (r_frame_rate stays 60000/1001 but the PTS span runs ~0.3s short over ~4min),
    # an hevc_nvenc/TS quirk that a stream COPY can't correct. It's separate from (and far
    # smaller than) the ~0.8s concat accumulation fixed above. The h264 preview stamps
    # correctly. Correct the final at delivery by re-timing on re-encode: prepend
    # `-r 60000/1001` (the source fps) BEFORE `-i` when transcoding — that re-stamps every
    # frame to true CFR with no frame loss. Verify any delivered file with:
    # ffprobe stream=duration on v:0 vs a:0 — they must be equal.

    # single mux: copied video + one continuous AAC encode
    out_name = {"preview": f"preview-{args.style}.mp4",
                "final": f"master-{args.style}.mp4",
                "deliver": f"deliver-{args.style}.mp4"}[args.mode]
    out_path = project / "output" / out_name
    out_path.parent.mkdir(parents=True, exist_ok=True)   # first render of a new project
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error",
                    "-i", str(video_concat), "-i", str(audio_concat),
                    "-map", "0:v", "-map", "1:a", "-c:v", "copy",
                    "-c:a", "aac", "-b:a", AUDIO_BITRATE[args.mode],
                    str(out_path)], check=True)
    print(f"wrote {out_path}")


if __name__ == "__main__":
    main()
