#!/usr/bin/env python3
"""
track_performance.py — tag every video's format choices, then correlate them against real stats.

The gap this fills: videos get made, but nobody records WHY a video was shaped the way it was
(what hook it opened with, whether it used real screenshots or code cards, which title/thumbnail
lever it pulled) next to HOW IT ACTUALLY PERFORMED once published. Without that log, nothing
compounds — the channel can ship 50 videos and still not know which format is its "golden format".

This tool is two halves joined by one file, `docs/research/format-log.json`:

  `tag`    — record the format choices for a project, self-reported, right after (or any time
             after) the video is made. Cheap, no API calls, no auth required.
  `report` — join every tagged project against its real YouTube stats (via `tools/yt_upload.py`'s
             `videos/<project>/packaging/published.json` as the join key, and `tools/yt_stats.py`'s
             `fetch()` for the numbers) and print which tag VALUES correlate with better performance,
             grouped by dimension, sorted best-first, with thin samples flagged rather than trusted.

WHAT THIS CANNOT DO — read this before trusting a "finding":

  * No CTR. Impression click-through rate is YouTube Studio-only, not exposed by the Analytics API
    — same caveat `tools/yt_stats.py` already documents. This tool inherits it: it can correlate
    tags against views, watch time, average view %, and subs gained, never against CTR.
  * The tags are entirely SELF-REPORTED, not inferred from the actual script or thumbnail. A wrong
    or lazy tag (e.g. calling something "curiosity-gap" when it was really a myth-bust) produces a
    wrong correlation with total confidence. This tool has no way to catch that — tag honestly.
  * Correlation, not causation, and usually on very few videos. A channel needs dozens of videos
    per tag VALUE before "hook X wins" is a real finding rather than noise. `report` flags every
    thin sample as thin; it does not pretend n=2 is a pattern.

Usage:
  python tools/track_performance.py tag re-closing-costs --niche real-estate \
      --hook-type cost-callout --evidence-type screenshots --title-lever number
  python tools/track_performance.py list
  python tools/track_performance.py report --min-sample 3
  python tools/track_performance.py report --niche real-estate
"""
import argparse
import datetime as dt
import json
import sys
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

REPO = Path(__file__).resolve().parent.parent
LOG_PATH = REPO / "docs" / "research" / "format-log.json"
VIDEOS_DIR = REPO / "videos"
SHORTS_DIR = REPO / "shorts"

TAG_FIELDS = ("hook_type", "evidence_type", "title_lever", "thumbnail_lever")
DIMENSIONS = ("hook_type", "evidence_type", "title_lever", "thumbnail_lever", "journey_framing")


def published_path(project: str) -> Path:
    """videos/<p>/packaging/published.json, shorts/<p>/packaging/published.json, or the nested
    videos/<p>/shorts/<id>/packaging/published.json layout (clip_to_shorts.py) — a Short is a
    project too, and it performs like one."""
    for base in (VIDEOS_DIR, SHORTS_DIR):
        p = base / project / "packaging" / "published.json"
        if p.exists():
            return p
    for sub in (VIDEOS_DIR / project / "shorts").glob("*/packaging/published.json"):
        return sub
    return VIDEOS_DIR / project / "packaging" / "published.json"


# ---------------------------------------------------------------- log I/O

def load_log() -> dict:
    if not LOG_PATH.exists():
        return {}
    return json.loads(LOG_PATH.read_text(encoding="utf-8"))


def save_log(log: dict) -> None:
    LOG_PATH.parent.mkdir(parents=True, exist_ok=True)
    LOG_PATH.write_text(json.dumps(log, indent=2, ensure_ascii=False), encoding="utf-8")


