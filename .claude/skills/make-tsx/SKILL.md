---
name: make-tsx
description: Step 2 of the AI Video Editor pipeline — build the visual beats (Remotion TSX shots) over a project's master cut and bake a composited preview. Use when the user wants to add/edit overlays or full-screen animation segments, "make a shot / beat", implement an edit plan or a v2 update, retime a beat to the narration, re-render shots, or re-bake the video-N preview in this repo. Covers reading the plan + edited-transcript + brand + reusable kit, authoring shots library-first, syncing reveals to word times, updating timeline.json (cutaway vs overlay), rendering, verifying by screenshot, and baking with tools/bake.py. Defers raw TSX authoring rules to vidtsx-2d-generator and the cut itself to clean-cut.
---

# make-tsx — build the visual beats over the master

Step 2 of the pipeline: take an approved master cut and its timing spine and produce the animated beats — UI/browser mockups, full-screen statements, diagrams, image reveals — then composite them over the master into a preview. Work **collaboratively and beat-by-beat**; the user gives notes per beat.

This is the project orchestration. For the low-level rules of writing a single crash-free Remotion file (frame-based only, monotonic `interpolate`, `Easing.bezier`, no `useState`/`useEffect`, import gotchas), use the **`vidtsx-2d-generator`** skill — shots here follow those rules.

## Inputs (read these first, every session)

- **`EVOLUTION.md`** (repo root) — the shared learning log. Read **Craft lessons by discipline →
  Visuals / TSX** before authoring, and **append what you learn there** when the pass is done, so every
  future video inherits it. (It carries the highlight-coordinate, render-stills-first, and font-timeout
  lessons that will otherwise cost you a re-render.)
- **The plan** — `videos/video-N/work/edit-plan.md` (or a change list like `v2-update-plan.md`). The source of truth for what to build. If there's a change list from a review, that overrides; apply it, don't re-litigate settled beats.
- **`videos/video-N/work/timeline.json`** — maps each shot → its span on the master + `type`. You edit this. (Schema below.)
- **`videos/video-N/work/edited-transcript.json`** — word-level times in master timeline (ms). **Everything syncs to these.**
- **`brand.md`** — colors/fonts/motion/delivery tokens. Every shot reads the brand so all videos feel like one channel.
- **`remotion/src/lib/kit.tsx`** (+ `lib/vscode.tsx`, `lib/browser.tsx`) — the reusable component library; `src/brand.ts`, `src/fonts.ts`; existing shots in `remotion/src/shots/video-N/`.

## Workflow

1. **Read** the plan + timeline + transcript + brand + kit. Pull the exact word times for each cue you must hit (grep `edited-transcript.json` for the phrase → start/end ms → local frame = `(cue_s − shot.master_in_s) × fps`).
2. **Wire evidence captures (MANDATORY before authoring any shot).** Check `media/projects/<slug>/evidence/manifest.json`. For every capture listed:
   - **Verify it's real content** — run `python tools/validate_captures.py videos/<slug>`. Blank/white captures (Cloudflare blocks, failed loads) must be detected here, not after rendering.
   - **Real captures** → wire into `EvidenceBrowser` (website screenshots) or `EvidenceFrame` (tweets, data, articles) components. Import from `../../lib/evidence`. Path is `projects/<slug>/evidence/<name>.png` (relative to `media/`).
   - **Blank captures** → still wire into `EvidenceFrame` with the source URL + label visible, PLUS a small disclosure line: "live capture blocked — source text verified directly." This is what Growth Rule #3 prescribes ("say so on screen rather than quietly substituting a card"). **Never silently replace a capture with a stat card** — a blank `EvidenceFrame` with a disclosure is more honest than a code-rendered card pretending to be evidence.
   - **No captures at all** → if the script makes factual claims, flag this as a blocker to the user before building. Evidence is not optional for generated videos.
   The evidence gate (`check_deliverable.py`) counts shots using `EvidenceFrame`/`EvidenceBrowser` — if you skip this step, the gate will fatal.
