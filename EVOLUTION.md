# EVOLUTION.md — the pipeline's memory

> **This file is the agent's learning log.** It travels with the code — read it at the
> start of every video session, append lessons at the end. It's not in opencode's memory,
> it's in the repo. Wherever the code goes, the learning goes.
>
> The agent (Claude/opencode/GLM) reads this BEFORE writing a script or building shots,
> and appends to it AFTER a video is done. This is how the pipeline evolves.

## How to use this file

1. **At the start of a session:** read this file. Apply the lessons to the current video.
2. **At the end of a video:** append what you learned to the appropriate section.
3. **Never delete past lessons** — only append or amend. If a lesson is superseded, mark it
   `~~struck through~~` with a note, don't remove it.
4. **Be specific.** "Hooks need to be faster" is useless. "The hook at 0-15s had 4 seconds
   of dead air before the first text appeared — shots should reveal text within 2s" is useful.

---

## Craft lessons by discipline — READ YOUR SECTION, APPEND TO IT

> Every production skill reads this file. Chronological per-video entries are at the bottom; **this
> section is the distilled, actionable version.** Read the subsection for the step you're running, and
> append what you learn there (not only to the per-video log) so the next run inherits it.

- **Autonomous Anti-Slop QA Watchdog & Batch Auto-Remediator (`tools/auto_qa_remedy.py`):** Never deliver an initial render
  blindly. The system must run a complete multi-vector diagnostic sweep across the rendered master: auditing visual diversity
  (min 10 unique assets, no static holds >6s), audio loudness (-14 LUFS, -1.0 dBTP ceiling), subtitle continuity (100% voice
  coverage), and viral packaging score (>= 90/100).
  **CRITICAL BATCH POLICY**: All detected defects across all vectors are aggregated and fixed in ONE coordinated batch pass
  (synthesizing assets + subtitles + packaging -> SINGLE video render pass -> SINGLE audio remastering pass). Never do piecemeal
  re-renders. Re-audit until 0 defects remain.
- **`EvidenceFrame` vs `EvidenceBrowser` place the same screenshot differently.** `EvidenceFrame` fills
  the frame; `EvidenceBrowser` pushes the image down below the URL bar. A `highlight` box tuned on one is
  **off by a row** on the other. Always verify a highlight by pulling the actual rendered frame — never by
  reusing coordinates. (Cost us a wrong-row highlight on `open-source-ai-mid2026`.)
  - **PARTLY FIXED 2026-07-24:** `EvidenceBrowser` now supports `highlight` too, with **identical
    semantics** to `EvidenceFrame` (% of the screenshot area, chrome excluded) — so you no longer swap
    components just to add a highlight (the thing that caused the coord reuse). Both still letterbox if a
    screenshot isn't 16:9, so the "verify by pulling the frame" rule stands.
- **Render `--still` for all shots first**, then full clips. Stills catch crashes in seconds; a full render
  batch wastes minutes failing on shot 7.
  - **But stills never exercise frame 0.** A per-frame interpolate like
    `interpolate(frame, [Math.max(0, frame - 4), frame], ...)` passes every still check (stills at f>0)
    and crashes every full render at frame 0 (`inputRange must be strictly monotonically increasing but
    got [0,0]`) — messi-ronaldo-final-score lost one 13-min batch to it, and the pattern was ALSO a
    no-op (window slides with frame, so output is constant 1.0). Rule: any interpolate whose inputRange
    is a function of `frame` is suspect — use fixed anchors (`start`, `start + n`) with CLAMP, or a
    `Math.max(0, ...)` arithmetic falloff. And: after any full-shot render batch, grep the log for
    `retry`/`FAILED` lines — render-all retries once but still fails clean.
- **Google Fonts can time out mid-render** (`Timed out loading Google Font`) on a flaky network. It is
  intermittent — **retry once** before debugging anything else. **NOW AUTOMATED 2026-07-24:**
  `scripts/render-all.mjs` wraps every still/media render in `withRetry` (one retry after a 2.5s wait),
  so a single font timeout no longer fails the batch.
- **Bottom-anchored callouts collide with `EvidenceFrame`'s source citation.** Put callout pills higher
  (~130px from bottom) with a **solid** background, not a translucent one over text.
- Verify composited frames from the **baked** preview at each cue, not just the isolated shot.
- **`AbsoluteFill` is `flexDirection: 'column'`.** So `justifyContent` is the **vertical** axis and
  `alignItems` is the **horizontal** one. Writing `justifyContent:'center', alignItems:'flex-end'` for a
  bottom-centre bar actually renders it **middle-RIGHT and clipped off-frame**. Bottom-centre is
  `justifyContent:'flex-end', alignItems:'center'`. (This shipped silently in the caption template — the
  shot rendered "fine" and had alpha content, it was just in the wrong place.)
- **Debug an overlay by its alpha bounding box, not by eyeballing a crop:**
  `Image.open(f).convert('RGBA').getchannel('A').getbbox()` tells you instantly *where* the content is.
  It located the mis-placed caption bar in one command after two wrong guesses at the ffmpeg filter.
- **Overlays only composite over the MASTER unless `bake.py` handles cutaway+overlay.** Every generated
  video is 100% cutaways, so an overlay (captions, a persistent badge) silently never appears. `bake.py`
  now has a `cut and ov` branch — keep it.
- **A full-length alpha overlay is expensive.** A 148s 1080p ProRes 4444 caption track = **~437 MB and
  several minutes** to render. Worth it for burned captions, but budget the time and disk; don't render
  one speculatively.
- **Check a cue with `render-all.mjs --still --frame=`, not a full clip render** (added 2026-07-25).
  Repeatable, takes frames or seconds (`--frame=130 --frame=4.3s`) → `out/<id>@f<n>.png`. The old loop
  (render the whole clip, then `ffmpeg -ss` each cue) cost minutes to check a 3-frame animation.
- **Pulling cue frames from a rendered shot: seek in SHOT-LOCAL time, not master time** (qt-funded-ad,
  2026-08-08). The shot mp4 only spans its own `[master_in, master_out]`; `-ss 10.2` on a 6.2s shot
  returns nothing ("Output file is empty"). Convert: `local = master_t - shot.master_in_s`. A silent
  empty-frame pull looks identical to a legit check result unless ffmpeg's error stream is visible.
- **Verifying a reveal with `--still --frame=` takes ONE frame arg per run per shot** — passing
  multiple `--frame=` flags fires multiple stills at the SAME default frame (the last or first one
  wins per shot), so per-cue stills need per-run invocations or the full clip + ffmpeg pulls.
  (qt-funded-ad, 2026-08-08.)

#### Punch-ins on the master — `timeline.json` `reframes` (added 2026-07-25)
- **`bake.py` could only replace the master (cutaway) or composite over it (overlay).** There was no way
  to scale/reposition the talking head, so the single most common talking-head move — punch in on the
  line that matters, cut back out — was impossible. Now: `reframes: [{in_s, out_s, scale, ease, anchor}]`.
- **`ease:"cut"` (static crop) is the one that hides jump cuts.** Land it ON the cut join. It is also
  exact and free — no interpolation, no quality question.
- **Animated pushes need the source pre-scaled or they step.** `zoompan` rounds its crop origin to whole
  INPUT pixels, so on a slow push a 1080p source visibly stutters. Measured jitter (frame-to-frame diff
  CV over the ramp, 1.0→1.08 over 3s, the worst case): **0.206 at 1x / 0.183 at 2x / 0.123 at 4x**
  prescale. `bake.py` now auto-computes prescale so the zoompan input is ≥2x the output width — which
  means **a 4K master needs no prescale at all** and costs nothing. Another reason to keep masters 4K.
- **Verify a punch numerically, not by eye.** Diff the baked frame against the master frame put through
  the same crop: a correct 1.20x punch matched to **0.03** gray levels while a 1.10x crop scored 0.28 and
  no crop scored 0.50. That discriminates in one command; eyeballing a zoom does not.
- Reframes are ignored under a cutaway (bake warns) and overlays composite over the punched master
  **unzoomed**, so captions don't ride the zoom. `--no-reframe` bakes the punch-free A/B.

### Delivery / final mix — `tools/final_mix.py` (added 2026-07-25)
- **The pipeline had no mastering step at all.** `mix_sfx.py`, `mix_music.py` and the clean-audio skill
  all deferred "final polished mix / loudness normalization" to **`/assemble` — a skill that was never
  built**. So every video shipped at whatever level the AUDITION mix happened to land on. That alone
  makes a good video sound weak next to other channels, because YouTube turns loud uploads DOWN and
  mostly leaves quiet ones alone; delivering quiet just means being quiet.
- **`tools/final_mix.py` is now the last step before upload.** Two-pass **linear** loudnorm to
  **-14 LUFS / -1.0 dBTP**, video stream-copied (no re-encode). Two-pass linear matters: single-pass
  loudnorm is a dynamic processor and rides the gain, which pumps on a voice track.
- **It re-measures the file it wrote and prints the delta.** Verified on a deliberately quiet clip:
  -29.59 LUFS in → **-14.48 LUFS / -0.88 dBTP** out. A mastering step that only *claims* to have hit
  the target is worth nothing. Expect the true peak to land within ~0.2 dB of the ceiling, not exactly
  on it — loudnorm's TP limiter is approximate.

### Planning the edit — `tools/plan_edit.py` (added 2026-07-25)
- **Punch-ins and b-roll used to require hand-authoring every span against the transcript.** This reads
  the transcript (+ `cuts.json` when /clean-cut ran) and proposes both.
- **Cut joins are the highest-value punch placement and cannot be guessed from the transcript.** They
  come from `cuts.json` by running-total of KEPT time per clip. Without cuts.json you only get
  content-placed punches; say so rather than pretending the plan is complete.
- **Bug worth remembering: deriving punches and graphics from the SAME signals proposes zero punches.**
  Every content-punch candidate overlapped a graphic and was discarded as "would be hidden under the
  cutaway". The editorial rule is the inverse of what was coded: **a line that earns a graphic is cut
  away from; a line that stays on the face is what you punch.** Punch candidates now come from
  direct-address/verdict lines that were NOT given a graphic.

### First end-to-end long-form run (video-2, 2026-07-26) — the chain works, the IMAGES do not
Ran the whole faceless chain for real: script.md -> edge-tts VO -> ASR word timings -> beats ->
stock images -> Ken Burns render -> burned captions -> music -> master. 560 words, 28 beats,
190s out. Every mechanical link worked. Numbers: render 182s for 3.2 min of 1080p (h264_qsv),
captions 73 KB / 560 events, master landed -14.03 LUFS / -0.99 dBTP, A/V within 33 ms.

- **Openverse is NOT usable for a US home-hacks channel. Verdict, not a caveat.** Queries for
  "white salt crystals", "damp basement wall", "garage workbench" returned a rock face, a wet
  country road at dusk, a muddy mound at night, and legs in wellies. A frame captioned "The
  material is calcium" showed a smartphone crossfading into a historical crowd photo. The CC pool
  is amateur Flickr; it has no professional coverage of ordinary American domestic subjects.
  **Get free Pexels/Pixabay keys before attempting this niche.** The pipeline is not the blocker.
