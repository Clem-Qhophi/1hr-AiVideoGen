#!/usr/bin/env python3
"""
bake.py — hybrid ffmpeg assembler for the AI Video Editor (step 2 / step 5 preview).

Reads a timeline.json that maps Remotion shots onto the master cut and
bakes a flat preview:
  - master AUDIO plays throughout (the human cut is the spine);
  - 'cutaway' spans REPLACE the master video with the shot's mp4;
  - 'overlay' spans COMPOSITE an alpha shot (.mov, ProRes 4444) over the master;
  - 'reframes' spans PUNCH IN on the master (zoom/reposition the talking head);
  - everywhere else the master video passes through.

Method: split [0, end] into atomic segments at every shot AND reframe boundary, render
each segment to an identically-encoded clip, concat them (stream copy — no second
encode generation), then mux master audio 0..end. Frame-accurate: per-segment frame
counts come from rounded cumulative boundaries so the total matches the audio exactly
(no cumulative drift).

Speed (2026-08-01): segments encode with the best WORKING h264 encoder (probe, like
render_cuts/build_longform — QSV is ~4x libx264 on this machine) and render in
parallel. Segments are content-hashed and CACHED in _bake_tmp: re-baking after a
one-beat change only re-renders the affected segments. --fresh forces a full
re-render.

Usage:
  python tools/bake.py [video-1/work/timeline.json] [--end SECONDS] [--keep] [--no-reframe] [--fresh]
"""
import hashlib
import json
import os
import subprocess
import sys
import shutil
from concurrent.futures import ThreadPoolExecutor, as_completed

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def proj(p):
    """Resolve PROJECT-data paths (timeline, master, preview out) relative to the CURRENT
    WORKING DIR — i.e. the type workspace you run from (longs/), where video-N lives — NOT
    relative to ROOT (=core/, the shared engine). Engine/library paths still use ROOT."""
    return p if os.path.isabs(p) else os.path.abspath(p)


def run(cmd):
    r = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
    if r.returncode != 0:
        sys.stderr.write("\nFFMPEG FAILED:\n  " + " ".join(cmd) + "\n" + r.stdout[-4000:] + "\n")
        raise SystemExit(1)
    return r.stdout


def probe_dims(path):
    """(width, height) of a file's first video stream — sizes the zoompan prescale."""
    out = run(["ffprobe", "-v", "error", "-select_streams", "v:0",
               "-show_entries", "stream=width,height", "-of", "csv=p=0:s=x", path]).strip()
    w, h = out.splitlines()[0].split("x")[:2]
    return int(w), int(h)


def best_h264():
    """Same probe-don't-assume rule as render_cuts/build_longform: a listed encoder may
    not work, so encode a test frame with each candidate (QSV is ~4x libx264 here)."""
    def ok(cmd):
        r = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        return r.returncode == 0 and "Could not open encoder" not in (r.stderr or "")
    for name, opts in (("h264_nvenc", ["-preset", "p5", "-rc", "vbr", "-cq", "22", "-b:v", "0"]),
                       ("h264_qsv", ["-global_quality", "22", "-preset", "medium"]),
                       ("h264_amf", ["-quality", "quality", "-rc", "cqp", "-qp_i", "22", "-qp_p", "22"]),
                       ("h264_mf", ["-rate_control", "quality", "-quality", "70"])):
        if ok(["ffmpeg", "-v", "error", "-f", "lavfi", "-i", "nullsrc=s=256x256:d=1",
               "-frames:v", "1", "-c:v", name, "-f", "null", "-"]):
            return name, opts
    return "libx264", ["-preset", "veryfast", "-crf", "20"]


def file_sig(path):
    """mtime+size signature so a re-rendered shot/master invalidates its cached segments."""
    st = os.stat(path)
    return f"{path}:{int(st.st_mtime)}:{st.st_size}"


# ---------------------------------------------------------------- reframe (punch-in)

EASES = ("cut", "push", "pull")


