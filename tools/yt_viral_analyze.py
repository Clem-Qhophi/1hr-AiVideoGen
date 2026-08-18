#!/usr/bin/env python3
"""
yt_viral_analyze.py — find the real OUTLIERS in a niche and decompose why they broke out.

The gap this fills: `yt_research.py` ranks by views/day, which reliably surfaces videos from big
channels. 500K views on a 3M-subscriber channel is that channel's Tuesday; 60K views on a
2K-subscriber channel is a genuine breakout the algorithm chose to push. Raw views cannot tell those
apart, so ranking by them teaches you what BIG CHANNELS do, not what MAKES something travel.

So this ranks by OUTLIER MULTIPLIER = views / subscriberCount — the standard read for "did this
video outperform its own channel". Then it decomposes the titles that actually broke out into the
levers they pull, and reports which levers correlate with breaking out IN THIS NICHE, which is the
part you can carry into the next script.

  multiplier >= 10x   the algorithm pushed this well beyond the channel's own audience
  multiplier 2-10x    real outperformance
  multiplier < 1x     underperformed its own subscriber base (big channel, ordinary video)

HONESTY / LIMITS, read before trusting a number:
  - Lever detection is REGEX HEURISTICS over the title text. It is a fast lens, not ground truth,
    and it cannot see the thumbnail, which is usually at least half of why something got clicked.
  - subscriberCount is rounded hard by YouTube and hidden on some channels (those are skipped, not
    guessed). A brand-new channel with ~0 subs produces an enormous multiplier that means "no
    audience yet", not "viral" — a floor is applied and those are flagged, not silently ranked.
  - Correlation over a few dozen titles is a HINT to test, not a proven cause. Feed anything it
    suggests through an actual A/B test (`tools/ab_test.py`) before rewriting a niche's rules.
  - Never copy a surfaced title. Extract the MECHANISM and rebuild it in this channel's own voice —
    see CLAUDE.md and the viral-source rule in memory.

Quota: search costs 100 units/query, videos+channels 1 each. A 4-query run is ~400 units of the
free 10,000/day.

Usage:
  python tools/yt_viral_analyze.py --niche real-estate --window 30d
  python tools/yt_viral_analyze.py --query "closing costs explained,realtor commission" --window 365d
  python tools/yt_viral_analyze.py --niche home-hacks --window 30d --json docs/research/hh-viral.json
"""
import argparse
import collections
import datetime as dt
import json
import os
import re
import statistics
import sys
import urllib.parse
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
API = "https://www.googleapis.com/youtube/v3"
WINDOWS = {"24h": 1, "7d": 7, "30d": 30, "365d": 365}
MIN_SUBS = 500          # below this, views/subs is noise about a channel with no audience yet
MIN_VIEWS = 1000        # below this, nothing has "travelled" regardless of ratio

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

# Heuristic title levers. Ordered roughly by how specific the signal is.
LEVERS = {
    "dollar-anchor":    r"\$\s?[\d,]+",
    "listicle-count":   r"\b\d+\s+(things|ways|hacks|mistakes|tips|secrets|rules|reasons|signs)\b",
    "negation-stack":   r"\bno\s+\w+[.,]\s*no\s+\w+",
    "curiosity-gap":    r"\b(nobody|no one|never told|until|what happened|the one|reason why|"
                        r"didn'?t know|hidden|secret)\b",
    "authority-borrow": r"\b(amish|expert|doctor|scientist|lawyer|according to|per the|fed|irs|"
                        r"study|research|insider|former)\b",
    "contrarian":       r"\b(don'?t|stop|never|wrong|myth|lie|forget|actually|truth about)\b",
    "loss-threat":      r"\b(costing|cost you|lose|losing|mistake|trap|scam|avoid|warning|before you|"
                        r"regret)\b",
    "time-anchor":      r"\b(20\d\d|this year|right now|today|this week)\b",
    "superlative":      r"\b(best|worst|biggest|only|every|cheapest|fastest)\b",
    "personal-frame":   r"\b(i |i'?m |my |we |me\b)",
    "question-hook":    r"\?",
    # 4+ consecutive capitals, matched CASE-SENSITIVELY (see CASE_SENSITIVE below). This was
    # `[A-Z]{3,}` evaluated with re.I, which made it match any 3-letter word — it flagged 100% of
    # titles in all 5 niches and silently padded every lever table with a meaningless row. 4+ also
    # keeps ordinary acronyms (AI, GPT, FHA, NYC) from reading as shouting; genuinely shouted words
    # in these niches (AMISH, BANNED, UNTOLD, MUST) are 4+ anyway.
    "caps-shout":       r"\b[A-Z]{4,}\b",
}

