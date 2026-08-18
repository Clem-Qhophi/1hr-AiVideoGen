# CLAUDE.md — working rules for this repo

This is an AI Video Editor / Video-OS pipeline. Turn a prompt, a link, or raw footage into a
finished, engaging, on-brand video.

- **Learning log:** `EVOLUTION.md` — read the section for the step you're running BEFORE authoring a
  script/shots, and append lessons AFTER a video. Never delete past lessons.
- **Growth backlog:** `docs/IMPROVEMENT-QUEUE.md` — the open list of what must get better (evidence
  screenshots, missing `YOUTUBE_API_KEY`, CTR calibration, publish automation, cadence reality).
  Read the OPEN section before starting a video; the standing rules it produced are in GROWTH RULES below.
- **Staged plan / north star:** `docs/VIDEO-OS-ROADMAP.md`.
- **Self-improvement layer:** `.claude/skills/system-evolve/SKILL.md` — run it at the end of any
  task where something was learned, corrected twice, or improvised. It decides WHERE a lesson
  belongs (a niche file, a tool, a reusable lib, a skill's SKILL.md, or EVOLUTION.md) and makes the
  edit then, so the pipeline is actually better next run, not just explained in chat.

## Canonical architecture (decided 2026-07-24)

- **`director/` + `.claude/skills/` + `tools/` IS the pipeline.** The creative work is the AGENT
  driving the skills — that taste is what makes the videos good. `director/` orchestrates it as a
  resumable, dependency-aware job with a tiered free/paid provider layer and human gates. Live
  capability health: `venv/Scripts/python -m director providers`.
- **`server/` + `web/` (Framewright) is the LEGACY template MVP.** It builds videos by mechanically
  filling shot templates (`server/shot_templates.py`) — the "animated text instead of the real
  thing" output `EVOLUTION.md` calls the #1 thing to fix. Kept for reference only. **Do not build
  new video-generation features there.** New work goes through `director/` + skills.

## Niches are DATA, not code — `niches/*.json`

The channel plan is multi-niche (US home-hacks first, then AI/news/entertainment). A niche profile
carries the title formula, script structure + voice rules, beat cadence, image style, music bed and
SFX palette. **Never hardcode a niche's formula into a tool** — add or edit a profile instead.
Shipped: `home-hacks`, `ai-news` (two formats — single-story default, plus the robotics `compilation`
format merged in 2026-08-01, see its `formats` block), `entertainment`, `finance`, `real-estate`. Each has an `honesty_guard`: these genres reward
overclaiming, which is how a channel gets demonetised. Soften a claim, never fabricate a source.

## Stock images — licence safety is a business risk, not a formality

`tools/fetch_stock.py` only returns commercially-usable images and writes `CREDITS.md` +
`credits.json` with licence, creator and source. **Share-alike (SA) and non-commercial (NC) are
rejected** — SA can force the whole video under the same licence.
- **Openverse** is keyless so a $0 channel starts today, but it is the Flickr CC pool: amateur
  snapshots, frequently the wrong country or subject (a "US farmhouse kitchen" query returned
  English Tudor manor houses). Every image is CC-BY, so attribution is required.
- **Pexels / Pixabay** are far better and still free — they just need a signup key
  (`PEXELS_API_KEY` / `PIXABAY_API_KEY` in `.env`) and require no attribution. **Get these.**
- Always eyeball the contact sheet before rendering. Keyword search returns on-topic, visually
  wrong images with total confidence.

## Long-form (10-30 min) vs short-form — different machinery

Short-form (<= ~3 min) = bespoke Remotion beats + a Remotion caption overlay. **Neither scales.**
For long-form use:
- **`tools/build_longform.py`** — a timed image sequence with Ken Burns motion from `work/beats.json`.
  A template, not per-beat authoring, so length stops mattering.
- **`tools/gen_captions_ass.py`** — burned ASS captions. The Remotion alpha overlay is 437 MB per
  148s (a 30-min video would be ~5 GB); ASS is 16 KB and burns during a pass you already pay for.
  It reads the same `caption-plan.json`, so tuned emphasis carries over either way.

**Avatars / AI images are NOT available** on this setup: no NVIDIA GPU (verified — no `nvcuda.dll`,
no `nvidia-smi`; Intel QuickSync accelerates *encoding* only, not ML), Gemini image gen is
billing-blocked, and cloud avatar APIs (HeyGen/D-ID/Hedra) are paid. Long-form visuals come from
stock or the user's own images until one of those changes. Do not promise an avatar.

## SPEED — breaking news has a clock, and RUNTIME is what decides if you make it

Set 2026-08-05 after a 14.3-min generated video took **~2 hours**. Full measurements and the fixes
are in `EVOLUTION.md` → "Render SPEED, round 2". The operational rules:

- **Never render captions as a full-length ProRes alpha overlay on anything over ~3 min.** That one
  mistake cost **50 minutes**; `tools/gen_captions_ass.py` produces identical captions in **1s** plus
  a **140s** burn. `check_deliverable.py` now hard-fails this, and `spec.json` should say
  `"captions": {"style": "burned"}` for long-form. **Do not "fix" that gate by editing the spec.**
- **With burned captions the chain reorders:** bake → **burn** → SFX → music → `final_mix`. The SFX
  and music mixers **copy video through untouched**, so `sfx-plan.json`'s `render.preview` must point
  at the **captioned** file. Point it at the raw bake and the video ships with no captions, silently.
- **`render-all.mjs` is parallel now** (`--jobs=N`, default `min(3, cores/3)`). Use `--jobs=1` only to
  debug a crashy shot. Do NOT raise `--jobs` expecting speed — measured, `--jobs=4` was *slower* than
  `--jobs=2`, because throughput tracks total Chrome tabs, not job count.
- **Never hand-write a static full-screen background into a shot.** `RMBg` is pre-baked to a PNG
  (`media/library/backgrounds/`, regenerated by `npm run gen`). Painting its gradient stack live cost
  **2.23x** on a real shot for byte-identical output, because Remotion repaints every frame from
  scratch. Anything static and full-screen belongs in a PNG. Same rule as the round-1 mask lesson.
- **Before optimising any render, run `remotion/scripts/bench-render.mjs <ShotId>`** — it splits the
  cost into Chrome-drawing vs encoding. On a typical shot that is **96% drawing, 3.5% encoding**, so
  codec/GPU work is a dead end. Measured dead ends, do not re-try: Chrome `gl` backend (angle/egl/
  swiftshader all within noise) and `hardwareAcceleration`.
- **Cost scales with RUNTIME.** Every second of a 100%-cutaway generated video is a bespoke
  headless-Chrome render. Measured budget on this 8-core box, end to end, after the above:
  **~6 min video ≈ 12 min · ~14 min video ≈ 26 min** (was ~2 h before 2026-08-05).
- **For a breaking story still prefer a SHORT video** — `ai-news` (`target_minutes: [3, 10]`) already
  wants that, and it is the difference between ~12 min and ~26 min of pipeline. `tools/build_longform.py`
  remains the template path when a long video must ship fast.

## GROWTH RULES — apply to EVERY video on EVERY channel, never ask whether to include them

Set 2026-08-01. These exist because the goal is subscribers, watch time and engagement, not just a
correct video. They are **defaults, not options** — treat them like captions: part of the job.
Full rationale and the running backlog: `docs/IMPROVEMENT-QUEUE.md`.

**None of this matters until the video is actually public.** Confirmed 2026-08-06: every finished
video across all four channels (18 total) was still sitting `"privacy": "private"` — some for
weeks — which means zero of the growth rules below had ever had a chance to work. Uploads default
to private drafts (see Providers note + `docs/IMPROVEMENT-QUEUE.md` R4) and nothing flips that
automatically; flipping Private → Public in YouTube Studio takes seconds and isn't API-blocked, but
it is a manual step nobody had done. **Before drawing any conclusion about what is or isn't
working on a channel, check `videos/<project>/packaging/published.json`'s `privacy` field (written
by `yt_upload.py` as of 2026-08-06) or look directly in Studio.** A flat subscriber count on a
channel with zero public videos is not a content signal — don't diagnose it as one.