3. **Ask only what's genuinely open** at the start (a small batch), then build. Don't re-ask settled decisions.
4. **Library-first.** Reuse a kit component before writing UI from scratch. If you build something reusable (a window chrome, a browser frame, a card slot), put it in `lib/` so later shots and videos get it. Promote good patterns back into the library.
5. **Author / edit the shot** as a vidtsx-format `.tsx` in `remotion/src/shots/video-N/` (auto-registered by `scripts/gen-registry.mjs`). One shot per file. Follow the brand tokens and the principles below.
6. **Sync to the words** (see principles). Time each sub-element's entrance to its transcript cue; never show a thing before it's said or after the point has passed.
7. **Update `timeline.json`** — add/replace/retime the beat's span and `type`. Leave a clear note when a slot is a placeholder (e.g. a pending screen recording).
8. **Lint the pacing BEFORE rendering** — `python tools/lint_pacing.py videos/<slug>`. Rendering is the
   expensive step (minutes per shot), so catch coverage gaps, overlaps, static holds, a slow hook and
   dead air on the *plan* first. It reads timeline.json + edited-transcript.json + your shot TSX, and
   understands both discrete reveals and continuous motion (a ken-burns `interpolate(frame, [a,b])`
   counts as "alive"). **FAIL = a rule this repo states was broken — fix it.** **WARN = go look, then
   judge**: a long evidence hold usually wants a slow zoom, but a big statement card is *allowed to*
   hold while the line lands. Fix the TSX and re-lint — it's instant, no render needed.
9. **Render + VERIFY BY SCREENSHOT** (never skip): `cd remotion && node scripts/render-all.mjs --scale=1 <ShotIds>` (opaque → `out/<id>.mp4`, transparent overlays → `.mov`). Validate with a still first (`--still`); for word-synced reveals/scrolls, render the clip and pull a frame at **each cue** (`ffmpeg -ss <t> -i out/<id>.mp4 -frames:v 1 f.jpg`) — one 60% still is not enough.
10. **Bake the preview**: `python tools/bake.py` (reads timeline.json → `videos/video-N/output/video-N-preview.mp4`, 1080p30). `--end SECONDS` to bake a prefix while iterating.
11. **Spot-check composited frames** from the baked mp4 at the changed beats (the shot over the real master), not just the isolated shot.

## timeline.json (the compositing map)

```jsonc
{
  "master": "videos/video-1/reference/master.mp4", "master_fps": 60,
  "remotion_out": "remotion/out",
  "shots": [
    { "id": "CreditsStat", "type": "cutaway", "master_in_s": 170.0, "master_out_s": 179.0, "cue": "..." }
  ],
  "reframes": [
    { "in_s": 12.4, "out_s": 16.8, "scale": 1.18, "ease": "cut", "anchor": [0.5, 0.42] }
  ],
  "preview": { "end_s": 329.6, "out": "videos/video-1/output/video-1-preview.mp4", "width": 1920, "height": 1080, "fps": 30 }
}
```

- **`type: "cutaway"`** — the shot's `.mp4` REPLACES the master video for `[master_in_s, master_out_s]`. Master **audio always continues** underneath.
- **`type: "overlay"`** — a transparent shot (ProRes 4444 `.mov`, `transparent: true` in its compositionConfig) is composited OVER the master for that span. For small persistent CTAs/badges in the top/bottom band.
- `bake.py` splits `[0, end]` at every shot AND reframe boundary, renders each segment (cutaway from the shot, overlay = master+alpha, else master pass-through), concats, and muxes master audio 0..end. Frame-accurate; a shot's file must exist in `remotion/out/` first.

## `reframes` — punch-ins on the talking head

A punch-in scales and repositions **the master itself**. It is the cheapest energy in the edit and the
standard way to hide a jump cut: land a hard punch exactly on a cut join and the eye reads a camera
change instead of a splice. Cutaways cut *away* from the face; reframes keep the face and change the shot.

- **`ease: "cut"`** (default) — static crop for the whole span. Exact, free, no interpolation. **This is
  the jump-cut hider** — put its `in_s` on the cut join, not near it.
- **`ease: "push"`** — ramps `from` (default 1.0) → `scale` over `ramp_s` (default 0.7), then holds.
  For a line that builds. **`ease: "pull"`** ramps the other way, for releasing after a payoff.
- `scale` is clamped to 1.0–2.5; past ~1.35 on a 1080p master you will see softness (a 4K master has
  the pixels to spare — punching a 4K source to a 1080p preview is lossless up to 2.0).
