#!/usr/bin/env python3
"""
validate_topic.py — should we make a video about THIS EXACT TOPIC? Evidence, then a verdict.

The gap this fills: `yt_research.py` and `yt_viral_analyze.py` both validate a NICHE. Neither ever
asks whether the specific topic of the next video is one anybody wants. A 32-minute real-estate
video on "closing costs" was produced with zero evidence that the phrase is something people search
for or watch. This tool is the check that runs BEFORE production, and it prints its reasoning so a
human can disagree with it.

It measures four things, from two independent sources:

  1. SEARCH DEMAND        — YouTube's own autocomplete (keyless, no auth, no quota).
  2. SUPPLY / SATURATION  — how many videos already exist and how big their channels are.
  3. PERFORMANCE + FRESHNESS — views/day of the topic's winners, recent window vs the year.
  4. WINNABILITY          — has a SMALL channel broken out on this topic (views / its own subs)?

WHAT EACH SOURCE CAN AND CANNOT TELL YOU — read this before quoting any number:

  * Autocomplete IS a real search-demand signal and it is the ONLY one here. Google ranks
    suggestions by how often the query is actually typed, so "does YouTube complete this phrase,
    and after how few characters" is evidence about PEOPLE, not about videos. But it is strictly
    ORDINAL: there is no volume behind it. "Surfaces after 11 characters" means more-typed than a
    phrase that needs 25; it does not mean N searches/month, and this tool never claims a number.

  * The YouTube Data API has NO search-volume endpoint. Everything it returns is
    engagement-on-videos-that-exist. `search.pageInfo.totalResults` counts VIDEOS, not searches,
    is an estimate, and saturates at 1,000,000 — treat it as a supply/crowding proxy only.
    Reporting API view counts as "search demand" would be exactly the conflation CLAUDE.md forbids.

  * Views/day and the outlier multiplier are the same measures `yt_viral_analyze.py` uses, with the
    same caveats: subscriberCount is rounded hard by YouTube, hidden on some channels (skipped, not
    guessed), and a handful of videos is a hint, not a finding. Thin samples are flagged "(thin)".

  * Optional `--trends` hits Google Trends' UNOFFICIAL, undocumented endpoint with
    property=youtube. It is genuine YouTube-search volume, but relative (0-100), noisy on
    low-volume terms, and rate-limited hard (HTTP 429 on roughly half of calls). It is off by
    default, best-effort, and its failures are printed rather than hidden. Never gate a decision
    on it alone.

VERDICTS — the two "no" verdicts are deliberately separate, because they have different fixes:
  GO           demand, watched videos, and a channel our size has already broken out on it
  GO-NARROW    real, but the broad phrase is not the winner — take a narrower angle and re-run
  CROWDED      people want it, incumbents own it, no small channel has broken through
  WEAK         nothing vetoes it, nothing justifies it
  NO-AUDIENCE  people DO search it, but nothing published on it is being watched
  NO-DEMAND    YouTube does not autocomplete the phrase — it is not what people type

Quota: 2 search calls (100 units each) + 2 videos + 1-2 channels calls = ~204 of the free
10,000/day. Autocomplete costs zero quota. `--from-json` re-scores a saved run for free.

Usage:
  python tools/validate_topic.py --topic "closing costs"
  python tools/validate_topic.py --topic "mortgage points" --niche real-estate --trends
  python tools/validate_topic.py --topic "401k fees" --json docs/research/topic-401k-fees.json
  python tools/validate_topic.py --from-json docs/research/topic-401k-fees.json
"""
import argparse
import datetime as dt
import json
import os
import re
import statistics
import string
import sys
import time
import urllib.parse
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
API = "https://www.googleapis.com/youtube/v3"
AC = "https://suggestqueries.google.com/complete/search"

WINDOWS = {"7d": 7, "30d": 30, "90d": 90, "180d": 180, "365d": 365}
MIN_SUBS = 500          # below this, views/subs describes a channel with no audience, not a breakout
MIN_VIEWS = 1000        # below this, nothing travelled regardless of ratio
SMALL_CHANNEL = 50_000  # "a channel like ours could have made this"
BIG_CHANNEL = 250_000   # incumbent; its numbers do not transfer to a new channel
TOTALRESULTS_CAP = 1_000_000   # the API saturates here; anything at the cap is "lots", not a count

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")


# ---------------------------------------------------------------- YouTube Data API

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


# ---------------------------------------------------------------- autocomplete (keyless)