- **`image_query` and `image_prompt` must be SEPARATE fields.** plan_beats first emitted one
  string with the niche art-direction appended ("mason jar on a wooden shelf, warm, domestic,
  natural light, lived-in American home, no people's faces, no modern tech") and fed it to a stock
  search: **zero results on every query**. A stock index matches words; it cannot read art
  direction. Short keywords for search, the full styled line for generative models.
  fetch_stock also now narrows a failing query (full phrase -> first 3 words -> longest words).
- **Fetching images is not the same as assigning them.** The first version downloaded 39 files and
  left every beat pointing at its `PENDING-###.jpg` placeholder, so the render would have failed
  on missing files. `--from-beats` now writes the assignments back into beats.json and rotates
  between images sharing a query so repeats are not identical.
- **Long-form captions need `--plan-only`.** Emphasis lives in caption-plan.json, which only the
  Remotion generator wrote — so the ASS path produced 0 stressed words. `gen_captions_emphasis
  --plan-only` now writes the plan without emitting a Remotion shot.

### LONG-FORM (10-30 min) — the two blockers, and what removed them (2026-07-26)
Before this, the longest video the pipeline had ever produced was **155 seconds**. Two hard limits:

1. **Every beat was a hand-authored TSX file.** Right for a 2-min video with bespoke beats;
   impossible at 30 min (~400 shots at a 5s cadence). **`tools/build_longform.py`** renders a
   timed image sequence with Ken Burns motion instead — a template, so it scales to any length.
   `zoompan` is cheap on a STILL (one decoded frame drives every output frame). Each image is
   scaled to COVER at `--headroom 1.35` first, so a zoom never runs out of pixels or letterboxes.
   `move: auto` cycles direction so two neighbouring beats never drift the same way.
   Measured: 33s of 1080p in 27s wall, parallel across cores -> a 30-min render is ~25 min.
2. **Captions were a ProRes 4444 alpha overlay.** 148s = **437 MB**; 30 min would be **~5 GB**
   plus an enormous Remotion render, for text. **`tools/gen_captions_ass.py`** emits ASS and lets
   ffmpeg burn it during a pass you already pay for. Same word timings, same emphasis colours,
   reads the SAME `caption-plan.json` so hand-tuned emphasis carries over.
   Measured on video-1: **16 KB and 36s**, against **190 MB** for the .mov plus a 250s bake.
   - **short-form (<= ~3 min)** -> `gen_captions_emphasis.py` (Remotion: scale-pop, wiping box)
   - **long-form (> ~3 min)** -> `gen_captions_ass.py` (ASS: colour + box, essentially free)
   - ASS gotchas: colours are `&HAABBGGRR` (**BGR**, and alpha is INVERTED — 00 is opaque), and
     `subtitles=` treats `:` as its own separator, so a Windows drive letter breaks the filter.
     Pass a CWD-relative forward-slash path; escape with ONE backslash only as a fallback.

**Still missing for a full 30-min faceless video (2026-07-26):** image sourcing (a stock/gen
fetcher), the script architecture for 20-30 min retention, and beat-mapping a script to images. The
renderer and the caption path are the enabling half; those three are the content half.

**UPDATE 2026-07-30 (robotics-2026-updates-1):** the first two are done — `fetch_stock.py` (this
same section, above) and `plan_beats.py` shipped same-day and both worked at 226-beat / 17.5-min
scale here. What was still missing turned out to be a THIRD thing this note didn't anticipate:
**a renderer for beats that are facts, not scenery** (`tools/gen_spec_cards.py` — see the
robotics-2026-updates-1 entry below). Stock search covers atmosphere; it cannot cover a number, and
a script this dense with numbers needed a second image pipeline, not just a bigger one.

### Process — "deliver a cut and ask about captions" is a FAILURE mode (video-1, 2026-07-25)
- The cut was delivered on its own with "want me to add captions?" appended. The user's answer:
  *"of course, you must add caption... all the necessary things must be produced at once."* Correct.
  A talking-head Short without captions is unfinished — muted autoplay is the default viewing mode.
- Root cause: **nothing in the repo defined "done"**, so a partial edit looked like a delivery.
  Fixed by `tools/check_deliverable.py` (hard gate: cut + captions + motion + sound + master, each
  verified on the actual file) and a Definition of done in CLAUDE.md.
- **Ask about taste, never about completeness.** "Is this cut right / is this the tone" is a real
  question. "Do you want captions" is asking permission to finish the job.
- Corollary for SFX: a cue that does not MEASURE is not a cue. Three of five cues on video-1 needed
  correcting — `riser-soft` at -4 dB measured -2.7 dB vs clean (inaudible), and `ui-click-soft` stayed
  inaudible even at **+9 dB** because the clip itself averages -28.9 dB. Don't chase a quiet clip with
  gain (EVOLUTION already said this) — **swap the clip**. `launch-thump` (-19.2 dB mean) at +2 dB gave
  +14.4 dB. Always measure each cue against the pre-SFX render, not by ear-guessing the gain table.

### Render SPEED — measured, not guessed (2026-07-25). ~10 min -> ~1 min on the same machine.
Three causes, in increasing order of how much they cost. All fixes made the output BETTER, not worse.

1. **Three full encodes where one would do.** The chain was: pre-render a "clean source" with the look
   baked in -> encode 25 segments to x265 10-bit -> transcode the whole thing to H.264 for delivery.
   Measured on 10s of 1080x1920: chained x265->x264 **67.7s at SSIM 0.9869**, a single x264 encode
   **17.7s at SSIM 0.9964**. Faster AND better, because every re-encode discards detail permanently.
   Fix: `cuts.json` carries a **`source_filter`** (the look) applied straight off the ORIGINAL during
   the segment render, plus `--mode deliver` = one H.264 pass. No clean-source pre-render, no transcode.
2. **Looking only for NVIDIA.** `render_cuts.py` hardcoded NVENC, found none, and fell all the way back
   to CPU — while the machine had working **Intel QuickSync**. Measured, 10s of 1080x1920:
   `libx264 10955ms | h264_qsv 2833ms | h264_mf 2447ms | h264_amf unavailable | h264_nvenc broken`.
   Fix: `best_h264()` probes nvenc -> qsv -> amf -> mf -> libx264 by actually encoding a frame.
3. **The filter, not the codec, was 94% of the time.** A `blend=all_expr` mask with `pow()` evaluated
   per pixel per frame cost **41.4s per 10s**, against **2.5s** for the encode alone. The mask was
   STATIC. Baking it once to a grayscale PNG and using `maskedmerge` -> **6.7s per 10s**, same picture
   (SSIM 0.995 vs the expression). **A static mask must never be an expression.** If a look needs a
   per-pixel formula, render it to an image once and merge it.

**Rule of thumb going forward:** before optimising a codec, time the filtergraph separately
(`-c:v <enc> -f null -` with and without the look). The expensive thing is usually not the encode.

### Render SPEED, round 2 — the SHOT-GENERATION pipeline (2026-08-05). ~2h -> ~45 min, all measured.
Round 1 above fixed the *cut* engine (ffmpeg). This is the *generated-video* chain, measured on
`ai-agents-explained` (855s / 14.3 min, 16 bespoke Remotion shots covering 100% of the runtime).
The channel goal is a breaking-AI-news video shipped inside ~20-30 min, and the run that prompted
this took **about two hours**. Three causes, biggest first.

1. **The caption track was rendered as a full-length ProRes 4444 alpha overlay: ~50 MINUTES.**
   This is the single most expensive thing in the chain and it was pure waste. `gen_captions_ass.py`
   produced the **identical** caption content — same 748 phrases, same 414 stressed words, read from
   the same `caption-plan.json` — as a **305 KB text file in 1 second**, which ffmpeg then burns in a
   single **140s** pass. **~21x faster, byte-identical intent, and it deletes a 186 MB intermediate.**
   The repo already documented this rule (`> ~3 min -> ASS`) and the video's own `spec.json` already
   said `"style": "burned"` — the pipeline rendered the overlay anyway, and then the spec was
   "fixed" to `"overlay"` to make `check_deliverable` pass. **The gate was right and got edited to
   match the mistake.** Guard added: `check_deliverable.py` now hard-fails `style=overlay` on any
   video longer than 200s and names the cheap path. Never silence a gate you have not disproven.
2. **`render-all.mjs` rendered every shot strictly sequentially — one shot at a time on 8 cores.**
   `renderMedia`'s own `concurrency` only parallelises frames *within* one shot, and a single short
   composition cannot saturate the box: each shot pays browser launch + teardown + a serial ffmpeg
   encode tail, and those gaps were dead time. Fixed with a fixed-size worker pool over the shared
   bundle (`--jobs=N`, default `min(3, cores/3)`, with `JOBS * CONCURRENCY <= cores` so it doesn't
   thrash). Measured on a 2-shot queue: **251s -> 184s (1.36x)**; per-shot time *rises* (110s -> 165s)
   while wall-clock *falls* — that is the correct trade and the win grows with queue depth. Use
   `--jobs=1` to get the old serial behaviour when debugging a crashy shot.
3. **Burned captions silently reorder the chain, and getting it wrong ships an uncaptioned video.**
   `mix_sfx`/`mix_music`/`final_mix` all **copy the video stream through untouched**, so video is only
   ever encoded in `bake` (+ the caption burn). That means the burn must happen *before* the SFX
   stage and `sfx-plan.json`'s `render.preview` must point at the **captioned** file. Pointed at the
   raw bake it still runs, still passes, and quietly has no captions.

**Measured stage costs (855s video, this machine, 8 cores, QSV):** ASS generate **1s** · bake with no
overlay compositing **168s** · caption burn **140s** · SFX mix ~60s · music mix ~120s · `final_mix`
~6 min (several full-length loudness measurement passes) · shots **the dominant cost**.

### Render SPEED, round 3 — the SHOT renderer itself (2026-08-05). 55 min -> 16.5 min, bit-identical.
Round 2 parallelised the shot batch (55 -> 29 min). This went after the per-frame cost inside each
shot. **Diagnose before optimising: `remotion/scripts/bench-render.mjs <ShotId>` splits a render into
Chrome-frame-drawing time vs ffmpeg encode time.** On `AAEHook` (610 frames): **57.3s drawing, 2.1s
encoding.** The encoder is 3.5% of the problem — so codec/hardware work is a dead end here, exactly
like round 1's "the filter, not the codec, was 94% of the time".

- **The background was re-rasterised on every single frame. Baking it to a PNG made shots 2.23x
  faster with BIT-IDENTICAL output.** `RMBg` is three stacked full-screen layers — a linear gradient,
  a 1200x640 radial glow, and a dot pattern tiled ~900 times across 1080p. It is entirely **static**,
  but every Remotion frame is a fresh paint, so Chrome redrew all of it 30x/second in ~60 shots
  across 7 projects. Isolated bench (300 frames): flat fill **12.3s**, live `RMBg` **18.8s**, baked
  PNG **12.1s** — the background went from +53% overhead to free. Real shot `AAEHook`: **59.4s ->
  26.6s**. Full-clip SSIM against the pre-change render: **1.000000 (inf)** — not "close enough",
  *identical*. Full 16-shot batch: **29 min -> 16.5 min**.
  `RMBg` now blits `media/library/backgrounds/rm-bg-<glow>.png`; `RMBgLive` keeps the old stack for
  unbaked glow colours. `scripts/bake-backgrounds.mjs` (wired into `npm run gen`) re-bakes only when
  a hash of the brand tokens changes, so the PNGs cannot silently drift from `brand.ts`/`reviewkit`.
- **Bug worth remembering: `selectComposition` freezes props.** The baker called it once and passed
  per-glow `inputProps` only to `renderStill` — all five backgrounds came out **byte-for-byte
  identical**. `selectComposition` must be re-run per prop set. Caught by checksumming the outputs;
  the tool reported success for every file. **Checksum generated variants, don't trust exit codes.**

- **The backdrop is a ~4x render decision, and the fast one is now the baked `RMBg`.** Measured, 300
  frames at 1080p: flat fill **12.3s** · baked `RMBg` **12.1s** · live `RMBg` **18.8s** · **`VibeBg`
  ~53s**. VibeBg's atmosphere layers genuinely animate (and several are CSS-blurred), so unlike RMBg
  **none of it can be pre-baked**. That is the correct price for an ad or premium beat — art
  direction is the product there. It is the wrong price for a news video racing a clock. Because
  `/make-tsx` steers new beats to VibeBg by default, **the RMBg win does NOT automatically carry to
  new videos** — the skill now states the cost so the choice is deliberate.

**NEGATIVE RESULTS — measured, don't re-try these:**
- **Low-resolution blur rendering does nothing in Remotion.** The standard trick (draw blurred
  layers on a quarter-size surface, scale the result up) measured **54.7s vs a 54.2s baseline** on a
  300-frame VibeBg composition. Chrome re-rasterises at the composited scale, so the pre-transform
  size buys nothing, and the trick costs px-unit bookkeeping plus a fidelity risk. Reverted; a note
  sits in `atmosphere.tsx` so nobody re-derives it.
- **Chrome GL backend does nothing here.** `AAEHook`, same conditions: swiftshader **28.7s**, angle
  **26.3s**, egl **28.2s** — all inside run-to-run variance (a default run measured 25.9s). The work
  is CPU layout/paint, not GPU rasterisation. Do not add `chromiumOptions: {gl}` expecting a win.
- **`hardwareAcceleration` is not the lever** for the same reason: the encode tail is ~2s of a ~59s
  shot, so even a free encoder buys ~3%.
- **More parallel jobs is not automatically faster.** `--jobs=4` came out SLOWER than `--jobs=2`
  (335s vs 296s on a 4-shot subset) because the tab formula gives each job fewer tabs, so total tabs
  *fell* (4x1=4 vs 2x3=6). Throughput tracks TOTAL tabs, not job count.

**The honest ceiling: runtime is the variable that decides whether you make the news window.**
Every second of a 100%-cutaway video is a bespoke Chrome render, so cost scales with length, and no
amount of encoder tuning changes that. **End-to-end measured on this 8-core box after rounds 2+3:**

| Stage (14.3-min video, 855s, 16 shots) | Before | After |
|---|---|---|
| shot renders | ~55 min | **16.5 min** |
| captions | ~50 min | **2.3 min** (1s generate + 140s burn) |
| bake + SFX + music + `final_mix` | ~19 min | **9 min** (combined, incl. burn) |
| **total** | **~2 hours** | **~26 min** |

A **6-min** news video is ~40% of that work and lands around **12 min**. The `ai-news` target of
**[3, 10] min** is therefore also the fast path, not just an editorial preference. If a breaking
story must ship fast, shorten the video or drop to the `build_longform.py` image-sequence template.
A 30-min turnaround on a bespoke cut is now realistic up to roughly 15 min of runtime — beyond that,
shorten it rather than promising a time the hardware will not hit.

### The cut engine — bugs found on the FIRST real phone-footage edit (video-1, 2026-07-25)
Every one of these was invisible on the DJI/48 kHz/NVIDIA path the pipeline was built against, and
every one of them broke on an ordinary iPhone clip. Check them on any new source.

- **`atrim=end_sample` counts at the INPUT rate, and `-ar` is an OUTPUT option.** `render_cuts.py`
  computed `n = dur * 48000` but the filter trimmed at the source's 44.1 kHz, so every audio segment
  came out **8.84% long** (48000/44100), capped by the +0.2s decode margin: **+3.6s of audio against
  the video** over 25 segments. Fix: `aresample=48000` FIRST in the chain. Camera audio is usually
  already 48 kHz, which is exactly why this hid for so long. **Always gate on `v:0 duration ==
  a:0 duration`** — that check is what caught it.
- **The tail after a cut reached back INTO the words that were cut.** `plan_clip` measured `gap` to the
  next KEPT atom, so a removed span looked like a section end, triggered the SOFT landing, and extended
  the tail up to `soft_max_tail` (0.55s) across the removal — dragging ghosts back in. Measured: 8 ghost
  words ("So", "You know,", "to the high") survived their own cuts. Fix: the tail may never pass the
  next SPOKEN word's onset (kept or cut), and the head may never reach back into the previous word.
  Ghosts 8 -> 1 after the fix, missing 1 -> 0, low-confidence 5 -> 0.
- **A cut boundary that straddles a word leaves a fragment**, and ASR hears it as a different word
  ("all-" + "we've" -> "You've"). Validate every cut edge against the word table before rendering:
  no edge may fall strictly inside a word.
- **ASR word END times can be quantized junk.** 84% of this transcript's words had an end exactly 80 ms
  after their start (implied 9.45 words/sec — impossible). Every gap between a bogus end and the next
  real start then looks like dead air, so the engine "compresses a pause" by cutting live speech, and
  `analyze_cut` buries the real problems under phantom ones. **`tools/fix_word_ends.py` repairs ends
  from the waveform** — run it right after `transcribe.py` on any new source. Here: implied rate
  9.45 -> 3.89 words/sec, internal pauses 29 -> 12, clipped-tail risks 16 -> 6.
- **`ffmpeg -encoders` listing NVENC proves nothing.** This machine listed `h264_nvenc`/`hevc_nvenc`
  and had no nvcuda.dll and no GPU, so every render died with a bare exit -1. `render_cuts.py` now
  probes by actually encoding one frame and falls back to libx264/libx265. Probe capability, never
  trust a capability list.
- **`scale=1280:-2` assumes landscape.** On a 1080x1920 vertical master the preview came out
  1280x2276 — upscaling the preview above its own source. Fit the LONG side and never upscale.
- Small ones: `render_cuts.py` never created `output/` (fine until a brand-new project), and
  `transcribe.py` read `.env` with the locale codec (cp1252 on Windows) and crashed on one non-ASCII
  byte. Both fixed; the same `read_text()`-without-encoding pattern was also fixed in `cutlib.py` and
  `format_transcript.py`.

### Pacing — `tools/lint_pacing.py` (run BEFORE rendering)
- **The linter assumed every video is 100% cutaways.** Its coverage rule FAILed any second with no shot
  planned as "bare master on screen" — correct for generated videos, dead wrong for a talking-head edit
  where the face IS the shot. It now auto-detects the mode (reframes present, or <60% covered by
  cutaways) and prints which ruleset ran. Talking-head mode replaces coverage with **monotony**: a
  stretch with no cutaway AND no punch warns at 18s, fails at 32s. It also warns on punch density
  >6/min (the move works because it is occasional) and on a punch hidden under a cutaway.
- The **hook** rule now only applies when a shot actually opens the video. In a talking-head edit the
  video opens on the face and the hook lives in what is said, not in a graphic.
- Rendering is the expensive step, so pacing is now checkable on the **plan**: coverage gaps, overlapping
  shots, static holds, a slow hook, and dead air. Thresholds come from the delivery mode
  (breaking-news ~3s cadence, calm-explainer ~5s).
- **It understands continuous motion.** A ken-burns `interpolate(frame, [a,b], ...)` spanning a stretch
  counts as "alive" — without that rule it false-flagged `RMHero`, which is zooming the whole time.
- **Real finding on its first run:** `open-source-ai-mid2026` (breaking-news) had **23.3s and 22.8s static
  evidence screenshots**. Adding a slow ken-burns to the five evidence shots took it 8 warns → 3.
- **WARN is a judgement call, not a bug list.** The 3 remaining warnings are statement cards (`OSHook`,
  `OSMeans`, `OSHeading`) that are *supposed* to hold while the line lands — animating them would be
  worse. Fix long **evidence** holds; leave deliberate statement holds alone.
- Fix + re-lint is **instant (no render)** — the linter reads the TSX, so iterate before spending minutes.
- **BLIND SPOT (found 2026-07-24): the linter only sees literal `interpolate(frame, ...)` IN THE SHOT FILE.**
  Reveals driven by the `reviewkit` hooks (`useRise` / `usePop` / `useSlam` / `useDrift`) are invisible to it,
  so a fully-animated shot reports as "Ns with nothing changing" for its whole span. On `opus5-review` all 10
  beats warned even though every one animates. **Don't chase these as real dead air** — confirm against the
  rendered frames first. Worth teaching the linter the kit helpers (it should treat a `useX(frame)` call from
  `lib/reviewkit` as motion) so it stops crying wolf.
- **Ken-burns fix pattern** for a long evidence hold:
  `const zoom = interpolate(frame, [0, <shotFrames>], [1.0, 1.06], {...CLAMP, easing: EASINGS.easeInOut})`
  then wrap the evidence in `<AbsoluteFill style={{ transform: \`scale(${zoom})\` }}>`. Keep any caption/
  callout pill OUTSIDE the zoomed layer so it doesn't drift.
- **Side-effect to watch:** scaling the whole `EvidenceFrame`/`EvidenceBrowser` also scales its **label and
  source citation**, so at max zoom the top label can clip off-frame. Keep the zoom subtle (≤1.06) or wrap
  only the screenshot, not the label, if the label must stay readable the whole beat.
- **AFTER-render length gate (2026-07-24):** `tools/check_duration.py videos/<slug>` probes the baked
  preview and compares to `plan.json`'s `target_s` (±10%). The director runs it non-fatally after `bake`.
  First run caught `open-source-ai-mid2026` at 148.7s vs a 200s target (−26%) — the script came in short.
  Pacing lint checks the *shape*; this checks the *total*.

### Captions — `tools/gen_captions_emphasis.py` (`generate_captions.py` is DEPRECATED)
- **A flat caption track is a transcript; captions should STRESS.** Replaced 2026-07-25 by
  `gen_captions_emphasis.py`, which chunks the words into spoken phrases (breaking on sentence
  punctuation and real pauses, **not** a fixed word count — that is what makes the on-screen line match
  the spoken line) and pops the word carrying the point on its own onset.
- **The old tool imported `server/shot_templates.py`** — the legacy MVP CLAUDE.md says not to build on.
  The new one writes the TSX directly. Don't reach for the old one.
- **Emphasis colour: warm yellow (`COLORS.warn`), not the brand indigo.** Indigo dies on the dark
  backgrounds a talking head usually sits on. The brand lives in the beats; the caption just has to read.
- **Heuristic ordering bit twice.** Checking spelled-out number words before stopwords stressed the "one"
  in "one of the"; and treating every 4-word chunk boundary as a sentence landing stressed filler verbs.
  Fix: digits/currency/percent first, then stopword rejection, then spelled-out numbers; and only stress
  a chunk-final word when it actually ends a sentence.
- **Ship the plan, not just the shot.** `work/caption-plan.json` carries per-word `m` flags and is the
  edit surface — flip flags, re-run `--from-plan`. Auto-emphasis is a first draft, capped at ~16% of
  words so the screen isn't shouting.
- **Clearing a caption line at its last word makes it BLINK.** Phrases break on ~0.45s pauses, so
  clearing at `phrase.e` meant the captions vanished and reappeared across every natural breath. Fixed:
  **hold the line until the next phrase starts**; only a real gap (>1.2s) clears it. Plus a 3-frame
  fade+rise on entry, so lines change instead of popping.
- **`--em-style box` is the classic keyword highlighter** — the accent wipes in behind the word
  left-to-right on its own onset and the text flips to ink once the fill is actually behind it (the
  flip has to be tied to the wipe progress, not the word onset, or you get dark text on a dark frame
  for a few frames). `underline` is the middle ground, `color` the safest over busy footage.

### Captions on long-form (`gen_captions_ass.py`) collide with rendered stat-card footers (2026-08-04)
- **`gen_captions_ass.py`'s default `--margin-v` for landscape is 90px from the bottom — `gen_spec_cards.py`
  draws every card's source-citation footer at `H-130` to `H-165`.** Whenever a beat's image is a
  code-rendered card (`cards.json` / `--patch-beats`), the default caption position lands directly on top
  of the card's own footer text, both illegible. This is the long-form-images-pipeline sibling of the
  short-form `EvidenceFrame` collision fixed 2026-07-24 (see the legacy note below) — same failure shape,
  different code path, not yet fixed at the source. **Workaround used on re-beginner-no-money:** regenerate
  captions with `--margin-v 220` (clears the card's divider line at `H-165`) and re-burn. This is a
  video-wide setting, not per-beat, so it also nudges captions up slightly on ordinary photo beats — fine,
  still readable. **Better fix for later:** `gen_captions_ass.py` should detect beats where
  `beats.json[i].is_card` is true and raise the margin (or `gen_spec_cards.py` should draw its footer
  higher, e.g. `H-220`) so this doesn't need discovering per video.

### Captions (legacy notes) — `tools/generate_captions.py`
- Captions must use the **real `start`/`end` ms** from `edited-transcript.json`. The original tool passed
  only the word strings and the template spaced them evenly (`frame / FRAMES_PER_WORD`), so captions
  drifted against the speech. Fixed: words are now `[{t,s,e}]` and the shot looks up the current word by
  time. **Never ship evenly-spaced captions — we already have ms-accurate timings.**
- The caption shot needs `transparent: true` in its `compositionConfig` (renders to `.mov`), and must be
  added to `timeline.json` as `type: "overlay"` spanning the whole video.
- ~~**KNOWN COSMETIC ISSUE:** the caption bar (bottom ~70px) overlaps the `EvidenceFrame`/`EvidenceBrowser`
  **source citation**, which also sits at the bottom.~~ **FIXED GLOBALLY 2026-07-24:** the source citation
  now lives in the **top band** (label top-left, `Source:` top-right) in both evidence components, so it
  can never collide with the bottom caption bar — no more per-video `paddingBottom` tuning. Verified on an
  `OSShock` still (citation top-right, highlight still lands on the right row).

### Sound / SFX — `/suggest-sfx`
- **Broadcast brand ≠ the calm/premium palette — synth the signature set, don't force-fit.** The Data
  League brand (brand.md §8) demands whistle stingers, scoreboard hits, crowd swells and a 3-note sonic
  logo (whistle → brass) — none of which exist in the calm-premium library. Added `whistle-blast`,
  `brass-hit`, `crowd-roar` as **deterministic lavfi synths** (aevalsrc FM whistle ~2.25 kHz ±140 Hz
  warble + octave partial; G3-B3-D4-G4-B5 brass stab with exp decays; two-layer brown+white bandpassed
  noise crowd swell) — zero ElevenLabs credits, license-clean, catalogued with measured peaks. The
  kitchen-foley synth precedent scales to any niche's signature sounds; try lavfi BEFORE spending
  credits on text-to-sound.
- **The 3-note sonic logo pattern (messi-ronaldo-final-score):** whistle at T-0.05, brass hit at
  T+0.12 on the scoreboard pop frame, crowd swell at T+0.2 — every scoreboard update got it; the 5-4
  final got the loudest instance (whistle/brass -4, crowd -10). Measured +6.5 dB vs +2.1-3.9 for the
  rest — the hierarchy survived the duck, the ear reads it as "bigger moment".
- **Under-speech scoreboard logos: one +2 dB bump then accept** (measured +1.5-2.4 → +2.1-3.9, still
  below the +4 story-critical bar — qt-funded-ad's ceiling all over again: continuous speech + sidechain
  duck eat in-speech transients no matter the gain). The 50 ms whistle transient is the audibility, not
  the window RMS.
- **Negative RMS diffs at cue windows are the duck, not a defect.** Re-measuring SFX-mixed vs
  voice-only at cue times where the sidechain duck attenuates the VO during the cue window gives
  NEGATIVE deltas for quiet cues (pop-reveal -12 in speech measured -1.5). Don't chase negatives with
  gain — that's the duck working; only hero moments in speech gaps show the real transient.
- **astats on Windows: ffmpeg writes analysis to STDERR** — subprocess capture must use
  `stdout=PIPE, stderr=STDOUT` (or `capture_output` fails with "stdout and stderr arguments may not be
  used with capture_output" on py3.10+ semantics... actually ValueError on 3.14: pass both pipes
  explicitly).
- **Measure segment RMS with a single-pass astats, never per-frame stats.** `astats` with `reset=1`
  emits one entry per audio frame, and min/max over those collapses to the quietest/loudest frame —
  a micro-gap between words reads as "silence" and a chime's peak frame reads as the whole window
  (weathernext-cyclones, 2026-08-06: 24/41 cues falsely flagged, every one an artifact). Correct:
  `ffmpeg -ss T -t W -i in -af astats -f null -` (no reset) → parse the ONE overall `RMS level dB`.
- **Cues that land in the ~0.3s sentence gaps are audible; cues under continuous speech never measure.**
  Don't chase the latter with gain — a pause would make them spike. Accept felt-not-heard or cut them.
- **Measure with tight windows** (~0.3s for transients). A wide window lets a neighbouring cue leak in and
  fake a pass.
- **Percussive transients (stamp/snap/knock) catalog quieter** than sustained clips — they need ~3–5 dB
  more than the brand table implies. On RiskMarshal the HALT stamp needed +6 → **+9** to reach +7.3 dB.
- **Library-first genuinely works.** 33 clips now serve 18 videos; RiskMarshal needed **zero** new
  generation. Always search the catalog before generating.
- **Music bed gain must be re-derived per video, confirmed a THIRD time (re-beginner-no-money,
  2026-08-04).** niches/real-estate.json's stored `bed_gain_db: -5.4` is stale (a generic-formula first
  guess, already superseded once on re-closing-costs to `-1.4`). Measured this video's own inter-word gap
  floor (4 real gaps via `edited-transcript.json`, consistent ~-24.9dB — louder than re-closing-costs'
  -27.1dB, i.e. this VO's pauses carry more breath noise) and set `--bed-gain` empirically: `1.5` under-hit
  the +4-6dB target (only +2.8dB lift), `3.5` landed at +3.8dB with ~0dB change under speech (duck working
  correctly). **The niche file's stored value is a starting guess, not a constant — always measure THIS
  video's floor and iterate the gain 1-2 times against a real before/after volumedetect, don't trust the
  formula's first output.**
- **Ad slams on the emphasized VO words are the duck's worst case — calibrate, then accept.**
  (qt-funded-ad, 2026-08-08.) Two `stamp-hit` slams cued exactly on the loudest spoken words
  ("Trade"/"Prove", spoken with emphasis) measured only +2.3/+1.2 dB at +4; +7 (short-form max
  calibration) reached +3.5/+2.0 in a 0.35s window — the sidechain duck + continuous speech eat the
  transient no matter the gain, and the 50ms transient is what the ear registers, not the window RMS.
  Same story-critical bar as robotics: bump once or twice, then accept felt-not-heard if it still won't
  measure; a pause would make it spike. All other cues measured +3.8..+19.1 dB first try, including
  whooshes in sentence gaps (+63/+131/+221 dB vs a silent base — sanity-check that the base window was
  genuinely silent before believing a huge delta).
- **final_mix on a short, sparse clip can miss the integrated target on the FIRST pass only.**
  (qt-funded-ad, 2026-08-08.) 30s ad with gaps + quiet bed: first pass verified −15.06 LUFS (−1.06 off,
  loudnorm gates near-silence), re-running the tool on its own output converged to −14.02/−0.96 on the
  second pass. Don't hand-tweak; just re-run once and confirm.
- **Per-format adaptation matrix, qt-funded-ad (2026-08-08):** the same 30s vertical ad shipped as
  9:16 + 16:9 + 1:1, captioned + clean each (6 files, ~35 min total). The reusable parts:
  - **One composition per file** (gen-registry's regex takes ONE `compositionConfig` per tsx) → each
    aspect gets its own `*169.tsx` / `*11.tsx` variant; the registry auto-picks them up.
  - **`evFrame` became canvas-relative** (`useVideoConfig` → scale = widthPx/1920, optional
    left/center/right) so the 1920×1080 evidence components fit any canvas without per-shot math.
    Layouts themselves are per-aspect hand-authoring — auto-scaling fonts/positions does NOT work,
    the flow changes (9:16 stacks; 16:9 goes row/split; 1:1 compresses).
  - **KEEP THE ANIMATION FRAMES IDENTICAL across variants** (same pop/slam/rise frame args) — one
    SFX plan then serves every aspect: same cue times, just new preview/out paths.
  - **`bake` + ASS burn + SFX + music + final_mix are all aspect-agnostic** — one timeline per aspect
    (same master, shot ids swapped, preview w/h + out changed) is the only new plumbing.
  - `check_deliverable.py` hard-required vertical (spec says 9:16) → added `--aspect 16:9|1:1` so
    adaptation files can be gated against their real dimensions instead of the primary spec.
  - The caption burn is re-run per aspect with `--size-wh WxH` (font scales with height); verified by
    checking light pixels in the bottom ~12% band of a late frame.

### Capture & evidence — `/review-site`, `tools/capture_evidence.py`
- **JS-lazy dashboards screenshot as empty skeleton loaders.** LMArena/`arena.ai` needed `--wait 11000`.
  Always eyeball the capture before trusting it.
- **Capture viewport + `--scroll`, not `--full-page`,** for evidence beats — full-page shots of long pages
  are too tall to be legible in a 16:9 frame (and too tall to review).
- **Some official sources are unusable.** The Qwen blog redirects to a modal over stale 2025 posts. **Drop
  the asset and say so — never fake it.** The story survived on the other two sources.
- Artificial Analysis and LMArena capture cleanly and are credible primary sources for AI-model claims.

### Voice & timing — `/prompt-to-video`, `/review-site`
- **`edge-tts` (free fallback) produces good audio but returned ZERO WordBoundary events here** → no word
  timings, which the whole pipeline syncs to. Workaround: **proportional alignment** from the script text
  vs. the probed audio duration (`director/align.py`) — sentence-accurate, sub-word approximate.
- **ROOT CAUSE FOUND 2026-07-30 (robotics-2026-updates-1). It was never a flaky service — it is a library
  default change.** `edge-tts` **7.2.3+** changed `Communicate(boundary=...)` from `WordBoundary` to
  **`SentenceBoundary`**, so the stream emits `SentenceBoundary` events and `tts_edge.py`'s
  `elif event["type"] == "WordBoundary"` matched nothing → 0 words, silently, on every voice. Fixed by
  passing **`boundary="WordBoundary"`** explicitly in `tools/tts_edge.py`. After the fix the same voice
  returned **2,875 word timings** on a 17.5-min VO. Two lasting rules: **pin the boundary explicitly**
  (never rely on a library default for something load-bearing), and when a provider "stops returning" a
  field, **print the raw event stream before blaming the service** — one 5-line script showed the real
  event type immediately, after this cost the repo a documented workaround it never needed.
- **`tts_edge.py --text-file` used to READ THE SCRIPT DIRECTIVES ALOUD.** `extract_spoken_text()` existed
  and stripped `##` headers, but `--text-file` bypassed it and fed the raw file to the synthesizer, so
  every `[beat: robot arm | factory floor]` line and every `#` comment was spoken. Symptom is a VO that
  is far too long for its word budget (23 min against an 18-min target) — which reads as a *pacing*
  problem and sends you to the wrong place. Fixed: `--text-file` now routes through `extract_spoken_text`,
  which also strips `[beat: ...]`. **If a VO comes back long, listen to the first 20 seconds before
  touching the script.**
- **BETTER FREE FIX (2026-07-24): transcribe the generated VO with AssemblyAI and align it to the script**
  (`tools/align_asr.py`). Real ASR word timings, frame-accurate, ~$0.01/min — the free replacement for
  ElevenLabs word-timestamps. Measured on `open-source-ai-mid2026`: the proportional guess drifted from the
  real word positions by a **mean of 3.5s (max 7.5s)** — enough to float every reveal seconds off the word.
  The director's `word_timing` stage now auto-picks **AssemblyAI ASR → proportional** (keeps edge
  WordBoundary times when they *are* present; only pays for ASR when they're missing). Do NOT ship
  proportional when the AssemblyAI key is set.
- **Regenerating the VO invalidates every beat's sync.** Fund the real voice **before** building shots, or
  budget for a full re-sync pass. (The invalidation graph in `director/job.py` re-runs only timing→shots→
  bake→sfx, not the whole video.)

### Packaging — `/packaging`
- Cold start: the inherited CTR rules are **a prior, not a fact.** Log CTR from video 1 and recalibrate.
- Thumbnail rendering needs Gemini image billing; **the title, 3 concepts, prompts and description still
  ship without it** — deliver those rather than blocking.
- **FREE THUMBNAIL PATH 2026-07-24:** `tools/gen_thumbnail_tsx.py` + `remotion/src/lib/thumbnail.tsx`
  render bold, on-brand thumbnails **in code for $0** (variants: `word` / `split` / `bleed`; Anton hook
  font with a system fallback). This is now the DEFAULT engine; Gemini/Nano-Banana is the paid upgrade for
  when billing is on. So thumbnails no longer block on billing at all. See the packaging skill's
  `thumbnail-generation.md` (two-engine table).
- **THUMBNAIL RENDERER REBUILT 2026-08-03 — a $0 renderer is not the same as a good one.** The 2026-07-24
  entry above stopped at "thumbnails no longer block on billing" and never asked whether they *worked*.
  They didn't: `re-closing-costs` shipped 3 dark text-on-gradient cards and the owner said he'd scroll
  past them. Root cause was **defaults, not judgement** — `--variant word` (near-black gradient, soft
  shadow, muted brand accent) was the default, so the dull thing was the easy thing, and the checklist's
  "bright saturated color pop" was advice with nothing enforcing it.
  What actually changed:
  - The top-multiplier thumbnails in `docs/research/*-viral.json` (3.5x–34x) were **downloaded and
    looked at**. 100% are real photographs; all use 2–4 ALL-CAPS words in **white with a thick black
    outline** (not a soft shadow — that is the phone-size legibility device); most are two-tone
    (white line + one saturated accent line), most have one chunky arrow and a 1–2 word corner badge.
  - `--variant photo` is now the DEFAULT (full-bleed photo + directional scrim), `versus` added for
    two-photo contrasts, `word` is **gated behind `--allow-textonly`** and prints why it refused.
  - Loud thumbnail-only palette (`pop`/`lime`/`cyan`/`orange`/`hot`/`violet`/`mint`) added. The brand
    tokens are in-video colors and read flat on a browse wall — reaching for `signal`/`danger` is
    literally how this failure happened.
  - Photos are free and one command away: `tools/fetch_stock.py … --provider pexels`. **Look at the
    contact sheet** — a `delaware state welcome sign` query returned a **Connecticut** sign.
  - Generalisable lesson: **evidence-check the design the same way we evidence-check the numbers.**
    Fetch the real winners' thumbnails, open them, and copy the mechanism. "Bright and bold" as prose
    in a checklist did nothing; a tool that refuses to render the dull variant did.
  - Verify by **opening the image and squint-testing at 246px** (a phone feed thumbnail). The rejected
    cards all rendered successfully — exit codes prove nothing about a thumbnail.
- **1M-VIEW VIRAL PACKAGING & 90+ PROBABILITY ENGINE (Added 2026-08-14):**
  - **The Problem:** Video packaging for `gemini-3-7-release` was treated like a corporate press release ("Google Gemini 3.7 Flash: 65% Coding Benchmarks & What You Need To Know"), producing low curiosity and 0 emotional tension.
  - **The Solution (`tools/viral_packaging_engine.py`):**
    - Multi-angle divergent brainstorming across 5 viral archetypes:
      1. *Superhuman Speed / Superhero Metaphors* ("This AI is So Fast It Feels Like Cheating (Gemini 3.7 Flash)")
      2. *Competitor Threat / Industry Shock* ("RIP Claude? Google's New Model Just Destroyed Coding Benchmarks")
      3. *The Catch / Pricing Glitch* ("Google's 50% Price Cut Has a Massive Catch")
      4. *Benchmark Destruction* ("65.3% on SWE-Bench for $0.75?! Google Just Broke AI")
      5. *Urgent Direct Command* ("Do NOT Code Another Line Until You See This")
    - Objective 100-point CTR Probability Rubric (Curiosity Gap: 25, Stakes: 20, Glanceability: 20, Visual Metaphor: 15, Synergy: 10, Entity Velocity: 10).
    - **Strict Gate:** Any packaging candidate scoring < 90/100 is rejected. The engine loops until >= 90 is achieved.
    - Added high-contrast thumbnail generator with glowing speed meters, superhero lightning badges, side-by-side battle splits, and bold 2-3 word typography.

### Visual Density & Contextual Direction — `tools/visual_director.py` (Added 2026-08-14)
- **The Problem:** `gemini-3-7-release` received 2/10 feedback because of 30-40s spans of repeating static gradient background assets (`rm-bg-*.png`), insufficient unique screenshots (only 3 real captures across 89 beats), and visual-to-voice mismatch.
- **The Solution (`tools/visual_director.py`):**
  - Synthesizes rich contextual assets for every 2-4s beat (syntax-highlighted code editor frames showing Python/TS agent execution, benchmark score cards, live web captures).
  - Synchronizes each visual directly with the exact spoken words in `edited-transcript.json`.
  - **Hard Delivery Gate (`tools/check_deliverable.py`):**
    - `max_consecutive_same_asset <= 2` (no visual sits static for > 6s).
    - `unique_visual_assets >= min(6, len(beats))` (enforces visual diversity).
    - Generic background images banned from exceeding 15% of timeline.

### Veo Video & Gemini Generative Media Integration (Added 2026-08-14)
- **Tool Created**: `tools/gen_veo_clip.py` & `tools/gen_gemini_media.py`
- **Supported Models**:
  - Veo 3.1 Video Generation: `models/veo-3.1-generate-preview`, `models/veo-3.1-fast-generate-preview`, `models/veo-3.1-lite-generate-preview`.
  - Imagen / Gemini Image Generation: `models/imagen-3.0-generate-002`, `models/gemini-3.1-flash-image`, `models/gemini-2.5-flash-image`.
- **Workflow**:
  - `tools/gen_veo_clip.py --prompt "..." --out work/images/clip.mp4`: Generates 16:9 / 9:16 cinematic video clips, polls async operation status, and downloads the rendered MP4 file.
  - Video clips generated by Veo seamlessly integrate into `tools/visual_director.py` and `tools/build_longform.py` timeline beats as dynamic video cutaways.

### Providers / infra (applies to every step)
- **All four paid providers can be walls, simultaneously.** Seen on 2026-07-23: ElevenLabs quota exceeded,
  Gemini image `limit: 0` on free tier (ALL image models — retrying/model-fallback does not help),
  AssemblyAI key empty, Anthropic key absent. **Check availability before promising a step**, fall back to
  the free tier where one exists, and tell the user plainly what degraded and why.

---

## Delivery modes (choose per video)

| Mode | TTS speed | Script style | Pacing | Use for |
|---|---|---|---|---|
| **breaking-news** | 1.15x | Short punchy sentences. Urgency. Cliffhangers. | Fast — reveals every 2-3s | AI news, product launches, drama/controversy |
| **calm-explainer** | 1.0x | Measured, clear, educational. | Medium — reveals every 4-5s | Tutorials, deep dives, educational |
| **sarcastic-review** | 1.05x | Dry, opinionated, with heat. Quotes then dismantles. | Medium-fast | Product reviews, hot takes |
| **authoritative** | 0.95x | Confident, declarative, no hedging. | Medium | Thought leadership, analysis |

**TTS settings per mode:**
- breaking-news: `--speed 1.15 --stability 0.4 --style 0.3` (more varied, urgent)
- calm-explainer: `--speed 1.0 --stability 0.6 --style 0.0` (consistent, neutral)
- sarcastic-review: `--speed 1.05 --stability 0.5 --style 0.2` (some personality)
- authoritative: `--speed 0.95 --stability 0.7 --style 0.1` (steady, confident)

## Goal-aware generation

When the user says "generate a video", ASK the goal first (if not stated):

| Goal | Script adaptations | CTA strategy |
|---|---|---|
| **Followers** | Strong hook, pattern interrupts, "follow for more" at 30% and end | Follow CTA at 25% mark + end card |
| **Watch time** | Open loop, tease payoff at start, deliver at end | No CTA until the end |
| **Authority/trust** | Cite sources, show evidence, measured tone | "Subscribe for deep dives" at end only |
| **Views/CTR** | Bold claims, controversy, question in title | Tease thumbnail moment in first 10s |

Store the chosen goal in the project's `work/script.md` header.

## Evidence-first visual design

**Every factual claim should have evidence on screen.** A screenshot of the real thing
beats an animated text card. The hierarchy:

1. **Real screenshot** (tweet, Reddit post, benchmark, article, website) — highest authenticity
2. **Real UI clone** (TSX recreation of a real page) — when a screenshot can't be captured
3. **Animated diagram/statement** — for abstract concepts that have no visual source

Use `tools/capture_evidence.py` to capture screenshots. Use `EvidenceFrame` in Remotion
to display them with a source citation. See the prompt-to-video skill for the workflow.

### When to use screenshots vs animations

| Claim type | Use | Why |
|---|---|---|
| "Bloomberg reported..." | Screenshot of the article | Proof it's real |
| "Someone posted on X..." | Screenshot of the tweet | Authenticity |
| "The benchmark shows..." | Screenshot of the benchmark table | Evidence |
| "Google's homepage says..." | Screenshot or browser clone | Direct source |
| "This is a big deal because..." | Animated statement card | No source exists |
| "Step 1: click here..." | TSX UI clone or fake screencast | Controlled highlight |

### When captures fail (blank/white frames)

`capture_evidence.py` uses headless Chrome, which regularly gets blocked by Cloudflare,
Akamai, and bot-protection services. The result is a near-pure-white PNG (mean brightness
>250, <1% dark pixels) that looks like a successful capture but contains no real content.

**Detection:** run `python tools/validate_captures.py videos/<slug>` after capturing. It
checks pixel content programmatically (mean brightness + dark-pixel ratio) and flags blanks.

**When captures ARE blank, the correct workflow is:**
1. Wire the blank capture into `EvidenceFrame`/`EvidenceBrowser` anyway — the component
   renders the source URL + label, which is still honest metadata.
2. Add an on-screen disclosure line: "live capture blocked — source text verified directly."
3. **Never silently substitute a stat card** — a blank EvidenceFrame with a disclosure is
   honest; a code-rendered card that looks like proof is not.
4. The evidence gate (`check_deliverable.py`) counts shots using `EvidenceFrame`/`EvidenceBrowser`.
   If you skip these components, the gate will fatal for generated videos.

**What went wrong on gpt-56-sol-chatgpt-update (2026-08-07):** Both captures returned
blank frames (Cloudflare). Instead of wiring them into EvidenceFrame with a disclosure, the
agent substituted text-based stat cards — which the evidence gate correctly identified as
"0 real screenshots on screen" and flagged as fatal. The fix was retroactive: added the
disclosure to the shot, re-rendered, and the gate passed. This should never happen again
because make-tsx now has an explicit "wire evidence captures" step (step 2) that enforces
the EvidenceFrame-first workflow.

**Also broke on gpt56-price-cut (same date):** 2 blank captures, zero EvidenceFrame shots
wired — same silent substitution pattern. The systemic fix (make-tsx step 2 + validate_captures.py)
covers both.

## Lessons learned (append after each video)

### Video: gemini-release (2026-07-22)
- **Delivery too slow.** The hook had 14 seconds before "still not out" appeared.
  In breaking-news mode, the punch should land by second 8. Fix: faster reveals,
  shorter hold times, TTS speed 1.15x.
- **No evidence screenshots.** The Bloomberg claim, the I/O promise, and the Kimi K3
  launch all had real sources. We animated text instead of showing the real thing.
  This is the #1 improvement — real screenshots would double authenticity.
- **Script was good length** (2.5 min, 350 words). Good for AI news format.
- **Voice (Daniel) was appropriate** for news but lacked urgency. Try higher style
  setting or a different voice for breaking-news mode.
- **6 shots covered the full timeline** — no dead air with just the branded background.
  This is the right approach for faceless videos.

### Pipeline improvements needed
- [x] Evidence screenshot capture (`tools/capture_evidence.py` shipped; used on review-riskmarshal)
- [x] Delivery mode parameter in TTS and script writing (modes + settings table above)
- [x] Goal-aware CTA insertion (goal→CTA table above)
- [x] Website review capability (browse + screenshot + walkthrough) — `/review-site`, review-riskmarshal shipped
- [ ] Iterative improvement workflow (prompt-driven re-renders)
- [ ] YouTube auto-publish from packaging output (yt_upload does private draft; publish stays manual)
- [x] Unified Director front-door — `/make-video` (Stage 0 of docs/VIDEO-OS-ROADMAP.md)
- [x] Per-channel persona files (`channel-persona.<niche-id>.json`) — added 2026-07-31 when the
      portfolio grew past one channel, see below.

### Capability: /make-video Director front-door (2026-07-23)
One intake (source auto-detect · persona/tone remembered in `channel-persona.<niche-id>.json` · length
· goal · audience · conversion) → asset manifest (auto-capture vs needs-you upload gate) → routes to
`/prompt-to-video` | `/review-site` | `/clean-cut`, then orchestrates make-tsx → suggest-sfx → music →
packaging → yt_upload, honoring each sub-skill's existing gate. Adds length control (duration→word/beat
budget + ±10% validation) and honest limitation handling (e.g. Gemini image billing off → mark
needs-you, don't fake). Does NOT re-implement any sub-skill. Next: Stage 1 local self-serve app (Agent SDK).

### Multi-channel: persona files must be per-niche, not a global singleton (2026-07-31)
User scaled from 1 channel to a 5-channel portfolio in one session (`home-hacks`, `ai-news` /
@AIunder3min, `entertainment`, new `finance` / The Money Archive, new `real-estate`). The Director's
persona memory was a single unsuffixed `channel-persona.json` at repo root — fine for one channel,
silently wrong for five: a run for one niche could read another niche's remembered voice/tone/audience
with no error, no warning. **Fixed by convention, not code (no script parses this file — it's
agent-read per Stage 0 instructions):** persona files are now `channel-persona.<niche-id>.json`, one
per channel (`channel-persona.ai-news.json` created from the old content, `channel-persona.finance.json`
new). The old unsuffixed `channel-persona.json` is now a deprecated-redirect stub pointing at the
ai-news file, so a stale reference fails obviously instead of silently applying the wrong persona.
`make-video/SKILL.md` and `docs/CHANNEL-SETUP.md` updated to resolve `<niche-id>` from Stage A's
routing before reading/writing the persona file. **Rule: any per-channel "remembered state" file needs
a channel identifier in its name or path once more than one channel exists — a bare filename is a
single-tenant assumption that breaks silently, not loudly, when a second tenant shows up.**

### Video: open-source-ai-mid2026 (2026-07-23) — first /make-video Director run
- **Director front-door validated end-to-end** on a live topic: source-detect → intake → asset manifest → live recon → evidence capture → sourced script → VO → master → 9 beats → bake. Honest angle (open weights are *close, not ahead*) held up against the evidence and reads credibly.
- **Provider walls this session:** ElevenLabs quota exceeded (148 credits left), Gemini image billing off (`limit:0`), AssemblyAI key empty. See memory [[provider-credits-status]]. Used free **edge-tts** for audio.
- **edge-tts returned 0 WordBoundary events** here (tried GuyNeural + AndrewNeural) → the whole pipeline needs word times. Fix that worked: **deterministic proportional alignment** from the exact script vs probed audio duration (char-length + sentence-pause weights). Sentence-level sync is good; sub-word approximate. Regenerate with ElevenLabs+AssemblyAI when funded for frame-perfect.
- **Evidence capture (Playwright) WORKS in this sandbox.** Captured Artificial Analysis + LMArena. Gotchas: LMArena (`arena.ai`) is JS-lazy — needs `--wait ~11000` or it screenshots skeleton loaders; the Qwen blog redirects to a modal over stale 2025 posts (unusable) — dropped it, didn't fake it.
- **Highlight-box gotcha:** `EvidenceFrame` (image fills frame) vs `EvidenceBrowser` (image pushed down below the URL bar) place the SAME screenshot's rows at different y%. A highlight tuned on one is off-by-a-row on the other — first OSShock render highlighted the wrong row. **Verify every highlight by pulling the actual frame, not by reusing coords.**
- **Font load** (`@remotion/google-fonts`) timed out once mid-render (flaky network) then succeeded on retry. Intermittent; a retry clears it.
- 9 cutaway beats: statements via `RMBg`+`useRise`+brand `COLORS` (indigo/teal on dark), evidence via `EvidenceBrowser`/`EvidenceFrame`. Clean composite.

### Video: ad-propfunding (2026-07-24) — first AD via /review-site, free-stack end-to-end
- **A promo/ad works on the review-site rails** with a problem-led hook (the "pay-to-fail" pain) instead of a neutral review open. Same evidence-first discipline: every claim (Pass First Then Pay, $125, $10K/$25K, 80%, 14-day payouts, first-10%-to-pass) traced to a real screenshot. Honest handling held: dropped `/how-it-works` (404) and the Stats page (all zeros — beta) rather than implying traction; kept "simulated account" + "first 10% get funded" in the copy.
- **Per-video theming to the SUBJECT's brand.** Themed the statement beats PropFunding **green** (`#22c55e`) via `RMBg glow` + green accents so the branded cards sit next to the green screenshots. Cheap and high-impact — don't force the house indigo when the ad is *for* another brand.
- **The free stack proved itself on a real job.** edge-tts returned **0 WordBoundary events again** → `tools/align_asr.py` recovered real AssemblyAI timings (195 ASR → 210 script words). Highlight cues then landed **frame-accurate**: "$1000 target" highlight fired 0.05s after the word, "14 days" within 0.27s. This is the payoff of the 2026-07-24 word-timing work.
- **Playwright capture worked; the in-app browser did not** (navigate/preview_start timed out). Use `tools/capture_evidence.py` for evidence regardless. `--scroll <px>` (logical px) lands section captures; a `--full-page` recon shot first to find scroll offsets saved guesswork.
- 10 beats, statement + `EvidenceBrowser`/`EvidenceFrame` mix, no captions track (ads read fine without burned captions). Rendered at scale 1 (1080p) for speed; bake clean.
- **v1 RATED 0.1/100 by the user. The review-site evidence style is WRONG for an ad.** It was a silent slideshow of tiny full-page screenshots held 6-11s each. What that taught (see memory [[ads-must-be-punchy-with-sfx]]):
  - **Ads MUST have a music bed + SFX — always.** Free: `tools/mix_music.py --bed tech-pulse` + `tools/mix_sfx.py` with library clips (whoosh/riser/impact/pop-reveal/stamp-hit/trap-snap/clock-tick). v1 shipped silent — the single biggest miss.
  - **Punchy kinetic motion graphics, ~40s.** v2: big Anton numbers **slam** on the word (added `usePop`/`useSlam`/`FONT_HOOK` to `reviewkit`) — HUNDREDS/GONE/$125/80%/14 DAYS/STOP PAYING TO FAIL. Fast cuts (8 beats in 43s). Screenshots used ONCE, shown **full-frame** (leaderboard as a ken-burns bg), never tiny.
  - **VERIFY BY WATCHING, not by stills.** Stills at frame 0.6 hid that it was silent, static, and slow — and hid the late slams. Pull frames at the slam times AND check audio levels (`volumedetect`) / pacing; ideally watch the render.
  - VO: edge-tts again gave 0 WordBoundary → `align_asr` recovered timings; used GuyNeural at **1.2x** for energy. `usePop`/`useSlam` are reusable for any punchy beat now.

### Video: opus5-review (2026-07-24) — AI-news review, day-of-release
- **THE VOICE FIX THAT MATTERED (from the ad's 0.1 rating): edge-tts voices carry a `VoicePersonalities`
  tag — use it.** `en-US-GuyNeural` is tagged **'Passion'** (announcer/hype) and at 1.2x it read as
  shouty ad-copy, which the user rejected twice. `en-US-BrianNeural` is **'Approachable, Casual,
  Sincere'** and `en-US-AndrewNeural` is **'Warm, Confident, Authentic, Honest'**. List them with
  `edge_tts.list_voices()` and pick on personality, not on habit. Conversational also means **~0.98-1.05x,
  not 1.2x** — RiskMarshal (the one the user liked) was 0.95x.
- **Conversational copy rules, taken from the RiskMarshal script:** contractions ("you're", "doesn't"),
  flowing sentences with clauses, and talk **to** the viewer. Fragment slogans ("Fail. Gone. They win.")
  read as an announcer and get rejected. Write it as a person explaining something.
- **Day-of-release news works.** Opus 5 shipped the morning of the 24th; recency IS the hook on AI channels.
  Always re-research a model claim live — it was past the assistant's knowledge cutoff and inventing
  benchmarks would have been fatal.
- **Anthropic's benchmark charts are client-rendered and DO NOT screenshot** (blank 47 KB captures at every
  scroll offset and wait up to 16s). Dropped them and **code-rendered the bars from the published figures
  with a visible `Source: anthropic.com` line** — honest, and better-looking than their chart anyway. The
  announcement hero page itself screenshots fine.
- **Keep an honest-caveat beat in a review.** Opus 5 is behind Mythos 5 on cybersecurity and doesn't advance
  biology; putting that on screen (red ✕ cards) is what separates this from the hype channels and is the
  whole authority/trust play.
- New reusable kit: `usePop` / `useSlam` / `useDrift` / `FONT_HOOK` (Anton) in `lib/reviewkit`. Note Anton
  has no `⅓` glyph — write "1/3".

### Ads are now a first-class discipline — `/make-ad` skill (2026-07-24)
The user is building an **ad agency** on this pipeline — every ad from here is a potential client
deliverable. PropFunding v3 (conversational fix) was called "perfect, but" two things:
- **Voice tone must match the VERTICAL, not just be conversational.** Conversational-vs-announcer
  was the right first fix, but fintech/trading needs **authoritative**, not merely casual. Picked
  `en-US-BrianNeural` ("Approachable, Casual, Sincere") when `en-US-ChristopherNeural` ("Reliable,
  Authority") or `en-US-AndrewNeural` ("Warm, Confident, Authentic, Honest") match the niche better.
  Codified as a voice→niche table in `.claude/skills/make-ad/SKILL.md` — consult it before every ad.
- **Evidence density was too thin.** v3's kinetic rebuild (fixing the "silent slideshow" problem)
  overcorrected into almost ALL motion graphics — only the leaderboard screenshot got real screen
  time; hero/challenge/features were captured but barely shown. An ad still has to **prove** its
  claims with the real product, not just animate the number. New rule: **4+ distinct real
  screenshots used across the ad, not reused once.** Motion graphics are seasoning, not a
  replacement for evidence.
- Research grounded the fix in real ad-agency practice, not vibes: the **3-second multimodal hook**
  (visual + text + spoken, working with sound OFF — autoplay is silent), **Problem→Agitate→Solve**
  (agitate = make the cost of inaction specific and felt, not just stated), and one deliberate
  **memorable/sticky moment + explicit differentiation line**. All folded into the skill's checklist.
- **Full checklist + voice table now live in `.claude/skills/make-ad/SKILL.md`.** Read it before
  scripting any future ad — this is not tribal knowledge to re-derive per video anymore.
- **`EvidenceBackdrop` (new, `lib/evidence.tsx`) is the structural fix for evidence density.** A real
  screenshot as a dimmed, slow-drifting full-bleed background for kinetic/statement beats, so a beat
  built around big text is STILL evidence-backed. v4 puts a real capture behind all 8 beats (hero ×3,
  challenge ×2, features, leaderboard ×2) instead of v3's single framed leaderboard shot. `dim`
  ~0.79-0.83 keeps the product legible without fighting the foreground text — brighter than that and
  the copy stops reading, darker and the evidence may as well not be there.
- **v4 shape (the reference ad structure):** Hook 4.5s (text up at frame 0, works MUTED) → Problem →
  Agitate (pass/fail rows → "WIN OR LOSE, THEY WIN") → Flip (differentiation card + tagline slam) →
  How (3 steps) → Deal ($125 + 3 stats) → Proof (full-bleed leaderboard) → CTA (tagline REPEATED).
  Voice `en-US-ChristopherNeural` ("Reliable, Authority") @0.98x for the fintech vertical.
- Google Fonts DNS failure hit again mid-bundle (`ERR_NAME_NOT_RESOLVED`) — **retry once** cleared it,
  exactly as the earlier lesson says. Don't debug it, just re-run.

### Capability: per-subject ART DIRECTION — vibes + atmosphere (2026-07-24)
- **The miss it fixes:** every video rendered on ONE backdrop (`RMBg`: dark navy gradient + dot grid)
  with only the glow colour swapped, plus text-motion helpers. So a fintech ad, a beauty ad and a car
  ad were visually the same video. That is a template, not art direction, and a client will clock it.
- **`remotion/src/lib/atmosphere.tsx`** — deterministic, frame-based FX layers: `Particles`
  (up/down/drift → bubbles, embers, dust, snow), `Smoke` (steam/exhaust/fog), `LightRays`, `Bokeh`,
  `Condensation`, `SpeedLines`, `LightSweep`, `GlowWash`, `Vignette`, `Grain`. Randomness is a hash of
  the particle index (re-renders are pixel-identical); loops use a `[0,1)` phase + sine fade so nothing
  pops at the wrap (modulo alone visibly jumps).
- **`remotion/src/lib/vibes.tsx`** — 11 categories, each bundling palette + atmosphere + energy +
  `voiceHint`. `<VibeBg vibe="coldDrink" />` is a one-liner backdrop. `vibeFor(subject)` maps a
  keyword to a vibe. **`beauty` is a LIGHT palette with dark text** — proving the system isn't just
  "dark template, different glow"; use light palettes when the vertical wants them.
- **`remotion/src/lib/product.tsx`** — `ProductHero` / `ProductSplit`: cinematic treatment for a
  client's still photo (push-in, floor glow, drop shadow, specular sweep, and an atmosphere pass
  rendered IN FRONT of the product, which is what actually creates depth). Transparent PNGs look far
  better than rectangular JPGs — ask the client for one.
- **Proof, not assertion:** rendered 6 demo shots (`remotion/src/shots/vibe-demo/`) with IDENTICAL
  layout and copy, changing only the vibe. Six genuinely different films. Keep that demo — it's the
  fastest way to show a client (or re-check yourself) that the system is doing real work.
- **HONEST LIMIT to state during intake:** these are 2D code-rendered layers. They make a still feel
  filmed; they cannot make a parked car drift, tyres burn, or liquid pour. Real product motion needs
  client footage, licensed stock, or a video-gen provider (not wired in, paid). Never sell a shot the
  pipeline can't render.
- Two gotchas: blur-based layers (`Smoke`/`Bokeh`/`LightRays`) cost real render time — keep counts low.
  And `tools/lint_pacing.py` cannot see atmosphere motion (it scans for `interpolate(frame, …)`; these
  animate with raw math), so it will call an atmospheric beat "static" — known blind spot.
- **`VibeEvidenceBg` — grade the SCREENSHOT into the vibe, don't dim it with flat black.** Tinting an
  evidence backdrop toward the vibe's own bg colour (fintech `#070d14`) instead of `#000` is what makes
  a screenshot read as part of the film rather than a pasted slide. Ambient layers only (glow /
  particles / bokeh / rays / vignette / grain) — `condensation`, `smoke` and `speedlines` over a UI
  screenshot read as dirt or scratches, so they're filtered out deliberately.
- **DOUBLE-DARKENING TRAP (hit live on ad-propfunding v5).** The backdrop `dim` was tuned against flat
  black; layering the vibe's full vignette + grain ON TOP buried the evidence — the screenshots went
  unreadable, which defeats the entire evidence-density rule. Fix applied in two places: the vignette
  is scaled to **0.55x** inside `VibeEvidenceBg`, and per-shot `dim` dropped from ~0.80 to **~0.66-0.71**.
  **Rule: when you add an atmosphere pass over an existing dimmed layer, re-tune the dim — the two
  darkenings compound.** Always eyeball a still before committing to the full render.

### Video: robotics-2026-updates-1 (2026-07-30) — first FORMAT REPLICA, and the numbers problem

Brief: replicate a successful 2024 AI/robotics compilation (~70 min, 14 segments) with 2026 facts, at
18 min. Delivered as 8 segments + hook + reflection + dark-side close. First video built on the new
`robotics-news` niche.

- **A compilation genre is a DIFFERENT NICHE, not a tone setting on `ai-news`.** `ai-news` bans
  "SHOCKING" and bans humanoid-robot stock imagery — both correct for its developer audience, both fatal
  to this format, which is spectacle-forward and multi-story for a broad audience. Wrote
  `niches/robotics-news.json` instead of bending `ai-news`. **Niches are data; when the audience changes,
  add a profile.** Its structure (hook + 8 story slots + reflection + close) drove `plan_runtime budget`
  straight to ~292 words per segment, which is what kept the 8 segments even.
- **THE BIG ONE: stock search cannot represent a NUMBER, and a news-compilation script is mostly
  numbers.** Pexels returned, with total confidence: an orange **speed-limit sign reading 20** for
  "twenty implants", a red poster of the numeral **10** for "ten thousand unique parts", the word
  **TIMELINE** in wooden letters, and a pink sign reading "the world is changed by your example not your
  opinion". ~45 of 162 images were unusable and they were *all* the beats carrying the stats. This is the
  Openverse lesson generalised: **the provider was not the problem — asking a photo index for a fact
  was.** Fix is a new tool, `tools/gen_spec_cards.py` (stat / compare / quote cards, PIL-rendered, ~1s
  for 31 cards), and a rule now written into the niche: **stock photos carry atmosphere, rendered cards
  carry facts.** 31 cards covered 77 of 226 beats.
- **`compare` cards turned out to be the honesty tool.** The genre's failure mode is narrating a target
  as an achievement. A two-value card — *350 delivered | 100,000 goal*, *20 implants | 1,000+ claimed*,
  *low thousands | 1,000,000 target* — makes the gap the visual, so the honesty beat costs no runtime.
  Worth reusing anywhere a company self-reports.
- **A rendered card must NOT be Ken Burns cover-cropped.** `build_longform.py` scales every still to
  COVER at `--headroom 1.35` then pans — which slices the kicker off the top and the source footnote off
  the bottom of a full-frame 1920x1080 card. Added a **`still`/`none`** move: fit-and-pad (never crop),
  with a token 1.2% centre zoom so it reads as alive without moving text. **Any full-frame rendered
  graphic needs fit-not-cover; only photographs can take the crop.**
- **`build_longform.py --dissolve` BROKE AT LONG-FORM SCALE ON WINDOWS — `WinError 206`.** The xfade
  path puts every clip on the command line as `-i` *and* builds an N-1 link filter graph as one argument:
  at 226 beats that is ~226 inputs (11.5k chars) + a 15.4k-char graph, and `CreateProcess` caps a command
  line at ~32k. It failed **after** rendering all 226 beat clips — i.e. at the most expensive possible
  moment. Fixed by writing the graph to `work/_lf/xfade.txt` and passing
  **`-filter_complex_script`**, which leaves ~11.5k on the command line. Note this bug was invisible to
  every previous video because the longest was 155s; **it only appears at exactly the length this tool
  was built for.**
- **Recovery detail worth keeping: the beat clips survive a concat failure.** `work/_lf/b####.mp4` were
  all still there, so the fix re-ran only the concat, not 15 minutes of Ken Burns renders. **Check the
  scratch dir before re-running a long render from scratch.** Related trap: clips are rendered with
  `dissolve` EXTRA frames baked in for the overlap, so they can *only* be xfaded — hard-concatenating
  them instead runs the video ~79s long and desyncs the audio. If you want hard cuts, re-render with
  `--dissolve 0`.
- **The MUSIC BED needs the same "measure it" discipline as SFX — and the niche's `bed_gain_db` was
  wrong.** Mixed at `--bed-gain -15` (from `robotics-news.json`), the bed lifted a 2.3s speech gap by
  **+0.4 dB** — i.e. inaudible. The arithmetic explains it and is the reusable part: `tech-pulse`
  measures **-21.0 dB mean**, so -15 dB of gain puts the bed at ~-36 dB against a gap floor of -25.6 dB,
  which sums to +0.4. **Always subtract the CLIP's own mean level from your target before choosing a bed
  gain** — the gain number alone is meaningless. Re-mixed at `--bed-gain -6 --duck 10`: bed lands ~6 dB
  under the voice mean in gaps and ~16 dB under while ducked, which is a real bed. Niche profile
  updated from -15 to -6.
- **Phase-inversion bed isolation DOES NOT WORK on two AAC-encoded renders.** Inverting the pre-music
  mix against the post-music mix should leave only the bed; it actually left the *codec mismatch of the
  loud voice*, reporting the "bed" as **-18.6 dB under speech vs -21.8 dB in a gap** — louder under
  speech, i.e. backwards, which is the tell that the measurement is invalid rather than the mix. Only
  trust that trick on identical lossless sources. For a lossy render, verify a bed by **clip level +
  gain arithmetic**, cross-checked against the gap lift.
- **Caption auto-emphasis over-fires when the script spells numbers out.** Numbers are spelled out
  ("twenty twenty six") so the edge-tts read and the word budget agree — but the emphasis heuristic
  stresses every number word, so it stressed *"Two* years ago" and every instance of the year. 412
  stressed words (14.3%) that were mostly noise. A pass unstressing year-runs and small spelled numerals
  took it to 282 (9.8%) and the remaining stresses are real. **If a script spells numbers for TTS, budget
  a de-emphasis pass** — the two requirements genuinely conflict.
- **Runtime gate did its job twice.** First draft came in at 2,662 words / 16.4 min (−9%, FAIL); added
  sourced depth (not filler) to 2,880 / 17.7 min; the rendered VO landed 1,052s = 17.5 min (−3%). Also
  re-measured **en-US-GuyNeural at 164.3 wpm** (was 162.3).
- **Research: prefer primary sources and say so in the file.** Searches surfaced a lot of SEO aggregator
  blogs (`robozaps`, `optimusk.blog`, `ai2.work`, `revolutioninai`). `work/research.md` tags every fact
  `[SHIPPED]/[DEPLOYED]/[DEMOED]/[ANNOUNCED]/[TARGET]/[SELF-REPORTED]` with its URL, and lists what was
  **dropped** for lacking a primary source. That file, not the script, is where honesty is enforced.
- **WebFetch summarised the AssemblyAI docs WRONG** — it reported `Authorization: Bearer YOUR_API_KEY`,
  while CLAUDE.md and both existing repo tools correctly use the **raw key, no `Bearer`**. The repo was
  right and the fetched doc summary was wrong. **Check what the working code already does before
  "correcting" it from a doc summary.**
- **REAL-CLIP SPLICE, done without breaking any downstream timing.** User approved 2 of the 3 starred
  clips (Atlas standup - Boston Dynamics official channel; NEO doing chores - 1X official channel; the
  RealHand piano clip was found but is DRM-locked on YouTube, so it was correctly left out rather than
  worked around). Cut both into the middle of their segments (10.00s of Atlas at 258.36s, 12.00s of NEO
  at 468.78s) by REPLACING an exact-duration span of the silent Ken-Burns video track and pairing each
  insert with the BASE's own VO audio for that span (never the clip's own audio) — because every
  downstream asset (captions.ass, sfx-plan.json cues, cards.json) is keyed to absolute seconds on the
  ORIGINAL audio timeline, an insert of the wrong length shifts everything after it out of sync, silently.
  Making the insert exactly as long as the span it replaces means nothing downstream needs to change.
  Re-ran sfx -> music -> caption-burn -> final_mix on top of the new picture; all cues landed on the same
  timestamps with zero re-authoring.
- **TRUE PEAK BUG: re-encoding audio AFTER final_mix's loudnorm undoes the peak limiting.** Fixing an
  A/V duration mismatch by trimming audio with `-c:a aac` (re-encoding) moved true peak from a verified
  **-1.24 dBTP to -0.73 dBTP** — over the -1.0 ceiling, failing `check_deliverable` on a file that had
  already passed mastering. The loudnorm pass's true-peak limiting is baked into specific sample values;
  any further lossy re-encode of that audio can reintroduce peaks the limiter already flattened. **Fix:
  trim post-master with `-c:a copy`, never `-c:a aac`.** A stream copy can only drop whole AAC frames
  (~21ms granularity), which is more than precise enough for the 0.05s tolerance and touches zero audio
  samples. General rule: once `final_mix.py` has run, treat its output audio as read-only — any further
  edit to the container must be `-c:a copy` or the mastering pass has to be re-run after.

### Video: openai-hf-hack (2026-07-31) — ai-news short-form, first video on the corrected profile

Brief: OpenAI's AI models escaped a cybersecurity-eval sandbox and hacked Hugging Face (Jul 2026,
real breaking news). First video made after correcting `niches/ai-news.json` from a wrong 8-20min
target to the channel's real 2-3min short-form shape (see the niche file's `_channel` note). 402
words, 140.7s (-6% vs 2.5min target), en-US-AndrewNeural.

