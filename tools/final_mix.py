#!/usr/bin/env python3
"""
final_mix.py — the DELIVERY MASTER step. Loudness-normalize a finished cut for YouTube.

This is the step the pipeline kept deferring to a "/assemble" that was never built:
tools/mix_sfx.py and tools/mix_music.py both say "final polished mix / loudness normalization
is /assemble's job later", so until now every video shipped at whatever level the AUDITION mix
happened to land on. That is why an otherwise good video sounds weak next to other channels.

What it does:
  1. measures the input (integrated LUFS, true peak, loudness range),
  2. applies a TWO-PASS linear loudnorm to hit the target exactly,
  3. re-measures the OUTPUT and prints the delta, so the claim is verified, not asserted.

Two-pass linear is the point. Single-pass loudnorm is a dynamic processor: it rides the gain and
can pump on a voice track. Measuring first and applying one fixed offset preserves the dynamics
the cut and the SFX pass worked for.

Targets default to YouTube: -14 LUFS integrated, -1.0 dBTP ceiling. YouTube turns loud uploads
DOWN and mostly leaves quiet ones alone, so delivering quiet just means being quiet.
  --target -16   podcast-ish / Spotify
  --target -14   YouTube, Apple Music (default)
  --tp -1.0      true-peak ceiling; keep at or below -1 so lossy transcode does not clip

Usage:
  python tools/final_mix.py videos/video-1/output/video-1-preview-sfx-lofi-warm.mp4
  python tools/final_mix.py <in.mp4> --out videos/video-1/output/video-1-MASTER.mp4
  python tools/final_mix.py <in.mp4> --measure-only        # just tell me where it sits

Video is stream-copied (no re-encode, no quality loss); only audio is touched.
ffmpeg/ffprobe on PATH.
"""
import argparse
import json
import os
import re
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def show(p):
    try:
        return os.path.relpath(p, ROOT)
    except ValueError:
        return p


def run(cmd, check=True):
    """ffmpeg writes its analysis to stderr, so capture both and keep them separate."""
    r = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True,
                       encoding="utf-8", errors="replace")
    if check and r.returncode != 0:
        sys.stderr.write("\nFFMPEG FAILED:\n  " + " ".join(cmd) + "\n" + (r.stderr or "")[-4000:] + "\n")
        raise SystemExit(1)
    return r


def has_audio(path):
    r = run(["ffprobe", "-v", "error", "-select_streams", "a:0",
             "-show_entries", "stream=codec_name", "-of", "csv=p=0", path])
    return bool(r.stdout.strip())


def measure(path, target, tp, lra):
    """Pass 1: what IS this file? Returns the loudnorm measurement dict.

    `-vn` BEFORE -i drops the video stream at the demuxer, so this never decodes 1080p frames it is
    only going to throw away — loudness is an audio-only question. Measured 2026-08-05 on an 855s
    1080p file: 288s -> 181s per pass (-37%), and this runs 2-3 times per master (initial measure +
    each verify), so it is several minutes off every single delivery. Correctness is unchanged: the
    numbers come from the audio stream either way."""
    r = run(["ffmpeg", "-hide_banner", "-nostats", "-vn", "-i", path,
             "-af", f"loudnorm=I={target}:TP={tp}:LRA={lra}:print_format=json",
             "-f", "null", "-"])
    # the JSON block is the last {...} ffmpeg prints on stderr
    blocks = re.findall(r"\{[^{}]*\}", r.stderr or "", re.S)
    if not blocks:
        sys.stderr.write((r.stderr or "")[-2000:] + "\n")
        raise SystemExit("could not parse loudnorm measurement from ffmpeg output")
    return json.loads(blocks[-1])


def fmt(m):
    def g(k):
        v = m.get(k)
        try:
            return float(v)
        except (TypeError, ValueError):
            return float("nan")
    return (f"I={g('input_i'):>7.2f} LUFS   TP={g('input_tp'):>6.2f} dBTP   "
            f"LRA={g('input_lra'):>5.2f} LU   thresh={g('input_thresh'):>7.2f}")