- `anchor` `[x, y]` in 0..1 places the crop window; default `[0.5, 0.42]` sits slightly high because a
  centre-framed face lives above the geometric centre. Drop `y` toward 0.3 for a tight face punch.
- Reframes **may not overlap each other** (bake exits) and do nothing under a cutaway (bake warns —
  the shot has already replaced the master there). An overlay composites over the punched master
  *unzoomed*, so captions stay put and legible while the face moves.
- `python tools/bake.py <tl> --no-reframe` bakes the same timeline with every punch off. Bake both and
  compare when you are unsure a punch pattern is earning its keep.
- **Don't punch on every sentence.** The move works because it is occasional: reserve it for the line
  that matters, a cut join that would otherwise pop, and the section turn.

## Emphasis captions

**PICK THE PATH BY RUNTIME FIRST — this is the single most expensive mistake in the pipeline.**

| Video length | Tool | Cost |
|---|---|---|
| **<= ~3 min** | `gen_captions_emphasis.py` (Remotion alpha overlay) | fine at this length |
| **> ~3 min** | **`gen_captions_ass.py` (burned ASS)** | **1s to generate + one ~140s burn** |

Measured 2026-08-05 on a 14.3-min video: the overlay path cost **~50 MINUTES** and a 186 MB ProRes
4444 intermediate; `gen_captions_ass.py` produced the **identical** captions — same phrases, same
stressed words, same `caption-plan.json` — in **1 second** plus a 140s burn. ~21x. Both tools read
the same plan, so emphasis you tune carries over either way. `check_deliverable.py` hard-fails an
overlay on anything over 200s; **fix the render, never the spec.**

With burned captions the chain reorders to **bake → burn → SFX → music → `final_mix`**, and
`sfx-plan.json`'s `render.preview` must point at the **captioned** file — the SFX and music mixers
copy the video stream through untouched, so pointing it at the raw bake silently ships no captions.

### Short-form path

