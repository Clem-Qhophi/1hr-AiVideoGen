#!/usr/bin/env python3
"""
yt_research.py — what is ACTUALLY working in a niche on YouTube right now.

Research before writing, not after. Pulls the top-performing videos for a niche across three
windows and reports the patterns worth copying: title shapes, runtime distribution, and view
VELOCITY (views per day since publish), which is the honest signal — a 2 M-view video from 2019
tells you far less than a 200 K-view video from yesterday.

  24h    what is spiking right now (format/topic that is live)
  30d    the current working formula
  365d   the durable evergreen shape for the niche

Needs a free YouTube Data API v3 key in .env as YOUTUBE_API_KEY:
  1. https://console.cloud.google.com/  -> create/select a project
  2. APIs & Services -> Library -> enable "YouTube Data API v3"
  3. APIs & Services -> Credentials -> Create credentials -> API key
  4. add to .env:  YOUTUBE_API_KEY=...
Quota is 10,000 units/day free; a full run here costs roughly 300-400 units.

Usage:
  python tools/yt_research.py --niche home-hacks
  python tools/yt_research.py --query "amish home hack,dehumidify room cheap" --window 30d
  python tools/yt_research.py --niche home-hacks --json videos/video-3/work/research.json
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

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")


def key():
    p = os.path.join(ROOT, ".env")
    if os.path.exists(p):
        for line in open(p, encoding="utf-8", errors="replace"):
            if line.strip().startswith("YOUTUBE_API_KEY="):
                v = line.split("=", 1)[1].strip().strip('"').strip("'")
                if v:
                    return v
    raise SystemExit(
        "no YOUTUBE_API_KEY in .env\n"
        "  1. https://console.cloud.google.com/ -> project\n"
        "  2. enable 'YouTube Data API v3'\n"
        "  3. Credentials -> Create credentials -> API key\n"
        "  4. echo 'YOUTUBE_API_KEY=...' >> .env      (free, 10k units/day)")


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


WINDOWS = {"24h": 1, "30d": 30, "365d": 365}


def search(q, days, n, long_only):
    after = (dt.datetime.now(dt.timezone.utc) - dt.timedelta(days=days)).strftime("%Y-%m-%dT%H:%M:%SZ")
    p = dict(part="snippet", q=q, type="video", order="viewCount",
             publishedAfter=after, maxResults=min(50, n), relevanceLanguage="en")
    if long_only:
        p["videoDuration"] = "long"          # >20 min, the shape this channel is targeting
    res = api("search", **p)
    ids = [it["id"]["videoId"] for it in res.get("items", []) if it.get("id", {}).get("videoId")]
    if not ids:
        return []
    det = api("videos", part="snippet,statistics,contentDetails", id=",".join(ids))
    out = []
    for v in det.get("items", []):
        sn, st = v.get("snippet", {}), v.get("statistics", {})
        pub = dt.datetime.strptime(sn["publishedAt"], "%Y-%m-%dT%H:%M:%SZ").replace(
            tzinfo=dt.timezone.utc)
        age_d = max(0.25, (dt.datetime.now(dt.timezone.utc) - pub).total_seconds() / 86400)
        views = int(st.get("viewCount", 0))
        out.append({"title": sn.get("title", ""), "channel": sn.get("channelTitle", ""),
                    "views": views, "age_days": round(age_d, 1),
                    "vpd": round(views / age_d), "dur_s": iso_dur(v["contentDetails"]["duration"]),
                    "url": f"https://youtu.be/{v['id']}"})
    return sorted(out, key=lambda x: -x["vpd"])


STOP = set("the a an and or of to in for your you is are it this that with on at how why what "
           "best top new i my me we do does can will not no more most from by".split())


def patterns(rows):
    words = collections.Counter()
    for r in rows:
        for w in re.findall(r"[a-z0-9$']+", r["title"].lower()):
            if w not in STOP and len(w) > 2:
                words[w] += 1
    caps = sum(1 for r in rows if re.search(r"\b[A-Z]{3,}\b", r["title"]))
    nums = sum(1 for r in rows if re.search(r"\d", r["title"]))
    paren = sum(1 for r in rows if re.search(r"[\(\[]", r["title"]))
    return words, caps, nums, paren


def main():
    ap = argparse.ArgumentParser(description="what is working in a niche on YouTube")
    ap.add_argument("--niche", help="niches/<id>.json (uses its title ingredients as queries)")
    ap.add_argument("--query", help="comma-separated search terms (overrides --niche)")
    ap.add_argument("--window", default="all", choices=["24h", "30d", "365d", "all"])
    ap.add_argument("--per", type=int, default=15, help="results per query per window")
    ap.add_argument("--long-only", action="store_true", help="only videos >20 min")
    ap.add_argument("--json", help="also write the raw rows here")
    a = ap.parse_args()

    if a.query:
        queries = [q.strip() for q in a.query.split(",") if q.strip()]
    elif a.niche:
        p = os.path.join(ROOT, "niches", f"{a.niche}.json")
        if not os.path.exists(p):
            raise SystemExit(f"no niche profile: {p}")
        n = json.load(open(p, encoding="utf-8"))
        queries = [n["name"]] + [t.split(".")[0][:60] for t in n.get("reference_titles", [])[:2]]
    else:
        raise SystemExit("need --niche or --query")

    wins = list(WINDOWS) if a.window == "all" else [a.window]
    allrows, out = {}, []
    for w in wins:
        rows = []
        for q in queries:
            try:
                rows += search(q, WINDOWS[w], a.per, a.long_only)
            except Exception as e:
                print(f"  [{w}] {q!r}: {type(e).__name__} {e}")
        seen, uniq = set(), []
        for r in rows:
            if r["url"] not in seen:
                seen.add(r["url"])
                uniq.append(r)
        uniq.sort(key=lambda x: -x["vpd"])
        allrows[w] = uniq
        out += [{**r, "window": w} for r in uniq]

        print(f"\n=== {w} — {len(uniq)} videos ===")
        if not uniq:
            print("  nothing found")
            continue
        durs = [r["dur_s"] for r in uniq if r["dur_s"]]
        if durs:
            print(f"  runtime: median {statistics.median(durs)/60:.0f} min  "
                  f"(p25 {sorted(durs)[len(durs)//4]/60:.0f} / p75 {sorted(durs)[3*len(durs)//4]/60:.0f})")
        words, caps, nums, paren = patterns(uniq)
        n_ = len(uniq)
        print(f"  titles: {caps*100//n_}% use ALL-CAPS · {nums*100//n_}% a number · "
              f"{paren*100//n_}% a parenthetical")
        print(f"  recurring words: {', '.join(w for w, _ in words.most_common(12))}")
        print("  top by views/day:")
        for r in uniq[:6]:
            print(f"    {r['vpd']:>8,}/d  {r['dur_s']//60:>3}m  {r['title'][:66]}")
            print(f"              {r['channel'][:34]:<34} {r['views']:,} views, {r['age_days']}d old")

    if a.json:
        os.makedirs(os.path.dirname(a.json) or ".", exist_ok=True)
        with open(a.json, "w", encoding="utf-8") as f:
            json.dump({"queries": queries, "rows": out}, f, indent=1, ensure_ascii=False)
        print(f"\n  -> {a.json}")
    print("\nRead these as PATTERNS to learn from, not titles to copy. Duplicating a title "
          "verbatim is how a channel gets flagged as derivative.")


if __name__ == "__main__":
    main()