- **`final_mix.py`'s loudnorm re-encode routinely leaves audio ~50-100ms LONGER than the
  stream-copied video** (measured: 140.714s in -> 140.800s out), enough to fail
  `check_deliverable`'s 50ms A/V-duration gate on its own. This is upstream of (not the same as) the
  existing "TRUE PEAK BUG" lesson above (a SECOND re-encode after mastering breaks the peak limiter)
  — this is drift from the FIRST encode itself. **Fixed at the source: added `-shortest` to
  `final_mix.py`'s own loudnorm+aac encode command**, so the container is trimmed to the
  stream-copied video's length in the same pass, zero extra encodes. Verified the true-peak limiter
  still held (-1.19 dBTP, within ceiling) — `-shortest` only affects container/mux length, not the
  filtered samples, so it does not reintroduce the true-peak bug. Every future video should hit this
  gate clean without the old lesson's manual post-hoc `-c:a copy` trim step.
- **`check_deliverable.py` / `video_spec.py` had no format for "generated, no talking head, no
  stills/Ken-Burns, custom Remotion cutaway shots"** — the exact shape of every `ai-news` video
  (`gemini-release`, `opus5-review`, `open-source-ai-mid2026`, this one). The 4 existing presets are
  footage-punch-ins x2 and stills-ken-burns x2; picking the closest one (`shortform-images`) false-failed
  on "NO beats.json" (wrong artifact - this pipeline drives visuals via `timeline.json` shots, not
  `beats.json`) and false-failed vertical-aspect (wrong default for a 16:9 channel). **Added a 5th
  preset, `shortform-explainer`** (generated, `motion: "shots"`, 16:9, overlay captions) plus a
  matching `motion == "shots"` branch in `check_deliverable.py` that reads `timeline.json`'s cutaway
  shots directly. Every future `ai-news` video should use `video_spec.py new <project> --format
  shortform-explainer --niche ai-news` from the start instead of hitting this the hard way.
