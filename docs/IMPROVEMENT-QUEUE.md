# Improvement queue — standing rules + open backlog

Opened 2026-08-01, after `gpt56-price-cut` (the first video uploaded to a live channel).

**What this file is:** the running list of things that must get better, and the reasoning behind the
standing rules now enforced in `CLAUDE.md` → *GROWTH RULES*. Rules that are DONE live in CLAUDE.md
and the niche JSONs (that is what makes them automatic). This file holds the **why**, plus the
**not-yet-done** backlog so it does not get re-derived from scratch every session.

**How to use it:** read the OPEN section before starting a video. Move an item to DONE only when the
change is actually landed in a file the pipeline reads, not when it is merely understood.

---

## DONE — now enforced automatically

| # | Rule | Enforced in |
|---|---|---|
| G1 | Mid-roll subscribe CTA at ~40-60% + close CTA | `CLAUDE.md` Growth Rules #1; `niches/ai-news.json` → `script.structure.evidence` |
| G2 | Open a true retention loop in the first 30s, pay it off late | `CLAUDE.md` #2; `niches/ai-news.json` → `script.structure.cold-open-claim` |
| G3 | 2-3 real captured screenshots on screen, not only code-rendered cards | `CLAUDE.md` #3; `niches/ai-news.json` → `script.structure.evidence` |
| G4 | Never claim a team/staff/capability that does not exist | `CLAUDE.md` #4 |
| G5 | Script gate only — then run to a finished, checked master in one pass | `CLAUDE.md` #5 |
| T1 | `check_deliverable.py` no longer false-negatives the music bed on `-scored.mp4` | `tools/check_deliverable.py` |
| S1 | bake: stream-copy concat (was a second full re-encode) + parallel segments + QSV probe | `tools/bake.py` |
| S2 | bake: content-hash segment cache — a one-beat edit re-renders one segment, not the video | `tools/bake.py` (`--fresh` forces full) |
| S3 | Remotion previews render at scale=1 + `x264Preset veryfast` (was scale=2/medium = 4x wasted pixels; `--scale=2` kept for 4K finals) | `remotion/scripts/render-all.mjs` |
| S4 | Caption burn + master + proxy encode with the QSV probe (was hardcoded libx264 / dead nvenc) | `tools/gen_captions_ass.py`, `make_master.py`, `make_proxy.py` |
| S5 | TTS chunks + stock downloads parallelized (3 and 4 workers) | `tools/tts_edge.py`, `tools/fetch_stock.py` |
| R2 | `YOUTUBE_API_KEY` live (2026-08-02) + first intentional research backfill across all 5 niches (`reference_titles` populated, `_reference_titles_todo` flags resolved on finance/real-estate) | `.env`, `niches/*.json`, `docs/yt-automation-research-findings.md` §4-5, `docs/research/*.{json,txt}` |
| B1 | **`build_longform.py` emitted an invalid ffmpeg filter** (`vignette=…:strength=`) — no such option, so EVERY beat render failed on the default grade path. Introduced with the R8a grade feature 2026-08-01, would have broken the next long-form video outright | `tools/build_longform.py` |
| R7a | Long-form beat cache — content-addressed `seg-<hash>.mp4`, survives between runs. Measured: 6.4s→1.4s warm, and a one-image edit re-renders 1 of 6 beats instead of all 6. `--fresh` to bypass | `tools/build_longform.py` |
| P1 | Packaging skill's "Test & Compare is thumbnail-only" rule was **factually wrong** since YouTube's Dec 2025 title-testing rollout; also now states the winner is decided by **watch time, not CTR** | `.claude/skills/packaging/SKILL.md`, `references/ab-testing.md` |
| V1 | `yt_viral_analyze.py` — ranks by **views ÷ subscriber count** (true outliers) instead of raw views/day, decomposes breakout titles into levers, reports per-lever lift | `tools/yt_viral_analyze.py` |
| V2 | **Topic-level validation before production** (2026-08-03) — a validated *niche* never validated the *topic*, so a 32-min real-estate video shipped on "closing costs" with no evidence about closing costs. `validate_topic.py` gates on autocomplete demand + saturation + freshness + small-channel winnability and returns GO / GO-NARROW / CROWDED / WEAK / NO-AUDIENCE / NO-DEMAND | `tools/validate_topic.py`, `CLAUDE.md` → RESEARCH BEFORE WRITING |
| R10 | Runtime ranges widened to the researched reality — entertainment [10,30]→**[25,50]** (default 40 min), real-estate [15,25]→**[20,40]** (default 33 min), on the user's call 2026-08-02. Personas raised in lockstep. CLAUDE.md's obsolete global "20 typical / 25 max" replaced with a per-niche table | `niches/entertainment.json`, `niches/real-estate.json`, `channel-persona.{entertainment,real-estate}.json`, `CLAUDE.md`, `tools/plan_runtime.py` |
| U1 | **Found 2026-08-06: all 18 finished videos across all 4 channels were still `privacy: "private"`**, some for weeks — zero of the GROWTH RULES had ever had a chance to act, because nothing was visible to anyone outside the account. Root cause of the flat subscriber counts across every channel; not a content problem. `yt_upload.py` now writes `packaging/published.json` (videoId, url, uploaded_at) after every upload so this state is checkable without scrolling terminal history | `tools/yt_upload.py`, `CLAUDE.md` → GROWTH RULES intro |
| G8 | Golden-format tracking — `tools/track_performance.py` (`tag`/`report`/`list`) logs each video's hook/evidence/title/thumbnail-lever/journey-framing choices, joins them to real `yt_stats.py` numbers once public, and ranks which format values are actually winning per niche (flags thin samples, same convention as `validate_topic.py`) | `tools/track_performance.py`, `docs/research/format-log.json`, `CLAUDE.md` → GROWTH RULES #9 |
| G9 | Cross-linking and selective journey-framing added as standing rules — verbal + description + end-screen link between topically-connected videos on the same channel; "documenting the journey" framing scoped to channels whose voice supports it (home-hacks) rather than forced onto authority-voice niches | `CLAUDE.md` → GROWTH RULES #8, #10 |