def suggest(q, retries=2):
    """YouTube search suggestions for a prefix. No key, no quota, no auth.

    Returns [] on failure rather than raising — a rate-limited suggestion probe should weaken
    confidence, not kill the run. Failures are counted and reported by the caller.
    """
    url = f"{AC}?" + urllib.parse.urlencode({"client": "firefox", "ds": "yt", "q": q})
    for i in range(retries + 1):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req, timeout=15) as r:
                data = json.loads(r.read().decode("utf-8", "replace"))
            return [s for s in data[1] if isinstance(s, str)]
        except Exception:
            if i < retries:
                time.sleep(0.6 * (i + 1))
    return None          # None = probe failed, distinct from [] = no suggestions


def prefix_candidates(topic):
    """Prefix lengths worth probing: every word boundary, each word's first 3 chars, and deciles.

    A linear scan of every length would be ~35 requests for a 5-word topic. This is ~12-16 and
    lands within a character or two of the true threshold, which is all the resolution the
    signal deserves.
    """
    L, out, pos = len(topic), set(), 0
    for w in topic.split():
        out.add(min(L, pos + min(3, len(w))))
        pos += len(w) + 1
        out.add(min(L, pos - 1))
    for f in (0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0):
        out.add(max(3, int(round(L * f))))
    return sorted(n for n in out if 3 <= n <= L)


def autocomplete_demand(topic, alphabet=True, sleep=0.12):
    """Does YouTube complete this exact phrase, and after how few characters?

    Suggestion ORDER is popularity order (Google's own ranking of what gets typed), so both the
    threshold and the rank are evidence about searchers. Neither is a volume.
    """
    t = topic.lower().strip()
    fails, probes = 0, 0
    hit_len, hit_rank, hit_prefix = None, None, None

    def probe(n):
        nonlocal fails, probes
        probes += 1
        s = suggest(t[:n])
        time.sleep(sleep)
        if s is None:
            fails += 1
            return None
        for i, x in enumerate(s):
            if x.lower().startswith(t):
                return i + 1
        return 0

    for n in prefix_candidates(t):
        r = probe(n)
        if r:
            hit_len, hit_rank, hit_prefix = n, r, t[:n]
            break
    if hit_len:                                   # refine down a few chars for a tighter threshold
        n = hit_len
        while n > 3:
            r = probe(n - 1)
            if not r:
                break
            n, hit_rank, hit_prefix = n - 1, r, t[:n - 1]
        hit_len = n

    longtail, lt_fail = [], 0
    if alphabet:
        seen = set()
        for ch in string.ascii_lowercase:
            s = suggest(f"{t} {ch}")
            time.sleep(sleep)
            if s is None:
                lt_fail += 1
                continue
            for x in s:
                xl = x.lower().strip()
                if xl not in seen and xl != t:
                    seen.add(xl)
                    longtail.append(x)

    head = suggest(t) or []
    time.sleep(sleep)
    return {
        "topic": t,
        "self_suggest_chars": hit_len,
        "self_suggest_prefix": hit_prefix,
        "self_suggest_rank": hit_rank,
        "topic_chars": len(t),
        "reach": round(hit_len / len(t), 2) if hit_len else None,
        "head_suggestions": head,
        "longtail": longtail,
        "longtail_n": len(longtail),
        "probes": probes,
        "probe_failures": fails + lt_fail,
    }


# ---------------------------------------------------------------- optional: Google Trends