def project_niche_from_disk(project: str):
    """Best-effort: read videos/<project>/work/plan.json or work/spec.json for .niche; for a
    Short, read shorts/<project>/clip.json, then the SOURCE video's spec.json (the Short inherits
    its channel's niche).

    Returns (niche_or_None, source_description_or_None). Never guesses — if neither file exists
    or neither has a niche field, the caller is told to pass --niche explicitly.
    """
    for base in (VIDEOS_DIR, SHORTS_DIR):
        for fname in ("plan.json", "spec.json"):
            p = base / project / "work" / fname
            if p.exists():
                try:
                    data = json.loads(p.read_text(encoding="utf-8"))
                except (json.JSONDecodeError, OSError):
                    continue
                niche = data.get("niche")
                if niche:
                    where = base.name + f"/{project}/work/{fname}"
                    return niche, where
    clip_p = SHORTS_DIR / project / "clip.json"
    if clip_p.exists():
        try:
            source = json.loads(clip_p.read_text(encoding="utf-8")).get("source")
        except (json.JSONDecodeError, OSError):
            source = None
        if source:
            niche, _ = project_niche_from_disk(source)
            if niche:
                return niche, f"shorts/{project}/clip.json -> videos/{source}"
    # nested layout: videos/<project>/shorts/<id>/ (clip_to_shorts.py) — no clip.json, but the
    # Short inherits the PARENT project's channel, so fall back to its spec.json
    for nested in (VIDEOS_DIR / project / "shorts").glob("*/packaging/publish.json"):
        try:
            data = json.loads(nested.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, OSError):
            continue
        parent = nested.parents[3].name
        niche, where = project_niche_from_disk(parent)
        if niche:
            return niche, f"{nested.parents[2].as_posix()} -> videos/{parent} (spec.json)"
    return None, None


# ---------------------------------------------------------------- tag

def cmd_tag(a: argparse.Namespace) -> None:
    project_dir = VIDEOS_DIR / a.project
    if not project_dir.is_dir():
        project_dir = SHORTS_DIR / a.project
    if not project_dir.is_dir():
        raise SystemExit(f"✗ no such project: videos/{a.project} or shorts/{a.project} — not "
                          f"creating a tag for a project that doesn't exist")

    log = load_log()
    entry = dict(log.get(a.project, {}))

    niche = a.niche
    if niche:
        entry["niche"] = niche
    elif "niche" not in entry or not entry.get("niche"):
        found, source = project_niche_from_disk(a.project)
        if found:
            print(f"  (niche not passed — read {found!r} from {source})")
            entry["niche"] = found
        else:
            print(f"! niche not passed and no videos/{a.project}/work/{{plan,spec}}.json with a "
                  f"niche field — leaving niche null rather than guessing")
            entry.setdefault("niche", None)

    for flag_name, field in (("hook_type", "hook_type"), ("evidence_type", "evidence_type"),
                              ("title_lever", "title_lever"), ("thumb_lever", "thumbnail_lever")):
        val = getattr(a, flag_name)
        if val is not None:
            entry[field] = val

    if a.journey_framing:
        entry["journey_framing"] = True
    elif "journey_framing" not in entry:
        entry["journey_framing"] = False

    if a.cross_linked_from is not None:
        entry["cross_linked_from"] = a.cross_linked_from
    else:
        entry.setdefault("cross_linked_from", None)

    for field in TAG_FIELDS:
        entry.setdefault(field, None)

    entry["tagged_at"] = dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds")

    log[a.project] = entry
    save_log(log)

    base = "videos" if (VIDEOS_DIR / a.project).exists() else "shorts"
    print(f"✓ saved {base}/{a.project} -> {LOG_PATH.relative_to(REPO)}")
    for k, v in entry.items():
        print(f"    {k:<18} {v if v is not None else '—'}")


# ---------------------------------------------------------------- list

def cmd_list(a: argparse.Namespace) -> None:
    log = load_log()
    if not log:
        print("  (no tagged projects yet — run `track_performance.py tag <project> ...`)")
        return
    for project in sorted(log):
        entry = log[project]
        published = published_path(project).exists()
        niche = entry.get("niche") or "—"
        status = "published.json found" if published else "no published.json yet"
        print(f"  {project:<32} niche={niche:<14} {status}")


# ---------------------------------------------------------------- report

