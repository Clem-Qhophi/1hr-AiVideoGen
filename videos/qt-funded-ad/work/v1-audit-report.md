# QT Funded ad — v1 audit report

Subject: `videos/qt-funded-ad/output/qt-funded-ad-master.mp4` (9:16, 1080×1920, 30.0s) and its
16:9 / 1:1 / 15s / clean siblings, all in the same output folder. Audited 2026-08-08 by frame
extraction + direct inspection (not by trusting the render or `check_deliverable.py` alone).

## How v1 was actually produced (for the record)

This is a real Claude-Code-pipeline build, not an ad-hoc output: script gated with the client
(Gate A), a technical test reviewed before full production (Gate B), then a fully mastered file
(Gate C) — all logged in `client-approval-package.md` and cross-referenced in `EVOLUTION.md`
(ASR-aligned word timing, calibrated SFX transient levels, two-pass loudnorm convergence, a
per-format adaptation matrix). Real screenshots were captured live from `qtfunded.quanttekel.com`
via `capture_evidence.py` on 2026-08-08 (`media/projects/qt-funded-ad/evidence/manifest.json`) and
composited as backgrounds via `VibeEvidenceBg` in `remotion/src/shots/qt-funded-ad/*.tsx`.

## Technical facts (independently re-measured, not taken from the approval doc)

| Check | Master (9:16) | 16:9 | 1:1 | 15s cutdown |
|---|---|---|---|---|
| Resolution | 1080×1920 ✅ | 1920×1080 ✅ | 1080×1080 ✅ | 1080×1920 ✅ |
| Frame rate | 30fps ✅ | 30fps ✅ | 30fps ✅ | 30fps ✅ |
| Duration | 30.00s ✅ | 30.00s ✅ | 30.00s ✅ | 15.00s ✅ |
| Video codec | h264 ✅ | h264 ✅ | h264 ✅ | h264 ✅ |
| Audio | AAC 48kHz stereo, present ✅ | same ✅ | same ✅ | same ✅ |
| Loudness (re-measured) | −14.02 LUFS / −0.96 dBTP ✅ matches spec (−14.0/−1.0) | not re-checked | not re-checked | not re-checked |
| Clipping | max_volume −1.0dB, negligible 0dB-histogram hits ✅ clean | — | — | — |

**Verdict: technically the file is exactly what it claims to be.** No blank/frozen frames observed
in the sampled set, audio present and correctly mastered, all four formats correctly sized. This
part of Gate C's "17/17 PASS" claim holds up under independent re-check.

## THE finding: unapproved claims are baked into every background, not caught by any existing gate

This is the headline issue and it applies to **all formats and both the 30s and 15s cut** — every
one of them reuses the same six source screenshots.

The approved 30s/15s **scripts contain zero performance claims** — that discipline is real and it's
good work. But the "evidence" backgrounds behind the on-screen text are full, uncropped captures of
live marketing sections of qtfunded.quanttekel.com — not isolated product UI. Those sections
themselves are covered in exactly the numbers `client-approval-package.md` lists as "excluded from
v1, pending written approval." Concretely, as legible pixels in the shipped master:

- **Opening 3 seconds and closing CTA** (`hero.png`, used in `QTHook*` and `QTEndCard*` — i.e. the
  two beats that matter most for retention and recall): "UP TO 90% PROFIT SHARE," "...WITH UP TO
  $300K SIMULAT[ED]," "GET 55% OFF + FREE ACCOUNT HALF THE SIZE WITH CODE QT," and a Trustpilot
  rating snippet ("3.9 out of 5 based on 13,012 reviews"). All four are explicitly excluded claims.
- **"Structured evaluation" beat** (`features.png`, `QTStructure*`): "7% — THE LOWEST PROFIT TARGETS
  IN THE INDUSTRY" — a direct competitor comparison, which the approval doc bans outright regardless
  of approval status.
- **"DISCIPLINE." / testimonial beat** (`testimonials.png`, `QTDiscipline*`): a full Trustpilot
  review wall with real customer names and review text. Item 7 in the approval doc — "which
  Trustpilot profile is current for marketing?" — is still an **open, unanswered question**, yet a
  specific profile, rating, and review count is already burned into the shipped file.
- **"CONSISTENCY" beat** (`trust.png`, `QTConsistency*`): "TRUSTED BY 120,000 TRADERS," "$16M+ paid
  out to traders," "110+ countries served," plus a wall of real payout certificates with named
  individuals and dollar amounts (e.g. "Dhanesh P. — $1,075.20"). Payout certificates and
  trader/country counts are both explicitly listed as excluded, pending approval, in the same
  document.

None of this is in the VO or the foreground kinetic-text — a viewer would have to freeze-frame to
consciously read it. But it does not need to be consciously read to be a problem: it is legible at
normal viewing size (confirmed in this audit at 1x and native resolution), it is real captured
content from the client's own site, and if Quant Tekel's own legal/compliance reviewer freeze-frames
the ad — which a first-time client evaluating a new agency is likely to do — every claim their own
approval process was built to gate out is sitting there anyway, just one layer back.

