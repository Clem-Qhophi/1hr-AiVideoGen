# Edit plan — Messi vs Ronaldo: The Final Score

Shot library: remotion/src/shots/dataleague/ (chart-kit in src/lib/dataleague.tsx).
All 11 shots pre-built, registered (gen-registry: 474 shots), typechecked, still-verified,
full-rendered, and baked into the preview.

## Timeline (master, 345.3s — LIVELY VO, RESYNCED to real voiceover)

Clean VO: work/audio/voiceover.mp3 (Edge temp en-GB-RyanNeural @1.15, +10Hz, +3% — liveliness
contract; final Daniel pending ElevenLabs top-up — one re-sync pass budgeted if regenerated).
Word times from work/edited-transcript.json (789 words). Section boundaries are the REAL first-word
onsets, remapped word-by-word from the previous 385.9s clock:

| # | Beat | Master time | Shot id | Frames | Notes |
|---|------|-------------|---------|--------|-------|
| 1 | Cold open | 0:00-0:15.89 | DLColdOpen | 474 | Final score 5-4 slams in, "Two legends" lands at 15.89 on brand card |
| 2 | Rules | 15.89-36.00 | DLRules | 603 | 8 slots, R8 glows x2 at 28.56 (f380), belt on the line, data-as-of chip |
| 3 | R1 Record Book | 36.00-67.81 | DLR1Goals | 954 | RaceLine 976@41.27 / 919@57.79, score 1-0@62.29 |
| 4 | R2 Artist | 67.81-103.72 | DLR2Assists | 1077 | H2HMeter 418@77.10 / 261@80.52, gap 157@89.30, 1-1@98.68 |
| 5 | R3 Trophy Room | 103.72-130.13 | DLR3Ballon | 792 | Counters 8@110.52 / 5@117.42, 2-1@126.83 |
| 6 | R4 World Stage | 130.13-160.89 | DLR4WorldCup | 923 | MARQUEE. RaceLine 19@136.20 / 11@147.50, title row 1-0, 3-1@155.83 |
| 7 | R5 Money | 160.89-194.22 | DLR5Money | 1000 | Counters 2.1B@174.98 / 1.8B@178.56, ESTIMATE/Forbes, 3-2@190.54 |
| 8 | R6 Crowd | 194.22-232.32 | DLR6Crowd | 1143 | RaceLine 677M@203.10 / 515M@206.25, YT cards @218.91+222.10, 3-3@226.46 |
| 9 | R7 Efficiency | 232.32-263.32 | DLR7Ratio | 930 | H2HMeter 0.79@240.52 / 0.73@244.53, +0.06 callout, 4-3@256.33 |
| 10 | R8 Hat-Trick | 263.32-306.91 | DLR8Hattrick | 1308 | DOUBLE POINTS pulse@264.75, meter 66@285.42 / 61@288.39, belt@294.69, 5-4@299.43 |
| 11 | Verdict | 306.91-345.31 | DLVerdict | 1152 | Glory vs volume split, belt card@329.71, poll CTA@338.06, sign-off wordmark@343.45 |

## Sync status (DONE — 2026-08-17, second pass on lively VO)

- All 11 shots re-timed word-by-word against the 345.3s lively VO (speed 1.15 / +10Hz / +3%):
  nearest-word-index mapping from the old 789-word transcript to the new one; frame args,
  formula slots, durations, timeline boundaries, preview end and the 77 SFX cue times all
  re-anchored. Durations (15.8/20.1/31.8/35.9/26.4/30.77/33.33/38.1/31.0/43.6/38.4s) verified
  via gen:registry + stills + full renders.
- Scoreboard `start` = moment the verdict is spoken; CommentaryBar `start`/`exit` = the
  spoken line it pairs with; R8 DoublePulse/BeltReveal on their spoken beats.
- timeline.json uses the real section boundaries above (no overlap/gap: consecutive spans,
  end 345.31 = preview duration). Baked preview:
  output/messi-ronaldo-final-score-preview.mp4 (345.3s, 1920x1080@30, h264_qsv).
- 30+ verification stills pixel-checked (programmatic + user pass); boundary frames
  brightness-verified post-bake.

## Audio chain (SFX + bed + master)

- 77 SFX cues (58 core + 19 optional) mixed at the remapped times
  (tools/mix_sfx.py — sidechain duck disabled: this ffmpeg build's sidechaincompress
  attenuates its main path ~3dB regardless of input order; per-cue gains already sit under
  the voice). Measured: VO preserved, all hero cues audible.
- Bed: media/library/music/tech-pulse.mp3 at -7dB under the VO (mandatory music bed).
- Master: tools/final_mix.py two-pass linear loudnorm →
  output/messi-ronaldo-final-score-MASTER.mp4 (-14.38 LUFS, -1.33 dBTP, verified).

## Data integrity

- Every stat double-sourced in work/data-sheet.md (date-stamped 2026-07-20).
- On-air honesty: assists "sources differ by one, we're using 418"; earnings labelled ESTIMATE per Forbes.
- Final score: RONALDO 5 - 4 MESSI (R1, R5, R6, R8x2 vs R2, R3, R4, R7).