# Levers whose whole point is letter CASE must not be matched case-insensitively.
CASE_SENSITIVE = {"caps-shout"}


def key():
    p = os.path.join(ROOT, ".env")
    if os.path.exists(p):
        for line in open(p, encoding="utf-8", errors="replace"):
            if line.strip().startswith("YOUTUBE_API_KEY="):
                v = line.split("=", 1)[1].strip().strip('"').strip("'")
                if v:
                    return v
    raise SystemExit("no YOUTUBE_API_KEY in .env — see tools/yt_research.py for the 4-step setup")


def api(path, **params):
    params["key"] = key()
    url = f"{API}/{path}?" + urllib.parse.urlencode(params)
    with urllib.request.urlopen(url, timeout=40) as r:
        return json.load(r)


def iso_dur(s):
    m = re.match(r"P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?", s or "")
    if not m:
        return 0
    d, h, mi, se = (int(x) if x else 0 for x in m.groups())
    return d * 86400 + h * 3600 + mi * 60 + se


def levers_in(title):
    return [name for name, pat in LEVERS.items()
            if re.search(pat, title, 0 if name in CASE_SENSITIVE else re.I)]


def nonlatin_share(title):
    """Fraction of non-ASCII characters — a cheap proxy for 'not an English-market title'.

    Catches Devanagari/CJK titles, but deliberately does NOT catch English-language titles aimed at
    a different market (e.g. an Indian true-crime channel writing in English). Those still need a
    human eye; a script check cannot see audience.
    """
    return sum(ord(c) > 127 for c in title) / max(1, len(title))


def collect(queries, days, per, long_only):
    after = (dt.datetime.now(dt.timezone.utc) - dt.timedelta(days=days)).strftime("%Y-%m-%dT%H:%M:%SZ")
    vids, skipped = {}, collections.Counter()
    for q in queries:
        p = dict(part="snippet", q=q, type="video", order="viewCount", publishedAfter=after,
                 maxResults=min(50, per), relevanceLanguage="en")
        if long_only:
            p["videoDuration"] = "long"
        try:
            res = api("search", **p)
        except Exception as e:
            print(f"  [{q!r}] search failed: {type(e).__name__} {e}")
            continue
        ids = [it["id"]["videoId"] for it in res.get("items", []) if it.get("id", {}).get("videoId")]
        if not ids:
            continue
        det = api("videos", part="snippet,statistics,contentDetails", id=",".join(ids))
        for v in det.get("items", []):
            vids[v["id"]] = v

    if not vids:
        return [], skipped

    # one channels call per 50 ids — cheap (1 unit) and it is what makes the multiplier possible
    ch_ids = sorted({v["snippet"]["channelId"] for v in vids.values()})
    chans = {}
    for i in range(0, len(ch_ids), 50):
        got = api("channels", part="statistics", id=",".join(ch_ids[i:i + 50]))
        for c in got.get("items", []):
            chans[c["id"]] = c.get("statistics", {})

    rows = []
    now = dt.datetime.now(dt.timezone.utc)
    for v in vids.values():
        sn, st = v.get("snippet", {}), v.get("statistics", {})
        views = int(st.get("viewCount", 0))
        if views < MIN_VIEWS:
            skipped["under view floor"] += 1
            continue
        cs = chans.get(sn["channelId"], {})
        if cs.get("hiddenSubscriberCount"):
            skipped["subscriber count hidden"] += 1
            continue
        subs = int(cs.get("subscriberCount", 0) or 0)
        if subs < MIN_SUBS:
            skipped[f"channel under {MIN_SUBS} subs"] += 1
            continue
        pub = dt.datetime.strptime(sn["publishedAt"], "%Y-%m-%dT%H:%M:%SZ").replace(
            tzinfo=dt.timezone.utc)
        age_d = max(0.25, (now - pub).total_seconds() / 86400)
        likes, comments = int(st.get("likeCount", 0) or 0), int(st.get("commentCount", 0) or 0)
        rows.append({
            "title": sn.get("title", ""), "channel": sn.get("channelTitle", ""),
            "subs": subs, "views": views, "age_days": round(age_d, 1),
            "vpd": round(views / age_d), "multiplier": round(views / subs, 2),
            "like_per_1k": round(likes / views * 1000, 1),
            "comment_per_1k": round(comments / views * 1000, 2),
            "dur_min": round(iso_dur(v["contentDetails"]["duration"]) / 60),
            "levers": levers_in(sn.get("title", "")),
            "url": f"https://youtu.be/{v['id']}",
        })
    rows.sort(key=lambda r: -r["multiplier"])
    return rows, skipped