| G10 | `/clip-to-shorts` — long-form → weekly Shorts pipeline. `tools/clip_to_shorts.py` (render/package, reused from long-form transcript + master) grounded against YouTube's real reused-content/inauthentic-content monetization policy (support.google.com/youtube/answer/1311392) so Shorts stitch/loop/hook-text rather than bare-cut; redirect stack documented (Related Video Studio step confirmed via support.google.com/youtube/answer/14075157 — no API for it, target must be public first) | `tools/clip_to_shorts.py`, `.claude/skills/clip-to-shorts/SKILL.md`, `CLAUDE.md` → cadence rule Shorts carve-out |

| U2 | **2026-08-06 batch audit: 6 of 12 "ready" videos had a real, publish-blocking defect** — 2 with wrong stock images/b-roll composited under correct filenames (root cause: the "eyeball the contact sheet" step got skipped, not a render/cache bug — that hypothesis was checked and refuted), 2 with the video track ending 43-50% before the audio track (previously undocumented), 1 with almost no visuals for most of its runtime, 1 whose master was never actually rendered despite `publish.json` claiming ready. `check_deliverable.py`'s existing A/V-duration check would have caught the truncation bugs, but nothing enforced that the gate ever ran | `tools/check_deliverable.py` (writes a hashed pass receipt), `tools/yt_upload.py` (refuses to upload without a matching receipt; `--skip-deliverable-check` opts out for layouts the gate doesn't cover, e.g. Shorts) |

**Still open from this pass:** the analytics OAuth (`core/.youtube/token-analytics.json`) has never
been run, so `track_performance.py report` has no real numbers to rank yet — needs one interactive
`python tools/yt_stats.py auth` from the user. And the 18 private videos are still private as of this
writing; the channel owner chose to review titles/thumbnails in Studio and publish them personally
rather than have this pass flip them automatically.

Measured 2026-08-01 on the audit's numbers (EVOLUTION encoder table: QSV ~4x libx264): short-form
~55 min -> ~30-35 min, 20-min long-form ~35-40 -> ~25-28 min. Verified by synthetic-timeline bake
test (QSV encode, cached re-run, pixel-checked cutaway + punch frames). Still open: fold the caption
burn into an encode the pipeline already pays for (needs pipeline-order care), shared Puppeteer
instance across Remotion shots, per-video bed-level helper (R5).

