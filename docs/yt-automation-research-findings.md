# YouTube automation research findings + multi-channel expansion plan

> **Reconstructed 2026-08-01.** The original research session (2026-07-31, done in a chat app, not via
> `tools/yt_research.py` — no `YOUTUBE_API_KEY` at the time) was **never saved to the repo**. Two niche
> files (`finance.json`, `real-estate.json`) reference "yt-automation-research-findings /
> multi-channel-expansion-plan" as if it existed. It did not. This file consolidates every fragment
> that survived inside other repo files, and marks what is lost.
>
> **If the original session is still in another app's history: paste it at the bottom of this file
> and reconcile.** Never let research live only in a chat session again — files or it didn't happen.

---

## 1. What the research concluded (surviving fragments)

### RPM / niche economics
- **Real estate: ~$15–30 RPM** (published 2026 data), **second only to finance**. Real estate was
  picked as the 5th channel explicitly for this. Source fragment: `niches/real-estate.json` → `_channel`.
- **Finance** is the #1 premium-RPM ad category; finance + real estate were deliberately paired as
  the portfolio's two premium-RPM channels, but **kept structurally distinct** (title/voice rules) so
  the portfolio doesn't sound like one channel in two skins. Sources: `niches/real-estate.json`,
  `niches/finance.json` → `_channel`, `audience`.
- **Home hacks (US, 45+): "high RPM"** per `niches/home-hacks.json` → `audience`. Exact figure lost.

### Content shelf life
- **Non-news finance content has the longest shelf life** of the researched niches — this is why the
  finance channel is framed as an evergreen reference ("The Money Archive") rather than news.
  Source: `niches/finance.json` → `_channel`.

### The 5-channel expansion decision (2026-07-31)
Scaled from 1 channel to a 5-channel portfolio in one session:
1. **home-hacks** — US home hacks / old-ways practical tips (the original channel).
2. **ai-news** — live channel "AI under3 Minutes" (@AIunder3min). Rapid AI/model-release news;
   positioning = turnaround speed + the under-3-min verdict. Full strategy: `docs/CHANNEL-SETUP.md`.
3. **entertainment** — stories / list-driven curiosity.
4. **finance** — calm-explainer personal finance. Name candidates from the 2026-07-31 strategy brief:
   *The Ledger Line*, *Plain Money*, *Compound & Co.*, *The Money Archive* (default pick).
   **Still not locked.**
5. **real-estate** — home buying/selling explainers. **Name not locked.**

2026-08-01 update: the 6th niche, `robotics-news`, was merged INTO `ai-news` as a second format
(`formats.compilation`) rather than a 6th channel — see EVOLUTION.md 2026-08-01 entry.

### Method notes (how the research was done)
- Finance niche was "built from a YouTube-growth coach's meta-commentary", **not from real
  finance-channel examples** — `niches/finance.json` → `_reference_titles_todo` flags this as a
  known weakness and orders a backfill via `yt_research.py` once `YOUTUBE_API_KEY` exists.
- A separate, properly-saved research pass on **what is working on AI channels** (2026-08-01, with
  named sources) lives in `docs/IMPROVEMENT-QUEUE.md` § "What is actually working on AI channels" —
  that one was done right.

## 2. What is LOST (recover only from the original chat session or re-research)