def load_reframes(tl, END):
    """Normalize timeline.reframes — punch-ins on the MASTER (the talking head).

      { "in_s": 12.4, "out_s": 16.8, "scale": 1.18, "ease": "cut",
        "from": 1.0, "ramp_s": 0.7, "anchor": [0.5, 0.42] }

    ease 'cut'  = static crop for the whole span (the hard-cut punch that hides a jump cut);
    ease 'push' = ramp `from` -> `scale` over ramp_s, then hold;
    ease 'pull' = ramp `scale` -> `from`, then hold.
    anchor is the crop window's position in the source, 0..1 (default sits slightly high
    because a centre-framed face lives above the geometric centre).
    """
    out = []
    for r in tl.get("reframes", []):
        a, b = max(0.0, float(r["in_s"])), min(END, float(r["out_s"]))
        if b - a < 1e-3:
            continue  # entirely past the preview window
        ease = r.get("ease", "cut")
        if ease not in EASES:
            raise SystemExit(f"reframe [{a}-{b}]: bad ease {ease!r} (use {'/'.join(EASES)})")
        ax, ay = (list(r.get("anchor") or [0.5, 0.42]) + [0.42])[:2]
        out.append({
            "in": a, "out": b, "ease": ease,
            "z0": min(2.5, max(1.0, float(r.get("from", 1.0)))),
            "z1": min(2.5, max(1.0, float(r.get("scale", 1.15)))),
            "ramp": max(0.05, float(r.get("ramp_s", 0.7))),
            "ax": min(1.0, max(0.0, float(ax))), "ay": min(1.0, max(0.0, float(ay))),
        })
    out.sort(key=lambda r: r["in"])
    for p, q in zip(out, out[1:]):
        if q["in"] < p["out"] - 1e-6:
            raise SystemExit(f"reframes overlap: [{p['in']:.2f}-{p['out']:.2f}] and "
                             f"[{q['in']:.2f}-{q['out']:.2f}]: a frame can only have one punch")
    return out


def _esc(expr):
    """Commas separate filters in a filtergraph, so escape the ones inside an expression."""
    return expr.replace(",", "\\,")


def reframe_chain(rf, seg_start, W, H, FPS, prescale):
    """The master-video filter chain for a segment covered by reframe `rf`.

    'cut' is a static crop+rescale — exact, free, and the one that hides jump cuts.
    'push'/'pull' ramp with smoothstep easing via zoompan. zoompan rounds its crop origin to
    whole INPUT pixels, so the source is pre-scaled until it is >= 2x the output width; that is
    what stops a slow push from stepping (measured jitter cv over the ramp: 0.21 / 0.18 / 0.12
    at 1x / 2x / 4x). A 4K master already clears the bar, so prescale is 1 and costs nothing.
    """
    ax, ay = rf["ax"], rf["ay"]
    if rf["ease"] == "cut":
        z = rf["z1"]
        return (f"crop=iw/{z:.6f}:ih/{z:.6f}:(iw-iw/{z:.6f})*{ax:.4f}:(ih-ih/{z:.6f})*{ay:.4f},"
                f"scale={W}:{H}:flags=lanczos,fps={FPS}")
    z_a, z_b = (rf["z0"], rf["z1"]) if rf["ease"] == "push" else (rf["z1"], rf["z0"])
    t0 = seg_start - rf["in"]          # this segment may start mid-ramp (a shot boundary split it)
    prog = f"st(0,min(max((on/{FPS}+{t0:.4f})/{rf['ramp']:.4f},0),1))"
    z = f"{prog};{z_a:.6f}+({z_b:.6f}-{z_a:.6f})*(ld(0)*ld(0)*(3-2*ld(0)))"   # smoothstep
    pre = f"scale=iw*{prescale}:ih*{prescale}:flags=bicubic," if prescale > 1 else ""
    return (f"fps={FPS},{pre}zoompan=z='{_esc(z)}'"
            f":x='{_esc(f'(iw-iw/zoom)*{ax:.4f}')}':y='{_esc(f'(ih-ih/zoom)*{ay:.4f}')}'"
            f":d=1:s={W}x{H}:fps={FPS}")


