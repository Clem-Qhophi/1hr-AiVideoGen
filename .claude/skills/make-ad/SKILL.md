---
name: make-ad
description: Agency-grade ad production — turn a product/site into a video ad that makes the viewer FEEL the problem, proves every claim with real evidence, and is built to be remembered. Use when the user wants "an ad", "a commercial", "promo video", or asks to advertise/sell a specific product/service/site for themselves or a client. Read-only recon, evidence-first, always scored against the checklist in this file before delivery. Not for a neutral review/walkthrough with no sell (that's /review-site) and not for topic-only videos with no product (/prompt-to-video).
---

# make-ad — the agency-grade ad Director

Turn a URL (or a described product) into a video **ad**: something built to make a stranger stop
scrolling, feel the problem it solves, and remember it. This is a distinct discipline from
`/review-site` — a review informs, an ad **sells**. Both stay evidence-first (no invented claims),
but an ad also has to hook in 3 seconds, hurt before it helps, and leave one sticky thing behind.

Built 2026-07-24 after a client-facing PropFunding ad shipped twice below bar: v1 was a silent
screenshot slideshow (rated 0.1/100), v2/v3 fixed the sound and voice but still used only ONE real
screenshot of the actual product and a tone that didn't match the fintech vertical. This skill
exists so those misses can't recur silently — see `EVOLUTION.md` → "ad-propfunding" entries for the
full post-mortems.

## The non-negotiable checklist (score every ad against this before calling it done)

1. **Hook lands in the first 3 seconds, and it's multimodal.** Visual pattern-interrupt + a
   benefit/curiosity text overlay + the spoken opening line, all doing work simultaneously — not
   just narration starting. Autoplay is silent on most platforms; the hook must work with sound
   OFF. Spend a disproportionate share of your creative effort here — a weak hook kills everything
   after it regardless of how good the rest is.
2. **Problem → Agitate → Solve, not Problem → Solve.** Naming the problem is not enough — AGITATE
   it: make the cost of the status quo specific, vivid, and a little uncomfortable before you
   relieve it. "You pay hundreds up front" is a fact. "You're down money before you've placed a
   single trade" is a felt cost. Prefer concrete, sensory, specific language over abstract claims —
   specificity is what makes a viewer feel it instead of just parsing it.
3. **Evidence density — multiple real captures of the ACTUAL product, not one screenshot reused.**
   Minimum: capture and use **4+ distinct real screenshots/shots of the subject itself** across the
   ad (not just at the proof beat) — hero, the offer/pricing surface, the product-in-use surface,
   and social proof, at minimum. A voice-over is not evidence. Big kinetic text is not evidence. If
   you only show the real thing once, the ad is under-evidenced — go capture more (`capture_evidence.py`,
   `--full-page` recon first to find the right scroll offsets, per EVOLUTION's capture lessons).
   Motion graphics and stat cards are seasoning on top of real evidence, not a replacement for it.
4. **One explicit differentiation beat.** State plainly what makes THIS specific thing different
   from the obvious alternative or the status quo — not implied, said. ("Most X do A. This one does
   B.") If you can't name the one-sentence USP, ask the client/user for it before scripting — don't
   invent one.
5. **One deliberately memorable moment.** A line built to be quoted, a visual twist, or a beat that
   breaks the pattern the rest of the ad set up. Decide what this is on purpose during scripting —
   don't leave stickiness to chance. Repetition of the core line (once at the hook, once at the CTA)
   is a cheap, reliable way to make it land.
6. **Tone matches the niche — pick the voice deliberately, every time.** See the table below.
   Never default to one house voice for every client/vertical.
   - **An ad is NOT a channel video: never reuse the channel's narrator voice** (the house GuyNeural/BrianNeural that reads the long-form channel videos) for a client's ad. Ads get their own vibrant voice from the table below, matched to the vertical and the beat energy. The softstep-slides ad (2026-08-10) shipped with the channel's warm-US narrator and the client owner scored it 6/10, partly for that reason.
   - **Region matters: a West-African client gets a West-African voice and accent.** A Ghanaian brand read in a US TV-anchor accent reads wrong to the audience it targets. edge-tts has no en-GH locale; the closest is **en-NG** (en-NG-EzinneNeural female, en-NG-AbimbolaNeural male) - pick live with edge_tts.list_voices(), say the region pick in the plan, and keep on-screen captions dialect-neutral where the VO isn't.
7. **Music + SFX, always.** No exceptions — see `EVOLUTION.md` / memory `ads-must-be-punchy-with-sfx`.
   A silent ad is not a draft, it's a failure.
8. **Every claim still traces to real evidence.** This skill inherits `/review-site`'s hard rule in
   full: no price, number, or claim on screen without a captured source. Selling harder does not
   mean the honesty bar drops — for regulated/financial/health verticals it's the opposite.
9. **Art direction must match the product — pick a VIBE, never the default backdrop.** A cold drink
   must FEEL cold, a car must feel fast and hot, a beauty product must feel soft. Every ad declares
   a vibe from `remotion/src/lib/vibes.tsx` (see the art-direction section below). Shipping an ad on
   the generic dark `RMBg` backdrop is a fail — that's the "template, not art direction" look that
   makes a client clock the work as generic.
10. **Vertical ads: respect the CTA-overlay safe zone.** On 9:16, the bottom ~20% is covered by the platform UI (IG/TikTok bottom bars, CTA buttons) and by the ad's own closing CTA chips. Decision-critical visuals (product hero, price card, colorway strip) must sit at middle or slightly below middle - never pinned to the absolute bottom edge. The softstep-slides ad (2026-08-10) pinned its colorway strip to the bottom edge and the CTA overlays covered it; the client owner (score 6/10) called it out directly. Reserve the very bottom margin for non-critical chrome (brand handle, tagline), and eyeball a mock with overlay bars drawn in before rendering.

## Art direction — the vibe system (`remotion/src/lib/vibes.tsx` + `atmosphere.tsx`)

Before this existed, every video rendered on ONE backdrop (dark navy gradient + dot grid) with only
the glow colour swapped, so a fintech ad and a beauty ad looked identical. Fixed 2026-07-24.

**Step 1 — declare the vibe.** `vibeFor("iced tea brand")` → `coldDrink`, or pick explicitly from:
`coldDrink · hotDrink · food · automotive · fitness · gaming · beauty · luxury · nature · fintech ·
techAI`. Each bundles palette + atmosphere + energy + a `voiceHint` (so the VO matches the look).
Note `beauty` is a **light** palette with dark text — the system is not "dark template with a
different glow", and you should use light palettes when the vertical calls for it.

**Step 2 — render it.** `<VibeBg vibe="coldDrink" />` as the first layer of the beat, content in a
sibling `<AbsoluteFill>` above it. Pull the vibe's own `text`/`muted`/`accent` for type colours so
the beat is internally consistent.

**Step 3 — tune to the CLIENT's real brand.** A vibe is a strong start, not a straitjacket. Pull the
client's actual brand colours off their real site screenshots and override `accent`/`glow` so the ad
looks like *their* brand wearing the right physics.

**Atmosphere layers** (`atmosphere.tsx`, all deterministic + frame-based): `Particles`
(up/down/drift — bubbles, embers, dust, snow), `Smoke` (steam/exhaust/fog), `LightRays`, `Bokeh`,
`Condensation` (the single best "this is ice cold" cue), `SpeedLines`, `LightSweep` (product-reveal
shine), `GlowWash`, `Vignette`, `Grain`. Compose them directly for beats that need something the
vibe preset doesn't cover.

**Product photos** (`remotion/src/lib/product.tsx`): `ProductHero` and `ProductSplit` give a client's
still photo cinematic treatment — push-in, floor glow, drop shadow, specular sweep, and atmosphere
*in front of* the product (the foreground pass is what creates real depth). A transparent PNG looks
dramatically better than a rectangular JPG — ask the client for one.

**HONEST LIMIT — read this before promising a client anything.** These are code-rendered 2D layers.
They can make a still photo feel filmed: lit, alive, surrounded by the right physics. They **cannot**
make a parked car actually drift, tyres actually burn, or liquid actually pour. Real motion of the
product itself needs (a) real footage the client supplies, (b) licensed stock footage, or (c) a
video-generation provider — a separate, paid track that is not wired into this pipeline. When an ad
concept depends on motion we cannot produce, say so during intake and either source footage or
change the concept. Never promise a shot the pipeline can't render.

## Perf note

Particle layers are cheap divs. `Smoke`, `Bokeh` and `LightRays` use CSS blur and cost real render
time — keep their counts low. Also: `tools/lint_pacing.py` cannot see atmosphere motion (it scans for
`interpolate(frame, …)`, and these layers animate with raw math), so it may report an atmospheric
beat as "static". That's a known linter blind spot, not a dead shot.

## Voice → niche mapping (edge-tts, free tier — verify tags live, don't rely on memory)

| Niche / vertical | Target feel | Voice | Speed |
|---|---|---|---|
| Fintech, trading, legal, enterprise, security | Authoritative, confident, trustworthy | `en-US-ChristopherNeural` ("Reliable, Authority") or `en-US-AndrewNeural` ("Warm, Confident, Authentic, Honest") | ~0.95-1.0x |
| Beauty, lifestyle, wellness, consumer/friendly | Warm, approachable | `en-US-BrianNeural` ("Approachable, Casual, Sincere") | ~1.0x |
| Entertainment, youth, gaming, high-energy | Lively | `en-US-RogerNeural` ("Lively") | ~1.05-1.1x |
| Never use for ad narration | — | `en-US-GuyNeural` — tagged "Passion", reads as announcer/hype copy regardless of script | — |

Run `edge_tts.list_voices()` before committing — the catalog and tags can change; this table is a
starting point, not gospel. When a client's vertical isn't listed, pick the closest personality tag
match and say why in the plan.

## Intake (ask once, in one small batch — this is a distinct set from /review-site's)

1. **The product/site** — URL(s), or a description if pre-launch.
2. **The client's own USP, if they have one.** Don't invent a differentiation claim — ask for it,
   or derive it honestly from what recon actually shows (a real pricing/feature gap vs. the
   category norm). If neither is available, say so and propose the strongest honest candidate.
3. **The vertical/niche** — drives the voice table above.
4. **The one thing that must be remembered** if the viewer forgets everything else — confirm this
   explicitly rather than assuming; it shapes which beat gets the "memorable moment" treatment.
5. **Length + platform** — 16:9 long-form vs vertical Shorts/Reels/TikTok changes hook pacing and
   safe zones; ask if not stated.
6. **Any regulatory/compliance constraints** (financial products, health claims, etc.) — ads for
   these verticals must avoid implied guarantees; state honest caveats plainly (see checklist #8).

## Pipeline (reuses the existing chain — does not reimplement it)

1. **Recon + evidence capture** — same discipline as `/review-site` §1: `capture_evidence.py`
   against the real site, `--full-page` first to find scroll offsets, drop anything that fails to
   render rather than fake it (JS-lazy charts, 404s — see EVOLUTION's capture lessons). Capture
   deliberately toward the evidence-density minimum in checklist #3, not just whatever's easiest.
2. **facts.json** — every claim you intend to use, each tied to a real evidence file + source URL.
3. **Script** — structure explicitly as Hook (3s, multimodal) → Problem → Agitate → Flip/Solve →
   How it works → Proof (the differentiation beat lives here or right after) → CTA (repeat the
   memorable line). Write it to be SPOKEN: contractions, flowing clauses, talk to the viewer — never
   announcer fragments (a rejected pattern, see `ads-must-be-punchy-with-sfx` memory). Run the
   niche → voice table before generating VO, not after.
4. **VO + real word timing** — `tools/tts_edge.py` (free) → `tools/align_asr.py` (AssemblyAI real
   timings; edge-tts's own word-boundary events are unreliable — expect 0 and don't be alarmed,
   the ASR pass is the real path now).
5. **Shots** — mix kinetic motion-graphic beats (big claims/numbers slamming on the word, via
   `usePop`/`useSlam`/`useDrift`/`FONT_HOOK` in `remotion/src/lib/reviewkit.tsx`) WITH real evidence
   beats (`EvidenceBrowser`/`EvidenceFrame`) — checklist #3 means real screenshots must appear
   throughout, not only at a single "proof" beat. Theme to the CLIENT's brand colors for this video,
   not the house brand (per-video art direction, same as any /review-site subject).
6. **SFX + music** — `tools/mix_sfx.py` with a cue on every reveal/slam, then `tools/mix_music.py`
   with a bed matched to the niche's energy. Non-optional (checklist #7).
7. **Verify by watching** — pull frames at every slam/highlight timestamp AND check audio levels
   (`ffmpeg -af volumedetect`). Stills alone hid the silent-ad and static-hold failures before —
   don't repeat that.
8. **Self-score against the 8-point checklist above before presenting it as done.** If any point is
   weak, fix it before delivery — don't ship an ad you can't defend point-by-point.

## What "agency-grade" means in practice

The user is building an ad agency on this pipeline — every ad from here on is a potential client
deliverable, not a personal experiment. When in doubt about a craft decision, ask: would a paying
client accept this? That bar, not "does the pipeline run," is what this skill is calibrated to.
