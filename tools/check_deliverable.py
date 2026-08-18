#!/usr/bin/env python3
"""
check_deliverable.py — the HARD GATE before a video is called finished.

Why this exists: on video-1 the cut was delivered on its own and the captions, punch-ins and
SFX were left as a follow-up question. That is not a finished video, and "did you want captions?"
is not a question worth asking — a talking-head Short without captions is unfinished, because
most of the audience watches muted. The pipeline had no definition of done, so a half-edit looked
like a delivery. This file IS the definition of done.

It checks the artefacts AND the delivered file:

  cut         edited-transcript.json exists; verify-report has no missing/mangled words
  captions    caption-plan.json + the overlay wired into timeline.json + the rendered .mov
  motion      timeline.json has reframes (punch-ins), at a sane density
  sound       sfx-plan.json with events; music bed applied
  master      integrated loudness on target, true peak under ceiling
  container   A/V durations agree, even dimensions, sane fps

Usage:
  python tools/check_deliverable.py videos/video-1 --file videos/video-1/output/video-1-SHORT.mp4
  python tools/check_deliverable.py videos/video-1 --file <out> --long-form   # relaxes Shorts rules

Exit 0 = shippable. Exit 1 = something is missing; the report says what and where.
"""
import argparse
import json
import os
import re
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def _music_bed_ids():
    """Bed ids from the music library, so a "<base>-<bed>.mp4" output is recognised as a bed."""
    try:
        cat = os.path.join(ROOT, "media", "library", "music", "catalog.json")
        with open(cat, encoding="utf-8") as f:
            data = json.load(f)
        clips = data.get("clips", data) if isinstance(data, dict) else data
        return [c["id"] for c in clips if isinstance(c, dict) and c.get("id")]
    except Exception:
        return []

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")


class Report:
    def __init__(self):
        self.rows = []

    def add(self, ok, area, msg, fatal=True):
        self.rows.append((ok, area, msg, fatal))

    def show(self):
        pad = max(len(r[1]) for r in self.rows) if self.rows else 8
        for ok, area, msg, fatal in self.rows:
            tag = "PASS" if ok else ("FAIL" if fatal else "warn")
            print(f"  [{tag}] {area.ljust(pad)}  {msg}")
        return [r for r in self.rows if not r[0] and r[3]]


def sh(cmd):
    return subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8",
                          errors="replace")


def probe(path, stream, entries):
    r = sh(["ffprobe", "-v", "error", "-select_streams", stream,
            "-show_entries", f"stream={entries}", "-of", "json", path])
    try:
        return json.loads(r.stdout)["streams"][0]
    except Exception:
        return {}


def measure_loudness(path):
    r = sh(["ffmpeg", "-hide_banner", "-nostats", "-i", path,
            "-af", "loudnorm=I=-14:TP=-1:LRA=11:print_format=json", "-f", "null", "-"])
    blocks = re.findall(r"\{[^{}]*\}", r.stderr or "", re.S)
    return json.loads(blocks[-1]) if blocks else {}


def jload(p):
    try:
        return json.load(open(p, encoding="utf-8"))
    except Exception:
        return None


