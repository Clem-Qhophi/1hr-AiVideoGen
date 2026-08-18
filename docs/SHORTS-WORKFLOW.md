# Shorts workflow — clip, loop, package, publish, redirect

Turn any finished long-form `videos/<slug>/output/<slug>-MASTER.mp4` into a YouTube Short in
five commands. Built 2026-08-09 (tools: `clip_shorts.py`, `yt_comment.py`).

## The one-liner chain

```
python tools/clip_shorts.py propose videos/ai-kill-switch --clips 4 --duration 30
python tools/clip_shorts.py clip videos/ai-kill-switch --start 0:17 --end 0:34 --name kill-switch-bill
python tools/clip_shorts.py verify shorts/kill-switch-bill
python tools/clip_shorts.py package shorts/kill-switch-bill --title "..."
python tools/yt_upload.py upload shorts/kill-switch-bill/packaging/publish.json --channel ai-news
```

then, after flipping the Short Public in Studio (uploads land private):

```
python tools/yt_comment.py post --slug kill-switch-bill --channel ai-news
python tools/track_performance.py tag kill-switch-bill --niche ai-news \
    --hook-type open-loop --evidence-type screenshots --title-lever question \
    --cross-linked-from ai-kill-switch
```

## What each command does

1. **`propose`** — scores the long-form's own word-timed narration (work/caption-plan.json, or
   edited-transcript.json) and returns the top N windows, marked for the loop strategy:
   - `cut BEFORE payoff: "…"` — the clip should end *before* the strongest sentence; the
     description link then resolves the tension ("the last number nobody is reporting").
   - `ends on an open question` — the question IS the loop.
   The picks are de-duplicated so a batch of 5 never feels like 5 versions of one moment:
   repeated opening words, repeated loop endings (max two of a kind), and windows from the same
   third of the video are rejected while the count can still be filled (rules relax on thin
   videos). Windows that open mid-sentence, on a continuation cue ("and", "so", "but"), or on a
   CTA ("subscribe…") are downweighted — a standalone Short must open like a fresh video, not
   like you walked in mid-story. Heuristic, not truth — eyeball the picked window's words.

2. **`clip`** — trims the MASTER, center-crops the 16:9 frame to 9:16 and upscales to
   1080x1920 (lanczos), re-encodes audio (the master is already a -14 LUFS mix — the clip
   inherits it, no loudness pass needed). Sentence-snaps the boundaries so the clip never cuts
   mid-word. **The loop is ALWAYS on** (`--no-loop` opts out): the window's payoff sentence is
   withheld so the clip ends just before it — or, when no payoff exists, exactly on the final
   word with no dead-air tail — so when the Short loops back to its start it reads as a
   continuation, and the "Full video" link is the close. The loop verdict + withheld payoff are
   recorded in clip.json; package dangles the payoff under the link. Captions:
   - the master's *burned* captions survive the horizontal crop — nothing to do (default).
   - if the spec says overlay captions (`style != burned`), `--captions auto` reburns a
     Short-sized (76px) ASS from the window's caption-plan words, time-shifted to the clip.
     Same rendering style as `gen_captions_ass.py` — the whole phrase is redrawn at each word
     onset (spoken words white, upcoming dim, stressed amber), so events abut instead of
     stacking fragments on top of each other.
   Extracts `-frame.jpg` at the midpoint — open it before uploading. A Short lives or dies in
   the first 1.5s; the frame is the cheapest honesty check. **`batch`** is the same pipeline
   run over every proposed window (see below). Speed: a 30s clip encodes in ~3-4s on QSV
   (measured 2026-08-09) — only the window is decoded and re-encoded (the 16:9→9:16 crop
   forces it), never the whole master, so a 5-clip batch is minutes of wall clock, not hours.

3. **`verify`** — the deliverable gate: vertical (h > w), 1080x1920, <= 180s, audio present.
   Exits non-zero otherwise. Run it before every upload; it is the Shorts counterpart of
   `check_deliverable.py`.