def main():
    ap = argparse.ArgumentParser(description="loudness-normalize a finished video for delivery")
    ap.add_argument("input", help="the finished video (voice + SFX + music already mixed)")
    ap.add_argument("--out", default=None, help="output path (default: <input>-MASTER.mp4)")
    ap.add_argument("--target", type=float, default=-14.0, help="integrated LUFS target (default -14)")
    ap.add_argument("--tp", type=float, default=-1.0, help="true-peak ceiling dBTP (default -1.0)")
    ap.add_argument("--lra", type=float, default=11.0, help="loudness range target LU (default 11)")
    ap.add_argument("--abr", default="256k", help="output audio bitrate (default 256k)")
    ap.add_argument("--measure-only", action="store_true", help="report levels, write nothing")
    ap.add_argument("--no-verify", action="store_true", help="skip the re-measure of the output")
    a = ap.parse_args()

    src = a.input if os.path.isabs(a.input) else os.path.abspath(a.input)
    if not os.path.exists(src):
        raise SystemExit(f"no such file: {src}")
    if not has_audio(src):
        raise SystemExit(f"{show(src)} has no audio stream — nothing to master")

    print(f"in : {show(src)}")
    m = measure(src, a.target, a.tp, a.lra)
    print(f"  measured   {fmt(m)}")

    delta = None
    try:
        delta = a.target - float(m["input_i"])
    except (KeyError, TypeError, ValueError):
        pass
    if delta is not None:
        verdict = ("already on target" if abs(delta) < 0.5
                   else f"{'QUIET' if delta > 0 else 'HOT'} by {abs(delta):.1f} LU")
        print(f"  target     I={a.target:.1f} LUFS  TP={a.tp:.1f} dBTP   -> {verdict}")

    if a.measure_only:
        return

    out = a.out or os.path.join(os.path.dirname(src),
                                os.path.splitext(os.path.basename(src))[0] + "-MASTER.mp4")
    out = out if os.path.isabs(out) else os.path.abspath(out)
    if os.path.abspath(out) == os.path.abspath(src):
        raise SystemExit("refusing to overwrite the input; pass a different --out")
    os.makedirs(os.path.dirname(out), exist_ok=True)

    # Pass 2: feed the measurements back so the gain is ONE fixed offset (linear), not a
    # ride. `offset` carries loudnorm's own target-vs-measured correction.
    #
    # loudnorm's true-peak limiter is APPROXIMATE and routinely lands a few tenths of a dB over
    # the requested ceiling — worse with percussive SFX in the mix (a video-1 SFX pass came out
    # at -0.46 dBTP against a -1.0 ceiling). Over-ceiling matters: the platform re-encodes to a
    # lossy codec and inter-sample peaks clip. So aim BELOW the ceiling, re-measure, and if it
    # still overshoots, aim lower again. Verified, not hoped.
    def encode(tp_aim):
        ln = (f"loudnorm=I={a.target}:TP={tp_aim}:LRA={a.lra}"
              f":measured_I={m['input_i']}:measured_TP={m['input_tp']}"
              f":measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}"
              f":offset={m.get('target_offset', 0)}:linear=true:print_format=summary")
        run(["ffmpeg", "-y", "-hide_banner", "-nostats", "-i", src,
             "-map", "0:v:0", "-map", "0:a:0",
             "-c:v", "copy",                   # video untouched: no re-encode, no quality loss
             "-af", ln,
             "-ar", "48000", "-c:a", "aac", "-b:a", a.abr,
             # loudnorm's filter padding routinely leaves audio ~50-100ms longer than the
             # stream-copied video (measured on openai-hf-hack: 140.714s in -> 140.800s out,
             # enough to fail check_deliverable's 50ms A/V-duration-agree gate). Video is always
             # the fixed reference here (untouched copy), so -shortest trims audio down to it
             # rather than the reverse.
             "-shortest",
             "-movflags", "+faststart", out])

    aim = a.tp
    print(f"  normalizing (two-pass linear) -> {show(out)}")
    encode(aim)

    if a.no_verify:
        print(f"done -> {show(out)}")
        return

    # Verify: re-measure the file we actually wrote. A mastering step that only claims to have
    # hit the target is worth nothing.
    m2 = measure(out, a.target, a.tp, a.lra)
    for _ in range(2):
        try:
            over = float(m2["input_tp"]) - a.tp
        except (KeyError, TypeError, ValueError):
            break
        if over <= 0.1:
            break
        aim = round(aim - over - 0.2, 2)
        print(f"  true peak {float(m2['input_tp']):.2f} dBTP over ceiling; re-aiming at TP={aim}")
        encode(aim)
        m2 = measure(out, a.target, a.tp, a.lra)
    print(f"  verified   {fmt(m2)}")
    try:
        got_i, got_tp = float(m2["input_i"]), float(m2["input_tp"])
        off_i, over_tp = got_i - a.target, got_tp - a.tp
        ok_i, ok_tp = abs(off_i) <= 1.0, got_tp <= a.tp + 0.3
        print(f"  {'OK  ' if ok_i else 'MISS'} integrated {got_i:.2f} LUFS "
              f"({off_i:+.2f} vs target)")
        print(f"  {'OK  ' if ok_tp else 'MISS'} true peak  {got_tp:.2f} dBTP "
              f"({over_tp:+.2f} vs ceiling)")
        if not (ok_i and ok_tp):
            print("  NOTE: a short or very quiet clip can miss the integrated target "
                  "(loudnorm gates near-silence). Check the source before re-running.")
    except (KeyError, TypeError, ValueError):
        pass
    print(f"done -> {show(out)}")


if __name__ == "__main__":
    main()