`python tools/gen_captions_emphasis.py videos/video-N [--vertical] [--wire]` — word-synced captions that
**stress the words carrying the point** (colour + scale pop on the word's own onset), written straight
to a Remotion overlay shot. It writes `work/caption-plan.json` first: **read it, flip the `m` flags you
disagree with, re-run with `--from-plan`.** The heuristics (keyterms, numbers, intensifiers, the word
before a pause, sentence landings, capped at ~16% of words) get most of it; the taste is yours.
Use `--emphasize "a,b"` / `--never "a,b"` to steer, `--wire` to add the overlay to timeline.json.
Do **not** use the older `tools/generate_captions.py` — it routes through the legacy `server/` templates.
- Design shots at 1920×1080; render-all `--scale=2` → 4K for final. Preview bakes 1080p30; final delivery is 4K60.

## Principles (the house style — apply them)

- **Sync to the words (P1).** Reveal sub-elements on their narration cue, timed from `edited-transcript.json`. "Show everything then hold" is a smell.
- **Don't pre-empt (P2).** Never put on screen a thing mentioned *later* (don't show "skill" before the skill is introduced; don't show example tiles before "more examples").
- **Real service info → real page (P3).** Facts about a service (limits, pricing) → a TSX clone of that service's actual web page (browser chrome + URL bar + scroll) with the exact line highlighted. Screenshot the real page first (Playwright / website-screenshot), then clone it.
- **Config/setup → real UI (P4).** Keys, dashboards, `.env`, skill folders → the actual VS Code / dashboard UI, not an abstract graphic.
- **Real results in the real editor (P5).** A generated result is shown opened inside the real editor (image in a pane next to the chat), not floating on a brand card.
- **Evidence-first visual design (P6).** When the script makes a factual claim, show the real screenshot (`EvidenceBrowser`/`EvidenceFrame`), not a code-rendered text card. Evidence hierarchy: real screenshot > real-UI TSX clone > animated card. **Never silently substitute a stat card for a failed capture** — a blank `EvidenceFrame` with an on-screen disclosure ("capture blocked — source verified directly") is more honest than a card that looks like proof but isn't. Growth Rule #3 requires ≥2 real screenshots on screen for generated videos; the evidence gate (`check_deliverable.py`) enforces this as fatal.
- **Full-screen vs overlay.** Concept beats = full-screen cutaways (cut away from the talking head). Overlays only for small persistent CTAs/badges in the top/bottom band; never cover the center-framed talking head.
- **Real UI realism.** UI clones match the real product (Claude Code = dark + coral, real logos), not the indigo brand. Brand indigo is for overlays/full-screen beats.
- **Recording vs TSX.** TSX when you want controlled highlight/scroll/zoom; a real screen recording only when the point is genuine PROOF (real output, real speed). Leave a clearly-noted placeholder slot for recordings the user will provide.
- On-screen text follows the brand voice — **no em-dashes** (the site copy avoids them; keep it out of overlays too).
- **Backdrops: VibeBg first, RMBg only when flat is the point.** For new channel beats, prefer
  `<VibeBg vibe={vibeFor(subject)} />` (from `lib/vibes.tsx`) over `RMBg`. VibeBg gives you the
  gradient + particles + glow + vignette + grain in one line, colour-graded to the subject. Use
  `RMBg` only when a deliberately flat, neutral look is the explicit choice (e.g. a simple text card
  that must not compete with surrounding evidence). Pick the vibe from the subject via `vibeFor()`,
  not by habit.
  **Know what it costs — the backdrop is a ~4x render decision.** Measured 2026-08-05, 300 frames at
  1080p: `RMBg` **12.1s** (it is a pre-baked PNG now, effectively free — same as a flat fill at 12.3s)
  vs `VibeBg` **~53s**, because its atmosphere layers genuinely animate and several are CSS-blurred,
  so none of it can be baked. That is the right price for an ad or a premium beat, where art
  direction IS the product. It is the wrong price for a **breaking-news video racing a clock** —
  there, `RMBg` is now the free option and the runtime saved is worth more than the texture.
  Do not try to "optimise" VibeBg by rendering its blurs at low resolution and scaling up: that was
  measured and does **nothing** in Remotion (54.7s vs 54.2s). See EVOLUTION.md round 3.

Those are the full principle set. When a video's plan calls for a revision pass, record what changed
and why in `videos/<project>/work/v2-update-plan.md` so the next pass inherits the reasoning.

## Tooling quick reference

- Register shots: `node remotion/scripts/gen-registry.mjs` (auto-runs discovery; needed after adding a file).
- Render: `node remotion/scripts/render-all.mjs [--still] [--frame=N|Ns] [--scale=1|2] <ShotIds...>`.
  **`--still --frame=` is how you check a cue cheaply** — repeatable (`--frame=130 --frame=142`), takes
  frames or seconds (`--frame=4.3s`), writes `out/<id>@f<n>.png`. No need to render the whole clip and
  pull frames with ffmpeg just to see whether a reveal lands.
- Captions — **choose by runtime** (see "Emphasis captions" above; the wrong choice costs ~50 min):
  - `> ~3 min`: `python tools/gen_captions_ass.py videos/<slug> --burn <baked.mp4> --out <cap.mp4>`
  - `<= ~3 min`: `python tools/gen_captions_emphasis.py videos/<slug> [--em-style box] [--from-plan] [--wire]`
- **Draft the edit: `python tools/plan_edit.py videos/<slug>`** — proposes punch-ins (join-aligned
  first, from `cuts.json`) and supporting-graphic moments from what was actually said. Writes
  `work/edit-plan-auto.md` to read and `work/edit-plan-auto.json` whose `reframes` array merges
  straight into timeline.json. Proposals, not decisions: start here, then cut what you disagree with.
- Bake: `python tools/bake.py [timeline.json] [--end S] [--keep] [--no-reframe]`.
- **Deliver: `python tools/final_mix.py <finished.mp4>`** — the loudness master (-14 LUFS / -1 dBTP,
  two-pass linear, video stream-copied, re-measured to prove it landed). This is the last step before
  upload and it is NOT optional: `mix_sfx`/`mix_music` are audition mixers and leave level to this.
- **Lint pacing (run before rendering): `python tools/lint_pacing.py videos/<slug> [--json]`** — exit 1 on FAIL.
- Scratch renders/frames go in the scratchpad, not the project.

Done = the changed beats render, you have **looked at** stills/frames at each cue, the preview is re-baked, and composited frames are spot-checked. Update the plan/timeline and any relevant memory when the pass is complete.
