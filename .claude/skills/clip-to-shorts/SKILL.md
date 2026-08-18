---
name: clip-to-shorts
description: Turns a finished long-form video into vertical YouTube Shorts that drive viewers back to it — remixed, not just re-cut, so they hold up under YouTube's own reused-content policy. Use when the user wants to "clip this video", "make shorts from this", "turn this into shorts", "repurpose the long-form", asks for a weekly Shorts batch off an existing video, or wants a Short that redirects to its full-length source. Covers: the YouTube policy reason a bare cut is risky, picking moments (this session's own creative call, not automated), the remix/stitch/loop techniques that make a Short its own piece, the 60s floor, the redirect stack (Related Video Studio step + description + pinned comment + verbal callout), and the render/package/upload handoff via `tools/clip_to_shorts.py` + `tools/yt_upload.py`. Not for producing the original long-form video (that's /make-video, /prompt-to-video, /clean-cut → /make-tsx) and not for packaging a long-form's own title/thumbnail (that's /packaging, long-form only).
---

# Clip-to-Shorts

Set 2026-08-06 at the channel owner's explicit request, after he researched this himself and asked
for it to be durable — any future session (or a different agent entirely) that gets asked to "make
me a short of this video" should land here and get the full picture, not reinvent a bare cut.

## Why this isn't just "cut a clip and upload it"

YouTube's actual monetization policy (confirmed against `support.google.com/youtube/answer/1311392`,
2026-08-06) calls content **"reused"** — ineligible or demonetized — when it's *"repurposed content
... without adding significant original commentary, substantive modifications, or educational or
entertainment value,"* and the bar is explicit: **"viewers can tell that there's a meaningful
difference between the original video and your video."** A Short that is just `ffmpeg -ss X -to Y`
off the long-form master, nothing added, is the textbook failure case — even though it's your own
footage, a channel of nothing-but-bare-cuts reads exactly like the "little or no narrative" example
the policy names. 2026 sources on this policy (its 2025 rebrand to "Inauthentic Content") also flag
a **"replaceability" test** — if the value a viewer gets is indistinguishable from just watching the
source, the channel is at risk regardless of who owns the footage.

**The fix is cheap and it's also what makes Shorts perform better anyway**, which is why this isn't
a compliance tax: a fresh hook line up top, a stitched structure that only exists in the Short, and
a loop-friendly ending are simultaneously (a) the "substantive modification" the policy wants and
(b) exactly what YouTube's own 2026 Shorts algorithm rewards — see the Virality section below. Doing
this right serves both goals with the same edit; there is no tradeoff to manage.

## The flow

### Stage 1 — Pick the moments (creative, done by whoever is running this — never automated)

Read the long-form video's own `work/script.md` / `work/edited-transcript.json` /
`work/timeline.json` end to end. This is the same taste-driven read `/packaging` and the script
rules already assume — a tool cannot judge which 45 seconds are the strongest, only a read of the
actual content can. Look for:

- **The retention-loop payoff** (GROWTH RULE #2 in the root `CLAUDE.md`) — the moment the long-form's
  own cold open promised. It's usually the single best Short on its own.
- **A cost-callout or surprising-number beat** (GROWTH RULE #7) — the "wait, am I being cheated?"
  moment reads just as hot at 45 seconds as it does inside 20 minutes.
- **A myth-bust or contrast** — "you think X, it's actually Y" is a complete narrative in one breath,
  which is exactly the shape a Short needs.

Prefer **5 clips per long-form video**, spread across a week rather than dropped at once (see
Cadence below). Don't force a 6th if only 4 moments are genuinely strong — a weak Short still counts
against the channel's "reused content" and "inauthentic content" signals; skip a slot rather than
pad it.

**Watch for TTS header leaks in the master's spoken audio.** Some long-forms' `script_spoken.txt`
contained `## Phase 1/2…` markdown headers and the TTS read them out loud — they are real spoken
words in the master (grok-imagine-image-2 spoke "Phase 1: The 3-Minute Verdict" at 1.07–2.63s and
"Phase 2: Evidence, Limits, Close" at 175.57–176.02s) and would land as nonsense captions + audio in
a clip that starts or ends there. When a proposed clip boundary is near a section change, grep the
long-form's `work/edited-transcript.json` for the words just before/at that timestamp and trim the
boundary past them (start the first clip after ~2.6s, end before the second header). Same check the
`check_deliverable.py` runtime/spec FAILs deserve on Shorts: those two gates are long-form-only, so
upload Shorts with `--skip-deliverable-check` — the tool's own error message names exactly this case.

**Decide, per clip, whether it's a single window or a stitch.** A stitch — the cold-open hook at
0:30 spliced directly to the payoff at 8:10, cutting everything between — is usually the stronger
Short: it's inherently transformative (that sequence never played that way in the long-form), and it
front-loads both the hook and the payoff into a runtime a swipe-feed viewer will actually finish.
Reach for a stitch whenever the strongest hook and the strongest payoff aren't already adjacent in
the source.

### Stage 2 — Author `videos/<project>/work/shorts-plan.json`

This is the deliverable of Stage 1 — the plan `tools/clip_to_shorts.py` renders from. Full schema is
documented in that tool's own module docstring (read it before authoring a plan; it's the source of
truth, this file explains *why*, that file explains the exact JSON keys). In short, per clip:

- `start`/`end` **or** `segments: [...]` (2+ windows) for a stitch.
- `title`, `description`, `tags` — write these fresh for the Short. Never reuse the long-form's own
  title verbatim; a Short's title has ~1 second of attention, front-load the hook word.
- `hook_text` (optional but strongly default-on) — a bold on-screen line for the first ~1.5-2s that
  does **not** appear anywhere in the source long-form. This is the single cheapest "substantive
  modification" available and it is also the mandatory 3-second hook every Shorts algorithm guide
  names as the top retention lever. Skip it only when the clip's own opening line is already a
  strong enough spoken hook that a redundant text card would just repeat it.
- `loop` (optional) — set `true` when the clip's content supports a rewatch (a punchline, a reveal, a
  before/after) rather than a linear explainer that reads as "finished" at the end. See Virality
  below for why this matters; see the tool's docstring for what the mechanical crossfade actually
  does and its limits — a genuinely seamless loop still comes from picking a clip whose first and
  last beats already rhyme, the crossfade is an assist, not a substitute for that choice.

**Hard floor: every clip must be ≥60 seconds**, end to end including any loop tail — this is the
channel owner's explicit standing instruction, not just a Shorts-algorithm optimum (current
third-party data on this puts 30-60s as the dominant band and 30-45s as a frequently-cited sweet
spot, which would argue for going shorter — override that with the 60s floor every time; a stitched
structure exists partly to make 60s+ still feel tight rather than padded). Sanity-check total runtime
against the stitched segments + any loop tail before rendering, not after.