def trends_youtube(topic, geo="US"):
    """Unofficial Google Trends, property=youtube. Best-effort; returns a dict with 'error' set
    when it is unavailable, which is often (429)."""
    try:
        import requests
    except ImportError:
        return {"error": "requests not installed (pip install requests)"}
    s = requests.Session()
    s.headers.update({"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})
    strip = lambda t: json.loads(t[t.find("{"):])
    try:
        s.get(f"https://trends.google.com/?geo={geo}", timeout=20)      # sets the NID cookie
        req = {"comparisonItem": [{"keyword": topic, "geo": geo, "time": "today 12-m"}],
               "category": 0, "property": "youtube"}
        u = ("https://trends.google.com/trends/api/explore?hl=en-US&tz=0&req="
             + urllib.parse.quote(json.dumps(req)))
        r = s.get(u, timeout=25)
        if r.status_code != 200:
            return {"error": f"explore HTTP {r.status_code} (unofficial endpoint, rate-limited)"}
        w = [x for x in strip(r.text)["widgets"] if x["id"] == "TIMESERIES"][0]
        u2 = ("https://trends.google.com/trends/api/widgetdata/multiline?hl=en-US&tz=0&req="
              + urllib.parse.quote(json.dumps(w["request"])) + "&token=" + w["token"])
        r2 = s.get(u2, timeout=25)
        if r2.status_code != 200:
            return {"error": f"timeseries HTTP {r2.status_code} (unofficial endpoint, rate-limited)"}
        vals = [p["value"][0] for p in strip(r2.text)["default"]["timelineData"]]
        if not vals:
            return {"error": "empty series"}
        mean, recent = sum(vals) / len(vals), sum(vals[-8:]) / min(8, len(vals))
        return {"weeks": len(vals), "mean_index": round(mean, 1),
                "last8w_index": round(recent, 1),
                "ratio": round(recent / mean, 2) if mean else None,
                "low_volume": mean < 10}
    except Exception as e:
        return {"error": f"{type(e).__name__}: {e}"}


# ---------------------------------------------------------------- supply / performance / outliers

def fetch_window(topic, days, per, long_only):
    """One search + one videos + one channels call. Returns (rows, totalResults, note)."""
    after = (dt.datetime.now(dt.timezone.utc) - dt.timedelta(days=days)).strftime(
        "%Y-%m-%dT%H:%M:%SZ")
    p = dict(part="snippet", q=topic, type="video", order="viewCount", publishedAfter=after,
             maxResults=min(50, per), relevanceLanguage="en")
    if long_only:
        p["videoDuration"] = "long"
    try:
        res = api("search", **p)
    except Exception as e:
        return [], None, f"search failed: {type(e).__name__} {e}"
    total = res.get("pageInfo", {}).get("totalResults")
    ids = [it["id"]["videoId"] for it in res.get("items", []) if it.get("id", {}).get("videoId")]
    if not ids:
        return [], total, None
    det = api("videos", part="snippet,statistics,contentDetails", id=",".join(ids))
    vids = det.get("items", [])
    ch_ids = sorted({v["snippet"]["channelId"] for v in vids})
    chans = {}
    for i in range(0, len(ch_ids), 50):
        for c in api("channels", part="statistics", id=",".join(ch_ids[i:i + 50])).get("items", []):
            chans[c["id"]] = c.get("statistics", {})

    now, rows = dt.datetime.now(dt.timezone.utc), []
    for v in vids:
        sn, st = v.get("snippet", {}), v.get("statistics", {})
        views = int(st.get("viewCount", 0) or 0)
        pub = dt.datetime.strptime(sn["publishedAt"], "%Y-%m-%dT%H:%M:%SZ").replace(
            tzinfo=dt.timezone.utc)
        age = max(0.25, (now - pub).total_seconds() / 86400)
        cs = chans.get(sn["channelId"], {})
        hidden = bool(cs.get("hiddenSubscriberCount"))
        subs = 0 if hidden else int(cs.get("subscriberCount", 0) or 0)
        likes = int(st.get("likeCount", 0) or 0)
        comments = int(st.get("commentCount", 0) or 0)
        rows.append({
            "title": sn.get("title", ""), "channel": sn.get("channelTitle", ""),
            "subs": subs, "subs_hidden": hidden, "views": views,
            "age_days": round(age, 1), "vpd": round(views / age),
            "multiplier": round(views / subs, 2) if subs >= MIN_SUBS and views >= MIN_VIEWS else None,
            "like_per_1k": round(likes / views * 1000, 1) if views else 0,
            "comment_per_1k": round(comments / views * 1000, 2) if views else 0,
            "dur_min": round(iso_dur(v["contentDetails"]["duration"]) / 60),
            "url": f"https://youtu.be/{v['id']}",
        })
    rows.sort(key=lambda r: -r["vpd"])
    return rows, total, None


# ---------------------------------------------------------------- scoring

def med(xs):
    return statistics.median(xs) if xs else 0


STOP = set("the a an and or of to in for your you is are it this that with on at how why what "
           "best top new i my me we do does can will not no more most from by vs".split())


# Words that appear in how people SEARCH but not in how creators TITLE. Measured: the query
# "how to get rid of ticks in your yard" scored 1/25 on-topic because winning titles say "Kill Every
# TICK In Your Yard" — 'get'/'rid' are search grammar, not subject matter. Counting them as topic
# words made every conversational query look like total drift.
QUERY_FILLER = set("get rid make made use using know need needs want way ways thing things guide "
                   "tips tip explained explain tutorial about really actually should".split())


def content_words(topic):
    ws = [w for w in re.findall(r"[a-z0-9$']+", topic.lower())
          if w not in STOP and len(w) > 2]
    core = [w for w in ws if w not in QUERY_FILLER]
    return core or ws        # never strip a topic down to nothing


def on_topic(title, words):
    """Does this result actually cover the topic, or did YouTube's matcher drift?

    Measured empirically: a search for "mortgage points" returns credit-card-rewards videos, whose
    views/day would otherwise be reported as evidence about mortgage points. Requires 60% of the
    topic's content words (prefix match, so 'cost' matches 'costs'), with a floor of 2 — so a
    two-word topic needs both, a three-word topic needs two.

    This is a LEXICAL alarm, not a semantic classifier. It cannot see synonyms: "How Amish Reduce
    Humidity" is arguably an "amish home remedies" video and this will call it drift. That is why a
    high drift number prints as 'go look at the titles', never as a silent filter.
    """
    if not words:
        return True
    toks = re.findall(r"[a-z0-9$']+", title.lower())
    hits = sum(any(w in tok or tok.startswith(w[:max(4, len(w) - 1)]) for tok in toks)
               for w in words)
    need = min(len(words), 3, max(2, -(-len(words) * 6 // 10)))
    return hits >= need


def score(ac, recent, year, tot_recent, tot_year, recent_days, topic):
    """Four 0-3 sub-scores with the reason for each. Deterministic, so it can be argued with."""
    s, why = {}, {}

    # Performance/freshness are scored on ON-TOPIC results only where there are enough of them.
    # Otherwise a query that drifts (see on_topic) scores itself on somebody else's subject.
    words = content_words(topic)
    yr_on = [r for r in year if on_topic(r["title"], words)]
    rc_on = [r for r in recent if on_topic(r["title"], words)]
    drift = 1 - len(yr_on) / max(1, len(year))
    strict = len(yr_on) >= 5
    if strict:
        year, recent = yr_on, rc_on

    # --- demand: autocomplete only. This is the sole PEOPLE-side signal in the tool.
    reach, lt = ac.get("reach"), ac.get("longtail_n", 0)
    if reach is None:
        s["demand"], why["demand"] = 0, ("YouTube never autocompletes this exact phrase, at any "
                                         "prefix — it is not a thing people type")
    elif reach <= 0.6 and lt >= 15:
        s["demand"], why["demand"] = 3, (f"autocompletes after {ac['self_suggest_chars']}/"
                                         f"{ac['topic_chars']} chars at rank {ac['self_suggest_rank']}, "
                                         f"{lt} distinct long-tail queries")
    elif reach <= 0.75 or lt >= 12:
        s["demand"], why["demand"] = 2, (f"autocompletes after {ac['self_suggest_chars']}/"
                                         f"{ac['topic_chars']} chars, {lt} long-tail queries")
    elif reach < 1.0 or lt >= 5:
        s["demand"], why["demand"] = 1, (f"only autocompletes once nearly the whole phrase is typed "
                                         f"({ac['self_suggest_chars']}/{ac['topic_chars']} chars), "
                                         f"{lt} long-tail queries — searched, but rarely")
    else:
        s["demand"], why["demand"] = 0, "autocompletes only on the complete phrase, almost no long tail"

    # --- performance: are the videos that DO exist being watched?
    vpd = [r["vpd"] for r in year] or [0]
    top_vpd, med_vpd = max(vpd), med(vpd)
    if top_vpd >= 2000 and med_vpd >= 200:
        s["performance"], why["performance"] = 3, f"top {top_vpd:,}/d, median {med_vpd:,.0f}/d"
    elif top_vpd >= 500:
        s["performance"], why["performance"] = 2, f"top {top_vpd:,}/d, median {med_vpd:,.0f}/d"
    elif top_vpd >= 100:
        s["performance"], why["performance"] = 1, f"top only {top_vpd:,}/d, median {med_vpd:,.0f}/d"
    else:
        s["performance"], why["performance"] = 0, (f"nothing on this topic is being watched — best is "
                                                   f"{top_vpd:,} views/day")

    # --- freshness: recent-window winners vs the year's. order=viewCount biases against new
    #     videos, so a recent median that HOLDS UP against the year's is already a good sign.
    rv, yv = med([r["vpd"] for r in recent]), med([r["vpd"] for r in year])
    ratio = round(rv / yv, 2) if yv else None
    n_r = len(recent)
    if n_r == 0:
        s["freshness"], why["freshness"] = 0, f"nobody has published on this in {recent_days}d"
    elif ratio is None:
        s["freshness"], why["freshness"] = 1, "no year baseline to compare against"
    elif ratio >= 1.2:
        s["freshness"], why["freshness"] = 3, (f"recent median {rv:,.0f}/d vs year {yv:,.0f}/d "
                                               f"({ratio}x) — rising")
    elif ratio >= 0.7:
        s["freshness"], why["freshness"] = 2, (f"recent median {rv:,.0f}/d vs year {yv:,.0f}/d "
                                               f"({ratio}x) — steady")
    else:
        s["freshness"], why["freshness"] = 1, (f"recent median {rv:,.0f}/d vs year {yv:,.0f}/d "
                                               f"({ratio}x) — cooling")

    # --- winnability: has a channel our size broken out on this, recently?
    allrows = {r["url"]: r for r in year}
    allrows.update({r["url"]: r for r in recent})
    rated = [r for r in allrows.values() if r["multiplier"] is not None]
    small = [r for r in rated if r["subs"] < SMALL_CHANNEL and r["multiplier"] >= 2]
    small_recent = [r for r in small if r["age_days"] <= recent_days]
    big_share = (sum(1 for r in allrows.values() if r["subs"] >= BIG_CHANNEL)
                 / max(1, len(allrows)))
    if small_recent:
        b = max(small_recent, key=lambda r: r["multiplier"])
        s["winnability"], why["winnability"] = 3, (
            f"{len(small_recent)} small-channel breakout(s) in {recent_days}d — best "
            f"{b['multiplier']}x ({b['views']:,}v on {b['subs']:,} subs)")
    elif small:
        b = max(small, key=lambda r: r["multiplier"])
        s["winnability"], why["winnability"] = 2, (
            f"{len(small)} small-channel breakout(s) this year but none in the last {recent_days}d "
            f"— best {b['multiplier']}x ({b['views']:,}v on {b['subs']:,} subs)")
    elif big_share >= 0.5:
        s["winnability"], why["winnability"] = 0, (
            f"{big_share*100:.0f}% of results are channels over {BIG_CHANNEL:,} subs and no small "
            f"channel has broken out — incumbent-owned")
    else:
        s["winnability"], why["winnability"] = 1, "no small channel has broken out on this topic"

    total = sum(s.values())
    saturated = (tot_year or 0) >= TOTALRESULTS_CAP

    # NO-DEMAND and NO-AUDIENCE are deliberately separate verdicts. Collapsing them would repeat
    # exactly the conflation this tool exists to prevent: "nobody types this" and "people type it
    # but nothing published on it gets watched" are different problems with different fixes.
    if s["demand"] == 0:
        verdict = "NO-DEMAND"
    elif s["performance"] == 0:
        verdict = "NO-AUDIENCE"
    elif s["winnability"] == 0 and s["demand"] >= 2:
        verdict = "CROWDED"
    elif total >= 9 and s["winnability"] >= 2:
        verdict = "GO"
    elif total >= 7:
        verdict = "GO-NARROW"
    else:
        verdict = "WEAK"

    # A GO cannot rest on numbers that are mostly about some other subject. When drift is heavy AND
    # too few on-topic results exist to score separately, the evidence does not support the top
    # verdict, whatever the arithmetic says.
    downgrade = None
    if drift >= 0.5 and not strict and verdict == "GO":
        verdict, downgrade = "GO-NARROW", (
            f"downgraded from GO: {drift*100:.0f}% of results are off the literal topic and only "
            f"{len(yr_on)} on-topic videos were found, too few to score on their own. The strong "
            f"numbers above may belong to a neighbouring subject — read the titles before trusting "
            f"them, or re-run with the phrasing those winners actually use.")
    return {"scores": s, "why": why, "total": total, "verdict": verdict,
            "big_channel_share": round(big_share, 2), "supply_saturated": saturated,
            "freshness_ratio": ratio, "drift": round(drift, 2), "strict_on_topic": strict,
            "downgrade": downgrade,
            "n_on_topic": len(yr_on), "n_sampled": len(allrows),
            "small_breakouts": sorted(small, key=lambda r: -r["multiplier"])[:5]}


def adjacent_angles(ac, year, recent, limit=8):
    """Narrower angles, taken from YouTube's own suggestion ORDER (popularity order).

    No view number is attached to these on purpose — there isn't one without spending another
    100 quota units per angle. They are candidates to re-run this tool on, not measured winners.
    """
    t = ac["topic"]
    titles = " || ".join(r["title"].lower() for r in list(year) + list(recent))
    out = []
    for x in ac.get("longtail", []) + ac.get("head_suggestions", []):
        xl = x.lower().strip()
        if xl == t or xl in {o["q"] for o in out} or len(xl.split()) < 2:
            continue
        tail = xl.replace(t, "").strip()
        out.append({"q": xl, "covered": bool(tail) and tail in titles})
        if len(out) >= limit * 3:
            break
    out.sort(key=lambda o: (o["covered"], -int(t in o["q"])))
    return out[:limit]


# ---------------------------------------------------------------- report

def report(a, d):
    ac, sc = d["autocomplete"], d["assessment"]
    year, recent = d["year"]["rows"], d["recent"]["rows"]
    print(f"\n{'='*74}\n  TOPIC: {d['topic']!r}"
          + (f"   (niche: {d['niche']})" if d.get("niche") else "") + f"\n{'='*74}")

    print("\n  1. SEARCH DEMAND — YouTube autocomplete (real query popularity, ordinal only)")
    if ac["self_suggest_chars"]:
        print(f"     self-suggests after {ac['self_suggest_chars']}/{ac['topic_chars']} chars "
              f"(prefix {ac['self_suggest_prefix']!r}) at rank {ac['self_suggest_rank']}")
    else:
        print("     NEVER self-suggests — YouTube does not complete this phrase at any prefix")
    print(f"     long tail: {ac['longtail_n']} distinct queries people type after it")
    for x in ac["head_suggestions"][:5]:
        print(f"       · {x}")
    if ac["probe_failures"]:
        print(f"     NOTE: {ac['probe_failures']} autocomplete probe(s) failed — demand read is "
              f"less confident than usual")
    if d.get("trends"):
        tr = d["trends"]
        if tr.get("error"):
            print(f"     Google Trends (unofficial, property=youtube): UNAVAILABLE — {tr['error']}")
        else:
            print(f"     Google Trends (unofficial, property=youtube, 0-100 relative index): "
                  f"12mo mean {tr['mean_index']}, last 8wk {tr['last8w_index']} ({tr['ratio']}x)"
                  + ("  [LOW VOLUME — index is mostly noise at this level]"
                     if tr.get("low_volume") else ""))

    print(f"\n  2. SUPPLY / SATURATION — videos that already exist (NOT a demand number)")
    for lbl, blk in (("365d", d["year"]), (a.recent, d["recent"])):
        tot = blk["total_results"]
        cap = "  [AT THE API'S 1,000,000 CAP — read as 'very many', not a count]" \
            if tot and tot >= TOTALRESULTS_CAP else ""
        print(f"     {lbl:>5}: ~{tot:,} matching videos (API estimate){cap}"
              if tot is not None else f"     {lbl:>5}: total unavailable")
    print(f"     {sc['big_channel_share']*100:.0f}% of the "
          f"{'on-topic' if sc['strict_on_topic'] else 'sampled'} results come from channels over "
          f"{BIG_CHANNEL:,} subs")
    # Shorts are a different product with a different watch pattern; folding them into a runtime
    # median drags it toward 1 min and makes every long-form niche look "mismatched".
    shorts = [r for r in year if r["dur_min"] <= 1]
    durs = [r["dur_min"] for r in year if r["dur_min"] > 1]
    if shorts:
        print(f"     {len(shorts)}/{len(year)} of the sampled results are Shorts (<=1 min) — "
              f"excluded from the runtime read below")
    if durs:
        print(f"     long-form winners' runtime: median {med(durs):.0f} min "
              f"(range {min(durs)}-{max(durs)}, n={len(durs)}"
              f"{', THIN' if len(durs) < 8 else ''})")
        if d.get("niche_target"):
            lo, hi = d["niche_target"]
            fit = "consistent" if lo <= med(durs) <= hi else "MISMATCH with what wins here"
            print(f"     niche '{d['niche']}' targets {lo}-{hi} min — {fit}")
    elif d.get("niche_target"):
        print(f"     no long-form videos in the sample at all — this topic may only exist as Shorts")

    if sc["drift"] >= 0.3:
        print(f"     QUERY DRIFT: only {sc['n_on_topic']}/{len(year)} sampled titles carry the "
              f"topic's own words. Either YouTube matched a different subject, or the winners\n"
              f"       word this idea differently from how searchers type it — a lexical check cannot "
              f"tell those apart. READ THE TITLES BELOW.")
        print("       " + ("Performance/freshness scored on the on-topic subset only."
                           if sc["strict_on_topic"] else
                           "Too few on-topic results to isolate; the scores below include the "
                           "drift. TREAT AS UNRELIABLE."))

    print(f"\n  3. WHAT THE EXISTING VIDEOS DO — top by views/day, last 365d "
          f"(n={len(year)}{'  (thin)' if len(year) < 8 else ''}"
          f"{', ✱ = on-topic' if sc['drift'] >= 0.3 else ''})")
    words = content_words(d["topic"])
    for r in year[:6]:
        mark = "✱" if sc["drift"] >= 0.3 and on_topic(r["title"], words) else " "
        subs = "hidden subs" if r["subs_hidden"] else f"{r['subs']:,} subs"
        mult = f"{r['multiplier']}x" if r["multiplier"] is not None else "  -  "
        print(f"   {mark} {r['vpd']:>7,}/d {mult:>7}  {r['dur_min']:>3}m  {r['title'][:52]}")
        print(f"                             {r['channel'][:28]:<28} {r['views']:>9,}v  {subs}")
    if not year:
        print("     nothing found")

    print(f"\n  4. CAN A CHANNEL OUR SIZE WIN IT — breakouts on channels under "
          f"{SMALL_CHANNEL:,} subs")
    if sc["small_breakouts"]:
        for r in sc["small_breakouts"]:
            print(f"     {r['multiplier']:>6.1f}x  {r['views']:>8,}v / {r['subs']:>7,} subs  "
                  f"{r['age_days']:>5.0f}d  {r['title'][:46]}")
    else:
        print("     none. Every video found is either a big channel or underperformed its own subs.")

    meaning = {
        "GO": "demand, watched videos, and a channel our size has already broken out on it",
        "GO-NARROW": "worth making, but the broad phrase is not the winner — pick one of the "
                     "narrower angles below and re-run this",
        "CROWDED": "people want it and incumbents own it; no small channel has broken through",
        "WEAK": "no sub-score is bad enough to veto it, none is strong enough to justify it",
        "NO-AUDIENCE": "people DO search this, but nothing published on it is being watched — "
                       "demand without an audience for the format",
        "NO-DEMAND": "YouTube does not autocomplete this phrase — it is not what people type",
    }
    print(f"\n  {'-'*70}\n  VERDICT: {sc['verdict']}   (score {sc['total']}/12)"
          f"\n           {meaning.get(sc['verdict'], '')}")
    for k in ("demand", "performance", "freshness", "winnability"):
        print(f"     {k:<12} {sc['scores'][k]}/3   {sc['why'][k]}")
    if sc.get("downgrade"):
        print(f"     !! {sc['downgrade']}")

    if d["angles"]:
        print("\n  NARROWER ANGLES people actually type (YouTube's own popularity order; no view\n"
              "  numbers attached — re-run this tool on one to measure it):")
        for o in d["angles"]:
            print(f"     {'[covered by existing videos]' if o['covered'] else '[uncovered]':<28} "
                  f"{o['q']}")

    thin = []
    if shorts and len(shorts) > len(year) / 2:
        thin.append(f"{len(shorts)}/{len(year)} results are Shorts — this topic mostly lives in a "
                    f"format this pipeline does not produce, so the views/day above are not a "
                    f"long-form benchmark")
    if len(year) < 8:
        thin.append(f"only {len(year)} videos in the 365d sample")
    if len(recent) < 5:
        thin.append(f"only {len(recent)} in the {a.recent} sample")
    if not sc["small_breakouts"]:
        thin.append("no rated small-channel breakouts, so winnability rests on absence of evidence")
    if ac["probe_failures"]:
        thin.append(f"{ac['probe_failures']} autocomplete probes failed")
    if sc["drift"] >= 0.3:
        thin.append(f"{sc['drift']*100:.0f}% of search results are off-topic "
                    f"({'scored on the on-topic subset' if sc['strict_on_topic'] else 'could not be isolated'})")
    print("\n  CONFIDENCE: " + ("LOW — " + "; ".join(thin) if thin else
                                "reasonable — every sub-score has a usable denominator"))
    print("  Autocomplete is the ONLY search-demand evidence here and it is ordinal, never a volume.\n"
          "  Everything from the Data API measures videos that exist, not people searching. Do not\n"
          "  quote a totalResults figure as 'people search for this'. The verdict is a rubric over\n"
          "  four heuristics — overrule it with a reason, but write the reason down.")


# ---------------------------------------------------------------- main

def main():
    ap = argparse.ArgumentParser(
        description="validate ONE video topic before producing it: demand, saturation, "
                    "freshness, winnability, verdict")
    ap.add_argument("--topic", help="the exact topic phrase, as a viewer would type it")
    ap.add_argument("--niche", help="niches/<id>.json — adds runtime context to the report")
    ap.add_argument("--recent", default="90d", choices=list(WINDOWS),
                    help="the 'is it fresh' window compared against 365d (default 90d)")
    ap.add_argument("--per", type=int, default=25, help="results per window (default 25)")
    ap.add_argument("--long-only", action="store_true", help="only videos >20 min")
    ap.add_argument("--no-alphabet", action="store_true",
                    help="skip the a-z long-tail expansion (26 keyless requests, ~5s)")
    ap.add_argument("--trends", action="store_true",
                    help="also try Google Trends (UNOFFICIAL endpoint, property=youtube, "
                         "frequently 429s — never gate a decision on it)")
    ap.add_argument("--json", help="write the full evidence bundle here (docs/research/...)")
    ap.add_argument("--from-json", metavar="PATH",
                    help="re-score a saved bundle with the current rubric (0 quota, 0 requests)")
    a = ap.parse_args()

    if a.from_json:
        with open(a.from_json, encoding="utf-8") as f:
            d = json.load(f)
        a.recent = d.get("recent_window", a.recent)
        d["assessment"] = score(d["autocomplete"], d["recent"]["rows"], d["year"]["rows"],
                                d["recent"]["total_results"], d["year"]["total_results"],
                                WINDOWS[a.recent], d["topic"])
        d["angles"] = adjacent_angles(d["autocomplete"], d["year"]["rows"], d["recent"]["rows"])
        print(f"  (re-scored {os.path.relpath(a.from_json, ROOT)} — no API calls, no quota)")
        report(a, d)
        return

    if not a.topic:
        raise SystemExit("need --topic (or --from-json)")

    niche_target = None
    if a.niche:
        p = os.path.join(ROOT, "niches", f"{a.niche}.json")
        if not os.path.exists(p):
            raise SystemExit(f"no niche profile: {p}")
        niche_target = json.load(open(p, encoding="utf-8")).get(
            "script", {}).get("target_minutes")

    print(f"  probing autocomplete (keyless, 0 quota)…")
    ac = autocomplete_demand(a.topic, alphabet=not a.no_alphabet)

    print(f"  querying YouTube Data API — estimated cost ~204 units of 10,000/day "
          f"(2 search @100, 2 videos @1, 2 channels @1)")
    yr_rows, yr_tot, yr_err = fetch_window(a.topic, 365, a.per, a.long_only)
    rc_rows, rc_tot, rc_err = fetch_window(a.topic, WINDOWS[a.recent], a.per, a.long_only)
    for e in (yr_err, rc_err):
        if e:
            print(f"  WARNING: {e}")

    d = {"topic": a.topic, "niche": a.niche, "niche_target": niche_target,
         "recent_window": a.recent, "long_only": a.long_only,
         "generated": dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds"),
         "autocomplete": ac,
         "year": {"rows": yr_rows, "total_results": yr_tot},
         "recent": {"rows": rc_rows, "total_results": rc_tot},
         "quota_units_used": 204}
    if a.trends:
        print("  trying Google Trends (unofficial; expect intermittent 429)…")
        d["trends"] = trends_youtube(a.topic)

    d["assessment"] = score(ac, rc_rows, yr_rows, rc_tot, yr_tot, WINDOWS[a.recent], a.topic)
    d["angles"] = adjacent_angles(ac, yr_rows, rc_rows)
    report(a, d)

    if a.json:
        os.makedirs(os.path.dirname(a.json) or ".", exist_ok=True)
        with open(a.json, "w", encoding="utf-8") as f:
            json.dump(d, f, indent=1, ensure_ascii=False)
        print(f"\n  -> {a.json}   (re-score for free later: --from-json {a.json})")


if __name__ == "__main__":
    main()
