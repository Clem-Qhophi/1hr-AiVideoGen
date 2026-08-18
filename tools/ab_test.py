#!/usr/bin/env python3
"""
ab_test.py — track YouTube A/B packaging tests so the results actually change the next video.

Why this exists: /packaging already generates 3 bets per video, but nothing ever read the result
back. `docs/IMPROVEMENT-QUEUE.md` R3 has flagged that since the queue opened — three bets get
rendered, one gets picked by hand, and the lesson evaporates. This file makes the test a tracked
artifact: what was tested, which lever each bet pulled, what YouTube said, and what that means for
the packaging rules.

WHAT THIS TOOL DOES NOT DO: it does not start a test on YouTube. The YouTube Data API exposes no
A/B endpoint at all — starting a test is a manual step in desktop Studio (Content -> the video ->
Test & compare). Anything claiming to automate that is either driving the browser or lying. This
tracks what you ran and what happened, which is the part that otherwise gets lost.

Ground truth on what YouTube actually supports (verified 2026-08-02, re-verify periodically):
  - up to 3 variants: titles, thumbnails, or title+thumbnail combinations (titles since Dec 2025)
  - the winner is decided by WATCH TIME, not CTR
  - results come back Winner / Performed Same / Inconclusive (inconclusive -> first option uploaded)
  - desktop Studio only, Advanced Features required; no Shorts/Premieres/kids/age-restricted/private
  - descriptions are NOT testable -- this tool refuses to record one as an A/B result
  Full notes: .claude/skills/packaging/references/ab-testing.md

Usage:
  python tools/ab_test.py new videos/re-closing-costs --dimension thumbnail \
      --title "The $15,000 Nobody Explains Before You Sign" \
      --bet a work/thumbs/a.png --lever "magnet-number" \
      --bet b work/thumbs/b.png --lever "face-reaction" \
      --bet c work/thumbs/c.png --lever "document-closeup"
  python tools/ab_test.py show   videos/re-closing-costs
  python tools/ab_test.py result videos/re-closing-costs --winner b --label winner \
      --impressions 41000 --note "document close-up beat both number-led bets"
  python tools/ab_test.py report --niche real-estate
"""
import argparse
import datetime as dt
import glob
import json
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LABELS = ("winner", "performed-same", "inconclusive")
DIMENSIONS = ("thumbnail", "title", "combo")

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")


def plan_path(project):
    return os.path.join(project, "work", "ab-test.json")


def load(project):
    p = plan_path(project)
    if not os.path.exists(p):
        raise SystemExit(f"no A/B test recorded for this project: {p}\n"
                         f"  create one with: python tools/ab_test.py new {project} ...")
    with open(p, encoding="utf-8") as f:
        return json.load(f)


