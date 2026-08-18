# Channel setup — AI Under 3 Min

> Working doc for the channel's naming, keywords, and metadata. Persona defaults (voice, delivery
> mode, target length) are in `channel-persona.ai-news.json` — this doc is the human-facing strategy
> behind those choices. Update this when the niche/positioning shifts; keep the persona file in sync.
>
> **Multi-channel convention (added 2026-07-31):** once more than one channel is active, persona
> files are **one per niche**: `channel-persona.<niche-id>.json` (e.g. `channel-persona.ai-news.json`,
> `channel-persona.finance.json`). The unsuffixed `channel-persona.json` is legacy/single-channel
> only — don't let a run for one channel silently read another channel's persona file. Likewise, this
> doc should exist once per channel (`docs/CHANNEL-SETUP-<niche-id>.md` going forward) rather than
> one shared doc getting overwritten per channel.

## 1. Name & handle

- **Name:** AI Under 3 Min
- **Handle:** `@AIUnder3Min` — check availability on YouTube, then lock the same handle on
  X/Instagram/TikTok even if you don't post there yet (prevents squatting, keeps cross-platform
  search consistent).
- **Collision check (2026-07-24):** no existing channel found under this exact name. Closest
  format-neighbor is **Two Minute Papers** (research-paper summaries, not product/model news) and
  **DecodeAI** (sub-60s clips, Shorts format) — neither overlaps your long-form news+review lane
  directly. Re-check the exact handle string in YouTube's own channel-creation search before
  finalizing; automated search can miss brand-new channels.
- **Why the typo-safe spelling matters:** you wrote "3 Min" not "3 Minutes" — keep that consistent
  everywhere (channel name, handle, video titles, thumbnails). Mixing "3 Min" / "3 Minutes" /
  "3-Minute" across assets splits your search signal instead of reinforcing one phrase.

## 2. Positioning (one sentence)

> **RE-CORRECTED 2026-07-31, RESOLVED same day.** The promise changed from "the video is short" to
> two checkable things: (1) fastest credible breakdown after a release, (2) the full verdict lands in
> the first 3 minutes of any video, no matter its total length (3-10 min, scaled to the release — see
> `niches/ai-news.json`). The name stays as-is; "3 min" now describes the verdict beat, not the
> runtime.

> ~~Every AI release and AI tool, explained in under 3 minutes — no fluff, no hype, sources on screen.~~
>
> **Current:** "Every major AI release, broken down fast — the full verdict in the first 3 minutes,
> the full evidence for anyone who stays. No fluff, no hype, sources on screen."

This sentence is your channel description's opening line, your About tab, and the line you say (or
imply) in every video's outro. Repetition of the same positioning phrase is itself an SEO signal —
YouTube and viewers both learn what you are from consistency, not variety.

## 3. Competitive landscape (why this niche, why now)

| Channel | Format | Gap this channel fills |
|---|---|---|
| Two Minute Papers | Research paper summaries, 2-5 min | Papers, not product/model releases — no pricing, no "should I use this" angle |
| AI Daily Brief | Near-daily news analysis, longer-form | Long-form, no fixed runtime promise |
| Matt Wolfe / All About AI | News + tool reviews, mixed length | No strict time cap; hype-forward, rarely lists what a release does *badly* |
| AI Explained | Deep analytical takes | Long-form, high depth — opposite of a 3-minute promise |

**Your wedge:** a *fixed, short runtime promise* ("under 3 minutes," always) combined with an
**honest-caveat beat every video** (what the release/tool does NOT do well) and **on-screen sourcing**
for every number. Hype channels skip both. That's the trust angle — lean into it in your
channel description and pinned video, not just inside the videos.

## 4. Channel description (copy-paste, then tune)

YouTube indexes the first ~5 words of the title and the first sentence of the description most
heavily; put your core keyword phrase in both. Description should run 200+ words for full indexing.

```
AI Under 3 Min — every major AI release and AI tool, explained in under 3 minutes.

New model drops the same day they launch. Real benchmarks, real pricing, and what the
announcement is NOT telling you — every video names the catch, not just the hype.

If you want to know what's new in artificial intelligence, machine learning, and AI tools
without watching a 20-minute video, this is the fast version: AI news, LLM comparisons,
Claude/GPT/Gemini model releases, AI tool reviews, and benchmark breakdowns, all under 3
minutes, all sourced on screen.

New videos [your cadence — e.g. 3x/week] covering:
— Model drops: new LLM releases, benchmark numbers, pricing changes
— Tool reviews: AI apps and SaaS products, evaluated with real screenshots, not just claims
— Explainers: one AI concept or benchmark, demystified

Subscribe for AI news you can watch on a coffee break.
```