### Stage 3 — Render

```
venv/Scripts/python tools/clip_to_shorts.py render <project>
venv/Scripts/python tools/clip_to_shorts.py render <project> --clip 03   # one at a time
venv/Scripts/python tools/clip_to_shorts.py list <project>               # status, no ffmpeg cost
```

**Watch every render before packaging it.** The reframe (blurred-fill 16:9→9:16), the caption
placement (must clear the bottom ~20% Shorts UI rail), the hook-text card, and the loop seam are all
things a checksum can't verify — this is the same "open every render before you surface it"
discipline `/packaging`'s Thumbnail Checklist already enforces. Squint-test on a phone-width preview
if anything looks tight.

### Stage 4 — Package + the redirect stack

`clip_to_shorts.py` already writes a `shorts/<id>/packaging/publish.json` in `tools/yt_upload.py`'s
exact schema — upload it the same way as any long-form video:

```
venv/Scripts/python tools/yt_upload.py upload videos/<project>/shorts/<id>/packaging/publish.json
```

Lands as a private draft, same as everything else in this pipeline (see root `CLAUDE.md` →
Providers). The redirect back to the long-form is **four layers, only one of which is manual**:

1. **Verbal callout in the script** — written into `title`/`description`/`hook_text` at Stage 2, or
   spoken in the clip itself if the source footage already has a natural line for it ("full
   breakdown's linked"). Automatic once authored.
2. **Description's first line** — automatic, part of the plan.
3. **Pinned comment** — not yet automated (no pipeline tool posts comments); leave a note in the
   render summary for the human step, same spirit as the Related Video reminder below.
4. **YouTube's native "Related Video" link** — a real, clickable chip below the channel handle,
   confirmed via `support.google.com/youtube/answer/14075157`. **Studio-only, no API.** Steps:
   Studio → Content → open the Short → **Related Video** → pick the long-form video from this
   channel → Save. Requires "Advanced features" access on the channel (same gate as A/B title
   testing, see `/packaging`). **The target long-form video must already be public or unlisted** —
   this step is impossible while it's still a private draft, so sequence uploads: publish the
   long-form first, then attach Related Video on each Short once both are live. `clip_to_shorts.py`
   prints this reminder on every render; it is never silently skipped.

**A free alternative worth knowing, not a replacement:** YouTube's own in-app "Create Shorts from
your videos" clipper (on an already-published long-form video, done inside YouTube/the mobile app)
auto-attaches the source link with zero manual step — but you lose custom captions, the hook-text
card, stitching, and loop control. Use it for a quick extra clip between planned batches; use this
pipeline's tool for anything meant to be a real, polished weekly Short.

### Stage 5 — Track it

Tag the pair once both are uploaded, reusing the tracker built the same day as this skill:

```
venv/Scripts/python tools/track_performance.py tag <short-project-or-id> --niche <id> --cross-linked-from <long-form-slug>
```

So a later `report` can eventually show whether Shorts are actually pulling watch time toward the
long-form, once analytics are flowing (see root `CLAUDE.md` GROWTH RULES #9).

## Virality — what's actually rewarded, so the remix effort goes where it pays

Grounded against current third-party analysis of the 2026 Shorts algorithm (no official YouTube
methodology doc exists for this the way it does for the reused-content policy — treat these as
strong priors, not guarantees, same caveat this repo already applies to `yt_viral_analyze.py`'s
lever-lift numbers):

- **Retention curve, not raw views, drives further distribution** — a Short with fewer views but
  high percent-watched outperforms a bigger, low-retention one for future reach. This is the same
  principle GROWTH RULE #2 already applies to long-form; it just runs on a much shorter clock here.
- **The loop is a real, named signal** — a rewatch within ~2 seconds of the end counts as a partial
  new view, and creators report step-changes in reach on Shorts that get rewatched. This is *why*
  Stage 2's `loop` field exists, not just a nice-to-have.
- **Hook within the first 3 seconds is non-negotiable** — a bold visual/text/question in that window
  is the single most cited lever across current guides. `hook_text` exists for exactly this.
- **Word-by-word emphasis captions are close to mandatory** — most viewing is muted;
  `clip_to_shorts.py` already burns these by default, reusing the long-form's own emphasis timing.
- **Original audio is rewarded over trending-sound reuse** — this pipeline's voiced narration already
  qualifies; no change needed, just don't swap in a trending sound thinking it helps, it works
  against a channel under ~50K subs specifically.
- **Treat all of the above as hypotheses to watch, not settled fact** — the same honesty convention
  `validate_topic.py` and `/packaging` already apply to inherited priors. Once Shorts are public and
  `track_performance.py report` has real numbers, let this channel's own retention/loop data override
  the general guidance above wherever they disagree.

## Cadence

Root `CLAUDE.md`'s standing rule — at most one long-form video public per channel per day — **does
not apply to Shorts.** Shorts live in a separate swipe/discovery feed, not the subscription feed that
rule protects, and current data favors **daily** Shorts posting over weekly for algorithmic reach.
Default: spread the week's ~5 Shorts roughly one per weekday, independent of whatever the channel's
long-form cadence is doing that week. If a long-form and a Short happen to go public the same day,
that's fine — they're not competing for the same feed slot the original rule was written to protect.

## Hard rules

- **Never a bare, unedited cut.** Every clip gets at least a fresh `title`/`description`; a `hook_text`
  card or a genuine stitch is the default, not the exception — see the policy section above for why.
- **≥60 seconds, always**, loop tail included.
- **Watch every render before uploading it** — same discipline as every other checklist in this repo.
- **The Related Video Studio step is never implied to be automatic.** `clip_to_shorts.py` prints the
  reminder every render; don't tell the user it's "linked" until they've actually clicked it.
- **Long-form must be public (or unlisted) before Related Video can target it.** Check
  `packaging/published.json`'s `privacy` field before promising the redirect will work.
- **A weak moment doesn't get a Short just to hit 5.** Quality over count — a bad Short costs more on
  the reused-content/retention signals than a missed slot costs on cadence.

## References

- `tools/clip_to_shorts.py` — the render/package tool; its own module docstring is the schema source
  of truth (`start`/`end`, `segments`, `loop`, `hook_text`).
- `tools/yt_upload.py` — same upload path as long-form, private draft by default.
- `tools/track_performance.py` — `tag --cross-linked-from` to log the Short↔long-form pair.
- Root `CLAUDE.md` → GROWTH RULES #8 (cross-linking) and #9 (golden-format tracking) — this skill is
  those two rules' Shorts-specific implementation.