def main():
    args = sys.argv[1:]
    keep = "--keep" in args
    no_reframe = "--no-reframe" in args
    fresh = "--fresh" in args
    args = [a for a in args if a not in ("--keep", "--no-reframe", "--fresh")]
    end_override = None
    if "--end" in args:
        i = args.index("--end")
        end_override = float(args[i + 1])
        del args[i:i + 2]
    tl_path = proj(args[0]) if args else proj(os.path.join("video-1", "work", "timeline.json"))

    with open(tl_path, "r", encoding="utf-8") as f:
        tl = json.load(f)

    master = proj(tl["master"])                                     # project data -> CWD
    out_dir = os.path.join(ROOT, tl.get("remotion_out", "remotion/out"))  # engine -> ROOT
    pv = tl["preview"]
    END = end_override if end_override is not None else float(pv["end_s"])
    W, H, FPS = int(pv["width"]), int(pv["height"]), int(pv["fps"])
    out_path = proj(pv["out"])                                      # project data -> CWD
    os.makedirs(os.path.dirname(out_path), exist_ok=True)

    # resolve each shot to its rendered file (cutaway->.mp4, overlay->.mov)
    shots = []
    for s in tl["shots"]:
        a = max(0.0, float(s["master_in_s"]))
        b = min(END, float(s["master_out_s"]))
        if b <= a:
            continue  # entirely past the preview window
        ext = ".mov" if s["type"] == "overlay" else ".mp4"
        f = os.path.join(out_dir, s["id"] + ext)
        if not os.path.exists(f):
            raise SystemExit(f"missing rendered shot: {f} (render it first: npm run render / render-all {s['id']})")
        shots.append({"id": s["id"], "type": s["type"], "in": a, "out": b, "file": f})

    cutaways = [s for s in shots if s["type"] == "cutaway"]
    overlays = [s for s in shots if s["type"] == "overlay"]

    reframes = [] if no_reframe else load_reframes(tl, END)
    try:
        src_w, _src_h = probe_dims(master)
    except (IndexError, ValueError):
        src_w = W  # audio-only master (generated video) — no prescale needed
    # zoompan needs >= 2x the output width in its input to ramp without stepping (see reframe_chain)
    prescale = min(4, max(1, -(-2 * W // max(1, src_w))))
    # a punch under a cutaway does nothing (the shot replaces the master) — say so rather than lie
    for rf in reframes:
        hit = [c["id"] for c in cutaways if c["in"] < rf["out"] - 1e-6 and rf["in"] < c["out"] - 1e-6]
        if hit:
            print(f"  WARNING reframe [{rf['in']:.2f}-{rf['out']:.2f}] overlaps cutaway(s) "
                  f"{', '.join(hit)}: no punch there, the shot replaces the master")

    # atomic segment boundaries
    bounds = {0.0, END}
    for s in shots:
        bounds.add(s["in"])
        bounds.add(s["out"])
    for rf in reframes:
        bounds.add(rf["in"])
        bounds.add(rf["out"])
    bounds = sorted(b for b in bounds if 0.0 <= b <= END)

    scratch = os.path.join(os.path.dirname(out_path), "_bake_tmp")
    if fresh and os.path.exists(scratch):
        shutil.rmtree(scratch)
    os.makedirs(scratch, exist_ok=True)

    enc, enc_opts = best_h264()
    rf_note = f"  reframes={len(reframes)} (prescale x{prescale})" if reframes else \
        ("  reframes=OFF" if no_reframe else "")
    print(f"master={os.path.relpath(master, ROOT)}  end={END}s  {W}x{H}@{FPS}{rf_note}")
    print(f"encoder: {enc}")

    # Plan every segment first (kind, filter chain, content-hash) so unchanged segments
    # can be reused from the cache and the rest rendered in parallel.
    plan = []
    for i in range(len(bounds) - 1):
        a, b = bounds[i], bounds[i + 1]
        if b - a < 1e-4:
            continue
        # exact frame count from rounded cumulative boundaries (no drift)
        n = round(b * FPS) - round(a * FPS)
        if n <= 0:
            continue

        cut = next((c for c in cutaways if c["in"] <= a + 1e-6 and a < c["out"] - 1e-6), None)
        ov = next((o for o in overlays if o["in"] <= a + 1e-6 and b <= o["out"] + 1e-6), None)
        rf = next((r for r in reframes if r["in"] <= a + 1e-6 and a < r["out"] - 1e-6), None)

        # how the MASTER video is transformed in this segment: punched in, or plain fit.
        # A rendered SHOT is always plain-fit — it is composed at frame size already.
        fit = f"scale={W}:{H}:force_original_aspect_ratio=disable,fps={FPS}"
        if rf:
            master_chain = reframe_chain(rf, a, W, H, FPS, prescale)
            _za, _zb = (rf["z0"], rf["z1"]) if rf["ease"] == "push" else (rf["z1"], rf["z0"])
            punch = (f"  punch:cut {rf['z1']:.2f}x" if rf["ease"] == "cut"
                     else f"  punch:{rf['ease']} {_za:.2f}->{_zb:.2f}")
        else:
            master_chain, punch = fit, ""
        common_vf = f"{master_chain},tpad=stop_mode=clone:stop_duration=1,format=yuv420p"
        shot_vf = f"{fit},tpad=stop_mode=clone:stop_duration=1,format=yuv420p"

        if cut and ov:
            # an alpha overlay (e.g. captions) composited OVER a cutaway, not just over the master.
            # Without this branch the cutaway wins and the overlay silently never appears on a
            # fully-cutaway video (which every generated video is).
            offc = a - cut["in"]
            offo = a - ov["in"]
            kind = f"cutaway:{cut['id']}+overlay:{ov['id']} @+{offc:.2f}s"
            fc = (f"[0:v]scale={W}:{H}:force_original_aspect_ratio=disable,fps={FPS},format=yuv420p[bg];"
                  f"[1:v]scale={W}:{H},fps={FPS}[ov];"
                  f"[bg][ov]overlay=0:0:format=auto,"
                  f"tpad=stop_mode=clone:stop_duration=1,format=yuv420p[v]")
            cmd = ["ffmpeg", "-y", "-ss", f"{offc:.4f}", "-i", cut["file"],
                   "-ss", f"{offo:.4f}", "-i", ov["file"],
                   "-filter_complex", fc, "-map", "[v]", "-frames:v", str(n), "-an"]
            inputs = [cut["file"], ov["file"]]
        elif cut:
            off = a - cut["in"]
            kind = f"cutaway:{cut['id']} @+{off:.2f}s"
            cmd = ["ffmpeg", "-y", "-ss", f"{off:.4f}", "-i", cut["file"],
                   "-vf", shot_vf, "-frames:v", str(n), "-an"]
            inputs = [cut["file"]]
        elif ov:
            off = a - ov["in"]
            kind = f"master+overlay:{ov['id']} @+{off:.2f}s"
            # the punch applies to the MASTER only — the overlay (captions/CTA) rides on top unzoomed
            fc = (f"[0:v]{master_chain},format=yuv420p[bg];"
                  f"[1:v]scale={W}:{H},fps={FPS}[ov];"
                  f"[bg][ov]overlay=0:0:format=auto,"
                  f"tpad=stop_mode=clone:stop_duration=1,format=yuv420p[v]")
            cmd = ["ffmpeg", "-y", "-ss", f"{a:.4f}", "-i", master,
                   "-ss", f"{off:.4f}", "-i", ov["file"],
                   "-filter_complex", fc, "-map", "[v]", "-frames:v", str(n), "-an"]
            inputs = [master, ov["file"]]
        else:
            kind = "master"
            cmd = ["ffmpeg", "-y", "-ss", f"{a:.4f}", "-i", master,
                   "-vf", common_vf, "-frames:v", str(n), "-an"]
            inputs = [master]

        # content-hash: cmd + encoder + input file signatures -> stale segments re-render,
        # unchanged ones are reused (a one-beat edit costs one segment, not a re-bake).
        key = hashlib.sha1(("|".join(cmd) + "|" + enc + "|" + "|".join(enc_opts) + "|" +
                            "|".join(file_sig(p) for p in inputs)).encode()).hexdigest()[:16]
        seg = os.path.join(scratch, f"seg_{i:03d}_{key}.mp4")
        cmd += ["-c:v", enc] + enc_opts + ["-pix_fmt", "yuv420p", seg]
        plan.append({"a": a, "b": b, "n": n, "kind": kind, "punch": punch,
                     "cmd": cmd, "seg": seg})

    # prune cache entries no current plan wants (renamed/removed beats), keep the rest
    wanted = {os.path.basename(p["seg"]) for p in plan}
    for f_ in os.listdir(scratch):
        if f_.startswith("seg_") and f_ not in wanted:
            os.remove(os.path.join(scratch, f_))

    print("segments:")
    todo = []
    for p in plan:
        p["cached"] = os.path.exists(p["seg"])
        if not p["cached"]:
            todo.append(p)
        print(f"  [{p['a']:6.2f}-{p['b']:6.2f}] {p['n']:4d}f  {p['kind']}{p['punch']}"
              + ("  (cached)" if p["cached"] else ""))

    if todo:
        workers = max(2, (os.cpu_count() or 4) // 2)
        done = 0
        with ThreadPoolExecutor(max_workers=workers) as ex:
            futs = {ex.submit(run, p["cmd"]): p for p in todo}
            for fut in as_completed(futs):
                fut.result()  # re-raises SystemExit from a failed segment in THIS thread
                done += 1
                p = futs[fut]
                print(f"    rendered {done}/{len(todo)}  [{p['a']:6.2f}-{p['b']:6.2f}] {p['kind']}")
    seg_files = [p["seg"] for p in plan]

    # concat (STREAM COPY — segments are identically encoded by construction, so a second
    # encode generation would only cost time and SSIM) + mux master audio 0..END
    listf = os.path.join(scratch, "segs.txt")
    with open(listf, "w", encoding="utf-8") as f:
        for s in seg_files:
            f.write(f"file '{s.replace(os.sep, '/')}'\n")

    print("concat (copy) + master audio -> " + os.path.relpath(out_path, ROOT))
    run(["ffmpeg", "-y",
         "-f", "concat", "-safe", "0", "-i", listf,
         "-i", master,
         "-map", "0:v:0", "-map", "1:a:0",
         "-c:v", "copy",
         "-c:a", "aac", "-b:a", "192k",
         "-t", f"{END:.4f}", "-movflags", "+faststart", out_path])

    dur = run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
               "-of", "default=nw=1:nk=1", out_path]).strip()
    print(f"done -> {os.path.relpath(out_path, ROOT)}  ({dur}s)")


if __name__ == "__main__":
    main()