- The full RPM table across all candidate niches (only real-estate's figure survived).
- The growth-coach source(s) for the finance niche and cadence claims.
- The cadence/expansion schedule portion of the "multi-channel-expansion-plan" (2x/day per channel
  was floated — `docs/IMPROVEMENT-QUEUE.md` R6 flags it as physically unrealistic on one machine:
  ~9h compute/day for 10 videos).
- Whatever title/format pattern tables informed `entertainment` and `home-hacks`.

## 3. Standing rule produced by this loss

**Research is not done until it is a file in the repo.** Any research session — in any app, with any
agent — ends by writing its findings + sources into `docs/` (or the project's `work/research.md`)
before the session closes. Tool-based research (`yt_research.py`) already writes JSON output by
design; chat-based research has no such safety net, so the write-down is a manual, mandatory step.
This file existing at all is the proof of why.

## 4. Live `yt_research.py` backfill, all 5 niches (2026-08-02)

`YOUTUBE_API_KEY` went live 2026-08-02 (see EVOLUTION.md same date for the setup story). First real
backfill run across all 5 niches, done intentionally rather than with the tool's generic
`--niche <id>` auto-query (which just searches the niche's one-line category description — weak
signal until `reference_titles` has real entries to seed it, see §5 below). Instead: hand-picked
2-4 search phrases per niche from its actual content pillars/title formula, `--long-only` for the
four long-form channels (their real target format), no length filter for ai-news (its format is
short/medium and `--long-only` would misrepresent it). Raw output: `docs/research/<niche>.{json,txt}`.
Per-niche titles + notes were written directly into each `niches/<id>.json` as `reference_titles` +
`_reference_titles_source` — this section is the cross-niche synthesis that doesn't belong in any
one niche file.

### Reconciling against §1's claims

- **"Non-news finance content has the longest shelf life"** — partially held up, partially in
  tension. On-target evergreen mechanism-explainer queries (401k fees, mortgage points, credit
  score) pulled genuinely low views/day in the 30d window (single digits to low hundreds) — a real,
  less-crowded lane, but also a real ceiling. The one breakout hit found (577K views/90d) was a
  reactive, politically-framed "Trump replaced the 401k" angle — which is exactly the pattern this
  niche's `honesty_guard` and evergreen positioning correctly rule out. Read this as: the channel is
  trading peak virality for durability and compliance safety, not failing to find the virality.
  That's a real tradeoff, not a research gap — worth being honest about if the user ever asks why
  finance isn't growing as fast as home-hacks.
- **"Real estate ~$15-30 RPM, home-hacks 'high RPM'"** — not verifiable from the YouTube Data API
  (it has no revenue data), so this claim is still resting on the original growth-coach source,
  which is lost per §2. Not contradicted by anything found today, just still unconfirmed independently.
- **Point-of-view beats a summary (already in `docs/IMPROVEMENT-QUEUE.md`)** — strongly
  RE-CONFIRMED on ai-news's own live data: every real top-vpd title pulled today is a blunt opinion
  ("is a freak", "About To Pop The AI Bubble", "Forget NVIDIA"), zero neutral descriptions. This is
  now confirmed twice, independently, a week apart.

### New finding not in any prior research: a runtime ceiling mismatch

Four of five niches came back with real winning-video runtimes noticeably ABOVE their niche file's
current `target_minutes` ceiling:

| Niche | Current target_minutes | Real 30d/365d median found | Real p75 |
|---|---|---|---|
| home-hacks | [12, 30] | ~25-27 min | 31-33 min |
| finance | [15, 25] | ~26 min | 28-39 min |
| real-estate | [15, 25] | ~33 min | 49-53 min |
| entertainment | [10, 30] | ~44-51 min | 71-95 min |
| ai-news | [3, 10] (hard max 12) | ~15 min (all AI content, not channel-specific) | 29 min |

home-hacks and finance are close enough to be inside or just above range already. Real-estate and
especially entertainment show a real gap - actual winners in "unresolved mystery / true story" and
"home-buying mistakes" run much longer than currently planned. **This is a proposal for the user to
weigh, not a change made here** — CLAUDE.md's standing rule is that runtime is always proposed and
confirmed per video, never assumed, and widening a niche's default range is a real production-cost
decision (a 50-min video costs meaningfully more render/compute time than a 20-min one, see
`docs/IMPROVEMENT-QUEUE.md` R6 on cadence reality).

## 4b. Outlier analysis across all 5 niches (`yt_viral_analyze.py`, 2026-08-02)

Second pass, same day, ranking by **views ÷ the channel's own subscriber count** instead of raw
views/day. 365d window, `--per 50`, `--long-only` for the four long-form niches. Raw data:
`docs/research/<niche>-viral.json`. Re-analysable with zero quota via `--from-json`.

**Why this ranking exists:** views/day surfaces big channels. The real-estate video that ranked #1 in
§4 (481K views) scores **1.4x** — its channel's ordinary week — while that niche's true outlier is a
9,240-view video on a 1,580-sub channel at **5.8x**. Raw views teach you what big channels do; the
multiplier tells you what the algorithm chose to *push*.

### Breakout density — the biggest strategic finding

| Niche | Qualifying | Breakouts (≥2x) | **Breakout rate** | Top multiplier | Breakout runtime (median) |
|---|---|---|---|---|---|
| **entertainment** | 118 | 72 | **61%** | 108x | 52 min |
| **ai-news** | 191 | 57 | **30%** | 266x | 11 min |
| **home-hacks** | 84 | 28 | **33%** | 34x | 26 min |
| **real-estate** | 32 | 4 | **12%** | 5.8x | 46 min |
| **finance** | 10 | 1 | **10%** | 2.0x | 24 min |

**Entertainment and home-hacks are where breakout is normal; finance and real-estate are where it is
rare.** Finance returned only 10 qualifying videos from 4 queries — 28 more were excluded for
under 1,000 views, i.e. most on-topic long-form finance content simply does not travel. This does
**not** mean drop those niches: they were picked for **RPM**, not reach (§1), and a 10%-breakout
niche at $15-30 RPM can still beat a 61%-breakout niche at $2. But it does mean **expectations should
differ per channel**, and effort spent chasing virality in finance/real-estate has a much worse
return than the same effort in home-hacks. Plan cadence accordingly.

### Levers that correlate with breaking out

Only levers with a usable denominator are worth repeating. `(thin)` = under 8 videos = directional.

- **home-hacks** — `dollar-anchor` **53% (10/19)** vs a 33% baseline is the strongest well-powered
  signal found anywhere in this pass, and it **independently validates the niche file's existing
  "cheap number anchor" title formula**, which was written from a growth-coach's advice rather than
  data. `contrarian` 45% (5/11) also clears baseline. `authority-borrow` (the Amish/grandma framing)
  sits *at* 31% vs 33% baseline — it is **table stakes in this niche, not an edge**, which is a
  genuinely useful correction: it is necessary to compete but does not differentiate.
- **entertainment** — `curiosity-gap` 60% (12/20) and `personal-frame` 47% (7/15) against a 61%
  baseline; both effectively at-or-below baseline, meaning this niche's breakouts are *not* explained
  by title lever at all. With a 61% baseline the topic and thumbnail are doing the work — consistent
  with the niche being story-driven.
- **ai-news** — `time-anchor` 32% (11/34) and `personal-frame` 33% (7/21) modestly clear a 30%
  baseline. `listicle-count` **0% (0/4)** is the only clean negative.
- **real-estate / finance** — every lever number is thin (denominators 3-8). **Do not act on these.**

### Two bugs in the tool, found by reading the output rather than trusting it

1. **`caps-shout` matched 100% of titles in all five niches.** Cause: every lever regex was evaluated
   with `re.I`, so `[A-Z]{3,}` matched any three-letter word. It padded every lever table with a
   meaningless row that looked like a finding. Fixed (case-sensitive, 4+ chars); the report now also
   flags any lever matching ~all rows as "no signal" so this class of error is visible next time.
2. **Non-Latin-script titles polluted the entertainment set** — the two highest multipliers (115x,
   96x) were Hindi-market content whose numbers do not transfer to a US English channel. Added
   `--en-only`. **Note the honest limit:** it filters *script*, not *market* — an Indian true-crime
   channel writing in English still passes, and only a human eye catches that.

Both corrections were applied by re-analysing the saved JSON offline (`--from-json`), costing no
additional API quota.

## 5. Tooling note for next time

`yt_research.py --niche <id>` auto-builds its queries from `n["name"]` (a category description) plus
up to 2 of the niche's existing `reference_titles`. Before today, most niches had no
`reference_titles`, so `--niche` alone gave weak signal (confirmed on finance: `--niche finance`
returned 0 useful videos, see EVOLUTION.md 2026-08-02). Now that all 5 niches carry real
`reference_titles`, `--niche <id>` should self-improve on the next run since it folds 2 real titles
into its query automatically. Still worth hand-crafting `--query` for a genuinely new angle rather
than relying on the auto-query alone — it only ever pulls from what's already in the file.