---

## OPEN — do these next

### R1. Real evidence on screen (highest value, user-identified)
`gpt56-price-cut` shipped with **zero real screenshots** — every visual was a code-rendered card.
For a channel whose whole differentiator is *sourced numbers*, that is the biggest single weakness in
the current output. Cards look clean; they do not look **evidenced**.

- Build a reusable `EvidenceCard` shot: real screenshot + source label + a highlight box that lands
  on the exact figure being spoken. `remotion/src/lib/browser.tsx` and the `/review-site` skill's
  `EvidenceBrowser` already do most of this — promote it into the shared kit.
- Capture during Stage B and **actually wire captures into `timeline.json`**. On this video the
  VentureBeat table *was* captured and then never used. Capturing is not the deliverable; showing it is.
- When a primary source is un-capturable (Cloudflare/paywall/login), say so on screen and cite the
  secondary. Never silently substitute a card for missing proof.

### R3. Thumbnail A/B/C is authored but never measured — **tracking now exists, data still needed**
**2026-08-02:** `tools/ab_test.py` now records the variant set, the lever each bet pulls, and what
YouTube reported (Winner / Performed Same / Inconclusive), with `report --niche` rolling up winning
levers across videos. `.claude/skills/packaging/references/ab-testing.md` documents the real rules.
The tool cannot *start* a test — the Data API has no A/B endpoint, so that stays a manual step in
desktop Studio. **What is still open is the original point:** no results exist yet, so packaging
rules are still running on inherited priors. Threshold for rewriting them from own data remains ~10
completed long-form tests. Original entry follows.

Three bets get rendered every video and one is picked by hand. Nothing reads the result back.
After ~10 long-form uploads, run `/packaging`'s `channel-calibration.md` against real CTR so the
packaging rules get rewritten from this channel's own click data instead of general priors.

### R4. Publishing is still manual, and the API cannot fix it yet
Uploads land as private drafts — partly by design, partly forced: an **unaudited** Google Cloud
project cannot publish public from the API at all. To schedule public directly (`publishAt`), the
project must pass YouTube's one-time **API Services Audit**, which takes days to weeks. Worth
starting now if hands-off publishing is the goal; nothing else unblocks it.

### R5. Music-bed level must be derived per video, not inherited
The `-27 dB` target was validated on a video whose speech gaps were digital silence. Faster reads
with short gaps need a hotter bed (this video wanted ~-21 dB). Encode this as a helper —
`measure gap floor → set bed gain` — instead of a fixed number, so it stops costing 2-3 re-mixes.
See the EVOLUTION entry for the measurements.

### R6. Cadence reality check before promising 2×/day on 5 channels
This video took **~55 min of wall clock** on free tooling, most of it Remotion render + caption burn.
10 videos/day is ~9 hours of compute on one machine before any judgment time. Options, cheapest first:
(a) cut shot count / reuse shot templates so renders shrink; (b) batch renders overnight;
(c) start at **1×/day on 1-2 channels** and only scale cadence once a channel shows retention.
Do not commit to a schedule the pipeline cannot physically hit — an abandoned schedule reads worse
to the algorithm than a slower consistent one. **Update 2026-08-01: the S1-S5 speed batch (DONE
above) cuts this roughly in half; the math still doesn't support 10/day on one machine.**