**Cadence rule (found undocumented in a single video's `publish.json` note 2026-08-06, codified
here so it isn't lost): ship at most one LONG-FORM video public per channel per day.** Uploads still
land `private` by default (API can't publish public pre-audit, see R4 in the improvement queue) —
this governs the pace at which the user personally flips them public in Studio, not the upload step.
Reason: avoids flooding a subscriber's feed and keeps each video's own watch-time signal legible
instead of videos on the same channel competing with each other on release day.

**This rule does NOT cover Shorts (added 2026-08-06 with `/clip-to-shorts`).** Shorts live in a
separate swipe/discovery feed, not the subscription feed the rule above protects, and current data
favors daily Shorts cadence over weekly for algorithmic reach. Default: spread a week's ~5 Shorts
roughly one per weekday, independent of that week's long-form release — a long-form and a Short
landing the same day is fine, they aren't competing for the same feed slot. Full doctrine (why a
bare cut risks YouTube's reused-content policy, remix/stitch/loop technique, the redirect stack back
to the long-form): `.claude/skills/clip-to-shorts/SKILL.md`.

1. **Two CTAs, not one.** A **mid-roll** subscribe ask at roughly 40-60% of runtime, woven into the
   content (one or two sentences, at a natural beat turn, never a hard interrupt), plus the existing
   **close** CTA (subscribe primary, like + comment secondary). Vary the wording every video.
2. **Open a retention loop in the first 30s and pay it off late.** Name something specific that is
   coming ("the last number is the one nobody is reporting") and then actually deliver it. **The loop
   must be true** — if the payoff is not genuinely the most surprising thing in the video, pick a
   different loop. A promise the video does not keep costs more trust than the retention gains.
3. **Real captured evidence on screen, not only code-rendered cards.** Any video making factual or
   numeric claims must put **at least 2-3 real screenshots** (pricing page, benchmark table, filing,
   the source article) on screen with its source label. Code-rendered stat cards are for *emphasis*
   and animation; they are not proof, and a video built only from them reads as unsourced no matter
   how well researched it was. Capture with `tools/capture_evidence.py` during Stage B and USE what
   you capture. If a source cannot be captured, say so on screen rather than quietly substituting a
   card. (Cause: gpt56-price-cut, 2026-08-01.)
   **Before any number goes into a script, it must come from a page actually read start-to-finish
   (WebFetch, a browser tool, or a direct read) — never from a `WebSearch`-style AI summary alone.**
   Search summaries can quietly conflate two different reports or hallucinate a figure that appears
   in neither source. Then re-check it once evidence capture runs, since a capture that silently
   returns a bot-block page (Wordfence/Cloudflare challenge, not the real content) is the same
   failure wearing a different hat — open the captured image before trusting it exists. (Cause:
   re-closing-costs, 2026-08-02 — cost a full VO regeneration to fix a stat never independently
   verified; full incident in EVOLUTION.md same date.)
4. **Never claim a team, a staff, or a capability that does not exist.** "Our team is standing by" is
   a checkable lie when it is one person and a pipeline, and this audience checks. Say the true
   version of the same promise instead — same-day turnaround, verdict in the first three minutes,
   every number sourced. This overrides any instruction to sound bigger.
5. **Gate policy: script gate only.** Get the script approved, then run **all the way to the finished,
   mastered, `check_deliverable`-passing file** in one pass and show that. Do not stop at a silent
   preview for approval on a proven format — it costs a round-trip and buys nothing once the format is
   established. Re-open a mid-chain gate only for a genuinely new format.
6. **WRITE IT SO A TIRED 12-YEAR-OLD GETS IT.** A correct video nobody understands is a failed video.
   Verify with `python tools/lint_script.py <project>` BEFORE the VO — it is a hard gate, not advice.
   - **One idea per sentence. Hard cap ~25 words, average under 18.** The failing line from
     re-closing-costs was 60 words in one breath: *"Mechanically, it's usually collected as what's
     historically called a documentary or deed transfer stamp, applied to the deed at the moment your
     county recorder's office files it in the public record, which is also why..."* — every fact in it
     is right and the viewer retains none of them.
   - **Every jargon term gets a plain-language gloss in the SAME breath, the first time.** Not a
     definition later, not context that implies it. "Escrow — that's just the lender holding your
     money for you until the bill comes." If a term can be avoided entirely, avoid it.
   - **Anchor every abstract number to something physical.** "$4,661" means nothing. "$4,661 — that's
     a used car, due in one payment, on a day you're already broke from the down payment" lands.
   - **Use an analogy for any mechanism.** A transfer tax is "sales tax, but for a house." If you
     cannot produce the analogy, you do not understand the mechanism well enough to teach it yet.
   - **Say it, then say what it means for THEM.** Never leave the viewer to do the translation.
7. **MAKE THE VIEWER FEEL THE COST OF NOT KNOWING.** Being informative is not the same as being
   compelling. Every video needs the viewer to hit at least one of: *"wait, am I being cheated?"*,
   *"how did I not know this?"*, or *"this gives me an edge."* Build it deliberately:
   - **In the first 30 seconds, name what this costs them** — in money, or in a decision they are
     about to get wrong. Not "closing costs are interesting" but "you are about to wire someone
     thousands of dollars and nobody has shown you the bill."
   - **Contrast what they think they know against what is true.** The gap IS the hook. Surprise comes
     from the correction, not from volume.
   - **Make it personal and second-person.** "Your county", "your closing", "the number on your
     paperwork" — never "one might find that buyers in certain jurisdictions".
   - **Give at least one thing they can act on today**, so the video pays out rather than just
     informing. The advantage has to be real and usable, not implied.
   - **This never licenses overclaiming.** It runs UNDER every niche's `honesty_guard`, and it is also
     the losing move on YouTube's own scoreboard: the A/B winner is decided by **watch time**, so a
     hook the video does not pay off loses the test as well as the trust. The feeling must come from
     a true thing they genuinely did not know. (Cause: re-closing-costs, 2026-08-02 — the channel
     owner could not follow his own video and felt no reason to keep watching.)
8. **Cross-link related videos, every time a real connection exists — never as an afterthought.**
   When two videos on the same channel are topically connected (an "how to build an AI agent" video
   followed later by one about a new agent release; a building-collapse news story followed by a
   real-estate video on inspecting older homes), name the connection out loud in the script (one
   natural sentence: "we actually broke down X in the video on Y — worth a watch"), put it in the
   first two lines of the description, and add it as an end-screen/pinned-comment link once **both**
   videos are public. Log it with `python tools/track_performance.py tag <project>
   --cross-linked-from <other-slug>` so `report` can eventually show whether cross-linked pairs
   actually move traffic between each other. Only real, topic-level connections qualify — a forced
   link between unrelated videos reads as spammy, and YouTube's own suggested-video ranking
   downweights low-relevance end screens, so it costs more than it earns.
9. **Tag every video's format at packaging time, then let the data pick the next one — don't run on
   vibes past the first few videos.** `python tools/track_performance.py tag <project> --hook-type …
   --evidence-type … --title-lever … --thumb-lever … [--journey-framing]`, at the same time
   `/packaging` locks a title, on every channel. Once a niche has 3+ published videos with real
   numbers, run `python tools/track_performance.py report --niche <id>` **before** picking the next
   topic — it groups by hook/evidence/title/thumbnail lever and shows which one is actually winning,
   flagging anything under 3 samples as "thin" rather than treating a 1-video sample as a trend (same
   convention `validate_topic.py` already uses). This is the loop that turns "we made a video" into
   "we found the format that works and made three more like it." Needs the analytics OAuth set up
   once, interactively: `python tools/yt_stats.py auth` (separate, read-only token — never touches
   the upload token). Also **always pass `--trends` to `validate_topic.py`** — it's off by default
   only because Google's endpoint is unofficial and rate-limited, but best-effort real search-volume
   signal beats autocomplete + saturation alone for catching what's actually trending right now.
10. **"Documenting the journey" framing is a real lever — apply it only where the channel's own voice
    supports it, never uniformly across all four.** A small-channel journey angle ("here's what I've
    tried so far", "building this in public") works when the on-screen presence can carry it
    honestly — home-hacks already has a consistent narrator (Walt Combs, see
    `docs/CHANNEL-SETUP.md`-style persona files) for whom "here's what I tried at home" fits
    naturally. It reads as false, or undercuts the pitch, on channels built on expertise/urgency
    (finance, real-estate, ai-news) where the promise is "I already did the research, let me save you
    the time" — bolting a beginner's-journey frame onto an authoritative explainer contradicts its
    own `honesty_guard`. Where it genuinely fits, use it as a **dedicated pinned channel-intro
    video**, not a framing retrofitted into every script.

## PARALLELISM — default to it, but only where it actually pays

Standing instruction (set 2026-08-02, user's call: "we must use parallel agent, multi-agent, doing
specific tasks to improve efficiency... everything must be applied all the time"). Apply this without
being asked each time.

**The honest tradeoff, so this is used correctly rather than everywhere:** parallel subagents cut
**wall-clock time**, they do **not** cut token cost — each agent starts cold and re-derives context
the main thread already has, so N agents cost *more* tokens than one. Parallelize to go faster and to
get genuinely independent work done at once; never parallelize expecting a cheaper run.

**Parallelize (spawn agents, or batch independent tool calls in one message):**
- Independent research threads — different topics, different sources, different niches.
- Independent tool/asset builds that touch **different files** (a new tool + a skill rewrite + a
  thumbnail system, as on 2026-08-02).
- Generating independent variants (3 thumbnail concepts, several title directions).
- Any read-only exploration of an unfamiliar area.

**Do NOT parallelize:**
- Sequential pipeline stages — script → VO → align → beats → render → mix → master. Each genuinely
  depends on the last; running them "in parallel" just means running them wrong.
- Edits to the **same file** — two agents editing one file lose each other's work.
- Work needing tight shared taste/context (script voice, a nuanced correction) — the cold start costs
  more than the parallelism saves, and quality drops.
- Anything where you cannot write a self-contained brief. If the agent needs context you can't hand
  it in the prompt, it will guess, and it will guess wrong.

**Always, regardless:** batch independent tool calls into one message rather than firing them one at
a time; give every spawned agent a brief complete enough to run cold (paths, constraints, the
honesty rules that apply, and what NOT to touch because another agent owns it); and state explicitly
which files each agent owns so two never collide.

## INTAKE — ask everything BEFORE generating, then deliver complete

Two rules that look contradictory and are not:
- **Ask at the START.** Before any generation, agree the brief: niche, exact target runtime, topic
  and angle, captions/SFX/music, aspect, voice, and whether to research first. Never begin on
  assumptions.
- **Never ask at the END.** Once the brief is agreed, produce all of it in one pass. Asking "do you
  want captions?" after delivering a cut is asking permission to finish the job.

**RUNTIME IS A REQUIREMENT, NOT A VIBE.** A "5 minute" video shipped at 3:10 because 560 words were
written to no target at all. Always: `python tools/plan_runtime.py budget <minutes> --niche <id>`
BEFORE writing, and `plan_runtime.py check <project> --target <minutes>` after the VO. Tolerance is
+/-8%. Measured rates live in `niches/voice-rates.json` — **read the file, never quote a rate from
memory** (this line used to hardcode 162.3 wpm for GuyNeural; the re-measured value is now 177.3, a
~9% error that silently under-writes every script). Re-measure with `plan_runtime.py measure`
whenever a new voice is used.

**There is no single house runtime — the niche file is the source of truth.** (Corrected 2026-08-02;
this line previously said "20 min typical, 25 min maximum" from when there was one channel. Five
channels with genuinely different formats now diverge far past that.) Current per-niche
`script.target_minutes`, each set from live `yt_research.py` data, not preference:

| Niche | target_minutes | Default proposal |
|---|---|---|
| `ai-news` | [3, 10] (hard max 12) | 6 min — runtime is the brand promise, see its `brand_promise` |
| `home-hacks` | [12, 30] | 20 min |
| `finance` | [15, 25] | 20 min |
| `real-estate` | [20, 40] | 33 min |
| `entertainment` | [25, 50] | 40 min |

Always run `plan_runtime.py budget` for the actual number — a 40-min script is ~7,100 words and
~400 visual beats, which is a materially different production job from a 20-min one. And per the
standing intake rule, **propose the specific runtime and get it confirmed every time**; the range is
the envelope, never an automatic default.

**THE NICHE RANGE IS NOT THE TOPIC'S RUNTIME — check the topic before setting length.**
`validate_topic.py` prints the median runtime of the winners *on that specific topic* and flags a
mismatch against the niche range. Honour the topic number when they disagree; the niche range is an
envelope across many topics, and individual topics inside it vary wildly. Cause: re-closing-costs
(2026-08-02) shipped at **32 min** on a topic whose long-form winners run a **median of 11 min
(range 2-22, n=17)** — longer than the longest winner, because the niche default [20,40] was applied
without ever asking what this topic wants. Length was the most expensive decision in the video and
it was the one nobody checked.

**RESEARCH BEFORE WRITING.** Three tools. Two read the NICHE, one reads THIS VIDEO'S TOPIC — they
answer different questions, so run all three, in this order.

- **The topic gate — `python tools/validate_topic.py --topic "<exact phrase>" --niche <id>`.**
  Run this FIRST, on the specific topic, **before a single word of script is written**. It returns a
  verdict — GO / GO-NARROW / CROWDED / WEAK / NO-AUDIENCE / NO-DEMAND — with the four numbers behind
  it: search demand (YouTube autocomplete), saturation (how many videos exist, from how big a
  channel), freshness (recent window vs the year), and winnability (has a channel under 50K subs
  already broken out on it). **A topic that comes back NO-DEMAND or NO-AUDIENCE does not go into
  production** — take one of the narrower angles it prints and re-run. ~204 quota units; `--json`
  saves the evidence, `--from-json` re-scores it later for free.
- `python tools/yt_research.py --niche <id>` — what is working now: top videos by **views/day**
  across 24h / 30d / 365d, plus runtime medians and title patterns. The *landscape* read.
- `python tools/yt_viral_analyze.py --niche <id> --window 30d` — which videos are **true outliers**,
  ranked by **views ÷ the channel's own subscriber count**, then decomposed into the title levers
  they pull, with a lift number per lever. The *why did this travel* read.

**Which one answers what:** `yt_research` = *is this niche alive and what shape wins in it*.
`yt_viral_analyze` = *what mechanism made the winners travel*. `validate_topic` = *does anyone want
THIS video*. The first two were both run and both passed before a 32-minute `real-estate` video on
"closing costs" was produced with **zero evidence about closing costs specifically** — a validated
niche never validates a topic, and that gap is what `validate_topic.py` exists to close (2026-08-03).

**Why views/day is not enough:** it systematically surfaces big channels. A 481K-view video on a
339K-sub channel is 1.4x — that channel's normal Tuesday — while a 9K-view video on a 1.5K-sub
channel is 5.8x and is the one the algorithm actually chose to push. Ranking on raw views teaches you
what big channels do, not what makes something travel. (Both numbers are real, measured on
`real-estate` 2026-08-02.)

**Say what you actually measured.** The YouTube Data API has **no search-volume endpoint** — every
number it returns is engagement on videos that already exist, and `totalResults` counts *videos*, not
searches (it also saturates at 1,000,000). The only genuine search-demand signal in this repo is
YouTube's autocomplete, which `validate_topic.py` probes keylessly, and it is **ordinal, never a
volume**: "self-suggests after 10 of 13 characters" is real evidence people type it, and is still not
a searches-per-month figure. Writing "X people search for this" from any of these tools is the same
unfounded-claim failure the GROWTH RULES already ban.

All three need a free `YOUTUBE_API_KEY`. **Patterns to learn from, never titles to copy** — extract
the mechanism, rebuild it in the channel's own voice. And treat lever-lift numbers as hypotheses to
A/B test, not proven causes: they are regex heuristics on title text, blind to the thumbnail, and
usually computed on small samples. Check the denominators the tool prints before believing a
percentage — all three tools flag thin samples and query drift rather than hiding them, so read the
CONFIDENCE line, not just the verdict.

## DEFINITION OF DONE — a cut is not a video

**Never deliver a cut and ask whether to add captions.** That happened on video-1 and it was wrong:
the user had to come back and say so. A finished talking-head video is **all** of these, produced in
one pass, without asking:

1. **the cut** — fillers, retakes, dead air gone; machine-verified against the render
2. **captions** — word-synced, with the words that carry the point stressed
   (`tools/gen_captions_emphasis.py`). Most viewers watch muted; captions are not a feature request
3. **motion & visual density** — punch-ins on footage OR dense context-matching visual assets via `tools/visual_director.py` (max consecutive repetition <= 2 beats, unique assets >= 10, zero static blank spans, every beat synchronized to spoken words).
4. **sound** — SFX on the beats + a ducked music bed, each cue **measured** as audible
5. **viral packaging (1M-View Target & >= 90 Score Gate)** — `tools/viral_packaging_engine.py` ideates across 5 viral archetypes (superhero speed metaphors, industry threats, pricing catches, benchmark destruction, urgent hooks) and enforces a strict **>= 90/100 CTR probability score**.
6. **the master** — `tools/final_mix.py`

Then prove it: **`python tools/check_deliverable.py videos/<slug> --file <out>`**. It exits non-zero
and names what is missing. Do not send a file that has not passed it. Ask the user about *taste*
(is this cut right, is this the tone) — never about whether to include a standard part of an edit.

## Delivery — every video gets mastered before upload

`tools/mix_sfx.py` and `tools/mix_music.py` are **audition** mixers; they deliberately leave level
alone. The last step before upload is **`python tools/final_mix.py <finished.mp4>`** — two-pass linear
loudnorm to **-14 LUFS / -1.0 dBTP**, video stream-copied, then re-measured to prove it landed. Skipping
it ships a video that is quiet next to every other channel (YouTube turns loud uploads down; it does not
lift quiet ones). There is no `/assemble` skill — that was a dangling reference, `final_mix.py` is the
step it promised.

## Providers — Free & Pro Media Tier

- **Voice:** `edge-tts` (free) — `tools/tts_edge.py`. Not ElevenLabs.
- **Word timing:** `tools/align_asr.py` — transcribe the generated VO with **AssemblyAI** and align
  real ASR timings onto the known script. Frame-accurate for ~$0.01/min. Falls back to proportional
  (`director/align.py`) only if the key/credits are gone. **Do NOT ship proportional when AssemblyAI
  is available** — it drifts multiple seconds (measured mean ~3.5s, max ~7.5s on
  open-source-ai-mid2026). The director's `word_timing` stage already picks ASR → proportional.
- **Transcription (raw footage):** AssemblyAI — `tools/transcribe.py`.
- **Veo Video Generation:** `tools/gen_veo_clip.py` & `tools/gen_gemini_media.py video` — generates cinematic 16:9 AI video b-roll via Google DeepMind's Veo 3.1 (`veo-3.1-generate-preview`, `veo-3.1-fast-generate-preview`, `veo-3.1-lite-generate-preview`).
- **Gemini / Imagen Image Generation:** `tools/gen_gemini_media.py image` — generates high-res AI images using Imagen 3 (`imagen-3.0-generate-002`) & Gemini Flash Image (`gemini-3.1-flash-image`).
- **Thumbnails:** `tools/viral_packaging_engine.py` (90+ CTR score gate) and Remotion code stills (`tools/gen_thumbnail_tsx.py`), with Gemini / Nano-Banana image pro tier.

## AssemblyAI — ALWAYS fetch live docs before writing AssemblyAI code

Fetch `https://www.assemblyai.com/docs/llms.txt` (or `llms-full.txt?lang=python`) before touching any
AssemblyAI call. The API changes — do not rely on memorized parameter names. Current essentials:
pre-recorded uses `speech_models: ["universal-3-5-pro", "universal-2"]` (plural **array**);
Authorization header is the **raw key, no `Bearer`**; word-level timestamps are automatic on
`words[]`. Deprecated (do not use): `auto_chapters`, `summarization`, `summary_model`,
`summary_type` — use the LLM Gateway instead.