def save(project, data):
    p = plan_path(project)
    os.makedirs(os.path.dirname(p), exist_ok=True)
    with open(p, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    return p


def cmd_new(a):
    if a.dimension == "combo" and len(a.bet) > 2:
        print("! combo test with 3 variants: you are varying title AND thumbnail at once, so a win\n"
              "  tells you which COMBO won, not which element did the work. Prefer one dimension\n"
              "  until this channel has a proven thumbnail winner. Recording anyway.\n")
    if not 2 <= len(a.bet) <= 3:
        raise SystemExit(f"YouTube tests 2-3 variants; got {len(a.bet)}")
    if a.lever and len(a.lever) != len(a.bet):
        raise SystemExit(f"{len(a.bet)} bets but {len(a.lever)} levers — give one lever per bet")

    bets = []
    for i, (slot, asset) in enumerate(a.bet):
        if a.dimension in ("thumbnail", "combo"):
            ap = asset if os.path.isabs(asset) else os.path.join(a.project, asset)
            if not os.path.exists(ap):
                print(f"! bet {slot}: asset not found ({asset}) — recording the plan anyway")
            elif os.path.getsize(ap) > 2_000_000:
                print(f"! bet {slot}: {os.path.getsize(ap)/1e6:.1f} MB exceeds YouTube's 2 MB "
                      f"thumbnail cap — it will be rejected at upload")
        bets.append({"slot": slot, "asset": asset,
                     "lever": a.lever[i] if a.lever else None,
                     "is_first_uploaded": i == 0})

    data = {
        "_note": "A/B packaging test record. Started MANUALLY in desktop YouTube Studio — the API "
                 "has no A/B endpoint. Winner is decided by WATCH TIME, not CTR.",
        "project": os.path.relpath(os.path.abspath(a.project), ROOT).replace(os.sep, "/"),
        "niche": a.niche,
        "dimension": a.dimension,
        "fixed_title": a.title,
        "created": dt.date.today().isoformat(),
        "bets": bets,
        "result": None,
    }
    p = save(a.project, data)
    print(f"recorded {len(bets)}-variant {a.dimension} test -> {os.path.relpath(p, ROOT)}")
    print(f"  bet '{bets[0]['slot']}' is FIRST — an Inconclusive result defaults to it, so it "
          f"should be your genuine best bet")
    print("\nNext (manual, desktop Studio only):")
    print("  Studio -> Content -> this video -> Test & compare -> add the variants above")
    print("  then come back with: python tools/ab_test.py result %s --winner <slot> --label <label>"
          % a.project)


def cmd_show(a):
    d = load(a.project)
    print(f"{d['project']}  [{d.get('niche') or 'no niche'}]  {d['dimension']} test, "
          f"created {d['created']}")
    if d.get("fixed_title"):
        print(f"  fixed title: {d['fixed_title']}")
    for b in d["bets"]:
        first = "  (first — inconclusive defaults here)" if b.get("is_first_uploaded") else ""
        print(f"  {b['slot']}: {b['asset']}"
              f"{'  [' + b['lever'] + ']' if b.get('lever') else ''}{first}")
    r = d.get("result")
    if not r:
        print("  result: NOT YET RECORDED")
    else:
        print(f"  result: {r['label'].upper()}"
              f"{' -> ' + r['winner'] if r.get('winner') else ''}"
              f"{'  (' + format(r['impressions'], ',') + ' impressions)' if r.get('impressions') else ''}")
        if r.get("note"):
            print(f"  note: {r['note']}")


def cmd_result(a):
    d = load(a.project)
    slots = [b["slot"] for b in d["bets"]]
    if a.label == "winner" and not a.winner:
        raise SystemExit("--label winner needs --winner <slot>")
    if a.winner and a.winner not in slots:
        raise SystemExit(f"unknown slot {a.winner!r}; this test has {slots}")

    d["result"] = {"label": a.label, "winner": a.winner, "impressions": a.impressions,
                   "note": a.note, "recorded": dt.date.today().isoformat()}
    p = save(a.project, d)
    print(f"recorded {a.label.upper()} -> {os.path.relpath(p, ROOT)}")

    if a.label == "inconclusive":
        first = next((b["slot"] for b in d["bets"] if b.get("is_first_uploaded")), slots[0])
        print(f"  inconclusive defaults to the first-uploaded bet ({first}) — that is what viewers "
              f"now see")
        print("  a 3-way split often can't resolve on low impressions; consider 2 sharply different "
              "bets next time rather than 3 similar ones")
    elif a.label == "performed-same":
        print("  the bets were not different enough to separate. Next time pull levers that are "
              "further apart — three flavours of one idea always lands here.")
    else:
        w = next(b for b in d["bets"] if b["slot"] == a.winner)
        if w.get("lever"):
            print(f"  winning lever: {w['lever']}")
        print("  ACTION: add this to .claude/skills/packaging/references/channel-calibration.md — a "
              "result that isn't written into the rules is a result you'll re-learn next quarter.")


def cmd_report(a):
    rows = []
    for p in sorted(glob.glob(os.path.join(ROOT, "videos", "*", "work", "ab-test.json"))):
        try:
            with open(p, encoding="utf-8") as f:
                rows.append(json.load(f))
        except (OSError, json.JSONDecodeError) as e:
            print(f"! skipped unreadable {os.path.relpath(p, ROOT)}: {e}")
    if a.niche:
        rows = [r for r in rows if r.get("niche") == a.niche]
    if not rows:
        print(f"no A/B tests recorded{' for niche ' + a.niche if a.niche else ''}")
        return

    done = [r for r in rows if r.get("result")]
    print(f"{len(rows)} test(s) recorded, {len(done)} with results"
          f"{' — niche ' + a.niche if a.niche else ''}\n")
    for r in rows:
        res = r.get("result")
        state = res["label"].upper() if res else "pending"
        print(f"  {r['project']:<42} {r['dimension']:<10} {state}")

    levers = {}
    for r in done:
        res = r["result"]
        if res["label"] != "winner":
            continue
        w = next((b for b in r["bets"] if b["slot"] == res.get("winner")), None)
        if w and w.get("lever"):
            levers[w["lever"]] = levers.get(w["lever"], 0) + 1
    if levers:
        print("\n  winning levers so far:")
        for lev, n in sorted(levers.items(), key=lambda kv: -kv[1]):
            print(f"    {n}x  {lev}")
    inconclusive = sum(1 for r in done if r["result"]["label"] != "winner")
    if done and inconclusive == len(done):
        print("\n  every completed test failed to separate — the bets are probably too similar.")
    if len(done) < 10:
        print(f"\n  NOTE: {len(done)} completed test(s). Do not rewrite packaging rules off this yet "
              f"— IMPROVEMENT-QUEUE R3 puts the threshold near 10 long-form uploads.")


def main():
    ap = argparse.ArgumentParser(description="track YouTube A/B packaging tests and their results")
    sub = ap.add_subparsers(dest="cmd", required=True)

    n = sub.add_parser("new", help="record a planned A/B test")
    n.add_argument("project")
    n.add_argument("--dimension", choices=DIMENSIONS, default="thumbnail")
    n.add_argument("--title", help="the fixed title (for a thumbnail-only test)")
    n.add_argument("--niche")
    n.add_argument("--bet", nargs=2, metavar=("SLOT", "ASSET"), action="append", required=True,
                   help="repeatable: --bet a work/thumbs/a.png")
    n.add_argument("--lever", action="append", help="repeatable, one per bet, in the same order")
    n.set_defaults(fn=cmd_new)

    s = sub.add_parser("show", help="print a project's test and result")
    s.add_argument("project")
    s.set_defaults(fn=cmd_show)

    r = sub.add_parser("result", help="record what YouTube reported")
    r.add_argument("project")
    r.add_argument("--label", choices=LABELS, required=True)
    r.add_argument("--winner", help="slot that won (required for --label winner)")
    r.add_argument("--impressions", type=int)
    r.add_argument("--note")
    r.set_defaults(fn=cmd_result)

    rep = sub.add_parser("report", help="cross-video summary of tests and winning levers")
    rep.add_argument("--niche")
    rep.set_defaults(fn=cmd_report)

    a = ap.parse_args()
    a.fn(a)


if __name__ == "__main__":
    main()