def cmd_report(a: argparse.Namespace) -> None:
    log = load_log()
    if not log:
        print("  (no tagged projects yet — run `track_performance.py tag <project> ...`)")
        return

    projects = {p: e for p, e in log.items() if not a.niche or e.get("niche") == a.niche}
    if not projects:
        print(f"  (no tagged projects for niche {a.niche!r})")
        return

    tagged_no_stats = []
    rows = []
    published_projects = []

    for project, entry in sorted(projects.items()):
        pub_path = published_path(project)
        if not pub_path.exists():
            tagged_no_stats.append(project)
            continue
        try:
            published = json.loads(pub_path.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, OSError) as e:
            print(f"! could not read {pub_path.relative_to(REPO)}: {e} — skipping")
            tagged_no_stats.append(project)
            continue
        video_id = published.get("videoId")
        if not video_id:
            print(f"! {pub_path.relative_to(REPO)} has no videoId — skipping")
            tagged_no_stats.append(project)
            continue
        published_projects.append((project, entry, video_id))

    if published_projects:
        sys.path.insert(0, str(Path(__file__).resolve().parent))
        try:
            from yt_stats import fetch, TOKEN
        except ImportError as e:
            raise SystemExit(f"✗ could not import tools/yt_stats.py ({e}) — its Google API "
                             f"deps (google-api-python-client etc.) may not be installed in "
                             f"this venv")

        # Check the token file BEFORE calling fetch(). fetch()'s get_creds() does not always
        # raise cleanly on a missing token — if .youtube/client_secret.json exists (it does, once
        # yt_upload.py has been set up) but token-analytics.json does not, get_creds() silently
        # launches an interactive browser OAuth flow (run_local_server) and BLOCKS instead of
        # raising, which would hang this report once per video rather than fail once. Checking the
        # token file ourselves avoids ever entering that path.
        if not TOKEN.exists():
            print("✗ No analytics token yet — run `python tools/yt_stats.py auth` once, "
                  "then re-run this report.")
            return

        for project, entry, video_id in published_projects:
            try:
                stats = fetch(video_id)
            except SystemExit:
                raise
            except Exception as e:
                print(f"! stats fetch failed for {project} ({video_id}): "
                      f"{type(e).__name__}: {e} — skipping")
                tagged_no_stats.append(project)
                continue
            rows.append({"project": project, "entry": entry, "stats": stats})

    if not rows:
        print("  no tagged project has a published.json with real stats yet")
        if tagged_no_stats:
            print(f"\n  untagged for stats — never published or ID not recorded yet "
                  f"({len(tagged_no_stats)}):")
            for p in tagged_no_stats:
                print(f"    · {p}")
        return

    metric_keys = [("views", "views"), ("avgViewPct", "avg view %"),
                   ("subsGained", "subs gained"), ("watchTimeH", "watch time (h)")]
    have_metrics = [(k, lbl) for k, lbl in metric_keys
                    if any(r["stats"].get(k) is not None for r in rows)]
    sort_key, sort_label = have_metrics[0] if have_metrics else ("views", "views")

    print(f"\n{'='*74}\n  FORMAT PERFORMANCE REPORT"
          + (f"   (niche: {a.niche})" if a.niche else "") + f"\n  {len(rows)} video(s) with "
          f"real stats, sorted by {sort_label}\n{'='*74}")

    for dim in DIMENSIONS:
        buckets: dict = {}
        for r in rows:
            val = r["entry"].get(dim)
            key = val if val is not None else "(untagged)"
            buckets.setdefault(key, []).append(r)

        print(f"\n  {dim}")
        summaries = []
        for val, group in buckets.items():
            n = len(group)
            avg = {}
            for k, _lbl in metric_keys:
                nums = [g["stats"].get(k) for g in group if g["stats"].get(k) is not None]
                avg[k] = (sum(nums) / len(nums)) if nums else None
            summaries.append((val, n, avg))

        summaries.sort(key=lambda s: (s[2].get(sort_key) is None, -(s[2].get(sort_key) or 0)))
        for val, n, avg in summaries:
            thin = n < a.min_sample
            prefix = f"(thin, n={n})" if thin else f"n={n}"
            parts = []
            for k, lbl in metric_keys:
                v = avg.get(k)
                if v is None:
                    continue
                parts.append(f"{lbl} {v:,.1f}" if k in ("avgViewPct", "watchTimeH")
                             else f"{lbl} {v:,.0f}")
            print(f"    {prefix:<12} {str(val):<20} " + "  ·  ".join(parts))

    print(f"\n  {'-'*70}")
    for dim in DIMENSIONS:
        buckets = {}
        for r in rows:
            val = r["entry"].get(dim)
            if val is None:
                continue
            buckets.setdefault(val, []).append(r)
        best_val, best_n, best_avg = None, 0, None
        eligible = []
        for val, group in buckets.items():
            n = len(group)
            if n < a.min_sample:
                continue
            nums = [g["stats"].get(sort_key) for g in group if g["stats"].get(sort_key) is not None]
            if not nums:
                continue
            eligible.append((val, n, sum(nums) / len(nums)))
        if eligible:
            eligible.sort(key=lambda t: -t[2])
            best_val, best_n, best_score = eligible[0]
            print(f"  BEST {dim}: {best_val!r} (n={best_n}, avg {sort_label} "
                  f"{best_score:,.1f})")
        else:
            print(f"  BEST {dim}: not enough data yet — no value has >= {a.min_sample} "
                  f"tagged+published videos")

    if tagged_no_stats:
        print(f"\n  untagged for stats — never published or ID not recorded yet "
              f"({len(tagged_no_stats)}):")
        for p in tagged_no_stats:
            print(f"    · {p}")

    print("\n  Caveats: no CTR (Studio-only, not in the Analytics API). Tags are self-reported, "
          "not inferred from the script/thumbnail — a wrong tag produces a wrong correlation.")