**Why this passed `check_deliverable.py` at 17/17:** that gate checks technical delivery — LUFS,
true peak, caption coverage, motion-beat count, "≥3 real screenshots on screen." It counts
screenshots; it does not read what's inside them. There is currently no automated or manual step in
this pipeline that checks screenshot *content* against the claims register. This is a process gap,
not a one-off mistake — seven shot files across all four format variants independently made the same
choice (full-bleed marketing screenshot, dimmed 80-82%, no crop), because the shared `VibeEvidenceBg`
component only supports dimming, not cropping or masking (`remotion/src/lib/vibes.tsx:264-296` — its
own doc comment says "the whole point of an evidence beat is that you can SEE the proof," which is
right for the UI proof but wrong when the captured section also contains marketing copy).

## What works

- **Script discipline is genuinely good.** 62 words (30s) / cutdown script, zero performance claims,
  correct "simulated funded account, subject to the program rules" wording, matches what was
  actually approved at Gate A.
- **Production values are premium**, not generic: real ASR-aligned VO timing, calibrated SFX
  (17 cues measured audible on the 30s, 12 on the 15s), a felt-not-heard tech-pulse bed, brand-mint
  emphasis captions, consistent dark+mint palette throughout.
- **Full deliverable matrix actually exists** — 9:16/16:9/1:1 × captioned/clean × 30s/15s, all
  correctly sized and mastered. Nothing here needed a fresh render to fix.
- **The "Consistency Is the Edge" narrative concept is already the creative direction in use** — the
  hook ("Every trader has a plan… consistency is what moves you forward"), the discipline→consistency
  slam beats, and the "progress toward a simulated funded account" framing are effectively the same
  concept a from-scratch v2 would arrive at. This is not a case where the underlying creative idea is
  weak.

## What looks weak / generic

- The opening 3 seconds lean entirely on a kinetic-text hook over a dimmed stock-vault-and-chart
  render; there's no human presence until the "structured evaluation" beat. For a first-client ad
  that's supposed to feel "institutional but trader-community," an all-graphics open reads more
  generic-fintech-template than distinctive.
- The real photography used inside `features.png`'s own screenshot (a trader at a desk) is the
  client's own site photography, not anything shot or sourced for this ad — fine as evidence, but it
  means the video currently has no original visual identity beyond typography and the mint accent.
- Every evidence beat uses the same "dim + ambient glow over a screenshot" treatment; visually the
  four evidence beats (hero/features/testimonials/trust) are the least differentiated moments in an
  otherwise well-paced edit.

## What is technically broken

Nothing render-technical. The file plays, is correctly encoded, correctly mastered, and correctly
timed. The break is a content/compliance one (above), not a codec/timing one.

## What is unsupported or risky

Everything in `claims-register.md` rows #1–#9. In order of severity: the Trustpilot review wall with
real customer names (testimonials are a named, still-open approval item); the payout certificates
with real names and dollar figures; the "lowest profit targets in the industry" competitor
comparison (banned outright, not just pending); the 90%-profit-share vs 80%-profit-split
inconsistency between the hero marquee and QT Instant's own pricing table, which nobody has
reconciled; the promo code (codes expire — a "55% off" claim baked into a video with no expiry
control is a stale-claim risk even if approved today).

## What should be retained for v2

- The script and its zero-performance-claim discipline — do not rewrite what already passed Gate A.
- The SFX/caption/mastering pipeline and its measured levels — the audio-visual craft is not the
  problem.
- The core narrative ("every trader has a plan, consistency moves you forward, structured path to a
  simulated funded account") — it already matches the brief's own recommended "Consistency Is the
  Edge" concept. Re-inventing a different concept from scratch would be redundant work, not
  improvement.
- The per-format adaptation pattern (one composition per aspect, same SFX/animation cues) — it's a
  genuinely reusable system pattern, keep it.

## What should be removed / changed for v2

- **Every full-bleed marketing screenshot used as a beat background.** Replace with either: (a) a
  tightly cropped capture of just the product UI element being referenced (the evaluation table's
  structure, not the page it sits on), with promotional banners/marquees/testimonial walls masked
  out at capture time, or (b) an abstract financial-tech visual treatment (the brief's own fallback
  for when "official assets are unavailable" applies just as well when official assets are available
  but not approved for the claims baked into them).
  - This needs a system fix, not just an asset swap: `capture_evidence.py` should support a
    crop-to-selector-child or explicit pixel-crop option so a capture can isolate the pricing rows
    without the surrounding promo copy, and `VibeEvidenceBg` should support a `crop`/`focusRect` prop
    for shots that need to composite only part of a screenshot.
- Reconcile or drop the 90%-profit-share language entirely until Quant Tekel confirms which program
  (if any) actually offers it, given QT Instant's own table shows 80%.
- Do not reuse `hero.png` for both the opening AND closing beat once it's fixed — even cropped, using
  the identical background twice is a missed opportunity for visual variety across a 30s runtime.

## Recommendation

Building a second, differently-conceived "v2" from scratch (as literally requested) would largely
reproduce the same "Consistency Is the Edge" narrative already in v1 — that concept is sound and
already approved at the script level. The higher-value use of effort is: **fix the compliance leak
in the existing evidence backgrounds (the real defect), then produce a genuinely-improved v2 render
on the same script/audio pipeline with corrected, cropped, claims-clean evidence imagery** — rather
than a parallel concept that would need to pass through the same live-screenshot problem again. See
chat for the proposed path and the decision this needs from you before any more rendering happens.