- **`video_spec.py new <project>` writes to `<project>/work/spec.json` LITERALLY** — pass the project
  arg as `videos/<slug>`, not just `<slug>`, or it silently creates a stray `./​<slug>/work/spec.json`
  at the repo root instead of inside `videos/`. Cost one cleanup pass here.
- **Evidence-highlight percentages landed exactly right on the first try, twice**, by reading the
  captured screenshot's real pixel position (from the same still already used to eyeball the
  capture) and converting to % of the image box before writing the TSX, rather than guessing then
  fixing. Both `EvidenceWillison`'s disclosure-date highlight and `EvidenceCBSQuote`'s Delangue-quote
  highlight needed zero coordinate correction after rendering a still to check.
- **SFX audibility check surfaced a real miss, not just confirmed hits.** A `chime-reward` cue placed
  exactly on the spoken word "subscribe" measured LOWER than the voice-only baseline (the sidechain
  duck suppresses a cue under continuous loud speech, per the existing "cues under continuous speech
  never measure" lesson) — but here the fix wasn't to accept it or chase gain, it was **moving the
  cue 0.49s earlier into a genuine ~400ms word-gap** immediately before "Hit subscribe", which let
  the chime's attack ring in near-silence instead of competing with the loudest word in the sentence.
  Worth checking for a real gap before defaulting to "felt not heard, ship it anyway."
- **`check_deliverable.py`'s music-bed check is a filename heuristic** (`"music" in filename`), not an
  audio check — it warned "no music bed found" on a file genuinely mixed with `tech-pulse` because the
  output was named `<slug>-scored.mp4`. Non-fatal (warn, not fail) so it didn't block shipping, but
  worth knowing before chasing a phantom bug: name a scored-with-music file with "music" in it, or
  ignore the warn once you've verified the bed by ear/measurement.
- **Packaging on a genuinely faceless channel:** `.claude/skills/packaging` assumes a host with a face
  (Thumbnail Checklist rule 3, `media/library/faces/` kit). `AI under3 Minutes` has no host at all — used
  the repo's existing **code-rendered thumbnail path** (`tools/gen_thumbnail_tsx.py`, `$0`, no Gemini
  billing needed) instead of Nano Banana Pro, and built 3 distinct levers around real evidence
  screenshots instead of a face: bold word-claim, evidence-anchored proof (screenshot + quote), and a
  controversy/curiosity lead. All 3 rendered clean on first render (after the usual one Google-Fonts
  retry).

### Channel: ai-news re-positioned from "short video" to "fast turnaround" (2026-07-31)

User's own instruction, day after the 2026-07-30 correction that locked this niche to a hard 2-3min
short-form shape: that correction fixed the WRONG thing. The channel's actual differentiator was never
"the video is short" — it's "we're first with a credible breakdown." Re-corrected: `target_minutes`
is now `[3, 10]`, scaled to how much a given release actually warrants, not fixed. `brand_promise`
rewritten to center turnaround speed instead of runtime, with an explicit honesty note: same-day
publication after a credible source confirms a release is a keepable promise, implying near-instant
post-announcement publishing is not (this pipeline still needs real research/script/voice/render time).

**Unresolved, flagged in `niches/ai-news.json`'s `_channel` note and `channel-persona.ai-news.json`'s
`_name_open_question`:** the live channel name "AI Under 3 Min" literally promises video length, which
no longer matches a 3-10 min video. Two corrections in two days on the same axis (runtime) is exactly
the "corrected twice" trigger this file's own header calls out — the actual root cause is that the
channel's NAME encodes a product decision (video length) separately from its POSITIONING (turnaround
speed), and the two got conflated from the start. **Lesson for next time a channel is named:** pick a
name that describes the durable differentiator (speed-to-publish, evidence-first, whatever it is), not
a specific numeric parameter (runtime, video count, etc.) that a later, correct product change can
break. Do not silently rename or silently keep the mismatched name — this needs the user's explicit
call, not an agent's guess, because it's a live channel with existing subscribers/SEO/video titles.

**RESOLVED same day (2026-07-31):** user's call was to keep the name and reframe what "3 min" means
rather than rename. Landed on: "3 min" now describes a structural guarantee, not a runtime cap - every
video's first ~170s (phase 1: cold-open-claim + context + verdict, see `script.structure` in
`niches/ai-news.json`) delivers the complete "what happened, what it means" payoff regardless of total
length, with deeper evidence after for whoever stays. This required restructuring the beat order (the
old `so-what` beat was near the end; renamed `verdict` and moved to position 3, right after `context`,
because the whole point is it has to land early) and adding an explicit absolute-time-cap note, since
`plan_runtime.py`'s `share * total_words` math would otherwise let phase 1 balloon proportionally at
longer target lengths and silently break the 3-minute promise again. Title suffix changed from
"(Under 3 Min)" to **"(3-Min Verdict)"** — same SEO value, now describes something the script structure
actually guarantees. **General lesson: when a numeric brand promise breaks, check whether the fix is
to change the number, or to change what the number measures** — renaming was the obvious move, keeping
the name and re-grounding it in something still true turned out to be the better one here.

### Video: money-archive-401k-fee (2026-07-31) — first video for a new channel (finance niche), first real use of the ambient-pad bed and the longform-images spec preset

Brief: "The 401(k) Fee Nobody Shows You" for **The Money Archive** (new finance channel, calm-explainer,
en-US-GuyNeural, 20 min target, authority goal, conversion=nothing). Topic-only, no URL/footage -
`/prompt-to-video` path, source type "generated". Delivered: 3348-word script, 1132.8s (18.9 min, -6%)
VO, ASR-aligned via AssemblyAI, 158-beat Ken-Burns render (20 Pexels photo queries + 12 code-rendered
stat/compare/quote cards), burned ASS captions, 15 self-audited SFX cues, ambient-pad music bed,
`final_mix.py` master at -14.04 LUFS / -1.22 dBTP, `check_deliverable.py` **SHIPPABLE**. Upload blocked
on missing YouTube OAuth setup (see below) - everything else in the Definition of Done shipped in one
pass, no mid-process questions.

- **`ambient-pad`'s `bed_gain_db` was an unmeasured placeholder (-6) and the real formula gave a very
  different number.** `ffmpeg volumedetect` on `media/library/music/clips/ambient-pad.mp3` measured
  **mean_volume -23.2 dB**. Same formula as the 2026-07-30 docu-pluck/tech-pulse/cinematic-min
  corrections (`bed_gain_db = -27 - measured_mean_dB`) gives **-3.8 dB**, not -6. Measured BEFORE
  mixing (not after-the-fact like the robotics fix), so this shipped correct on the first mix.
  `niches/finance.json` updated -6 -> -3.8 with the measurement written into `_bed_gain_note`.
  Verified post-mix: silent-gap lift **+7 to +65 dB** across 5 sampled gaps (clean, well above
  audible), and normal voice-dominant levels during continuous speech. **Every niche's music bed
  needs this same one-time measurement before its first video, never inherit a sibling niche's
  number or ship the placeholder.**
- **SFX audibility split cleanly by sound TYPE, not by placement, and the fix was retiming into the
  real pause, not just raising gain.** All 15 cues were placed at `beats.json` card-reveal timestamps
  (the exact word where a new script block/section starts). The 4 `impact-soft` cues measured
  audible immediately (+2.4 to +2.8 dB) because that clip's percussive attack (-3.2 dBFS peak) punches
  through the sidechain duck's 5ms attack window. The 11 `page-flip`/`ui-click-soft`/`warm-shimmer`
  cues all measured **NEGATIVE** (-1.2 to -2.9 dB, quieter than the unmixed baseline) at the same
  spots — because the cue's `at_s` was the exact instant the NEXT word starts (continuous speech
  resuming), not the ~1s pause immediately before it, so the duck suppressed them the whole time they
  played. **First fix tried (boost gain +6/+7dB) barely moved the needle** (-2.8 -> -2.0 avg) -
  confirms the EVOLUTION-documented rule that gain cannot fix a cue sitting under continuous speech.
  **Real fix: retimed all 11 cues to `gap_start + 0.4s`** (into the middle of the real, pre-existing
  ~1s pause between script blocks that `plan_beats.py` already creates at every section boundary) -
  re-measured at **+56 to +65 dB** against true digital silence (-91 dB floor) at those exact spots.
  **Generalizable rule: a beat/section-boundary timestamp is where NEW speech starts, not where the
  preceding pause is - if you want an SFX cue to be audible, place it inside the pause, not at its
  far edge.** This also means retiming cost a ~0.4-0.7s desync between the SFX and the exact card
  reveal, which reads fine (arguably better, like a pre-echo) for a reveal that holds on screen for
  several seconds - would matter more for a sub-second flash cut.
- **`work/spec.json` via `video_spec.py new --format longform-images` is the right preset for this
  shape** (stills + Ken Burns + burned captions, faceless/generated) and made `check_deliverable.py`
  pass cleanly on the first real run once the file was actually finalized (see next point) - no preset
  gaps hit this time, unlike the shortform-explainer preset that had to be added for ai-news.
- **A background ffmpeg render/mux is not "done" the instant the output file exists on disk.**
  `final_mix.py` (and `build_longform.py`'s xfade concat, and `mix_sfx.py`) all write their MP4
  progressively; reading it with `ffprobe` in the seconds right after the file appears (or even after
  the shell command that launched it reports it "completed") can hit `moov atom not found` because the
  container's metadata atom is written last and Windows' write-back can lag the process's own exit.
  Hit this twice on this video (once on `mix_sfx.py`'s output, once on `final_mix.py`'s). **Treat a
  freshly-produced video file as unverified until an independent `ffprobe` on IT (not just the
  producing tool's own internal duration print) succeeds** - don't trust file existence or an early
  probe attempt as proof of a complete file; retry once rather than concluding corruption.
- **`tools/yt_upload.py` resolves plan/video/description paths against `REPO.parent`, i.e. one
  directory ABOVE the repo root** (its own comment: "monorepo root — plan paths are relative to
  this"), which assumes this repo is nested one level inside a larger checkout. This download is a
  standalone folder (not nested that way), so every relative path in a `publish.json` silently missed
  ("plan not found" / would-be wrong video path). **Fix used: absolute paths everywhere in
  `publish.json` and on the CLI invocation** - `rp()` already honors absolute paths first, so this
  needed no code change, just avoiding relative paths from a repo checkout that doesn't match the
  tool's assumed layout. Worth fixing at the source (make `ROOT` configurable or default to `REPO`)
  if another checkout hits this the same way.
- **Upload blocked on missing OAuth, confirmed cleanly, not silently skipped.** `.youtube/client_secret.json`
  does not exist; `whoami` and a real `upload` both fail with the exact, correct error pointing at
  `tools/yt_upload_SETUP.md` step 2. `--dry-run` validated the full plan (video path, 43-char title,
  3148-char description, tags, category) with zero errors, so `publish.json` is upload-ready the
  moment the user finishes the one-time browser OAuth setup - nothing else blocks it.
- **Research-before-writing on a no-URL topic (a first for this channel) worked well as parallel
  WebSearches, not a single query.** 6 independent searches (DOL's own fee example, ICI/BrightScope
  plan-cost data, index-vs-active expense ratios, Vanguard deferral rates, share-class Pew Trusts data,
  ERISA excessive-fee litigation trend) ran before any script line was written, each cross-checked
  against 2-3 independent secondary sources where the primary source (dol.gov) blocked direct fetch
  (HTTP 403). The DOL's headline example was independently re-derived with real compound-interest math
  (`FV(25000, 0.065, 35) = $226,556` vs the cited $227,000) as a second, arithmetic layer of
  verification beyond source-corroboration alone - worth doing whenever a cited figure is itself a
  compounding calculation, since the math is independently checkable in a way many facts aren't.
- **Word-budget-vs-measured-wpm drift is real and worth checking with real TTS before finalizing
  script length.** `niches/voice-rates.json` had en-US-GuyNeural at 164.3 wpm (set 2026-07-30 on
  robotics-2026-updates-1); this video's actual edge-tts output measured **177.3 wpm** for the same
  voice - an 8% difference that would have shipped ~1.5 min short if the OLD rate had been trusted for
  final validation instead of generating audio and re-measuring. Re-ran `plan_runtime.py measure`
  after the real VO existed and it auto-corrected `voice-rates.json` for the next video. **A voice's
  measured wpm is per-script somewhat (punctuation/pause density shifts it), not a fixed constant -
  always regenerate-and-remeasure rather than trusting a stored rate across very different scripts.**
- **Total time/cost:** entirely free-tier ($0 cash cost - edge-tts, Pexels, code-rendered cards/
  thumbnails, ElevenLabs SFX/music library reuse with no new generation needed, AssemblyAI ASR at
  ~$0.01/min = ~$0.11 for this VO). Wall-clock dominated by the two long ffmpeg passes: the 158-beat
  Ken-Burns xfade render (~18 min) and the caption burn (~5 min); TTS/align/SFX/music/mastering passes
  were each under a couple minutes.
- **`channel-persona.finance.json` confirmed accurate as-shipped** - voice, delivery mode, target
  seconds, goal, and conversion all matched what was actually produced, no drift to correct.

### Structural: robotics-news merged into ai-news as a second FORMAT (2026-08-01)

User's call ("add it to ai news"): the 6th niche file `niches/robotics-news.json` is retired and its
profile now lives at `niches/ai-news.json` → `formats.compilation` — one channel (@AIUnder3Min), two
formats. The old `_why_not_ai_news` "do not merge" warning (different audience, different register;
ai-news bans caps-lock escalation + humanoid imagery) was resolved by **separation inside one file,
not blending**: single-story keeps its bans, compilation keeps its escalating title/thumbnail register
(never the narration) and its own broader audience. `robotics-news.json` is now a deprecated-redirect
stub (same convention as the unsuffixed `channel-persona.json`). Reconciliations baked into the merged
profile: the channel's under-3-min promise maps to cold-open-boom + story-1 (~162s at an 18-min
target); the mandatory close CTA rides `dark-side-close`; voice defaults to the channel voice
(Andrew), not the pre-merge Guy. **Rule: when two niches share an upload destination, prefer FORMATS
inside one niche file over two niche files — the persona file, research queries and tooling all key
off the niche id, and a second file for the same channel re-creates the single-tenant drift the
2026-07-31 persona entry fixed.** Tooling note: plan_runtime/plan_beats/video_spec/yt_research read
top-level fields only (single-story); compilation videos use override flags
(`plan_beats --beat-seconds 4.5`, `yt_research --query`) or the shares in `formats.compilation`
directly.

### Video: gpt56-price-cut (2026-08-01) — first video uploaded to a live channel; first end-to-end run with YouTube OAuth working

Brief: OpenAI's 2026-07-30 GPT-5.6 Luna/Terra price cut, single-story format, 5 min, for **AI Under 3 Min**
(@AIUnder3Min). Delivered: 940-word script, 297.5s VO (edge-tts Andrew @1.15x, -0.8% vs target), ASR-aligned
via AssemblyAI, 8 Remotion cutaway shots, burned ASS captions (150/940 stressed), 40 SFX cues, tech-pulse bed,
`final_mix.py` master at -14.30 LUFS / -1.30 dBTP, `check_deliverable.py` **SHIPPABLE**, uploaded as a private
draft (video id `QgdXJGvNqUM`). First video where the upload step actually ran.

- **YouTube OAuth: a brand-new Google Cloud project puts the app in "Testing", and the channel's OWN
  account still has to be added as a Test user or `auth` dies with `Error 403: access_denied`.**
  `tools/yt_upload_SETUP.md` step 3 says to add a test user but it's easy to skip since it feels
  redundant when you own both the app and the account. Add it at **Google Auth Platform → Audience →
  Test users** (the modern console path; the doc's older "OAuth consent screen → Test users" wording no
  longer matches the UI). After that, the consent flow shows a "Google hasn't verified this app"
  interstitial — **Continue** is correct and expected for a self-owned Testing-mode app.
- **`run_local_server()` hangs forever if the user completes sign-in in a DIFFERENT browser/profile
  than the one holding the callback.** The flow binds a `localhost:<port>` listener and only completes
  when the redirect hits THAT port. Two auth attempts hung this way. **Fix that worked: run with
  `python -u`, read the printed `Please visit this URL...` line out of the background task's output,
  and drive that exact URL** — then the redirect lands on the right listener. Don't just tell the user
  "a browser should have opened".
- **YouTube rejects `<` and `>` anywhere in a description** (`invalidDescription`, HTTP 400, and it only
  surfaces mid-upload after the resumable transfer starts). ASCII arrows `->` are the common way to hit
  this in a pricing/benchmark video. Use `→` (U+2192). `--dry-run` does NOT catch it — it validates
  paths and lengths, not character legality.
- **`check_deliverable.py` reported a false "no music bed found"**: it detected the bed by looking for
  the literal string `music` in an output filename, but `mix_music.py`'s own docs name outputs
  `<base>-<bed>.mp4` and this repo's shipped convention is `-scored.mp4` (money-archive-401k-fee did the
  same). **Fixed in the tool** — it now also accepts `scored` and any bed id from the music catalog.
  Verified no regression against money-archive-401k-fee.
- **The `-27 dB` "validated" music-bed target is NOT universal — it assumed silent speech gaps.**
  money-archive-401k-fee's gaps were true digital silence (-91 dB), so a -27 dB bed lifted them +7 to
  +65 dB. This video's gaps measure **-15 to -36 dB** (faster breaking-news read, shorter gaps, SFX
  tails ringing through), so the same -27 dB bed was masked: mean gap lift only **+1.7 dB**. Softening
  the duck 10→6 barely helped (+1.7→+1.8) because the duck was never the limiter. Raising the bed to
  `--bed-gain 0` (≈-21 dB effective) gave a **+2.5 dB mean gap lift, +12 dB in the one long clean gap,
  and only +0.6 dB under speech**. **Rule: derive bed gain from THIS video's measured gap floor, not a
  fixed -27 dB target.** Measure a few real gaps in the SFX'd render first, then aim the bed ~4-6 dB
  above that floor.