def main():
    ap = argparse.ArgumentParser(description="hard gate: is this video actually finished?")
    ap.add_argument("project")
    ap.add_argument("--file", required=True, help="the delivered video")
    ap.add_argument("--long-form", action="store_true", help="relax the Shorts-specific rules")
    ap.add_argument("--target", type=float, default=-14.0)
    ap.add_argument("--tp", type=float, default=-1.0)
    ap.add_argument("--aspect", choices=["9:16", "16:9", "1:1"], default=None,
                    help="override the spec's aspect (adaptation deliverables)")
    ap.add_argument("--target-min", type=float, default=None,
                    help="override the spec's runtime target in minutes (e.g. the 15s cutdown)")
    a = ap.parse_args()

    proj = a.project if os.path.isabs(a.project) else os.path.abspath(a.project)
    work = os.path.join(proj, "work")
    out = a.file if os.path.isabs(a.file) else os.path.abspath(a.file)
    rep = Report()

    # THE SPEC DECIDES WHAT TO CHECK. Without it this gate assumed one shape (short-form talking
    # head) and failed a correct long-form video four times for lacking punch-ins and a caption
    # overlay it was never meant to have. Any format is supported by writing a spec.
    spec = jload(os.path.join(work, "spec.json")) or {}
    fmt = spec.get("format", "shortform-talking-head")
    src = spec.get("source", "footage")
    want_cap = spec.get("captions", {}).get("enabled", True)
    cap_style = spec.get("captions", {}).get("style", "overlay")
    want_sfx = spec.get("sfx", {}).get("enabled", True)
    want_music = spec.get("music", {}).get("enabled", False)
    motion = spec.get("motion", {}).get("kind", "punch-ins")
    target_min = a.target_min if a.target_min is not None else spec.get("runtime", {}).get("target_min")
    tol = spec.get("runtime", {}).get("tolerance", 0.08)
    if spec.get("master"):
        a.target = spec["master"].get("lufs", a.target)
        a.tp = spec["master"].get("true_peak", a.tp)
    if not spec:
        print("  NOTE no work/spec.json — assuming short-form talking head. "
              "Create one: tools/video_spec.py new <project> --format ...")

    print(f"deliverable check: {os.path.relpath(out, ROOT)}   [{fmt}]")
    print("-" * 78)

    if not os.path.exists(out):
        print(f"  [FAIL] file       missing: {out}")
        sys.exit(1)

    # ---- timing spine (every format needs it: captions, beats and SFX all sync to it)
    et = jload(os.path.join(work, "edited-transcript.json"))
    rep.add(bool(et and et.get("words")), "timing",
            "edited-transcript.json present (the timing spine)" if et else
            "NO edited-transcript.json - nothing downstream can sync")

    # ---- cut verification: only meaningful when real FOOTAGE was cut. A generated video has
    # no takes to mis-join, so demanding a verify-report there is a category error.
    if src == "footage":
        vr = os.path.join(work, "analysis", "verify-report.md")
        if os.path.exists(vr):
            txt = open(vr, encoding="utf-8").read()
            miss = re.search(r"missing:\s*(\d+)", txt)
            diff = re.search(r"heard differently:\s*(\d+)", txt)
            nm, nd = int(miss.group(1)) if miss else 0, int(diff.group(1)) if diff else 0
            rep.add(nm == 0, "cut", f"verify-report: {nm} missing words")
            rep.add(nd == 0, "cut", f"verify-report: {nd} mangled joins", fatal=False)
        else:
            rep.add(False, "cut", "no verify-report.md - the cut was never machine-checked")

    # ---- runtime against the spec: the reason a '5 minute' video shipped at 3:10
    if target_min:
        dur_s = float(probe(out, "v:0", "duration").get("duration") or 0)
        off = (dur_s / 60 - target_min) / target_min if target_min else 0
        rep.add(abs(off) <= tol, "runtime",
                f"{dur_s/60:.1f} min vs {target_min} min target ({off*100:+.0f}%, "
                f"tolerance +/-{tol*100:.0f}%)")

    # ---- captions (when the spec asks for them; muted autoplay is the default viewing mode)
    tl = jload(os.path.join(work, "timeline.json")) or {}
    cap_plan = jload(os.path.join(work, "caption-plan.json"))
    dur = float(probe(out, "v:0", "duration").get("duration") or 0)
    # A full-length ProRes 4444 alpha caption track does not scale with length and is the single
    # most expensive way to put text on screen. Measured 2026-08-05 on ai-agents-explained (855s):
    # the overlay render took ~50 MINUTES and 186 MB, then bake had to composite it over every
    # segment; `gen_captions_ass.py` produced the SAME 748 phrases / 414 stressed words in 1s as a
    # 305 KB text file that ffmpeg burns in one 140s pass. That is ~21x faster for identical output.
    # This gate exists because the failure is silent — the overlay path "works", it just costs an
    # hour — and the fix was previously applied backwards (the spec was flipped to match the slow
    # render instead of the render being switched to the cheap path).
    if want_cap and cap_style == "overlay" and dur > 200:
        rep.add(False, "captions",
                f"spec asks for an OVERLAY caption track on a {dur/60:.1f} min video - that is the "
                "short-form path (<= ~3 min). A full-length ProRes 4444 alpha render costs ~20x "
                "what the burned path does for identical output: set captions.style='burned' and "
                "run tools/gen_captions_ass.py")

    if want_cap and cap_style == "overlay":
        overlays = [s for s in tl.get("shots", []) if s.get("type") == "overlay"]
        cap_shot = next((s for s in overlays if "caption" in s["id"].lower()), None)
        rep.add(bool(cap_shot), "captions",
                f"overlay '{cap_shot['id']}' wired into timeline.json" if cap_shot else
                "caption overlay NOT in timeline.json - it will not appear")
        if cap_shot:
            mov = os.path.join(ROOT, tl.get("remotion_out", "remotion/out"),
                               cap_shot["id"] + ".mov")
            rep.add(os.path.exists(mov), "captions",
                    "overlay rendered" if os.path.exists(mov) else f"overlay not rendered: {mov}")
            span = float(cap_shot["master_out_s"]) - float(cap_shot["master_in_s"])
            rep.add(bool(dur) and span >= dur * 0.9, "captions", f"covers {span:.1f}s of {dur:.1f}s")
    elif want_cap and cap_style == "burned":
        ass = os.path.join(work, "captions.ass")
        rep.add(os.path.exists(ass), "captions",
                f"captions.ass present ({os.path.getsize(ass)//1024} KB)" if os.path.exists(ass)
                else "NO captions.ass - run tools/gen_captions_ass.py")
        if os.path.exists(ass):
            txt = open(ass, encoding="utf-8", errors="replace").read()
            last = re.findall(
                r"Dialogue:\s*\d+,(\d):(\d\d):(\d\d)\.(\d\d),(\d):(\d\d):(\d\d)\.(\d\d)", txt)
            if last:
                # use the last event's END time: a final caption held through an
                # end-card (correct editing) starts early but still covers the tail.
                h, m, s, cs = (int(x) for x in last[-1][4:])
                cover = h * 3600 + m * 60 + s + cs / 100
                rep.add(bool(dur) and cover >= dur * 0.85, "captions",
                        f"events run to {cover:.0f}s of {dur:.0f}s")
    if want_cap:
        rep.add(bool(cap_plan), "captions", "caption-plan.json present" if cap_plan else
                "no caption-plan.json - emphasis will be flat", fatal=False)
    if want_cap and cap_plan:
        em = sum(w.get("m", 0) for ph in cap_plan.get("phrases", []) for w in ph["w"])
        tot = sum(len(ph["w"]) for ph in cap_plan.get("phrases", [])) or 1
        pct = em / tot * 100
        rep.add(3 <= pct <= 25, "captions",
                f"{em}/{tot} words stressed ({pct:.1f}%) - want 3-25%", fatal=False)

    # ---- motion: whichever kind the spec calls for. A stills video has no reframes and a
    # talking head has no beat map; demanding the wrong one is what broke this gate before.
    if motion == "punch-ins":
        rf = tl.get("reframes", [])
        per_min = len(rf) / (dur / 60) if dur else 0
        rep.add(bool(rf), "motion",
                f"{len(rf)} punch-ins ({per_min:.1f}/min)" if rf else
                "NO punch-ins - a talking head with zero reframing reads as unedited")
        if rf:
            rep.add(per_min <= 6.5, "motion", f"punch density {per_min:.1f}/min (<=6.5)",
                    fatal=False)
    elif motion == "ken-burns":
        beats = (jload(os.path.join(work, "beats.json")) or {}).get("beats", [])
        per_min = len(beats) / (dur / 60) if dur else 0
        rep.add(bool(beats), "motion",
                f"{len(beats)} image beats ({per_min:.1f}/min)" if beats else
                "NO beats.json - nothing driving the visuals")
        if beats:
            missing = [b for b in beats if str(b.get("image", "")).startswith("work/images/PENDING")]
            rep.add(not missing, "motion",
                    "every beat has a real image" if not missing else
                    f"{len(missing)} beats still on PENDING placeholders")
            gap = max((beats[i + 1]["start_s"] - beats[i]["end_s"]
                       for i in range(len(beats) - 1)), default=0)
            rep.add(gap < 0.5, "motion", f"largest gap between beats {gap:.2f}s", fatal=False)

            # Visual Diversity & Anti-Fatigue Gate (prevents blank spaces, static spans, and repetition)
            max_consec = 1
            cur_consec = 1
            generic_bg_count = 0
            for i in range(len(beats)):
                img_path = str(beats[i].get("image", ""))
                if "rm-bg-" in img_path or "gradient" in img_path:
                    generic_bg_count += 1
                if i > 0:
                    if img_path == str(beats[i-1].get("image", "")):
                        cur_consec += 1
                        max_consec = max(max_consec, cur_consec)
                    else:
                        cur_consec = 1

            unique_imgs = set(b.get("image", "") for b in beats)
            unique_ratio = len(unique_imgs) / len(beats) if beats else 0

            rep.add(max_consec <= 2, "motion",
                    f"max consecutive same image is {max_consec} beats (<=2 beats allowed, no static spans >6s)",
                    fatal=True)
            rep.add(len(unique_imgs) >= min(6, len(beats)), "motion",
                    f"{len(unique_imgs)} unique visual assets across {len(beats)} beats - visual diversity maintained",
                    fatal=True)
            rep.add(generic_bg_count <= len(beats) * 0.15, "motion",
                    f"generic background images used on {generic_bg_count}/{len(beats)} beats (<=15% allowed)",
                    fatal=False)
    elif motion == "shots":
        # /prompt-to-video + /make-tsx shape: custom Remotion cutaway shots, no talking head,
        # no stills/beats.json. timeline.json's own shots array IS the beat map; lint_pacing.py
        # already checks per-shot reveal/motion density, so this just confirms shots exist and
        # actually cover the runtime (no silent gap where nothing was ever built).
        shots = [s for s in tl.get("shots", []) if s.get("type") == "cutaway"]
        per_min = len(shots) / (dur / 60) if dur else 0
        rep.add(bool(shots), "motion",
                f"{len(shots)} cutaway shots ({per_min:.1f}/min)" if shots else
                "NO cutaway shots in timeline.json - nothing driving the visuals")
        if shots:
            spans = sorted((s["master_in_s"], s["master_out_s"]) for s in shots)
            covered = sum(b - a for a, b in spans)
            rep.add(dur - covered < 1.0, "motion",
                    f"shots cover {covered:.1f}s of {dur:.1f}s")

    # ---- evidence (Growth Rule #3): real captured screenshots on screen, not only code-rendered
    # cards. Cards are emphasis, not proof. FATAL for generated videos (they live on sourced
    # numbers — gpt56-price-cut shipped with the captures made and never shown); a warning for
    # footage videos. Opt out per spec: "evidence": {"required": false}.
    ev_spec = spec.get("evidence", {})
    ev_min = int(ev_spec.get("min_on_screen", 2))
    ev_required = bool(ev_spec.get("required", src == "generated"))
    ev_note = ev_spec.get("note", "")
    if ev_required:
        slug = os.path.basename(os.path.normpath(proj))
        man_path = os.path.join(ROOT, "media", "projects", slug, "evidence", "manifest.json")
        man = jload(man_path) or []
        cap_files = {c.get("file") for c in man if isinstance(c, dict)}

        # check if captures are blank (Cloudflare / bot-blocked)
        blank_captures = []
        real_captures = []
        if man:
            try:
                from PIL import Image as _Img
                for entry in man:
                    fp = os.path.join(ROOT, "media", "projects", slug, "evidence", entry.get("file", ""))
                    if not os.path.exists(fp):
                        blank_captures.append(entry.get("name", "?"))
                        continue
                    im = _Img.open(fp).convert("L")
                    raw = im.tobytes()
                    n = len(raw)
                    mean_b = sum(raw) / n if n else 255
                    dark_r = sum(1 for v in raw if v < 200) / n if n else 0
                    if mean_b > 250 and dark_r < 0.01:
                        blank_captures.append(entry.get("name", "?"))
                    else:
                        real_captures.append(entry.get("name", "?"))
            except Exception:
                pass  # if PIL not available, skip blank check

        def _evidence_images_in_shot(shot_id):
            # How many real screenshots this shot actually renders. Growth Rule #3 is about
            # screenshots ON SCREEN, so a single shot that crossfades three captures (letter,
            # bill, meeting) counts three, not one. A shot counts either by ID convention
            # ("Evidence*") or by actually rendering EvidenceFrame/EvidenceBrowser in its TSX
            # source - the ID-only check missed shots that use the component under a different
            # naming scheme (e.g. Q38Scoreboard1 using EvidenceFrame internally), the same class
            # of filename-heuristic false negative as the "no music bed found" bug documented
            # in EVOLUTION.md.
            if "evidence" in str(shot_id).lower():
                safe_id = re.sub(r"[^A-Za-z0-9]", "", str(shot_id))
                tsx_path = os.path.join(ROOT, "remotion", "src", "shots", slug, f"{safe_id}.tsx")
                if os.path.exists(tsx_path):
                    src_text = open(tsx_path, encoding="utf-8").read()
                    n = len(re.findall(r"<\s*Evidence(Frame|Browser)\b", src_text))
                    if n:
                        return n
            safe_id = re.sub(r"[^A-Za-z0-9]", "", str(shot_id))
            tsx_path = os.path.join(ROOT, "remotion", "src", "shots", slug, f"{safe_id}.tsx")
            if not os.path.exists(tsx_path):
                return 0
            try:
                src_text = open(tsx_path, encoding="utf-8").read()
            except OSError:
                return 0
            return len(re.findall(r"<\s*Evidence(Frame|Browser)\b", src_text))

        beats = (jload(os.path.join(work, "beats.json")) or {}).get("beats", [])
        ev_beats = [b for b in beats
                    if "evidence" in str(b.get("image", "")).replace("\\", "/").lower()
                    or os.path.basename(str(b.get("image", ""))) in cap_files]
        on_screen = sum(_evidence_images_in_shot(s.get("id", "")) for s in tl.get("shots", [])) + len(ev_beats)

        if on_screen >= ev_min:
            rep.add(True, "evidence", f"{on_screen} real screenshots on screen (>= {ev_min})")
        elif man and blank_captures and not real_captures:
            # captures were attempted but ALL returned blank (Cloudflare / bot-block)
            # shots using EvidenceFrame count if they have the component wired in
            rep.add(on_screen >= ev_min, "evidence",
                    f"{on_screen} evidence shots on screen, {len(blank_captures)} captures "
                    f"blank (Cloudflare/bot-block). Growth Rule #3 wants >= {ev_min}. "
                    "Captures were attempted — wire blank captures into EvidenceFrame with "
                    "on-screen disclosure ('capture blocked — source verified directly'). "
                    "Never substitute stat cards for real captures.",
                    fatal=(src == "generated"))
        else:
            rep.add(on_screen >= ev_min, "evidence",
                    f"{on_screen} real screenshots on screen - Growth Rule #3 wants >= {ev_min}. "
                    "Cards are emphasis, not proof: capture with tools/capture_evidence.py and wire "
                    "into timeline.json (Evidence* shots) or beats.json",
                    fatal=(src == "generated"))
        am = jload(os.path.join(work, "asset-manifest.json")) or {}
        declared = [x for x in am.get("assets", [])
                    if isinstance(x, dict) and x.get("kind") == "screenshot"]
        if declared:
            missing = [x for x in declared if x.get("status") != "captured"
                       and not os.path.exists(os.path.join(ROOT, str(x.get("path", ""))))]
            stale = [x for x in declared if x.get("status") != "captured"
                     and os.path.exists(os.path.join(ROOT, str(x.get("path", ""))))]
            rep.add(not missing, "evidence",
                    "all declared screenshots captured" if not missing else
                    f"{len(missing)} declared screenshot(s) never captured: "
                    + ", ".join(str(x.get("id", "?")) for x in missing), fatal=False)
            rep.add(not stale, "evidence",
                    "asset-manifest statuses current" if not stale else
                    f"{len(stale)} capture(s) exist on disk but asset-manifest still says "
                    "'pending' - update the manifest so the gate can trust it", fatal=False)

    # ---- sound
    if want_sfx:
        sfx = jload(os.path.join(work, "sfx-plan.json"))
        n_sfx = len(sfx.get("events", [])) if sfx else 0
        rep.add(n_sfx > 0, "sound", f"{n_sfx} SFX cues" if n_sfx else
                "NO SFX plan - run /suggest-sfx (spec asks for SFX)")
    if want_music:
        odir = os.path.join(proj, "output")
        # mix_music.py's own docs name the output <base>-<bed>.mp4, and the shipped convention in
        # this repo is "-scored.mp4" (money-archive-401k-fee, gpt56-price-cut) - neither contains
        # the literal "music", so matching only that reported a false "no music bed" on a video
        # whose bed was measured at +18.6 dB in the speech gaps. Accept the real naming too.
        beds = _music_bed_ids()
        odir_files = os.listdir(odir) if os.path.isdir(odir) else []
        music = any(("music" in f or "scored" in f or any(b in f for b in beds)) for f in odir_files)
        rep.add(music, "sound", "music bed applied" if music else
                "no music bed found (spec asks for one) - tools/mix_music.py", fatal=False)

    # ---- master
    m = measure_loudness(out)
    try:
        i, tp = float(m["input_i"]), float(m["input_tp"])
        rep.add(abs(i - a.target) <= 1.0, "master",
                f"integrated {i:.2f} LUFS (target {a.target})")
        rep.add(tp <= a.tp + 0.1, "master", f"true peak {tp:.2f} dBTP (ceiling {a.tp})")
    except (KeyError, TypeError, ValueError):
        rep.add(False, "master", "could not measure loudness")

    # ---- container
    v = probe(out, "v:0", "width,height,duration,r_frame_rate")
    au = probe(out, "a:0", "duration")
    try:
        dv, da = float(v.get("duration")), float(au.get("duration"))
        rep.add(abs(dv - da) <= 0.05, "container",
                f"A/V durations agree (v={dv:.3f} a={da:.3f})")
    except (TypeError, ValueError):
        rep.add(False, "container", "missing a video or audio stream")
    w, h = int(v.get("width", 0)), int(v.get("height", 0))
    rep.add(w % 2 == 0 and h % 2 == 0 and w > 0, "container", f"{w}x{h}")
    want_vertical = (a.aspect == "9:16") or (a.aspect is None and (spec.get("video", {}).get("aspect") == "9:16" or
        (not spec and not a.long_form)))
    if a.aspect == "16:9":
        rep.add((w, h) == (1920, 1080), "container", f"{w}x{h} matches 16:9 adaptation 1920x1080")
    elif a.aspect == "1:1":
        rep.add((w, h) == (1080, 1080), "container", f"{w}x{h} matches 1:1 adaptation 1080x1080")
    elif want_vertical:
        rep.add(h > w, "container", f"vertical as specified ({w}x{h})")
        rep.add(dur <= 180, "container", f"{dur:.1f}s (Shorts limit 180s)", fatal=False)
    elif spec:
        sw, sh = spec.get("video", {}).get("width"), spec.get("video", {}).get("height")
        if sw and sh:
            rep.add((w, h) == (sw, sh), "container", f"{w}x{h} matches spec {sw}x{sh}")

    # ---- packaging (1M-View CTR & 90+ Probability Gate) — MANDATORY per AGENTS.md §2: a
    # candidate must score >= 90/100 or the video does not ship. Warning-only here would let a
    # 45/100 package reach Studio, which is exactly the slop the gate exists to stop.
    cand_file = os.path.join(proj, "packaging", "candidates.json")
    if os.path.exists(cand_file):
        try:
            candidates = json.load(open(cand_file, encoding="utf-8"))
            scores = [c.get("evaluation", {}).get("total_score", 0) for c in candidates
                      if isinstance(c, dict)]
            top_score = max(scores) if scores else 0
            rep.add(top_score >= 90, "packaging",
                    f"top viral packaging concept scored {top_score}/100 (>=90 required for 1M-view target)",
                    fatal=True)
        except Exception:
            pass

    fails = rep.show()
    print("-" * 78)
    if fails:
        print(f"  NOT SHIPPABLE - {len(fails)} blocking issue(s). Fix these, do not deliver "
              f"and ask.")
        sys.exit(1)
    print("  SHIPPABLE - cut, captions, motion, sound and master all present and verified.")

    # Receipt so tools/yt_upload.py can refuse to ship a file this gate never actually saw pass —
    # 6 of 12 videos in the 2026-08-06 batch reached "ready to publish" without this gate having
    # been run at all (2 had audio running ~45% longer than picture, silently). The check existed;
    # nothing enforced that it ran. Hash the file, not just the path, so a re-render after a PASS
    # invalidates the receipt instead of grandfathering in a changed file.
    import hashlib
    import time
    h = hashlib.sha1()
    with open(out, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    receipt = {"file": os.path.relpath(out, ROOT), "sha1": h.hexdigest(),
               "checked_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())}
    with open(os.path.join(work, "deliverable-check.json"), "w", encoding="utf-8") as f:
        json.dump(receipt, f, indent=2)

    if os.path.exists(os.path.join(work, "claims-register.md")):
        print("-" * 78)
        print("  MANUAL STEP STILL REQUIRED (this gate cannot check it): this project has a "
              "claims register. Pull frames and eyeball every screenshot/background against "
              f"{os.path.relpath(os.path.join(work, 'claims-register.md'), ROOT)} — this check "
              "verifies delivery mechanics (loudness, captions, motion, screenshot COUNT), not "
              "whether text baked into a screenshot's pixels is an approved claim. Caught on "
              "qt-funded-ad v1: technical PASS shipped four unapproved claims as background "
              "texture. See videos/qt-funded-ad/work/v1-audit-report.md.")


if __name__ == "__main__":
    main()