# ---------------------------------------------------------------- main

def main() -> None:
    ap = argparse.ArgumentParser(
        description="track per-video format choices and correlate them against real YouTube "
                    "stats, to find the 'golden format' worth repeating")
    sub = ap.add_subparsers(dest="cmd")

    t = sub.add_parser("tag", help="record (or update) a project's format choices")
    t.add_argument("project", help="videos/<project> slug")
    t.add_argument("--niche", help="niche id; auto-read from work/plan.json or work/spec.json "
                                   "if omitted")
    t.add_argument("--hook-type", dest="hook_type",
                    help="e.g. myth-bust, curiosity-gap, cost-callout, news-hook (freeform)")
    t.add_argument("--evidence-type", dest="evidence_type",
                    choices=["screenshots", "code-cards", "mixed", "none"])
    t.add_argument("--title-lever", dest="title_lever",
                    help="e.g. magnet-word, number, barrier-drop, news-now, own-term (freeform)")
    t.add_argument("--thumb-lever", dest="thumb_lever",
                    help="same lever menu as /packaging: magnet-word, number, barrier-drop, "
                        "object-curiosity, news-now, own-term (freeform)")
    t.add_argument("--journey-framing", action="store_true",
                    help="video framed as a personal journey/story rather than a direct teach")
    t.add_argument("--cross-linked-from", dest="cross_linked_from",
                    help="slug of another project this one was cross-linked from, if any")
    t.set_defaults(func=cmd_tag)

    lst = sub.add_parser("list", help="list every tagged project + niche + published status "
                                      "(no API calls)")
    lst.set_defaults(func=cmd_list)

    r = sub.add_parser("report", help="join tags against real stats and rank format choices")
    r.add_argument("--niche", help="filter to one niche")
    r.add_argument("--min-sample", type=int, default=3,
                    help="below this many videos a tag value is flagged thin, not trusted "
                        "(default 3)")
    r.set_defaults(func=cmd_report)

    a = ap.parse_args()
    if not a.cmd:
        ap.print_help()
        return
    a.func(a)


if __name__ == "__main__":
    main()