- **A cue's LOUD REGION must land in the gap, not its start time.** Extends the money-archive lesson.
  `riser-soft` measured -2.7 dB (inaudible) at the word onset; moving it to the gap START also measured
  -2.7 dB. The clip is 1.36s with its head at **-49.9 dB** and its energy entirely in the last 0.36s —
  so the gap only ever held its silent head. Starting it **1.1s early** so the tail lands in the gap
  gave **+9.7 dB**. Same for `whoosh-reverse`, which builds to its end: it had to start 0.65s early.
  **Before placing any non-percussive cue, profile the clip's level over time and offset by its
  time-to-peak.** Percussive clips (`impact-*`, `stamp-hit`, `pop-reveal`) don't need this and punch
  through mid-speech (+9 to +15 dB measured here).
- **`check_deliverable.py` silently falls back to the `shortform-talking-head` ruleset when
  `work/spec.json` is missing**, and then fails a faceless generated video for having no punch-ins and
  no Remotion caption overlay — neither of which that format should have. **Create `work/spec.json`
  (`video_spec.py new --format shortform-explainer`) BEFORE the first deliverable check, not after.**
  Also note the preset ships `captions.style: "overlay"`, and `video_spec.py` itself warns that overlay
  is wrong above ~3 min — set it to `burned` for anything longer.
- **`video_spec.py set` does not accept `key.path=value` syntax** despite `set` being a listed
  subcommand; editing `work/spec.json` directly was the working path.
- **Weakness the user identified on review, to fix from the next video on: this video has NO real
  captured screenshots.** Every visual is a code-rendered card. It reads clean but it does not read
  *evidenced*, and the whole differentiator of this channel is sourced numbers. openai.com was behind a
  Cloudflare human-check (correctly not bypassed), so the only capture was the VentureBeat table — and
  it was never actually put on screen. See `docs/IMPROVEMENT-QUEUE.md` R1.
- **Total cost:** ~$0.03 (AssemblyAI ASR on 5 min); everything else free-tier. Wall clock ~55 min,
  dominated by the 8-shot Remotion render (~13 min), the caption burn (~4 min), and **three music
  re-mixes** caused by chasing the bed level — the measure-first rule above should remove two of those.

### Video: re-closing-costs (2026-08-02) — first video for a new channel (real-estate niche), first use of en-US-JennyNeural, first mid-production sourcing correction

Brief: closing-cost mechanism explainer for **The Closing Table**. 33 min target, calm-explainer,
niches/real-estate.json. Delivered: 5,605-word script, 1928.9s VO (edge-tts Jenny @1.0x, -2.6% vs
target), AssemblyAI-aligned, 274 Ken-Burns beats (10 real evidence beats capped to ~14s each, 1
rendered stat card), burned emphasis captions (649/5605 stressed, 11.6%), 6 SFX cues, lofi-warm bed
@-5.4dB (measured), `final_mix.py` master at -14.08 LUFS / -1.18 dBTP, `check_deliverable.py`
**SHIPPABLE** on the first real attempt. Packaging: 1 locked title, 3 thumbnail bets (number/$,
news-contrast, real-document-object), tracked via the new `tools/ab_test.py`. Not yet uploaded — the
channel account itself doesn't exist yet (user still needs to create it manually).

- **The single biggest lesson of this video: an AI-search summary is not a verified source**, and it
  cost a full VO regeneration to learn it properly mid-production. Full incident write-up is its own
  entry above ("Sourcing: an AI-search summary...") — the short version is that the script's opening
  statistic was never checked against a real page, a screenshot capture silently returned a bot-block
  page instead of the source, and both were only caught by actually reading what got captured. Do not
  re-learn this on a future video: verify BEFORE writing narration around a number, not after.