4. **`package`** — writes `shorts/<slug>/packaging/publish.json` + `description.txt` for
   `yt_upload.py`:
   - **description line 1 = the redirect link** (`Full video: https://youtu.be/…`, from the
     long-form's published.json) so it survives the collapsed Shorts description.
   - loop payoff dangled under the link when `--loop` was used.
   - tags: shorts, youtubeshorts (+ your extra `--tags`).
   - **cadence guard** (`warn_cadence`): warns if uploads already landed today — the standing
     rule is max ONE public flip per channel per day, so today's uploads must not all go
     public at once.

5. **`yt_upload.py upload`** — unchanged tool, same private-draft flow as long-form. It also
   records `shorts/<slug>/packaging/published.json` (videoId + watch_url) that the comment
   step and track_performance read.

6. **`yt_comment.py post`** — posts the redirect comment on the Short
   (`Full video: <long-form watch_url>`, auto-composed from clip.json + the source's
   published.json), writes `packaging/comment.json`, and prints where to pin it. **There is no
   API for pinning** — pinning is Studio/app-only; the tool posts the comment, you tap pin.
   The comments API also rejects private videos — flip Public first (hence the order above).
   Requires a one-time re-auth: `python tools/yt_comment.py auth --channel <niche>` (adds the
   `youtube.force-ssl` scope; upload tokens keep working).

7. **`track_performance.py tag`** — treats the Short as its own project
   (works from `shorts/`), inherits the niche from the source video's spec.json via clip.json,
   and supports `--cross-linked-from <longform-slug>` so the report can later show whether the
   Short actually moves traffic to the long-form.

## Standing rules that apply to Shorts (from CLAUDE.md, unchanged)

- **Honesty guard.** The clip is the long-form's own words — keep it that way. No claim in a
  Short that the long-form does not make; Shorts are where channels get demonetised.
- **Cadence.** The one-public-per-day rule covers LONG-FORM only (CLAUDE.md:111); Shorts are
  exempt — they live in the swipe feed, not the subscription feed. Default: spread a week's ~5
  Shorts roughly one per weekday, independent of the long-form release. Uploads land private;
  the flip in Studio is the paced step.
- **Covers.** The API cannot set Shorts covers — the YouTube mobile app can. Do it; a Short
  with a blank cover looks abandoned.
- **Track, don't vibe.** `track_performance.py report` now joins Shorts' stats too; a Short
  without a tag is a datum thrown away.

## Batch (biweekly ~5)

```
python tools/clip_shorts.py batch videos/<slug> --clips 5 --duration 30
```

Proposes the N best non-overlapping, de-duplicated windows (loop withholding ON), then clips
every pick in one run — each window gets the full single-window pipeline (sentence snap,
captions decision, contact frame, `shorts/<slug>/clip.json` manifest). The withheld payoff is
re-applied per window, so a snap can never drift a loop cut past its payoff boundary. Then
`verify`/`package`/`upload` each slug. Measured: ~3-4s of QSV encode per 30s clip, so all five
are one coffee. 30s is the default target — the Shorts completion-rate sweet spot; 45s+ still
works but completion drops.

## The upload → pin → comment chain (audited end to end)

- **`yt_upload.py upload`** validates the plan (title ≤ 100, tags, video exists, no < > |),
  previews it, uploads as a **private draft**, and records `shorts/<slug>/packaging/
  published.json` (videoId + watch_url + privacy) — the file every downstream step reads.
  Dry-run needs no token: `--dry-run` exits before any API call.
- **Flip Private → Public in Studio** (one click, once per channel per day). Until then the
  Short is invisible and the comments API rejects it — the order is upload, flip, comment.
- **`yt_comment.py post --slug <slug> --channel <niche>`** reads the Short's videoId and the
  long-form's watch_url and posts `Full video: <long-form url>` — the pinned comment is the
  highest-traffic redirect on a Short. It warns if the recorded privacy isn't public, and it
  refuses to run before the upload exists. **Pinning is manual** — the API has no pin endpoint:
  mobile app → comment → ⋯ → Pin (Studio works too).
- **Cover**: API can't set Shorts covers (it returns success and the cover stays blank) — set
  it in the YouTube mobile app from `-frame.jpg`.
- **Title**: the one human gate. ≤ 100 chars, the hook in the first words, and it must NOT
  promise anything the clip doesn't deliver (honesty guard — the clip is the long-form's own
  words, and so is the title).
- **Tag the format** (`track_performance.py tag … --cross-linked-from <source>`) so the report
  can later show whether Shorts actually move traffic to the long-form.