### R7. ChatCut-style editability — the output must stay easy to change after generation
User direction 2026-08-01 (reference product: chatcut.io): a generated video should be re-editable
without a full re-run — change a beat, a word, a card, and re-render only what changed.
**Landed so far:** bake's content-hash segment cache (S2) — editing one shot/beat costs one segment
+ a stream-copy concat; the director's invalidation graph already re-runs only downstream stages.
**Still missing:** (a) long-form beat cache in `build_longform.py` (it re-renders all Ken Burns
beats on any change — same hash pattern as bake applies); (b) transcript-level editing (change the
script text, get a new cut — ChatCut's core loop); (c) a single "re-deliver" command that takes a
finished project + a change note and runs exactly the affected stages. This is the difference
between a video FACTORY and a video EDITOR, and it is what makes iteration on quality cheap.

### R8. Engagement upgrades (user-identified 2026-08-01, audit-backed)
(a) **Backgrounds**: every channel video uses one navy backdrop (`RMBg`); long-form has no background
system at all — yet `remotion/src/lib/vibes.tsx` (11 vibes) + `atmosphere.tsx` (10 FX layers) exist
and only demos/ads use them. **DONE 2026-08-01:** `tools/build_longform.py` now reads an optional
`grade` object from beats.json (vignette/grain/tint, data-driven from niche JSON `images.grade`),
applied in the Ken Burns filter chain (zero extra encode passes). `--no-grade` disables.
`make-tsx/SKILL.md` now instructs new channel beats to prefer `<VibeBg>` over `RMBg`.
(b) **Static cards**: long-form stat cards are frozen PIL PNGs. **DONE 2026-08-01:** `SpecCard`
composition (`remotion/src/shots/brand/SpecCard.tsx`) renders animated stat/compare/quote cards via
VibeBg + slam/pop/rise animations; `render-cards.mjs` renders cards.json → mp4; `build_longform.py`
accepts `.mp4` beat images (trims to beat duration, scales to fit, encodes to match other segments
for concat/xfade). Pipeline: `gen_spec_cards.py` → `render-cards.mjs` → `build_longform.py`.
(c) **Voice**: the director hardcoded Andrew@1.0x and ignored `channel-persona.<niche>.json`
(voice_id + 1.15x breaking-news mode); edge-tts pitch/volume never exposed. **DONE 2026-08-01:**
`director/engine.py` now reads `voice_id`/`tts_speed`/`tts_pitch_hz`/`tts_volume_pct` from the
persona (verified: gpt56-price-cut resolves to Andrew @1.15x); `tts_edge.py` gained
`--pitch-hz`/`--volume`; ai-news persona carries `tts_speed: 1.15` + a user-approved A/B instruction
(BrianNeural vs Andrew on the next video, `_voice_ab_next`).
(d) **Evidence gate**: gpt56-price-cut captured real screenshots and shipped with zero on screen.
**DONE 2026-08-01:** `tools/check_deliverable.py` now FAILS a generated video with < 2 real
screenshots on screen (timeline `Evidence*` shots / beats referencing evidence files), flags
declared-but-uncaptured and captured-but-stale-manifest assets, and new specs carry
`evidence.required` via `video_spec.py`. Verified against gpt56-price-cut: the gate now fails its
shipped master with exactly the right message.

### R9. Free-first second-opinion reviewer (user-approved 2026-08-01)
Build `tools/llm_review.py`: provider-agnostic (env keys, free/local providers first, NO paid
dependency — keeps the $0 rule), reviews script + packaging + spot frames against the niche's
honesty/growth rules, writes `work/review.md`. Files-first so any agent app can run it; NOT an
MCP server (MCP configs are per-app, which breaks the portability rule).

### R11. Search-VOLUME is still missing — the one thing `validate_topic.py` provably cannot measure
Investigated 2026-08-03 while building `tools/validate_topic.py`. **The YouTube Data API has no
search-volume endpoint at all** — every number it returns is engagement on videos that already exist,
and `search.pageInfo.totalResults` counts *videos*, not searches (it also saturates at 1,000,000, so
a "1,000,000" reading means "very many", not a count — verified empirically). The tool's only genuine
demand signal is YouTube autocomplete, which is real but **ordinal**: it tells you a phrase is typed
often enough to be suggested after N characters, never how many times. Four ways to close that gap,
in priority order. **Each needs a human decision — do not sign up for anything without asking.**

1. **Google Trends official API (alpha)** — best option, free, $0, and it is the only one that gives
   a defensible *trend over time*. Announced July 2025, still an **application-gated alpha** as of
   Aug 2026 with a queue most applicants never clear
   (https://developers.google.com/search/apis/trends). Gives interest-over-time (5 years, daily to
   yearly, geo-restrictable) and related queries. **Action: apply.** The application asks what you
   will build; say "topic validation for a multi-channel YouTube pipeline, running today, will give
   feedback" — Google states it prioritises applicants who are specific and already building.
   Cost: free. Effort: one form. Risk: may simply never be granted.
2. **Google Trends unofficial endpoint** — already wired in behind `validate_topic.py --trends`,
   off by default. It works and it supports `property=youtube`, i.e. genuine YouTube-search
   interest, not web search. Verified 2026-08-03: the NID-cookie bootstrap succeeds and the
   timeseries returns, **but roughly half of calls come back HTTP 429** and the index is mostly noise
   for low-volume terms (two unrelated finance/home queries both returned an identical 6.62 ratio off
   near-zero means — a quantisation artefact, not a finding). Undocumented, unsupported, can break
   without warning. Cost: $0. **Never gate a decision on it alone**; treat a reading as one weak vote.
   `pytrends` is *not* installed and is not worth adding — it wraps the same rate-limited endpoint.
3. **vidIQ / TubeBuddy** — both quote a "search volume" number, which is the thing missing here, but:
   **neither publishes a public developer API**, both are browser-extension-first (vidIQ: Chrome +
   mobile; TubeBuddy: Chrome/Firefox/Safari/Edge inside YouTube Studio), so **nothing here can be
   automated into this pipeline** — it is a human opening a browser and reading a number. Free tiers
   exist but are throttled to roughly the point of uselessness for batch work: TubeBuddy free caps
   Keyword Explorer at ~3 searches/day; vidIQ free gives 150 AI credits/month. Paid entry is
   TubeBuddy Pro ~$3/mo billed annually, vidIQ Boost ~$16.58/mo billed annually. **And their volume
   figures are modelled estimates, not YouTube's real query counts** — they have no more access to
   YouTube's search logs than this repo does. **Recommendation: do not buy either for automation.**
   TubeBuddy Pro at ~$36/yr is defensible only as a manual sanity-check on a handful of topics, and
   it breaks the $0 rule. Decide deliberately, don't drift into it.
4. **YouTube autocomplete — already exploited, and it is free.** `suggestqueries.google.com` with
   `ds=yt` needs no key, no auth, no quota; verified working 2026-08-03. `validate_topic.py` already
   probes prefix-depth, suggestion rank, and an a–z long-tail expansion. There is no more volume to
   extract from it than is already being extracted — this line exists so nobody re-researches it.

Known weaknesses inside the tool itself, for whoever improves it next: the drift check is **lexical**
and cannot see synonyms (it calls "Kill Every TICK In Your Yard" off-topic for "how to get rid of
ticks in your yard"), and the four sub-scores are a hand-set rubric, not a fitted model — no video's
actual outcome has ever been fed back into it. The correction loop that would fix that is R3
(thumbnail/title A/B data, still uncollected).

---

## What is actually working on AI channels (research, 2026-08-01)

From reviewing the current fast-growing AI channels and 2026 retention guidance. Sources at the
bottom. **Adopt the method, never copy a specific title, thumbnail or script.**

- **A point of view beats a summary.** The fastest-growing AI channel cited (Nate Herk, 0→230K in
  nine months) wins on being *fast and opinionated* — telling viewers what a release means, not just
  what happened. Our `verdict` beat already does this; keep making it the loudest part.
- **The first 15 seconds decide everything.** Named retention killers: weak opening, long setup
  before value, padding, and **no re-engagement beat past 50%** — which is exactly what G1's mid-roll
  and G2's loop are for.
- **Comments > likes** as an algorithm signal, because they show sentiment and depth. Our close asks
  a specific, answerable question ("which model are you switching to") rather than a generic
  "let me know what you think" — keep that pattern.
- **Return-viewer rate above ~10% is the marker of a real audience** rather than one-off traffic.
  That favours a recognisable repeated format (same voice, same beat structure, same promise) over
  chasing a different style each video. Our persona files already lock this in — do not drift.
- **CTR, retention, and session impact are the three levers.** Packaging (R3) drives the first,
  structure drives the second, and the third argues for ending on a next-video tease once a channel
  has a back catalogue worth sending people to.

Sources: [17 AI YouTubers, ATAK Interactive](https://www.atakinteractive.com/blog/17-ai-youtubers-were-actually-watching-right-now) ·
[Mastering YouTube Audience Retention 2026](https://beyondcomments.io/blog/audience-retention) ·
[YouTube Retention Benchmarks 2026](https://prepublish.ai/guides/youtube-retention-guide) ·
[YouTube Algorithm 2026](https://www.ibuildinfluence.com/blog/youtube-algorithm-2026-how-to-get-more-views)