def report(a, rows, skipped):
    if not rows:
        print("nothing qualified. Loosen --window, raise --per, or check the queries.")
        for k, v in skipped.items():
            print(f"  skipped {v}: {k}")
        return

    breakouts = [r for r in rows if r["multiplier"] >= 2]
    print(f"\n=== {a.window}: {len(rows)} qualifying videos, {len(breakouts)} true breakouts "
          f"(>=2x their own subscriber count) ===")
    if skipped:
        print("  excluded: " + ", ".join(f"{v} {k}" for k, v in skipped.items()))

    foreign = [r for r in rows if nonlatin_share(r["title"]) > 0.15]
    if foreign and not a.en_only:
        print(f"  NOTE: {len(foreign)} title(s) are mostly non-Latin script — different market, "
              f"their multipliers do not transfer. Re-run with --en-only to drop them.")

    print(f"\n  TOP {min(a.top, len(rows))} BY OUTLIER MULTIPLIER (not raw views):")
    for r in rows[:a.top]:
        print(f"    {r['multiplier']:>7.1f}x  {r['views']:>9,}v / {r['subs']:>8,}subs  "
              f"{r['dur_min']:>3}m  {r['title'][:58]}")
        print(f"             {r['channel'][:30]:<30} {r['age_days']:>5}d  "
              f"{r['like_per_1k']:>4.1f} likes/1k  {r['comment_per_1k']:>4.2f} comments/1k")
        if r["levers"]:
            print(f"             levers: {', '.join(r['levers'])}")

    base, brk = collections.Counter(), collections.Counter()
    for r in rows:
        for lv in r["levers"]:
            base[lv] += 1
            if r["multiplier"] >= 2:
                brk[lv] += 1
    if base:
        overall = len(breakouts) / len(rows) if rows else 0
        print("\n  LEVER LIFT — share of videos using each lever that broke out (>=2x):")
        scored = [(brk[lv] / n, brk[lv], n, lv) for lv, n in base.items() if n >= 3]
        for rate, b, n, lv in sorted(scored, reverse=True):
            # A lever present on (nearly) every title cannot discriminate, however good its rate
            # looks — flag it rather than letting it read as a finding.
            noise = "  [matches ~all titles — no signal]" if n >= 0.95 * len(rows) else ""
            flag = "  <-- above baseline" if rate > overall and not noise else ""
            thin = "  (thin)" if n < 8 else ""
            print(f"    {rate*100:>5.0f}%  ({b}/{n}){thin}  {lv}{flag}{noise}")
        print(f"    baseline: {overall*100:.0f}% of all qualifying videos broke out")
        print("    Levers below baseline are not 'bad' — they may just be table stakes in this niche.")
        if any(n < 8 for _, _, n, _ in scored):
            print("    (thin) = fewer than 8 videos behind the number. Directional at best.")

    if breakouts:
        durs = [r["dur_min"] for r in breakouts if r["dur_min"]]
        if durs:
            print(f"\n  BREAKOUT RUNTIME: median {statistics.median(durs):.0f} min "
                  f"(range {min(durs)}-{max(durs)})")
        cpk = [r["comment_per_1k"] for r in breakouts]
        print(f"  BREAKOUT ENGAGEMENT: median {statistics.median(cpk):.2f} comments/1k views "
              f"— comments outrank likes as an algorithm signal, so this is the number to beat")

    if a.json:
        os.makedirs(os.path.dirname(a.json) or ".", exist_ok=True)
        with open(a.json, "w", encoding="utf-8") as f:
            json.dump({"queries": getattr(a, "_queries", []), "window": a.window, "rows": rows},
                      f, indent=1, ensure_ascii=False)
        print(f"\n  -> {a.json}")

    print("\n  Lever detection is a regex heuristic on the TITLE only — it cannot see the thumbnail,\n"
          "  which is usually half the click. Treat lift numbers as hypotheses to A/B test\n"
          "  (tools/ab_test.py), not as proven causes. Rebuild the mechanism in your own words;\n"
          "  never reuse a surfaced title.")