Swap in your real cadence once you've committed to one (see §7).

## 5. Keyword strategy

### Seed keywords (what people actually type)
Pulled from the actual search/competitor landscape, not guessed:
- `ai news`, `latest ai news`, `ai news today`
- `[model name] review` (e.g. "claude opus 5 review", "gpt-5.6 review") — highest-intent, lowest
  competition on the DAY a model ships; this is your same-day advantage
- `is [tool] worth it`, `[tool] review`, `[tool] pricing`
- `ai explained`, `ai in 3 minutes`, `ai news today`
- `best ai tools 2026`, `new ai model`

### Long-tail (lower competition, easier to rank early)
- `[model name] benchmarks explained`
- `[tool name] vs [tool name]`
- `is [model] worth the price`
- `[model] honest review` — "honest" is doing real work here; it matches your differentiator

### How to actually find these before each video (tools, not guessing)
- **YouTube search autocomplete** — type the model/tool name, see what YouTube itself suggests
  completing it to. Free, and it's literally YouTube telling you what people search.
- **Google Trends** — compare interest in "Claude Opus 5" vs "GPT-5.6" vs whatever else dropped
  that week, to decide which release deserves the video.
- **vidIQ or TubeBuddy** (free tiers exist) — search volume + competition score per keyword, so
  you're not just guessing at which title phrase to lead with.
- Do this **per video**, not once for the channel — a keyword strategy for "AI news" in general
  is much weaker than nailing the exact search term for *that day's* release.

## 6. Title formula

**RE-CORRECTED 2026-07-31, RESOLVED same day:** the old "(Under 3 Min)" suffix asserted a video-length
promise this niche no longer keeps literally (videos now run 3-10 min). Since the name stays and now
refers to the verdict beat rather than runtime, swap the suffix to **"(3-Min Verdict)"** — still true,
still carries the SEO/branding value of "3 min" in every title, but now describes something the
video's own structure actually guarantees (see `niches/ai-news.json` script.structure phase 1) instead
of a runtime cap the video may exceed.

Put the keyword in the first 5 words. Two templates that match your format:

- **Model drops:** `[Model Name]: [the one surprising number/claim] (3-Min Verdict)`
  - e.g. "Claude Opus 5: It Beat Its Own Flagship (3-Min Verdict)"
- **Tool reviews:** `[Tool Name] Review: [the catch] (3-Min Verdict)`
  - e.g. "PropFunding Review: The Catch Nobody Mentions (3-Min Verdict)"

## 7. Tags (secondary signal — 5-10 per video, specific)

Tags no longer drive ranking the way they used to; title/description/transcript do the real work.
Use tags only to disambiguate. Per video, mix:
- The exact model/tool name (and common misspellings/short forms — "opus 5", "claude opus5")
- `ai news`, `ai under 3 min`
- The specific benchmark named in the video (e.g. "arc-agi", "frontier-bench") — low competition,
  high relevance to anyone searching that exact term after seeing it elsewhere

## 8. Upload cadence (decide this before your first upload)

Not decided yet — this determines a lot downstream (channel description's "New videos Nx/week"
line, whether the honest-caveat/sourcing differentiator is sustainable at that pace). Options,
given the pipeline can produce a video like `opus5-review` end-to-end in a single session:

- **Daily-ish on drops, filler on quiet days** — matches AI Daily Brief's model, needs the most
  volume but rides same-day search spikes hardest
- **3x/week fixed schedule** — predictable, easier to sustain solo, still fast enough to catch
  most releases within a day or two
- **Reactive only** — publish only when something drops, no fixed cadence. Lowest effort, but
  YouTube's algorithm rewards consistency, so this likely caps growth

## 9. Immediate next steps

1. Create the channel with the name/handle above; set banner + profile image. Videos/thumbnails now
   carry **no wordmark by default** (the tool never brands the work). To put YOUR channel name on
   your own videos, set `BRAND.wordmark` in `remotion/src/brand.ts` to `['AI Under ', '3 Min', '']`
   — and leave it blank for client/agency work. `/brand-setup` sets colors + fonts to match.
2. Fill in the real cadence in §8 and channel description §4.
3. Write the channel trailer / pinned video — 30-45s, states the positioning sentence from §2
   directly to camera or as a kinetic-text video (the pipeline can build this fast).
4. First video: either the `opus5-review` video already built this session (still current — Opus 5
   shipped today), or a fresh drop if something newer lands before you launch.