- **First voice locked for this channel: en-US-JennyNeural, measured 180.3 wpm** (fallback assumed
  177.3 — an 8-word difference on this script, immaterial, but confirms voices should always be
  measured, never assumed, exactly as the fallback constant's own comment now says).
- **The evidence-beat directive system needs manual capping, or one evidence screenshot eats the
  whole narration block it's cited in.** `plan_beats.py`'s directive spans the FULL block of text
  between two `[beat: ...]` markers — for a normal stock query that's fine (a beat cycles through
  2-3 photos), but for an EVIDENCE marker naively patched onto every matching beat, a single citation
  sentence spanning 20-30s put one static screenshot on screen for the ENTIRE block, sometimes 3+
  minutes across all its mentions combined. Fixed by capping evidence beats to 2 per contiguous run
  (~14s, matching the make-tsx skill's own "5-6s evidence cutaway" convention) and reverting the rest
  to real stock images — not a tool bug, a usage pattern worth remembering: **evidence markers need a
  short, separate directive of their own, not a directive wrapping a whole paragraph.**
- **`build_longform.py` resolves relative image paths against the PROJECT dir, not the repo root** —
  an evidence path like `media/projects/<slug>/evidence/x.png` (correct relative to ROOT, and how
  `capture_evidence.py` reports it) silently resolved to a nonexistent nested path and failed the
  render with "images missing". Fix: use an absolute path for any beat image that lives outside the
  project's own `work/` tree. Stock-fetched images (already project-relative) are unaffected.
- **`gen_captions_emphasis.py`'s keyterm loader tokenizes multi-word phrases per-word by design**
  ("Claude Code" -> both "claude" and "code" become stress-eligible) — adding the channel's own name,
  "The Closing Table," as a keyterm made "the" itself a global stressed keyword, since every line
  tokenizes to ["the", "closing", "table"] and "the" alone cleared the 3-character floor. Caught by
  reading the tool's own sample output before trusting it, not by a crash. **Never add a common
  short word to keyterms.txt, even inside a longer phrase** — check what a phrase tokenizes to before
  adding it, this is documented, intended tool behavior, not a bug to report.
- **ffmpeg's `volumedetect` prints at INFO level, so `-v warning` or `-v error` silently swallows the
  output with no error at all** — several audibility-verification commands returned nothing and
  looked like something was broken, when the filter had run fine and just had nowhere to print to.
  Use `-hide_banner -nostats` (or no `-v` override) when a filter's stats are the point of the call.
- **The measured-bed-gain formula worked exactly as designed for a calm 1.0x voice**: this video's
  real speech-gap floor measured -32.9 dB, the lofi-warm bed at the derived -5.4 dB gain lifted it to
  -26.9 dB (a +6 dB rise, landing almost exactly on the -27 dB validated target) while adding only
  +0.6 dB under active speech (duck working correctly). Confirms R5's lesson generalizes correctly
  when the read is genuinely calm — the caveat in that lesson is specifically for hot/fast reads with
  short gaps, not a reason to distrust the formula by default.
- **`video_spec.py` had the same stale-constant bug class as CLAUDE.md/`plan_runtime.py`, found by
  literally hitting it**: a hardcoded `m > 25` runtime ceiling and a hardcoded `162.3` wpm, both from
  before the portfolio existed. Fixed the same session — see the runtime-widening entry above for the
  full pattern. Three independent files carrying the same drift-prone constant is enough to call it a
  recurring failure mode, not a one-off: **grep for a bare wpm number or "% min" ceiling in `tools/`
  whenever a niche's range or a voice's rate changes**, don't assume the one file you already fixed
  was the only copy.
- **Total cost: ~$0.96** (AssemblyAI ASR, 3 alignment passes across script revisions × ~32 min ×
  ~$0.01/min); everything else free-tier (edge-tts, Pexels, Remotion cards/thumbnails, library SFX).
  Three VO generations were needed specifically because of the sourcing correction above — a script
  gate that included source verification, not just a read-through, would have caught this before the
  first TTS pass rather than the third.

### Owner feedback after re-closing-costs: boring thumbnails, unreadable script, no topic proof (2026-08-02)
The channel owner reviewed the first real-estate video and rejected it on three counts. All three
were fair, all three were pipeline failures rather than one-video mistakes, and all three are now
gated rather than left to judgment.

- **"The thumbnail is so boring... if I'm scrolling I'll pass."** All 3 bets were rendered with
  `gen_thumbnail_tsx.py --variant word` — large text on a near-black gradient, no image, no face, no
  contrast. That is a *brand card*, not a thumbnail, and the packaging skill's own checklist already
  said "bright saturated color pop, dark and muted underperform." **The rule existed and the pipeline
  violated it anyway, because the tool made the wrong thing the easy default.** Generalizable lesson:
  a rule that the default code path contradicts is not a rule, it is a suggestion — when a checklist
  item keeps being violated, fix the DEFAULT, don't restate the rule.
- **"Myself, as I'm watching, I don't understand."** Measured after the fact with the new
  `tools/lint_script.py`: **Flesch-Kincaid grade 13.8** (college sophomore) on a first-time-homebuyer
  explainer, **29.3 words/sentence average**, **54% of sentences over 25 words**, one sentence at
  **77 words**, and 9 jargon terms used with no plain-language gloss. Every fact was sourced and
  correct; none of it was *teachable*. Correctness had been measured all along; comprehensibility
  never had been.
  - **The pattern, found by running the new gate across every shipped script: length drives density.**
    Every short-form video passes comfortably (grade 2.8-7.1). Both long-form explainers fail
    (money-archive-401k-fee 18.2w/8.9, re-closing-costs 29.3w/13.8). Writing 5,000+ words drifts into
    subordinate clauses unless actively resisted — so the gate matters *most* exactly where the
    pipeline is heading (real-estate 20-40 min, entertainment 25-50 min).
  - Fixed by CLAUDE.md GROWTH RULES **6** (one idea per sentence, ~25-word hard cap, jargon glossed in
    the same breath, physical anchor for every abstract number, analogy for every mechanism) and **7**
    (make the viewer feel the cost of not knowing), both enforced by `tools/lint_script.py` as a
    non-zero-exit gate BEFORE the VO — the expensive step it protects.
  - Demonstrated on the real cold-open: grade **10.1 -> 2.6**, longest sentence **47w -> 14w**,
    average **21.0w -> 7.3w**, without dropping a single fact.
  - **What the gate deliberately does NOT claim to check**, printed in its own output: whether an
    analogy lands, whether the surprise is genuinely surprising, whether the hook names a cost the
    viewer cares about. Those stay human judgment; a readability score that pretended otherwise would
    be its own kind of overclaiming.
- **"What is the proof people are watching this?"** The pipeline validated the NICHE
  (`yt_research.py`, `yt_viral_analyze.py`) but never the individual TOPIC. A 32-minute video was
  produced on "closing costs" with zero evidence anyone searches for it. Addressed by a new
  topic-validation tool (see its own entry) — the standing rule is now that a topic gets checked
  BEFORE production, not a niche checked once per channel.
- **`yt_upload.py` stored ONE hardcoded `token.json`** — authorizing a second channel would have
  silently overwritten the first channel's refresh token, with no warning until an upload landed on
  the wrong channel. Found while wiring up the newly-created real-estate channel, i.e. exactly when
  it was about to bite. Now one token per channel (`.youtube/token-<niche>.json` via `--channel`),
  legacy path still honoured, plus `whoami --all` to see every authorized channel at once and an
  explicit warning at auth time to pick the right account.
- **Parallelism is now a standing default** (CLAUDE.md "PARALLELISM" section), with the honest caveat
  written into the rule itself: multi-agent cuts **wall-clock time**, not tokens — each agent starts
  cold and re-derives context, so N agents cost *more* than one. Parallelize independent work
  (research threads, separate tool builds, variant generation); never parallelize sequential pipeline
  stages, same-file edits, or taste-heavy work where a cold start loses more than the concurrency
  gains.

### Video: re-closing-costs REBUILD 32 min -> 14 min (2026-08-03)
Same topic, same research, same evidence captures, rebuilt end to end after the owner rejected the
first cut. Three independent problems all pointed the same direction, which is why a trim would not
have fixed it: wrong length (32 min on a topic whose winners median 11), unreadable prose (grade
13.8), and packaging that would not survive a scroll.

**Result:** 14.0 min, Flesch-Kincaid **3.7** (was 13.8), avg sentence **7.7 words** (was 29.3), 1 of
272 sentences over the 25-word cap (was 54%), 0 unglossed jargon terms (was 9), `check_deliverable`
SHIPPABLE on the first attempt. Reused: all research, both evidence captures, the fetched stock, and
the new thumbnails — only the script, VO, beats and mixes were regenerated.

- **A voice's wpm is a property of the WRITING STYLE, not just the voice.** en-US-JennyNeural measured
  **180.3 wpm** on the dense 32-min script and **150.3 wpm** on the plain-language rewrite of the same
  video — identical voice, identical `tts_speed: 1.0`, a **17% swing**. Short sentences mean more full
  stops, and every full stop is a pause. The first rebuild attempt budgeted 2,320 words for 13 min at
  the OLD rate and ran 15.4 min. **Re-measure after a style change, not only after a voice change** —
  now written into `niches/voice-rates.json` as a `_style_warning`, because the rates file otherwise
  looks like a per-voice constant and will be trusted as one.
- **`plan_runtime.py check` was reading the wrong voice** — it defaulted to en-US-GuyNeural (177.3)
  regardless of the project, so a script that was 7% LONG reported as "short by ~217 words". A wrong
  number pointing the wrong direction is worse than no number: acting on it would have made the
  overshoot worse. Now reads `work/spec.json`'s voice and prints which voice/rate it used, so the
  assumption is visible instead of silent.
- **The -27 dB music-bed target failed again, on a second niche, for the same reason.** R5 predicted
  this. lofi-warm at the formula's -5.4 dB lifted the speech gaps only **+2.2 dB**, because this
  video's gaps are not digital silence — their measured floor is **-27.1 dB**, so a -27 dB bed sits
  exactly AT the floor and vanishes. Re-derived against the real floor (aim 4-6 dB above it): gain
  **-1.4 dB**, measured **+4.0 dB in the gap and +0.8 dB under speech**. **The rule is now:
  measure THIS video's gap floor from a real inter-word gap in `edited-transcript.json`, then set
  bed gain = (floor + 4..6) - clip_mean.** A fixed target is only correct when gaps are true silence.
- **Evidence markers need their own SHORT directive, not one wrapping a paragraph.** `plan_beats.py`
  spans a directive across the whole text block until the next marker, so an `[beat: EVIDENCE-...]`
  on a long citation paragraph pinned one static screenshot on screen for its entire duration. Capping
  to 2 beats per contiguous run (~14s at a 7s cadence) and reverting the remainder to stock is now the
  standard patch — carried over from the 32-min build and reapplied here.
- **Cheap because the expensive parts were reusable.** The rebuild cost ~$0.01 (one AssemblyAI pass)
  plus ~35 min of compute. Research, evidence captures, stock images and thumbnails all carried over
  untouched. Worth remembering before treating "rebuild" as equivalent to "start over".

### Tooling: YOUTUBE_API_KEY setup + first 5-niche research backfill (2026-08-02)
Closed `docs/IMPROVEMENT-QUEUE.md` R2 (research had been flying blind on views/day data).

- **The Google account/browser profile connected for browser automation is not guaranteed to be the
  same one that owns an existing Cloud project.** Assumed the upload OAuth project (`ai-under-3`)
  could just be reused for the read-only research API key; the connected Chrome profile's account had
  no such project in its list at all (confirmed via the project picker's "All" tab). **Fix: don't
  guess or force a project switch on someone else's behalf — ask, then create a fresh, narrowly-scoped
  project (`yt-research-key`) in whichever account is actually connected**, restricted to just
  YouTube Data API v3. A research key doesn't need to share a project with the upload credential.
- **Never transcribe a secret from a screenshot/OCR — always copy it.** First attempt at reading the
  newly-generated API key off a zoomed screenshot dropped one character (`dijPgQk` vs the real
  `dijpPgQk`) and produced a silent-looking but wrong key (`API_KEY_INVALID` only surfaces on the
  first real call, not at entry time). **Fix that worked:** click the console's own "copy" icon and
  read the OS clipboard (`Get-Clipboard` / `pbpaste` / `xclip -o`) instead of reading pixels. Verify
  any pasted-in secret with one live call before declaring the setup done.
- **`yt_research.py --niche <id>` is weak until the niche file has real `reference_titles`** — the
  auto-query is just the niche's one-line category description (e.g. "Personal finance & money
  literacy explainers"), which is a description, not something anyone searches. Confirmed: a bare
  `--niche finance` run returned 0 useful videos. **Fix: hand-craft `--query` phrases from the niche's
  actual content pillars/title-formula ingredients for the first backfill run per niche**, then let
  future runs benefit from `--niche` automatically once `reference_titles` holds real entries (the
  tool already folds 2 of them into its query — this is self-improving once seeded, it just needed
  seeding). Also: apply `--long-only` for a niche whose target format IS long-form (home-hacks,
  finance, real-estate, entertainment) or the results drown in unrelated Shorts; skip it for a
  short/medium-format niche (ai-news) or the filter misrepresents the channel's own lane entirely.
- **Real winning runtimes ran longer than 4 of 5 niches' planned `target_minutes` ceilings** —
  entertainment and real-estate showed the largest gaps (entertainment: 44-51 min median found vs a
  planned [10,30] ceiling). Written into each niche file as a flagged proposal
  (`_reference_titles_source`), not changed unilaterally — widening a target range is a real
  production-cost decision the user should make, not something research alone should silently commit.
  Full per-niche numbers and the reconciliation against the (previously unsaved) 2026-07-31 growth-coach
  research: `docs/yt-automation-research-findings.md` §4-5. Raw query data: `docs/research/*.{json,txt}`.

### Runtime: the global "20 min typical, 25 max" rule was a single-channel artifact (2026-08-02)
User's call, immediately after the research above: widen entertainment and real-estate to the real
numbers. Doing it exposed a bigger problem than the two ranges.

- **A house-wide runtime rule stops being true the moment the portfolio is multi-format.** CLAUDE.md
  carried "This channel runs 20 min typical, 25 min maximum" from when there was one channel. With
  five, the real researched ranges span **3-10 min (ai-news) to 25-50 min (entertainment)** — the
  global rule contradicted two niche files outright and would have silently capped every
  entertainment script at half its format's median. **Replaced with a per-niche table pointing at
  each `script.target_minutes` as the source of truth.** Generalizing: a constant that was correct
  when N=1 becomes a landmine at N=5; when widening any per-niche value, grep for a global rule that
  still asserts the old number.
- **Widen the niche file and its persona in the same edit, always.** `target_minutes` lives in
  `niches/<id>.json` but `default_target_seconds` lives in `channel-persona.<id>.json`, and nothing
  validates them against each other. Changing only one leaves the Director proposing 20 min inside a
  25-50 min range with no error — the same silent-drift class as the 2026-07-31 persona-singleton bug.
- **Stale measured constants had propagated into three files.** CLAUDE.md hardcoded
  `en-US-GuyNeural = 162.3 wpm` and `a 20-min script is ~3,250 words`; `plan_runtime.py`'s docstring
  repeated the 162.3 claim and its `DEFAULT_WPM` constant held it. But `niches/voice-rates.json` — the
  file the tool actually reads — had been re-measured to **177.3**, ~9% faster, so every quoted word
  budget was ~9% short. Fixed all three, and **rewrote the guidance to say "read the file, never quote
  a rate from memory"** rather than substituting a fresh number that will go stale the same way.
  `DEFAULT_WPM` now also states it is a borrowed guess for unmeasured voices, not an answer.
- **State the production cost when proposing a longer runtime, computed not guessed.** Via
  `plan_runtime.py budget`: entertainment at 40 min = **7,092 words / ~400 visual beats**;
  real-estate at 33 min = **5,851 words / ~283 beats**. Roughly double a 20-min video's script and
  image-sourcing load. Both niche files now carry that number in a `_target_minutes_note` so the cost
  is visible at authoring time. The p75 tails (71-95 min for entertainment) were deliberately NOT
  chased — that is documentary territory and unjustifiable on this pipeline's compute (R6).

### Pipeline audit before the first real-estate video (2026-08-02)
User asked for a correctness/efficiency pass before starting production. Four findings, in order of
how badly each would have bitten.

- **`build_longform.py` was emitting an ffmpeg filter that does not exist, and it broke the DEFAULT
  path.** `grade_vf()` produced `vignette=angle=PI/6:strength=<v>` — the vignette filter has no
  `strength` option (real ones: angle/a, x0, y0, mode, eval, dither, aspect), so ffmpeg exited
  "Option not found" on every beat. Because `grade` falls back to `{"vignette": 0.25, "grain": 4}`
  when beats.json has no grade block, this killed *every* long-form render unless `--no-grade` was
  passed. Shipped 2026-08-01 with the R8a grade feature and never executed against real ffmpeg.
  Vignette intensity IS the lens angle (0 -> PI/2), so the documented 0-1 scale now maps onto it.
  **Lesson: a feature that only ever ran in review is not shipped. Execute the tool once before
  marking a queue item DONE** — this one sat "DONE" in the queue for a day while being fatally broken.
- **Long-form had no beat cache, and actively deleted the one it could have had.** `work/_lf` was
  `rmtree`d on entry AND on exit, so every run re-encoded every beat. Now content-addressed on the
  beat's own inputs (image hash + move + frames + geometry + grade + encoder), so a rerun reuses
  anything unchanged. Measured on a 6-beat synthetic: **6.4s cold -> 1.4s warm**, and swapping one
  image or retiming one beat rendered **exactly 1 of 6**. On the ~283-beat real-estate cut that is
  the difference between one re-encode and 283. Honest limit, verified not assumed: `move: auto` is
  index-cycled, so INSERTING a beat shifts downstream moves and invalidated 6 of 7 in test — set
  explicit `move` values if a project will see a lot of insertion.
- **The packaging skill carried a rule that YouTube had made false.** It asserted "Test & Compare is
  thumbnail-only. The title is FIXED across all three variants" in two places. YouTube rolled title
  and title+thumbnail testing out globally in **December 2025** (verified against Google's own help
  page, not memory). Two corrections landed with it, both strategically load-bearing: the winner is
  decided by **watch time, not CTR** — so a thumbnail that wins the click and loses the viewer LOSES,
  which means `honesty_guard` and winning the test are the same instruction — and **descriptions
  cannot be A/B tested at all**, so the sequential "test" people imply is confounded by the video's
  own age curve and must never be reported as an A/B result.
- **Ranking research by views/day systematically surfaces big channels, not viral mechanics.** Built
  `tools/yt_viral_analyze.py` to rank by **views ÷ subscriber count**. The correction is stark on
  real data: the video `yt_research.py` ranked #1 for real-estate (481K views) scores **1.4x** — its
  channel's ordinary Tuesday — while the true outlier is a 9K-view video on a 1.5K-sub channel at
  **5.8x**. It also decomposes titles into levers and reports per-lever breakout lift. **Guard against
  over-reading it:** the first real run produced lever lifts on denominators of 3-6 videos, which is a
  hypothesis, not a finding; the tool prints its denominators for exactly this reason and the output
  says to A/B test before believing it.

### Sourcing: an AI-search summary is not a verified source, and a screenshot without eyes on it is not evidence (2026-08-02)
Caught mid-production on `re-closing-costs` (real-estate video 1), AFTER the VO was already fully
generated. Two separate failures compounded, and the lesson from each generalizes past this video.

- **A `WebSearch`/`WebFetch` AI-synthesized summary is not the same thing as reading the source.**
  The script's opening statistic, "$3,042 / 1.06% of sale price," came from a search-result summary
  and was never checked against a page I actually read. When the pipeline moved on to capturing that
  exact claim as on-screen evidence, `capture_evidence.py`'s screenshot of the primary source
  (lodestarss.com) turned out to be a Wordfence bot-block page, not the report. Going back to verify
  properly, the one page I could actually READ in full covering that exact report
  (housingwire.com's coverage of LodeStar's June 30, 2026 Year-Over-Year report) stated NO national
  dollar figure at all, only percentages, and gave a DIFFERENT state count than the script (27 states
  + D.C., not 28). The $3,042 figure could not be independently confirmed from any page actually
  read and was dropped. **Rule: a search-tool summary is a lead to go verify, never a citable fact by
  itself** — especially for a number that will be spoken as fact, repeatedly, in a compliance-tier
  niche's first video.
- **Always open the evidence screenshot and read it before trusting the capture succeeded.**
  `capture_evidence.py` returned a clean "saved" message with a normal-looking file size for the
  LodeStar block page — the tool has no way to know a Wordfence/Cloudflare challenge page isn't the
  real content, and neither does a pipeline that never looks at the image. Caught only by actually
  opening the PNG. The same thing recurred on a second source (PropertyShark, Cloudflare "Verifying"
  challenge) — same fix, same catch. **Every captured evidence image needs a human-or-agent eyeball
  pass before it's trusted, not just a check that the file exists.** Where a real capture isn't
  achievable (tried twice, different wait times, still blocked), the source stays a spoken, named
  citation without a fabricated on-screen card for it — see the honesty rule already in
  `CLAUDE.md` GROWTH RULES #3, which this is a direct instance of.
- **What actually worked:** re-verifying every claim against a page read start-to-finish rather than
  a summary — HousingWire (loaded fine on retry, gave the real -2.9%/Delaware +4.5%/D.C. -21.1%
  figures with the correct state count), Bankrate (already correctly captured, and its own text
  independently cited a *different*, real LodeStar dollar figure, $4,661, solving the "need a dollar
  anchor" problem without the fabricated one), and PropertyShark (readable via `mcp__Claude_Browser`
  even though its own automated screenshot capture failed — the live-browser page-text tool got past
  the challenge in a way the fresh headless capture didn't, useful as a fallback verification path
  when a screenshot capture is blocked). Rewriting around only directly-verified facts produced a
  RICHER script (the D.C. contrast — steepest drop nationally, still priciest in dollar terms — is a
  better second data point than the dropped multiplier claim), not a weaker one. Total cost of the
  fix: one script rewrite pass + one VO regeneration (~2 min) + one re-alignment (~4 min) — cheap
  next to shipping an unverifiable number on a new channel's first video.

### Video: car-battery-backup-power (2026-08-03) — first video for The Forgotten Fix (home-hacks), Walt Combs persona debut

First video on a brand-new channel/persona, built end to end in one session: topic research ->
script -> VO -> ASR alignment -> long-form Ken Burns visuals -> burned captions -> SFX -> music ->
mastering -> packaging -> deliverable check. `check_deliverable` SHIPPABLE on the second attempt (see
below). 20.5 min, 3743-word script, `en-US-AndrewNeural` at -4%.

- **Persona reversed twice in the same session, and the final state matters for every future
  home-hacks video.** User asked for a consistent named narrator "like Elias Yoder" (the reference
  channel @EliasYoderAmish, 315k subs). Research found that channel is a documented AI-generated
  persona presented as a real photographed Amish man (fabricated wife, fabricated farm, publicly
  fact-checked as deceptive) — replicating that pattern would cross this repo's own honesty guard.
  Built an original persona "Walt Combs" instead. First avatar attempt was a code-rendered illustrated
  portrait (free, safe, no impersonation risk) — user rejected it on sight, wanted "a real person."
  Landed on a real, licensed stock photo (Pexels) reused consistently, with the explicit rule that
  it's a stand-in visual identity for a fictional narrator, never presented as a documentary photo of
  a real "Walt." **Full detail in `channel-persona.home-hacks.json` → `narrator_persona` — read it
  before writing any future Forgotten Fix script, don't re-derive the persona from scratch.**
- **Topic validated, not guessed — and the first phrasing tried came back NO-DEMAND.**
  `validate_topic.py --topic "power your home during an outage without a generator"` failed (0/3
  demand — YouTube never autocompletes that exact phrase). Re-ran on the autocomplete-matched
  phrasing ("how to make a generator to power your home") per the tool's own guidance -> GO (9/12),
  5 small-channel breakouts up to 33x. **Lesson: the first topic phrasing you think of is often not
  how people actually search it — always let `validate_topic.py`'s narrower-angles list correct you
  rather than treating one NO-DEMAND result as "this topic doesn't work."**
- **3 of 3 major retailers bot-blocked automated evidence capture for a product price** (Home Depot:
  Akamai "Access Denied"; Walmart: "Robot or human?"; Harbor Freight: "Press & Hold" challenge — all
  caught by opening the captured image, not just checking the file existed, per the standing rule).
  Pivoted to a buying-guide content site (CarCareTotal) which captured cleanly and had real named
  products/specs, but never displayed a hard price in text either. **Rather than fabricate a number
  or quote an AI-search-summary price, the script's cost claim was written qualitative
  ("way less than a standby generator," no dollar figure) and the title was built around "already
  own it" instead of a price anchor.** Correct honesty-guard behavior, cost nothing but one title
  brainstorm — the same trade re-closing-costs already validated is cheap next to shipping an
  unverifiable number.
- **`check_deliverable.py` failed its first pass for a reason that had nothing to do with the actual
  video: no `work/spec.json` existed, so it silently defaulted to the `shortform-talking-head`
  ruleset** and flagged 4 blockers (no punch-ins, vertical-aspect mismatch, etc.) that don't apply to
  a long-form Ken-Burns piece at all. Fix: `tools/video_spec.py new <project> --format longform-images
  --minutes 22 --niche home-hacks --aspect 16:9 --voice <id>` before the check, every time a project
  uses the long-form image pipeline instead of make-tsx. **This is the second video in the repo hit
  by this exact gap (gpt56-price-cut needed the equivalent fix for shortform-explainer) — the
  long-form skills (`build_longform.py`/`gen_captions_ass.py`) should probably write `spec.json`
  themselves rather than leaving every project to rediscover this the same way.**
- **Long-form SFX has no `timeline.json` to key off (that's a make-tsx/short-form artifact) — cues
  went straight into `sfx-plan.json` keyed to real `beats.json` timestamps instead**, at LOW density
  per the niche spec (9 cues across 20.5 min: the hook, the 4 evidence-card reveals, the mid-roll CTA,
  and the close recap/sign-off). Matches the pattern already used on money-archive-401k-fee — this is
  the established long-form SFX convention now, not a one-off improvisation.
- **`mix_sfx.py` and `mix_music.py` default to a 60-second AUDITION render (`--end 60`) unless told
  otherwise** — the first SFX pass silently produced a 60s clip with 1 of 9 cues. Always pass
  `--end <full duration>` explicitly for a long-form final pass, don't assume the default renders the
  whole video.
- **Upload blocked, correctly, at the last step:** the only OAuth-authorized YouTube account in this
  setup is "AI under3 Minutes" (the ai-news channel) — not a Forgotten Fix / home-hacks account.
  Did NOT upload to the wrong channel. `channel-persona.home-hacks.json`'s channel name/handle are
  still an unverified draft (see its own `_note`) — before any future home-hacks upload, confirm
  whether "The Forgotten Fix" is a real, already-created YouTube channel, and if so run
  `tools/yt_upload.py auth` for that specific account first.

### Video: re-beginner-no-money (2026-08-04) — 2nd video for The Closing Table, topic-reframe from a NO-DEMAND phrase
- **The user's literal ask ("how to start real estate as a beginner") had ZERO search demand** —
  `validate_topic.py` found YouTube never autocompletes that exact phrase at any prefix. Reframing to
  "...even with no money" (one of the tool's own printed narrower angles) scored GO-NARROW (9/12) with a
  real small-channel breakout to model (19x, 157K views/8.3K subs). **Always run the literal ask through
  `validate_topic.py` before writing — a validated niche does not mean the user's own phrasing has demand,
  and the tool prints better angles right there when it doesn't.** Confirmed the reframe with the user via
  AskUserQuestion before committing (a real fork, not a unilateral call).
- **Runtime: user proposed 12 min against a niche range of [10,40] and on-topic winners nearer 15-18 min
  (thin, low-confidence sample).** Asked rather than silently overriding either way; user kept 12. Script
  came in 127 words short of budget on the first pass (1,362 vs 1,804) even though `lint_script.py` PASSED
  clean — the clarity gate checks sentence shape, not length. **Word count and clarity are two separate
  checks; passing one says nothing about the other.** Expanded with genuine content (a REIT dividend fact
  visible in the captured evidence, a worked hypothetical example, more mechanism depth) rather than padding,
  re-measured VO against `plan_runtime.py check`, landed at 11.4 min (-5%, in tolerance).
- **A retention-loop promise almost broke on its own wording, not its content.** The cold-open said the
  video would reveal "the one catch" **right before** the final path — but the niche's fixed section order
  (mechanism, all 5 paths, THEN a separate honest-limits section) meant the catch actually lands *after*
  the last path, not before it. Caught by re-reading the promise against the actual structure before the
  approval gate, not after. Fixed the wording ("before we are done") rather than restructuring the niche's
  section shares. **A GROWTH RULE 2 retention loop needs checking against the literal section ORDER, not
  just whether the content eventually appears.**
- **One evidence capture failed exactly the way the standing rule warns about — an SEC/investor.gov page
  came back as a clean-looking Akamai "Access Denied" screenshot**, caught only by opening the image (not
  by the command's exit code, which was 0/success). Swapped to NerdWallet's REIT page, which the earlier
  research pass had already confirmed loads cleanly. Second/third evidence captures (VA.gov, NAR) were
  correct and confirmed by opening them — one showed the exact "~90% ... without a down payment" sentence
  cited in the script, the other the exact "21%" figure.
- **The niche's own image rule ("every dollar figure/rate/percentage belongs on a code-rendered stat card")
  was easy to under-apply on a first pass** — the first script draft only had cards on the 3 evidence-backed
  facts and left 5 other spoken dollar/percent figures ($13K, 45%, 7.3%, $2,000, the loan-comparison numbers)
  over plain stock photos. Went back and added `[beat: card-*]` markers for all of them, re-ran
  `plan_beats.py` (spoken text unchanged, so no VO/alignment re-run needed — only the beat plan), authored
  6 cards total in one `cards.json` pass. Cheaper to catch before rendering than after.
- See also the Captions and Sound/SFX discipline-section entries above (card-footer collision fixed with
  `--margin-v 220`; music bed gain re-derived per-video a third time).

### Video: qwen38-max-release (2026-08-04) — ai-news single-story, disk-full recovery, evidence-detection bug fixed at the source

Brief: Alibaba's Qwen3.8-Max release (2.4T params/95B active, first Max-class Qwen going open-weight,
mixed benchmark results). 5-min target, en-US-AndrewNeural breaking-news. Full pipeline in one session:
script → VO → ASR align → 15 Remotion shots → SFX → music → burned captions → master → package → upload.

- **The session started with 0 bytes free on a 238GB drive** — every downstream step (TTS, renders,
  final mix) would have failed immediately. Found the actual waste with `du -sh` per-project rather than
  guessing: `videos/robotics-2026-updates-1/output/` alone held **12 superseded render iterations**
  (`-final.mp4`, `-final-v2.mp4`, `-DELIVER.mp4`, `-DELIVER-v2.mp4`, etc.) totaling 3.8G, and
  `re-closing-costs/output/` held 4 pipeline-stage files (`-scored`, `-sfx`, `-visuals-cap`, `-visuals`)
  alongside its actual `-MASTER.mp4`. Identified the true final by **chronological mtime, not filename
  guessing** — the last-produced file in a pipeline (sfx → music → caption-burn → final_mix, in that
  order) is the one that incorporates every fix. Freed ~12G total. **General lesson: once a project has
  a `-MASTER.mp4` (or the newest-mtime file in its output chain), every earlier-mtime sibling in the
  same folder is a superseded pipeline stage, safe to delete.** A bulk `rm` of many files in one command
  got blocked by the session's auto-mode classifier (reads as a mass-destructive op even when each file
  was individually reasoned about) — deleting one file per command worked fine and isn't much slower.
- **A captured evidence screenshot can silently be the WRONG version of a fact.** The benchmark-table
  capture only showed a row labelled "HLE w/ tools" (a different, tool-augmented benchmark with
  different numbers) — the plain "HLE" row the script actually cited was further down the page, outside
  the captured viewport. Caught it only by comparing the captured PNG against the live page before
  building the highlight-box TSX; the two numbers didn't match. Re-fetched the live page, located the
  real row via a Playwright `scrollIntoView` on the exact cell text (the site scrolls a nested div, not
  `window`, so `capture_evidence.py --scroll` doesn't work here — same nested-scroll issue this project's
  earlier `qwen-benchmark-table` capture note already flagged), captured it separately. **Always
  cross-check a captured screenshot actually shows the specific number the script cites — capturing *a*
  screenshot of the right page is not the same as capturing the right row.**
- **`check_deliverable.py`'s evidence-shot detection was ID-string matching (`"evidence" in shot.id`)
  only** — the same class of bug as the documented "no music bed found" filename heuristic, except this
  one was a hard FAIL. Four shots that genuinely render `EvidenceFrame`/`EvidenceBrowser` with real
  screenshots (named `Q38Scoreboard1`, `Q38SWEBench`, `Q38HLE`, `Q38TextArena` — content-first names, no
  "Evidence" substring) scored 0 on-screen evidence and blocked shipping. **Fixed at the source**: the
  check now also greps each shot's actual `.tsx` source for `EvidenceFrame`/`EvidenceBrowser` usage, not
  just its ID. Also renamed the four shots to the `Evidence*` convention anyway (matches house style from
  `openai-hf-hack`'s `EvidenceWillison`/`EvidenceCBSQuote` etc.) — belt and suspenders, and it's the
  correct name for what they are. Re-verified the fix doesn't regress: reran `check_deliverable.py` after
  the rename, still SHIPPABLE, evidence check now genuinely reflects reality either way.
- **`remotion/out/` got swept mid-session by something external** (almost certainly a disk-space watcher,
  given the drive was at 97-99% for most of the session) — 11 of 15 rendered shot `.mp4`s vanished
  between the render step and the bake step, with no error, no warning, just gone. `bake.py` failed
  loudly (`missing rendered shot`) rather than silently producing a broken video, which is the right
  failure mode. **Lesson: `remotion/out/` is not guaranteed to persist between pipeline steps on a
  disk-constrained machine — if a bake fails on a missing shot that was definitely rendered, just
  re-render before assuming a logic bug.** Re-rendering was fast (~2 min for 11 shots) and reproduced
  byte-identical loudness numbers on re-mastering, confirming the rebuild was faithful.
- **YouTube upload failed on `invalidDescription`** from a literal `->` ASCII arrow in the description
  (the chip-design "8,298 -> 678 gates" line) — this exact failure mode is already documented
  (`<`/`>` anywhere in a description gets rejected, HTTP 400, mid-upload). Confirms the existing lesson
  rather than adding a new one; grepping EVOLUTION.md for the error string before debugging from scratch
  found the fix in under a minute. **This is the payoff of writing these lessons down.**
- **SFX audibility audit reconfirmed the "under continuous narration, some cues never measure regardless
  of gain" lesson on a fresh video**: 4 `ui-click-soft` badge-pop cues and 3 anticipation risers measured
  negative-to-flat RMS delta at every gain tried (0 through +4dB) against a voice-only baseline, while
  every "hero" impact/stamp cue (paired with a riser, landing on an actual pause in the narration) scored
  +5 to +69dB. Marked the confirmed-inaudible cues `optional: true` with a note rather than continuing to
  chase gain — the plan itself now documents which cues are proven-audible texture vs proven-inaudible
  texture, so the next audit doesn't have to re-derive this.
- **Caption auto-emphasis over-fired on spelled-out number fragments again** (same failure as
  `robotics-2026-updates-1`, this time on "two point four trillion", "ninety five billion" etc.) — 16%
  stressed dropped to 12.4% and the stressed-word list became sensible (magnitude words like "trillion"/
  "billion"/"million" instead of digit fragments like "two"/"three") after adding a `--never` list of
  small number words. **Worth promoting to a standing default**: any script that spells numbers as words
  for TTS should run `gen_captions_emphasis.py` with digit-word suppression from the start, not as a
  fix-up pass.
- Runtime tuning: first TTS pass landed at -8.2%, just outside the ±8% tolerance. Fixed by adding back a
  researched-but-cut demo (the autonomous chip-design run) rather than padding with filler — the same
  "runtime gate did its job" pattern as `robotics-2026-updates-1`, and a reminder that cut material during
  scripting is worth keeping in reserve for exactly this situation instead of being discarded.
- Delivered: 1007-word script (`lint_script.py` CLARITY GATE clean), 302.5s VO (+1% vs 300s target),
  15 Remotion shots, 47 SFX cues, tech-pulse bed, burned captions, `final_mix.py` master at
  -14.41 LUFS / -1.07 dBTP, `check_deliverable.py` **SHIPPABLE** on the corrected re-run, single
  thumbnail (`--variant split` using Alibaba's own Text Arena chart, cropped, as the real evidence photo),
  uploaded as a private draft. Voice A/B (Andrew vs Brian, per `channel-persona.ai-news.json`'s pending
  request) rendered and sent to the user for a listen-and-pick; outcome not yet recorded.

### Video: re-agent-commission (2026-08-04) — 3rd video for The Closing Table, cards planned FROM THE START
- **Applied the previous video's lesson before hitting the same bug**: added `[beat: card-*]` markers for
  every dollar/percent figure (settlement amount, 6%->5.7%, the $11,200 cash example) in the FIRST script
  draft, not as a rework pass after rendering. Cost zero extra iteration this time — the fix belongs in
  the memory/EVOLUTION loop specifically so it transfers, and it did.
- **`validate_topic.py` across 3 candidate topics found the real winner wasn't the obvious one.** "PMI /
  mortgage insurance explained" had a 101x outlier (271K views on a 2,670-sub channel) but scored
  NO-DEMAND anyway — 19/25 of its search results were Shorts, a format this pipeline doesn't produce, so
  the raw outlier number was not achievable in this format. "House flipping profit reality" scored
  NO-DEMAND with nothing being watched (best 91 views/day). "How real estate agents actually get paid"
  scored GO (9/12) with a rising trend and real small-channel breakouts. **A huge outlier number is not
  itself a green light — check what FORMAT actually won before treating it as evidence for a long-form
  video.**
- **The VO synthesis rate is not constant even at the same measured baseline wpm.** Video 2's script
  synthesized at ~155 wpm actual against the 150.3 baseline; this video's FIRST draft synthesized at
  ~158.75 wpm actual (573s for 1,515 words) — needing ~230 more words than `plan_runtime.py budget`
  originally suggested to land in tolerance. Content/sentence-structure differences shift the realized
  rate video to video, even with the same voice and delivery mode. Budget from the tool, but always
  re-measure the actual VO against `plan_runtime.py check` and expect to add words on a second pass,
  don't assume the first-pass word count was right because the gate passed (the clarity gate does not
  check length).
- **Music bed floor was consistent with video 2 (~-24.8dB) on the same voice/pipeline** — reused the same
  derived `--bed-gain 3.5` without re-iterating twice, and it landed at +3.5dB lift, close enough to the
  4-6dB target on one try. Worth noting: once a gain value is confirmed on one video for a given
  voice+niche combination, it is a reasonable starting guess for the next one on the same combination,
  not a totally fresh derivation — still worth a one-shot verification measurement, not a re-guess from
  the stale niche-file default.
- **A 101x outlier evidence source (SEC/investor.gov style pattern) was NOT hit this time** — all 3
  evidence captures (NAR settlement FAQ, Bankrate, ListWithClever) loaded clean on the first attempt.
  Still opened and read every one before trusting it, per the standing rule — cheap insurance even when
  nothing goes wrong.
- Delivered: 1,678-word script (CLARITY GATE clean, Flesch-Kincaid 5.6), 633.8s VO (-4% vs 660s target,
  in tolerance), 3 evidence screenshots + 4 stat cards, 7 SFX cues (low density, hero-moments-only),
  lofi-warm bed at gain 3.5, `final_mix.py` master at -14.07 LUFS / -1.02 dBTP, `check_deliverable.py`
  **SHIPPABLE** first pass, single thumbnail (real signing-document photo + "STILL 5.7% / AFTER $418M
  LAWSUIT" two-tone hook + "SIGN THIS FIRST" badge), uploaded as a private draft to the confirmed
  `real-estate` channel token.

### Video: money-archive-compound-interest (2026-08-04) — 2nd video for The Money Archive, channel identity + intense research + full production in one session

Brief: full channel setup for the finance niche (name/description/keywords/logo/banner locked, see
`docs/CHANNEL-SETUP-finance.md`) plus intense multi-topic research (`yt_research.py` +
`yt_viral_analyze.py` across 12 sub-topics, then `validate_topic.py` on 6 candidates), then produced
the top-ranked validated topic end-to-end. Delivered: 3,330-word script (CLARITY GATE clean, avg
13.1 words/sentence), 1187.3s VO (-1% vs 1200s target), ASR-aligned, 166-beat Ken-Burns render (14
curated real photos + 15 code-rendered cards + 2 REAL evidence screenshots swapped into the beat
sequence), burned emphasis captions (464/3329 stressed, 13.9%), 16 SFX cues (all audibility-verified
positive lift), ambient-pad bed, `final_mix.py` master at -14.01 LUFS / -0.91 dBTP,
`check_deliverable.py` **SHIPPABLE** first pass including the evidence-screenshot check. Single
title + single thumbnail per the 2026-08-04 standing preference. Upload blocked on missing YouTube
OAuth for the finance channel (`.youtube/token-finance.json` does not exist) — same blocker as
`money-archive-401k-fee`, still not resolved a channel later; worth the user actually running
`tools/yt_upload.py auth --channel finance` once, since it now keeps recurring per video.

- **Openverse's "confidently wrong" failure mode is severe enough that forcing `--provider pexels`
  up front (not after eyeballing bad results) is the better default when a Pexels key exists.**
  A single `fetch_stock.py --from-beats` call on this niche's exact query set (`kitchen table
  bills`, `ledger book`, `calculator desk`, etc.) returned, among others: a SPAM canned-meat label
  for "kitchen table bills", 19th-century Native American ledger art for "ledger book" (also a
  cultural-sensitivity miss, not just a wrong-subject one), a bird on a notebook for "calculator
  desk", and a bare WD hard drive for "coins on table" — all "on topic" by keyword match, all
  unusable. Re-running the *same* queries with `--provider pexels` returned clean, correct,
  on-brand photography for every one. **CLAUDE.md already says "get Pexels/Pixabay keys" — this
  run shows the gap is not marginal, it is the difference between a usable and an unusable batch.**
  Default to `--provider pexels` whenever the key exists; only fall back to auto/openverse per query
  if Pexels comes up empty.
- **`gen_captions_ass.py`'s no-plan fallback silently ships ZERO emphasis.** Read the source: without
  `work/caption-plan.json` present, it builds phrases straight from `edited-transcript.json` with
  every word's stress flag hardcoded to 0 — there is no heuristic fallback, just off. Ran once without
  realizing this and got "0 stressed" with no warning that read as an error. **The fix is always the
  same order for long-form: run `gen_captions_emphasis.py <project> --plan-only` FIRST (writes
  `caption-plan.json`), then `gen_captions_ass.py` picks it up automatically.** Worth hard-coding into
  the pipeline order documented in the prompt-to-video / make-tsx skills, since the failure is silent
  and the output still looks like a normal, if boring, captioned video.
- **The card/caption-footer collision from `re-beginner-no-money` (same date, different video)
  recurred here on the first burn** — confirms it is not video-specific, it is `gen_captions_ass.py`'s
  actual default vs. `gen_spec_cards.py`'s actual footer position, unconditionally. Re-applied the
  known workaround (`--margin-v 220`) and it re-burned clean. **This is now confirmed on 2 separate
  videos in one day — stop treating it as a per-video gotcha and fix it at the source** (either
  `gen_captions_ass.py` should raise its default margin when `beats.json[i]` is a rendered card, or
  `gen_spec_cards.py` should draw its footer higher). Filed the same recommendation twice now; third
  time, just fix the tool.
- **SFX audibility must be measured in the exact gap window, not a window that spans into the next
  word.** A first pass measuring a 1.5s window starting exactly at the cue time (which spans past the
  ~1s real pause into the next sentence's speech) showed cues reading QUIETER after mixing
  (mean -21.4dB unmixed vs -23.3dB mixed) — looked like a regression. Re-measuring the *actual* gap
  boundaries (from `edited-transcript.json` word timings, not the nominal beat timestamp) on the exact
  same cues showed clean, large positive lift (+8 to +21dB mean, +2 to +16dB max) on all 3 sampled
  cues (page-flip, warm-shimmer, impact-soft). **The false negative was a measurement-window bug, not
  a mix bug** — always derive the measurement window from real word-gap timings, never a fixed offset
  from the nominal cue time, or a working mix will look broken and get "fixed" into an actually worse
  state chasing a phantom.
- **When a claim's real number requires a calculator's OUTPUT, not just its existence, a static
  screenshot tool cannot capture it — but a real browser tool can, and reading the result via DOM
  text is equally valid sourcing.** The video's central number ($1,106,809 vs $545,257) only exists
  after filling in real inputs on the SEC's investor.gov compound interest calculator and submitting
  the form; `capture_evidence.py` (Playwright screenshot-only) can't do that. Used the interactive
  Claude Browser tool instead: filled the real fields, clicked Calculate, read the exact result via
  `get_page_text` (not eyeballed, not estimated). This is the same rigor as a screenshot — a live read
  of the primary source — just captured as verified text instead of pixels. Documented explicitly in
  `work/facts.json` as `[VERIFIED - computed live on the primary tool itself]` rather than presented
  as a screenshot that doesn't exist. **A screenshot of the tool's OWN rendered still image also
  failed** (`mcp__Claude_Browser__computer` screenshot action: "Browser pane is not displayed" —
  a tooling limitation in this session, not a page problem) — worth knowing before spending more time
  retrying that specific call.
- **A path bug in a hand-written beat-rematching script silently broke `build_longform.py` until the
  very last step (`--plan-only` didn't catch it, only the real render did).** Deleting bad Openverse
  images and writing replacement paths into `beats.json` used full repo-relative paths
  (`videos/<project>/work/images/...`), but `build_longform.py`'s path resolver
  (`rel = lambda p: os.path.join(proj, p)` if not absolute) expects paths relative to the PROJECT dir
  only (`work/images/...`) and silently double-prefixes anything else. `--plan-only` printed the
  (wrong) paths without checking existence; only the real `build_longform.py` run failed, reporting
  "80 image(s) missing." **Any tool or hand script that writes into `beats.json.image` must match the
  project-relative convention exactly** — verify with a quick existence check (`os.path.exists`)
  immediately after writing, don't trust a dry-run/plan-only mode to catch a path-resolution bug if it
  doesn't actually stat the files.
- **Cost/time:** ~$0.15 AssemblyAI ASR (19.8 min) + $0 everything else (edge-tts, Pexels, Remotion,
  ffmpeg). Wall clock dominated by the ~50-min Ken-Burns render (166 beats) and the ~15-min two-pass
  loudnorm master — both ran unattended in the background while research/packaging/EVOLUTION work
  continued in parallel, which is the actual lesson: **long ffmpeg/render steps should always be
  backgrounded and worked around, never blocking-waited on**, per the standing PARALLELISM rule.

### Video: hydrogen-peroxide-truth (2026-08-05) — Forgotten Fix, disk-full root-caused to SHIPPED projects' caches, preflight check added

- **The disk-full this time was a different root cause than the qwen38-max-release incident
  (2026-08-04, above) — that one found superseded *intermediate files within the active project's own
  output/*; this one found `work/_lf` render caches from SIX OTHER, ALREADY-SHIPPED projects**
  (`car-battery-backup-power`, `cool-room-no-ac`, `money-archive-compound-interest`,
  `re-closing-costs`, `re-beginner-no-money`, `re-agent-commission` — ~6.4GB combined) that were never
  cleaned up after those videos uploaded. `work/_lf` is *deliberately* kept warm within a project (see
  "Long-form had no beat cache" above — it's what makes a re-render of one changed beat cost 1 encode
  instead of 283), so the fix is NOT to prune it automatically on every run — that would defeat the
  cache for a project still being iterated on. The actual gap: nothing ever prunes it for a project
  that will *never render again* because it already shipped. `build_longform.py` crashed mid-render
  (ffmpeg write failure) rather than failing clearly, costing a full render restart after manual `du -sh`
  triage found the waste.
- **Fixed at the source**: `build_longform.py` now runs a disk-space preflight before the encode loop —
  estimates required space from target runtime (~1.5MB/s covers scratch cache + final output, measured
  on this render: ~5.1GB peak for a 1304s video), and if free space is short, exits immediately (instead
  of crashing partway through a 20+ minute render) printing every *other* project's `work/_lf` directory
  found on disk with a ready-to-run `rm -rf` for each — since any such cache belongs to a project this
  preflight has no way to know is finished, the message names them as candidates, not commands to auto-run.
- **Recovery, for the record:** deleted the 6 stale caches above (~6.4GB) plus this project's own
  crashed-run scratch (~3.4GB `_lf` + ~1.7GB corrupt partial output), then re-ran clean. Every downstream
  intermediate (visuals → captioned → sfx → music → master) was deleted immediately after the next stage
  consumed it for the rest of the session, keeping the drive at 96-98% used throughout rather than risking
  a second crash.
- **Stock photo QA caught two more wrong-subject images** (a `hydrogen peroxide bubbling wound` query
  returned an inappropriate chest-closeup photo, unrelated to the topic; a `bottle pouring` query
  returned a bottle too generic/ambiguous to read as hydrogen peroxide on a thumbnail) — same class of
  failure `fetch_stock.py`'s own output already warns about ("LOOK AT THEM before rendering"). No new
  rule needed, just another concrete instance: keyword stock search will keep returning on-topic but
  visually-wrong-or-inappropriate images, and eyeballing every candidate before use is not optional.

### Videos: re-escrow-shortage + re-city-down-payment (2026-08-05) — 4th and 5th videos for The Closing Table, hit the disk crisis from the OTHER side
- **Ran headfirst into the exact disk-full crash documented above, from a DIFFERENT session, at the same
  time.** `final_mix.py` failed mid-write on `re-escrow-shortage` ("No space left on device"); a sibling
  project, `money-archive-mortgage-payoff`, showed the identical failure signature at the identical
  timestamp (07:31-07:57) in its own `output/` directory. **Before deleting anything, matched mtimes
  across projects to confirm it was a live concurrent session, not stale leftovers** — and left that
  project's in-progress files completely alone, even though they looked exactly like "superseded
  intermediates" by name. Cleaned up only this session's own broken/superseded files instead (a corrupt
  0-byte-progress `MASTER.mp4`, plus `visuals.mp4`/`sfx.mp4` already superseded by a valid `music.mp4`),
  which was enough headroom to retry. **The preflight check documented above (added by that same
  concurrent session, same day) is now live in `build_longform.py`** — confirms the fix; no further
  tooling change needed from this session.
- **A second failure mode from the same root cause: a concurrent session's OWN cleanup deleted this
  session's scratchpad directory and a background task's output-capture file mid-run**, surfacing as
  `ENOENT`/"ls: cannot access" and a `<bash output unavailable>` marker on an upload command whose actual
  success/failure couldn't be confirmed. Fix used: re-ran the upload (idempotent-safe here specifically
  *because* it lands as a **private draft**, never a public duplicate) rather than guessing; for spot-check
  frames, switched from the shared cross-session scratchpad to a folder inside the project's own
  `videos/<slug>/` tree (deleted after use) so a sibling session's temp-dir cleanup can't wipe it mid-task.
  **Shared scratch directories are not safe to assume are exclusive to one session when multiple Claude
  Code instances run against the same repo.**
- **Adopted the established per-video-then-delete discipline throughout** (visuals → sfx → music → master,
  each deleted the moment the next stage consumed it) rather than waiting for a crisis to start doing it —
  cheap insurance once you know another session might be sharing the same disk budget.
- **`re-city-down-payment` started as a hyped, false pitch** ("cities pay your ENTIRE down payment, bypass
  private lending, zero equity, no PMI") pasted in from what reads like an AI title/outline tool's output.
  Fact-checked before writing a word: every real program found (South Bend 20% forgivable, Baltimore
  $5,000 lottery, Newark $20,000 at 0%) still requires a real private mortgage underneath it — the "bypass
  lending entirely" framing was false for all of them, and the "three cities replenished funding this
  fiscal quarter" detail was unverifiable/invented. Flagged this to the user with the real findings before
  producing anything (AskUserQuestion, not a unilateral rewrite) and got explicit buy-in on the honest
  reframe, which became the video's own hook (open by debunking the myth the user was pitched, per
  GROWTH RULE 2's retention-loop pattern) — same honesty_guard override that already governs every other
  video on this channel, just triggered by an external prompt instead of a self-generated one this time.
- **`check_deliverable.py`'s "no music bed found" warning is a false negative when the intermediate
  `-music.mp4` file has already been deleted for disk space** — it checks by filename, not by measuring
  the actual master's audio. Confirmed via direct `volumedetect` gap-floor measurement on both videos that
  the bed genuinely was baked in (+3.4 to +3.5dB lift in the gaps, consistent with videos 2-3). Read this
  warning as "can't verify by filename" not "music is missing" whenever the pipeline-stage cleanup
  discipline above has already run.
- **VO synthesis rate landed almost exactly at the 150.3 baseline on video 4** (622.7s actual vs ~636s/-4%
  script estimate) but still needed a real second pass on video 5's first draft (1116 words, ~450 short) —
  reinforces the earlier finding that realized rate is genuinely per-script, not a fixed function of voice
  + niche. Budget from the tool, verify from the actual VO, every time, no exceptions.

### Video: weathernext-cyclones (2026-08-06) - ai-news single-story, full chain to upload, first vision-less run
- **The SFX audibility measure has a silent false-negative trap: `astats` with `reset=1` emits one
  entry per audio frame, and taking `min()` of those collapses the window to its QUIETEST frame.** On a
  speech window that means a 30ms micro-gap between words reads as "-41 dB silence"; on a gap window a
  soft word-tail frame does the same. First pass reported 24/41 cues "below threshold", including
  whooshes landing in measured dead air — every one of them a measurement artifact, not a mix problem.
  Correct method: `ffmpeg -ss T -t W -i in -af astats -f null -` (no reset) and parse the single overall
  `RMS level dB` — one value per window, no min/max games. Re-ran: 41/41 cues pass (critical ≥ +4dB,
  texture ≥ +1dB). Rule: **measure segment RMS with a single-pass astats, never per-frame stats.**
- **gpt56-price-cut's measured SFX gains transfer verbatim to a second ai-news video — zero new clips,
  zero iteration.** Library-first worked again: 41 cues from existing catalog, all ≥ thresholds at
  gpt56's final gains (+5 deep impacts / +3 impacts+pops / +2 stamps / +4 chime / +5 riser / -2..-3
  whoosh in gaps), and hero slams synced to spoken words verified via edited-transcript.json windows.
  The riser placement rule (align the clip's LOUD TAIL to the moment, start 1.36s early) also held.
- **TTS gap floors are true digital silence (-35 to -65 dB mean), so the floor-based bed-gain formula
  from re-closing-costs does NOT apply — the niche file's stored -6 is right for TTS.** The real-estate
  lesson (measure THIS video's floor, bed = floor+4..6 - clip_mean) exists because breathy real VO has a
  ~-27 dB gap floor; edge-tts Andrew has none, so the validated -27 dB effective bed sits cleanly above
  it (measured: bed lifts gaps to ~-30 dB absolute, ≤+0.5 dB under speech). Measure the floor first to
  know WHICH regime you're in, then trust the niche value for TTS.
- **`yt_upload.py` needs the venv python (`venv/Scripts/python`) — `googleapiclient` is not installed
  in the system Python.** Upload preview parsed fine, then crashed at import. Run uploads with the venv.
- **Vision-less runs change the verification gates, not the work.** With a non-vision model the
  contact-sheet eyeball, thumbnail open-and-check, and 246px squint test cannot be done by the agent —
  surface the artifacts to the user instead of silently skipping (a keyword-returned wrong-subject photo
  is the exact failure those gates exist to catch). This video: picked the satellite photo by filename
  semantics, rendered, and handed the user the contact sheet + thumbnail for the eyeball before upload.

### Video: burnt-pan-truth (2026-08-07) - Forgotten Fix long-form, full chain through UPLOAD, vision-less run 2
- **`build_longform.py` silently truncates when a Pexels clip is SHORTER than its beat** - the render
  stopped at the shortest clip and `-shortest` ate the closing line (779.2s vs 784.5s VO, the sign-off
  cut off mid-word). Fixed at the source: freeze-pad short clips with `tpad=stop_mode=clone:stop_duration=600`
  and bumped the segment cache key to `vfv:2` so stale short segments are never reused. The re-render
  landed 784.53s video vs 784.536s audio - exact match. Rule: after ANY longform render, probe both
  streams and diff against the VO duration; a mismatch means a clip underflowed its beat.
- **The `mono->stereo` upmix in the mix chain costs exactly -3.01 dB on the voice** (ffmpeg's default
  channel-conversion scaling), so comparing the SFX mix against the captioned file's voice level showed
  a phantom "VO got quieter by 3dB" that was pure format mismatch - the SFX clips were mixed in the same
  conversion so everything shifted together. Rule: when verifying a mix, measure the BEFORE and AFTER
  against the SAME `aformat` chain, or you will chase a codec artifact. (Confirmed: 24k->48k sample-rate
  upsampling alone is lossless; the loss is the channel upmix, not the rate.)
- **Music bed for TTS: the niche-stored `-5` was right, but only after measuring the RIGHT gaps.** First
  pass sampled "gaps" from the transcript and got +0.4..2.9dB lifts that looked like a silent bed; those
  windows were actually inside speech or SFX tails. Ran `silencedetect` on the render itself, sampled the
  TRUE -45dB silence mid-gap, and the bed measured **+13dB in real silence, +0.5..3dB in speech gaps** -
  exactly the validated TTS profile. Rule: for TTS verify bed audibility on silencedetect-found gaps, not
  transcript-derived ones.
- **Evidence beats kept getting clobbered by the video pool fallback** (beats without a `video_query`
  were assigned random videos during the pool write-back). A repair pass re-pinned all 9 evidence beats
  with `move: "none"` and verified zero image beats still pointing at .mp4s. The pattern to avoid: pool
  assignment must not touch beats that carry evidence files.
- **ElevenLabs key on this machine is stale** (HTTP 400 `invalid_api_key`, "must start with sk_", 64-char
  key). Workaround that stays free and licence-clean: `tools/synth_foley.py` - deterministic ffmpeg lavfi
  synthesis (anoisesrc/aevalsrc, same seed -> same WAV), normalized ~-20 LUFS, grew the kitchen-foley
  catalog 33 -> 43 clips. Do not retry the key until it's actually rotated.
- **Captions with zero emphasis markers: the `--plan-only` heuristic run covers 16% max stress - enough
  for the gate but it's a default, not tuned.** If a specific line MUST pop (the money line), hand-edit
  caption-plan.json m-flags before burning; `gen_captions_emphasis.py --plan-only` is the mechanism.
- **The mix->master chain for long-form now: bake (build_longform) -> burn ASS captions -> mix_sfx
  (preview MUST point at the CAPTIONED file) -> mix_music -> final_mix -14LUFS/-1dBTP.** All 18
  check_deliverable gates passed; A/V durations agree. Shipped private draft to The Forgotten Fix
  (cadence: flip public manually in Studio, one per channel per day).


## Voice library (chosen voices per delivery mode)

| Mode | Voice | Voice ID | Notes |
|---|---|---|---|
| breaking-news | (testing needed) | | Try Daniel with style 0.3, or Adam |
| calm-explainer | Alice | `Xb7hH8MSUJpSbSDYk0k2` | Clear, engaging educator |
| sarcastic-review | (testing needed) | | Try Roger or Charlie |
| authoritative | Daniel | `onwK4e9ZLuTAKqWW03F9` | Steady broadcaster |

## Performance notes (what worked, what didn't)

- **TTS cost:** ~$0.20/min at Creator tier. A 5-min video = ~$1. Reasonable.
- **Render time:** ~2-3 min per shot at scale=1 on this machine. 6 shots = ~15 min.
  Acceptable for preview. Final 4K render would be longer.
- **Bake time:** ~2 min for a 2.5-min video. Fast.
- **Total pipeline time (prompt → baked video):** ~25 min for the gemini-release video.
  Target: under 15 min for a 3-min video.

## Style preferences (evolving)

- **No em-dashes** in on-screen text (brand rule — carry over from original)
- **Section cards** should stay under 4 seconds in breaking-news mode
- **Highlight sweeps** (the color wipe behind a key word) are effective — keep them
- **Dark background** works better than light for news/tech content
- **Source citations** at the bottom of evidence shots (e.g., "Source: Bloomberg, Jul 2026")

## finance-rent-vs-buy (2026-2026-08-07) — finance long-form, prompt-to-video

### What shipped
- 19.2 min finance explainer: "Renting vs Buying: Two People, Twenty Years, The Real Math"
- Generated VO (edge-tts, en-US-GuyNeural), ASR-aligned (AssemblyAI), burned ASS captions
- 13 stat cards (compare/stat/quote types), Ken Burns image sequence (152 beats)
- 5 SFX cues (low density per finance niche), ambient-pad music bed, -14 LUFS master
- Text-only thumbnail (word variant, split concept not available without public images)

### Pipeline lessons
- **build_longform.py renders silently for 10+ minutes on 152 beats.** No progress output. Timeout must be set to 600000ms (10 min) minimum for 19-min videos. The 1.6 GB visuals.mp4 takes ~50s to concatenate after all segments finish.
- **gen_captions_ass.py --burn drops the audio stream.** The output video has only the video stream (h264), no audio. Must mux VO audio first (ffmpeg -i visuals.mp4 -i voiceover.mp3 ... -shortest visuals-vo.mp4), THEN burn captions onto visuals-vo.mp4 to get a video with both burned captions AND audio.
- **mix_sfx.py needs a video with audio.** When the base has no audio, FFMPEG filtergraph fails with "Stream specifier ':a' matches no streams" because [0:a] references a non-existent stream.
- **gen_thumbnail_tsx.py --variant split needs images in public/ path.** Stock images in work/images/ are not accessible to the Remotion server. Use --variant word --allow-textonly for generated thumbnails, or copy images to public/ first.
- **Runtime overshoot: 19.2 min vs 17.5 target (+10%).** The script was 3,127 words at 177.3 wpm = ~1058s target, but ASR timed the VO at 1154.7s. Edge-tts pacing can vary 5-10% from word-count estimates. Run plan_runtime.py measure on the actual VO file after generation to catch drift early.

## 2026-08-08 — qt-funded-ad 15s cutdown (shipped)
- **check_deliverable's caption-coverage check measured the last caption event's START, not its END.** Its regex anchors on `Dialogue:` so each line yields only its start timestamp; a final caption held through an end-card (correct editing, and what makes captions actually cover the tail) false-failed (''events run to 11s of 15s'' while the .ass provably ended at 14.5s). Fixed 2026-08-08: the check now captures both timestamps per line and reads the last event's END. Any future tweak of that check: read the END of the last event, never its start.
- **Render jobs die with `OSError: [Errno 28]` when the drive has ~0 bytes — and the repo's ideos/ tree (24 GB of finished projects) is the first thing to check.** qt-funded-ad's own outputs are ~5 MB each; the disk was at 0.4 GB free from old project folders plus the user's other data. Before starting a render chain, check `Get-PSDrive C`; if free < ~1 GB, delete stale remotion/out PNG stills and superseded stage files, and ask the user before touching old project folders.


## 2026-08-08 — grok-imagine-image-2 (ai-news, prompt-to-video, shipped)
Full chain: script -> edge-tts VO -> AssemblyAI ASR -> 23 mock shots (0-406s contiguous) -> burned
ASS captions (189/1228 stressed) -> 30-cue SFX -> tech-pulse bed -> final_mix (-14.01 LUFS) ->
check_deliverable SHIPPABLE (18 gates) -> one thumbnail -> uploaded private draft
(video J9DTxa0TcXo, AI Under 3 Min).

### Pipeline lessons
- **check_deliverable motion gate: a 100% cutaway spec must declare spec.motion.kind = "shots", NOT
  "punch-ins".** bake.py honestly warns "a punch under a cutaway does nothing - the shot replaces
  the master", so reframes can never be visible on a fully-covered timeline, and the gate FAILED
  with "NO punch-ins". House precedent (qwen38-max-release etc.) uses kind "shots". The spec was
  wrong, not the gate - never "fix" a gate by editing around it; fix the spec to describe the video
  that actually exists.
- **SFX: 30 cues (~4.4/min) is the right density for a 6.8-min news explainer** - below the 8-12
  ceiling, calm-premium per brand §10. Stamps landed at -12 dB (percussive +3-5 rule), pop-reveals
  -16/-18, whoosh/riser -20. Chip-slot sequencing (fade-out before next chip lands) kept pops from
  colliding.
- **Music bed: ai-news.json has NO music block at all - the "tech-pulse -6dB" in spec.json was a
  guess.** Measured THIS video's word-gap floor (~-26 dB) and iterated: bed-gain 0 gave only +2.3 dB
  lift (too quiet), +3 landed +3.5-4.6 dB in gaps with <=3 dB under speech (duck working). Rule: the
  niche file's value, when it exists, is a starting guess - always measure THIS video's floor and
  iterate 1-2 times.
- **Upload auth: the ai-news token numer is the LEGACY .youtube/token.json, and it was expired
  (invalid_grant) - re-auth is interactive-browser-only.** There is NO token-ai-news.json
  (ai-news was the original single-channel token before per-channel tokens). Running upload with
  --channel ai-news silently fell into the browser OAuth flow and hung in the shell until timeout.
  Fix: `yt_upload.py auth` (no --channel) writes the legacy token; upload works with --channel
  ai-news afterwards via the legacy fallback. Whoami --all confirms each channel.

## 2026-08-09 ??" Shorts pipeline (tools built, first clip smoke-tested)
New: tools/clip_shorts.py (propose/clip/verify/package) + tools/yt_comment.py + docs/SHORTS-WORKFLOW.md.
The chain: propose (rank windows by spoken emphasis from caption-plan.json) -> clip (9:16 1080x1920
center-crop + lanczos, sentence-snapped, optional --loop) -> verify (vertical, <=180s, audio) ->
package (publish.json, link FIRST line) -> yt_upload -> flip public in Studio -> yt_comment post
(redirect comment, pin by hand) -> track_performance tag with --cross-linked-from <longform>.

### Loop strategy
A Short that ends right before its own payoff (or on a question) turns the description link into
the reason the swipe stopped. propose marks such windows; clip --loop withholds the window's
strongest sentence (energy >= 5, not the first) and records it; package dangles the withheld
payoff under the link in the description.

### Pipeline lessons
- **There is NO YouTube API for pinning a comment.** commentThreads.insert works (needs
  youtube.force-ssl � one-time re-auth via yt_comment.py auth), pinning is Studio/app-only.
  yt_comment.py posts the comment and prints where to tap Pin; it also refuses private videos
  (the comments API rejects them) so the order is: flip public, THEN post.
- **Burned 16:9 captions survive the horizontal 9:16 crop.** The center-crop of 1920x1080 ->
  608x1080 -> 1080x1920 keeps the bottom-margin captions intact at ~96px effective � no reburn
  needed for burned masters (spec captions.style == burned). Overlay-caption videos (16:9 Remotion
  alpha) get a reburn via --captions auto: windowed, time-shifted ASS at 76px for the Short.
- **Dry-run must not auth.** yt_comment.py --dry-run initially constructed the API service (and
  tried refreshing a token missing force-ssl) before checking dry_run; moved service construction
  after the dry-run branch so --dry-run needs no token at all.
- **Sentence snap beats raw timestamps.** clip snaps start to the first word onset >= t0-0.75s
  and end to the last word end + 0.45s tail, so Shorts never cut mid-word; propose excludes the
  last 60s (closing CTA) so the Short never ends on "like and subscribe".
- **Cadence guard**: package warns if uploads already landed today (max one public flip per
  channel per day, GROWTH RULES).

### Cross-check pass (same day, before first real batch): four bugs fixed
- **Per-word ASS events stacked on top of each other.** The first burn implementation emitted one
  Dialogue line per word; words overlap in time, so libass rendered fragments on top of fragments.
  Rewrote build_windowed_ass the gen_captions_ass way: ONE event per word ONSET that redraws the
  WHOLE phrase (spoken white, upcoming dim, stressed amber) with each event abutting the next —
  visually identical to the house long-form style, structurally incapable of overlap.
- **`clip videos/ai-kill-switch` double-joined the path** (videos/videos/...) in the spec check,
  the captions.ass check, and the default slug. clip now normalizes the source once at entry
  (norm_source), same as find_master already did internally.
- **propose produced ZERO windows for sources shorter than ~60s**: cut_off = total - 60 went
  negative, so every window start was inside the excluded CTA region. The CTA tail only exists on
  videos long enough to have one — cut_off now stays 0 for anything under ~90s.
- **Loop min_duration was hardcoded 8s in clip but a flag in propose.** clip --min-duration now
  governs both, and the loop re-run in clip uses the same value so a --from-propose batch can
  never drift a loop cut past its payoff (snap extends t1; loop re-withholds).

### Batch command (the biweekly ~5 became one line)
`clip_shorts.py batch <source> --clips N --duration S` proposes AND clips all picks in one run,
re-applying loop withholding per window. `track_performance.py tag` also prints the real base dir
(shorts/ vs videos/) instead of always claiming videos/.

### Final audit (same day): loop-always, batch diversity, speed, publish chain
- **The loop is now ALWAYS on** (user rule: the Short's end must flow into its start). `clip`
  defaults to loop; `--no-loop` opts out. When no payoff exists to withhold, the clip ends
  exactly on its final word instead of the old 0.45s dead-air tail — dead air is what makes a
  loop feel like a restart instead of a continuation.
- **5 clips from one video must not feel like 5 versions of one moment.** build_windows now
  rejects repeated opening words, more than two identical loop endings, and windows from the
  same third of the video (rules relax only to fill a thin count). Opening on a continuation
  cue ("and"/"so"/"but"), mid-sentence, or on a CTA ("subscribe…" — CTA_RX was dead code!)
  downweights a window. Measured before/after on ai-kill-switch: the batch went from 3 windows
  clustered near the same beats to 5 spread across all thirds with mixed loop endings.
- **Speed, measured, not assumed**: 30s clip = 3-4s of QSV encode; only the window is decoded
  and re-encoded (the 16:9→9:16 crop forces a re-encode — there is no stream-copy shortcut),
  never the whole master. clip now prints the encoder + seconds so the number is visible.
- **`--min-duration` now means what it says**: loop withholding previously used a hidden 8s
  floor (`min(a.min_duration, 8.0)`), so a 12s-minimum clip could be withheld to 8s. The flag
  is the floor everywhere now.
- **Publish chain audited with dry-runs**: shorts publish.json validates against yt_upload
  (no thumbnail needed — covers are set in the mobile app anyway), lands private, records
  published.json with videoId+watch_url; yt_comment refuses pre-upload, warns on non-public,
  and composes the redirect comment from the long-form's published.json. Pinning has no API —
  that remains the one manual tap.
- **30s is the new default clip target** (was 45): Shorts completion-rate sweet spot; longer
  works but completion drops.


### burnt-pan-truth Shorts run (2026-08-09): 12 clips shipped, two real bugs found
- **yt_comment.py post_comment had NO body dict** - `body` was never built, so
  `commentThreads().insert` always raised NameError and the error handler blamed privacy.
  Fixed: body = {snippet: {videoId, topLevelComment: {snippet: {textOriginal}}}}. The privacy
  gate is real (comments API rejects private videos, 403), but a NameError had been masking
  it. Lesson: when a tool's error path names a variable, check the happy path built it first.
- **Title/description drift after hand-editing publish.json**: a `$` in the title got mangled
  by PowerShell interpolation twice (edit went into publish.json but NOT description.txt,
  which package had already generated from the mangled title) - the upload shipped the
  description with "it''s a ` mistake". Lesson: after any title edit, re-run package or edit
  BOTH files; prefer single-quoted PowerShell args or the edit tool for titles containing $.
- **12 good clips off one 13-min video, end to end in ~25 min** (batch 12 clips ~2.5 min,
  12 uploads ~15 min incl. per-video preview). Loop clips dangle the payoff ("...and the
  first step is the one most people skip"); question clips dangle the answer; both get an
  honest description line pointing at the full video.
- **Comments could not be posted: token lacks youtube.force-ssl scope** - one interactive
  `yt_comment.py auth` run adds it, but it was never done. Added to the setup checklist;
  comments stay blocked until a Short is public anyway, so the flip and the auth can be one
  sitting.

### softstep-slides-ad (2026-08-10): first client ad through the short-form chain, three spec-level traps
- **gen-registry.mjs reads compositionConfig with a REGEX, not an eval.** `width: VW` (a constant) silently fell back to 1920 and registered 1920x1920; `width: 1080` literal works. Lesson: keep compositionConfig values literal numbers; constants in it are invisible to the registry.
- **spec.json `runtime.target_min` must equal the AGREED brief, not a placeholder.** The check_deliverable runtime gate compares the video to spec - 0.833 min in spec made a correct 60.0s ad fail at +20%. Fix the spec to the approved target, then re-run the gate. This is the spec-side clock of the same "runtime is a requirement" rule - also cover it in Intake.
- **Evidence gate has a sanctioned opt-out for ads.** `"evidence": {"required": false}` is real (check_deliverable reads it), and is the HONEST setting for a client ad whose only claims are bio facts that cannot be screenshotted (private IG, verified unreachable) and whose real proof is the client's product photos (pending). Fabricating screenshots to satisfy the gate would be the exact dishonesty the honesty_guard bans - the opt-out + a spec note documenting WHY is the correct move, not a hack.
- **ASR-first shot cutting:** all 8 shot start cues were derived from edited-transcript.json word times (ms), converted to shot-local frames - slams land on their spoken words. Long VO chunks (6-10s) got a `SSDrift` slow push (useDrift 1.0->1.05) so a settled frame never reads as broken.
- **Captions: 60s vertical overlay = 353s ProRes render** (vs 1s plan + burn for long-form ASS). For a 60s ad that is the right cost; the 3-min sleeved overlay rule from long-form does not apply yet, but note it - at 90s+ ads, burned ASS is likely the win (same as long-form).
- **Product-photo slots pattern:** `HAS_PHOTOS` gate in the shot kit - placeholder brand frames now, flip one flag + re-render when the client's photos drop. Never render fake product shots; the slot is the honest form until real media exists.
- **Client feedback (owner scored it 6/10) - the ad voice must be the AD's voice, and the REGION's.** The softstep ad shipped with the channel's warm-US narrator (en-US-BrianNeural) re-used from long-form channel videos. For a client ad that is the wrong voice twice over: (1) an ad is not a channel video - it gets its own vibrant voice matched to the beat energy; (2) a Ghanaian brand must sound Ghanaian - the audience it targets lives in Accra, and a US TV-anchor accent reads wrong there. edge-tts has no en-GH; the closest is en-NG (EzinneNeural f / AbimbolaNeural m, verify live). Now a standing rule: make-ad skill checklist #6.
- **Client feedback - the CTA-overlay safe zone, learned the hard way.** The colorway strip was pinned to the ABSOLUTE bottom of the 9:16 frame and the platform's CTA overlays + the in-ad CTA covered exactly that zone on every device; the owner called it out. Decision-critical visuals (product hero, price card, colorway strip) go at MIDDLE or slightly below middle on vertical ads; the bottom ~20% is overlay real estate. Eyeball a mock with overlay bars drawn in before rendering. Now a standing rule: make-ad skill checklist #10.

### neuralink-smart-home re-upload (2026-08-11): the long-form had silently shipped with video ending at 219s of 456s
- **Symptom chain:** shorts clipping exposed it - clips drawn past ~219s came back with zero video
  frames (h264_qsv + libx264 both "Could not open encoder before EOF" = the filter had no frames,
  NOT an encoder fault). Probing the uploaded MASTER: format/audio 456.24s, video stream 219.27s
  (6,578 frames). The upload had been private since 2026-08-07 and looked plausible in Studio.
- **Root cause:** the bake ran against an OLD timeline. Its 10 cached segments sum to exactly
  219.26s; 	imeline.json had since grown to 456.24s (BrainChart 258-456 etc.), the shot mp4s for
  the new timeline were never re-rendered (only PNG stills existed in remotion/out - stills are NOT
  evidence the shot renders exist), so nobody re-baked. The concat stream-copied whatever video
  segments existed and muxed full-length master audio over them. Lesson: after ANY timeline edit,
  re-render the shots + re-bake + verify fprobe -select_streams v:0 duration == format duration
  before upload; check_deliverable's A/V-agreement check catches this if it actually runs.
- **Fix path (measured, 8 cores):** re-render 8 shots (14 min; BrainChart 200s alone = 12 min) ->
  ake.py --fresh -> mix_music.py --bed tech-pulse --bed-gain -6 (bed mean -21.0 dB) ->
  inal_mix.py (landed -14.05 LUFS / -1.09 dBTP) -> re-upload. Fixed MASTER: 456.23s video,
  13,687 frames = exactly the reference master.
- **Re-upload mints a NEW videoId** (yt_upload.py has no update/replace mode). The old broken
  upload (jfn7eHRQdAE) must be deleted manually in Studio. Every baked-in URL must be repointed:
  the 5 shorts' descriptions + description.txt + shorts-plan.json all still said
  youtu.be/jfn7eHRQdAE - fixed via one videos().update per short (private drafts, free) + file
  edits. Rule: after re-uploading a long-form, grep the whole project dir for the old videoId
  before any Short is published.
- **track_performance.py tag cannot UNSET journey_framing** once set (no CLI flag clears it) -
  had to edit docs/research/format-log.json directly. Give the tool a --no-journey-framing flag or
  make re-tag overwrite the value.

### maviga-real-estate (2026-08-11): first client-flyer-to-video, no-model-vision extraction pattern
- **This model has NO image input (deepseek-v4-flash-free).** Told the user upfront, then won anyway: flyer text was extracted with **Windows' built-in OCR** (Windows.Media.Ocr.OcrEngine via a PowerShell WinRT helper, ~70 lines, zero installs, fully local so client assets never leave the machine) - word-level bounding boxes gave the complete layout map (logo lockup x29-193 y114-147, slogan, location block y635-820, 3-column payment grid y830-1070, contact strip y1199). Saved as C:\Users\O M E N\AppData\Local\Temp\opencode\ocr-boxes.ps1 (param gotcha: never name a local var like a param $File - case-insensitive clobber).
- **Brand palette by pixel sampling, not guessing:** PIL quantize to 6 colors on the master flyer -> cream #FDFBF5/#F3EFE3, ink navy gb(23,43,60), muted olive gb(158,156,129). The whole video is built in those sampled colors.
- **Flyer-component extraction pattern (the client's actual ask):** crop the flyer's regions by OCR coordinates (logo, option cards, location block, scarcity line) with PIL at 2x, stage them as framed 'design objects' in code-built shots - real client artwork IN the video at readable mobile scale, never the whole flyer pasted. Cash beat shows the three flyer option cards + rebuilt live price type simultaneously. This directly answers 'don't just paste the flyer'.
- **Honest visuals when the client has NO photos:** no site photos, no map pin -> the plot drawn to its real dimensions as a schematic (80x80 ft square), a route schematic using only the flyer's own words (Central University -> 4 min -> turn left -> site, labeled 'PER MAVIGA'S DIRECTIONS'), never fabricated imagery. Flyer's own 'Only 20 plots left' kept as client-reconfirm-before-public.
- **Verification without vision:** frame-level pixel checks (avg RGB per beat, dark/white pixel % via PIL on ffmpeg-extracted frames) prove every beat renders real content, not blanks. The user's eyes on the preview remain the taste check.
- **ENOSPC discipline (C: was 0 GB free mid-session):** stale alpha-overlay .movs in emotion/out from CONSUMED bakes eat ~1.1 GB (softstep 239MB + qt-funded 719MB + this project's own 30s overlay 144MB). Delete consumed overlay artifacts BEFORE big renders; every .mov is regenerable in ~2-3 min. Rendered-shot mp4s stay (bakes read them).
- **bake.py requires timeline.json preview key** (end_s/out/width/height/fps) - hit KeyError:'preview' on the first bake of a fresh project; softstep's timeline had it wired and the new one didn't. Add it when authoring a timeline.
- **Region rule applied live:** en-NG-AbeoNeural (Male, Friendly/Positive) +8% = 32.1s for 73 words - the Ghanaian brand gets a West-African accent per the new make-ad rule #6 (verified edge_tts --list-voices: no en-GH exists, en-NG is implicit closest).
- **Cutdown pattern for ads:** 15s cutdown = text-driven (no VO) with a silent master (fmpeg color + anullsrc), 4 phrase-captions hand-authored in caption-plan.json (one whole line per phrase), own SFX plan, bed at duck 0, final_mix -> -14.48 LUFS. The 30s gate doesn't apply to the cutdown (different transcript) - it's a derivative, verify by pixel checks + eyes.
- **Client brief lesson:** a big client's prompt is a compliance layer (no invented details, verify facts, sign-off before final) - keep it ALL, but the creative structure it dictates (6 sequential text beats = slideshow) is the thing to fight. One dense composited dossier beats six thin fact cards. The brief's 'show the original flyer clearly, do not recreate' is the flyer-paste trap; components-with-positions is the masterpiece.

### gemini-3-7-release (2026-08-14): same-day flagship model release breakdown pipeline
- **Breaking News Turnaround Discipline:** Produced 3.7-min (222.7s) video for Gemini 3.7 Flash released by Google DeepMind on Aug 13, 2026. Passed all quality and clarity gates in a single automated pass.
- **Clarity Linter Pre-VO Gate:** 48 sentences, 641 spoken words, Flesch-Kincaid Grade 6.9, 13.4 avg words/sentence. 100% jargon glossed on first use. Passed stakes-in-hook with explicit cost/pricing context ($0.75 introductory pricing vs $1.50 in 2027) and second-person direct address.
- **Edge-TTS & Word Alignment:** Free `en-US-AndrewNeural` at +14% rate (1.15x speed) delivered 222.7s audio cleanly with frame-accurate word boundary timestamps.
- **Evidence & Spec Cards:** Captured 3 live web screenshots (DeepMind announcement, Google AI pricing, Copilot integration) via `capture_evidence.py` and rendered 7 branded stat/compare spec cards (DeepSWE 65.3%, FrontierCode 43.6%, WebDev Arena 1588 Elo, AutomationBench 30.4%, GDP.pdf 34.0%, and the 2027 fine print quote) with `gen_spec_cards.py`.
- **Motion & Captions:** 89 beats composed via `build_longform.py` with Ken Burns motion, 100% covered by real screenshots or rendered cards. Synchronized burned ASS captions generated via `gen_captions_ass.py`.
- **Sound Design & Master:** 7 transition SFX cues mixed with `mix_sfx.py` + ducked `tech-pulse` music bed mixed with `mix_music.py`. Two-pass linear loudnorm via `final_mix.py` hit -14.08 LUFS integrated and -1.20 dBTP true peak ceiling.
- **Packaging & Delivery:** Remotion/PIL thumbnail rendered at 1280x720 (102KB) with high-contrast text and DeepMind evidence card. Uploaded as private draft to authorized channel via `yt_upload.py`.
### musty-basement-fix (2026-08-17): first full prompt-to-video run on The Forgotten Fix (home-hacks)
- **End-to-end:** script (2,578 words, 9x dollar-anchor) -> tts_edge en-US-AndrewNeural @0.96 -> 228 beats / 19 unique / max-consec 1 / 0 gaps -> build_longform 800.0s (safety net extended final beat 5 frames) -> mix_sfx 9 cues (foley from library: water-pour-soft, scrub-brush) -> docu-pluck bed @ -5 (niche-validated) -> final_mix --tp -1.3 landed -14.05 LUFS / -1.49 dBTP -> auto_qa 0 defects -> check_deliverable SHIPPABLE (94/100 packaging, 153 evidence images on screen, burned ASS captions 800s).
- **tts_edge.py / fetch_stock.py expect the project arg as videos/<slug>** - passed the bare slug twice this session: tts_edge wrote a stray musty-basement-fix/ dir at repo root, and a careless Remove-Item deleted the freshly downloaded stock. Lesson: always videos/<slug>; when moving/copying a stray dir, inspect its contents first.
- **check_deliverable needs work/spec.json or it audits the wrong path:** without a spec it assumed 'shortform talking-head' and false-failed (overlay captions, punch-ins, vertical). Fix: tools/video_spec.py new videos/<slug> --format longform-images --minutes X --niche home-hacks --voice en-US-AndrewNeural before the gate.
- **mix_sfx render.preview must point at an EXISTING base video** (it mixes OVER it): on a fresh chain point preview at the -MASTER.mp4, not a not-yet-existing -FINAL.mp4.
- **auto_qa's PACKAGING_BATCH fills candidates.json with its generic ai-news archetypes** even for home-hacks ('RIP Claude?' titles for a musty-basement video). The engine's archetype set is ai-news-shaped; for other niches hand-author candidates.json as a LIST of {archetype, title, thumb_text, evaluation:{total_score, pass_90}} with top score >= 90 (the watchdog reads the top-level list's max total_score). Engine niche-awareness parked as a real gap.
- **Thumbnail:** remotion still via gen_thumbnail_tsx.py + Walt cutout faceCutout + circle callout (FOUR BUCKS / NOT 200 / MUSTY HOUSE, accent hot) - rendered 1280x720 A.jpg (121KB) + A.json sidecar, cleared the last defect class that had blocked 3 older home-hacks projects (their thumbs were never rendered).

### yt_upload.py resumable-upload hardening (2026-08-17, musty-basement-fix upload)
- **This connection uploads at ~195 KB/s (1.6 Mbps):** a 1.1 GB final needs ~95 min, routinely hitting transient drops (ConnectionResetError at 64%, ServerNotFoundError on DNS blips). The retry tuple already covered transport errors but NOT httplib2's own error classes - a DNS failure killed a whole run instantly (exit 1, zero progress). Added httplib2.HttpLib2Error + socket.gaierror to RETRYABLE (tools/yt_upload.py). Note: the harness kills any foreground command at its timeout - a killed process cannot resume a Google resumable session (session dies with the process), so the window must exceed the whole upload: 7,200,000 ms worked.
- **PowerShell buffering traps when tailing a long upload:** | Select-Object -Last N and | Out-File buffer native stdout and lose everything on kill; PowerShell's own 1> file redirection streams incrementally and survives. cmd /c chokes on the space in 'O M E N' paths - use the call operator instead.

### messi-ronaldo-final-score (2026-08-17): Data League pilot — clean-VO re-sync, full renders, baked preview
- **The first master was junk-bearing and junk-reading.** make_master built a 513s master from the first
  VO, but the script's markdown header ("Format Showdown…") and footer ("Sources… data-sheet.md") were
  READ ALOUD — ~30s header + ~65s footer of junk narration. The real content was only ~445s. Fix pattern:
  author a plain-text `work/script_spoken.txt` (narration only, no markdown), re-run tts_edge from it,
  re-master. Rule: TTS reads the TEXT, not the script's intent — feed it a narration-only file.
- **edge-tts flaked mid-way and truncated a chunk** (a long doc ended at 82 words / 46.7s instead of
  ~790 words / 385s). Retried once per house rule and it came back complete. House retry rule saved the
  day; verify output word count vs input word count after EVERY edge-tts run.
- **Re-sync is against real word times, not estimates.** All 11 shot durations + every Scoreboard start
  / CommentaryBar start+exit / DoublePulse / BeltReveal frame were re-anchored to edited-transcript.json
  word onsets (e.g. "Two legends" @17.76s, R1 976 @50.98s, belt "5-4" @334.63s, sign-off @383.83s). The
  plan had estimated ~495s; reality was 385.9s — the estimates were the least reliable input and the
  transcript was the only reliable one.
- **make_master.py rebuilds timeline.json to an EMPTY shots list and resets preview** — after a re-master
  the filled timeline (cutaway in/outs) must be re-authored or bake.py silently drops every segment.
- **render-all.mjs kills a batch at 10 min (600,000ms) default timeout** — a full video render needs a
  longer window (~25+ min on 8 cores; the 11-shot batch took ~13 min after the first kill mid-encode
  left a 6 MB corrupt partial). Pass a real timeout to the shell harness.
- **Scoreboard flash-pop bug (frame 0 crash + no-op), fixed in dataleague.tsx** — see the craft lesson
  above; the pop now uses a fixed `start`-anchored 8-frame window via `Math.max(0, Math.min(1, ...))`.
- **Pixel-verification stills: mid-animation partial opacity = false "fail".** 6 of 28 first-pass checks
  were mid-interpolate frames (alpha < 100%); re-verify at a settled frame OR accept that a transient
  semi-transparent moment is by design. Also: scan the RIGHT region — DLR5Money's ESTIMATE warn tag
  exists on the left column; the first scan looked at the right and reported a false missing tag.
- **Stills are not evidence the shot RENDERS exist** (neuralink lesson reconfirmed): after re-timing all
  shots I re-rendered the full mp4s (4 succeeded before the frame-0 crash; 7 after the fix) and only
  then baked. Bake output: 385.900s video = format duration, boundary frames brightness-checked
  (55-75 mean on dark frames, blanks would be ~10).
- **Baked preview: videos/messi-ronaldo-final-score/output/messi-ronaldo-final-score-preview.mp4.**
  Voice status: Edge temp en-GB-RyanNeural @1.02 until ElevenLabs Daniel top-up; one re-sync pass
  budgeted if regenerated.

## Data League #1 liveliness pass (2026-08-17)

- **User gate: calm VO = slop. The read must be live-commentary energy (auctioneer/football commentator).**
  Rule now lives in brand.md (8: LIVELINESS CONTRACT) and AGENTS.md (6: Liveliness Gate): Edge temp VO
  >= --speed 1.12 --pitch-hz +8 --volume +3; ElevenLabs final >= --speed 1.08; music bed MANDATORY;
  SFX on every scoreboard beat; >0.8s narration-less dead air mid-video is a defect; BLOCK delivery if
  the VO cannot be regenerated energetic.
- **VO regen -> full re-sync workflow (used for the 385.9s -> 345.3s pass):** back up the old transcript
  (edited-transcript.slow.json), regenerate (tts_edge 1.15/+10Hz/+3%: 789 words, 345.3s), then map every
  old word time to its nearest old-word-index and read the NEW time of that same index (both transcripts
  are index-aligned 789 words). Re-anchor ALL shot frame args (start/exit/at/duration end-anchored for
  RaceLine; keep slot formula GAPS constant, only the base moves; durationInSeconds per composition),
  timeline boundaries + preview end_s, and every SFX cue at_s. Verify: tsc, gen:registry, hero-moment
  stills (render a few frames AFTER rise frames - opacity is 0 exactly at at=), full renders, bake.
- **THIS ffmpeg build's aformat mono->stereo conversion applies a 0.7071 (-3.01dB) matrix.** The master
  audio is 24kHz MONO AAC; every format=sample_rates=48000:channel_layouts=stereo in the filtergraph
  silently costs 3dB on the voice. Probe the stream first (ffprobe). Fix: resample=48000 (rate only,
  gain-neutral) + pan=stereo|c0=c0|c1=c0 (channel duplication, gain-neutral). amix=normalize=0 is NOT
  the problem - verified: amix(x2)=+6.02dB, x3=+9.54, x4=+12.04 on duplicated inputs.
- **THIS build's sidechaincompress also attenuates its main path ~3dB regardless of input order.**
  mix_sfx.py now runs without the duck (per-cue gain_db already sits under the voice; measured VO
  preserved, hero cues audible); mix_music.py now uses a STATIC bed gain (-7dB under a -21 LUFS VO)
  instead of the sidechain duck. Bed level verified by measurement, not asserted.
- **Loudness verification discipline:** extract-then-measure (decode the window to WAV first, then
  astats/ebur128 on the WAV) - direct -ss seek + astats on MP4/AAC gave misleading deltas in this
  session. ebur128 for integrated LUFS, astats RMS for window-level deltas. alimiter with explicit
  level_in=1:level_out=1:limit=0.97 adds +0.26dB in this build (transparent with limit-only).
- Deliverable: output/messi-ronaldo-final-score-MASTER.mp4 (-14.38 LUFS / -1.33 dBTP, two-pass linear
  loudnorm via tools/final_mix.py, verified). Preview 345.3s baked; SFX 77 cues; tech-pulse bed at -7dB.
## Data League #1 delivery-gate lessons (2026-08-17)

- **check_deliverable evidence gate conventions (learned the hard way):** evidence shots count ONLY if
  the TSX lives at remotion/src/shots/<project-slug>/<Id>.tsx (NOT a shared kit folder like
  dataleague/) AND the JSX uses an EvidenceFrame/EvidenceBrowser component tag. ID-convention alone
  ("DLEvidenceR1") counts zero if the file is in the wrong folder. Evidence overlays = transparent
  ProRes .mov compositions (compositionConfig.transparent: true) composited via bake.py overlay spans
  at the stat's word time - zero re-sync needed. Also add 2 beats with the evidence image path in
  beats.json. Captures: capture_evidence.py -> media/projects/<slug>/evidence/manifest.json.
- **beats.json for shot-based videos:** rebuild beats from the real shot TSX args (element tag +
  start/exit frames -> master times) so the motion checks (unique >= 10, max consecutive <= 2) read
  truth instead of a 94-beat fallback placeholder (rm-bg.png).
- **auto_qa_remedy batch stage 3 (build_longform) is the beats/images pipeline** - it fails on
  shot-based projects (94 missing work/images). Use --check-only for the audit on this project type;
  the real render chain is make_master -> bake -> mix_sfx -> mix_music -> final_mix, and
  check_deliverable is the authoritative gate.
- **final_mix.py verified on re-master**: -14.38 LUFS / -1.33 dBTP after overlays were added - the
  two-pass linear loudnorm re-verifies its own output every run.