def main():
    ap = argparse.ArgumentParser(description="find true outliers in a niche and decompose why")
    ap.add_argument("--niche")
    ap.add_argument("--query", help="comma-separated search terms (overrides --niche)")
    ap.add_argument("--window", default="30d", choices=list(WINDOWS))
    ap.add_argument("--per", type=int, default=25)
    ap.add_argument("--long-only", action="store_true")
    ap.add_argument("--top", type=int, default=10)
    ap.add_argument("--json")
    ap.add_argument("--from-json", metavar="PATH",
                    help="re-analyse a previously saved run instead of calling the API "
                         "(0 quota — use this after changing lever definitions)")
    ap.add_argument("--en-only", action="store_true",
                    help="drop titles that are mostly non-Latin script")
    a = ap.parse_args()

    if a.from_json:
        with open(a.from_json, encoding="utf-8") as f:
            saved = json.load(f)
        queries, rows, skipped = saved.get("queries", []), saved["rows"], collections.Counter()
        a.window = saved.get("window", a.window)   # report the window the data was COLLECTED in
        a._queries = queries
        for r in rows:                      # re-derive levers under the CURRENT definitions
            r["levers"] = levers_in(r["title"])
        if a.en_only:
            keep = [r for r in rows if nonlatin_share(r["title"]) <= 0.15]
            skipped["mostly non-Latin title"] = len(rows) - len(keep)
            rows = keep
        rows.sort(key=lambda r: -r["multiplier"])
        print(f"  (re-analysed {os.path.relpath(a.from_json, ROOT)} — no API calls)")
        report(a, rows, skipped)
        return

    if a.query:
        queries = [q.strip() for q in a.query.split(",") if q.strip()]
    elif a.niche:
        p = os.path.join(ROOT, "niches", f"{a.niche}.json")
        if not os.path.exists(p):
            raise SystemExit(f"no niche profile: {p}")
        n = json.load(open(p, encoding="utf-8"))
        queries = [n["name"]] + [re.sub(r"\s*\([^)]*\)\s*$", "", t)[:60]
                                 for t in n.get("reference_titles", [])[:3]]
    else:
        raise SystemExit("need --niche or --query")

    rows, skipped = collect(queries, WINDOWS[a.window], a.per, a.long_only)
    if a.en_only:
        keep = [r for r in rows if nonlatin_share(r["title"]) <= 0.15]
        skipped["mostly non-Latin title"] = len(rows) - len(keep)
        rows = keep
    a._queries = queries
    report(a, rows, skipped)


if __name__ == "__main__":
    main()
